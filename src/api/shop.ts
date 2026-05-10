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

// 获取所有已审核通过的店铺列表（公开）
export const getShopList = () => {
  return api.get('/shop/list')
}

// 关键词搜索店铺（按名称模糊匹配）
export const searchShops = (keyword: string) => {
  return api.get('/shop/search', { params: { keyword } })
}

// 获取单个店铺详情（公开）
export const getShopDetail = (shopId: string) => {
  return api.get(`/shop/detail/${shopId}`)
}
