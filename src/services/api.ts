import { UserProfile, Subject, ScheduleSlot, AttendanceLog } from '../types';
import {
  saveStudentVault,
  getStudentVault,
  getActiveVault,
  updateVaultSubjects,
  updateVaultSchedule,
  updateVaultProfile,
  deleteStudentVault,
  setActiveRoll,
  StudentVault,
} from './vault';

const TOKEN_KEY = 'academia_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = new Error(data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.code = data.code;
    error.roll_number = data.roll_number;
    throw error;
  }

  return data as T;
}

export const api = {
  // Authentication
  async register(data: {
    roll_number: string;
    full_name: string;
    password: string;
    course?: string;
    load_default_syllabus?: boolean;
  }): Promise<{ token: string; user: UserProfile; message: string }> {
    const res = await request<{ token: string; user: UserProfile; vault_hash?: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    saveStudentVault({
      id: res.user.id,
      roll_number: res.user.roll_number,
      full_name: res.user.full_name,
      course: res.user.course,
      global_target: res.user.global_target,
      vault_hash: res.vault_hash,
      subjects: [],
      schedule: [],
    });
    return res;
  },

  async login(data: {
    roll_number: string;
    password: string;
  }): Promise<{ token: string; user: UserProfile; message: string }> {
    try {
      const res = await request<{ token: string; user: UserProfile; vault_hash?: string; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setStoredToken(res.token);
      saveStudentVault({
        id: res.user.id,
        roll_number: res.user.roll_number,
        full_name: res.user.full_name,
        course: res.user.course,
        global_target: res.user.global_target,
        vault_hash: res.vault_hash,
      });
      return res;
    } catch (err: any) {
      // If server cold-started (e.g. Render/Cloud Run spin down), check if we have a local vault on this device
      const vault = getStudentVault(data.roll_number);
      if (vault) {
        try {
          const rehydrated = await api.rehydrate({
            roll_number: data.roll_number,
            password: data.password,
            vault,
          });
          return rehydrated;
        } catch {
          throw err;
        }
      }
      throw err;
    }
  },

  // Auto-restore student session and registers across cold container boots
  async rehydrate(data: {
    roll_number: string;
    password?: string;
    vault: StudentVault;
  }): Promise<{ token: string; user: UserProfile; message: string }> {
    const res = await request<{ token: string; user: UserProfile; vault_hash?: string; message: string }>('/api/auth/rehydrate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    saveStudentVault({
      id: res.user.id,
      roll_number: res.user.roll_number,
      full_name: res.user.full_name,
      course: res.user.course,
      global_target: res.user.global_target,
      vault_hash: res.vault_hash,
      subjects: data.vault.subjects,
      schedule: data.vault.schedule,
    });
    return res;
  },

  logout() {
    setStoredToken(null);
    setActiveRoll(null);
  },

  async getMe(): Promise<{ user: UserProfile }> {
    try {
      return await request<{ user: UserProfile }>('/api/auth/me');
    } catch (err: any) {
      // If server rebooted, auto-rehydrate session transparently from active vault
      const activeVault = getActiveVault();
      if (activeVault) {
        try {
          const rehydrated = await api.rehydrate({
            roll_number: activeVault.roll_number,
            vault: activeVault,
          });
          return { user: rehydrated.user };
        } catch {
          throw err;
        }
      }
      throw err;
    }
  },

  async updateProfile(data: {
    global_target?: number;
    full_name?: string;
    course?: string;
  }): Promise<{ user: UserProfile }> {
    const res = await request<{ user: UserProfile }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const active = getActiveVault();
    if (active) {
      updateVaultProfile(active.roll_number, data);
    }
    return res;
  },

  // Subjects
  async getSubjects(): Promise<{ subjects: Subject[] }> {
    const res = await request<{ subjects: Subject[] }>('/api/subjects');
    const active = getActiveVault();
    if (active && res.subjects) {
      updateVaultSubjects(active.roll_number, res.subjects);
    }
    return res;
  },

  async createSubject(data: {
    name: string;
    code?: string;
    attended: number;
    total: number;
    target?: number | null;
    type?: 'theory' | 'lab';
  }): Promise<{ subject: Subject }> {
    return request<{ subject: Subject }>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSubject(
    id: string,
    data: {
      name: string;
      code?: string;
      attended: number;
      total: number;
      target?: number | null;
      type?: 'theory' | 'lab';
    }
  ): Promise<{ subject: Subject }> {
    return request<{ subject: Subject }>(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adjustSubject(id: string, delta: number): Promise<{ subject: Subject }> {
    return request<{ subject: Subject }>(`/api/subjects/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ delta }),
    });
  },

  async quickMark(id: string, attended: boolean): Promise<{ subject: Subject; logId: string }> {
    return request<{ subject: Subject; logId: string }>(`/api/subjects/${id}/quick-mark`, {
      method: 'POST',
      body: JSON.stringify({ attended }),
    });
  },

  async applyMedicalLeave(id: string, count: number, note?: string): Promise<{ subject: Subject; message: string }> {
    return request<{ subject: Subject; message: string }>(`/api/subjects/${id}/medical-leave`, {
      method: 'POST',
      body: JSON.stringify({ count, note }),
    });
  },

  async deleteSubject(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  },

  // Schedule / Timetable
  async getSchedule(): Promise<{ schedule: ScheduleSlot[] }> {
    const res = await request<{ schedule: ScheduleSlot[] }>('/api/schedule');
    const active = getActiveVault();
    if (active && res.schedule) {
      updateVaultSchedule(active.roll_number, res.schedule);
    }
    return res;
  },

  async addScheduleSlot(data: {
    subjectId: string;
    day: string;
    time: string;
    room?: string;
  }): Promise<{ slotId: string; message: string }> {
    return request<{ slotId: string; message: string }>('/api/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteScheduleSlot(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/schedule/${id}`, {
      method: 'DELETE',
    });
  },

  // Logs
  async getLogs(): Promise<{ logs: AttendanceLog[] }> {
    return request<{ logs: AttendanceLog[] }>('/api/logs');
  },

  // Settings, Reset & Account Management
  async resetSyllabus(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/reset-syllabus', {
      method: 'POST',
    });
  },

  async clearUserData(): Promise<{ success: boolean; message: string }> {
    const res = await request<{ success: boolean; message: string }>('/api/user/data', {
      method: 'DELETE',
    });
    const active = getActiveVault();
    if (active) {
      updateVaultSubjects(active.roll_number, []);
      updateVaultSchedule(active.roll_number, []);
    }
    return res;
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const active = getActiveVault();
    const res = await request<{ success: boolean; message: string }>('/api/user/account', {
      method: 'DELETE',
    });
    setStoredToken(null);
    if (active) {
      deleteStudentVault(active.roll_number);
    }
    return res;
  },

  async exportData(): Promise<any> {
    return request<any>('/api/export');
  },

  async importData(data: any): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
