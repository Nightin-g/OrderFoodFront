import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import type { ApiResponse } from '../types'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token && config.headers) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const responseType = response.config.responseType || 'json'
    
    if (responseType === 'blob') {
      return response
    }
    
    const data = response.data as ApiResponse
    if (data && typeof data.code === 'number' && data.code !== 200) {
      ElMessage.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg))
    }
    
    return response
  },
  (error) => {
    console.error('响应拦截器错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          ElMessage.error(data?.msg || '请求参数错误')
          break
        case 401: {
          ElMessage.error(data?.msg || '未授权，请先登录')
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        }
        case 403:
          ElMessage.error(data?.msg || '权限不足')
          break
        case 404:
          ElMessage.error(data?.msg || '资源不存在')
          break
        case 500:
          ElMessage.error(data?.msg || '系统内部错误')
          break
        default:
          ElMessage.error('网络请求失败')
      }
    } else if (error.request) {
      ElMessage.error('请求超时或网络异常')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default api