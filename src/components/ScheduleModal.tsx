import React, { useState } from 'react';
import { Subject } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialDay?: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  onSave: (data: { subjectId: string; day: string; time: string; room?: string }) => Promise<void>;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialDay = 'Mon',
  onSave,
}) => {
  const [day, setDay] = useState<string>(initialDay);
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [time, setTime] = useState('10:00 AM - 11:00 AM');
  const [room, setRoom] = useState('LH-1');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (initialDay) setDay(initialDay);
    if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [initialDay, subjects, subjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !time.trim()) return;

    setSaving(true);
    try {
      await onSave({
        subjectId,
        day,
        time: time.trim(),
        room: room.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-3 border-black w-full max-w-md rounded-2xl p-6 space-y-4 shadow-brutal-lg">
        <div className="flex justify-between items-center border-b-2 border-black/10 dark:border-gray-700 pb-3">
          <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
            Add Lecture Routine Slot
          </h3>
          <button
            onClick={onClose}
            className="text-beige-500 hover:text-black dark:hover:text-white font-bold p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">Day of Week</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-medium outline-none"
            >
              <option value="Mon">Monday</option>
              <option value="Tue">Tuesday</option>
              <option value="Wed">Wednesday</option>
              <option value="Thu">Thursday</option>
              <option value="Fri">Friday</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-medium outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || 'BCA'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">Time Slot</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 AM - 10:00 AM"
                required
                className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-medium outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">Room / Lab</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="LH-1 / Lab 2"
                className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-medium outline-none"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-black text-black dark:text-white font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-accentGold text-black font-extrabold border-2 border-black shadow-brutal-sm hover:bg-accentGold-light active:translate-y-0.5"
            >
              {saving ? 'Adding...' : 'Add to Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
