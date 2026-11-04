export interface UserProfile {
  id: string;
  roll_number: string;
  full_name: string;
  course: string;
  global_target: number;
}

export interface Subject {
  id: string;
  user_id?: string;
  name: string;
  code?: string;
  attended: number;
  total: number;
  target?: number | null;
  type: 'theory' | 'lab';
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleSlot {
  id: string;
  user_id?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  time: string;
  room?: string;
  created_at?: string;
}

export interface AttendanceLog {
  id: string;
  date: string;
  status: 'present' | 'bunk' | 'medical' | 'od';
  delta_attended: number;
  delta_total: number;
  note?: string;
  subjectName?: string;
  subjectCode?: string;
  created_at: string;
}

export interface SubjectStats {
  pct: number;
  target: number;
  safeBunks: number;
  mustAttend: number;
  isSafe: boolean;
}
