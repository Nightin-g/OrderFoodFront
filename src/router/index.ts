import { createRouter, createWebHistory } from 'vue-router'

// 无需登录即可访问的路由
const PUBLIC_PATHS = ['/', '/login', '/register']

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/dishes',
      name: 'dishes',
      component: () => import('../views/Dishes.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shop/:shopId',
      name: 'shopDetail',
      component: () => import('../views/ShopDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/Cart.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/Checkout.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/order',
      name: 'order',
      component: () => import('../views/Order.vue'),
      meta: { requiresAuth: true, roles: ['user'] }
    },
    {
      path: '/order/detail/:orderId',
      name: 'orderDetail',
      component: () => import('../views/OrderDetail.vue'),
      meta: { requiresAuth: true, roles: ['user'] }
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/Shop.vue'),
      meta: { requiresAuth: true, roles: ['shop'] }
    },
    {
      path: '/comment',
      name: 'comment',
      component: () => import('../views/Comment.vue'),
      meta: { requiresAuth: true, roles: ['user', 'shop'] }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
      meta: { requiresAuth: true, roles: ['admin'] }
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 公开页面直接放行
  if (PUBLIC_PATHS.includes(to.path)) {
    next()
    return
  }

  const token = localStorage.getItem('token')
  const loggedIn = localStorage.getItem('loggedIn') === '1'

  // 未登录 → 跳转到登录页
  if (!token && !loggedIn) {
    next('/login')
    return
  }

  // 角色校验
  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = localStorage.getItem('role') || ''
    if (!allowedRoles.includes(userRole)) {
      next('/')
      return
    }
  }

  next()
})

export default router
