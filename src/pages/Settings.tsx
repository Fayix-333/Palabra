import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Target,
  Download,
  Upload,
  RotateCcw,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocalStorageManager } from '../utils/storage';
import { loginWithGoogle, logoutUser } from '../utils/firebase';
import { Modal } from '../components/common/Modal';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    user,
    isFirebaseAvailable,
    cloudSyncStatus,
    manualCloudSync,
    resetAllProgress,
  } = useApp();

  const [studentNameInput, setStudentNameInput] = useState(settings.studentName);
  const [nameSaved, setNameSaved] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentNameInput.trim()) {
      updateSettings({ studentName: studentNameInput.trim() });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const handleExportData = () => {
    const dataJson = LocalStorageManager.exportAllData();
    const blob = new Blob([dataJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palabra_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = LocalStorageManager.importData(content);
      if (success) {
        setImportStatus('Progress restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Failed to import: Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setAuthError(msg);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <span>Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
          Application Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personalize learning parameters, sound, spelling strictness, and cloud backup
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Student Profile */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-rose-600" />
            Student Identity
          </h2>

          <form onSubmit={handleSaveName} className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
                placeholder="Enter your name..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                {nameSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Study & Competition Preferences */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-5">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-600" />
            Study & Competition Settings
          </h2>

          {/* Strict Accents */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Strict Spanish Accents Enforcement
              </span>
              <span className="text-[11px] text-slate-500 block">
                Requires accurate accents (á, é, í, ó, ú) and ñ. Essential for official Sibaq evaluation.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.strictAccents}
              onChange={(e) => updateSettings({ strictAccents: e.target.checked })}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>

          {/* Daily Goal */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Daily Learning Goal
              </span>
              <span className="text-[11px] text-slate-500 block">
                Target words practiced each day for streak & XP rewards
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              {[10, 20, 30, 50].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => updateSettings({ dailyGoalWords: goal })}
                  className={`px-2.5 py-1 rounded-md border text-xs ${
                    settings.dailyGoalWords === goal
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Quiz Length */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Default Quiz Length
              </span>
              <span className="text-[11px] text-slate-500 block">
                Standard question count when opening quick drills
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              {[10, 20, 30, 50].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => updateSettings({ preferredQuizLength: len })}
                  className={`px-2.5 py-1 rounded-md border text-xs ${
                    settings.preferredQuizLength === len
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Audio & Appearance */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-5">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-rose-600" />
            Audio & Accessibility
          </h2>

          {/* Sound Effects */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Sound Effects
              </span>
              <span className="text-[11px] text-slate-500 block">
                Play pleasant chimes for correct answers, errors, and streak milestones
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>

          {/* Pronunciation Audio */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Speech Synthesis Voice
              </span>
              <span className="text-[11px] text-slate-500 block">
                Speak words in authentic Spanish using browser speech engine
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.pronunciationAudio}
              onChange={(e) => updateSettings({ pronunciationAudio: e.target.checked })}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>

          {/* Speech Rate */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Speech Playback Speed
              </span>
              <span className="text-[11px] text-slate-500 block">
                Pacing for spoken Spanish vocabulary
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              {[0.75, 0.9, 1.0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => updateSettings({ speechRate: rate })}
                  className={`px-2 py-1 rounded-md border text-xs ${
                    settings.speechRate === rate
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Reduce Motion
              </span>
              <span className="text-[11px] text-slate-500 block">
                Minimize card flips and decorative animations
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Section 4: Cloud Sync & Account */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-rose-600" />
            Cloud Synchronization & Account
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            PALABRA is designed offline-first. All your scores, streaks, and custom notes are stored
            securely on this device in guest mode. You can optionally sign in with Google to
            synchronize your progress across multiple devices via Firebase.
          </p>

          {authError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">
              {authError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {isFirebaseAvailable ? (
              user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Signed in as <strong>{user.email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={manualCloudSync}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Sync Now ({cloudSyncStatus})
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleLogout}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In with Google (Firebase)
                </button>
              )
            ) : (
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                Running in Local Guest Mode (No Firebase keys set)
              </span>
            )}
          </div>
        </div>

        {/* Section 5: Backup & Reset */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-rose-600" />
            Data Backup & Portability
          </h2>

          <p className="text-xs text-slate-500">
            Export your complete learning history as a JSON file to transfer between browsers, or
            restore a previous backup.
          </p>

          {importStatus && (
            <p className="text-xs font-medium text-emerald-600">{importStatus}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportData}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-rose-600" />
              Export Progress (JSON)
            </button>

            <label className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-slate-500" />
              Import Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Progress
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal For Reset */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Application Data?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This will permanently remove your study streaks, mastery records, and quiz logs on this
            device.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetAllProgress();
                setShowResetModal(false);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
