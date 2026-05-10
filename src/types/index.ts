// 用户信息类型
export interface UserInfo {
  userId: string
  userAccount: string
  password?: string
  userName?: string
  phoneNum?: string
  address?: string
  sex?: number
  userPhoto?: string
  createTime?: string
  userStatus?: number
}

// 店铺信息类型
export interface ShopInfo {
  shopId: string
  shopName: string
  shopAccount: string
  password?: string
  shopStatus: number
  shopType: number
  operating: number
  shopSales?: number
  deliveryFee: number
  shopPhone: string
  position: number
  shopScore: number
  shopPhoto?: string
  shopPhotoId?: string
  createTime: string
  shopScorePerson: number
}

// 菜品类型
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

// 订单类型
export interface Order {
  orderId: string
  orderNum: string
  userId: string
  shopId: string
  orderPrice: number
  orderStatus: number
  createTime: string
  finishTime?: string
}

// 订单详情类型
export interface OrderDetail extends Order {
  items: OrderItem[]
}

// 订单项类型
export interface OrderItem {
  dishId: string
  dishName: string
  quantity: number
  price?: number
}

// 评论类型
export interface Comment {
  commentId: string
  context: string
  score: number
  shopId: string
  userId: string
  dishId?: string
  createTime: string
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
  extra?: Record<string, any>
}

// 用户状态枚举
export enum UserStatus {
  NORMAL = 0,
  RESTRICTED = 1,
  CANCELLED = 2
}

// 店铺状态枚举
export enum ShopStatus {
  PENDING_REVIEW = 0,
  OPEN = 1,
  REST = 2,
  TEMPORARILY_CLOSED = 3,
  PERMANENTLY_CLOSED = 4,
  REVIEW_FAILED = 5
}

// 菜品状态枚举
export enum DishStatus {
  PENDING_REVIEW = 0,
  ON_SHELF = 1,
  SOLD_OUT = 2,
  TEMPORARILY_OFF_SHELF = 3,
  DELETED = 4,
  REVIEW_FAILED = 5
}

// 订单状态枚举（商家自配送模式：已支付→待取餐→已取餐→已评价）
export enum OrderStatus {
  PENDING_PAYMENT = 0,
  PAID = 1,
  DELIVERING = 3,
  READY_FOR_PICKUP = 4,
  PICKED_UP_UNEVALUATED = 5,
  EVALUATED = 6,
  CANCELLED = 7,
  REFUNDING = 8,
  REFUNDED = 9
}

// 分类状态枚举
export enum CategoryStatus {
  NOT_USED = 0,
  IN_USE = 1,
  TEMPORARILY_DISABLED = 2
}

// 用户角色枚举
export enum UserRole {
  USER = 'user',
  SHOP = 'shop',
  ADMIN = 'admin'
}