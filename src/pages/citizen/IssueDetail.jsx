import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, normaliseIssue } from '../../api/issuesApi';
import { getIssueUpdates, getAttachmentsByIssue, getAttachmentDownloadUrl } from '../../api/issueUpdatesApi';
import MediaCarousel from '../../components/MediaCarousel';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { MapPin, Calendar, User, Building2, Paperclip, ArrowLeft, Loader } from 'lucide-react';

const statusStyles = {
  REPORTED:'bg-blue-50 text-blue-700', ASSIGNED:'bg-amber-50 text-amber-700',
  IN_PROGRESS:'bg-purple-50 text-purple-700', RESOLVED:'bg-green-50 text-green-700',
  CLOSED:'bg-gray-100 text-gray-600',
};
const priorityStyles = {
  HIGH:'bg-red-50 text-red-700', MEDIUM:'bg-orange-50 text-orange-700', LOW:'bg-green-50 text-green-700',
};

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue]             = useState(null);
  const [updates, setUpdates]         = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getIssueById(id), getIssueUpdates(id), getAttachmentsByIssue(id)])
      .then(([issueData, updatesData, attachmentsData]) => {
        setIssue(normaliseIssue(issueData));
        setUpdates(updatesData);
        setAttachments(attachmentsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><div className="flex justify-center items-center min-h-[60vh]"><Loader className="w-8 h-8 animate-spin text-civic-500" /></div></DashboardLayout>;
  if (!issue)  return <DashboardLayout><div className="p-8 text-center text-gray-400">Issue not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <Topbar title={`Issue #${issue.issueId}`} subtitle={issue.categoryName || issue.category?.name} />
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${statusStyles[issue.status]||''}`}>{issue.status?.replace('_',' ')}</span>
                  {issue.priority && <span className={`badge ${priorityStyles[issue.priority]}`}>{issue.priority} PRIORITY</span>}
                </div>
              </div>
              <h1 className="font-syne font-bold text-xl text-gray-900 mb-3">{issue.title}</h1>
              <p className="text-gray-600 text-sm leading-relaxed">{issue.description}</p>

              {/* Real media */}
              {attachments.length > 0 && (
                <div className="mt-5 rounded-xl overflow-hidden">
                  <MediaCarousel attachments={attachments} height="280px" rounded="rounded-xl" />
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 text-civic-500" /><span>{issue.locationType||'—'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4 text-civic-500" /><span>Reported: {issue.createdAt?.substring(0,10)}</span>
                </div>
                {issue.assignedOfficerName && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4 text-civic-500" /><span>{issue.assignedOfficerName}</span>
                  </div>
                )}
                {issue.assignedDepartmentName && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Building2 className="w-4 h-4 text-civic-500" /><span>{issue.assignedDepartmentName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="font-syne font-bold text-base text-gray-900 mb-5">Activity Timeline</h3>
              {updates.length === 0 ? (
                <p className="text-sm text-gray-400">No updates yet.</p>
              ) : (
                <div className="space-y-5">
                  {updates.map((u,i) => (
                    <div key={u.updateId} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-civic-500">{i+1}</div>
                        {i < updates.length-1 && <div className="w-0.5 h-8 bg-gray-100 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{u.statusAfterUpdate?.replace('_',' ')||'Update'}</span>
                          <span className="text-xs text-gray-400">by {u.updatedBy?.name||u.updatedByName||'Officer'}</span>
                        </div>
                        <p className="text-sm text-gray-600">{u.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{u.createdAt?.replace('T',' ').substring(0,16)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-syne font-bold text-sm text-gray-900 mb-4">Issue Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900">{issue.categoryName||'—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`badge ${statusStyles[issue.status]||''}`}>{issue.status?.replace('_',' ')}</span></div>
                {issue.priority && <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className={`badge ${priorityStyles[issue.priority]}`}>{issue.priority}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Updates</span><span className="font-medium text-gray-900">{updates.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Attachments</span><span className="font-medium text-gray-900">{attachments.length}</span></div>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="card p-5">
                <h3 className="font-syne font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />Attachments ({attachments.length})
                </h3>
                <div className="space-y-2">
                  {attachments.map(att => (
                    <a key={att.attachmentId} href={getAttachmentDownloadUrl(att.attachmentId)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 bg-gray-50 hover:bg-civic-50 rounded-xl px-3 py-2.5 transition-colors">
                      <div className="w-8 h-8 bg-civic-100 rounded-lg flex items-center justify-center">
                        <Paperclip className="w-3.5 h-3.5 text-civic-600" />
                      </div>
                      <span className="text-xs text-gray-700 font-medium truncate">
                        {att.fileUrl?.split('/').pop() || `file_${att.attachmentId}`}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}