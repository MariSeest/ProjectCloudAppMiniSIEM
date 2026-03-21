import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'

const api = axios.create({
    baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api',
    timeout: 15000,
})

api.interceptors.response.use(
    (r: AxiosResponse) => r,
    (err: AxiosError) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('minisiem_token')
            window.location.href = '/group-5/login'
        }
        const data = err.response?.data as any
        return Promise.reject(data?.message || err.message || 'Request failed')
    }
)

export default api