import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, initDatabase, seedDefaultSyllabusForUser } from './server/db.js';
import { requireAuth, generateToken, AuthenticatedRequest } from './server/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register new student account
app.post('/api/auth/register', (req, res) => {
  try {
    const { roll_number, full_name, password, course, load_default_syllabus } = req.body;

    const trimmedRoll = (roll_number || '').trim();
    const trimmedName = (full_name || '').trim();
    const trimmedPass = (password || '').trim();
    const studentCourse = (course || 'BCA AI-DS').trim();

    if (!trimmedRoll || trimmedRoll.length < 2) {
      res.status(400).json({ error: 'Please enter a valid Roll Number or Student ID.' });
      return;
    }

    if (!trimmedName || trimmedName.length < 2) {
      res.status(400).json({ error: 'Please enter your Full Name.' });
      return;
    }

    if (!trimmedPass || trimmedPass.length < 4) {
      res.status(400).json({ error: 'Password must be at least 4 characters long.' });
      return;
    }

    // Check if roll number already exists
    const existing = db.prepare('SELECT id FROM profiles WHERE roll_number = ?').get(trimmedRoll);
    if (existing) {
      res.status(400).json({ error: `Roll Number '${trimmedRoll}' is already registered. Please sign in instead.` });
      return;
    }

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(trimmedPass, salt);

    db.prepare(`
      INSERT INTO profiles (id, roll_number, full_name, password_hash, course, global_target, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 75, ?, ?)
    `).run(userId, trimmedRoll, trimmedName, hash, studentCourse, now, now);

    // Optionally seed default syllabus
    if (load_default_syllabus !== false) {
      seedDefaultSyllabusForUser(userId);
    }

    const user = {
      id: userId,
      roll_number: trimmedRoll,
      full_name: trimmedName,
      course: studentCourse,
      global_target: 75,
    };

    const token = generateToken(user);
    res.status(201).json({ token, user, message: 'Account successfully created!' });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. ' + (error?.message || 'Server error') });
  }
});

// Login with Roll Number + Password
app.post('/api/auth/login', (req, res) => {
  try {
    const { roll_number, password } = req.body;
    const trimmedRoll = (roll_number || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedRoll || !trimmedPass) {
      res.status(400).json({ error: 'Please provide both Roll Number and Password.' });
      return;
    }

    const userRow = db.prepare(`
      SELECT id, roll_number, full_name, password_hash, course, global_target 
      FROM profiles 
      WHERE roll_number = ?
    `).get(trimmedRoll) as any;

    if (!userRow) {
      res.status(401).json({ error: 'Invalid Roll Number or Password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(trimmedPass, userRow.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid Roll Number or Password.' });
      return;
    }

    const user = {
      id: userRow.id,
      roll_number: userRow.roll_number,
      full_name: userRow.full_name,
      course: userRow.course,
      global_target: userRow.global_target || 75,
    };

    const token = generateToken(user);
    res.json({ token, user, message: 'Login successful!' });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. ' + (error?.message || 'Server error') });
  }
});

// Get current profile
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// Update Profile & Global Target
app.put('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { global_target, full_name, course } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (global_target !== undefined) {
      const targetVal = Math.min(100, Math.max(40, parseInt(global_target) || 75));
      updates.push('global_target = ?');
      params.push(targetVal);
    }
    if (full_name) {
      updates.push('full_name = ?');
      params.push(full_name.trim());
    }
    if (course) {
      updates.push('course = ?');
      params.push(course.trim());
    }

    if (updates.length === 0) {
      res.json({ user: req.user });
      return;
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(userId);

    db.prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedUser = db.prepare('SELECT id, roll_number, full_name, course, global_target FROM profiles WHERE id = ?').get(userId);
    res.json({ user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
});

// ==========================================
// SUBJECTS ROUTES (PER-USER ISOLATED)
// ==========================================

// Get all subjects for logged-in student
app.get('/api/subjects', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const subjects = db.prepare(`
      SELECT id, name, code, attended, total, target, type, created_at, updated_at
      FROM subjects
      WHERE user_id = ?
      ORDER BY created_at ASC
    `).all(userId);

    res.json({ subjects });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve subjects: ' + error.message });
  }
});

// Add new subject
app.post('/api/subjects', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, code, attended, total, target, type } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Subject title is required.' });
      return;
    }

    const subjId = crypto.randomUUID();
    const now = new Date().toISOString();
    const att = Math.max(0, parseInt(attended) || 0);
    const tot = Math.max(att, parseInt(total) || 0);
    const tgt = target ? parseInt(target) : null;
    const subType = type === 'lab' ? 'lab' : 'theory';

    db.prepare(`
      INSERT INTO subjects (id, user_id, name, code, attended, total, target, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(subjId, userId, name.trim(), (code || '').trim(), att, tot, tgt, subType, now, now);

    const created = db.prepare('SELECT * FROM subjects WHERE id = ?').get(subjId);
    res.status(201).json({ subject: created });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create subject: ' + error.message });
  }
});

// Update subject details
app.put('/api/subjects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, code, attended, total, target, type } = req.body;

    const existing = db.prepare('SELECT id FROM subjects WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      res.status(404).json({ error: 'Subject not found.' });
      return;
    }

    const now = new Date().toISOString();
    const att = Math.max(0, parseInt(attended) || 0);
    const tot = Math.max(att, parseInt(total) || 0);
    const tgt = target !== undefined && target !== '' ? parseInt(target) : null;
    const subType = type === 'lab' ? 'lab' : 'theory';

    db.prepare(`
      UPDATE subjects
      SET name = ?, code = ?, attended = ?, total = ?, target = ?, type = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(name.trim(), (code || '').trim(), att, tot, tgt, subType, now, id, userId);

    const updated = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
    res.json({ subject: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update subject: ' + error.message });
  }
});

// Quick incremental adjust (+1 or -1 attended count)
app.post('/api/subjects/:id/adjust', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { delta } = req.body; // e.g. 1 or -1

    const subj = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!subj) {
      res.status(404).json({ error: 'Subject not found.' });
      return;
    }

    let newAttended = Math.max(0, Number(subj.attended) + Number(delta));
    let newTotal = Number(subj.total);
    if (delta > 0 && newAttended > newTotal) {
      newTotal = newAttended;
    }
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE subjects SET attended = ?, total = ?, updated_at = ? WHERE id = ? AND user_id = ?
    `).run(newAttended, newTotal, now, id, userId);

    const updated = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
    res.json({ subject: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to adjust attendance: ' + error.message });
  }
});

// Quick Mark: Present or Bunk (and record to attendance_logs)
app.post('/api/subjects/:id/quick-mark', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { attended } = req.body; // boolean: true = present, false = bunk

    const subj = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!subj) {
      res.status(404).json({ error: 'Subject not found.' });
      return;
    }

    const isPresent = Boolean(attended);
    const newTotal = Number(subj.total) + 1;
    const newAttended = isPresent ? Number(subj.attended) + 1 : Number(subj.attended);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE subjects SET attended = ?, total = ?, updated_at = ? WHERE id = ? AND user_id = ?
    `).run(newAttended, newTotal, now, id, userId);

    // Record in attendance_logs
    const logId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO attendance_logs (id, user_id, subject_id, date, status, delta_attended, delta_total, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      userId,
      id,
      now.slice(0, 10),
      isPresent ? 'present' : 'bunk',
      isPresent ? 1 : 0,
      1,
      isPresent ? 'Marked Present in lecture' : 'Bunked class',
      now
    );

    const updated = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
    res.json({ subject: updated, logId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log class: ' + error.message });
  }
});

// Medical / OD Duty Waiver (adds approved hours to both attended and total)
app.post('/api/subjects/:id/medical-leave', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { count, note } = req.body;

    const approvedCount = Math.max(1, parseInt(count) || 1);
    const subj = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!subj) {
      res.status(404).json({ error: 'Subject not found.' });
      return;
    }

    const newAttended = Number(subj.attended) + approvedCount;
    const newTotal = Number(subj.total) + approvedCount;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE subjects SET attended = ?, total = ?, updated_at = ? WHERE id = ? AND user_id = ?
    `).run(newAttended, newTotal, now, id, userId);

    const logId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO attendance_logs (id, user_id, subject_id, date, status, delta_attended, delta_total, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      userId,
      id,
      now.slice(0, 10),
      'medical',
      approvedCount,
      approvedCount,
      note || `Approved waiver for ${approvedCount} lecture(s)`,
      now
    );

    const updated = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
    res.json({ subject: updated, logId, message: `Applied ${approvedCount} approved leave hours.` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to apply medical waiver: ' + error.message });
  }
});

// Delete subject
app.delete('/api/subjects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?').run(id, userId);
    res.json({ success: true, message: 'Subject removed.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete subject: ' + error.message });
  }
});

// ==========================================
// SCHEDULE / TIMETABLE ROUTES
// ==========================================

// Get weekly timetable
app.get('/api/schedule', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const schedule = db.prepare(`
      SELECT s.id, s.subject_id as subjectId, s.day, s.time, s.room, s.created_at,
             sub.name as subjectName, sub.code as subjectCode
      FROM schedule s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.user_id = ?
      ORDER BY s.day ASC, s.time ASC
    `).all(userId);

    res.json({ schedule });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch schedule: ' + error.message });
  }
});

// Add timetable slot
app.post('/api/schedule', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { subjectId, day, time, room } = req.body;

    if (!subjectId || !day || !time) {
      res.status(400).json({ error: 'Subject, day, and time are required.' });
      return;
    }

    const slotId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO schedule (id, user_id, subject_id, day, time, room, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(slotId, userId, subjectId, day, time.trim(), (room || '').trim(), now);

    res.status(201).json({ slotId, message: 'Lecture slot added.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add schedule slot: ' + error.message });
  }
});

// Delete timetable slot
app.delete('/api/schedule/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    db.prepare('DELETE FROM schedule WHERE id = ? AND user_id = ?').run(id, userId);
    res.json({ success: true, message: 'Time slot deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete schedule slot: ' + error.message });
  }
});

// ==========================================
// ATTENDANCE LOGS
// ==========================================

app.get('/api/logs', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const logs = db.prepare(`
      SELECT l.id, l.date, l.status, l.delta_attended, l.delta_total, l.note, l.created_at,
             sub.name as subjectName, sub.code as subjectCode
      FROM attendance_logs l
      LEFT JOIN subjects sub ON l.subject_id = sub.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
      LIMIT 100
    `).all(userId);

    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve attendance logs: ' + error.message });
  }
});

// ==========================================
// SETTINGS, BACKUP, EXPORT & RESET
// ==========================================

// Reset or load default BCA AI-DS syllabus for this student
app.post('/api/reset-syllabus', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Delete existing subjects and timetable for this user
    db.prepare('DELETE FROM subjects WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM schedule WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM attendance_logs WHERE user_id = ?').run(userId);

    seedDefaultSyllabusForUser(userId);
    res.json({ success: true, message: 'Syllabus reset to default BCA AI-DS curriculum!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset syllabus: ' + error.message });
  }
});

// Export all user data as JSON
app.get('/api/export', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const profile = db.prepare('SELECT roll_number, full_name, course, global_target FROM profiles WHERE id = ?').get(userId);
    const subjects = db.prepare('SELECT name, code, attended, total, target, type FROM subjects WHERE user_id = ?').all(userId);
    const schedule = db.prepare(`
      SELECT s.day, s.time, s.room, sub.name as subjectName
      FROM schedule s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.user_id = ?
    `).all(userId);

    res.json({
      exportedAt: new Date().toISOString(),
      profile,
      subjects,
      schedule,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Export failed: ' + error.message });
  }
});

// Import user data from JSON
app.post('/api/import', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { subjects, schedule, globalTarget } = req.body;

    if (!Array.isArray(subjects)) {
      res.status(400).json({ error: 'Invalid backup format: subjects array missing.' });
      return;
    }

    // Clear old records
    db.prepare('DELETE FROM subjects WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM schedule WHERE user_id = ?').run(userId);

    const now = new Date().toISOString();
    const subjectMap = new Map<string, string>();

    const insertSubject = db.prepare(`
      INSERT INTO subjects (id, user_id, name, code, attended, total, target, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of subjects) {
      if (s.name) {
        const sid = crypto.randomUUID();
        subjectMap.set(s.name.toLowerCase(), sid);
        insertSubject.run(
          sid,
          userId,
          s.name,
          s.code || '',
          parseInt(s.attended) || 0,
          parseInt(s.total) || 0,
          s.target ? parseInt(s.target) : null,
          s.type === 'lab' ? 'lab' : 'theory',
          now,
          now
        );
      }
    }

    if (Array.isArray(schedule)) {
      const insertSchedule = db.prepare(`
        INSERT INTO schedule (id, user_id, subject_id, day, time, room, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const slot of schedule) {
        const sid = slot.subjectId || (slot.subjectName ? subjectMap.get(slot.subjectName.toLowerCase()) : null);
        if (sid) {
          insertSchedule.run(
            crypto.randomUUID(),
            userId,
            sid,
            slot.day || 'Mon',
            slot.time || '10:00 AM',
            slot.room || '',
            now
          );
        }
      }
    }

    if (globalTarget) {
      db.prepare('UPDATE profiles SET global_target = ? WHERE id = ?').run(parseInt(globalTarget) || 75, userId);
    }

    res.json({ success: true, message: 'Data imported successfully!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Import failed: ' + error.message });
  }
});

// ==========================================
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// ==========================================

async function startServer() {
  // Catch-all 404 for unmatched API routes
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Academia OS] Server running at http://localhost:${PORT}`);
  });
}

startServer();
