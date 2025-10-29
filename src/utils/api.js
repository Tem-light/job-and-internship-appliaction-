import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // must exist
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    throw error.response?.data || error;
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },
};


export const jobAPI = {
  getAllJobs: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    return api.get(`/jobs?${params.toString()}`);
  },

  getJobById: (id) => api.get(`/jobs/${id}`),

  createJob: (jobData) => api.post('/jobs', jobData),

  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),

  deleteJob: (id) => api.delete(`/jobs/${id}`),

  getRecruiterJobs: () => api.get('/jobs/recruiter/my-jobs'),
};

export const applicationAPI = {
applyForJob: (jobId, applicationData) =>
  api.post(`/applications/job/${jobId}`, applicationData),

  getStudentApplications: () => api.get('/applications/student/my-applications'),

  getJobApplicants: (jobId) => api.get(`/applications/job/${jobId}/applicants`),

  updateApplicationStatus: (applicationId, status) => 
    api.put(`/applications/${applicationId}/status`, { status }),
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response;
  },

  // ✅ FIX: remove "/profile" from endpoint
  updateProfile: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response;
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response;
  },

  approveRecruiter: async (recruiterId) => {
    const response = await api.put(`/users/${recruiterId}/approve`);
    return response;
  },

  blockUser: async (userId) => {
    const response = await api.put(`/users/${userId}/block`);
    return response;
  },
};


export const statsAPI = {
  getAdminStats: async () => {
    const response = await api.get('/stats/admin');
    return response;
  },

  getRecruiterStats: async () => {
    const response = await api.get('/stats/recruiter');
    return response;
  },

  getStudentStats: async () => {
    const response = await api.get('/stats/student');
    return response;
  },
};

export default api;
