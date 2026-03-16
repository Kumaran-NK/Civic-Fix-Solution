import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getSystemStatistics } from '../../api/userApi';
import { getAllIssues } from '../../api/issuesApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, Loader } from 'lucide-react';

const STATUS_COLORS = {
  REPORTED:    '#3b82f6',
  ASSIGNED:    '#f59e0b',
  IN_PROGRESS: '#8b5cf6',
  RESOLVED:    '#10b981',
  CLOSED:      '#6b7280',
};

export default function AdminAnalytics() {
  const [stats, setStats]   = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSystemStatistics(), getAllIssues()])
      .then(([statsData, issuesData]) => {
        setStats(statsData);
        setIssues(issuesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-civic-500" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Compute everything from real issues ────────────────────────────────────
  const totalIssues   = issues.length;
  const resolved      = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
  const pending       = issues.filter(i => ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(i.status)).length;
  const resolutionRate = totalIssues > 0 ? ((resolved / totalIssues) * 100).toFixed(1) : 0;
  const avgDays        = stats?.avgResolutionDays ?? '—';

  // Status distribution pie
  const statusCounts = issues.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name:  name.replace('_', ' '),
    value,
    color: STATUS_COLORS[name] || '#6b7280',
  }));

  // Category breakdown bar chart
  const categoryCounts = issues.reduce((acc, i) => {
    const name = i.category?.name || 'Other';
    if (!acc[name]) acc[name] = { name, total: 0, resolved: 0, pending: 0 };
    acc[name].total++;
    if (i.status === 'RESOLVED' || i.status === 'CLOSED') acc[name].resolved++;
    else acc[name].pending++;
    return acc;
  }, {});
  const categoryData = Object.values(categoryCounts);

  // Monthly trend — group by month from createdAt
  const monthlyMap = issues.reduce((acc, i) => {
    if (!i.createdAt) return acc;
    const d     = new Date(i.createdAt);
    const key   = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!acc[key]) acc[key] = { month: key, issues: 0, resolved: 0 };
    acc[key].issues++;
    if (i.status === 'RESOLVED' || i.status === 'CLOSED') acc[key].resolved++;
    return acc;
  }, {});
  const monthlyData = Object.values(monthlyMap).slice(-6); // last 6 months

  // Department performance
  const deptMap = issues.reduce((acc, i) => {
    const name = i.assignedDepartment?.departmentName;
    if (!name) return acc;
    if (!acc[name]) acc[name] = { name, resolved: 0, pending: 0 };
    if (i.status === 'RESOLVED' || i.status === 'CLOSED') acc[name].resolved++;
    else acc[name].pending++;
    return acc;
  }, {});
  const deptData = Object.values(deptMap);

  return (
    <DashboardLayout>
      <Topbar title="Analytics & Reports" subtitle="System-wide performance metrics" />
      <div className="p-8 space-y-6">

        {/* Top metrics */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Resolution Rate',      value: `${resolutionRate}%`, icon: CheckCircle,  color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Avg. Resolution Days', value: avgDays,              icon: Clock,         color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Total Issues',         value: totalIssues,          icon: TrendingUp,    color: 'text-blue-600',  bg: 'bg-blue-50'  },
            { label: 'Pending Issues',       value: pending,              icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50'   },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card p-5">
                <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div className="font-syne font-bold text-2xl text-gray-900">{m.value}</div>
                <div className="text-sm text-gray-500 mt-1">{m.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Monthly trend */}
          <div className="card p-6 col-span-3">
            <h3 className="font-syne font-bold text-gray-900 mb-5">Monthly Issue Trends</h3>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Not enough data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="issues"   stroke="#bce3cf" strokeWidth={2.5} dot={{ fill: '#bce3cf', r: 4 }} name="Reported" />
                  <Line type="monotone" dataKey="resolved" stroke="#349472" strokeWidth={2.5} dot={{ fill: '#349472', r: 4 }} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status distribution */}
          <div className="card p-6 col-span-2">
            <h3 className="font-syne font-bold text-gray-900 mb-5">Status Distribution</h3>
            {pieData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-600">{s.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        {categoryData.length > 0 && (
          <div className="card p-6">
            <h3 className="font-syne font-bold text-gray-900 mb-5">Issues by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} barSize={28} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
                <Legend />
                <Bar dataKey="resolved" fill="#349472" radius={[6, 6, 0, 0]} name="Resolved" />
                <Bar dataKey="pending"  fill="#fbbf24" radius={[6, 6, 0, 0]} name="Pending"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department performance */}
        {deptData.length > 0 && (
          <div className="card p-6">
            <h3 className="font-syne font-bold text-gray-900 mb-5">Department Performance Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} barSize={28} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
                <Legend />
                <Bar dataKey="resolved" fill="#349472" radius={[6, 6, 0, 0]} name="Resolved" />
                <Bar dataKey="pending"  fill="#fbbf24" radius={[6, 6, 0, 0]} name="Pending"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}