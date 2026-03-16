import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getAllNotifications, broadcastNotification, createNotification } from '../../api/notificationsApi';
import { getAllUsers } from '../../api/userApi';
import { Send, Bell, AlertCircle, Info, CheckCircle, Loader, Users, User, Radio, ChevronDown, ChevronUp } from 'lucide-react';

const typeConfig = {
  ASSIGNMENT:    { icon: Bell,        color: 'text-amber-600',  bg: 'bg-amber-50'  },
  RESOLVED:      { icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50'  },
  UPDATE:        { icon: Info,        color: 'text-blue-600',   bg: 'bg-blue-50'   },
  SYSTEM_UPDATE: { icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ISSUE_RESOLVED:{ icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50'  },
};

const roleColors = {
  CITIZEN: 'bg-green-100 text-green-700',
  OFFICER: 'bg-blue-100 text-blue-700',
  ADMIN:   'bg-purple-100 text-purple-700',
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [mode, setMode]                   = useState('broadcast'); // 'broadcast' | 'individual'

  // Broadcast form
  const [broadcastForm, setBroadcastForm] = useState({ type: 'SYSTEM_UPDATE', message: '', targetRoles: [] });
  const [sending, setSending]             = useState(false);
  const [sent, setSent]                   = useState(false);

  // Individual form
  const [indivForm, setIndivForm]     = useState({ userId: '', type: 'UPDATE', message: '' });
  const [indivSending, setIndivSending] = useState(false);
  const [indivSent, setIndivSent]     = useState(false);

  // User search
  const [userSearch, setUserSearch]   = useState('');
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    Promise.all([getAllNotifications(), getAllUsers()])
      .then(([notifs, usrs]) => { setNotifications(notifs); setUsers(usrs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = (role) => {
    setBroadcastForm(f => ({
      ...f,
      targetRoles: f.targetRoles.includes(role)
        ? f.targetRoles.filter(r => r !== role)
        : [...f.targetRoles, role],
    }));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await broadcastNotification(broadcastForm);
      const updated = await getAllNotifications();
      setNotifications(updated);
      setSent(true);
      setTimeout(() => { setSent(false); setBroadcastForm({ type: 'SYSTEM_UPDATE', message: '', targetRoles: [] }); }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast.');
    } finally {
      setSending(false);
    }
  };

  const handleIndividual = async (e) => {
    e.preventDefault();
    if (!indivForm.userId) { alert('Please select a user.'); return; }
    setIndivSending(true);
    try {
      await createNotification({
        userId:  parseInt(indivForm.userId),
        type:    indivForm.type,
        message: indivForm.message,
      });
      const updated = await getAllNotifications();
      setNotifications(updated);
      setIndivSent(true);
      setTimeout(() => { setIndivSent(false); setIndivForm({ userId: '', type: 'UPDATE', message: '' }); setUserSearch(''); }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setIndivSending(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = users.find(u => String(u.userId) === String(indivForm.userId));

  return (
    <DashboardLayout>
      <Topbar title="Notifications" subtitle="Broadcast and manage system notifications" />
      <div className="p-8 space-y-6">

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
          <button
            onClick={() => setMode('broadcast')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'broadcast' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <Radio className="w-4 h-4" /> Broadcast
          </button>
          <button
            onClick={() => setMode('individual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'individual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <User className="w-4 h-4" /> Individual
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Left panel — form */}
          <div className="card p-6">

            {/* ── BROADCAST ── */}
            {mode === 'broadcast' && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-civic-50 rounded-xl flex items-center justify-center">
                    <Radio className="w-5 h-5 text-civic-600" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-gray-900">Broadcast Notification</h3>
                    <p className="text-xs text-gray-400">Send to all users of selected roles</p>
                  </div>
                </div>
                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Type</label>
                    <select value={broadcastForm.type}
                      onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                      className="input-field">
                      <option value="SYSTEM_UPDATE">📢 System Update</option>
                      <option value="UPDATE">ℹ️ General Update</option>
                      <option value="ASSIGNMENT">📋 Assignment</option>
                      <option value="RESOLVED">✅ Resolution</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea value={broadcastForm.message}
                      onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="Write your broadcast message here..."
                      rows={4} className="input-field resize-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles</label>
                    <div className="flex gap-2">
                      {['CITIZEN', 'OFFICER', 'ADMIN'].map(role => (
                        <button key={role} type="button" onClick={() => toggleRole(role)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border-2 ${broadcastForm.targetRoles.includes(role) ? 'border-civic-400 bg-civic-500 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-civic-200'}`}>
                          <Users className="w-3 h-3" />{role}
                        </button>
                      ))}
                    </div>
                    {broadcastForm.targetRoles.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1.5">⚠️ Select at least one role</p>
                    )}
                    {broadcastForm.targetRoles.length > 0 && (
                      <p className="text-xs text-civic-600 mt-1.5">
                        Will notify all {broadcastForm.targetRoles.join(', ')} users
                      </p>
                    )}
                  </div>
                  <button type="submit" disabled={sending || broadcastForm.targetRoles.length === 0}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${sent ? 'bg-green-500 text-white' : 'btn-primary'} disabled:opacity-50`}>
                    {sending ? <Loader className="w-4 h-4 animate-spin" />
                      : sent ? <><CheckCircle className="w-4 h-4" /> Sent to all!</>
                      : <><Send className="w-4 h-4" /> Broadcast</>}
                  </button>
                </form>
              </>
            )}

            {/* ── INDIVIDUAL ── */}
            {mode === 'individual' && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-gray-900">Send to Individual</h3>
                    <p className="text-xs text-gray-400">Send a private notification to one user</p>
                  </div>
                </div>
                <form onSubmit={handleIndividual} className="space-y-4">
                  {/* User picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Select User</label>
                    <div className="relative">
                      <div
                        onClick={() => setShowUserList(!showUserList)}
                        className="input-field flex items-center justify-between cursor-pointer">
                        {selectedUser ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-civic-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{selectedUser.name[0]}</div>
                            <span className="text-sm text-gray-900">{selectedUser.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColors[selectedUser.role]}`}>{selectedUser.role}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Search and select a user...</span>
                        )}
                        {showUserList ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>

                      {showUserList && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              type="text"
                              value={userSearch}
                              onChange={e => setUserSearch(e.target.value)}
                              placeholder="Search by name or email..."
                              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-civic-400"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredUsers.map(u => (
                              <button key={u.userId} type="button"
                                onClick={() => { setIndivForm({ ...indivForm, userId: u.userId }); setShowUserList(false); setUserSearch(''); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors">
                                <div className="w-8 h-8 bg-civic-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u.name[0]}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${roleColors[u.role]}`}>{u.role}</span>
                              </button>
                            ))}
                            {filteredUsers.length === 0 && (
                              <p className="text-sm text-gray-400 text-center py-4">No users found</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Type</label>
                    <select value={indivForm.type}
                      onChange={e => setIndivForm({ ...indivForm, type: e.target.value })}
                      className="input-field">
                      <option value="UPDATE">ℹ️ General Update</option>
                      <option value="ASSIGNMENT">📋 Assignment Notice</option>
                      <option value="RESOLVED">✅ Resolution Notice</option>
                      <option value="SYSTEM_UPDATE">📢 System Update</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea value={indivForm.message}
                      onChange={e => setIndivForm({ ...indivForm, message: e.target.value })}
                      placeholder={selectedUser ? `Write a message for ${selectedUser.name}...` : 'Select a user first, then write your message...'}
                      rows={4} className="input-field resize-none" required />
                  </div>

                  <button type="submit" disabled={indivSending || !indivForm.userId}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${indivSent ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} disabled:opacity-50`}>
                    {indivSending ? <Loader className="w-4 h-4 animate-spin" />
                      : indivSent ? <><CheckCircle className="w-4 h-4" /> Sent!</>
                      : <><Send className="w-4 h-4" /> Send to {selectedUser?.name || 'User'}</>}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Right panel — all notifications */}
          <div className="card p-6">
            <h3 className="font-syne font-bold text-gray-900 mb-5">
              All Notifications ({notifications.length})
            </h3>
            {loading ? (
              <div className="flex justify-center py-8"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {notifications.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No notifications yet.</p>}
                {notifications.map(n => {
                  const config = typeConfig[n.type] || typeConfig.UPDATE;
                  const Icon   = config.icon;
                  return (
                    <div key={n.notificationId}
                      className={`flex items-start gap-3 p-3 rounded-xl ${!n.isRead ? 'bg-civic-50 border border-civic-100' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400">{n.createdAt?.replace('T',' ').substring(0,16)}</p>
                          {n.user && <span className="text-xs text-gray-400">→ {n.user?.name || n.userId}</span>}
                        </div>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 bg-civic-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}