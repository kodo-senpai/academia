import React, { useState } from 'react';
import { Bb8Toggle } from './Bb8Toggle';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  user: UserProfile;
  darkMode: boolean;
  onToggleTheme: (isDark: boolean) => void;
  onLogout: () => void;
  onOpenLogs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  user,
  darkMode,
  onToggleTheme,
  onLogout,
  onOpenLogs,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'bunk-manager', label: 'Can I Bunk?', icon: 'fa-calculator' },
    { id: 'timetable', label: 'Timetable', icon: 'fa-calendar-day' },
    { id: 'calculator', label: 'Predictor', icon: 'fa-wand-magic-sparkles' },
    { id: 'guide', label: 'Guide', icon: 'fa-circle-question' },
    { id: 'analytics', label: 'Settings', icon: 'fa-sliders' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F8F5EE]/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b-2 border-black/10 dark:border-darkBg-border px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Student Info */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-beige-900 dark:bg-accentGold flex items-center justify-center text-accentGold dark:text-black border-2 border-black shadow-brutal-sm group-hover:rotate-2 transition-transform">
            <i className="fa-solid fa-cube text-lg"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-black tracking-tight text-beige-900 dark:text-white leading-none">
                ACADEMIA
              </span>
              <span className="text-[9px] uppercase font-black bg-accentGold text-black px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                {user.course || 'BCA AI-DS'}
              </span>
            </div>
            <p className="text-[11px] text-beige-500 dark:text-gray-400 font-semibold truncate max-w-[180px] sm:max-w-none">
              Roll: <b className="text-beige-800 dark:text-gray-200">{user.roll_number}</b> &bull; {user.full_name}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 border-2 border-black dark:border-gray-700 bg-white dark:bg-darkBg-muted p-1 rounded-xl shadow-brutal-sm text-xs font-bold">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-beige-900 text-white dark:bg-accentGold dark:text-black shadow-xs'
                    : 'text-beige-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <i className={`fa-solid ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: History Logs + BB-8 + Sign Out + Mobile Toggle */}
        <div className="flex items-center space-x-2">
          {/* Attendance History Audit Log Button */}
          <button
            onClick={onOpenLogs}
            className="p-2 rounded-xl bg-white dark:bg-darkBg-card text-beige-700 dark:text-gray-300 hover:text-accentGold-dark dark:hover:text-accentGold border-2 border-black dark:border-gray-700 shadow-brutal-sm transition-all"
            title="Attendance Punch Log History"
          >
            <i className="fa-solid fa-clock-rotate-left text-xs"></i>
          </button>

          {/* BB-8 Droid Theme Toggle */}
          <Bb8Toggle darkMode={darkMode} onToggle={onToggleTheme} />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-white dark:bg-darkBg-card text-beige-700 dark:text-gray-300 hover:text-terracotta border-2 border-black dark:border-gray-700 shadow-brutal-sm transition-all"
            title="Sign Out"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white dark:bg-darkBg-card text-beige-900 dark:text-white border-2 border-black dark:border-gray-700 shadow-brutal-sm"
          >
            <i className="fa-solid fa-bars text-sm"></i>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t-2 border-black/10 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs font-bold">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left p-2.5 rounded-lg border flex items-center gap-2 ${
                activeTab === item.id
                  ? 'bg-beige-900 text-white dark:bg-accentGold dark:text-black border-black'
                  : 'bg-white dark:bg-darkBg-card text-beige-800 dark:text-gray-200 border-black/20'
              }`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              onOpenLogs();
              setMobileMenuOpen(false);
            }}
            className="col-span-2 text-left p-2.5 rounded-lg bg-white dark:bg-darkBg-card text-beige-800 dark:text-gray-200 border border-black/20 flex items-center gap-2"
          >
            <i className="fa-solid fa-clock-rotate-left text-accentGold"></i>
            <span>View Attendance Audit History</span>
          </button>
        </div>
      )}
    </header>
  );
};
