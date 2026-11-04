import React from 'react';
import { Subject, UserProfile } from '../types';
import { calculateSubjectStats, calculateOverallStats } from '../utils/calc';

interface DashboardViewProps {
  user: UserProfile;
  subjects: Subject[];
  searchQuery: string;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onAdjustAttendance: (id: string, delta: number) => void;
  onOpenAddModal: () => void;
  onNavigateToSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  subjects,
  searchQuery,
  onEditSubject,
  onDeleteSubject,
  onAdjustAttendance,
  onOpenAddModal,
  onNavigateToSettings,
}) => {
  const globalTarget = user.global_target || 75;
  const { grandAttended, grandTotal, overallPct, totalSafeBunks, totalMustAttend, isOverallSafe } =
    calculateOverallStats(subjects, globalTarget);

  const filteredSubjects = subjects.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q));
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-black/10 dark:border-gray-800 pb-4 gap-2">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGold-dark dark:text-accentGold">
            {user.course || 'Student'} Cockpit
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-beige-900 dark:text-white">
            Attendance Overview
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-beige-600 dark:text-gray-400">Target Threshold:</span>
          <span className="font-display font-extrabold px-3 py-1 bg-accentGold text-black rounded-lg border-2 border-black shadow-brutal-sm">
            {globalTarget}%
          </span>
          <button
            onClick={onNavigateToSettings}
            className="p-1 text-beige-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            title="Change target"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Rate */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-beige-500 dark:text-gray-400 font-extrabold">
                Overall Rate
              </p>
              <h3 className="font-display text-3xl font-extrabold text-beige-900 dark:text-white mt-1">
                {overallPct}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-beige-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-accentGold border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-percent text-sm"></i>
            </div>
          </div>
          <p
            className={`text-xs font-bold mt-4 flex items-center ${
              isOverallSafe ? 'text-olive' : 'text-terracotta'
            }`}
          >
            <i
              className={`fa-solid ${
                isOverallSafe ? 'fa-circle-check' : 'fa-triangle-exclamation'
              } mr-1.5`}
            ></i>
            {isOverallSafe
              ? `Above your ${globalTarget}% requirement`
              : `Below your ${globalTarget}% requirement`}
          </p>
        </div>

        {/* Safe Bunks Left */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-olive/70 shadow-brutal flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-olive font-extrabold">
                Safe Bunks Left
              </p>
              <h3 className="font-display text-3xl font-extrabold text-olive mt-1">
                {totalSafeBunks}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-olive/15 flex items-center justify-center text-olive border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-mug-hot text-sm"></i>
            </div>
          </div>
          <p className="text-xs font-semibold text-beige-600 dark:text-gray-400 mt-4">
            Classes you can skip safely
          </p>
        </div>

        {/* Classes Needed */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-terracotta/70 shadow-brutal flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-terracotta font-extrabold">
                Classes Needed
              </p>
              <h3 className="font-display text-3xl font-extrabold text-terracotta mt-1">
                {totalMustAttend}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-terracotta/15 flex items-center justify-center text-terracotta border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-triangle-exclamation text-sm"></i>
            </div>
          </div>
          <p className="text-xs font-semibold text-beige-600 dark:text-gray-400 mt-4">
            Needed to recover {globalTarget}% goal
          </p>
        </div>

        {/* Lectures Held */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-beige-500 dark:text-gray-400 font-extrabold">
                Lectures Held
              </p>
              <h3 className="font-display text-3xl font-extrabold text-beige-900 dark:text-white mt-1">
                {grandTotal}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-beige-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-accentGold border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-graduation-cap text-sm"></i>
            </div>
          </div>
          <p className="text-xs font-semibold text-beige-600 dark:text-gray-400 mt-4">
            {grandAttended} Attended / {grandTotal - grandAttended} Missed
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-extrabold text-beige-900 dark:text-white">
              Registered Subjects & Modules
            </h3>
            <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
              Use + and - buttons to adjust lecture counters after class dismisses.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="text-xs font-extrabold text-black bg-accentGold hover:bg-accentGold-light px-3.5 py-2 rounded-xl border-2 border-black shadow-brutal-sm transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i> New Subject
          </button>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-darkBg-card rounded-2xl border-2 border-dashed border-black/20 dark:border-gray-700 space-y-4 shadow-brutal">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-accentGold/20 text-black dark:text-accentGold flex items-center justify-center text-2xl border-2 border-black shadow-brutal-sm">
              <i className="fa-solid fa-folder-plus"></i>
            </div>
            <div>
              <p className="font-display font-bold text-base text-beige-900 dark:text-white">
                {searchQuery ? `No subjects match "${searchQuery}"` : 'Your Logbook is Ready — 0 Subjects Added'}
              </p>
              <p className="text-xs text-beige-600 dark:text-gray-400 mt-1 max-w-md mx-auto">
                {searchQuery
                  ? 'Try searching with another subject code or name.'
                  : 'Start tracking your attendance by adding your subjects, or head to Settings if you would like to load a sample syllabus template.'}
              </p>
            </div>
            {!searchQuery && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2.5 bg-accentGold text-black font-extrabold text-xs rounded-xl border-2 border-black shadow-brutal-sm hover:bg-accentGold-light active:translate-y-0.5 transition-all"
                >
                  <i className="fa-solid fa-plus mr-1.5"></i> Add First Subject
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subj) => {
              const stats = calculateSubjectStats(subj, globalTarget);
              return (
                <div
                  key={subj.id}
                  className={`bg-white dark:bg-darkBg-card rounded-2xl p-5 border-2 ${
                    !stats.isSafe ? 'border-terracotta' : 'border-black dark:border-darkBg-border'
                  } flex flex-col justify-between space-y-4 shadow-brutal`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {subj.type === 'lab' ? (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                              Lab
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-beige-200 dark:bg-gray-800 text-beige-800 dark:text-gray-300 px-2 py-0.5 rounded border border-black/10">
                              Theory
                            </span>
                          )}
                          <span className="text-[10px] font-extrabold text-beige-500 dark:text-gray-400 uppercase">
                            {subj.code || user.course || 'MODULE'}
                          </span>
                        </div>
                        <h4 className="font-display text-base font-bold text-beige-900 dark:text-white leading-snug">
                          {subj.name}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditSubject(subj)}
                          className="text-beige-500 hover:text-black dark:hover:text-white p-1"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button
                          onClick={() => onDeleteSubject(subj.id)}
                          className="text-beige-500 hover:text-terracotta p-1"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <span
                        className={`font-display text-3xl font-extrabold ${
                          stats.isSafe ? 'text-beige-900 dark:text-white' : 'text-terracotta'
                        }`}
                      >
                        {stats.pct}%
                      </span>
                      <span className="text-xs font-bold text-beige-600 dark:text-gray-400">
                        {subj.attended} / {subj.total} attended
                      </span>
                    </div>

                    <div className="w-full bg-beige-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mt-2 border border-black/10">
                      <div
                        className={`h-full ${
                          stats.isSafe ? 'bg-olive' : 'bg-terracotta'
                        } transition-all duration-300`}
                        style={{ width: `${Math.min(stats.pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-black/5 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span
                      className={`font-extrabold ${
                        stats.isSafe ? 'text-olive' : 'text-terracotta'
                      }`}
                    >
                      {stats.isSafe
                        ? `🟢 Bunk next ${stats.safeBunks}`
                        : `🔴 Attend next ${stats.mustAttend}`}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onAdjustAttendance(subj.id, -1)}
                        className="w-8 h-8 rounded-lg bg-beige-100 dark:bg-gray-800 hover:bg-beige-200 text-black dark:text-white font-extrabold border-2 border-black/20"
                        title="Decrement attended"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onAdjustAttendance(subj.id, 1)}
                        className="w-8 h-8 rounded-lg bg-accentGold text-black font-extrabold border-2 border-black hover:bg-accentGold-light shadow-[1px_1px_0px_#000]"
                        title="Increment attended"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
