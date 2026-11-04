import { UserProfile, Subject, ScheduleSlot, AttendanceLog } from '../types';

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
    throw new Error(data.error || `Request failed with status ${response.status}`);
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
    const res = await request<{ token: string; user: UserProfile; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(data: {
    roll_number: string;
    password: string;
  }): Promise<{ token: string; user: UserProfile; message: string }> {
    const res = await request<{ token: string; user: UserProfile; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  logout() {
    setStoredToken(null);
  },

  async getMe(): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>('/api/auth/me');
  },

  async updateProfile(data: {
    global_target?: number;
    full_name?: string;
    course?: string;
  }): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Subjects
  async getSubjects(): Promise<{ subjects: Subject[] }> {
    return request<{ subjects: Subject[] }>('/api/subjects');
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
    return request<{ schedule: ScheduleSlot[] }>('/api/schedule');
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

  // Settings & Reset
  async resetSyllabus(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/reset-syllabus', {
      method: 'POST',
    });
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
