import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import IssueCard from '../../components/IssueCard';
import { getIssuesByUser, normaliseIssue } from '../../api/issuesApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';

const STATUSES = ['ALL','REPORTED','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'];

const toCardShape = (i) => ({
  id:              i.issueId,
  title:           i.title,
  description:     i.description,
  category:        i.categoryName || i.category?.name || '—',
  status:          i.status,
  priority:        i.priority || 'MEDIUM',
  zone:            i.locationType || '—',
  createdAt:       i.createdAt?.substring(0,10) || '',
  assignedOfficer: i.assignedOfficerName || i.assignedOfficer?.name || null,
  attachments:     0,
  updates:         0,
});

export default function CitizenIssues() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [rawIssues, setRawIssues] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('ALL');

  useEffect(() => {
    if (!user?.userId) return;
    getIssuesByUser(user.userId)
      .then(data => setRawIssues(data.map(normaliseIssue)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const issues   = rawIssues.map(toCardShape);
  const filtered = issues.filter(i => {
    const matchStatus = status === 'ALL' || i.status === status;
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout>
      <Topbar
        title="My Issues"
        subtitle={`${rawIssues.length} total issues reported`}
        action={{ label:'Report Issue', onClick:()=>navigate('/citizen/report') }}
      />
      <div className="p-8 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search issues..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${status===s?'bg-civic-500 text-white shadow-sm':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {s.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-3">
            {filtered.map(issue => <IssueCard key={issue.id} issue={issue} />)}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-syne font-bold text-gray-900 mb-1">No issues found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}