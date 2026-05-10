<template>
  <div class="cart-page">
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <span class="brand-icon">🍽️</span>
            <span class="brand-name">大学食堂订餐系统</span>
          </router-link>
        </div>
        <div class="navbar-menu">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/dishes" class="nav-item">菜品浏览</router-link>
          <template v-if="userStore.isLoggedIn">
            <router-link to="/profile" class="nav-item">个人中心</router-link>
            <router-link v-if="userStore.isUser" to="/order" class="nav-item">我的订单</router-link>
            <router-link v-if="userStore.isShop" to="/shop" class="nav-item">店铺管理</router-link>
            <router-link v-if="userStore.isUser || userStore.isShop" to="/comment" class="nav-item">我的评论</router-link>
            <router-link v-if="userStore.isAdmin" to="/admin" class="nav-item">管理员后台</router-link>
          </template>
          <template v-if="!userStore.isLoggedIn">
            <router-link to="/login" class="nav-item">登录</router-link>
            <router-link to="/register" class="nav-item">注册</router-link>
          </template>
          <router-link to="/cart" class="nav-item cart-nav-item active">
            购物车
            <span v-if="cartStore.totalCount > 0" class="cart-badge">{{ cartStore.totalCount }}</span>
          </router-link>
          <button v-if="userStore.isLoggedIn" @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">购物车</h1>
        <button v-if="cartStore.totalCount > 0" class="clear-all-btn" @click="handleClearAll">清空购物车</button>
      </div>

      <div v-if="cartStore.items.length === 0" class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>购物车为空</h3>
        <p>快去浏览菜品，添加您喜欢的美食吧</p>
        <router-link to="/dishes" class="empty-link">去浏览 →</router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-main">
          <div
            class="shop-group"
            v-for="group in cartStore.groupedByShop"
            :key="group.shopId"
          >
            <div class="shop-group-header">
              <router-link :to="`/shop/${group.shopId}`" class="shop-name-link">
                🏪 {{ group.shopName }}
              </router-link>
              <button class="clear-shop-btn" @click="handleClearShop(group.shopId)">清空</button>
            </div>
            <div class="shop-items">
              <div class="cart-item" v-for="item in group.items" :key="item.dishId">
                <div class="item-image">
                  <img :src="item.dishPhoto || defaultImage" :alt="item.dishName" />
                </div>
                <div class="item-info">
                  <h4 class="item-name">{{ item.dishName }}</h4>
                  <span class="item-price">¥{{ Number(item.price).toFixed(2) }}</span>
                </div>
                <div class="item-qty">
                  <button class="qty-btn" @click="decreaseQty(item.dishId)">−</button>
                  <span class="qty-num">{{ item.quantity }}</span>
                  <button class="qty-btn" @click="increaseQty(item.dishId)">+</button>
                </div>
                <div class="item-subtotal">
                  ¥{{ (item.price * item.quantity).toFixed(2) }}
                </div>
                <button class="remove-btn" @click="removeItem(item.dishId)">✕</button>
              </div>
            </div>
            <div class="shop-subtotal">
              小计: <strong>¥{{ group.subtotal.toFixed(2) }}</strong>
            </div>
          </div>
        </div>

        <div class="cart-sidebar">
          <div class="summary-card">
            <h3 class="summary-title">订单摘要</h3>
            <div class="summary-row">
              <span>商品总额</span>
              <span>¥{{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>商品数量</span>
              <span>{{ cartStore.totalCount }} 件</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>合计</span>
              <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              class="checkout-btn"
              @click="goCheckout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <p>&copy; 2024 大学食堂订餐系统</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const defaultImage = 'https://via.placeholder.com/100x100?text=菜品'

const increaseQty = (dishId: string) => {
  const item = cartStore.items.find(i => i.dishId === dishId)
  if (item) {
    cartStore.updateQuantity(dishId, item.quantity + 1)
  }
}

const decreaseQty = (dishId: string) => {
  const item = cartStore.items.find(i => i.dishId === dishId)
  if (item && item.quantity <= 1) {
    cartStore.removeFromCart(dishId)
  } else if (item) {
    cartStore.updateQuantity(dishId, item.quantity - 1)
  }
}

const removeItem = (dishId: string) => {
  cartStore.removeFromCart(dishId)
}

const handleClearShop = (shopId: string) => {
  cartStore.clearShopItems(shopId)
  ElMessage.info('已清空该店铺的商品')
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  } catch {
    // 用户取消
  }
}

const goCheckout = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再下单')
    router.push('/login')
    return
  }
  router.push('/checkout')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* Navbar */
.navbar {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
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
  position: relative;
}

.nav-item:hover { background-color: #f5f7fa; color: #409eff; }

.nav-item.active { background-color: #e8f4fd; color: #409eff; }

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

/* Page */
.page-container {
  max-width: 1100px; margin: 0 auto; padding: 32px 24px;
}

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
}

.page-title { font-size: 28px; font-weight: 700; color: #303133; }

.clear-all-btn {
  padding: 8px 16px; background: none; border: 1px solid #f56c6c;
  color: #f56c6c; border-radius: 6px; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
}

.clear-all-btn:hover { background: #fef0f0; }

/* Empty state */
.empty-state {
  background: #fff; border-radius: 12px; padding: 80px 32px;
  text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-icon { font-size: 64px; margin-bottom: 16px; }

.empty-state h3 {
  font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px; color: #909399; margin-bottom: 24px;
}

.empty-link {
  display: inline-block; padding: 10px 24px;
  background-color: #409eff; color: #fff;
  border-radius: 8px; text-decoration: none;
  font-size: 14px; font-weight: 500;
}

.empty-link:hover { background-color: #66b1ff; }

/* Cart content */
.cart-content { display: flex; gap: 24px; align-items: flex-start; }

.cart-main { flex: 1; }

/* Shop group */
.shop-group {
  background: #fff; border-radius: 12px; padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); margin-bottom: 16px;
}

.shop-group-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.shop-name-link {
  font-size: 16px; font-weight: 600; color: #303133;
  text-decoration: none;
}

.shop-name-link:hover { color: #409eff; }

.clear-shop-btn {
  padding: 4px 12px; background: none; border: 1px solid #dcdfe6;
  color: #909399; border-radius: 4px; cursor: pointer; font-size: 13px;
}

.clear-shop-btn:hover { border-color: #f56c6c; color: #f56c6c; }

/* Cart item */
.cart-item {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 0; border-bottom: 1px solid #f5f5f5;
}

.cart-item:last-child { border-bottom: none; }

.item-image {
  width: 72px; height: 72px; border-radius: 8px;
  overflow: hidden; flex-shrink: 0; background: #f0f0f0;
}

.item-image img { width: 100%; height: 100%; object-fit: cover; }

.item-info { flex: 1; min-width: 0; }

.item-name {
  font-size: 15px; font-weight: 500; color: #303133;
  margin-bottom: 4px;
}

.item-price { font-size: 14px; color: #f56c6c; font-weight: 500; }

.item-qty {
  display: flex; align-items: center; gap: 12px;
}

.qty-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid #dcdfe6; background: #fff; color: #606266;
  font-size: 16px; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  transition: all 0.15s;
}

.qty-btn:hover { border-color: #409eff; color: #409eff; }

.qty-num { font-size: 15px; font-weight: 600; color: #303133; min-width: 28px; text-align: center; }

.item-subtotal {
  font-size: 15px; font-weight: 600; color: #f56c6c;
  min-width: 80px; text-align: right;
}

.remove-btn {
  width: 28px; height: 28px; border: none; background: none;
  color: #c0c4cc; cursor: pointer; font-size: 16px;
  border-radius: 4px; transition: all 0.15s;
}

.remove-btn:hover { color: #f56c6c; background: #fef0f0; }

/* Shop subtotal */
.shop-subtotal {
  text-align: right; padding-top: 12px; margin-top: 8px;
  border-top: 1px solid #ebeef5; font-size: 15px; color: #303133;
}

.shop-subtotal strong { color: #f56c6c; font-size: 16px; }

/* Sidebar */
.cart-sidebar { width: 300px; flex-shrink: 0; position: sticky; top: 88px; }

.summary-card {
  background: #fff; border-radius: 12px; padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-title {
  font-size: 18px; font-weight: 600; color: #303133;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; color: #606266; margin-bottom: 12px;
}

.summary-divider {
  height: 1px; background: #ebeef5; margin: 16px 0;
}

.summary-total {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 20px;
}

.total-price { font-size: 24px; color: #f56c6c; }

.checkout-btn { width: 100%; }

/* Page footer */
.page-footer {
  background: #303133; color: #909399; text-align: center;
  padding: 24px; font-size: 14px; margin-top: 48px;
}

@media (max-width: 768px) {
  .page-container { padding: 16px; }

  .cart-content { flex-direction: column; }

  .cart-sidebar { width: 100%; position: static; }

  .cart-item { flex-wrap: wrap; gap: 8px; }

  .item-subtotal { min-width: 60px; }

  .navbar-menu { gap: 4px; }
  .nav-item { padding: 6px 8px; font-size: 12px; }
}
</style>
