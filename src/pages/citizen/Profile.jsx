import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { User, Mail, Phone, MapPin, Lock, Save, Loader } from 'lucide-react';

// NOTE: Backend does not currently expose a PUT /api/users/:id endpoint in the shared
// controllers. Profile save is handled client-side (updates local AuthContext state).
// When you add a profile-update endpoint on the backend, replace the setTimeout below
// with an axiosInstance.put('/api/users/:id', form) call.

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    zone:  user?.zone  || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // Optimistic local update — replace with API call when endpoint is available
    setTimeout(() => {
      login({ ...user, ...form }, localStorage.getItem('token'));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  const roleColor = user?.role === 'ADMIN'   ? 'bg-purple-100 text-purple-700'
    : user?.role === 'OFFICER' ? 'bg-blue-100 text-blue-700'
    : 'bg-civic-100 text-civic-700';

  return (
    <DashboardLayout>
      <Topbar title="Profile" subtitle="Manage your account information" />
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Avatar section */}
          <div className="card p-6 flex items-center gap-5">
            <div className="w-16 h-16 bg-civic-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl font-syne flex-shrink-0">
              {user?.name?.[0]}
            </div>
            <div>
              <h2 className="font-syne font-bold text-lg text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className={`badge mt-1 ${roleColor}`}>{user?.role}</span>
            </div>
          </div>

          {/* Personal info */}
          <div className="card p-6">
            <h3 className="font-syne font-bold text-base text-gray-900 mb-5">Personal Information</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Zone</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} className="input-field pl-9" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="card p-6">
            <h3 className="font-syne font-bold text-base text-gray-900 mb-5">Change Password</h3>
            <div className="space-y-4">
              {[
                { label: 'Current Password',     key: 'current' },
                { label: 'New Password',          key: 'newPw'   },
                { label: 'Confirm New Password',  key: 'confirm' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={pwForm[key]}
                      onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                      placeholder="••••••••" className="input-field pl-9" />
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <button className="btn-secondary">Update Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}