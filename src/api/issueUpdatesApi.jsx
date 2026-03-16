import axiosInstance from './axiosInstance';

// ── Issue Updates ──────────────────────────────────────────────────────────

// POST /api/issue-updates  (OFFICER / ADMIN)

export const addIssueUpdate = (data) =>
  axiosInstance.post('/api/issue-updates', {
    issueId:           data.issueId,
    message:           data.message,
    statusAfterUpdate: data.statusAfterUpdate,   // string enum value
  }).then((r) => r.data);

// GET /api/issue-updates/issue/:issueId
export const getIssueUpdates = (issueId) =>
  axiosInstance.get(`/api/issue-updates/issue/${issueId}`).then((r) => r.data);

// ── Attachments ────────────────────────────────────────────────────────────

export const uploadAttachment = (issueId, file, onProgress) => {
  const formData = new FormData();
  formData.append('issueId', issueId);
  formData.append('file', file);
  return axiosInstance
    .post('/api/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
    })
    .then((r) => r.data);
};

export const uploadAttachments = async (issueId, files, onEach) => {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    if (onEach) onEach(i, files.length);
    const result = await uploadAttachment(issueId, files[i]);
    results.push(result);
  }
  return results;
};

export const getAttachmentsByIssue = (issueId) =>
  axiosInstance.get(`/api/attachments/issue/${issueId}`).then((r) => r.data);

// ✅ Use static URL — /uploads/filename.jpg served by WebConfig
export const getAttachmentDownloadUrl = (attachmentId) => {
  const base = axiosInstance.defaults.baseURL || 'http://localhost:8080';
  return `${base}/api/attachments/${attachmentId}/download`;
};

export const getStaticFileUrl = (fileUrl) => {
  if (!fileUrl) return null;
  if (fileUrl.startsWith('http')) return fileUrl;
  const base = axiosInstance.defaults.baseURL || 'http://localhost:8080';
  return `${base}/${fileUrl}`;
};

export const isVideo = (attachment) => {
  const t = attachment?.fileType || '';
  return t.startsWith('video/');
};