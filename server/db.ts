import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'academia.db');
export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for reliability
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize optional Supabase Cloud Client (if configured in Render / .env)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function syncFromSupabase() {
  if (!supabase) return;
  try {
    console.log('[Academia] Connecting to Supabase Cloud Database...');
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    if (!pErr && Array.isArray(profiles) && profiles.length > 0) {
      const insertProfile = db.prepare(`
        INSERT OR REPLACE INTO profiles (id, roll_number, full_name, password_hash, course, global_target, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of profiles) {
        insertProfile.run(
          p.id,
          p.roll_number,
          p.full_name || 'Student',
          p.password_hash || '',
          p.course || 'Student',
          p.global_target || 75,
          p.created_at || new Date().toISOString(),
          p.updated_at || new Date().toISOString()
        );
      }
      console.log(`[Academia] Synced ${profiles.length} profiles from Supabase Cloud.`);
    }

    const { data: subjects, error: sErr } = await supabase.from('subjects').select('*');
    if (!sErr && Array.isArray(subjects) && subjects.length > 0) {
      const insertSubject = db.prepare(`
        INSERT OR REPLACE INTO subjects (id, user_id, name, code, attended, total, target, type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of subjects) {
        insertSubject.run(
          s.id,
          s.user_id,
          s.name,
          s.code || '',
          s.attended || 0,
          s.total || 0,
          s.target || null,
          s.type || 'theory',
          s.created_at || new Date().toISOString(),
          s.updated_at || new Date().toISOString()
        );
      }
      console.log(`[Academia] Synced ${subjects.length} subjects from Supabase Cloud.`);
    }
  } catch (err: any) {
    console.warn('[Academia] Supabase sync skipped:', err?.message);
  }
}

export async function syncProfileToSupabase(profile: any) {
  if (!supabase) return;
  try {
    await supabase.from('profiles').upsert({
      id: profile.id,
      roll_number: profile.roll_number,
      full_name: profile.full_name,
      password_hash: profile.password_hash,
      course: profile.course,
      global_target: profile.global_target,
      updated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('Supabase profile sync warning:', err?.message);
  }
}

export async function syncSubjectToSupabase(subject: any) {
  if (!supabase) return;
  try {
    await supabase.from('subjects').upsert({
      id: subject.id,
      user_id: subject.user_id,
      name: subject.name,
      code: subject.code,
      attended: subject.attended,
      total: subject.total,
      target: subject.target,
      type: subject.type,
      updated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('Supabase subject sync warning:', err?.message);
  }
}

export async function deleteSubjectFromSupabase(subjectId: string) {
  if (!supabase) return;
  try {
    await supabase.from('subjects').delete().eq('id', subjectId);
  } catch (err: any) {
    console.warn('Supabase subject delete warning:', err?.message);
  }
}

export async function deleteUserFromSupabase(userId: string) {
  if (!supabase) return;
  try {
    await supabase.from('attendance_logs').delete().eq('user_id', userId);
    await supabase.from('schedule').delete().eq('user_id', userId);
    await supabase.from('subjects').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
  } catch (err: any) {
    console.warn('Supabase user delete warning:', err?.message);
  }
}

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      roll_number TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      course TEXT DEFAULT 'Student',
      global_target INTEGER DEFAULT 75,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT,
      attended INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      target INTEGER,
      type TEXT DEFAULT 'theory',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      room TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      delta_attended INTEGER NOT NULL,
      delta_total INTEGER NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_user ON schedule(user_id);
    CREATE INDEX IF NOT EXISTS idx_logs_user ON attendance_logs(user_id);
  `);
}

export const DEFAULT_BCA_SYLLABUS = [
  { name: 'Computer organization', code: 'BCA-101', attended: 21, total: 24, target: 75, type: 'theory' },
  { name: 'Problem solving with java', code: 'BCA-102', attended: 24, total: 28, target: 75, type: 'theory' },
  { name: 'Basics of web development', code: 'BCA-103', attended: 22, total: 25, target: 75, type: 'theory' },
  { name: 'Computational mathematics', code: 'BCA-104', attended: 17, total: 24, target: 75, type: 'theory' },
  { name: 'IITOA', code: 'BCA-105', attended: 20, total: 22, target: 75, type: 'theory' },
  { name: 'EVS', code: 'BCA-106', attended: 16, total: 18, target: 75, type: 'theory' },
  { name: 'English', code: 'BCA-107', attended: 19, total: 21, target: 75, type: 'theory' },
  { name: 'English lab', code: 'BCA-108L', attended: 10, total: 12, target: 75, type: 'lab' },
  { name: 'Java Lab', code: 'BCA-109L', attended: 12, total: 14, target: 75, type: 'lab' },
  { name: 'WEb dev Lab', code: 'BCA-110L', attended: 11, total: 13, target: 75, type: 'lab' }
];

export const DEFAULT_BCA_SCHEDULE = [
  { day: 'Mon', subjectName: 'Computer organization', time: '09:00 AM - 10:00 AM', room: 'LH-1' },
  { day: 'Mon', subjectName: 'Problem solving with java', time: '10:00 AM - 11:00 AM', room: 'LH-1' },
  { day: 'Mon', subjectName: 'Java Lab', time: '11:30 AM - 01:30 PM', room: 'Java Lab' },
  { day: 'Tue', subjectName: 'Basics of web development', time: '09:30 AM - 10:30 AM', room: 'LH-2' },
  { day: 'Tue', subjectName: 'WEb dev Lab', time: '11:00 AM - 01:00 PM', room: 'Web Lab' },
  { day: 'Wed', subjectName: 'Computational mathematics', time: '10:00 AM - 11:00 AM', room: 'LH-3' },
  { day: 'Wed', subjectName: 'IITOA', time: '11:30 AM - 12:30 PM', room: 'LH-3' },
  { day: 'Thu', subjectName: 'EVS', time: '09:00 AM - 10:00 AM', room: 'LH-1' },
  { day: 'Thu', subjectName: 'English', time: '10:00 AM - 11:00 AM', room: 'LH-1' },
  { day: 'Thu', subjectName: 'English lab', time: '11:30 AM - 01:00 PM', room: 'Lang Lab' },
  { day: 'Fri', subjectName: 'Problem solving with java', time: '09:30 AM - 10:30 AM', room: 'LH-2' },
  { day: 'Fri', subjectName: 'Computational mathematics', time: '10:30 AM - 11:30 AM', room: 'LH-2' }
];

export function seedDefaultSyllabusForUser(userId: string) {
  const now = new Date().toISOString();
  const subjectMap = new Map<string, string>();

  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, user_id, name, code, attended, total, target, type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of DEFAULT_BCA_SYLLABUS) {
    const subjId = crypto.randomUUID();
    subjectMap.set(s.name.toLowerCase(), subjId);
    insertSubject.run(subjId, userId, s.name, s.code, s.attended, s.total, s.target, s.type, now, now);
  }

  const insertSchedule = db.prepare(`
    INSERT INTO schedule (id, user_id, subject_id, day, time, room, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const sch of DEFAULT_BCA_SCHEDULE) {
    const subjId = subjectMap.get(sch.subjectName.toLowerCase());
    if (subjId) {
      insertSchedule.run(crypto.randomUUID(), userId, subjId, sch.day, sch.time, sch.room, now);
    }
  }
}
