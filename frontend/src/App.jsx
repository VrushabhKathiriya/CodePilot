import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import VerifyOTPPage      from './pages/VerifyOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import DashboardPage      from './pages/DashboardPage';
import AnalyticsPage      from './pages/AnalyticsPage';
import AICoachPage        from './pages/AICoachPage';
import RecommendationsPage from './pages/RecommendationsPage';
import PortfolioPage      from './pages/PortfolioPage';
import ProfilePage        from './pages/ProfilePage';
import CareerPage         from './pages/CareerPage';
import SettingsPage       from './pages/SettingsPage';

// Guards
import ProtectedRoute from './components/shared/ProtectedRoute';
import { PageSpinner } from './components/ui/Spinner';

// Auth bootstrap
import { useAuth } from './hooks/useAuth';

function AuthBootstrap({ children }) {
  const { refreshMe, isLoading } = useAuth();

  useEffect(() => {
    refreshMe();
  }, []);

  if (isLoading) return <PageSpinner message="Starting CodePilot…" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/"                    element={<LandingPage />} />
            <Route path="/login"               element={<LoginPage />} />
            <Route path="/register"            element={<RegisterPage />} />
            <Route path="/verify-otp"          element={<VerifyOTPPage />} />
            <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
            <Route path="/reset-password"      element={<ResetPasswordPage />} />
            <Route path="/portfolio/:username" element={<PortfolioPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"       element={<DashboardPage />} />
              <Route path="/analytics"       element={<AnalyticsPage />} />
              <Route path="/ai-coach"        element={<AICoachPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/profile"         element={<ProfilePage />} />
              <Route path="/career"          element={<CareerPage />} />
              <Route path="/settings"        element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
