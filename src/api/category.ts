import api from './axios'

// 根据店铺ID获取分类列表
export const getCategoriesByShop = (shopId: string) => {
  return api.get(`/category/shop/${shopId}`)
}

// 关键词搜索分类（按名称模糊匹配）
export const searchCategories = (keyword: string) => {
  return api.get('/category/search', { params: { keyword } })
}
