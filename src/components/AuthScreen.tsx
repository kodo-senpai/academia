import React, { useState } from 'react';
import { IsometricInput } from './IsometricInput';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  onShowToast: (msg: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onShowToast }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [course, setCourse] = useState('BCA AI-DS');
  const [loadDefault, setLoadDefault] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const handleDemoFill = () => {
    setIsSignUp(false);
    setRollNumber('115652');
    setPassword('priyanshu01');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp) {
      if (!rollNumber.trim()) return triggerShake('Please enter your Roll Number.');
      if (!fullName.trim()) return triggerShake('Please enter your Full Name.');
      if (password.length < 4) return triggerShake('Password must be at least 4 characters.');
      if (password !== confirmPassword) return triggerShake('Passwords do not match.');

      setLoading(true);
      try {
        const res = await api.register({
          roll_number: rollNumber.trim(),
          full_name: fullName.trim(),
          password,
          course: course.trim(),
          load_default_syllabus: loadDefault,
        });
        onShowToast(`Welcome, ${res.user.full_name}! Account created.`);
        onSuccess(res.user);
      } catch (err: any) {
        triggerShake(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else {
      if (!rollNumber.trim() || !password.trim()) {
        return triggerShake('Enter both Roll Number and Password.');
      }

      setLoading(true);
      try {
        const res = await api.login({
          roll_number: rollNumber.trim(),
          password,
        });
        onShowToast(`Welcome back, ${res.user.full_name}!`);
        onSuccess(res.user);
      } catch (err: any) {
        triggerShake(err.message || 'Invalid Roll Number or Password');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#F8F5EE] dark:bg-[#0B0F17] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`w-full max-w-md bg-white dark:bg-[#131926] p-6 sm:p-8 rounded-2xl border-4 border-black dark:border-[#E9B50B] shadow-[10px_10px_0px_#000] dark:shadow-[10px_10px_0px_rgba(233,181,11,0.7)] space-y-6 my-auto transition-transform ${
          shake ? 'auth-shake' : ''
        }`}
      >
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#231F1C] text-[#E9B50B] border-3 border-black shadow-[4px_4px_0px_#111111] mx-auto">
            <i className="fa-solid fa-graduation-cap text-2xl"></i>
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#231F1C] dark:text-white uppercase tracking-tight">
              Academia Portal
            </h2>
            <p className="text-xs font-bold text-[#D97706] dark:text-[#E9B50B]">
              BCA &bull; Artificial Intelligence & Data Science
            </p>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-beige-100 dark:bg-darkBg-muted rounded-xl border-2 border-black/20 dark:border-gray-700 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg transition-all ${
              !isSignUp
                ? 'bg-beige-900 text-white dark:bg-[#E9B50B] dark:text-black shadow-[2px_2px_0px_#000]'
                : 'text-beige-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-arrow-right-to-bracket mr-1.5"></i> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg transition-all ${
              isSignUp
                ? 'bg-beige-900 text-white dark:bg-[#E9B50B] dark:text-black shadow-[2px_2px_0px_#000]'
                : 'text-beige-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-user-plus mr-1.5"></i> Register
          </button>
        </div>

        {/* Quick Demo Preload */}
        {!isSignUp && (
          <div className="flex items-center justify-between p-2.5 bg-accentGold/15 border-2 border-dashed border-black/30 dark:border-accentGold/50 rounded-xl text-[11px]">
            <span className="font-semibold text-beige-800 dark:text-gray-200">
              Demo: <b className="font-mono">115652</b> / <b className="font-mono">priyanshu01</b>
            </span>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-2.5 py-1 bg-accentGold text-black font-extrabold rounded-lg border border-black shadow-[1px_1px_0px_#000] hover:bg-accentGold-light active:scale-95 transition-all"
            >
              Autofill
            </button>
          </div>
        )}

        {/* Auth Form with 3D Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <IsometricInput
            label="STUDENT ROLL / ID"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g. 115652"
            required
            autoComplete="username"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" width="20px" height="20px">
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
              </svg>
            }
          />

          {isSignUp && (
            <>
              <IsometricInput
                label="FULL NAME"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priyanshu Sharma"
                required
                autoComplete="name"
                icon={<i className="fa-solid fa-id-card text-black text-sm"></i>}
              />

              <IsometricInput
                label="PROGRAM / COURSE"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="BCA AI-DS"
                required
                icon={<i className="fa-solid fa-book-bookmark text-black text-sm"></i>}
              />
            </>
          )}

          <IsometricInput
            label="PORTAL ACCESS KEY"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            icon={
              <i
                className={`fa-solid ${showPassword ? 'fa-unlock' : 'fa-lock'} text-sm text-black`}
              ></i>
            }
            onButtonClick={() => setShowPassword(!showPassword)}
          />

          {isSignUp && (
            <IsometricInput
              label="CONFIRM PASSWORD"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              autoComplete="new-password"
              icon={<i className="fa-solid fa-shield-check text-black text-sm"></i>}
            />
          )}

          {isSignUp && (
            <label className="flex items-start gap-2.5 text-xs text-beige-700 dark:text-gray-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={loadDefault}
                onChange={(e) => setLoadDefault(e.target.checked)}
                className="mt-0.5 accent-accentGold w-4 h-4 rounded"
              />
              <span>
                Pre-load default <b>BCA AI-DS semester syllabus</b> and routine timetable into my account.
              </span>
            </label>
          )}

          {errorMsg && (
            <div className="text-xs font-bold text-terracotta text-center bg-terracotta/10 p-3 rounded-xl border-2 border-terracotta/30 flex items-center justify-center gap-1.5">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-accentGold text-black font-display font-extrabold text-sm uppercase rounded-xl border-3 border-black shadow-[5px_5px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Verifying Student Registry...</span>
              </span>
            ) : isSignUp ? (
              <>
                <span>Create Student Account</span>
                <i className="fa-solid fa-user-plus text-base"></i>
              </>
            ) : (
              <>
                <span>Sign In To Logbook</span>
                <i className="fa-solid fa-arrow-right-to-bracket text-base"></i>
              </>
            )}
          </button>

          <div className="p-3 bg-beige-100 dark:bg-darkBg-muted rounded-xl border-2 border-black/20 dark:border-gray-800 text-[11px] text-beige-600 dark:text-gray-400 flex items-center justify-between font-medium">
            <span>Session: <b>Semester 2026</b></span>
            <span className="text-olive font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-olive animate-pulse"></span>
              Isolated Multi-User DB
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
