import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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
