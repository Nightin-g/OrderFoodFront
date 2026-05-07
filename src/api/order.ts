import api from './axios'

// 创建订单
export const createOrder = (data: { items: { dishId: string; dishName: string; quantity: number; price: number }[]; totalPrice: number; address: string; phone: string; remark?: string }) => {
  return api.post('/order/create', data)
}

// 查询用户订单
export const getUserOrders = () => {
  return api.get('/order/user')
}

// 查询订单详情
export const getOrderDetail = (orderId: string) => {
  return api.get(`/order/detail/${orderId}`)
}

// 取消订单
export const cancelOrder = (orderId: string) => {
  return api.put(`/order/cancel/${orderId}`)
}

// 支付订单
export const payOrder = (orderId: string) => {
  return api.put(`/order/pay/${orderId}`)
}

// 确认取餐
export const pickupOrder = (orderId: string) => {
  return api.put(`/order/pickup/${orderId}`)
}

// 评价订单
export const evaluateOrder = (orderId: string, score: number, comment: string) => {
  return api.put(`/order/evaluate/${orderId}`, {}, {
    params: { score, comment }
  })
}

// 申请退款
export const refundOrder = (orderId: string, reason: string) => {
  return api.put(`/order/refund/${orderId}`, {}, {
    params: { reason }
  })
}

// 查询店铺订单
export const getShopOrders = () => {
  return api.get('/order/shop')
}

// 店铺接单
export const acceptOrder = (orderId: string) => {
  return api.put(`/order/shop/accept/${orderId}`)
}

// 店铺拒绝订单
export const rejectOrder = (orderId: string) => {
  return api.put(`/order/shop/reject/${orderId}`)
}

// 店铺标记为出餐
export const preparingOrder = (orderId: string) => {
  return api.put(`/order/shop/preparing/${orderId}`)
}

// 店铺标记为配送中
export const deliveringOrder = (orderId: string) => {
  return api.put(`/order/shop/delivering/${orderId}`)
}

// 店铺标记为待取餐
export const readyOrder = (orderId: string) => {
  return api.put(`/order/shop/ready/${orderId}`)
}