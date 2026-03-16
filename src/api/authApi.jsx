import axiosInstance from './axiosInstance';

// POST /api/auth/register
export const registerUser = (data) =>
  axiosInstance.post('/api/auth/register', data).then((r) => r.data);

// POST /api/auth/login
export const loginUser = (data) =>
  axiosInstance.post('/api/auth/login', data).then((r) => r.data);