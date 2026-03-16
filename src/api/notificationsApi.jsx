import axiosInstance from './axiosInstance';

// GET /api/notifications/user/:userId
export const getNotificationsByUser = (userId) =>
  axiosInstance.get(`/api/notifications/user/${userId}`).then((r) => r.data);

// GET /api/notifications/user/:userId/unread
export const getUnreadNotifications = (userId) =>
  axiosInstance.get(`/api/notifications/user/${userId}/unread`).then((r) => r.data);

// PUT /api/notifications/:id/read
export const markNotificationAsRead = (id) =>
  axiosInstance.put(`/api/notifications/${id}/read`).then((r) => r.data);

// POST /api/notifications — send to a single user
// body: { userId, type, message, issueId? }
export const createNotification = (data) =>
  axiosInstance.post('/api/notifications', data).then((r) => r.data);

// POST /api/admin/notifications/broadcast — send to all users of given roles
// body: { type, message, targetRoles: ["CITIZEN","OFFICER","ADMIN"] }
export const broadcastNotification = (data) =>
  axiosInstance.post('/api/admin/notifications/broadcast', data).then((r) => r.data);

// GET /api/admin/notifications — all notifications in system
export const getAllNotifications = () =>
  axiosInstance.get('/api/admin/notifications').then((r) => r.data);