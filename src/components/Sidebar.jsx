import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Bell, User, LogOut,
  Users, Building2, Tag, BarChart3,
  ClipboardList, CheckCircle, ChevronRight, Wrench, Rss
} from 'lucide-react';

const feedItem = { icon: Rss, label: 'Civic Feed', path: '/feed' };

const citizenNav = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/citizen' },
  { icon: FileText,        label: 'My Issues',       path: '/citizen/issues' },
  { icon: FileText,        label: 'Report Issue',    path: '/citizen/report' },
  feedItem,
  { icon: Bell,            label: 'Notifications',   path: '/citizen/notifications' },
  { icon: User,            label: 'Profile',         path: '/citizen/profile' },
];

const officerNav = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/officer' },
  { icon: ClipboardList,   label: 'Assigned Issues', path: '/officer/issues' },
  { icon: CheckCircle,     label: 'Resolved Issues', path: '/officer/resolved' },
  feedItem,
  { icon: Bell,            label: 'Notifications',   path: '/officer/notifications' },
  { icon: User,            label: 'Profile',         path: '/officer/profile' },
];

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/admin' },
  { icon: FileText,        label: 'All Issues',   path: '/admin/issues' },
  { icon: Users,           label: 'Users',        path: '/admin/users' },
  { icon: Building2,       label: 'Departments',  path: '/admin/departments' },
  { icon: Tag,             label: 'Categories',   path: '/admin/categories' },
  { icon: BarChart3,       label: 'Analytics',    path: '/admin/analytics' },
  feedItem,
  { icon: Bell,            label: 'Notifications',path: '/admin/notifications' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user?.role === 'ADMIN' ? adminNav
    : user?.role === 'OFFICER' ? officerNav
    : citizenNav;

  const roleColor = user?.role === 'ADMIN'   ? 'bg-purple-100 text-purple-700'
    : user?.role === 'OFFICER' ? 'bg-blue-100 text-blue-700'
    : 'bg-civic-100 text-civic-700';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-civic-500 rounded-xl flex items-center justify-center shadow-md">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-syne font-bold text-lg leading-none text-gray-900">CivicFix</h1>
            <p className="text-xs text-gray-400 mt-0.5">Municipal Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4">
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ml-2 flex-shrink-0 ${roleColor}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          const isFeed = path === '/feed';
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`sidebar-item w-full ${active ? 'active' : 'text-gray-600'} ${isFeed && !active ? 'border border-dashed border-civic-200 text-civic-600 hover:bg-civic-50 hover:text-civic-700' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {isFeed && !active && (
                <span className="text-xs bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
                  LIVE
                </span>
              )}
              {active && <ChevronRight className="w-4 h-4 opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}