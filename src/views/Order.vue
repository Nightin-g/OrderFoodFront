<template>
  <div class="order-page">
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
          <router-link to="/order" class="nav-item active">我的订单</router-link>
          <router-link to="/comment" class="nav-item">我的评论</router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">我的订单</h1>
        <p class="page-subtitle">查看和管理您的所有订单</p>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>暂无订单</h3>
        <p>快去浏览菜品，下单您喜欢的美食吧</p>
        <router-link to="/dishes" class="empty-link">去订餐 →</router-link>
      </div>

      <div v-else class="order-list">
        <div class="order-card" v-for="order in orders" :key="order.orderId" @click="viewOrderDetail(order.orderId)">
          <div class="order-card-header">
            <div class="order-num">
              <span class="order-label">订单号</span>
              <span class="order-value">{{ order.orderNum }}</span>
            </div>
            <el-tag :type="getStatusTagType(order.orderStatus)" size="large">
              {{ getOrderStatusText(order.orderStatus) }}
            </el-tag>
          </div>
          <div class="order-card-body">
            <div class="order-price">
              <span class="price-label">订单金额</span>
              <span class="price-value">¥{{ Number(order.orderPrice).toFixed(2) }}</span>
            </div>
            <div class="order-time" v-if="order.createTime">
              <span class="time-label">下单时间</span>
              <span class="time-value">{{ order.createTime }}</span>
            </div>
          </div>
          <div class="order-card-footer">
            <el-button type="primary" link>查看详情 →</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserOrders } from '../api/order'
import { useUserStore } from '../store/user'
import type { Order } from '../types'

const orders = ref<Order[]>([])
const loading = ref(true)
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  try {
    const response = await getUserOrders()
    orders.value = response.data.data || []
  } catch (error) {
    console.error('获取订单失败:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
})

const getOrderStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待付款',
    1: '已付款',
    2: '待出餐',
    3: '配送中',
    4: '待取餐',
    5: '已取餐未评价',
    6: '已评价',
    7: '已取消',
    8: '退款中',
    9: '已退款'
  }
  return statusMap[status] || '未知状态'
}

const getStatusTagType = (status: number) => {
  if (status === 0) return 'warning'
  if (status === 1 || status === 2 || status === 3) return 'primary'
  if (status === 4) return 'success'
  if (status === 5 || status === 6) return 'info'
  if (status === 7 || status === 8 || status === 9) return 'danger'
  return 'info'
}

const viewOrderDetail = (orderId: string) => {
  router.push(`/order/detail/${orderId}`)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.order-page {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 32px;
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

.loading-state {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  margin-bottom: 24px;
}

.empty-link {
  display: inline-block;
  padding: 10px 24px;
  background-color: #409eff;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.empty-link:hover {
  background-color: #66b1ff;
}

.order-list {
  display: grid;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-num {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-label {
  font-size: 12px;
  color: #909399;
}

.order-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.order-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.order-price {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: #909399;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.order-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.time-label {
  font-size: 12px;
  color: #909399;
}

.time-value {
  font-size: 14px;
  color: #606266;
}

.order-card-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px 16px;
  }

  .order-card-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-time {
    text-align: left;
  }

  .navbar-menu {
    gap: 4px;
  }

  .nav-item {
    padding: 6px 10px;
    font-size: 13px;
  }
}
</style>
