import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getStaticFileUrl, isVideo } from '../api/issueUpdatesApi';

function MediaItem({ attachment }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted]     = useState(true);
  const videoRef              = useRef(null);

  // Use the static file URL for browser rendering (no auth header needed)
  const url = getStaticFileUrl(attachment.fileUrl) || `http://localhost:8080/api/attachments/${attachment.attachmentId}/download`;
  const vid  = isVideo(attachment);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else         { videoRef.current.play();  setPlaying(true);  }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  if (vid) {
    return (
      <div className="relative w-full h-full">
        <video ref={videoRef} src={url} className="w-full h-full object-cover" muted={muted} loop playsInline onClick={togglePlay} />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer" onClick={togglePlay}>
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 text-gray-800 fill-gray-800 ml-1" />
            </div>
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button onClick={togglePlay} className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all">
            {playing ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
          </button>
          <button onClick={toggleMute} className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all">
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg">▶ VIDEO</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Issue media"
      className="w-full h-full object-cover"
      loading="lazy"
      onError={(e) => { e.target.style.display='none'; }}
    />
  );
}

export default function MediaCarousel({ attachments, height = '240px', rounded = 'rounded-none', showCount = true }) {
  const [current, setCurrent] = useState(0);
  const touchStartX           = useRef(null);

  if (!attachments || attachments.length === 0) return null;

  const total = attachments.length;
  const prev  = () => setCurrent(c => Math.max(c-1, 0));
  const next  = () => setCurrent(c => Math.min(c+1, total-1));

  return (
    <div className={`relative overflow-hidden bg-gray-900 ${rounded}`} style={{ height }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (!touchStartX.current) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 40) next(); if (diff < -40) prev();
        touchStartX.current = null;
      }}>

      {/* Slides */}
      <div className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform:`translateX(-${current*100}%)`, width:`${total*100}%` }}>
        {attachments.map((att, i) => (
          <div key={att.attachmentId} className="h-full flex-shrink-0" style={{ width:`${100/total}%` }}>
            <MediaItem attachment={att} />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {total > 1 && (
        <>
          <button onClick={e=>{e.stopPropagation();prev();}} disabled={current===0}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all disabled:opacity-20">
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <button onClick={e=>{e.stopPropagation();next();}} disabled={current===total-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all disabled:opacity-20">
            <ChevronRight className="w-4 h-4"/>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {attachments.map((_,i) => (
            <button key={i} onClick={e=>{e.stopPropagation();setCurrent(i);}}
              className={`rounded-full transition-all duration-300 ${i===current?'w-5 h-1.5 bg-white':'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}/>
          ))}
        </div>
      )}

      {/* Count */}
      {showCount && total > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded-full z-10">
          {current+1} / {total}
        </div>
      )}
    </div>
  );
}