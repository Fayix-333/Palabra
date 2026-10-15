/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { MobileNav } from './components/layout/MobileNav';

import { LiquidBackground } from './components/common/LiquidBackground';
import { IOS27DynamicIsland } from './components/common/IOS27DynamicIsland';

// Pages
import { LearningHome } from './pages/LearningHome';
import { LessonRunner } from './pages/LessonRunner';
import { Learn } from './pages/Learn';
import { Vocabulary } from './pages/Vocabulary';
import { Practice } from './pages/Practice';
import { Quiz } from './pages/Quiz';
import { MockTest } from './pages/MockTest';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { Progress } from './pages/Progress';
import { StudyPlan } from './pages/StudyPlan';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLessonRunning = location.pathname.startsWith('/lesson/');
  const isMockTest = location.pathname === '/mock-test';
  const isFocusMode = isLessonRunning || isMockTest;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] dark:bg-[#131F24] text-slate-800 dark:text-slate-100 transition-colors font-sans relative overflow-x-hidden">
      <LiquidBackground />
      <IOS27DynamicIsland />
      {!isLessonRunning && <Navbar />}

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!isFocusMode && <Sidebar />}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-x-hidden pb-24 lg:pb-8">
          <Routes>
            <Route path="/" element={<LearningHome />} />
            <Route path="/lesson/:lessonId" element={<LessonRunner />} />
            <Route path="/flashcards" element={<Learn />} />
            <Route path="/learn" element={<Navigate to="/" replace />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mock-test" element={<MockTest />} />
            <Route path="/arena" element={<Navigate to="/mock-test" replace />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/plan" element={<StudyPlan />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isFocusMode && <RightSidebar />}
      </div>

      {!isLessonRunning && <MobileNav />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
