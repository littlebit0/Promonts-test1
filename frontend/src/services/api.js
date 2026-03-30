import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (JWT 토큰 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Course API
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getMy: () => api.get('/courses/my'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Todo API
export const todoAPI = {
  getAll: (completed) => api.get('/todos', { params: { completed } }),
  getById: (id) => api.get(`/todos/${id}`),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
  toggle: (id) => api.patch(`/todos/${id}/toggle`),
};

// Assignment API
export const assignmentAPI = {
  getAllByCourse: (courseId) => api.get(`/courses/${courseId}/assignments`),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (courseId, data) => api.post(`/courses/${courseId}/assignments`, data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

// Submission API
export const submissionAPI = {
  submit: (assignmentId, formData) => {
    return api.post(`/submissions/${assignmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getMy: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}/my`),
  grade: (submissionId, score, feedback) => api.patch(`/submissions/${submissionId}/grade`, null, { params: { score, feedback } }),
  delete: (submissionId) => api.delete(`/submissions/${submissionId}`),
};

// Notice API
export const noticeAPI = {
  getAll: () => api.get('/notices'),
  getAllByCourse: (courseId) => api.get(`/courses/${courseId}/notices`),
  getById: (id) => api.get(`/notices/${id}`),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
};

// Week API
export const weekAPI = {
  getWeeks: (courseId) => api.get(`/courses/${courseId}/weeks`),
  getWeekDetail: (courseId, weekNumber) => api.get(`/courses/${courseId}/weeks/${weekNumber}`),
  updateDescription: (weekId, description) => api.put(`/courses/${courseId}/weeks/${weekId}/description`, description),
};

// Enrollment API
export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  unenroll: (courseId) => api.delete(`/enrollments/${courseId}`),
  getEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
  checkEnrollment: (courseId) => api.get(`/enrollments/course/${courseId}/check`),
};

// Search API
export const searchAPI = {
  search: (query) => api.get('/search', { params: { query } }),
  searchCourses: (query) => api.get('/search/courses', { params: { query } }),
  searchNotices: (query) => api.get('/search/notices', { params: { query } }),
  searchAssignments: (query) => api.get('/search/assignments', { params: { query } }),
};

// Attendance API
export const attendanceAPI = {
  createSession: (courseId, durationMinutes = 10) => api.post('/attendance/session', null, { params: { courseId, durationMinutes } }),
  checkAttendance: (qrCode) => api.post('/attendance/check', null, { params: { qrCode } }),
  getCourseAttendances: (courseId) => api.get(`/attendance/course/${courseId}`),
  getMyAttendances: () => api.get('/attendance/my'),
  getActiveSession: (courseId) => api.get(`/attendance/session/${courseId}`),
};

// Exam API
export const examAPI = {
  create: (courseId, data) => api.post(`/exams/course/${courseId}`, data),
  update: (examId, data) => api.put(`/exams/${examId}`, data),
  delete: (examId) => api.delete(`/exams/${examId}`),
  getByCourse: (courseId) => api.get(`/exams/course/${courseId}`),
  getUpcoming: (courseId) => api.get(`/exams/course/${courseId}/upcoming`),
  getById: (examId) => api.get(`/exams/${examId}`),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (oldPassword, newPassword) => api.post('/profile/password', null, { params: { oldPassword, newPassword } }),
};

// Tag API
export const tagAPI = {
  getAll: () => api.get('/tags'),
  getById: (id) => api.get(`/tags/${id}`),
  create: (name, color) => api.post('/tags', null, { params: { name, color } }),
  update: (id, name, color) => api.put(`/tags/${id}`, null, { params: { name, color } }),
  delete: (id) => api.delete(`/tags/${id}`),
};

// Comment API
export const commentAPI = {
  create: (entityType, entityId, content, parentId = null) => 
    api.post('/comments', null, { params: { entityType, entityId, content, parentId } }),
  update: (id, content) => api.put(`/comments/${id}`, null, { params: { content } }),
  delete: (id) => api.delete(`/comments/${id}`),
  getByEntity: (entityType, entityId) => api.get('/comments', { params: { entityType, entityId } }),
  getRootComments: (entityType, entityId) => api.get('/comments/root', { params: { entityType, entityId } }),
  getReplies: (parentId) => api.get(`/comments/${parentId}/replies`),
};

// Grade API
export const gradeAPI = {
  createOrUpdate: (userId, courseId, midterm, finalScore, assignment, attendance) =>
    api.post('/grades', null, { params: { userId, courseId, midterm, finalScore, assignment, attendance } }),
  getMy: () => api.get('/grades/my'),
  getByCourse: (courseId) => api.get(`/grades/course/${courseId}`),
  get: (userId, courseId) => api.get(`/grades/user/${userId}/course/${courseId}`),
};

// Schedule API
export const scheduleAPI = {
  create: (data, courseId = null) => api.post('/schedules', data, { params: { courseId } }),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getMy: () => api.get('/schedules'),
  getByRange: (start, end) => api.get('/schedules/range', { params: { start, end } }),
  getById: (id) => api.get(`/schedules/${id}`),
};

// Bookmark API
export const bookmarkAPI = {
  add: (entityType, entityId) => api.post('/bookmarks', null, { params: { entityType, entityId } }),
  remove: (entityType, entityId) => api.delete('/bookmarks', { params: { entityType, entityId } }),
  getAll: () => api.get('/bookmarks'),
  getByType: (entityType) => api.get(`/bookmarks/type/${entityType}`),
  check: (entityType, entityId) => api.get('/bookmarks/check', { params: { entityType, entityId } }),
};

// Statistics API
export const statisticsAPI = {
  getAdmin: () => api.get('/statistics/admin'),
  getUser: () => api.get('/statistics/user'),
};

// Activity Log API
export const activityLogAPI = {
  getMy: () => api.get('/logs/my'),
  getAll: () => api.get('/logs/all'),
  getByRange: (start, end) => api.get('/logs/range', { params: { start, end } }),
};

// Timeline API
export const timelineAPI = {
  getMy: () => api.get('/timeline'),
};

// Backup API
export const backupAPI = {
  create: () => api.post('/backup/create'),
  restore: (filepath) => api.post('/backup/restore', null, { params: { filepath } }),
  list: () => api.get('/backup/list'),
};

// Material API
export const materialAPI = {
  upload: (courseId, weekNumber, formData) => {
    return api.post(`/courses/${courseId}/weeks/${weekNumber}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (courseId, materialId) => api.delete(`/courses/${courseId}/weeks/materials/${materialId}`),
  download: (materialId) => api.get(`/materials/${materialId}/download`, { responseType: 'blob' }),
};

// Dashboard API
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export default api;
