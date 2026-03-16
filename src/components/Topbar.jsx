import { useState, useEffect } from 'react';
import { Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUnreadNotifications } from '../api/notificationsApi';

export default function Topbar({ title, subtitle, action }) {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user?.userId) return;
    getUnreadNotifications(user.userId)
      .then((data) => setUnread(data.length))
      .catch(() => setUnread(0));
  }, [user?.userId]);

  const notifPath = `/${user?.role?.toLowerCase()}/notifications`;

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-syne font-bold text-xl text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        )}
        <button
          onClick={() => navigate(notifPath)}
          className="relative w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
        <div className="w-9 h-9 bg-civic-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.[0]}
        </div>
      </div>
    </div>
  );
}