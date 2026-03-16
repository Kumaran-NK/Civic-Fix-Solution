import axiosInstance from './axiosInstance';

// GET /api/issues  (OFFICER / ADMIN)
export const getAllIssues = () =>
  axiosInstance.get('/api/issues').then((r) => r.data);

// GET /api/issues/:id
export const getIssueById = (id) =>
  axiosInstance.get(`/api/issues/${id}`).then((r) => r.data);

// GET /api/issues/user/:userId
export const getIssuesByUser = (userId) =>
  axiosInstance.get(`/api/issues/user/${userId}`).then((r) => r.data);

// GET /api/issues/department/:deptId
export const getIssuesByDepartment = (deptId) =>
  axiosInstance.get(`/api/issues/department/${deptId}`).then((r) => r.data);

// GET /api/issues/status/:status
export const getIssuesByStatus = (status) =>
  axiosInstance.get(`/api/issues/status/${status}`).then((r) => r.data);

// GET /api/issues/unassigned
export const getUnassignedIssues = () =>
  axiosInstance.get('/api/issues/unassigned').then((r) => r.data);

// POST /api/issues  (CITIZEN)
export const createIssue = (data) =>
  axiosInstance.post('/api/issues', data).then((r) => r.data);

// POST /api/issues/assign  (ADMIN)
export const assignIssue = (data) =>
  axiosInstance.post('/api/issues/assign', data).then((r) => r.data);

// POST /api/issues/bulk-assign
export const bulkAssignIssues = (data) =>
  axiosInstance.post('/api/issues/bulk-assign', data).then((r) => r.data);

// PUT /api/issues/:issueId/resolve
export const resolveIssue = (issueId, data) =>
  axiosInstance.put(`/api/issues/${issueId}/resolve`, data).then((r) => r.data);

// ─── Helper: normalise flat DTO → shape the frontend components expect ────────
// Your backend returns flat fields like categoryName, assignedOfficerName
// instead of nested objects. This helper converts them so all components work.
export const normaliseIssue = (i) => ({
  ...i,
  // category object
  category: i.category ?? (i.categoryId ? { categoryId: i.categoryId, name: i.categoryName } : null),
  // reportedBy object
  reportedBy: i.reportedBy ?? (i.reportedById ? { userId: i.reportedById, name: i.reportedByName, email: i.reportedByEmail, zone: i.locationType } : null),
  // assignedOfficer object
  assignedOfficer: i.assignedOfficer ?? (i.assignedOfficerId ? { userId: i.assignedOfficerId, name: i.assignedOfficerName } : null),
  // assignedDepartment object
  assignedDepartment: i.assignedDepartment ?? (i.assignedDepartmentId ? { departmentId: i.assignedDepartmentId, departmentName: i.assignedDepartmentName } : null),
});