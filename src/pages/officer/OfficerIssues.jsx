import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getAllIssues, getIssuesByDepartment, normaliseIssue } from '../../api/issuesApi';
import { addIssueUpdate, uploadAttachments } from '../../api/issueUpdatesApi';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../api/userApi';
import { Search, MessageSquare, X, Loader, CheckCircle, RefreshCw, Upload, Paperclip } from 'lucide-react';

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

export default function OfficerIssues() {
  const { user } = useAuth();
  const [issues, setIssues]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus]     = useState('ALL');
  const [modal, setModal]                   = useState(null);
  const [updateForm, setUpdateForm]         = useState({ message: '', statusAfterUpdate: 'IN_PROGRESS' });
  const [resolveFiles, setResolveFiles]     = useState([]);
  const [submitting, setSubmitting]         = useState(false);
  const [done, setDone]                     = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      // Strategy 1: fetch full user profile to get department
      let fullUser = user;
      try {
        fullUser = await getUserById(user.userId);
      } catch { /* use existing user */ }

      let data = [];

      if (fullUser?.department?.departmentId) {
        // Fetch by department
        data = await getIssuesByDepartment(fullUser.department.departmentId);
      } else {
        // Fallback: get all and match by officerId (as string comparison)
        const all = await getAllIssues();
        data = all.filter(i =>
          String(i.assignedOfficerId) === String(user?.userId) ||
          String(i.assignedOfficer?.userId) === String(user?.userId)
        );
      }

      setIssues(data.map(normaliseIssue));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, [user?.userId]);

  const filtered = issues.filter(i => {
    const matchP = filterPriority === 'ALL' || i.priority === filterPriority;
    const matchS = filterStatus   === 'ALL' || i.status   === filterStatus;
    const matchQ = i.title.toLowerCase().includes(search.toLowerCase());
    return matchP && matchS && matchQ;
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Add the text update + status change
      await addIssueUpdate({
        issueId:           modal.issueId,
        updatedById:       user.userId,
        message:           updateForm.message,
        statusAfterUpdate: updateForm.statusAfterUpdate,
      });

      // 2. Upload resolution attachments if any
      if (resolveFiles.length > 0) {
        await uploadAttachments(modal.issueId, resolveFiles);
      }

      setDone(true);
      await fetchIssues();
      setTimeout(() => {
        setModal(null);
        setDone(false);
        setUpdateForm({ message: '', statusAfterUpdate: 'IN_PROGRESS' });
        setResolveFiles([]);
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <Topbar title="Assigned Issues" subtitle={`${filtered.length} issues`} />
      <div className="p-8 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search issues..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <button onClick={fetchIssues}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-civic-50 hover:border-civic-200 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <div className="flex items-center gap-2">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button key={p} onClick={() => setFilterPriority(p)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterPriority === p ? 'bg-civic-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterStatus === s ? 'bg-civic-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-gray-400 font-medium">No issues assigned yet.</p>
            <p className="text-xs text-gray-300 mt-1">Ask admin to assign issues to your department or click Refresh.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ID', 'Issue', 'Category', 'Priority', 'Status', 'Zone', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(issue => (
                  <tr key={issue.issueId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-gray-500">#{issue.issueId}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-52">{issue.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{issue.createdAt?.substring(0, 10)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{issue.categoryName || issue.category?.name || '—'}</td>
                    <td className="px-5 py-4">
                      {issue.priority && <span className={`badge ${priorityStyles[issue.priority]}`}>{issue.priority}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${statusStyles[issue.status] || ''}`}>{issue.status?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{issue.locationType || '—'}</td>
                    <td className="px-5 py-4">
                      {!['RESOLVED', 'CLOSED'].includes(issue.status) && (
                        <button onClick={() => { setModal(issue); setUpdateForm({ message: '', statusAfterUpdate: 'IN_PROGRESS' }); setResolveFiles([]); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-civic-600 hover:text-civic-700 bg-civic-50 hover:bg-civic-100 px-3 py-1.5 rounded-lg transition-all">
                          <MessageSquare className="w-3.5 h-3.5" />Update
                        </button>
                      )}
                      {['RESOLVED', 'CLOSED'].includes(issue.status) && (
                        <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-semibold">✓ Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update / Resolve Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-syne font-bold text-gray-900">Update Issue Status</h3>
                <p className="text-xs text-gray-500 mt-0.5">#{modal.issueId} — {modal.title?.slice(0, 45)}</p>
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            {done ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Update saved!</p>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'IN_PROGRESS', label: '🔧 In Progress', color: 'border-purple-200 bg-purple-50 text-purple-700' },
                      { value: 'RESOLVED',    label: '✅ Resolved',    color: 'border-green-200 bg-green-50 text-green-700'   },
                    ].map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setUpdateForm({ ...updateForm, statusAfterUpdate: opt.value })}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${updateForm.statusAfterUpdate === opt.value ? opt.color + ' border-2' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Progress Note *</label>
                  <textarea value={updateForm.message}
                    onChange={e => setUpdateForm({ ...updateForm, message: e.target.value })}
                    placeholder={updateForm.statusAfterUpdate === 'RESOLVED'
                      ? 'Describe how the issue was resolved...'
                      : 'Describe what work is being done...'}
                    rows={3} className="input-field resize-none" required />
                </div>

                {/* Attachments — especially useful for resolution proof */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    {updateForm.statusAfterUpdate === 'RESOLVED' ? 'Resolution Photos/Videos (Proof)' : 'Attach Photos/Videos (optional)'}
                  </label>
                  <label className="block border-2 border-dashed border-gray-200 hover:border-civic-300 rounded-xl px-4 py-3 text-center cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Click to upload images or videos</p>
                    <input type="file" multiple accept="image/*,video/*"
                      onChange={e => setResolveFiles(Array.from(e.target.files))}
                      className="hidden" />
                  </label>
                  {resolveFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resolveFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-civic-50 border border-civic-100 rounded-lg px-3 py-1.5 text-xs text-civic-700">
                          <span className="truncate max-w-28">{f.name}</span>
                          <button type="button" onClick={() => setResolveFiles(resolveFiles.filter((_, j) => j !== i))}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {updateForm.statusAfterUpdate === 'RESOLVED' && (
                    <p className="text-xs text-amber-600 mt-1.5">
                      💡 Attaching proof photos helps citizens confirm their issue is resolved
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl transition-all ${updateForm.statusAfterUpdate === 'RESOLVED' ? 'bg-green-500 hover:bg-green-600 text-white' : 'btn-primary'}`}>
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : (updateForm.statusAfterUpdate === 'RESOLVED' ? '✅ Mark Resolved' : '💾 Save Update')}
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