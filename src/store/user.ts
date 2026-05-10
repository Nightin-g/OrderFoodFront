import { defineStore } from 'pinia'
import type { UserRole } from '../types'
import { getCurrentUser } from '../api/user'
import { getCurrentShop } from '../api/shop'
import { getCurrentAdmin } from '../api/admin'

const savedToken = localStorage.getItem('token') || ''
const savedRole = (localStorage.getItem('role') || '') as UserRole
const savedLoginFlag = localStorage.getItem('loggedIn') === '1'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: !!savedToken || savedLoginFlag,
    role: savedRole || '' as UserRole,
    userInfo: null as any,
    token: savedToken
  }),
  getters: {
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
    getRole: (state) => state.role,
    isUser: (state) => state.role === 'user',
    isShop: (state) => state.role === 'shop',
    isAdmin: (state) => state.role === 'admin'
  },
  actions: {
    setToken(token: string) {
      this.token = token
      this.isLoggedIn = true
      localStorage.setItem('token', token)
    },
    setRole(role: UserRole) {
      this.role = role
      localStorage.setItem('role', role)
    },
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo
      this.isLoggedIn = true
    },
    markLoggedIn() {
      this.isLoggedIn = true
      localStorage.setItem('loggedIn', '1')
    },
    async fetchCurrentInfo() {
      try {
        let response: any
        if (this.role === 'user') {
          response = await getCurrentUser()
        } else if (this.role === 'shop') {
          response = await getCurrentShop()
        } else if (this.role === 'admin') {
          response = await getCurrentAdmin()
        } else {
          return
        }
        if (response.data?.code === 200 && response.data?.data) {
          this.userInfo = response.data.data
          this.isLoggedIn = true
        }
      } catch (err: any) {
        // 如果是认证失败（401），清理本地登录态
        if (err?.response?.status === 401) {
          this.logout()
        }
      }
    },
    logout() {
      this.token = ''
      this.userInfo = null
      this.isLoggedIn = false
      this.role = '' as UserRole
      localStorage.removeItem('token')
      localStorage.removeItem('loggedIn')
      localStorage.removeItem('role')
    }
  }
})
