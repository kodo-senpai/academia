import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 bg-black text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center space-x-3 border-2 border-accentGold font-bold animate-bounce-once">
      <i className="fa-solid fa-circle-check text-accentGold text-base"></i>
      <span>{message}</span>
    </div>
  );
};
