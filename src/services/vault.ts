import { UserProfile, Subject, ScheduleSlot, AttendanceLog } from '../types';

export interface StudentVault {
  id?: string;
  roll_number: string;
  full_name: string;
  course: string;
  global_target: number;
  vault_hash?: string;
  subjects: Subject[];
  schedule: ScheduleSlot[];
  logs?: AttendanceLog[];
  last_updated: string;
}

const VAULT_PREFIX = 'academia_vault_';
const ACTIVE_ROLL_KEY = 'academia_active_roll';

export function getStudentVault(rollNumber: string): StudentVault | null {
  if (!rollNumber) return null;
  const key = `${VAULT_PREFIX}${rollNumber.trim().toUpperCase()}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StudentVault;
  } catch (e) {
    console.error('Failed to read student vault for', rollNumber, e);
    return null;
  }
}

export function saveStudentVault(data: Partial<StudentVault> & { roll_number: string }): StudentVault {
  const roll = data.roll_number.trim().toUpperCase();
  const existing = getStudentVault(roll);

  const merged: StudentVault = {
    id: data.id || existing?.id,
    roll_number: roll,
    full_name: data.full_name || existing?.full_name || 'Student',
    course: data.course || existing?.course || 'Student',
    global_target: data.global_target !== undefined ? data.global_target : (existing?.global_target ?? 75),
    vault_hash: data.vault_hash || existing?.vault_hash,
    subjects: data.subjects || existing?.subjects || [],
    schedule: data.schedule || existing?.schedule || [],
    logs: data.logs || existing?.logs || [],
    last_updated: new Date().toISOString(),
  };

  const key = `${VAULT_PREFIX}${roll}`;
  try {
    localStorage.setItem(key, JSON.stringify(merged));
    localStorage.setItem(ACTIVE_ROLL_KEY, roll);
  } catch (e) {
    console.error('Failed to persist student vault to localStorage', e);
  }

  return merged;
}

export function getActiveRoll(): string | null {
  return localStorage.getItem(ACTIVE_ROLL_KEY);
}

export function setActiveRoll(rollNumber: string | null) {
  if (rollNumber) {
    localStorage.setItem(ACTIVE_ROLL_KEY, rollNumber.trim().toUpperCase());
  } else {
    localStorage.removeItem(ACTIVE_ROLL_KEY);
  }
}

export function getActiveVault(): StudentVault | null {
  const activeRoll = getActiveRoll();
  if (!activeRoll) return null;
  return getStudentVault(activeRoll);
}

export function updateVaultSubjects(rollNumber: string, subjects: Subject[]) {
  if (!rollNumber) return;
  const existing = getStudentVault(rollNumber);
  if (existing) {
    existing.subjects = subjects;
    existing.last_updated = new Date().toISOString();
    try {
      localStorage.setItem(`${VAULT_PREFIX}${rollNumber.trim().toUpperCase()}`, JSON.stringify(existing));
    } catch {}
  }
}

export function updateVaultSchedule(rollNumber: string, schedule: ScheduleSlot[]) {
  if (!rollNumber) return;
  const existing = getStudentVault(rollNumber);
  if (existing) {
    existing.schedule = schedule;
    existing.last_updated = new Date().toISOString();
    try {
      localStorage.setItem(`${VAULT_PREFIX}${rollNumber.trim().toUpperCase()}`, JSON.stringify(existing));
    } catch {}
  }
}

export function updateVaultProfile(rollNumber: string, profile: Partial<UserProfile>) {
  if (!rollNumber) return;
  const existing = getStudentVault(rollNumber);
  if (existing) {
    if (profile.full_name) existing.full_name = profile.full_name;
    if (profile.course) existing.course = profile.course;
    if (profile.global_target !== undefined) existing.global_target = profile.global_target;
    existing.last_updated = new Date().toISOString();
    try {
      localStorage.setItem(`${VAULT_PREFIX}${rollNumber.trim().toUpperCase()}`, JSON.stringify(existing));
    } catch {}
  }
}

export function deleteStudentVault(rollNumber: string) {
  if (!rollNumber) return;
  const roll = rollNumber.trim().toUpperCase();
  localStorage.removeItem(`${VAULT_PREFIX}${roll}`);
  if (getActiveRoll() === roll) {
    localStorage.removeItem(ACTIVE_ROLL_KEY);
  }
}
