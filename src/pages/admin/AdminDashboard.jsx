import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import { getSystemStatistics } from '../../api/userApi';
import { getAllIssues, normaliseIssue } from '../../api/issuesApi';
import { Users, FileText, CheckCircle, Clock, Loader, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const statusStyles = {
  REPORTED:    'bg-blue-50 text-blue-700',
  ASSIGNED:    'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-purple-50 text-purple-700',
  RESOLVED:    'bg-green-50 text-green-700',
  CLOSED:      'bg-gray-100 text-gray-600',
};
const STATUS_COLORS = {
  REPORTED:'#3b82f6', ASSIGNED:'#f59e0b', IN_PROGRESS:'#8b5cf6', RESOLVED:'#10b981', CLOSED:'#6b7280',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSystemStatistics(), getAllIssues()])
      .then(([s, d]) => { setStats(s); setIssues(d.map(normaliseIssue)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center items-center min-h-[60vh]"><Loader className="w-8 h-8 animate-spin text-civic-500" /></div></DashboardLayout>;

  const totalIssues    = issues.length;
  const resolved       = issues.filter(i => ['RESOLVED','CLOSED'].includes(i.status)).length;
  const pending        = issues.filter(i => ['REPORTED','ASSIGNED','IN_PROGRESS'].includes(i.status)).length;
  const resolutionRate = totalIssues > 0 ? ((resolved/totalIssues)*100).toFixed(1) : 0;

  const statusCounts = issues.reduce((acc,i) => { acc[i.status]=(acc[i.status]||0)+1; return acc; },{});
  const pieData = Object.entries(statusCounts).map(([name,value]) => ({ name:name.replace('_',' '), value, color:STATUS_COLORS[name]||'#6b7280' }));

  const statCards = [
    { label:'Total Issues',   value:totalIssues,          icon:FileText,    color:'blue',   trend:'up',   trendValue:8  },
    { label:'Resolved',       value:resolved,             icon:CheckCircle, color:'civic',  trend:'up',   trendValue:12 },
    { label:'Pending',        value:pending,              icon:Clock,       color:'amber',  trend:'down', trendValue:5  },
    { label:'Total Citizens', value:stats?.totalUsers||'—',icon:Users,      color:'purple' },
  ];

  return (
    <DashboardLayout>
      <Topbar title="Admin Dashboard" subtitle="System overview and analytics" />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <div className="text-3xl font-syne font-bold text-civic-600">{resolutionRate}%</div>
            <div className="text-sm text-gray-500 mt-1">Resolution Rate</div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-civic-500 rounded-full" style={{width:`${resolutionRate}%`}} />
            </div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-3xl font-syne font-bold text-amber-600">{stats?.avgResolutionDays||'—'}</div>
            <div className="text-sm text-gray-500 mt-1">Avg. Resolution Days</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-3xl font-syne font-bold text-blue-600">{stats?.totalOfficers||'—'}</div>
            <div className="text-sm text-gray-500 mt-1">Active Officers</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="card p-6 col-span-1">
            <h3 className="font-syne font-bold text-gray-900 mb-5">By Status</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {pieData.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:s.color}} />
                    <span className="text-gray-600">{s.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 col-span-2">
            <h3 className="font-syne font-bold text-gray-900 mb-5">Issues Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[{label:'Total',count:totalIssues},{label:'Resolved',count:resolved},{label:'Pending',count:pending}]} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{fontSize:12,fill:'#9ca3af'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:12,fill:'#9ca3af'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} />
                <Bar dataKey="count" fill="#349472" radius={[6,6,0,0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent issues */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-syne font-bold text-gray-900">Recent Issues</h3>
            <button onClick={() => navigate('/admin/issues')} className="text-sm text-civic-600 font-semibold hover:text-civic-700">View all →</button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ID','Title','Category','Status','Zone','Assigned To'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {issues.slice(0,5).map(issue => (
                <tr key={issue.issueId} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => navigate(`/issue/${issue.issueId}`)}>
                  <td className="px-6 py-3.5 text-sm font-mono text-gray-400">#{issue.issueId}</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900 max-w-48 truncate">{issue.title}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{issue.categoryName || '—'}</td>
                  <td className="px-6 py-3.5"><span className={`badge ${statusStyles[issue.status]||''}`}>{issue.status?.replace('_',' ')}</span></td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{issue.locationType||'—'}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{issue.assignedOfficerName||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}