import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts (loaded synchronously to preserve framing & navigation structure)
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages (Code-split for performance)
const Landing = lazy(() => import('../pages/Landing'));
const HowItWorks = lazy(() => import('../pages/HowItWorks'));
const Recovery = lazy(() => import('../pages/Recovery'));
const About = lazy(() => import('../pages/About'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Analytics = lazy(() => import('../pages/Analytics'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Citizen Pages (Lazy Loaded)
const CitizenDashboard = lazy(() => import('../pages/citizen/CitizenDashboard'));
const RequestHelp = lazy(() => import('../pages/citizen/RequestHelp'));
const MyRequests = lazy(() => import('../pages/citizen/MyRequests'));
const RequestDetails = lazy(() => import('../pages/citizen/RequestDetails'));
const Notifications = lazy(() => import('../pages/citizen/Notifications'));
const Profile = lazy(() => import('../pages/citizen/Profile'));

// Module Dashboards (Lazy Loaded)
const VolunteerDashboard = lazy(() => import('../pages/volunteer/VolunteerDashboard'));
const NGODashboard = lazy(() => import('../pages/ngo/NGODashboard'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));

// Accessible, lightweight page loading fallback
const PageLoader = () => (
  <div
    role="status"
    aria-label="Loading page content"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '2rem',
      gap: '1rem',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        border: '3px solid var(--border-subtle, rgba(0,0,0,0.1))',
        borderTopColor: 'var(--color-primary-main, #2563EB)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', margin: 0 }}>
      Loading workspace...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Pages wrapped in PublicLayout (Navbar + Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Citizen Dashboard Routes wrapped in DashboardLayout (Sidebar + Top bar) */}
        <Route path="/citizen" element={<DashboardLayout />}>
          <Route index element={<CitizenDashboard />} />
          <Route path="request-help" element={<RequestHelp />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="requests/:id" element={<RequestDetails />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Volunteer Dashboard Routes wrapped in DashboardLayout */}
        <Route path="/volunteer" element={<DashboardLayout />}>
          <Route index element={<VolunteerDashboard />} />
          <Route path="*" element={<VolunteerDashboard />} />
        </Route>

        {/* NGO Dashboard Routes wrapped in DashboardLayout */}
        <Route path="/ngo" element={<DashboardLayout />}>
          <Route index element={<NGODashboard />} />
          <Route path="*" element={<NGODashboard />} />
        </Route>

        {/* Admin Dashboard Routes wrapped in DashboardLayout */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
