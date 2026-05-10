<template>
  <div class="dishes-page">
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
          <router-link to="/dishes" class="nav-item active">菜品浏览</router-link>
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

    <div class="hero-banner">
      <div class="hero-content">
        <h1>探索校园美食</h1>
        <p>选择您喜爱的店铺，发现美味菜品</p>
      </div>
    </div>

    <div class="page-container">
      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-inputs">
            <el-select v-model="filterForm.canteen" placeholder="选择食堂" clearable class="filter-input">
              <el-option label="第一食堂" :value="1" />
              <el-option label="第二食堂" :value="2" />
              <el-option label="第三食堂" :value="3" />
            </el-select>
            <el-select v-model="filterForm.floor" placeholder="选择楼层" clearable class="filter-input">
              <el-option label="一层" :value="1" />
              <el-option label="二层" :value="2" />
              <el-option label="三层" :value="3" />
            </el-select>
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索店铺名称"
              clearable
              class="filter-input"
            />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="applyFilter">
              查询
            </el-button>
            <el-button @click="resetFilter">重置</el-button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <el-skeleton animated>
            <template #template>
              <div class="skeleton-img"></div>
              <div style="padding: 16px">
                <el-skeleton-item variant="text" style="width: 80%; height: 20px; margin-bottom: 12px" />
                <el-skeleton-item variant="text" style="width: 60%; height: 16px; margin-bottom: 8px" />
                <el-skeleton-item variant="text" style="width: 40%; height: 16px" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <div v-else-if="filteredShops.length === 0" class="empty-state">
        <div class="empty-icon">🏪</div>
        <h3>暂未找到店铺</h3>
        <p>请尝试调整筛选条件</p>
        <el-button type="primary" @click="resetFilter">重置筛选</el-button>
      </div>

      <div v-else class="shop-grid">
        <div
          class="shop-card"
          v-for="shop in filteredShops"
          :key="shop.shopId"
          @click="goToShop(shop.shopId)"
        >
          <div class="shop-image">
            <img :src="shop.shopPhoto || defaultShopImage" :alt="shop.shopName" />
            <el-tag
              :type="getShopStatusTagType(shop.shopStatus)"
              size="small"
              class="shop-status-tag"
            >
              {{ getShopStatusText(shop.shopStatus) }}
            </el-tag>
          </div>
          <div class="shop-body">
            <h3 class="shop-name">{{ shop.shopName }}</h3>
            <div class="shop-stats">
              <div class="shop-rating">
                <span class="star">⭐</span>
                <span>{{ shop.shopScore }}</span>
                <span class="rating-count">({{ shop.shopScorePerson }}人评)</span>
              </div>
              <div class="shop-sales">月售 {{ shop.shopSales }}</div>
            </div>
            <div class="shop-meta">
              <span class="meta-item">{{ getCanteenName(shop.position) }}</span>
              <span class="meta-item">{{ getFloorName(shop.position) }}</span>
              <span class="meta-item" v-if="shop.deliveryFee > 0">
                配送费 ¥{{ Number(shop.deliveryFee).toFixed(2) }}
              </span>
              <span class="meta-item free-delivery" v-else>免配送费</span>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'
import { getShopList, searchShops } from '../api/shop'
import type { ShopInfo } from '../types'

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()
const loading = ref(true)
const shops = ref<ShopInfo[]>([])

const filterForm = ref({
  canteen: null as number | null,
  floor: null as number | null,
  keyword: ''
})

const defaultShopImage = 'https://via.placeholder.com/300x180?text=店铺图片'

const getCanteenName = (position: number) => {
  const canteen = Math.floor(position / 10)
  const map: Record<number, string> = { 1: '第一食堂', 2: '第二食堂', 3: '第三食堂' }
  return map[canteen] || ''
}

const getFloorName = (position: number) => {
  const floor = position % 10
  return floor + '层'
}

const filteredShops = computed(() => {
  let result = shops.value
  if (filterForm.value.canteen) {
    result = result.filter(s => Math.floor(s.position / 10) === filterForm.value.canteen)
  }
  if (filterForm.value.floor) {
    result = result.filter(s => (s.position % 10) === filterForm.value.floor)
  }
  return result
})

const loadShops = async () => {
  loading.value = true
  try {
    const response = await getShopList()
    shops.value = response.data.data || []
  } catch {
    shops.value = []
  } finally {
    loading.value = false
  }
}

const applyFilter = async () => {
  loading.value = true
  try {
    const kw = filterForm.value.keyword?.trim()
    if (kw) {
      const response = await searchShops(kw)
      shops.value = response.data.data || []
    } else {
      const response = await getShopList()
      shops.value = response.data.data || []
    }
  } catch {
    shops.value = []
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.value = { canteen: null, floor: null, keyword: '' }
  loadShops()
}

const goToShop = (shopId: string) => {
  router.push(`/shop/${shopId}`)
}

const getShopStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: '营业中',
    2: '休息中',
    3: '暂时歇业',
    4: '已停业',
    5: '审核未通过'
  }
  return statusMap[status] || '未知'
}

const getShopStatusTagType = (status: number) => {
  if (status === 1) return 'success'
  if (status === 0) return 'warning'
  if (status === 2 || status === 3) return 'info'
  return 'danger'
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  loadShops()
})
</script>

<style scoped>
.dishes-page {
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

/* Hero banner */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48px 24px; text-align: center;
}

.hero-content h1 {
  font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 8px;
}

.hero-content p {
  font-size: 15px; color: rgba(255, 255, 255, 0.85);
}

/* Main container */
.page-container {
  max-width: 1200px; margin: 0 auto; padding: 24px;
}

/* Filter */
.filter-bar {
  background: #fff; border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); margin-bottom: 24px;
}

.filter-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}

.filter-inputs {
  display: flex; gap: 12px; flex: 1;
}

.filter-input { width: 200px; }

.filter-actions { display: flex; gap: 8px; flex-shrink: 0; }

/* Loading grid */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.skeleton-img { height: 180px; background: #f0f0f0; }

/* Empty state */
.empty-state {
  text-align: center; padding: 80px 24px;
}

.empty-icon { font-size: 64px; margin-bottom: 16px; }

.empty-state h3 {
  font-size: 18px; font-weight: 600; color: #303133; margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px; color: #909399; margin-bottom: 24px;
}

/* Shop grid */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.shop-card {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
}

.shop-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.shop-image {
  position: relative; width: 100%; height: 180px;
  overflow: hidden; background: #f0f0f0;
}

.shop-image img {
  width: 100%; height: 100%; object-fit: cover;
}

.shop-status-tag {
  position: absolute; top: 12px; right: 12px;
}

.shop-body { padding: 16px; }

.shop-name {
  font-size: 17px; font-weight: 600; color: #303133;
  margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.shop-stats {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}

.shop-rating { display: flex; align-items: center; gap: 4px; font-size: 14px; color: #e6a23c; }

.star { font-size: 14px; }

.rating-count { font-size: 12px; color: #909399; margin-left: 2px; }

.shop-sales { font-size: 13px; color: #909399; }

.shop-meta {
  display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #909399;
}

.meta-item {
  background: #f5f7fa; padding: 2px 8px; border-radius: 4px;
}

.free-delivery { color: #67c23a; }

/* Page footer */
.page-footer {
  background: #303133; color: #909399; text-align: center;
  padding: 24px; font-size: 14px; margin-top: 48px;
}

@media (max-width: 768px) {
  .page-container { padding: 16px; }

  .filter-row { flex-direction: column; }

  .filter-inputs { flex-direction: column; width: 100%; }

  .filter-input { width: 100%; }

  .shop-grid { grid-template-columns: 1fr; }

  .navbar-menu { gap: 4px; }

  .nav-item { padding: 6px 8px; font-size: 12px; }
}
</style>
