import React from 'react';
import { Subject } from '../types';
import { calculateSubjectStats } from '../utils/calc';

interface BunkManagerViewProps {
  subjects: Subject[];
  globalTarget: number;
  searchQuery: string;
  onQuickMark: (id: string, attended: boolean) => void;
}

export const BunkManagerView: React.FC<BunkManagerViewProps> = ({
  subjects,
  globalTarget,
  searchQuery,
  onQuickMark,
}) => {
  const filteredSubjects = subjects.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q));
  });

  const criticalList: { subj: Subject; stats: ReturnType<typeof calculateSubjectStats> }[] = [];
  const safeList: { subj: Subject; stats: ReturnType<typeof calculateSubjectStats> }[] = [];

  filteredSubjects.forEach((subj) => {
    const stats = calculateSubjectStats(subj, globalTarget);
    if (!stats.isSafe) {
      criticalList.push({ subj, stats });
    } else if (stats.safeBunks > 0) {
      safeList.push({ subj, stats });
    }
  });

  return (
    <section className="space-y-6">
      <div className="border-b-2 border-black/10 dark:border-gray-800 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGold-dark dark:text-accentGold">
          Smart Advisor
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-beige-900 dark:text-white">
          Can I Bunk Today?
        </h2>
        <p className="text-xs text-beige-600 dark:text-gray-400 mt-1">
          Real-time clearance chart calculated against your{' '}
          <span className="font-bold text-black dark:text-accentGold">{globalTarget}%</span> requirement.
        </p>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-darkBg-card rounded-2xl p-5 border-2 border-black dark:border-darkBg-border shadow-brutal space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Subject Allowance & Clearance Breakdown
            </h3>
            <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
              Shows exactly how many bunks you have left or classes needed to reach clearance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-olive/15 text-olive border border-olive/30">
              🟢 Safe Buffer
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-terracotta/15 text-terracotta border border-terracotta/30">
              🔴 Shortage
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black/10 dark:border-gray-800 text-beige-600 dark:text-gray-400 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="py-3 px-3">Subject / Module</th>
                <th className="py-3 px-3 text-center">Attended / Held</th>
                <th className="py-3 px-3 text-center">Current %</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Safe Bunks / Recovery</th>
                <th className="py-3 px-3 text-right">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-gray-800">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-beige-500 italic">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subj) => {
                  const stats = calculateSubjectStats(subj, globalTarget);
                  return (
                    <tr
                      key={subj.id}
                      className="hover:bg-beige-100/60 dark:hover:bg-darkBg-muted transition-colors font-medium"
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-beige-900 dark:text-white">{subj.name}</div>
                        <div className="text-[10px] text-beige-500 dark:text-gray-400 uppercase font-semibold">
                          {subj.code ? `${subj.code} • ` : ''}{subj.type}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {subj.attended} / {subj.total}
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-display font-extrabold text-sm ${
                          stats.isSafe ? 'text-beige-900 dark:text-white' : 'text-terracotta'
                        }`}
                      >
                        {stats.pct}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            stats.isSafe
                              ? 'bg-olive/15 text-olive border border-olive/30'
                              : 'bg-terracotta/15 text-terracotta border border-terracotta/30'
                          }`}
                        >
                          {stats.isSafe ? 'Safe' : 'Shortage'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-bold ${
                          stats.isSafe ? 'text-olive' : 'text-terracotta'
                        }`}
                      >
                        {stats.isSafe ? (
                          <>
                            Can bunk <b>{stats.safeBunks}</b> classes
                          </>
                        ) : (
                          <>
                            Must attend <b>{stats.mustAttend}</b> classes
                          </>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onQuickMark(subj.id, true)}
                          className="px-2.5 py-1 bg-accentGold text-black font-extrabold rounded-lg border-2 border-black hover:bg-accentGold-light mr-1.5 shadow-[1px_1px_0px_#000] active:translate-y-0.5"
                        >
                          + Present
                        </button>
                        <button
                          onClick={() => onQuickMark(subj.id, false)}
                          className="px-2.5 py-1 bg-terracotta text-white font-extrabold rounded-lg hover:opacity-90 border-2 border-black shadow-[1px_1px_0px_#000] active:translate-y-0.5"
                        >
                          + Bunk
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Danger Zone vs Chill Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="flex items-center space-x-2 text-terracotta font-extrabold">
            <i className="fa-solid fa-ban text-base"></i>
            <h4 className="font-display text-base text-beige-900 dark:text-white">
              Danger Zone (Do Not Bunk)
            </h4>
          </div>
          <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
            Attendance in these subjects is critically below target. Skipping here risks debarment.
          </p>
          <ul className="space-y-2 pt-1 text-xs">
            {criticalList.length === 0 ? (
              <li className="text-beige-500 dark:text-gray-400 italic">
                No attendance shortage in any subject. All safe!
              </li>
            ) : (
              criticalList.map(({ subj, stats }) => (
                <li
                  key={subj.id}
                  className="flex items-center justify-between bg-terracotta/10 p-2.5 rounded-xl border border-terracotta/20 font-semibold"
                >
                  <span className="truncate mr-2">{subj.name}</span>
                  <span className="font-extrabold text-terracotta whitespace-nowrap">
                    Need {stats.mustAttend} classes
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="flex items-center space-x-2 text-olive font-extrabold">
            <i className="fa-solid fa-umbrella-beach text-base"></i>
            <h4 className="font-display text-base text-beige-900 dark:text-white">
              Chill Zone (Safe Buffer)
            </h4>
          </div>
          <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
            High buffer modules. You can skip lectures without falling below your threshold.
          </p>
          <ul className="space-y-2 pt-1 text-xs">
            {safeList.length === 0 ? (
              <li className="text-beige-500 dark:text-gray-400 italic">
                No extra bunks to spare right now. Keep attending.
              </li>
            ) : (
              safeList.map(({ subj, stats }) => (
                <li
                  key={subj.id}
                  className="flex items-center justify-between bg-olive/10 p-2.5 rounded-xl border border-olive/20 font-semibold"
                >
                  <span className="truncate mr-2">{subj.name}</span>
                  <span className="font-extrabold text-olive whitespace-nowrap">
                    Can bunk {stats.safeBunks} classes
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};
