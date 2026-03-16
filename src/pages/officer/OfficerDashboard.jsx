import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import IssueCard from '../../components/IssueCard';
import { getAllIssues, getIssuesByDepartment, normaliseIssue } from '../../api/issuesApi';
import { ClipboardList, CheckCircle, Clock, TrendingUp, Loader } from 'lucide-react';

const toCardShape = (i) => ({
  id:              i.issueId,
  title:           i.title,
  description:     i.description,
  category:        i.categoryName || i.category?.name || '—',
  status:          i.status,
  priority:        i.priority || 'MEDIUM',
  zone:            i.locationType || '—',
  createdAt:       i.createdAt?.substring(0,10) || '',
  assignedOfficer: i.assignedOfficerName || null,
  attachments: 0, updates: 0,
});

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let data = [];
        if (user?.department?.departmentId) {
          data = await getIssuesByDepartment(user.department.departmentId);
        } else {
          const all = await getAllIssues();
          data = all.filter(i => String(i.assignedOfficerId) === String(user?.userId));
        }
        setIssues(data.map(normaliseIssue));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.userId]);

  const assigned   = issues.filter(i => !['CLOSED','RESOLVED'].includes(i.status));
  const resolved   = issues.filter(i => ['RESOLVED','CLOSED'].includes(i.status));
  const inProgress = issues.filter(i => i.status === 'IN_PROGRESS');

  const stats = [
    { label:'Assigned Issues',     value:assigned.length,   icon:ClipboardList, color:'blue'   },
    { label:'Resolved This Month', value:resolved.length,   icon:CheckCircle,   color:'civic', trend:'up', trendValue:12 },
    { label:'In Progress',         value:inProgress.length, icon:Clock,         color:'purple' },
    { label:'Avg. Resolution',     value:'3.8', suffix:'d', icon:TrendingUp,    color:'amber'  },
  ];

  return (
    <DashboardLayout>
      <Topbar title="Officer Dashboard" subtitle={`${user?.department?.departmentName||'Department'} — ${user?.zone||''}`} />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-lg text-gray-900">Assigned to Me</h2>
            <button onClick={() => navigate('/officer/issues')} className="text-sm text-civic-600 font-semibold hover:text-civic-700">View all →</button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
          ) : assigned.length > 0 ? (
            <div className="grid gap-3">
              {assigned.slice(0,3).map(i => <IssueCard key={i.issueId} issue={toCardShape(i)} />)}
            </div>
          ) : (
            <div className="card p-10 text-center text-gray-400">No issues assigned yet.</div>
          )}
        </div>
        {assigned.filter(i => i.priority==='HIGH').length > 0 && (
          <div className="card p-5 bg-red-50 border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><span className="text-xl">🚨</span></div>
              <div>
                <h3 className="font-syne font-bold text-red-900 text-sm">{assigned.filter(i=>i.priority==='HIGH').length} High Priority Issues Pending</h3>
                <p className="text-red-700 text-xs mt-0.5">These issues require immediate attention.</p>
              </div>
              <button onClick={() => navigate('/officer/issues')} className="ml-auto bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-600">View Now</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}