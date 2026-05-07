import api from './axios'

// 获取当前登录店铺信息
export const getCurrentShop = () => {
  return api.get('/shop/me')
}

// 店铺注册
export const registerShop = (data: { shopName: string; shopAccount: string; password: string; confirmPassword: string; shopType: number; shopPhone: string; position: number; captcha: string; captchaKey: string }) => {
  return api.post('/shop/register', data)
}

// 店铺登录
export const loginShop = (data: { shopAccount: string; password: string; captcha: string; captchaKey: string }) => {
  return api.post('/shop/login', data)
}

// 修改店铺信息
export const updateShop = (data: { shopName: string; shopType: number; shopPhone: string; deliveryFee: number; shopPhoto: string; operating: number; position: number }) => {
  return api.put('/shop/update', data)
}

// 添加菜品
export const addDish = (data: { dishName: string; categoryId: string; price: number; ingredients: string; dishPhoto: string; dishPhotoId: string }) => {
  return api.post('/shop/dishes', data)
}

// 店铺开始营业
export const openShop = () => {
  return api.put('/shop/status/open')
}

// 店铺进入休息
export const restShop = () => {
  return api.put('/shop/status/rest')
}

// 店铺暂时歇业
export const temporaryCloseShop = () => {
  return api.put('/shop/status/temporary-close')
}

// 店铺恢复营业
export const resumeShop = () => {
  return api.put('/shop/status/resume')
}

// 店铺永久停业
export const permanentCloseShop = () => {
  return api.put('/shop/status/permanent-close')
}
