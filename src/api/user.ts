import api from './axios'

// 获取当前登录用户信息
export const getCurrentUser = () => {
  return api.get('/user/me')
}

// 用户登录
export const login = (data: { userAccount: string; password: string }) => {
  return api.post('/user/login', data)
}

// 用户注册
export const register = (data: { userAccount: string; password: string; confirmPassword: string; phoneNum: string; userName?: string }) => {
  return api.post('/user/register', data)
}

// 修改用户信息
export const updateUser = (data: { userName: string; sex: number; address: string; userPhoto: string; phone: string }) => {
  return api.put('/user/update', data)
}

// 修改密码
export const updatePassword = (data: { userId: string; password: string; newPassword: string; captcha: string; captchaKey: string }) => {
  return api.post('/user/updatePwd', data)
}
