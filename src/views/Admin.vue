<template>
  <div class="admin-page">
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
          <router-link to="/profile" class="nav-item">个人中心</router-link>
          <router-link to="/admin" class="nav-item active">管理员后台</router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">管理员后台</h1>
        <p class="page-subtitle">审核店铺和菜品</p>
      </div>

      <div class="tab-bar">
        <button
          :class="['tab-btn', { active: activeTab === 'shops' }]"
          @click="activeTab = 'shops'"
        >
          <span class="tab-icon">🏪</span>
          <span>店铺审核</span>
          <span v-if="pendingShops.length" class="tab-count">{{ pendingShops.length }}</span>
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'dishes' }]"
          @click="activeTab = 'dishes'"
        >
          <span class="tab-icon">🍲</span>
          <span>菜品审核</span>
          <span v-if="pendingDishes.length" class="tab-count">{{ pendingDishes.length }}</span>
        </button>
      </div>

      <div class="tab-content">
        <!-- 店铺审核 -->
        <div v-if="activeTab === 'shops'" class="content-card">
          <div class="card-header-row">
            <h2 class="card-title">待审核店铺</h2>
            <span class="card-count">共 {{ pendingShops.length }} 条</span>
          </div>

          <div v-if="loading.shops" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <div v-else-if="pendingShops.length === 0" class="empty-state">
            <div class="empty-icon">✅</div>
            <h3>暂无待审核店铺</h3>
            <p>所有店铺已审核完毕</p>
          </div>

          <div v-else class="review-list">
            <div class="review-card" v-for="shop in pendingShops" :key="shop.shopId">
              <div class="review-info">
                <h3 class="review-name">{{ shop.shopName }}</h3>
                <p class="review-meta">电话：{{ shop.shopPhone }} | 位置编码：{{ shop.position }}</p>
              </div>
              <div class="review-actions">
                <el-button type="success" @click="approveShop(shop.shopId)" :loading="actionLoading === shop.shopId">通过</el-button>
                <el-button type="danger" plain @click="rejectShop(shop.shopId)" :loading="actionLoading === shop.shopId">拒绝</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 菜品审核 -->
        <div v-else-if="activeTab === 'dishes'" class="content-card">
          <div class="card-header-row">
            <h2 class="card-title">待审核菜品</h2>
            <span class="card-count">共 {{ pendingDishes.length }} 条</span>
          </div>

          <div v-if="loading.dishes" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <div v-else-if="pendingDishes.length === 0" class="empty-state">
            <div class="empty-icon">✅</div>
            <h3>暂无待审核菜品</h3>
            <p>所有菜品已审核完毕</p>
          </div>

          <div v-else class="review-list">
            <div class="review-card" v-for="dish in pendingDishes" :key="dish.dishId">
              <div class="review-info">
                <h3 class="review-name">{{ dish.dishName }}</h3>
                <p class="review-meta">店铺ID：{{ dish.shopId }}</p>
              </div>
              <div class="review-actions">
                <el-button type="success" @click="approveDish(dish.dishId)" :loading="actionLoading === dish.dishId">通过</el-button>
                <el-button type="danger" plain @click="rejectDish(dish.dishId)" :loading="actionLoading === dish.dishId">拒绝</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPendingShops, getPendingDishes, approveShop as apiApproveShop, rejectShop as apiRejectShop, approveDish as apiApproveDish, rejectDish as apiRejectDish } from '../api/admin'
import { useUserStore } from '../store/user'

interface PendingShop {
  shopId: string
  shopName: string
  shopPhone: string
  position: number
}

interface PendingDish {
  dishId: string
  dishName: string
  shopId: string
}

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('shops')
const actionLoading = ref<string | null>(null)

const pendingShops = ref<PendingShop[]>([])
const pendingDishes = ref<PendingDish[]>([])

const loading = reactive({
  shops: false,
  dishes: false
})

onMounted(() => {
  loadPendingShops()
  loadPendingDishes()
})

const loadPendingShops = async () => {
  loading.shops = true
  try {
    const response = await getPendingShops()
    pendingShops.value = response.data.data || []
  } catch (error) {
    console.error('获取未审核店铺失败:', error)
    pendingShops.value = []
  } finally {
    loading.shops = false
  }
}

const loadPendingDishes = async () => {
  loading.dishes = true
  try {
    const response = await getPendingDishes()
    pendingDishes.value = response.data.data || []
  } catch (error) {
    console.error('获取未审核菜品失败:', error)
    pendingDishes.value = []
  } finally {
    loading.dishes = false
  }
}

const approveShop = async (shopId: string) => {
  actionLoading.value = shopId
  try {
    await apiApproveShop(shopId)
    ElMessage.success('店铺审核通过')
    loadPendingShops()
  } catch (error) {
    console.error('审核失败:', error)
  } finally {
    actionLoading.value = null
  }
}

const rejectShop = async (shopId: string) => {
  actionLoading.value = shopId
  try {
    await apiRejectShop(shopId)
    ElMessage.success('店铺已拒绝')
    loadPendingShops()
  } catch (error) {
    console.error('审核失败:', error)
  } finally {
    actionLoading.value = null
  }
}

const approveDish = async (dishId: string) => {
  actionLoading.value = dishId
  try {
    await apiApproveDish(dishId)
    ElMessage.success('菜品审核通过')
    loadPendingDishes()
  } catch (error) {
    console.error('审核失败:', error)
  } finally {
    actionLoading.value = null
  }
}

const rejectDish = async (dishId: string) => {
  actionLoading.value = dishId
  try {
    await apiRejectDish(dishId)
    ElMessage.success('菜品已拒绝')
    loadPendingDishes()
  } catch (error) {
    console.error('审核失败:', error)
  } finally {
    actionLoading.value = null
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.admin-page {
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

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #303133;
}

.brand-icon {
  font-size: 24px;
  margin-right: 8px;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  padding: 8px 16px;
  color: #606266;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.nav-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.nav-item.active {
  background-color: #e8f4fd;
  color: #409eff;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #f78989;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
}

.tab-bar {
  display: flex;
  gap: 4px;
  background: #fff;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.2s;
}

.tab-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.tab-btn.active {
  background-color: #409eff;
  color: #fff;
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 0;
}

.card-count {
  font-size: 14px;
  color: #909399;
}

.loading-state {
  padding: 16px 0;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #909399;
}

.review-list {
  display: grid;
  gap: 12px;
}

.review-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f5f7fa;
  border-radius: 10px;
  transition: background-color 0.2s;
}

.review-card:hover {
  background-color: #ecf5ff;
}

.review-info {
  flex: 1;
}

.review-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.review-meta {
  font-size: 14px;
  color: #909399;
}

.review-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px 16px;
  }

  .content-card {
    padding: 20px;
  }

  .review-card {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .review-actions {
    width: 100%;
  }

  .review-actions .el-button {
    flex: 1;
  }

  .navbar-menu {
    gap: 4px;
  }

  .nav-item {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
