import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Landing from '../pages/Landing';
import HowItWorks from '../pages/HowItWorks';
import Recovery from '../pages/Recovery';
import About from '../pages/About';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Analytics from '../pages/Analytics';
import NotFound from '../pages/NotFound';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import RequestHelp from '../pages/citizen/RequestHelp';
import MyRequests from '../pages/citizen/MyRequests';
import RequestDetails from '../pages/citizen/RequestDetails';
import Notifications from '../pages/citizen/Notifications';
import Profile from '../pages/citizen/Profile';

// Module Dashboards
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';
import NGODashboard from '../pages/ngo/NGODashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

export const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;
