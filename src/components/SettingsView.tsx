import React, { useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateTarget: (newTarget: number) => void;
  onResetSyllabus: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
  onDataImported: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateTarget,
  onResetSyllabus,
  onLogout,
  onShowToast,
  onDataImported,
}) => {
  const [targetInput, setTargetInput] = useState<number>(user.global_target || 75);
  const [savingTarget, setSavingTarget] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSaveTarget = async () => {
    if (targetInput < 40 || targetInput > 100) {
      onShowToast('Target must be between 40% and 100%');
      return;
    }

    setSavingTarget(true);
    try {
      await api.updateProfile({ global_target: targetInput });
      onUpdateTarget(targetInput);
      onShowToast(`Target goal updated to ${targetInput}%`);
    } catch (err: any) {
      onShowToast('Failed to update target: ' + err.message);
    } finally {
      setSavingTarget(false);
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
      onShowToast('Syllabus reset to default BCA AI-DS curriculum.');
    } catch (err: any) {
      onShowToast('Reset failed: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-b-2 border-black/10 dark:border-gray-800 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGold-dark dark:text-accentGold">
          Settings & Data
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-beige-900 dark:text-white">
          Configuration & Account
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Target Minimum % */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="w-10 h-10 rounded-xl bg-accentGold text-black flex items-center justify-center font-bold text-base border-2 border-black shadow-brutal-sm">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
            Target Minimum %
          </h3>
          <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
            Standard college minimum rule is 75%. Safe bunks adjust automatically.
          </p>
          <div>
            <input
              type="number"
              min="40"
              max="100"
              value={targetInput}
              onChange={(e) => setTargetInput(parseInt(e.target.value) || 75)}
              className="w-full bg-beige-50 dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-sm text-beige-900 dark:text-white font-bold outline-none"
            />
          </div>
          <button
            onClick={handleSaveTarget}
            disabled={savingTarget}
            className="w-full py-2.5 text-xs font-extrabold bg-beige-900 dark:bg-accentGold text-white dark:text-black rounded-xl border-2 border-black shadow-brutal-sm hover:opacity-90 active:translate-y-0.5"
          >
            {savingTarget ? 'Saving...' : 'Save Target Goal'}
          </button>
        </div>

        {/* Backup & Transfer */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="w-10 h-10 rounded-xl bg-olive text-white flex items-center justify-center font-bold text-base border-2 border-black shadow-brutal-sm">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
            Backup & Transfer
          </h3>
          <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
            Export records to JSON to backup or transfer between devices.
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
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-1.5 text-xs text-terracotta hover:underline text-center block font-bold"
          >
            Reset to Default BCA Syllabus
          </button>
        </div>

        {/* Active Student Profile */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center font-bold text-base border-2 border-black shadow-brutal-sm">
            <i className="fa-solid fa-id-card"></i>
          </div>
          <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
            Active Student
          </h3>
          <div className="text-xs space-y-1.5 text-beige-700 dark:text-gray-300 font-medium">
            <p>
              Student ID / Roll: <b className="font-mono text-black dark:text-accentGold">{user.roll_number}</b>
            </p>
            <p>
              Name: <b>{user.full_name}</b>
            </p>
            <p>
              Program: <b>{user.course || 'BCA (AI & Data Science)'}</b>
            </p>
            <p>
              Security: <b className="text-olive">Per-Student Isolated Database</b>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 text-xs font-extrabold bg-terracotta/20 text-terracotta rounded-xl border border-terracotta hover:bg-terracotta/30 active:scale-95 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-3 border-black w-full max-w-md rounded-2xl p-6 space-y-4 shadow-brutal-lg">
            <div className="flex items-center space-x-3 text-terracotta">
              <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              <h3 className="font-display text-lg font-bold text-black dark:text-white">
                Reset Syllabus Data?
              </h3>
            </div>
            <p className="text-xs text-beige-700 dark:text-gray-300">
              This will reset your subjects, timetable, and attendance logs to the fresh BCA AI-DS curriculum.
              This cannot be undone unless you have an exported backup.
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
                className="flex-1 py-2.5 rounded-xl bg-terracotta text-white font-extrabold border-2 border-black shadow-brutal-sm hover:opacity-90"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Syllabus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
