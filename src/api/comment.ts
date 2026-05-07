import api from './axios'

// 创建评论
export const createComment = (data: { context: string; score: number; shopId?: string; dishId?: string }) => {
  return api.post('/comment/create', data)
}

// 查询店铺评论
export const getShopComments = (shopId: string) => {
  return api.get(`/comment/shop/${shopId}`)
}

// 查询菜品评论
export const getDishComments = (dishId: string) => {
  return api.get(`/comment/dish/${dishId}`)
}

// 查询用户评论
export const getUserComments = () => {
  return api.get('/comment/user')
}

// 获取店铺平均评分
export const getShopScore = (shopId: string) => {
  return api.get(`/comment/shop/${shopId}/score`)
}

// 获取菜品平均评分
export const getDishScore = (dishId: string) => {
  return api.get(`/comment/dish/${dishId}/score`)
}

// 删除评论
export const deleteComment = (commentId: string) => {
  return api.delete(`/comment/delete/${commentId}`)
}