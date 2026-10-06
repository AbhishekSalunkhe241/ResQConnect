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
import NotFound from '../pages/NotFound';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import RequestHelp from '../pages/citizen/RequestHelp';
import MyRequests from '../pages/citizen/MyRequests';
import RequestDetails from '../pages/citizen/RequestDetails';
import Notifications from '../pages/citizen/Notifications';
import Profile from '../pages/citizen/Profile';

// Placeholder Pages (Day 2/3 Modules)
import VolunteerPlaceholder from '../pages/VolunteerPlaceholder';
import NGOPlaceholder from '../pages/NGOPlaceholder';
import AdminPlaceholder from '../pages/AdminPlaceholder';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages wrapped in PublicLayout (Navbar + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Placeholders for upcoming modules */}
        <Route path="/volunteer" element={<VolunteerPlaceholder />} />
        <Route path="/ngo" element={<NGOPlaceholder />} />
        <Route path="/admin" element={<AdminPlaceholder />} />

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
    </Routes>
  );
};

export default AppRoutes;
