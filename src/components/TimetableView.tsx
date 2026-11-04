import React, { useState } from 'react';
import { Subject, ScheduleSlot } from '../types';
import { calculateSubjectStats } from '../utils/calc';

interface TimetableViewProps {
  subjects: Subject[];
  schedule: ScheduleSlot[];
  globalTarget: number;
  onQuickMark: (subjectId: string, attended: boolean) => void;
  onDeleteSlot: (slotId: string) => void;
  onOpenAddSlotModal: () => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  subjects,
  schedule,
  globalTarget,
  onQuickMark,
  onDeleteSlot,
  onOpenAddSlotModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');
  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const daySlots = schedule.filter((s) => s.day === selectedDay);

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black/10 dark:border-gray-800 pb-4 gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGold-dark dark:text-accentGold">
            Weekly Schedule
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-beige-900 dark:text-white">
            Day Timetable & Fast Logger
          </h2>
        </div>
        <div className="flex items-center space-x-1 bg-white dark:bg-darkBg-card p-1 rounded-xl border-2 border-black dark:border-gray-700 shadow-brutal-sm text-xs font-bold">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDay === day
                  ? 'bg-beige-900 text-white dark:bg-accentGold dark:text-black shadow-xs'
                  : 'text-beige-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected Day Schedule */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
              Lectures for{' '}
              <span className="text-accentGold-dark dark:text-accentGold">
                {selectedDay === 'Mon'
                  ? 'Monday'
                  : selectedDay === 'Tue'
                  ? 'Tuesday'
                  : selectedDay === 'Wed'
                  ? 'Wednesday'
                  : selectedDay === 'Thu'
                  ? 'Thursday'
                  : 'Friday'}
              </span>
            </h3>
            <button
              onClick={onOpenAddSlotModal}
              className="text-xs font-extrabold text-black bg-accentGold hover:bg-accentGold-light px-3 py-1.5 rounded-xl border-2 border-black shadow-brutal-sm"
            >
              + Add Time Slot
            </button>
          </div>

          {daySlots.length === 0 ? (
            <div className="bg-white dark:bg-darkBg-card p-8 rounded-2xl text-center text-beige-500 dark:text-gray-400 text-xs italic border-2 border-dashed border-black/20 dark:border-gray-800">
              No scheduled classes for this day. Click &ldquo;+ Add Time Slot&rdquo; to add classes.
            </div>
          ) : (
            <div className="space-y-3">
              {daySlots.map((slot) => {
                const subj = getSubjectById(slot.subjectId);
                const stats = subj ? calculateSubjectStats(subj, globalTarget) : null;
                const subjName = subj ? subj.name : slot.subjectName || 'Subject';

                return (
                  <div
                    key={slot.id}
                    className="bg-white dark:bg-darkBg-card p-4 rounded-2xl flex items-center justify-between border-2 border-black dark:border-darkBg-border shadow-brutal-sm"
                  >
                    <div>
                      <span className="text-[10px] text-beige-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">
                        {slot.time} &bull; {slot.room || 'Room TBA'}
                      </span>
                      <h4 className="font-display text-base font-bold text-beige-900 dark:text-white">
                        {subjName}
                      </h4>
                      {stats && (
                        <span
                          className={`text-[10px] font-bold ${
                            stats.isSafe ? 'text-olive' : 'text-terracotta'
                          }`}
                        >
                          {stats.pct}% Attendance (
                          {stats.isSafe
                            ? `${stats.safeBunks} safe bunks left`
                            : `Need ${stats.mustAttend} classes`}
                          )
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onQuickMark(slot.subjectId, true)}
                        className="px-3 py-1.5 bg-accentGold text-black font-extrabold text-xs rounded-xl border-2 border-black hover:bg-accentGold-light shadow-brutal-sm active:translate-y-0.5"
                      >
                        + Present
                      </button>
                      <button
                        onClick={() => onQuickMark(slot.subjectId, false)}
                        className="px-3 py-1.5 bg-terracotta text-white font-extrabold text-xs rounded-xl hover:opacity-90 border-2 border-black shadow-brutal-sm active:translate-y-0.5"
                      >
                        + Bunk
                      </button>
                      <button
                        onClick={() => onDeleteSlot(slot.id)}
                        className="text-beige-400 hover:text-terracotta p-1"
                        title="Delete slot"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: One-Tap Quick Punching */}
        <div className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border-2 border-black dark:border-darkBg-border shadow-brutal space-y-4 h-fit">
          <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
            One-Tap Class Punching
          </h3>
          <p className="text-xs text-beige-600 dark:text-gray-400 font-medium">
            Quickly mark attendance right after lectures dismiss without looking up registers.
          </p>

          <div className="space-y-2 text-xs max-h-[460px] overflow-y-auto pr-1">
            {subjects.length === 0 ? (
              <p className="text-beige-500 italic">No registered subjects.</p>
            ) : (
              subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-beige-50 dark:bg-darkBg-muted border border-black/10 dark:border-gray-800"
                >
                  <span className="font-bold text-beige-900 dark:text-white truncate max-w-[130px]">
                    {subj.name}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onQuickMark(subj.id, true)}
                      className="px-2 py-1 bg-accentGold text-black font-extrabold rounded-lg text-[11px] border border-black hover:bg-accentGold-light active:scale-95"
                    >
                      + Present
                    </button>
                    <button
                      onClick={() => onQuickMark(subj.id, false)}
                      className="px-2 py-1 bg-terracotta/20 text-terracotta font-extrabold rounded-lg text-[11px] border border-terracotta hover:bg-terracotta/30 active:scale-95"
                    >
                      + Bunk
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
