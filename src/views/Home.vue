<template>
  <div class="home-page">
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <span class="brand-icon">🍽️</span>
            <span class="brand-name">大学食堂订餐系统</span>
          </router-link>
        </div>
        <div class="navbar-menu">
          <router-link to="/dishes" class="nav-item">菜品浏览</router-link>

          <!-- 未登录 -->
          <template v-if="!userStore.isLoggedIn">
            <router-link to="/login" class="nav-item">登录</router-link>
            <router-link to="/register" class="nav-item">注册</router-link>
          </template>

          <!-- 已登录：所有角色共有 -->
          <template v-if="userStore.isLoggedIn">
            <router-link to="/profile" class="nav-item">个人中心</router-link>
          </template>

          <!-- 普通用户 -->
          <template v-if="userStore.isUser">
            <router-link to="/order" class="nav-item">我的订单</router-link>
            <router-link to="/comment" class="nav-item">我的评论</router-link>
          </template>

          <!-- 店铺用户 -->
          <template v-if="userStore.isShop">
            <router-link to="/shop" class="nav-item">店铺管理</router-link>
            <router-link to="/comment" class="nav-item">我的评论</router-link>
          </template>

          <!-- 管理员 -->
          <template v-if="userStore.isAdmin">
            <router-link to="/admin" class="nav-item">管理员后台</router-link>
          </template>

          <router-link to="/cart" class="nav-item cart-nav-item">
            购物车
            <span v-if="cartStore.totalCount > 0" class="cart-badge">{{ cartStore.totalCount }}</span>
          </router-link>

          <button v-if="userStore.isLoggedIn" @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <!-- 未登录 Hero -->
    <div v-if="!userStore.isLoggedIn" class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到大学食堂订餐系统</h1>
        <p class="hero-subtitle">便捷订餐，美味送达</p>
        <div class="hero-buttons">
          <router-link to="/dishes" class="btn btn-primary hero-btn">
            <span>立即订餐</span>
            <span class="btn-icon">→</span>
          </router-link>
          <router-link to="/register" class="btn btn-outline hero-btn">注册账号</router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="food-illustration">🍔🍕🍟🥗</div>
      </div>
    </div>

    <!-- 普通用户 Hero -->
    <div v-if="userStore.isUser" class="hero-section user-hero">
      <div class="hero-content">
        <h1 class="hero-title">{{ userStore.userInfo?.userName || userStore.userInfo?.userAccount || '欢迎回来' }}，今天想吃点什么？</h1>
        <p class="hero-subtitle">浏览菜品，一键下单，美味即刻送达</p>
        <div class="hero-buttons">
          <router-link to="/dishes" class="btn btn-primary hero-btn">
            <span>浏览菜品</span>
            <span class="btn-icon">→</span>
          </router-link>
          <router-link to="/order" class="btn btn-outline hero-btn">查看订单</router-link>
        </div>
      </div>
    </div>

    <!-- 店铺用户 Hero -->
    <div v-if="userStore.isShop" class="hero-section shop-hero">
      <div class="hero-content">
        <h1 class="hero-title">欢迎回来，{{ userStore.userInfo?.shopName || '店铺管理者' }}</h1>
        <p class="hero-subtitle">管理您的店铺、菜品和订单</p>
        <div class="hero-buttons">
          <router-link to="/shop" class="btn btn-primary hero-btn">
            <span>管理店铺</span>
            <span class="btn-icon">→</span>
          </router-link>
          <router-link to="/dishes" class="btn btn-outline hero-btn">浏览菜品</router-link>
        </div>
      </div>
    </div>

    <!-- 管理员 Hero -->
    <div v-if="userStore.isAdmin" class="hero-section admin-hero">
      <div class="hero-content">
        <h1 class="hero-title">管理员后台</h1>
        <p class="hero-subtitle">审核店铺和菜品，维护平台秩序</p>
        <div class="hero-buttons">
          <router-link to="/admin" class="btn btn-primary hero-btn">
            <span>进入后台</span>
            <span class="btn-icon">→</span>
          </router-link>
          <router-link to="/dishes" class="btn btn-outline hero-btn">浏览菜品</router-link>
        </div>
      </div>
    </div>

    <!-- 特性展示 -->
    <div class="features-section">
      <div class="section-title">
        <h2>为什么选择我们</h2>
        <p class="section-subtitle">便捷、高效、安全的订餐体验</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>快速下单</h3>
          <p>简单几步完成订餐，节省您的宝贵时间</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>准时送达</h3>
          <p>高效配送团队，确保餐食准时到达</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🍽️</div>
          <h3>丰富菜品</h3>
          <p>多种菜系任您选择，满足不同口味需求</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛡️</div>
          <h3>安全可靠</h3>
          <p>严格卫生标准，食品安全有保障</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>&copy; 2024 大学食堂订餐系统 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

onMounted(() => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    userStore.fetchCurrentInfo()
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.navbar {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand { display: flex; align-items: center; }

.brand-link {
  display: flex; align-items: center; text-decoration: none; color: #303133;
}

.brand-icon { font-size: 24px; margin-right: 8px; }

.brand-name { font-size: 18px; font-weight: 600; }

.navbar-menu { display: flex; align-items: center; gap: 8px; }

.nav-item {
  padding: 8px 16px; color: #606266; text-decoration: none;
  border-radius: 6px; transition: all 0.2s ease; font-size: 14px;
}

.nav-item:hover { background-color: #f5f7fa; color: #409eff; }

.cart-nav-item { display: flex; align-items: center; gap: 4px; }

.cart-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  background-color: #f56c6c; color: #fff;
  border-radius: 10px; font-size: 12px; font-weight: 600;
}

.logout-btn {
  padding: 8px 16px; background-color: #f56c6c; color: #fff;
  border: none; border-radius: 6px; cursor: pointer;
  font-size: 14px; transition: all 0.2s ease;
}

.logout-btn:hover { background-color: #f78989; }

/* Hero */
.hero-section {
  padding: 80px 24px; display: flex;
  justify-content: center; align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-hero { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.shop-hero { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.admin-hero { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.hero-content { text-align: center; color: #fff; }

.hero-title { font-size: 42px; font-weight: 700; margin-bottom: 16px; }

.hero-subtitle { font-size: 18px; opacity: 0.9; margin-bottom: 32px; }

.hero-buttons { display: flex; justify-content: center; gap: 16px; }

.hero-btn { padding: 14px 32px; font-size: 16px; }

.btn { border-radius: 10px; text-decoration: none; font-weight: 600;
  display: inline-flex; align-items: center; transition: all 0.2s; }

.btn-primary { background: #fff; color: #409eff; }
.btn-primary:hover { background: #ecf5ff; }

.btn-outline { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.5); }
.btn-outline:hover { background: rgba(255,255,255,0.15); border-color: #fff; }

.btn-icon { margin-left: 8px; }

.hero-image { display: none; }

.food-illustration { font-size: 120px; animation: float 3s ease-in-out infinite; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Features */
.features-section { padding: 60px 24px; max-width: 1200px; margin: 0 auto; }

.section-title { text-align: center; margin-bottom: 48px; }

.section-title h2 { font-size: 32px; font-weight: 600; color: #303133; margin-bottom: 8px; }

.section-subtitle { color: #909399; font-size: 14px; }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #fff; border-radius: 12px; padding: 32px;
  text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon { font-size: 48px; margin-bottom: 16px; }

.feature-card h3 { font-size: 18px; font-weight: 600; color: #303133; margin-bottom: 8px; }

.feature-card p { font-size: 14px; color: #909399; line-height: 1.6; }

.footer { background: #303133; color: #909399; text-align: center; padding: 24px; font-size: 14px; margin-top: 48px; }

@media (min-width: 768px) {
  .hero-section { padding: 100px 24px; }
  .hero-title { font-size: 52px; }
  .hero-image { display: block; margin-left: 60px; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 28px; }
  .navbar-menu { gap: 4px; flex-wrap: wrap; }
  .nav-item { padding: 6px 8px; font-size: 12px; }
}
</style>
