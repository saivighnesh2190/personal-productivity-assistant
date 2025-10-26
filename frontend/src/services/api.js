import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // In production, use relative path (nginx will proxy)
  : 'http://localhost:8080/api'; // In development, use direct backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  validate: () => api.get('/auth/validate'),
};

// Notes endpoints
export const notesAPI = {
  getAll: (archived = false) => api.get(`/notes?archived=${archived}`),
  getById: (id) => api.get(`/notes/${id}`),
  create: (note) => api.post('/notes', note),
  update: (id, note) => api.put(`/notes/${id}`, note),
  delete: (id) => api.delete(`/notes/${id}`),
  search: (query) => api.get(`/notes/search?q=${query}`),
};

// Tasks endpoints
export const tasksAPI = {
  getAll: (status = null, priority = null) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    return api.get(`/tasks?${params.toString()}`);
  },
  getById: (id) => api.get(`/tasks/${id}`),
  create: (task) => api.post('/tasks', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
  search: (query) => api.get(`/tasks/search?q=${query}`),
  getOverdue: () => api.get('/tasks/overdue'),
};

// AI endpoints
export const aiAPI = {
  summarize: (text) => api.post('/ai/summarize', { text }),
  summarizeNote: (noteId) => api.post(`/ai/summarize-note/${noteId}`),
  generateTasks: (text, autoCreate = false) => 
    api.post('/ai/generate-tasks', { text, autoCreate: autoCreate.toString() }),
  getDailySummary: () => api.get('/ai/daily-summary'),
  chat: (message, history = []) => api.post('/ai/chat', { message, history }),
  getInsights: () => api.get('/ai/insights'),
};

export default api;
