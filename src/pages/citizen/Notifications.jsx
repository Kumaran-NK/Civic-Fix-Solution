import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getNotificationsByUser, markNotificationAsRead } from '../../api/notificationsApi';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle, Loader } from 'lucide-react';

const typeConfig = {
  ASSIGNMENT:    { icon: Bell,         color: 'text-amber-600',  bg: 'bg-amber-50'  },
  RESOLVED:      { icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50'  },
  UPDATE:        { icon: Info,         color: 'text-blue-600',   bg: 'bg-blue-50'   },
  SYSTEM_UPDATE: { icon: AlertCircle,  color: 'text-purple-600', bg: 'bg-purple-50' },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    getNotificationsByUser(user.userId)
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markNotificationAsRead(n.notificationId)));
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id) => {
    await markNotificationAsRead(id).catch(console.error);
    setNotifications(notifications.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout>
      <Topbar title="Notifications" subtitle={`${unread} unread`} />
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="w-6 h-6 animate-spin text-civic-500" />
            </div>
          ) : (
            <>
              {unread > 0 && (
                <div className="flex justify-end">
                  <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-civic-600 font-semibold hover:text-civic-700">
                    <CheckCheck className="w-4 h-4" />Mark all as read
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <div className="card p-16 text-center">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const config = typeConfig[n.type] || typeConfig.UPDATE;
                  const Icon = config.icon;
                  return (
                    <div
                      key={n.notificationId}
                      onClick={() => !n.isRead && markRead(n.notificationId)}
                      className={`card p-5 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all duration-200 ${!n.isRead ? 'border-civic-200 bg-civic-50/30' : ''}`}
                    >
                      <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {n.createdAt?.replace('T', ' ').substring(0, 16)}
                        </p>
                      </div>
                      {!n.isRead && <div className="w-2.5 h-2.5 bg-civic-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}