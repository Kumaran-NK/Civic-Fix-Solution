import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Dashboardlayout';
import MediaCarousel from '../components/MediaCarousel';
import { getAllIssues, normaliseIssue } from '../api/issuesApi';
import { getAttachmentsByIssue, getStaticFileUrl, isVideo } from '../api/issueUpdatesApi';
import {
  Heart, MessageCircle, Share2, MapPin,
  CheckCircle, Flame, ChevronUp, ChevronDown, X, Send,
  Grid3x3, Rows3, TrendingUp, Zap, Eye,
  ThumbsUp, Flag, Navigation2, Maximize, Minimize,
  ChevronLeft, ChevronRight, Loader, Play, Clock, Building2
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const gradients = [
  'from-orange-400 to-red-500','from-yellow-400 to-amber-500',
  'from-lime-400 to-green-600','from-cyan-400 to-blue-600',
  'from-blue-400 to-indigo-600','from-rose-400 to-pink-600',
  'from-purple-400 to-violet-600','from-teal-400 to-emerald-600',
];
const emojiMap = {
  'Road Damage':'🕳️','Electricity':'💡','Water':'💧',
  'Waste Management':'🗑️','Drainage':'🌊','Street Lights':'🔦',
  'Public Property':'🏛️','Other':'📋',
};
const categoryColors = {
  'Road Damage':     { bg:'bg-orange-100',text:'text-orange-700',dot:'bg-orange-400' },
  'Electricity':     { bg:'bg-yellow-100',text:'text-yellow-700',dot:'bg-yellow-400' },
  'Water':           { bg:'bg-blue-100',  text:'text-blue-700',  dot:'bg-blue-400'   },
  'Waste Management':{ bg:'bg-lime-100',  text:'text-lime-700',  dot:'bg-lime-500'   },
  'Drainage':        { bg:'bg-cyan-100',  text:'text-cyan-700',  dot:'bg-cyan-400'   },
};
const statusConfig = {
  REPORTED:   { label:'Reported',   icon:Flag,       color:'text-blue-600',  bg:'bg-blue-50',   border:'border-blue-200'  },
  ASSIGNED:   { label:'Assigned',   icon:Navigation2,color:'text-amber-600', bg:'bg-amber-50',  border:'border-amber-200' },
  IN_PROGRESS:{ label:'In Progress',icon:Zap,        color:'text-purple-600',bg:'bg-purple-50', border:'border-purple-200'},
  RESOLVED:   { label:'Resolved',   icon:CheckCircle,color:'text-green-600', bg:'bg-green-50',  border:'border-green-200' },
  CLOSED:     { label:'Closed',     icon:CheckCircle,color:'text-gray-500',  bg:'bg-gray-100',  border:'border-gray-200'  },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m=Math.floor(diff/60000), h=Math.floor(diff/3600000), d=Math.floor(diff/86400000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  return `${d}d ago`;
}

const toFeedIssue = (issue, index) => ({
  id:          issue.issueId,
  user: {
    name:   issue.reportedByName  || issue.reportedBy?.name  || 'Anonymous',
    avatar: (issue.reportedByName || issue.reportedBy?.name  || 'A')[0].toUpperCase(),
    zone:   issue.locationType    || issue.reportedBy?.zone  || '—',
  },
  title:       issue.title,
  description: issue.description || '',
  category:    issue.categoryName || issue.category?.name || 'Other',
  status:      issue.status,
  priority:    issue.priority || 'MEDIUM',
  location:    issue.locationType || '—',
  timeAgo:     timeAgo(issue.createdAt),
  rawDate:     issue.createdAt,
  gradient:    gradients[index % gradients.length],
  emoji:       emojiMap[issue.categoryName || issue.category?.name] || '📋',
  likes:       Math.floor(Math.random() * 200) + 10,
  views:       Math.floor(Math.random() * 1500) + 100,
  shares:      Math.floor(Math.random() * 80) + 5,
  tags:        [
    (issue.categoryName || issue.category?.name || 'Issue').replace(' ',''),
    issue.status,
    (issue.locationType||'').replace(' ',''),
  ].filter(Boolean),
  updates:     issue.assignedOfficerName ? [{
    by:  issue.assignedOfficerName,
    dept: issue.assignedDepartmentName || '',
    time: timeAgo(issue.updatedAt),
    msg: `Assigned to ${issue.assignedDepartmentName || 'department'}.`,
  }] : [],
  attachments: [],  // loaded async
  attachmentsLoaded: false,
});

// ─── Google Maps style card ───────────────────────────────────────────────────
function IssueMapCard({ issue, onExpand, index }) {
  const [liked,setLiked]         = useState(false);
  const [likeCount,setLikeCount] = useState(issue.likes);
  const cat       = categoryColors[issue.category] || { bg:'bg-gray-100',text:'text-gray-700',dot:'bg-gray-400' };
  const statusCfg = statusConfig[issue.status]     || statusConfig.REPORTED;
  const StatusIcon = statusCfg.icon;
  const hasMedia   = issue.attachments?.length > 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
      style={{ animationDelay:`${index*60}ms` }}
    >
      {/* ── Media / Gradient area ── */}
      <div className="relative" style={{ height: '220px' }} onClick={() => onExpand(issue)}>
        {hasMedia ? (
          <MediaCarousel
            attachments={issue.attachments}
            height="220px"
            rounded="rounded-none"
            showCount={issue.attachments.length > 1}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${issue.gradient} flex items-center justify-center relative`}>
            <div className="text-7xl select-none group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
              {issue.emoji}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}

        {/* Loading shimmer for attachments */}
        {!issue.attachmentsLoaded && !hasMedia && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <Loader className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
            <StatusIcon className="w-3 h-3" />{statusCfg.label}
          </span>
          {issue.priority === 'HIGH' && (
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Flame className="w-3 h-3" /> URGENT
            </span>
          )}
        </div>

        {/* Expand button */}
        <button onClick={e=>{e.stopPropagation();onExpand(issue);}}
          className="absolute top-3 right-3 w-8 h-8 bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize className="w-3.5 h-3.5"/>
        </button>

        {/* Media count */}
        {hasMedia && issue.attachments.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg z-10 flex items-center gap-1">
            ⊞ {issue.attachments.length}
          </div>
        )}
      </div>

      {/* ── Content — Google Maps style ── */}
      <div className="p-4">
        {/* Category chip */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`}/>
            {issue.category}
          </span>
          <span className="text-xs text-gray-400 ml-auto">{issue.timeAgo}</span>
        </div>

        {/* Title — bold like Google Maps place name */}
        <h3 className="font-syne font-bold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-civic-700 transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {issue.description || 'No description provided.'}
        </p>

        {/* Location row — Google Maps style */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <MapPin className="w-3.5 h-3.5 text-civic-400 flex-shrink-0" />
          <span className="truncate">{issue.location !== '—' ? issue.location : 'Location not specified'}</span>
        </div>

        {/* Reporter */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
          <div className="w-6 h-6 bg-gradient-to-br from-civic-400 to-civic-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {issue.user.avatar}
          </div>
          <span className="text-xs text-gray-600 font-medium">{issue.user.name}</span>
          {issue.user.zone !== '—' && (
            <span className="text-xs text-gray-400">· {issue.user.zone}</span>
          )}
        </div>

        {/* Officer update pill — if assigned */}
        {issue.updates.length > 0 && (
          <div className="flex items-start gap-2 mb-3 bg-civic-50 border border-civic-100 rounded-xl px-3 py-2">
            <Building2 className="w-3.5 h-3.5 text-civic-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-civic-700">
                {issue.updates[0].dept || 'Department'}
              </p>
              <p className="text-xs text-gray-500 truncate">{issue.updates[0].msg}</p>
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-1">
          <button
            onClick={e=>{e.stopPropagation();setLiked(!liked);setLikeCount(liked?likeCount-1:likeCount+1);}}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${liked?'text-red-500 bg-red-50':'text-gray-400 hover:bg-gray-50'}`}>
            <Heart className={`w-3.5 h-3.5 ${liked?'fill-red-500':''}`}/>{likeCount}
          </button>
          <button
            onClick={e=>{e.stopPropagation();onExpand(issue);}}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-gray-400 hover:bg-gray-50">
            <MessageCircle className="w-3.5 h-3.5"/>0
          </button>
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3 h-3"/>{issue.views.toLocaleString()}
          </div>
          <button
            onClick={e=>{e.stopPropagation();onExpand(issue);}}
            className="ml-1 w-7 h-7 flex items-center justify-center rounded-lg text-civic-500 bg-civic-50 hover:bg-civic-100 transition-all">
            <Maximize className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fullscreen Viewer ────────────────────────────────────────────────────────
function FullscreenFeed({ issues, startIndex, onClose }) {
  const [current, setCurrent]       = useState(startIndex);
  const [liked, setLiked]           = useState({});
  const [likeCounts, setLikeCounts] = useState(Object.fromEntries(issues.map(i=>[i.id,i.likes])));
  const [comment, setComment]       = useState('');
  const [allComments, setAllComments] = useState({});
  const touchStartY = useRef(null);

  const issue     = issues[current];
  const cat       = categoryColors[issue.category] || { bg:'bg-gray-100',text:'text-gray-700' };
  const statusCfg = statusConfig[issue.status]     || statusConfig.REPORTED;
  const StatusIcon = statusCfg.icon;
  const comments  = allComments[issue.id]          || [];
  const hasMedia  = issue.attachments?.length > 0;

  const goNext = useCallback(()=>setCurrent(c=>Math.min(c+1,issues.length-1)),[issues.length]);
  const goPrev = useCallback(()=>setCurrent(c=>Math.max(c-1,0)),[]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==='Escape') onClose();
      if(e.key==='ArrowDown'||e.key==='ArrowRight') goNext();
      if(e.key==='ArrowUp'||e.key==='ArrowLeft') goPrev();
    };
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[goNext,goPrev,onClose]);

  const handleTouchStart=(e)=>{touchStartY.current=e.touches[0].clientY;};
  const handleTouchEnd=(e)=>{
    if(!touchStartY.current) return;
    const diff=touchStartY.current-e.changedTouches[0].clientY;
    if(diff>50)goNext(); if(diff<-50)goPrev();
    touchStartY.current=null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Nav */}
      <button onClick={goPrev} disabled={current===0}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all disabled:opacity-20">
        <ChevronLeft className="w-5 h-5"/>
      </button>
      <button onClick={goNext} disabled={current===issues.length-1}
        className="absolute right-72 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all disabled:opacity-20">
        <ChevronRight className="w-5 h-5"/>
      </button>
      <button onClick={onClose}
        className="absolute top-5 left-5 z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
        <Minimize className="w-4 h-4"/> Exit Fullscreen
      </button>
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {issues.map((_,i)=>(
          <button key={i} onClick={()=>setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i===current?'w-8 h-2 bg-white':'w-2 h-2 bg-white/30'}`}/>
        ))}
      </div>
      <div className="absolute top-5 right-[300px] z-10 bg-white/10 backdrop-blur-sm text-white text-xs font-mono px-3 py-1.5 rounded-full">
        {current+1} / {issues.length}
      </div>

      {/* Main */}
      <div className="flex-1 relative flex flex-col overflow-hidden" style={{marginRight:'288px'}}>
        <div className="flex-1 relative">
          {hasMedia ? (
            <MediaCarousel attachments={issue.attachments} height="100%" rounded="rounded-none"/>
          ) : (
            <>
              <div className={`absolute inset-0 bg-gradient-to-br ${issue.gradient} opacity-80`}/>
              <div className="absolute inset-0 bg-black/30"/>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[140px] select-none leading-none filter drop-shadow-2xl mb-4">{issue.emoji}</div>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <span className={`badge ${cat.bg} ${cat.text} text-sm font-bold px-4 py-2 rounded-full shadow-lg`}>{issue.category}</span>
                  <span className={`badge ${statusCfg.bg} ${statusCfg.color} text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5`}>
                    <StatusIcon className="w-3.5 h-3.5"/>{statusCfg.label}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent px-8 py-8">
          {hasMedia && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`badge ${cat.bg} ${cat.text} text-xs font-bold px-3 py-1 rounded-full`}>{issue.category}</span>
              <span className={`badge ${statusCfg.bg} ${statusCfg.color} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3"/>{statusCfg.label}
              </span>
              {issue.priority==='HIGH'&&<span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full"><Flame className="w-3 h-3"/> URGENT</span>}
            </div>
          )}
          <h1 className="font-syne font-extrabold text-white text-2xl leading-tight drop-shadow-xl mb-2">{issue.title}</h1>
          <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-3">{issue.description}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold border border-white/30">
                {issue.user.avatar}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{issue.user.name}</p>
                <p className="text-white/60 text-xs">{issue.timeAgo} · {issue.user.zone}</p>
              </div>
            </div>
            {issue.location !== '—' && (
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <MapPin className="w-3.5 h-3.5"/>{issue.location}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {issue.tags.filter(Boolean).map(tag=>(
              <span key={tag} className="text-xs text-white/70 bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">#{tag}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="absolute right-6 bottom-28 flex flex-col items-center gap-5 z-10">
          <button onClick={()=>{const l=liked[issue.id];setLiked(p=>({...p,[issue.id]:!l}));setLikeCounts(p=>({...p,[issue.id]:l?p[issue.id]-1:p[issue.id]+1}));}} className="flex flex-col items-center gap-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${liked[issue.id]?'bg-red-500 scale-110':'bg-white/20 backdrop-blur-sm hover:bg-white/30'}`}>
              <Heart className={`w-6 h-6 ${liked[issue.id]?'text-white fill-white':'text-white'}`}/>
            </div>
            <span className="text-white text-xs font-semibold">{likeCounts[issue.id]}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
              <Share2 className="w-6 h-6 text-white"/>
            </div>
            <span className="text-white text-xs font-semibold">{issue.shares}</span>
          </button>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-white/60"/>
            </div>
            <span className="text-white/60 text-xs">{issue.views.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 bg-white flex flex-col h-full flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge ${cat.bg} ${cat.text} text-xs font-bold`}>{issue.category}</span>
            <span className={`badge ${statusCfg.bg} ${statusCfg.color} text-xs font-bold flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3"/>{statusCfg.label}
            </span>
          </div>
          <h2 className="font-syne font-bold text-gray-900 text-base line-clamp-2">{issue.title}</h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3"/>{issue.timeAgo} · {issue.user.zone}
          </p>
          {issue.location !== '—' && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-civic-400"/>{issue.location}
            </p>
          )}
          {hasMedia && (
            <p className="text-xs text-civic-600 mt-1 font-semibold">📎 {issue.attachments.length} media file{issue.attachments.length>1?'s':''}</p>
          )}
        </div>

        <div className="px-5 py-3 border-b border-gray-50">
          <p className="text-xs text-gray-600 leading-relaxed">{issue.description}</p>
        </div>

        {issue.updates.length>0&&(
          <div className="px-5 py-4 border-b border-gray-100 bg-civic-50">
            <p className="text-xs font-semibold text-civic-700 mb-2">🔧 Official Updates</p>
            {issue.updates.map((u,i)=>(
              <div key={i} className="text-xs text-gray-600 mb-1">
                <span className="font-semibold text-civic-600">{u.by}:</span> {u.msg}
                <span className="text-gray-400 ml-1">· {u.time}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Comments ({comments.length})</p>
          {comments.length===0&&<p className="text-xs text-gray-300">No comments yet. Be the first!</p>}
          {comments.map(c=>(
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-civic-400 to-civic-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.user[0]}</div>
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                <span className="text-xs font-semibold text-gray-800">{c.user}</span>
                <span className="text-xs text-gray-400 ml-1.5">{c.time}</span>
                <p className="text-xs text-gray-600 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <form onSubmit={e=>{e.preventDefault();if(!comment.trim())return;setAllComments(ac=>({...ac,[issue.id]:[...(ac[issue.id]||[]),{id:Date.now(),user:'You',text:comment,time:'just now'}]}));setComment('');}} className="flex gap-2">
            <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-civic-400 bg-gray-50"/>
            <button type="submit" className="w-10 h-10 bg-civic-500 hover:bg-civic-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4 text-white"/>
            </button>
          </form>
          <p className="text-center text-xs text-gray-300 mt-2">↑↓ or ← → to navigate</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CivicFeed() {
  const [allIssues, setAllIssues]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [viewMode, setViewMode]               = useState('grid');
  const [activeReel, setActiveReel]           = useState(0);
  const [filter, setFilter]                   = useState('ALL');
  const [fullscreenIssue, setFullscreenIssue] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllIssues();
        // Sort: HIGH priority + newest first (Instagram algo)
        const sorted = [...data].sort((a,b) => {
          const ps={HIGH:3,MEDIUM:2,LOW:1};
          return ((ps[b.priority]||1)*1e12+new Date(b.createdAt).getTime()) -
                 ((ps[a.priority]||1)*1e12+new Date(a.createdAt).getTime());
        });
        const feed = sorted.map((issue,i) => toFeedIssue(normaliseIssue(issue), i));
        setAllIssues(feed);
        setLoading(false);

        // Load attachments for each issue in background (batched, 3 at a time)
        const batchSize = 3;
        for (let i = 0; i < feed.length; i += batchSize) {
          const batch = feed.slice(i, i + batchSize);
          await Promise.all(batch.map(async (fi, batchIdx) => {
            const globalIdx = i + batchIdx;
            try {
              const atts = await getAttachmentsByIssue(fi.id);
              setAllIssues(prev => prev.map((p, idx) =>
                idx === globalIdx
                  ? { ...p, attachments: atts || [], attachmentsLoaded: true }
                  : p
              ));
            } catch {
              setAllIssues(prev => prev.map((p, idx) =>
                idx === globalIdx ? { ...p, attachmentsLoaded: true } : p
              ));
            }
          }));
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryList = ['ALL', ...new Set(allIssues.map(i => i.category).filter(Boolean))];
  const filtered     = filter === 'ALL' ? allIssues : allIssues.filter(i => i.category === filter);

  const openFullscreen = (issue) => {
    const idx = filtered.findIndex(f => f.id === issue.id);
    setFullscreenIssue(idx >= 0 ? idx : 0);
  };

  useEffect(() => {
    if (viewMode !== 'reels' || fullscreenIssue !== null) return;
    const h=(e)=>{
      if(e.key==='ArrowDown') setActiveReel(r=>Math.min(r+1,filtered.length-1));
      if(e.key==='ArrowUp')   setActiveReel(r=>Math.max(r-1,0));
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[viewMode,filtered.length,fullscreenIssue]);

  const totalIssues = allIssues.length;
  const inProgress  = allIssues.filter(i=>i.status==='IN_PROGRESS').length;
  const resolved    = allIssues.filter(i=>['RESOLVED','CLOSED'].includes(i.status)).length;

  return (
    <>
      <DashboardLayout>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-syne font-bold text-xl text-gray-900 flex items-center gap-2">
                Civic Feed
                <span className="text-sm bg-red-50 text-red-500 border border-red-100 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5"/> LIVE
                </span>
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">See what's happening in your city right now</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setFullscreenIssue(0)} disabled={filtered.length===0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-civic-500 hover:bg-civic-600 text-white shadow-sm disabled:opacity-50">
                <Maximize className="w-4 h-4"/> Fullscreen
              </button>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button onClick={()=>setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode==='grid'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
                  <Grid3x3 className="w-4 h-4"/> Grid
                </button>
                <button onClick={()=>{setViewMode('reels');setActiveReel(0);}}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode==='reels'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
                  <Rows3 className="w-4 h-4"/> Feed
                </button>
              </div>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categoryList.map(cat => {
              const c = categoryColors[cat];
              return (
                <button key={cat} onClick={()=>setFilter(cat)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${filter===cat?'bg-civic-500 text-white border-civic-500 shadow-sm':'bg-white text-gray-600 border-gray-200 hover:border-civic-200 hover:text-civic-600'}`}>
                  {cat!=='ALL'&&c&&<span className={`w-2 h-2 rounded-full ${c.dot}`}/>}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              {label:'Issues Reported',value:totalIssues,icon:Flag,       color:'text-blue-600',  bg:'bg-blue-50'  },
              {label:'In Progress',    value:inProgress, icon:Zap,        color:'text-purple-600',bg:'bg-purple-50'},
              {label:'Resolved',       value:resolved,   icon:CheckCircle,color:'text-green-600', bg:'bg-green-50' },
              {label:'Active Issues',  value:totalIssues-resolved,icon:ThumbsUp,color:'text-civic-600',bg:'bg-civic-50'},
            ].map(s=>{const Icon=s.icon;return(
              <div key={s.label} className="card px-5 py-4 flex items-center gap-3">
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${s.color}`}/>
                </div>
                <div>
                  <p className="font-syne font-bold text-xl text-gray-900 leading-none">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            );})}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader className="w-8 h-8 animate-spin text-civic-500"/>
                <p className="text-sm text-gray-400">Loading civic issues...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">🏙️</div>
              <h3 className="font-syne font-bold text-gray-900 mb-2">No issues yet</h3>
              <p className="text-gray-400 text-sm">Be the first to report a civic issue in your area.</p>
            </div>
          ) : (
            <>
              {/* Grid view — Google Maps style cards */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((issue, index) => (
                    <IssueMapCard key={issue.id} issue={issue} index={index} onExpand={openFullscreen}/>
                  ))}
                </div>
              )}

              {/* Reels / Feed view */}
              {viewMode === 'reels' && (
                <div className="flex gap-8 justify-center">
                  <div className="flex flex-col items-center justify-center gap-3 sticky top-32 self-start">
                    <button onClick={()=>setActiveReel(r=>Math.max(r-1,0))} disabled={activeReel===0}
                      className="w-11 h-11 bg-white border border-gray-200 hover:bg-civic-50 hover:border-civic-200 rounded-full flex items-center justify-center shadow-sm transition-all disabled:opacity-30">
                      <ChevronUp className="w-5 h-5 text-gray-600"/>
                    </button>
                    <div className="flex flex-col gap-1.5">
                      {filtered.map((_,i)=>(
                        <button key={i} onClick={()=>setActiveReel(i)}
                          className={`rounded-full transition-all ${activeReel===i?'w-2.5 h-8 bg-civic-500':'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'}`}/>
                      ))}
                    </div>
                    <button onClick={()=>setActiveReel(r=>Math.min(r+1,filtered.length-1))} disabled={activeReel===filtered.length-1}
                      className="w-11 h-11 bg-white border border-gray-200 hover:bg-civic-50 hover:border-civic-200 rounded-full flex items-center justify-center shadow-sm transition-all disabled:opacity-30">
                      <ChevronDown className="w-5 h-5 text-gray-600"/>
                    </button>
                    <p className="text-xs text-gray-400 font-mono">{activeReel+1}/{filtered.length}</p>
                  </div>

                  <div className="w-full max-w-md">
                    {filtered.map((issue,i)=>(
                      <div key={issue.id} className={i===activeReel?'block':'hidden'}>
                        <IssueMapCard issue={issue} index={i} onExpand={openFullscreen}/>
                      </div>
                    ))}
                  </div>

                  <div className="w-64 flex-shrink-0 sticky top-32 self-start space-y-4">
                    <div className="card p-5">
                      <h3 className="font-syne font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-civic-500"/> Trending
                      </h3>
                      <div className="space-y-3">
                        {[...allIssues].sort((a,b)=>b.views-a.views).slice(0,4).map((issue,i)=>(
                          <button key={issue.id} onClick={()=>setActiveReel(filtered.findIndex(f=>f.id===issue.id))}
                            className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-xl p-2 transition-all group">
                            <span className="text-lg font-syne font-bold text-gray-200 w-5 flex-shrink-0">{i+1}</span>
                            {issue.attachments?.length>0 ? (
                              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                <img src={getStaticFileUrl(issue.attachments[0].fileUrl)} className="w-full h-full object-cover" alt="" onError={e=>e.target.style.display='none'}/>
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${issue.gradient} flex items-center justify-center text-sm flex-shrink-0`}>{issue.emoji}</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-civic-700">{issue.title}</p>
                              <p className="text-xs text-gray-400">{issue.views.toLocaleString()} views</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="card p-5 bg-civic-50 border-civic-100">
                      <h3 className="font-syne font-bold text-civic-900 text-sm mb-2">💡 Awareness Tip</h3>
                      <p className="text-xs text-civic-700 leading-relaxed">
                        Sharing issues increases resolution speed by <strong>3×</strong>. Every report puts pressure on authorities to act faster.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>

      {fullscreenIssue !== null && filtered.length > 0 && (
        <FullscreenFeed issues={filtered} startIndex={fullscreenIssue} onClose={()=>setFullscreenIssue(null)}/>
      )}
    </>
  );
}