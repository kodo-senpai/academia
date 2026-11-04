import React from 'react';

export const GuideView: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="border-b-2 border-black/10 dark:border-gray-800 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGold-dark dark:text-accentGold">
          Manual & Formulas
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-beige-900 dark:text-white">
          How To Use Academia OS
        </h2>
        <p className="text-xs text-beige-600 dark:text-gray-400 mt-1">
          Master your attendance calculations, protect your hall ticket, and plan bunks responsibly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="flex items-center space-x-3 text-accentGold">
            <span className="w-8 h-8 rounded-lg bg-black text-accentGold flex items-center justify-center font-display font-black text-sm border border-accentGold">
              01
            </span>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Safe Bunk Formulas
            </h3>
          </div>
          <p className="text-xs text-beige-700 dark:text-gray-300 leading-relaxed font-medium">
            Calculates how many classes can be safely skipped while staying &ge; 75%:
          </p>
          <div className="bg-beige-100 dark:bg-darkBg-muted p-3.5 rounded-xl border border-black/10 dark:border-gray-700 text-xs font-mono space-y-1.5">
            <div className="text-olive font-bold">
              Safe Bunks = floor((Attended &times; 100 - Target &times; Held) / Target)
            </div>
            <div className="text-terracotta font-bold">
              Must Attend = ceil((Target &times; Held - 100 &times; Attended) / (100 - Target))
            </div>
          </div>
          <p className="text-[11px] text-beige-500 dark:text-gray-400 font-medium">
            If Safe Bunks is 3, skipping the next 3 consecutive classes will still keep your attendance above the
            minimum required bar.
          </p>
        </div>

        <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="flex items-center space-x-3 text-accentGold">
            <span className="w-8 h-8 rounded-lg bg-black text-accentGold flex items-center justify-center font-display font-black text-sm border border-accentGold">
              02
            </span>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Daily Punching
            </h3>
          </div>
          <p className="text-xs text-beige-700 dark:text-gray-300 leading-relaxed font-medium">
            Fast logging through dashboard cards or the Timetable view:
          </p>
          <ul className="text-xs text-beige-700 dark:text-gray-300 space-y-2 list-disc list-inside font-medium">
            <li>
              Tap <b>+ Present</b> if you were marked present in lecture.
            </li>
            <li>
              Tap <b>+ Bunk</b> if you skipped or missed attendance roll call.
            </li>
            <li>
              Use the <b>+ / -</b> buttons on cards to adjust manual counts for faculty teacher corrections.
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="flex items-center space-x-3 text-accentGold">
            <span className="w-8 h-8 rounded-lg bg-black text-accentGold flex items-center justify-center font-display font-black text-sm border border-accentGold">
              03
            </span>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              What-If Predictor
            </h3>
          </div>
          <p className="text-xs text-beige-700 dark:text-gray-300 leading-relaxed font-medium">
            Before taking leaves or going to college hackathons & fests:
          </p>
          <ul className="text-xs text-beige-700 dark:text-gray-300 space-y-2 list-disc list-inside font-medium">
            <li>Select your subject in the Predictor tab.</li>
            <li>Drag the <b>Bunk Slider</b> to see how many percentage points you will lose.</li>
            <li>Check if the status remains green before finalizing plans!</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-3">
          <div className="flex items-center space-x-3 text-accentGold">
            <span className="w-8 h-8 rounded-lg bg-black text-accentGold flex items-center justify-center font-display font-black text-sm border border-accentGold">
              04
            </span>
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Medical & OD Leave
            </h3>
          </div>
          <p className="text-xs text-beige-700 dark:text-gray-300 leading-relaxed font-medium">
            For authorized sports events, NSS/NCC, or medical convalescence:
          </p>
          <ul className="text-xs text-beige-700 dark:text-gray-300 space-y-2 list-disc list-inside font-medium">
            <li>
              Click <b>+ Duty / Med Leave</b> in the top dashboard banner.</li>
            <li>Select the module and enter sanctioned hours approved by faculty.</li>
            <li>Increments both attended & held counts together without penalizing your score.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
