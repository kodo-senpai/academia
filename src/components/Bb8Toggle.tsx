import React from 'react';

interface Bb8ToggleProps {
  darkMode: boolean;
  onToggle: (isDark: boolean) => void;
}

export const Bb8Toggle: React.FC<Bb8ToggleProps> = ({ darkMode, onToggle }) => {
  return (
    <div
      className="p-1.5 rounded-xl bg-white dark:bg-[#131926] border-2 border-black dark:border-gray-700 shadow-[2px_2px_0px_#111111] flex items-center"
      title="Toggle BB-8 Day/Night Mode"
    >
      <label className="bb8-toggle">
        <input
          className="bb8-toggle__checkbox"
          type="checkbox"
          checked={darkMode}
          onChange={(e) => onToggle(e.target.checked)}
          aria-label="Toggle dark mode"
        />
        <div className="bb8-toggle__container">
          <div className="bb8-toggle__scenery">
            <div className="bb8-toggle__star"></div>
            <div className="bb8-toggle__star"></div>
            <div className="bb8-toggle__star"></div>
            <div className="bb8-toggle__star"></div>
            <div className="bb8-toggle__star"></div>
            <div className="bb8-toggle__star"></div>
            <div className="bb8-toggle__star"></div>
            <div className="tatto-1"></div>
            <div className="tatto-2"></div>
            <div className="gomrassen"></div>
            <div className="hermes"></div>
            <div className="chenini"></div>
            <div className="bb8-toggle__cloud"></div>
            <div className="bb8-toggle__cloud"></div>
            <div className="bb8-toggle__cloud"></div>
          </div>
          <div className="bb8">
            <div className="bb8__head-container">
              <div className="bb8__antenna"></div>
              <div className="bb8__antenna"></div>
              <div className="bb8__head"></div>
            </div>
            <div className="bb8__body"></div>
          </div>
          <div className="artificial__hidden">
            <div className="bb8__shadow"></div>
          </div>
        </div>
      </label>
    </div>
  );
};
