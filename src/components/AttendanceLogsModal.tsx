import React, { useState, useEffect } from 'react';
import { AttendanceLog } from '../types';
import { api } from '../services/api';

interface AttendanceLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceLogsModal: React.FC<AttendanceLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .getLogs()
        .then((res) => setLogs(res.logs || []))
        .catch(() => setLogs([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F8F5EE] dark:bg-darkBg-card border-3 border-black w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-brutal-lg max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b-2 border-black/10 dark:border-gray-700 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-accentGold text-black flex items-center justify-center font-bold border border-black shadow-[1px_1px_0px_#000]">
              <i className="fa-solid fa-clock-rotate-left text-xs"></i>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-beige-900 dark:text-white leading-none">
                Attendance Audit History Log
              </h3>
              <p className="text-[11px] text-beige-500 dark:text-gray-400 font-medium mt-1">
                Records of class punches, safe bunks, and medical waivers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-beige-500 hover:text-black dark:hover:text-white font-bold p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-beige-500">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading logbook...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-xs italic text-beige-500 border-2 border-dashed border-black/15 rounded-xl">
              No recent attendance punches logged yet. Use &ldquo;+ Present&rdquo; or &ldquo;+ Bunk&rdquo; on any subject to create entries.
            </div>
          ) : (
            logs.map((log) => {
              const isPresent = log.status === 'present';
              const isMedical = log.status === 'medical' || log.status === 'od';
              return (
                <div
                  key={log.id}
                  className="p-3 bg-white dark:bg-darkBg-muted rounded-xl border-2 border-black/15 dark:border-gray-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isPresent
                          ? 'bg-accentGold/20 text-black border-accentGold'
                          : isMedical
                          ? 'bg-olive/20 text-olive border-olive'
                          : 'bg-terracotta/20 text-terracotta border-terracotta'
                      }`}
                    >
                      {isPresent ? '✓' : isMedical ? '🏥' : '✕'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-beige-900 dark:text-white">
                          {log.subjectName || 'BCA Subject'}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                            isPresent
                              ? 'bg-accentGold text-black border-black'
                              : isMedical
                              ? 'bg-olive text-white border-black'
                              : 'bg-terracotta text-white border-black'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-beige-500 dark:text-gray-400 mt-0.5">
                        {log.note || (isPresent ? 'Present in lecture' : 'Bunked lecture')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold text-beige-600 dark:text-gray-300">
                      {log.date}
                    </span>
                    <p className="text-[10px] text-beige-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-black/10 dark:border-gray-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-beige-900 dark:bg-accentGold text-white dark:text-black font-extrabold text-xs rounded-xl border-2 border-black"
          >
            Close Logbook
          </button>
        </div>
      </div>
    </div>
  );
};
