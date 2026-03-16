import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getAllIssues, assignIssue, normaliseIssue } from '../../api/issuesApi';
import { getAllDepartments } from '../../api/departmentsApi';
import { getUsersByRole } from '../../api/userApi';
import { Search, UserPlus, X, Loader, CheckCircle } from 'lucide-react';

const statusStyles = {
  REPORTED:    'bg-blue-50 text-blue-700',
  ASSIGNED:    'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-purple-50 text-purple-700',
  RESOLVED:    'bg-green-50 text-green-700',
  CLOSED:      'bg-gray-100 text-gray-600',
};
const priorityStyles = {
  HIGH:   'bg-red-50 text-red-700',
  MEDIUM: 'bg-orange-50 text-orange-700',
  LOW:    'bg-green-50 text-green-700',
};

export default function AdminIssues() {
  const [issues, setIssues]           = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal]             = useState(null);
  const [assignForm, setAssignForm]   = useState({ departmentId: '', officerId: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    Promise.all([getAllIssues(), getAllDepartments(), getUsersByRole('OFFICER')])
      .then(([issuesData, deptsData, officersData]) => {
        setIssues(issuesData.map(normaliseIssue));
        setDepartments(deptsData);
        setOfficers(officersData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = issues.filter(i => {
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await assignIssue({
        issueId:      modal.issueId,
        departmentId: parseInt(assignForm.departmentId),
        officerId:    parseInt(assignForm.officerId),
      });
      const norm = normaliseIssue(updated);
      setIssues(issues.map(i => i.issueId === norm.issueId ? norm : i));
      setDone(true);
      setTimeout(() => {
        setModal(null); setDone(false);
        setAssignForm({ departmentId: '', officerId: '' });
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <Topbar title="All Issues" subtitle={`${issues.length} total issues`} />
      <div className="p-8 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search issues..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-civic-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {s.replace('_', ' ')}
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
                  {['ID', 'Title', 'Category', 'Priority', 'Status', 'Zone', 'Officer', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(issue => (
                  <tr key={issue.issueId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-gray-400">#{issue.issueId}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 max-w-44 truncate">{issue.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{issue.createdAt?.substring(0, 10)}</p>
                    </td>
                    {/* ✅ Use categoryName (flat field) */}
                    <td className="px-5 py-4 text-sm text-gray-600">{issue.categoryName || issue.category?.name || '—'}</td>
                    <td className="px-5 py-4">
                      {issue.priority && <span className={`badge ${priorityStyles[issue.priority]}`}>{issue.priority}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${statusStyles[issue.status] || ''}`}>{issue.status?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{issue.locationType || '—'}</td>
                    {/* ✅ Use assignedOfficerName (flat field) */}
                    <td className="px-5 py-4 text-xs text-gray-500">{issue.assignedOfficerName || issue.assignedOfficer?.name || '—'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setModal(issue)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-civic-600 bg-civic-50 hover:bg-civic-100 px-3 py-1.5 rounded-lg transition-all">
                        <UserPlus className="w-3.5 h-3.5" />
                        {issue.assignedOfficerName ? 'Reassign' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-syne font-bold text-gray-900">Assign Issue</h3>
                <p className="text-xs text-gray-500 mt-0.5">#{modal.issueId} · {modal.title?.slice(0, 40)}</p>
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            {done ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Issue Assigned!</p>
              </div>
            ) : (
              <form onSubmit={handleAssign} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <select value={assignForm.departmentId}
                    onChange={e => setAssignForm({ ...assignForm, departmentId: e.target.value })}
                    className="input-field" required>
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Officer</label>
                  <select value={assignForm.officerId}
                    onChange={e => setAssignForm({ ...assignForm, officerId: e.target.value })}
                    className="input-field" required>
                    <option value="">Select officer...</option>
                    {officers.map(o => <option key={o.userId} value={o.userId}>{o.name} — {o.department?.departmentName || '—'}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : 'Assign Issue'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}