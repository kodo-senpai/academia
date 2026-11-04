# Academia — BCA AI-DS Attendance & Bunk OS (Production Multi-User)

A full-stack, production-ready attendance management system and "Can I Bunk?" calculator engineered for BCA AI-DS students. Converted from a single-file prototype into an enterprise-grade multi-user web application with per-student data isolation, authentication, relational database storage, and audit logs.

---

## 🚀 Key Architectural Highlights

1. **True Multi-User Data Isolation**:
   - Every student signs up with their unique **Roll Number**, **Full Name**, and **Password**.
   - Every database query strictly filters by `user_id = req.user.id`. Students can never view, mutate, or access other students' records.
   - Default BCA AI-DS syllabus and routine schedule can be seeded upon account creation or via the Settings reset feature.

2. **Backend & Relational Database (Built-in + Supabase Ready)**:
   - **Built-in Node.js / Express Engine**: Uses high-performance relational SQLite (`node:sqlite` in WAL mode) with tables for `profiles`, `subjects`, `schedule`, and `attendance_logs`.
   - **Password Security**: Passwords hashed using bcrypt with salt rounds.
   - **Session Management**: Cryptographically signed JSON Web Tokens (JWT) with 30-day expiry.
   - **Supabase PostgreSQL Schema & RLS Included**: Full SQL migration (`supabase/schema.sql`) and strict Row Level Security policies (`supabase/rls-policies.sql`) are provided ready-to-run.

3. **Complete Feature Set Preserved**:
   - 🛡️ **Dashboard Cockpit**: Real-time stats (Overall Attendance Rate, Safe Bunks Left, Classes Needed, Lectures Held), progress bars, and module cards with +/- adjustments.
   - ⚡ **"Can I Bunk Today?" Matrix**: Exact formula calculating clearance, Safe Buffers, Danger Zones, and one-tap "+ Present" / "+ Bunk" class marking.
   - 🔮 **What-If Predictor**: Interactive sliders to simulate the impact of upcoming classes attended or bunked before making fest/leave plans.
   - 📅 **Day Timetable & Fast Logger**: Day-by-day lecture routine (Mon–Fri) with one-tap class punching.
   - 🏥 **Medical / OD Duty Waiver**: Adds sanctioned faculty-approved leaves directly to both attended & held counts without score penalties.
   - 📜 **Attendance Audit Log**: Historical logbook tracking all punches with timestamps.
   - 🎨 **Neo-Brutalist & Isometric 3D Visual Identity**: Exact Star Wars BB-8 day/night physics toggle, 3D isometric inputs with hover perspectives, and pencil loader animation.

---

## 🧮 Exact Business Logic Formulas

```javascript
// 1. Safe Bunks (when current % >= target):
safeBunks = Math.floor((attended * 100 - target * total) / target)

// 2. Must Attend Classes (when current % < target):
mustAttend = Math.ceil((target * total - 100 * attended) / (100 - target))
```

*Default minimum target is 75%, customizable by each student in Settings (40%–100%).*

---

## 🗄️ Database Tables Architecture

| Table | Description | Key Columns |
|---|---|---|
| `profiles` | Student accounts & settings | `id`, `roll_number` (unique), `full_name`, `password_hash`, `course`, `global_target` |
| `subjects` | Registered course modules | `id`, `user_id`, `name`, `code`, `attended`, `total`, `target`, `type` ('theory'/'lab') |
| `schedule` | Weekly timetable slots | `id`, `user_id`, `subject_id`, `day`, `time`, `room` |
| `attendance_logs` | Audit trail of class punches | `id`, `user_id`, `subject_id`, `date`, `status` ('present'/'bunk'/'medical'/'od'), `delta_attended`, `delta_total`, `note` |

---

## 🔑 Demo Account Credentials

For instant testing with preloaded BCA AI-DS Semester syllabus:
- **Roll Number / Student ID**: `115652`
- **Password**: `priyanshu01`

*(Or click **Register** to create any new student account with your own roll number and custom syllabus!)*

---

## ⚙️ Running the Application

### 1. Installation
```bash
npm install
```

### 2. Development Mode
Starts the full-stack server with Vite middleware on port 3000:
```bash
npm run dev
```

### 3. Production Build & Local Start
```bash
npm run build
npm start
```

---

## 🌐 1-Click Deployment on Render

When setting up your Web Service on [Render](https://render.com):
1. **Environment**: `Node`
2. **Build Command**: `npm install --legacy-peer-deps && npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_random_secret_string`

---

## ☁️ How to Set Up a Supabase Project (Optional Alternative)

If you prefer deploying the database to Supabase:

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/schema.sql` from this repository and run the script to create tables, indexes, and triggers.
4. Open `supabase/rls-policies.sql` and run the script to enable Row Level Security and configure user-isolation policies.
5. In `.env`, configure:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Bcrypt with salt rounds (no plain-text storage).
- **Per-Student Isolation**: All SQL operations enforce `WHERE user_id = ?`.
- **Foreign Key Cascading**: Deleting a student or subject cascades cleanly to schedules and logs.
- **XSS & Injection Protection**: Parameterized SQL queries prevent SQL injection.
- **State Integrity**: `attended <= total` and `total >= 0` bounds strictly enforced.
