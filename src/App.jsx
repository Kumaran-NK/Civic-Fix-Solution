import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Shared
import CivicFeed from './pages/CivicFeed';

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenIssues from './pages/citizen/CitizenIssues';
import ReportIssue from './pages/citizen/ReportIssue';
import Notifications from './pages/citizen/Notifications';
import Profile from './pages/citizen/Profile';
import IssueDetail from './pages/citizen/IssueDetail';

// Officer pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerIssues from './pages/officer/OfficerIssues';
import OfficerResolved from './pages/officer/OfficerResolved';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Civic Feed — accessible by all logged-in roles */}
      <Route path="/feed" element={<ProtectedRoute><CivicFeed /></ProtectedRoute>} />

      {/* Issue detail */}
      <Route path="/issue/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />

      {/* Citizen */}
      <Route path="/citizen"               element={<ProtectedRoute allowedRoles={['CITIZEN']}><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/issues"        element={<ProtectedRoute allowedRoles={['CITIZEN']}><CitizenIssues /></ProtectedRoute>} />
      <Route path="/citizen/report"        element={<ProtectedRoute allowedRoles={['CITIZEN']}><ReportIssue /></ProtectedRoute>} />
      <Route path="/citizen/notifications" element={<ProtectedRoute allowedRoles={['CITIZEN']}><Notifications /></ProtectedRoute>} />
      <Route path="/citizen/profile"       element={<ProtectedRoute allowedRoles={['CITIZEN']}><Profile /></ProtectedRoute>} />

      {/* Officer */}
      <Route path="/officer"               element={<ProtectedRoute allowedRoles={['OFFICER']}><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/officer/issues"        element={<ProtectedRoute allowedRoles={['OFFICER']}><OfficerIssues /></ProtectedRoute>} />
      <Route path="/officer/resolved"      element={<ProtectedRoute allowedRoles={['OFFICER']}><OfficerResolved /></ProtectedRoute>} />
      <Route path="/officer/notifications" element={<ProtectedRoute allowedRoles={['OFFICER']}><Notifications /></ProtectedRoute>} />
      <Route path="/officer/profile"       element={<ProtectedRoute allowedRoles={['OFFICER']}><Profile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"               element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/issues"        element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminIssues /></ProtectedRoute>} />
      <Route path="/admin/users"         element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/departments"   element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDepartments /></ProtectedRoute>} />
      <Route path="/admin/categories"    element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/analytics"     element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNotifications /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}