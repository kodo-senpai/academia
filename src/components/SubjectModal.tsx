import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { IsometricInput } from './IsometricInput';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    code?: string;
    attended: number;
    total: number;
    target?: number | null;
    type: 'theory' | 'lab';
  }) => Promise<void>;
  initialSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [attended, setAttended] = useState(0);
  const [total, setTotal] = useState(0);
  const [target, setTarget] = useState<string>('');
  const [type, setType] = useState<'theory' | 'lab'>('theory');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setCode(initialSubject.code || '');
      setAttended(initialSubject.attended);
      setTotal(initialSubject.total);
      setTarget(initialSubject.target ? String(initialSubject.target) : '');
      setType(initialSubject.type || 'theory');
    } else {
      setName('');
      setCode('');
      setAttended(0);
      setTotal(0);
      setTarget('');
      setType('theory');
    }
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: initialSubject?.id,
        name: name.trim(),
        code: code.trim(),
        attended: Number(attended) || 0,
        total: Number(total) || 0,
        target: target ? parseInt(target) : null,
        type,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-3 border-black w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-brutal-lg">
        <div className="flex justify-between items-center border-b-2 border-black/10 dark:border-gray-700 pb-3">
          <h3 className="font-display text-xl font-bold text-beige-900 dark:text-white">
            {initialSubject ? 'Edit Subject Module' : 'Add New Subject'}
          </h3>
          <button
            onClick={onClose}
            className="text-beige-500 hover:text-black dark:hover:text-white font-bold p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <IsometricInput
            label="SUBJECT / MODULE TITLE"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Data Structures, Accounting, Marketing..."
            required
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"></path>
              </svg>
            }
          />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
                Subject Code (Optional)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS101, MGT201"
                className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-bold outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
                Class Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'theory' | 'lab')}
                className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-bold outline-none"
              >
                <option value="theory">Theory Lecture</option>
                <option value="lab">Practical Lab</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
                Attended
              </label>
              <input
                type="number"
                min="0"
                value={attended}
                onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
                required
                className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-bold text-base outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
                Total Held
              </label>
              <input
                type="number"
                min={attended}
                value={total}
                onChange={(e) => setTotal(Math.max(0, parseInt(e.target.value) || 0))}
                required
                className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-bold text-base outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-beige-700 dark:text-gray-300 mb-1">
              Custom Target % (Leave empty to use global target)
            </label>
            <input
              type="number"
              min="40"
              max="100"
              placeholder="e.g. 75"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-white dark:bg-darkBg-muted border-2 border-black rounded-xl px-3 py-2 text-beige-900 dark:text-white font-medium outline-none"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-black text-black dark:text-white font-bold hover:bg-beige-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-accentGold text-black font-extrabold border-2 border-black shadow-brutal-sm hover:bg-accentGold-light active:translate-y-0.5"
            >
              {saving ? 'Saving...' : 'Save Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
