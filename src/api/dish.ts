import api from './axios'

// 查询所有上架的菜品
export const getOnShelfDishes = () => {
  return api.get('/dish/onShelf')
}

// 根据店铺查询菜品
export const getDishesByShop = (shopId: string) => {
  return api.get(`/dish/shop/${shopId}`)
}

// 根据分类查询菜品
export const getDishesByCategory = (categoryId: string) => {
  return api.get(`/dish/category/${categoryId}`)
}

// 查询菜品详情
export const getDishDetail = (dishId: string) => {
  return api.get(`/dish/${dishId}`)
}

// 更新菜品信息
export const updateDish = (data: Dish) => {
  return api.put('/dish', data)
}

// 更新菜品状态
export const updateDishStatus = (dishId: string, status: number) => {
  return api.put(`/dish/${dishId}/status`, {}, {
    params: { status }
  })
}

// 删除菜品
export const deleteDish = (dishId: string) => {
  return api.delete(`/dish/${dishId}`)
}

// 查询所有菜品（管理员）
export const getAllDishes = () => {
  return api.get('/dish/all')
}

// 菜品类型定义
export interface Dish {
  dishId: string
  dishName: string
  dishStatus: number
  forSale: number
  categoryId: string
  price: number
  dishSales: number
  dishScore: number
  dishScorePerson: number
  dishPhotoId: string
  dishPhoto: string
  ingredients: string
  createTime: string
  shopId: string
}