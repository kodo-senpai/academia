import React, { useState, useEffect } from 'react';
import { Subject } from '../types';

interface PredictorViewProps {
  subjects: Subject[];
  globalTarget: number;
}

export const PredictorView: React.FC<PredictorViewProps> = ({ subjects, globalTarget }) => {
  const [selectedId, setSelectedId] = useState<string>(subjects[0]?.id || '');
  const [attendNext, setAttendNext] = useState<number>(5);
  const [bunkNext, setBunkNext] = useState<number>(0);

  useEffect(() => {
    if (!selectedId && subjects.length > 0) {
      setSelectedId(subjects[0].id);
    }
  }, [subjects, selectedId]);

  const currentSubj = subjects.find((s) => s.id === selectedId) || subjects[0];

  if (!currentSubj) {
    return (
      <div className="p-10 text-center bg-white dark:bg-darkBg-card rounded-2xl border-2 border-dashed border-black/20 dark:border-gray-700 shadow-brutal space-y-3">
        <i className="fa-solid fa-wand-magic-sparkles text-3xl text-accentGold"></i>
        <h3 className="font-display font-bold text-base text-beige-900 dark:text-white">No Subjects to Simulate Yet</h3>
        <p className="text-xs text-beige-600 dark:text-gray-400 max-w-sm mx-auto">
          Add your semester subjects from the Dashboard first to test what-if attendance scenarios.
        </p>
      </div>
    );
  }

  const target = currentSubj.target || globalTarget || 75;
  const currentAttended = Number(currentSubj.attended);
  const currentTotal = Number(currentSubj.total);
  const currentPct = currentTotal > 0 ? parseFloat(((currentAttended / currentTotal) * 100).toFixed(1)) : 0;

  const newAttended = currentAttended + attendNext;
  const newTotal = currentTotal + attendNext + bunkNext;
  const projectedPct = newTotal > 0 ? parseFloat(((newAttended / newTotal) * 100).toFixed(1)) : 0;
  const diffPct = parseFloat((projectedPct - currentPct).toFixed(1));

  const isSafe = projectedPct >= target;

  return (
    <section className="space-y-6">
      <div className="border-b-2 border-black/10 dark:border-gray-800 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGold-dark dark:text-accentGold">
          Interactive Simulation
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-beige-900 dark:text-white">
          What-If Predictor
        </h2>
        <p className="text-xs text-beige-600 dark:text-gray-400 mt-1">
          Preview how future classes or bunks will shift your percentage before making decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-darkBg-card p-6 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-4">
          <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
            Simulation Setup
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-beige-700 dark:text-gray-300 mb-1">Select Subject</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-beige-50 dark:bg-darkBg-muted border-2 border-black dark:border-gray-700 rounded-xl px-3 py-2.5 text-beige-900 dark:text-white font-bold outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.attended}/{s.total})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-beige-600 dark:text-gray-400 mb-1">Attended Currently</label>
                <input
                  type="number"
                  readOnly
                  value={currentAttended}
                  className="w-full bg-beige-100 dark:bg-gray-800 border-2 border-black/20 rounded-xl px-3 py-2 text-beige-800 dark:text-gray-200 font-extrabold text-sm"
                />
              </div>
              <div>
                <label className="block text-beige-600 dark:text-gray-400 mb-1">Held Currently</label>
                <input
                  type="number"
                  readOnly
                  value={currentTotal}
                  className="w-full bg-beige-100 dark:bg-gray-800 border-2 border-black/20 rounded-xl px-3 py-2 text-beige-800 dark:text-gray-200 font-extrabold text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-beige-700 dark:text-gray-300">
                  Upcoming classes you will ATTEND
                </label>
                <span className="font-display text-base font-extrabold text-olive">{attendNext}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={attendNext}
                onChange={(e) => setAttendNext(parseInt(e.target.value) || 0)}
                className="w-full accent-olive h-2 bg-beige-200 dark:bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-beige-700 dark:text-gray-300">
                  Upcoming classes you will BUNK
                </label>
                <span className="font-display text-base font-extrabold text-terracotta">{bunkNext}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={bunkNext}
                onChange={(e) => setBunkNext(parseInt(e.target.value) || 0)}
                className="w-full accent-terracotta h-2 bg-beige-200 dark:bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 bg-[#231F1C] dark:bg-[#111726] text-white p-6 sm:p-7 rounded-2xl border-2 border-black shadow-brutal flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accentGold">
                Prediction Result
              </span>
              <span
                className={`px-3 py-1 text-xs rounded-full text-white font-extrabold ${
                  isSafe ? 'bg-olive' : 'bg-terracotta'
                }`}
              >
                {isSafe ? 'SAFE SCENARIO' : 'SHORTAGE WARNING'}
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-baseline justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Projected Percentage
                </p>
                <h4 className="font-display text-5xl sm:text-6xl font-extrabold text-accentGold mt-1">
                  {projectedPct}%
                </h4>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Current Baseline
                </p>
                <p className="font-display text-2xl text-gray-300 mt-1">{currentPct}%</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs bg-black/40 p-3.5 rounded-xl border border-gray-700">
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">New Attended</span>
                <span className="font-extrabold text-base text-white">{newAttended}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">New Total</span>
                <span className="font-extrabold text-base text-white">{newTotal}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">Shift</span>
                <span
                  className={`font-extrabold text-base ${
                    diffPct >= 0 ? 'text-olive-light' : 'text-terracotta-light'
                  }`}
                >
                  {diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-xs text-gray-200 font-medium">
            {isSafe ? (
              <span>
                🌟 Attendance for <b>{currentSubj.name}</b> projected at <b>{projectedPct}%</b> (safe above your{' '}
                {target}% requirement).
              </span>
            ) : (
              <span>
                ⚠️ This scenario drops attendance to <b>{projectedPct}%</b>, putting you below your college&apos;s{' '}
                {target}% rule.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
