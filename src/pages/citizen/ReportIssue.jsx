import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import {
  Upload, MapPin, Loader, CheckCircle, X,
  Navigation, Map, Maximize2, Minimize2,
  Play, Image, Film, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createIssue } from '../../api/issuesApi';
import { getAllCategories } from '../../api/categoriesApi';
import { uploadAttachments } from '../../api/issueUpdatesApi';

const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
const MAX_FILES   = 10;
const MAX_SIZE_MB = 100;

// ─── File preview tile ────────────────────────────────────────────────────────
function FileTile({ file, index, previewUrl, onRemove }) {
  const isVid = file.type.startsWith('video/');
  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
      style={{ aspectRatio: '1 / 1', width: '100px' }}>
      {isVid ? (
        <>
          <video src={previewUrl} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Film className="w-2.5 h-2.5" /> VID
          </span>
        </>
      ) : (
        <img src={previewUrl} alt={`preview-${index}`} className="w-full h-full object-cover" />
      )}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        <X className="w-3 h-3" />
      </button>
      {index === 0 && (
        <span className="absolute bottom-1 right-1 bg-civic-500 text-white text-xs px-1.5 py-0.5 rounded-md">Cover</span>
      )}
    </div>
  );
}

// ─── Leaflet Map ──────────────────────────────────────────────────────────────
function LeafletMap({ onLocationSelect, selectedLocation, coverPreview }) {
  const mapRef            = useRef(null);
  const mapInstanceRef    = useRef(null);
  const markerRef         = useRef(null);
  const settingLocationRef = useRef(false);
  const [coords, setCoords]               = useState(null);
  const [settingLocation, setSettingLocation] = useState(false);
  const [expanded, setExpanded]           = useState(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const initMap = () => {
      if (mapInstanceRef.current || !mapRef.current) return;
      const L   = window.L;
      const map = L.map(mapRef.current).setView([13.0827, 80.2707], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      L.control.scale().addTo(map);
      map.on('mousemove', (e) =>
        setCoords({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5) })
      );
      map.on('click', (e) => {
        if (!settingLocationRef.current) return;
        placeMarker(e.latlng.lat, e.latlng.lng, map);
      });
      mapInstanceRef.current = map;
    };
    if (window.L) initMap();
    else {
      const script   = document.createElement('script');
      script.src     = 'https://unpkg.com/leaflet/dist/leaflet.js';
      script.onload  = initMap;
      document.head.appendChild(script);
    }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) setTimeout(() => mapInstanceRef.current.invalidateSize(), 320);
  }, [expanded]);

  useEffect(() => {
    if (markerRef.current && selectedLocation)
      markerRef.current.setPopupContent(buildPopup(selectedLocation.lat, selectedLocation.lng, coverPreview));
  }, [coverPreview]);

  const buildPopup = (lat, lng, img) => `
    <div style="font-family:sans-serif;min-width:190px;padding:4px 0;">
      <b style="color:#349472;font-size:13px;">🚨 Civic Issue</b>
      ${img
        ? `<img src="${img}" style="width:180px;border-radius:8px;margin:6px 0;display:block;object-fit:cover;height:100px;"/>`
        : `<div style="width:180px;height:80px;background:#f0f9f4;border-radius:8px;margin:6px 0;display:flex;align-items:center;justify-content:center;color:#8dcdb1;font-size:12px;">No image</div>`}
      <small style="color:#666;font-family:monospace;">Lat: ${parseFloat(lat).toFixed(5)}<br/>Lng: ${parseFloat(lng).toFixed(5)}</small>
    </div>`;

  const placeMarker = (lat, lng, mapInst) => {
    const L   = window.L;
    const map = mapInst || mapInstanceRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.remove();
    const icon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#349472;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px rgba(52,148,114,0.55);"></div>`,
      iconSize: [32, 32], iconAnchor: [16, 32], className: '',
    });
    markerRef.current = L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(buildPopup(lat, lng, coverPreview), { maxWidth: 220 })
      .openPopup();
    map.flyTo([lat, lng], 15, { duration: 1.2 });
    onLocationSelect({ lat: parseFloat(lat).toFixed(5), lng: parseFloat(lng).toFixed(5) });
    settingLocationRef.current = false;
    setSettingLocation(false);
  };

  const useGPS = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => placeMarker(p.coords.latitude, p.coords.longitude),
      ()  => alert('Unable to get location.')
    );
  };

  const mapHeight = expanded ? 'calc(100% - 160px)' : '320px';

  return (
    <>
      {expanded && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setExpanded(false)} />}
      <div className={`space-y-3 ${expanded ? 'fixed inset-6 z-50 bg-white rounded-2xl p-6 shadow-2xl flex flex-col' : ''}`}>
        {expanded && (
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <div>
              <h3 className="font-syne font-bold text-gray-900">Pin Location on Map</h3>
              <p className="text-xs text-gray-400 mt-0.5">Click anywhere or use GPS</p>
            </div>
            <button type="button" onClick={() => setExpanded(false)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl">
              <Minimize2 className="w-4 h-4" /> Collapse
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={useGPS}
            className="flex items-center gap-2 bg-civic-500 hover:bg-civic-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm">
            <Navigation className="w-3.5 h-3.5" /> Use My Location
          </button>
          <button type="button" onClick={() => { settingLocationRef.current = true; setSettingLocation(true); }}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all ${settingLocation ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
            <Map className="w-3.5 h-3.5" />{settingLocation ? 'Click on the map...' : 'Pick on Map'}
          </button>
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600">
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {expanded ? 'Collapse' : 'Expand Map'}
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
          style={{ height: mapHeight, minHeight: expanded ? '300px' : undefined }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          {coords && (
            <div className="absolute bottom-3 left-3 bg-white/90 text-gray-600 font-mono text-xs px-3 py-1.5 rounded-lg shadow-sm pointer-events-none" style={{ zIndex: 1000 }}>
              {coords.lat}, {coords.lng}
            </div>
          )}
          {coverPreview && selectedLocation && (
            <div className="absolute top-3 right-3 pointer-events-none" style={{ zIndex: 1000 }}>
              <div className="bg-white rounded-xl shadow-lg p-1.5 border border-civic-100">
                <img src={coverPreview} alt="Cover" className="w-14 h-14 object-cover rounded-lg" />
                <p className="text-xs text-center text-civic-600 font-semibold mt-1">Cover</p>
              </div>
            </div>
          )}
          {settingLocation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 999 }}>
              <div className="bg-amber-500/90 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg animate-pulse">
                🗺️ Click anywhere to drop a pin
              </div>
            </div>
          )}
        </div>
        {selectedLocation ? (
          <div className="flex items-center gap-3 bg-civic-50 border border-civic-100 rounded-xl px-4 py-3 flex-shrink-0">
            <MapPin className="w-4 h-4 text-civic-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-civic-700">Location pinned</span>
              <span className="text-xs text-gray-500 font-mono ml-2">{selectedLocation.lat}, {selectedLocation.lng}</span>
            </div>
            <CheckCircle className="w-4 h-4 text-civic-500 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3 flex-shrink-0">
            <MapPin className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <span className="text-sm text-gray-400">No location selected yet</span>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportIssue() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories]         = useState([]);
  const [form, setForm]                     = useState({ title: '', description: '', categoryId: '', zone: '' });
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Multi-file state
  const [files, setFiles]             = useState([]);       // File objects
  const [previewUrls, setPreviewUrls] = useState([]);       // object URLs

  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // "Uploading file 2 of 5"

  const fileInputRef = useRef(null);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
    return () => previewUrls.forEach(URL.revokeObjectURL);
  }, []);

  // ── File handling ───────────────────────────────────────────────────────────
  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => {
      const isImage = f.type.startsWith('image/');
      const isVideo = f.type.startsWith('video/');
      const sizeMB  = f.size / 1024 / 1024;
      if (!isImage && !isVideo) return false;
      if (sizeMB > MAX_SIZE_MB) { alert(`${f.name} exceeds ${MAX_SIZE_MB}MB limit.`); return false; }
      return true;
    });
    const combined = [...files, ...valid].slice(0, MAX_FILES);
    const newUrls  = combined.map((f, i) => previewUrls[i] || URL.createObjectURL(f));
    // Revoke removed ones
    previewUrls.slice(combined.length).forEach(URL.revokeObjectURL);
    setFiles(combined);
    setPreviewUrls(newUrls);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles(files.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await createIssue({
        title:        form.title,
        description:  form.description,
        categoryId:   parseInt(form.categoryId),
        reportedById: user.userId,
        latitude:     selectedLocation ? parseFloat(selectedLocation.lat) : null,
        longitude:    selectedLocation ? parseFloat(selectedLocation.lng) : null,
        locationType: form.zone,
      });

      if (files.length > 0) {
        await uploadAttachments(created.issueId, files, (idx, total) => {
          setUploadProgress(`Uploading file ${idx + 1} of ${total}...`);
        });
      }

      setUploadProgress(null);
      setSuccess(true);
      setTimeout(() => navigate('/citizen/issues'), 2000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit issue.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center animate-fade-up">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-syne font-bold text-2xl text-gray-900 mb-2">Issue Reported!</h2>
            <p className="text-gray-500">Your issue has been submitted successfully. Redirecting...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const coverPreview = files[0]?.type.startsWith('image/') ? previewUrls[0] : null;

  return (
    <DashboardLayout>
      <Topbar title="Report an Issue" subtitle="Help us improve your community" />
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Issue Details ─────────────────────────────────────────── */}
            <div className="card p-6 space-y-4">
              <h2 className="font-syne font-bold text-base text-gray-900">Issue Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief title describing the issue" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="input-field" required>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Zone *</label>
                <select value={form.zone}
                  onChange={e => setForm({ ...form, zone: e.target.value })}
                  className="input-field" required>
                  <option value="">Select zone...</option>
                  {zones.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue in detail — when it started, how severe it is..."
                  rows={4} className="input-field resize-none" required />
              </div>
            </div>

            {/* ── Media Upload ──────────────────────────────────────────── */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-syne font-bold text-base text-gray-900">
                  Photos & Videos
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                    <Image className="w-3 h-3" /> Photos
                  </span>
                  <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                    <Film className="w-3 h-3" /> Videos
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Upload up to {MAX_FILES} files · Images (JPG, PNG, WEBP) and Videos (MP4, MOV) · Max {MAX_SIZE_MB}MB each · First file is the cover
              </p>

              {/* Preview grid */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {files.map((f, i) => (
                    <FileTile key={i} file={f} index={i} previewUrl={previewUrls[i]} onRemove={removeFile} />
                  ))}
                  {/* Add more tile */}
                  {files.length < MAX_FILES && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border-2 border-dashed border-gray-200 hover:border-civic-300 bg-gray-50 hover:bg-civic-50 flex items-center justify-center transition-colors"
                      style={{ width: '100px', aspectRatio: '1 / 1' }}>
                      <div className="text-center">
                        <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">Add more</span>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Drop zone */}
              {files.length === 0 && (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-civic-300 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                >
                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-civic-400 mx-auto mb-3 transition-colors" />
                  <p className="text-sm font-semibold text-gray-500 mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400">Photos (JPG, PNG, WEBP) and Videos (MP4, MOV, AVI)</p>
                  <p className="text-xs text-gray-300 mt-1">Up to {MAX_FILES} files · Max {MAX_SIZE_MB}MB each</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={e => addFiles(e.target.files)}
                className="hidden"
              />

              {/* File count + type breakdown */}
              {files.length > 0 && (
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{files.length}/{MAX_FILES} files</span>
                  <span>{files.filter(f => f.type.startsWith('image/')).length} photos</span>
                  <span>{files.filter(f => f.type.startsWith('video/')).length} videos</span>
                  {files.length >= MAX_FILES && (
                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                      <AlertCircle className="w-3 h-3" /> Max reached
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Map ───────────────────────────────────────────────────── */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-1">
                <h2 className="font-syne font-bold text-base text-gray-900">Pin Location on Map</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">OpenStreetMap</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Drop a pin using GPS or click on the map.</p>
              <LeafletMap
                onLocationSelect={setSelectedLocation}
                selectedLocation={selectedLocation}
                coverPreview={coverPreview}
              />
            </div>

            {/* Upload progress */}
            {uploadProgress && (
              <div className="flex items-center gap-3 bg-civic-50 border border-civic-100 rounded-xl px-4 py-3">
                <Loader className="w-4 h-4 animate-spin text-civic-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-civic-700">{uploadProgress}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 py-3.5">Cancel</button>
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Submit Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}