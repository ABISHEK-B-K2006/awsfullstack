import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT Bearer Token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('insureflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling token expiration / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('insureflow_token');
        localStorage.removeItem('insureflow_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints Mapping
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const policyAPI = {
  getAll: () => api.get('/policies'),
  getMyPolicies: () => api.get('/policies/my-policies'),
  getById: (id) => api.get(`/policies/${id}`),
  create: (data) => api.post('/policies', data),
  activate: (id) => api.patch(`/policies/${id}/activate`),
  delete: (id) => api.delete(`/policies/${id}`)
};

export const assessmentAPI = {
  getAll: () => api.get('/assessments'),
  getByPolicyId: (policyId) => api.get(`/assessments/policy/${policyId}`),
  create: (data) => api.post('/assessments', data),
  calculate: (data) => api.post('/assessments/calculate', data)
};

export const claimAPI = {
  getAll: () => api.get('/claims'),
  getMyClaims: () => api.get('/claims/my-claims'),
  getById: (id) => api.get(`/claims/${id}`),
  submit: (data) => api.post('/claims', data),
  review: (id, data) => api.patch(`/claims/${id}/review`, data),
  adjudicate: (id, data) => api.patch(`/claims/${id}/adjudicate`, data),
  delete: (id) => api.delete(`/claims/${id}`)
};

export const disbursementAPI = {
  getAll: () => api.get('/disbursements'),
  getMyDisbursements: () => api.get('/disbursements/my-disbursements'),
  getById: (id) => api.get(`/disbursements/${id}`),
  execute: (id, data) => api.post(`/disbursements/${id}/execute`, data || {})
};

export const publicAPI = {
  track: (code) => api.get(`/public/track/${encodeURIComponent(code)}`)
};

export const analyticsAPI = {
  getMetrics: () => api.get('/analytics/metrics')
};

export default api;
