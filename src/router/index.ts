import { createRouter, createWebHistory } from 'vue-router'

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
      component: () => import('../views/Dishes.vue')
    },
    {
      path: '/shop/:shopId',
      name: 'shopDetail',
      component: () => import('../views/ShopDetail.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/Cart.vue')
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
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('token')
  const loggedIn = localStorage.getItem('loggedIn') === '1'

  if (requiresAuth && !token && !loggedIn) {
    next('/login')
    return
  }

  // 角色校验
  if (requiresAuth && to.meta.roles) {
    const allowedRoles = to.meta.roles as string[]
    const userRole = localStorage.getItem('role') || ''
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      next('/')
      return
    }
  }

  next()
})

export default router
