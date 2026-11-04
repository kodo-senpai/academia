import React from 'react';
import { Subject } from '../types';
import { calculateOverallStats } from '../utils/calc';

interface ExamEligibilityBannerProps {
  subjects: Subject[];
  globalTarget: number;
  onNavigateToBunks: () => void;
  onOpenMedicalModal: () => void;
}

export const ExamEligibilityBanner: React.FC<ExamEligibilityBannerProps> = ({
  subjects,
  globalTarget,
  onNavigateToBunks,
  onOpenMedicalModal,
}) => {
  const { overallPct, totalSafeBunks, isOverallSafe, criticalSubjects } = calculateOverallStats(
    subjects,
    globalTarget
  );

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-darkBg-card border-2 border-black dark:border-darkBg-border shadow-brutal flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-xl bg-beige-900 text-accentGold flex items-center justify-center text-xl font-bold flex-shrink-0 border-2 border-black shadow-brutal-sm">
          {criticalSubjects.length > 0 ? '⚠️' : '⚡'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-beige-900 dark:text-white">
              Exam Clearance Status
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white border border-black ${
                isOverallSafe && criticalSubjects.length === 0 ? 'bg-olive' : 'bg-terracotta'
              }`}
            >
              {isOverallSafe && criticalSubjects.length === 0 ? 'EXAM ELIGIBLE' : 'ATTENDANCE RISK'}
            </span>
          </div>
          <p className="text-xs text-beige-600 dark:text-gray-300 mt-0.5 font-medium leading-relaxed">
            {criticalSubjects.length > 0 ? (
              <>
                <span className="font-bold text-terracotta">Attention:</span> Below {globalTarget}% in{' '}
                <b>
                  {criticalSubjects
                    .map((c) => `${c.subject.name} (${c.stats.pct}%)`)
                    .slice(0, 3)
                    .join(', ')}
                  {criticalSubjects.length > 3 ? ` +${criticalSubjects.length - 3} more` : ''}
                </b>
                . Attend upcoming classes to avoid shortage penalty.
              </>
            ) : subjects.length > 0 ? (
              <>
                <span className="font-bold text-olive">All clear!</span> Overall BCA attendance is{' '}
                <b>{overallPct}%</b>. You have a total buffer of <b>{totalSafeBunks} safe bunks</b> across your modules.
              </>
            ) : (
              'No subjects registered yet. Add your first subject or load default BCA syllabus.'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
        <button
          onClick={onNavigateToBunks}
          className="flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-darkBg-muted border-2 border-black text-black dark:text-white hover:bg-beige-100 dark:hover:bg-gray-800 shadow-brutal-sm transition-all"
        >
          Bunk Calculator →
        </button>
        <button
          onClick={onOpenMedicalModal}
          className="flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-accentGold text-black border-2 border-black shadow-brutal-sm hover:bg-accentGold-light transition-all"
        >
          + Duty / Med Leave
        </button>
      </div>
    </div>
  );
};
