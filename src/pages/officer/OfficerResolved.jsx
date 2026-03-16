import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getAllIssues, getIssuesByDepartment, normaliseIssue } from '../../api/issuesApi';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Calendar, MapPin, Loader } from 'lucide-react';

export default function OfficerResolved() {
  const { user } = useAuth();
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading]   = useState(true);

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
        setResolved(data.map(normaliseIssue).filter(i => ['RESOLVED','CLOSED'].includes(i.status)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.userId]);

  return (
    <DashboardLayout>
      <Topbar title="Resolved Issues" subtitle={`${resolved.length} issues resolved`} />
      <div className="p-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
        ) : resolved.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No resolved issues yet</p>
          </div>
        ) : resolved.map(issue => (
          <div key={issue.issueId} className="card p-5 border-l-4 border-green-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">{issue.status}</span>
                  <span className="badge bg-gray-100 text-gray-600">{issue.categoryName||'—'}</span>
                </div>
                <h3 className="font-syne font-bold text-gray-900 text-sm mb-1">#{issue.issueId} — {issue.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{issue.locationType||'—'}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>Updated: {issue.updatedAt?.substring(0,10)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}