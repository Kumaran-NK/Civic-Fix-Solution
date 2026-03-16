import axiosInstance from './axiosInstance';

// GET /api/users/:id
export const getUserById = (id) =>
  axiosInstance.get(`/api/users/${id}`).then((r) => r.data);

// --- Admin user management ---

// GET /api/admin/users
export const getAllUsers = () =>
  axiosInstance.get('/api/admin/users').then((r) => r.data);

// GET /api/admin/users/role/:role
export const getUsersByRole = (role) =>
  axiosInstance.get(`/api/admin/users/role/${role}`).then((r) => r.data);

// GET /api/admin/users/department/:departmentId
export const getUsersByDepartment = (departmentId) =>
  axiosInstance.get(`/api/admin/users/department/${departmentId}`).then((r) => r.data);

// PUT /api/admin/users/:userId/role
// body: { role }
export const updateUserRole = (userId, data) =>
  axiosInstance.put(`/api/admin/users/${userId}/role`, data).then((r) => r.data);

// DELETE /api/admin/users/:userId
export const deleteUser = (userId) =>
  axiosInstance.delete(`/api/admin/users/${userId}`).then((r) => r.data);

// GET /api/admin/statistics
export const getSystemStatistics = () =>
  axiosInstance.get('/api/admin/statistics').then((r) => r.data);