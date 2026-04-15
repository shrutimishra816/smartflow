import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// --- Auth ---
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  me: () => api.get('/users/me'),
}

// --- Symptom Logs ---
export const logsAPI = {
  create:  (data)       => api.post('/logs/', data),
  getAll:  (skip = 0, limit = 50) => api.get(`/logs/?skip=${skip}&limit=${limit}`),
  getOne:  (id)         => api.get(`/logs/${id}`),
  update:  (id, data)   => api.put(`/logs/${id}`, data),
  delete:  (id)         => api.delete(`/logs/${id}`),
}

// --- Predictions ---
export const predictionsAPI = {
  predict: (data) => api.post('/predictions/predict', data),
  summary: ()     => api.get('/predictions/summary'),
  history: ()     => api.get('/predictions/history'),
}

// --- Watch Integration ---
export const watchAPI = {
  // Fitbit
  fitbitStatus:      ()     => api.get('/watch/fitbit/status'),
  fitbitAuth:        ()     => api.get('/watch/fitbit/auth'),
  fitbitDisconnect:  ()     => api.delete('/watch/fitbit/disconnect'),

  // Google Fit
  googleStatus:      ()     => api.get('/watch/googlefit/status'),
  googleAuth:        ()     => api.get('/watch/googlefit/auth'),
  googleDisconnect:  ()     => api.delete('/watch/googlefit/disconnect'),

  // Import
  importFile:        (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/watch/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  downloadTemplate:  ()     => api.get('/watch/import/template', { responseType: 'blob' }),
}

export default api
