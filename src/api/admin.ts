import api from './axios'

// 获取当前登录管理员信息
export const getCurrentAdmin = () => {
  return api.get('/admin/me')
}

// 管理员登录
export const adminLogin = (data: { adminAccount: string; password: string }) => {
  return api.post('/admin/login', data)
}

// 查询未审核的菜品
export const getPendingDishes = () => {
  return api.get('/admin/dishes/pending')
}

// 查询未审核的店铺
export const getPendingShops = () => {
  return api.get('/admin/shops/pending')
}

// 审核菜品通过
export const approveDish = (dishId: string) => {
  return api.put(`/admin/dishes/${dishId}/approve`)
}

// 审核菜品不通过
export const rejectDish = (dishId: string) => {
  return api.put(`/admin/dishes/${dishId}/reject`)
}

// 审核店铺通过
export const approveShop = (shopId: string) => {
  return api.put(`/admin/shops/${shopId}/approve`)
}

// 审核店铺不通过
export const rejectShop = (shopId: string) => {
  return api.put(`/admin/shops/${shopId}/reject`)
}