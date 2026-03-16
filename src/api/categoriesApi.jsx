import axiosInstance from './axiosInstance';

// GET /api/issue-categories
export const getAllCategories = () =>
  axiosInstance.get('/api/issue-categories').then((r) => r.data);

// GET /api/issue-categories/:id
export const getCategoryById = (id) =>
  axiosInstance.get(`/api/issue-categories/${id}`).then((r) => r.data);

// POST /api/issue-categories  (ADMIN)
// body: { name, baseScore, departmentId }
export const createCategory = (data) =>
  axiosInstance.post('/api/issue-categories', data).then((r) => r.data);

// PUT /api/issue-categories/:id  (ADMIN)
export const updateCategory = (id, data) =>
  axiosInstance.put(`/api/issue-categories/${id}`, data).then((r) => r.data);

// DELETE /api/issue-categories/:id  (ADMIN)
export const deleteCategory = (id) =>
  axiosInstance.delete(`/api/issue-categories/${id}`).then((r) => r.data);