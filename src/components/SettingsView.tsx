import React, { useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateTarget: (newTarget: number) => void;
  onUpdateCourse: (newCourse: string) => void;
  onResetSyllabus: () => void;
  onClearUserData: () => void;
  onDeleteAccount: () => void;
  onRegisterNewAccount: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
  onDataImported: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateTarget,
  onUpdateCourse,
  onResetSyllabus,
  onClearUserData,
  onDeleteAccount,
  onRegisterNewAccount,
  onLogout,
  onShowToast,
  onDataImported,
}) => {
  const [targetInput, setTargetInput] = useState<number>(user.global_target || 75);
  const [courseInput, setCourseInput] = useState<string>(user.course || '');
  const [savingSettings, setSavingSettings] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Danger Zone Modals State
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const [wipingData, setWipingData] = useState(false);
  const [showConfirmDeleteAccount, setShowConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmRollInput, setConfirmRollInput] = useState('');

  const handleSaveSettings = async () => {
    if (targetInput < 40 || targetInput > 100) {
      onShowToast('Target must be between 40% and 100%');
      return;
    }

    setSavingSettings(true);
    try {
      await api.updateProfile({
        global_target: targetInput,
        course: courseInput.trim() || 'General',
      });
      onUpdateTarget(targetInput);
      onUpdateCourse(courseInput.trim() || 'General');
      onShowToast(`Updated course to "${courseInput.trim() || 'General'}" & target to ${targetInput}%`);
    } catch (err: any) {
      onShowToast('Failed to update settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.exportData();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `Academia_Backup_${user.roll_number}_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast('Exported JSON backup successfully.');
    } catch (err: any) {
      onShowToast('Export failed: ' + err.message);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!parsed || !parsed.subjects) {
          throw new Error('Invalid backup file: subjects missing');
        }
        await api.importData(parsed);
        onDataImported();
        onShowToast('Data imported successfully into your account!');
      } catch (err: any) {
        onShowToast('Import error: ' + (err.message || 'Invalid format'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteReset = async () => {
    setResetting(true);
    try {
      await api.resetSyllabus();
      setShowConfirmReset(false);
      onResetSyllabus();
      onShowToast('Sample syllabus template loaded into your account.');
    } catch (err: any) {
      onShowToast('Reset failed: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleExecuteWipeData = async () => {
    setWipingData(true);
    try {
      const res = await api.clearUserData();
      setShowConfirmWipe(false);
      onClearUserData();
      onShowToast(res.message || 'All attendance records have been wiped clean.');
    } catch (err: any) {
      onShowToast('Wipe data failed: ' + err.message);
    } finally {
      setWipingData(false);
    }
  };

  const handleExecuteDeleteAccount = async () => {
    if (confirmRollInput.trim() !== user.roll_number.trim()) {
      onShowToast('Roll number does not match. Deletion aborted.');
      return;
    }

    setDeletingAccount(true);
    try {
      await api.deleteAccount();
      setShowConfirmDeleteAccount(false);
      onDeleteAccount();
    } catch (err: any) {
      onShowToast('Failed to delete account: ' + err.message);
      setDeletingAccount(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-b-2 border-black/10 dark:border-gray-800 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGold-dark dark:text-accentGold">
          Settings & Preferences
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-beige-900 dark:text-white">
          Configuration & Account
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Course & Target Minimum % */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accentGold text-black flex items-center justify-center font-bold text-base border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Course & Attendance Goal
            </h3>
            <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
              Customize your degree program and target attendance bar.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
                  My Course / Degree Name
                </label>
                <input
                  type="text"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="e.g. B.Tech CSE, BCA, BBA, B.Com, MBA..."
                  className="w-full bg-beige-50 dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-sm text-beige-900 dark:text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
                  Target Attendance % (College Rule)
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={targetInput}
                  onChange={(e) => setTargetInput(parseInt(e.target.value) || 75)}
                  className="w-full bg-beige-50 dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-sm text-beige-900 dark:text-white font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="w-full py-2.5 text-xs font-extrabold bg-beige-900 dark:bg-accentGold text-white dark:text-black rounded-xl border-2 border-black shadow-brutal-sm hover:opacity-90 active:translate-y-0.5 mt-2"
          >
            {savingSettings ? 'Saving...' : 'Save Course & Target Goal'}
          </button>
        </div>

        {/* Backup & Transfer */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-olive text-white flex items-center justify-center font-bold text-base border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Backup & Transfer
            </h3>
            <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
              Export records to JSON to transfer between devices or backup your history.
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={handleExport}
                className="flex-1 py-2 text-xs font-extrabold border-2 border-black bg-white dark:bg-darkBg-muted text-black dark:text-white rounded-xl shadow-brutal-sm hover:bg-beige-100 dark:hover:bg-gray-800"
              >
                Export JSON
              </button>
              <label className="flex-1 py-2 text-xs font-extrabold border-2 border-black bg-white dark:bg-darkBg-muted text-black dark:text-white rounded-xl shadow-brutal-sm hover:bg-beige-100 dark:hover:bg-gray-800 text-center cursor-pointer">
                Import JSON
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={handleImportFile}
                />
              </label>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-1.5 text-xs text-accentGold-dark dark:text-accentGold hover:underline text-center block font-bold"
          >
            Load Sample Syllabus Template
          </button>
        </div>

        {/* Active Student Profile */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center font-bold text-base border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-id-card"></i>
            </div>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Student Profile
            </h3>
            <div className="text-xs space-y-2 text-beige-700 dark:text-gray-300 font-medium">
              <p>
                Student Roll / ID: <b className="font-mono text-black dark:text-accentGold">{user.roll_number}</b>
              </p>
              <p>
                Full Name: <b>{user.full_name}</b>
              </p>
              <p>
                Enrolled Course: <b className="text-black dark:text-white">{user.course || 'General'}</b>
              </p>
              <p>
                Database Status: <b className="text-olive">Per-Student Isolated Cloud DB</b>
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <button
              onClick={onLogout}
              className="w-full py-2.5 text-xs font-extrabold bg-beige-100 dark:bg-darkBg-muted text-beige-900 dark:text-white rounded-xl border-2 border-black shadow-brutal-sm hover:bg-beige-200 dark:hover:bg-gray-800 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-arrow-right-from-bracket mr-1.5"></i> Sign Out
            </button>
            <button
              onClick={onRegisterNewAccount}
              className="w-full py-2 text-xs font-extrabold bg-accentGold text-black rounded-xl border-2 border-black shadow-brutal-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-user-plus mr-1.5"></i> Register / Switch Account
            </button>
          </div>
        </div>
      </div>

      {/* DANGER ZONE: Reset Data & Delete Account */}
      <div className="bg-red-50 dark:bg-red-950/20 border-3 border-red-500/80 rounded-2xl p-5 sm:p-6 shadow-brutal space-y-4">
        <div className="flex items-center gap-3 border-b-2 border-red-200 dark:border-red-900/50 pb-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm border-2 border-black shadow-brutal-sm">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-red-900 dark:text-red-300 tracking-tight">
              Danger Zone &amp; Student Data Management
            </h3>
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">
              Manage your saved attendance records or permanently delete your account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Card 1: Wipe All Attendance Data */}
          <div className="bg-white dark:bg-darkBg-card border-2 border-red-300 dark:border-red-900/60 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                <i className="fa-solid fa-eraser"></i>
                <h4>Wipe Attendance Records (Clean Slate)</h4>
              </div>
              <p className="text-xs text-beige-600 dark:text-gray-400 mt-1.5">
                Clears all registered subjects, timetable slots, and attendance history logs. Your student login profile remains active so you can start a fresh semester.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmWipe(true)}
              className="w-full py-2.5 px-3 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all text-center"
            >
              Reset All My Attendance Data
            </button>
          </div>

          {/* Card 2: Permanently Delete Student Account */}
          <div className="bg-white dark:bg-darkBg-card border-2 border-red-500 dark:border-red-700 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                <i className="fa-solid fa-user-xmark"></i>
                <h4>Delete Student Account Permanently</h4>
              </div>
              <p className="text-xs text-beige-600 dark:text-gray-400 mt-1.5">
                Irreversibly deletes your profile, login credentials, and all attendance records from the database. You will be logged out and can register a brand new account immediately.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmRollInput('');
                setShowConfirmDeleteAccount(true);
              }}
              className="w-full py-2.5 px-3 text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-xl shadow-brutal-sm hover:opacity-95 transition-all text-center"
            >
              Delete My Account Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Template */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-3 border-black w-full max-w-md rounded-2xl p-6 space-y-4 shadow-brutal-lg">
            <div className="flex items-center space-x-3 text-accentGold-dark dark:text-accentGold">
              <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              <h3 className="font-display text-lg font-bold text-black dark:text-white">
                Load Sample Syllabus Template?
              </h3>
            </div>
            <p className="text-xs text-beige-700 dark:text-gray-300">
              This will load a sample semester syllabus and timetable into your account.
              Any existing subjects will be replaced with the template.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-black text-black dark:text-white font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl bg-accentGold text-black font-extrabold border-2 border-black shadow-brutal-sm hover:opacity-90"
              >
                {resetting ? 'Loading...' : 'Yes, Load Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Wiping Attendance Data */}
      {showConfirmWipe && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-4 border-red-600 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-brutal-lg">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center font-bold text-lg border-2 border-red-600">
                <i className="fa-solid fa-eraser"></i>
              </div>
              <h3 className="font-display text-lg font-black text-black dark:text-white">
                Wipe All Attendance Data?
              </h3>
            </div>
            <p className="text-xs text-beige-700 dark:text-gray-300 leading-relaxed">
              This action will delete <b>all your subjects</b>, <b>timetable schedule periods</b>, and <b>attendance audit history logs</b>.
              Your student login credentials (<b className="font-mono text-black dark:text-white">{user.roll_number}</b>) will remain active.
            </p>
            <div className="p-3 bg-red-100/70 dark:bg-red-950/40 rounded-xl border border-red-300 dark:border-red-800 text-[11px] text-red-900 dark:text-red-300 font-bold">
              Tip: Export a JSON backup first if you want to keep your historical registers.
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmWipe(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-black text-black dark:text-white font-bold hover:bg-beige-200 dark:hover:bg-gray-800"
              >
                Keep Records
              </button>
              <button
                onClick={handleExecuteWipeData}
                disabled={wipingData}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black border-2 border-black shadow-brutal-sm hover:bg-red-700"
              >
                {wipingData ? 'Clearing...' : 'Yes, Wipe Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Account Permanently */}
      {showConfirmDeleteAccount && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-4 border-red-600 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-brutal-lg">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-lg border-2 border-black shadow-brutal-sm">
                <i className="fa-solid fa-skull"></i>
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-black dark:text-white">
                  Permanently Delete Account
                </h3>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                  Irreversible Action
                </span>
              </div>
            </div>

            <p className="text-xs text-beige-700 dark:text-gray-300 leading-relaxed">
              This will completely remove student <b className="text-black dark:text-white">{user.full_name}</b> and roll number <b className="font-mono text-black dark:text-accentGold">{user.roll_number}</b> along with all registers, subjects, and timetable from the database.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-beige-800 dark:text-gray-200">
                To confirm, type your Roll Number (<span className="font-mono text-red-600 select-all font-black">{user.roll_number}</span>):
              </label>
              <input
                type="text"
                value={confirmRollInput}
                onChange={(e) => setConfirmRollInput(e.target.value)}
                placeholder={`Type "${user.roll_number}"`}
                className="w-full bg-white dark:bg-darkBg-muted border-2 border-red-500 rounded-xl px-3 py-2 text-sm text-black dark:text-white font-mono font-bold outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmDeleteAccount(false);
                  setConfirmRollInput('');
                }}
                className="flex-1 py-2.5 rounded-xl border-2 border-black text-black dark:text-white font-bold hover:bg-beige-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDeleteAccount}
                disabled={deletingAccount || confirmRollInput.trim() !== user.roll_number.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black border-2 border-black shadow-brutal-sm hover:bg-red-700"
              >
                {deletingAccount ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
