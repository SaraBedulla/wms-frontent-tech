import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('wms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wms_token')
      localStorage.removeItem('wms_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)

// Orders - Client
export const createOrder = (data) => api.post('/orders', data)
export const getMyOrders = (status) => api.get('/orders', { params: status ? { status } : {} })
export const getMyOrderById = (id) => api.get(`/orders/${id}`)
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data)
export const submitOrder = (id) => api.post(`/orders/${id}/submit`)
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`)

// Orders - Manager
export const getAllOrders = (status) => api.get('/manager/orders', { params: status ? { status } : {} })
export const getOrderById = (id) => api.get(`/manager/orders/${id}`)
export const approveOrder = (id) => api.post(`/manager/orders/${id}/approve`)
export const declineOrder = (id, data) => api.post(`/manager/orders/${id}/decline`, data)
export const fulfillOrder = (id) => api.post(`/manager/orders/${id}/fulfill`)

// Inventory
export const getInventory = () => api.get('/inventory')
export const getInventoryItem = (id) => api.get(`/inventory/${id}`)
export const createInventoryItem = (data) => api.post('/inventory', data)
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data)
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`)

// Admin - Users
export const getAllUsers = () => api.get('/admin/users')
export const getUserById = (id) => api.get(`/admin/users/${id}`)
export const createUser = (data) => api.post('/admin/users', data)
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)

// Attachments
export const listAttachments = (orderId) =>
  api.get(`/orders/${orderId}/attachments`)

export const uploadAttachment = (orderId, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/orders/${orderId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getAttachmentPresignedUrl = (orderId, attachmentId) =>
  api.get(`/orders/${orderId}/attachments/${attachmentId}/url`)

export const downloadAttachment = (orderId, attachmentId) =>
  api.get(`/orders/${orderId}/attachments/${attachmentId}`, { responseType: 'blob' })

export const deleteAttachment = (orderId, attachmentId) =>
  api.delete(`/orders/${orderId}/attachments/${attachmentId}`)

export default api
