import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import IssueCard from '../../components/IssueCard';
import { getIssuesByUser, normaliseIssue } from '../../api/issuesApi';
import { FileText, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

const toCardShape = (i) => ({
  id:              i.issueId,
  title:           i.title,
  description:     i.description,
  category:        i.categoryName || i.category?.name || '—',
  status:          i.status,
  priority:        i.priority || 'MEDIUM',
  zone:            i.locationType || '—',
  createdAt:       i.createdAt?.substring(0, 10) || '',
  assignedOfficer: i.assignedOfficerName || i.assignedOfficer?.name || null,
  attachments:     0,
  updates:         0,
});

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    getIssuesByUser(user.userId)
      .then(data => setIssues(data.map(normaliseIssue)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const resolved   = issues.filter(i => ['RESOLVED','CLOSED'].includes(i.status)).length;
  const inProgress = issues.filter(i => ['IN_PROGRESS','ASSIGNED'].includes(i.status)).length;
  const pending    = issues.filter(i => i.status === 'REPORTED').length;

  const stats = [
    { label:'Total Issues', value:issues.length, icon:FileText,    color:'civic' },
    { label:'Resolved',     value:resolved,      icon:CheckCircle, color:'civic', trendValue:issues.length?Math.round((resolved/issues.length)*100):0, trend:'up' },
    { label:'In Progress',  value:inProgress,    icon:Clock,       color:'purple' },
    { label:'Pending',      value:pending,       icon:AlertCircle, color:'amber'  },
  ];

  return (
    <DashboardLayout>
      <Topbar
        title={`Welcome, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's an overview of your civic issues"
        action={{ label:'Report Issue', onClick:()=>navigate('/citizen/report') }}
      />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-lg text-gray-900">Recent Issues</h2>
            <button onClick={() => navigate('/citizen/issues')} className="text-sm text-civic-600 font-semibold hover:text-civic-700">View all →</button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
          ) : issues.length > 0 ? (
            <div className="grid gap-3">
              {issues.slice(0,4).map(i => <IssueCard key={i.issueId} issue={toCardShape(i)} />)}
            </div>
          ) : (
            <div className="card p-10 text-center text-gray-400">No issues reported yet.</div>
          )}
        </div>
        <div className="card p-6 bg-civic-50 border-civic-100">
          <h3 className="font-syne font-bold text-gray-900 mb-3">💡 Tips for better issue resolution</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><span className="text-civic-500 mt-0.5">✓</span><span>Add clear photos of the issue to speed up verification</span></li>
            <li className="flex items-start gap-2"><span className="text-civic-500 mt-0.5">✓</span><span>Provide exact location details including landmarks</span></li>
            <li className="flex items-start gap-2"><span className="text-civic-500 mt-0.5">✓</span><span>Select the correct category for faster department assignment</span></li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}