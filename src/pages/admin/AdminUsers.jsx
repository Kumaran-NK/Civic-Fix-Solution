import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getAllUsers, deleteUser } from '../../api/userApi';
import { Search, Trash2, Edit, Shield, User, Briefcase, Loader } from 'lucide-react';

const roleConfig = {
  CITIZEN: { icon: User,     color: 'bg-green-100 text-green-700'  },
  OFFICER: { icon: Briefcase, color: 'bg-blue-100 text-blue-700'   },
  ADMIN:   { icon: Shield,   color: 'bg-purple-100 text-purple-700' },
};

export default function AdminUsers() {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('ALL');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(deleteModal.userId);
      setUsers(users.filter(u => u.userId !== deleteModal.userId));
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <Topbar title="User Management" subtitle={`${users.length} total users`} />
      <div className="p-8 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {['CITIZEN', 'OFFICER', 'ADMIN'].map(role => {
            const count  = users.filter(u => u.role === role).length;
            const config = roleConfig[role];
            const Icon   = config.icon;
            return (
              <div key={role} className="card p-5 flex items-center gap-4">
                <div className={`w-10 h-10 ${config.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-syne font-bold text-2xl text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{role.toLowerCase()}s</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <div className="flex items-center gap-2">
            {['ALL', 'CITIZEN', 'OFFICER', 'ADMIN'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${roleFilter === r ? 'bg-civic-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Email', 'Phone', 'Role', 'Zone/Dept', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => {
                  const config = roleConfig[user.role] || roleConfig.CITIZEN;
                  const Icon   = config.icon;
                  return (
                    <tr key={user.userId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-civic-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name[0]}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{user.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${config.color} flex items-center gap-1 w-fit`}>
                          <Icon className="w-3 h-3" />{user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{user.department?.departmentName || user.zone}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{user.createdAt?.substring(0, 10)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Edit className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button onClick={() => setDeleteModal(user)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-up">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-syne font-bold text-gray-900 mb-2">Delete User?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  {deleting ? <Loader className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}