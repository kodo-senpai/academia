import React, { useState } from 'react';
import { Subject } from '../types';

interface MedicalLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onApply: (subjectId: string, count: number, note?: string) => Promise<void>;
}

export const MedicalLeaveModal: React.FC<MedicalLeaveModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onApply,
}) => {
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [count, setCount] = useState<number>(1);
  const [note, setNote] = useState<string>('Sanctioned medical / on-duty certificate');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || count < 1) return;

    setSubmitting(true);
    try {
      await onApply(subjectId, count, note.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-3 border-black w-full max-w-md rounded-2xl p-6 space-y-4 shadow-brutal-lg">
        <div className="flex justify-between items-center border-b-2 border-black/10 dark:border-gray-700 pb-3">
          <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white">
            Medical / On-Duty (OD) Leave Waiver
          </h3>
          <button
            onClick={onClose}
            className="text-beige-500 hover:text-black dark:hover:text-white font-bold p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <p className="text-beige-600 dark:text-gray-300 font-medium">
            Official sanctioned duty or approved medical leaves add both attended and held periods directly:
          </p>

          <div>
            <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
              Select Module
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-medium outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.attended}/{s.total})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
              Approved Lectures (Count)
            </label>
            <input
              type="number"
              min="1"
              max="25"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-bold text-base outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
              Reason / Sanction Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Inter-college Hackathon or Medical certificate"
              className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-medium outline-none"
            />
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
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-olive text-white font-extrabold border-2 border-black shadow-brutal-sm hover:opacity-90 active:translate-y-0.5"
            >
              {submitting ? 'Applying...' : 'Apply Waiver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
