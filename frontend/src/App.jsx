import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PoliciesPage from './pages/PoliciesPage';
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import ClaimIntakePage from './pages/ClaimIntakePage';
import ClaimsAdjudicationPage from './pages/ClaimsAdjudicationPage';
import DisbursementsPage from './pages/DisbursementsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function AppLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page) => {
    if (page === 'dashboard') {
      if (user?.role === 'ROLE_POLICYHOLDER') {
        navigate('/policyholder');
      } else {
        navigate('/dashboard');
      }
    } else if (page === 'policyholder') {
      navigate('/policyholder');
    } else if (page === 'landing') {
      navigate('/');
    } else {
      navigate('/' + page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current active page identifier for navbar highlighting
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard' || path === '/policyholder') return 'dashboard';
    if (path.startsWith('/policies')) return 'policies';
    if (path.startsWith('/assessments')) return 'assessments';
    if (path.startsWith('/claim-intake') || path.startsWith('/file-claim')) return 'claim-intake';
    if (path.startsWith('/adjudication')) return 'adjudication';
    if (path.startsWith('/disbursements') || path.startsWith('/payouts')) return 'disbursements';
    if (path.startsWith('/analytics') || path.startsWith('/reports')) return 'analytics';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return 'dashboard';
  };

  const getDefaultRedirect = () => {
    if (user?.role === 'ROLE_POLICYHOLDER') return '/policyholder';
    return '/dashboard';
  };

  const isStaff = user && ['ROLE_UNDERWRITER', 'ROLE_CLAIMS_ADJUSTER', 'ROLE_INSURANCE_MANAGER'].includes(user.role);
  const isAuthPage = isAuthenticated && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Navbar
          onNavigate={handleNavigate}
          currentPage={getActiveTab()}
        />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            ...(isStaff && isAuthPage ? {
              backgroundImage: "url('/bg%20image.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundAttachment: 'fixed',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#eaf4fe',
              minHeight: 'calc(100vh - 68px)'
            } : {})
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to={getDefaultRedirect()} replace />
                ) : (
                  <LandingPage onNavigate={handleNavigate} />
                )
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to={getDefaultRedirect()} replace />
                ) : (
                  <LoginPage onNavigate={handleNavigate} />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to={getDefaultRedirect()} replace />
                ) : (
                  <RegisterPage onNavigate={handleNavigate} />
                )
              }
            />

            {/* Authenticated / Dashboard Routes */}
            <Route
              path="/policyholder"
              element={
                isAuthenticated ? (
                  <DashboardPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <DashboardPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/policies"
              element={
                isAuthenticated ? (
                  <PoliciesPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/assessments"
              element={
                isAuthenticated ? (
                  <RiskAssessmentPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/claim-intake"
              element={
                isAuthenticated ? (
                  <ClaimIntakePage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/file-claim"
              element={
                isAuthenticated ? (
                  <ClaimIntakePage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/adjudication"
              element={
                isAuthenticated ? (
                  <ClaimsAdjudicationPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/disbursements"
              element={
                isAuthenticated ? (
                  <DisbursementsPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/payouts"
              element={
                isAuthenticated ? (
                  <DisbursementsPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/analytics"
              element={
                isAuthenticated ? (
                  <AnalyticsPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/reports"
              element={
                isAuthenticated ? (
                  <AnalyticsPage onNavigate={handleNavigate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? getDefaultRedirect() : '/'} replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
