import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Toaster } from './components/ui/sonner';
import { AppLoader } from './components/AppLoader';
import './App.css';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UserAnalysis = React.lazy(() => import('./pages/UserAnalysis'));
const Insights = React.lazy(() => import('./pages/Insights'));
const Simulation = React.lazy(() => import('./pages/Simulation'));
const BatchUpload = React.lazy(() => import('./pages/BatchUpload'));

const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center flex-col gap-4 py-20">
    <div className="flex gap-1 items-end h-6">
      {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-[#0875E1]"
          style={{
            animation: `loaderBar 1.1s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
    <p className="text-[13px] text-[#8898AA] font-medium">Loading view...</p>
    <style>{`
      @keyframes loaderBar {
        0%, 100% { height: 8px; opacity: 0.3; }
        50% { height: 22px; opacity: 1; }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <>
      <AppLoader />
      <Router>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="user-analysis" element={<UserAnalysis />} />
              <Route path="insights" element={<Insights />} />
              <Route path="simulation" element={<Simulation />} />
              <Route path="batch" element={<BatchUpload />} />
            </Route>
          </Routes>
        </React.Suspense>
        <Toaster position="top-center" />
      </Router>
    </>
  );
}

export default App;
