import { MapPin, Calendar, Paperclip, MessageSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusStyles = {
  REPORTED: 'bg-blue-50 text-blue-700',
  ASSIGNED: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-purple-50 text-purple-700',
  RESOLVED: 'bg-green-50 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const priorityStyles = {
  HIGH: 'bg-red-50 text-red-700',
  MEDIUM: 'bg-orange-50 text-orange-700',
  LOW: 'bg-green-50 text-green-700',
};

const categoryColors = {
  'Road Damage': 'bg-orange-100 text-orange-700',
  'Electricity': 'bg-yellow-100 text-yellow-700',
  'Water': 'bg-blue-100 text-blue-700',
  'Waste Management': 'bg-lime-100 text-lime-700',
  'Drainage': 'bg-cyan-100 text-cyan-700',
};

export default function IssueCard({ issue }) {
  const navigate = useNavigate();
  const catColor = categoryColors[issue.category] || 'bg-gray-100 text-gray-700';

  return (
    <div
      onClick={() => navigate(`/issue/${issue.id}`)}
      className="card p-5 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-civic-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge ${catColor}`}>{issue.category}</span>
            <span className={`badge ${statusStyles[issue.status]}`}>{issue.status.replace('_', ' ')}</span>
            <span className={`badge ${priorityStyles[issue.priority]}`}>{issue.priority}</span>
          </div>
          <h3 className="font-syne font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-civic-700 transition-colors">
            #{issue.id} — {issue.title}
          </h3>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-civic-500 transition-colors" />
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{issue.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {issue.zone}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {issue.createdAt}
        </span>
        {issue.attachments > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip className="w-3 h-3" />
            {issue.attachments}
          </span>
        )}
        {issue.updates > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {issue.updates} updates
          </span>
        )}
        {issue.assignedOfficer && (
          <span className="ml-auto text-civic-600 font-medium">
            👤 {issue.assignedOfficer}
          </span>
        )}
      </div>
    </div>
  );
}