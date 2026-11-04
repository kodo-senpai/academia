import { useState, useEffect, useCallback } from 'react';
import { UserProfile, Subject, ScheduleSlot } from './types';
import { api, getStoredToken } from './services/api';
import { PencilLoader } from './components/PencilLoader';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { ExamEligibilityBanner } from './components/ExamEligibilityBanner';
import { DashboardView } from './components/DashboardView';
import { BunkManagerView } from './components/BunkManagerView';
import { PredictorView } from './components/PredictorView';
import { TimetableView } from './components/TimetableView';
import { GuideView } from './components/GuideView';
import { SettingsView } from './components/SettingsView';
import { SubjectModal } from './components/SubjectModal';
import { ScheduleModal } from './components/ScheduleModal';
import { MedicalLeaveModal } from './components/MedicalLeaveModal';
import { AttendanceLogsModal } from './components/AttendanceLogsModal';
import { Toast } from './components/Toast';
import { IsometricInput } from './components/IsometricInput';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loaderVisible, setLoaderVisible] = useState<boolean>(true);
  const [loaderMsg, setLoaderMsg] = useState<string>('Loading attendance registers & safe bunk matrices...');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [medicalModalOpen, setMedicalModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  const triggerPencilRefresh = (msg = 'Syncing registers with database...', duration = 650) => {
    setLoaderMsg(msg);
    setLoaderVisible(true);
    setTimeout(() => setLoaderVisible(false), duration);
  };

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      const [subjRes, schedRes] = await Promise.all([
        api.getSubjects(),
        api.getSchedule(),
      ]);
      setSubjects(subjRes.subjects || []);
      setSchedule(schedRes.schedule || []);
    } catch (err: any) {
      console.error('Failed to load user data:', err);
    }
  }, []);

  // Check auth session on startup
  useEffect(() => {
    // Theme preference check
    const storedTheme = localStorage.getItem('academia_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = storedTheme !== null ? storedTheme === 'dark' : prefersDark;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    const token = getStoredToken();
    if (token) {
      api
        .getMe()
        .then((res) => {
          setUser(res.user);
          return loadUserData();
        })
        .catch(() => {
          api.logout();
          setUser(null);
        })
        .finally(() => {
          setTimeout(() => setLoaderVisible(false), 500);
        });
    } else {
      setTimeout(() => setLoaderVisible(false), 400);
    }
  }, [loadUserData]);

  const handleToggleTheme = (isDark: boolean) => {
    setDarkMode(isDark);
    localStorage.setItem('academia_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    showToast(isDark ? 'Night Mode Active 🌙' : 'Day Mode Active ☀️');
  };

  const handleLoginSuccess = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    triggerPencilRefresh('Loading your personal registers...', 600);
    await loadUserData();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setSubjects([]);
    setSchedule([]);
    showToast('Logged out of logbook.');
  };

  // Subject actions
  const handleSaveSubject = async (data: {
    id?: string;
    name: string;
    code?: string;
    attended: number;
    total: number;
    target?: number | null;
    type: 'theory' | 'lab';
  }) => {
    if (data.id) {
      const res = await api.updateSubject(data.id, data);
      setSubjects((prev) => prev.map((s) => (s.id === data.id ? res.subject : s)));
      showToast(`Updated "${res.subject.name}"`);
    } else {
      const res = await api.createSubject(data);
      setSubjects((prev) => [...prev, res.subject]);
      showToast(`Created "${res.subject.name}"`);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    const target = subjects.find((s) => s.id === id);
    if (!window.confirm(`Are you sure you want to delete "${target?.name || 'this subject'}"?`)) {
      return;
    }
    await api.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setSchedule((prev) => prev.filter((slot) => slot.subjectId !== id));
    showToast('Subject removed.');
  };

  const handleAdjustAttendance = async (id: string, delta: number) => {
    try {
      const res = await api.adjustSubject(id, delta);
      setSubjects((prev) => prev.map((s) => (s.id === id ? res.subject : s)));
    } catch (err: any) {
      showToast('Adjustment failed: ' + err.message);
    }
  };

  const handleQuickMark = async (subjectId: string, attended: boolean) => {
    try {
      const res = await api.quickMark(subjectId, attended);
      setSubjects((prev) => prev.map((s) => (s.id === subjectId ? res.subject : s)));
      showToast(attended ? `Marked attended: ${res.subject.name}` : `Marked bunked: ${res.subject.name}`);
    } catch (err: any) {
      showToast('Marking failed: ' + err.message);
    }
  };

  const handleApplyMedicalLeave = async (subjectId: string, count: number, note?: string) => {
    try {
      const res = await api.applyMedicalLeave(subjectId, count, note);
      setSubjects((prev) => prev.map((s) => (s.id === subjectId ? res.subject : s)));
      showToast(`Applied ${count} sanctioned waiver hours!`);
    } catch (err: any) {
      showToast('Waiver failed: ' + err.message);
    }
  };

  // Schedule actions
  const handleSaveScheduleSlot = async (slotData: {
    subjectId: string;
    day: string;
    time: string;
    room?: string;
  }) => {
    await api.addScheduleSlot(slotData);
    await loadUserData();
    showToast('Routine lecture added.');
  };

  const handleDeleteScheduleSlot = async (slotId: string) => {
    await api.deleteScheduleSlot(slotId);
    setSchedule((prev) => prev.filter((s) => s.id !== slotId));
    showToast('Timetable slot deleted.');
  };

  return (
    <div className="bg-[#F8F5EE] dark:bg-[#0B0F17] text-[#231F1C] dark:text-gray-100 min-h-screen flex flex-col justify-between transition-colors duration-300">
      {/* Animated Pencil Loader */}
      <PencilLoader visible={loaderVisible} message={loaderMsg} />

      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Auth Screen Overlay if not logged in */}
      {!user ? (
        <AuthScreen
          onSuccess={handleLoginSuccess}
          onShowToast={showToast}
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <div className="flex-1 flex flex-col w-full">
          {/* Header & Navigation with BB-8 toggle */}
          <Navbar
            activeTab={activeTab}
            onNavigate={setActiveTab}
            user={user}
            darkMode={darkMode}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
            onOpenLogs={() => setLogsModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
            {/* 3D Isometric Search & Filter Bar */}
            <div className="w-full">
              <IsometricInput
                label="SUBJECT SEARCH & FILTER"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered subjects by title or code..."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 14z"></path>
                  </svg>
                }
                onButtonClick={() => triggerPencilRefresh('Refreshing subject registry...', 450)}
              />
            </div>

            {/* Exam Clearance Status Banner */}
            <ExamEligibilityBanner
              subjects={subjects}
              globalTarget={user.global_target || 75}
              onNavigateToBunks={() => setActiveTab('bunk-manager')}
              onOpenMedicalModal={() => setMedicalModalOpen(true)}
            />

            {/* View Switching */}
            {activeTab === 'dashboard' && (
              <DashboardView
                user={user}
                subjects={subjects}
                searchQuery={searchQuery}
                onEditSubject={(s) => {
                  setEditingSubject(s);
                  setSubjectModalOpen(true);
                }}
                onDeleteSubject={handleDeleteSubject}
                onAdjustAttendance={handleAdjustAttendance}
                onOpenAddModal={() => {
                  setEditingSubject(null);
                  setSubjectModalOpen(true);
                }}
                onNavigateToSettings={() => setActiveTab('analytics')}
              />
            )}

            {activeTab === 'bunk-manager' && (
              <BunkManagerView
                subjects={subjects}
                globalTarget={user.global_target || 75}
                searchQuery={searchQuery}
                onQuickMark={handleQuickMark}
              />
            )}

            {activeTab === 'calculator' && (
              <PredictorView subjects={subjects} globalTarget={user.global_target || 75} />
            )}

            {activeTab === 'timetable' && (
              <TimetableView
                subjects={subjects}
                schedule={schedule}
                globalTarget={user.global_target || 75}
                onQuickMark={handleQuickMark}
                onDeleteSlot={handleDeleteScheduleSlot}
                onOpenAddSlotModal={() => setScheduleModalOpen(true)}
              />
            )}

            {activeTab === 'guide' && <GuideView />}

            {activeTab === 'analytics' && (
              <SettingsView
                user={user}
                onUpdateTarget={(newTgt) =>
                  setUser((prev) => (prev ? { ...prev, global_target: newTgt } : prev))
                }
                onUpdateCourse={(newCourse) =>
                  setUser((prev) => (prev ? { ...prev, course: newCourse } : prev))
                }
                onResetSyllabus={loadUserData}
                onLogout={handleLogout}
                onShowToast={showToast}
                onDataImported={loadUserData}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t-2 border-black/10 dark:border-gray-800 bg-white/60 dark:bg-darkBg-card py-4 px-4 text-center text-xs text-beige-600 dark:text-gray-400 mt-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="font-display font-bold text-beige-900 dark:text-white">
                Academia Bunk OS &bull; Student Edition
              </p>
              <p className="font-medium">
                Production multi-user architecture &mdash; per-student isolated database with secure authentication.
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => {
          setSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        subjects={subjects}
        onSave={handleSaveScheduleSlot}
      />

      <MedicalLeaveModal
        isOpen={medicalModalOpen}
        onClose={() => setMedicalModalOpen(false)}
        subjects={subjects}
        onApply={handleApplyMedicalLeave}
      />

      <AttendanceLogsModal
        isOpen={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
      />
    </div>
  );
}
