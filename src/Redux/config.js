export const BASE_URL = 'http://10.10.13.75:8088'

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access') || ''
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}
