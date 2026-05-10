<template>
  <div class="shop-detail-page">
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
          <router-link to="/cart" class="nav-item cart-nav-item">
            购物车
            <span v-if="cartStore.totalCount > 0" class="cart-badge">{{ cartStore.totalCount }}</span>
          </router-link>
          <button v-if="userStore.isLoggedIn" @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="back-row">
        <button class="back-btn" @click="$router.push('/dishes')">← 返回店铺列表</button>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="8" animated />
      </div>

      <template v-else-if="shop">
        <!-- 店铺信息卡片 -->
        <div class="shop-info-card">
          <div class="shop-info-top">
            <div class="shop-photo">
              <img :src="shop.shopPhoto || defaultShopImage" :alt="shop.shopName" />
            </div>
            <div class="shop-detail">
              <div class="shop-title-row">
                <h1 class="shop-title">{{ shop.shopName }}</h1>
                <el-tag :type="shop.shopStatus === 1 ? 'success' : 'info'" size="large">
                  {{ getShopStatusText(shop.shopStatus) }}
                </el-tag>
              </div>
              <div class="shop-ratings-row">
                <span class="shop-score">⭐ {{ shop.shopScore }}</span>
                <span class="score-count">({{ shop.shopScorePerson }}人评价)</span>
                <span class="divider">|</span>
                <span>月售 {{ shop.shopSales }}</span>
                <span class="divider">|</span>
                <span>{{ getCanteenName(shop.position) }} {{ getFloorName(shop.position) }}</span>
              </div>
              <div class="shop-meta-row">
                <span v-if="shop.deliveryFee > 0">配送费: ¥{{ Number(shop.deliveryFee).toFixed(2) }}</span>
                <span v-else class="free-delivery">免配送费</span>
                <span>电话: {{ shop.shopPhone }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 购物车状态栏 -->
        <div v-if="shopItemCount > 0" class="cart-status-bar">
          <div class="cart-status-info">
            <span class="cart-status-icon">🛒</span>
            <span>已选 <strong>{{ shopItemCount }}</strong> 件，合计 <strong>¥{{ shopSubtotal.toFixed(2) }}</strong></span>
          </div>
          <el-button type="primary" size="large" @click="$router.push('/cart')">
            去购物车结算
          </el-button>
        </div>

        <!-- 菜品列表 -->
        <div class="dishes-section">
          <h2 class="section-title">本店菜品</h2>

          <div v-if="dishes.length === 0" class="empty-state">
            <div class="empty-icon">🍽️</div>
            <h3>暂无菜品</h3>
            <p>该店铺还没有上架菜品</p>
          </div>

          <div v-else class="dish-grid">
            <div class="dish-card" v-for="dish in dishes" :key="dish.dishId">
              <div class="dish-image">
                <img :src="dish.dishPhoto || defaultDishImage" :alt="dish.dishName" />
                <el-tag
                  v-if="dish.dishStatus !== 1"
                  :type="dish.dishStatus === 2 ? 'danger' : 'info'"
                  size="small"
                  class="dish-status-tag"
                >
                  {{ dish.dishStatus === 2 ? '已售罄' : '已下架' }}
                </el-tag>
              </div>
              <div class="dish-body">
                <h3 class="dish-name">{{ dish.dishName }}</h3>
                <p class="dish-ingredients" v-if="dish.ingredients">{{ dish.ingredients }}</p>
                <div class="dish-stats">
                  <div class="dish-price">¥{{ Number(dish.price).toFixed(2) }}</div>
                  <div class="dish-rating">
                    <span>⭐ {{ dish.dishScore }}</span>
                    <span class="dish-sales">已售 {{ dish.dishSales }}</span>
                  </div>
                </div>
              </div>
              <div class="dish-footer">
                <template v-if="dish.dishStatus === 1">
                  <div v-if="cartStore.getDishQuantity(dish.dishId) > 0" class="qty-control">
                    <button class="qty-btn" @click.stop="decreaseQty(dish)">−</button>
                    <span class="qty-num">{{ cartStore.getDishQuantity(dish.dishId) }}</span>
                    <button class="qty-btn" @click.stop="increaseQty(dish)">+</button>
                  </div>
                  <el-button v-else type="primary" round class="add-btn" @click.stop="addDish(dish)">
                    + 加入购物车
                  </el-button>
                </template>
                <el-button v-else disabled round class="add-btn">
                  暂不可购
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <div class="empty-icon">🏪</div>
        <h3>店铺不存在</h3>
        <p>该店铺可能已被删除或不存在</p>
        <el-button type="primary" @click="$router.push('/dishes')">返回店铺列表</el-button>
      </div>
    </div>

    <div class="page-footer">
      <p>&copy; 2024 大学食堂订餐系统</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getShopDetail } from '../api/shop'
import { getDishesByShop } from '../api/dish'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'
import type { ShopInfo, Dish } from '../types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const loading = ref(true)
const shop = ref<ShopInfo | null>(null)
const dishes = ref<Dish[]>([])

const defaultShopImage = 'https://via.placeholder.com/300x180?text=店铺图片'
const defaultDishImage = 'https://via.placeholder.com/300x200?text=菜品图片'

const shopItemCount = computed(() => {
  if (!shop.value) return 0
  return cartStore.getShopItemCount(shop.value.shopId)
})

const shopSubtotal = computed(() => {
  if (!shop.value) return 0
  return cartStore.items
    .filter(i => i.shopId === shop.value!.shopId)
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
})

const getCanteenName = (position: number) => {
  const canteen = Math.floor(position / 10)
  const map: Record<number, string> = { 1: '第一食堂', 2: '第二食堂', 3: '第三食堂' }
  return map[canteen] || ''
}

const getFloorName = (position: number) => {
  const floor = position % 10
  return floor + '层'
}

const getShopStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待审核', 1: '营业中', 2: '休息中', 3: '暂时歇业', 4: '已停业', 5: '审核未通过'
  }
  return map[status] || '未知'
}

const loadData = async () => {
  const shopId = route.params.shopId as string
  if (!shopId) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const [shopRes, dishRes] = await Promise.all([
      getShopDetail(shopId),
      getDishesByShop(shopId)
    ])
    shop.value = shopRes.data.data
    dishes.value = dishRes.data.data || []
  } catch {
    shop.value = null
    dishes.value = []
  } finally {
    loading.value = false
  }
}

const addDish = (dish: Dish) => {
  if (!shop.value) return
  cartStore.addToCart(
    {
      dishId: dish.dishId,
      dishName: dish.dishName,
      price: dish.price,
      dishPhoto: dish.dishPhoto
    },
    shop.value.shopId,
    shop.value.shopName
  )
  ElMessage.success(`已将 "${dish.dishName}" 加入购物车`)
}

const increaseQty = (dish: Dish) => {
  cartStore.updateQuantity(dish.dishId, cartStore.getDishQuantity(dish.dishId) + 1)
}

const decreaseQty = (dish: Dish) => {
  const current = cartStore.getDishQuantity(dish.dishId)
  if (current <= 1) {
    cartStore.removeFromCart(dish.dishId)
    ElMessage.info(`已从购物车移除 "${dish.dishName}"`)
  } else {
    cartStore.updateQuantity(dish.dishId, current - 1)
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.shop-detail-page {
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

.page-container {
  max-width: 1000px; margin: 0 auto; padding: 24px;
}

.back-row { margin-bottom: 16px; }

.back-btn {
  display: inline-block; padding: 6px 12px;
  background: none; border: 1px solid #dcdfe6; border-radius: 6px;
  color: #606266; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover { border-color: #409eff; color: #409eff; }

.loading-state {
  background: #fff; border-radius: 12px; padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Shop info card */
.shop-info-card {
  background: #fff; border-radius: 12px; padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); margin-bottom: 20px;
}

.shop-info-top { display: flex; gap: 24px; }

.shop-photo {
  width: 200px; height: 140px; border-radius: 10px;
  overflow: hidden; flex-shrink: 0; background: #f0f0f0;
}

.shop-photo img { width: 100%; height: 100%; object-fit: cover; }

.shop-detail { flex: 1; }

.shop-title-row {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}

.shop-title { font-size: 24px; font-weight: 700; color: #303133; }

.shop-ratings-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: #606266; margin-bottom: 12px;
}

.shop-score { color: #e6a23c; font-weight: 600; }
.score-count { color: #909399; font-size: 13px; }
.divider { color: #dcdfe6; }

.shop-meta-row {
  display: flex; gap: 16px; font-size: 14px; color: #606266;
}

.free-delivery { color: #67c23a; font-weight: 500; }

/* Cart status bar */
.cart-status-bar {
  position: sticky; top: 72px; z-index: 50;
  background: #fff; border-radius: 12px; padding: 16px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}

.cart-status-info {
  display: flex; align-items: center; gap: 8px; font-size: 15px; color: #303133;
}

.cart-status-icon { font-size: 20px; }

/* Dishes section */
.dishes-section {
  background: #fff; border-radius: 12px; padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 20px; font-weight: 600; color: #303133;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.empty-state {
  text-align: center; padding: 60px 24px;
}

.empty-icon { font-size: 48px; margin-bottom: 16px; }

.empty-state h3 {
  font-size: 18px; font-weight: 600; color: #303133; margin-bottom: 8px;
}

.empty-state p { font-size: 14px; color: #909399; }

.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.dish-card {
  background: #fafafa; border-radius: 10px; overflow: hidden;
  border: 1px solid #ebeef5;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.dish-image {
  position: relative; width: 100%; height: 160px;
  overflow: hidden; background: #f0f0f0;
}

.dish-image img { width: 100%; height: 100%; object-fit: cover; }

.dish-status-tag { position: absolute; top: 8px; right: 8px; }

.dish-body { padding: 14px; }

.dish-name {
  font-size: 16px; font-weight: 600; color: #303133;
  margin-bottom: 4px;
}

.dish-ingredients {
  font-size: 13px; color: #909399;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 10px;
}

.dish-stats {
  display: flex; justify-content: space-between; align-items: center;
}

.dish-price { font-size: 20px; color: #f56c6c; font-weight: 700; }

.dish-rating {
  display: flex; flex-direction: column; align-items: flex-end;
  font-size: 13px; color: #606266;
}

.dish-sales { font-size: 12px; color: #909399; }

.dish-footer { padding: 0 14px 14px; }

.add-btn { width: 100%; }

.qty-control {
  display: flex; align-items: center; justify-content: center; gap: 16px;
}

.qty-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid #409eff; background: #fff; color: #409eff;
  font-size: 18px; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  transition: all 0.15s;
}

.qty-btn:hover { background: #409eff; color: #fff; }

.qty-num { font-size: 16px; font-weight: 600; color: #303133; min-width: 24px; text-align: center; }

/* Page footer */
.page-footer {
  background: #303133; color: #909399; text-align: center;
  padding: 24px; font-size: 14px; margin-top: 48px;
}

@media (max-width: 768px) {
  .page-container { padding: 16px; }

  .shop-info-top { flex-direction: column; }

  .shop-photo { width: 100%; height: 180px; }

  .shop-title { font-size: 20px; }

  .dish-grid { grid-template-columns: 1fr; }

  .navbar-menu { gap: 4px; }
  .nav-item { padding: 6px 8px; font-size: 12px; }
}
</style>
