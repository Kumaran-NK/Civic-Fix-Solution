import axiosInstance from './axiosInstance';

// GET /api/departments
export const getAllDepartments = () =>
  axiosInstance.get('/api/departments').then((r) => r.data);

// GET /api/departments/:id
export const getDepartmentById = (id) =>
  axiosInstance.get(`/api/departments/${id}`).then((r) => r.data);

// POST /api/departments  (ADMIN)
// body: { departmentName, description }
export const createDepartment = (data) =>
  axiosInstance.post('/api/departments', data).then((r) => r.data);

// PUT /api/departments/:id  (ADMIN)
export const updateDepartment = (id, data) =>
  axiosInstance.put(`/api/departments/${id}`, data).then((r) => r.data);

// DELETE /api/departments/:id  (ADMIN)
export const deleteDepartment = (id) =>
  axiosInstance.delete(`/api/departments/${id}`).then((r) => r.data);