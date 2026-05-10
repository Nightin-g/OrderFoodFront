<template>
  <div class="order-detail-page">
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
          <router-link to="/order" class="nav-item">我的订单</router-link>
          <router-link to="/comment" class="nav-item">我的评论</router-link>
          <router-link to="/cart" class="nav-item cart-nav-item">
            购物车
            <span v-if="cartStore.totalCount > 0" class="cart-badge">{{ cartStore.totalCount }}</span>
          </router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="page-header">
        <button class="back-btn" @click="$router.push('/order')">← 返回订单列表</button>
        <h1 class="page-title">订单详情</h1>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="!orderDetail" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>订单不存在</h3>
        <p>该订单可能已被删除或不存在</p>
        <router-link to="/order" class="empty-link">返回订单列表</router-link>
      </div>

      <div v-else class="detail-content">
        <div class="info-card">
          <h2 class="card-title">订单信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">订单号</span>
              <span class="info-value">{{ orderDetail.orderNum }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">订单状态</span>
              <el-tag :type="getStatusTagType(orderDetail.orderStatus)" size="large">
                {{ getOrderStatusText(orderDetail.orderStatus) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">订单金额</span>
              <span class="info-value price">¥{{ Number(orderDetail.orderPrice).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 菜品评价区域 -->
        <div v-if="orderDetail.orderStatus === 5" class="info-card">
          <h2 class="card-title">评价菜品</h2>
          <p class="evaluate-hint">请对订单中的每个菜品进行评分和评论</p>
          <div class="dish-evaluate-list">
            <div v-for="(item, index) in orderDetail.items" :key="index" class="dish-evaluate-card">
              <div class="dish-evaluate-header">
                <span class="dish-evaluate-name">{{ item.dishName }}</span>
                <span class="dish-evaluate-qty">×{{ item.quantity }}</span>
              </div>
              <div class="dish-evaluate-form">
                <div class="evaluate-field">
                  <span class="evaluate-label">评分</span>
                  <el-rate v-model="evaluateForms[index].score" :max="5" show-score />
                </div>
                <div class="evaluate-field">
                  <span class="evaluate-label">评论</span>
                  <el-input
                    v-model="evaluateForms[index].comment"
                    type="textarea"
                    :rows="2"
                    :placeholder="`说说${item.dishName}怎么样...`"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="evaluate-actions">
            <el-button type="primary" size="large" @click="submitEvaluate" :loading="actionLoading">
              提交评价
            </el-button>
          </div>
        </div>

        <!-- 非评价状态下的菜品列表 -->
        <div v-else class="info-card">
          <h2 class="card-title">菜品列表</h2>
          <div class="item-list">
            <div v-for="(item, index) in orderDetail.items" :key="index" class="item-row">
              <div class="item-info">
                <span class="item-index">{{ index + 1 }}</span>
                <span class="item-name">{{ item.dishName }}</span>
              </div>
              <div class="item-quantity">
                <span class="quantity-badge">×{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <el-button
            v-if="orderDetail.orderStatus === 0"
            type="success"
            size="large"
            @click="payOrder(orderDetail.orderId)"
            :loading="actionLoading"
          >
            立即支付
          </el-button>
          <el-button
            v-if="orderDetail.orderStatus === 0"
            type="danger"
            size="large"
            plain
            @click="cancelOrder(orderDetail.orderId)"
            :loading="actionLoading"
          >
            取消订单
          </el-button>
          <el-button
            v-if="orderDetail.orderStatus === 4"
            type="success"
            size="large"
            @click="pickupOrder(orderDetail.orderId)"
            :loading="actionLoading"
          >
            确认取餐
          </el-button>
          <el-button
            v-if="orderDetail.orderStatus === 0"
            type="warning"
            size="large"
            plain
            @click="showRefundForm = true"
          >
            申请退款
          </el-button>
        </div>
      </div>
    </div>

    <!-- 退款对话框 -->
    <el-dialog v-model="showRefundForm" title="申请退款" width="480px">
      <el-form :model="refundForm" label-width="60px">
        <el-form-item label="原因">
          <el-input type="textarea" v-model="refundForm.reason" rows="3" placeholder="请填写退款原因..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRefundForm = false">取消</el-button>
        <el-button type="primary" @click="submitRefund" :loading="actionLoading">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail as apiGetOrderDetail, payOrder as apiPayOrder, cancelOrder as apiCancelOrder, pickupOrder as apiPickupOrder, evaluateOrder as apiEvaluateOrder, refundOrder as apiRefundOrder } from '../api/order'
import { createComment } from '../api/comment'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'
import type { OrderDetail } from '../types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const orderDetail = ref<OrderDetail | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const showRefundForm = ref(false)

const evaluateForms = reactive<{ score: number; comment: string }[]>([])

const refundForm = ref({
  reason: ''
})

onMounted(async () => {
  const orderId = String(route.params.orderId)
  if (orderId) {
    await loadOrderDetail(orderId)
  }
})

const loadOrderDetail = async (orderId: string) => {
  loading.value = true
  try {
    const response = await apiGetOrderDetail(orderId)
    orderDetail.value = response.data.data
    if (orderDetail.value?.orderStatus === 5 && orderDetail.value.items) {
      evaluateForms.length = 0
      orderDetail.value.items.forEach(() => {
        evaluateForms.push({ score: 5, comment: '' })
      })
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
  } finally {
    loading.value = false
  }
}

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
  if ([1, 2, 3].includes(status)) return 'primary'
  if (status === 4) return 'success'
  if ([5, 6].includes(status)) return 'info'
  if ([7, 8, 9].includes(status)) return 'danger'
  return 'info'
}

const payOrder = async (orderId: string) => {
  actionLoading.value = true
  try {
    await apiPayOrder(orderId)
    ElMessage.success('支付成功')
    await loadOrderDetail(orderId)
  } catch (error) {
    console.error('支付失败:', error)
  } finally {
    actionLoading.value = false
  }
}

const cancelOrder = async (orderId: string) => {
  try {
    await ElMessageBox.confirm('确定要取消此订单吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '返回',
      type: 'warning'
    })
    actionLoading.value = true
    await apiCancelOrder(orderId)
    ElMessage.success('订单已取消')
    await loadOrderDetail(orderId)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
    }
  } finally {
    actionLoading.value = false
  }
}

const pickupOrder = async (orderId: string) => {
  actionLoading.value = true
  try {
    await apiPickupOrder(orderId)
    ElMessage.success('已确认取餐')
    await loadOrderDetail(orderId)
  } catch (error) {
    console.error('确认取餐失败:', error)
  } finally {
    actionLoading.value = false
  }
}

const submitEvaluate = async () => {
  if (!orderDetail.value) return
  actionLoading.value = true
  try {
    // 对每个菜品分别创建评论
    const items = orderDetail.value.items
    for (let i = 0; i < items.length; i++) {
      const form = evaluateForms[i]
      if (form.comment.trim()) {
        await createComment({
          context: form.comment,
          score: form.score,
          dishId: items[i].dishId
        })
      }
    }
    // 标记订单为已评价
    await apiEvaluateOrder(orderDetail.value.orderId, 5, '已评价')
    ElMessage.success('评价成功')
    await loadOrderDetail(orderDetail.value.orderId)
  } catch (error) {
    console.error('评价失败:', error)
    ElMessage.error('评价失败，请稍后重试')
  } finally {
    actionLoading.value = false
  }
}

const submitRefund = async () => {
  if (!orderDetail.value) return
  actionLoading.value = true
  try {
    await apiRefundOrder(orderDetail.value.orderId, refundForm.value.reason)
    ElMessage.success('退款申请已提交')
    showRefundForm.value = false
    await loadOrderDetail(orderDetail.value.orderId)
  } catch (error) {
    console.error('申请退款失败:', error)
  } finally {
    actionLoading.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.order-detail-page {
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

.cart-nav-item { display: flex; align-items: center; gap: 4px; }

.cart-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  background-color: #f56c6c; color: #fff;
  border-radius: 10px; font-size: 12px; font-weight: 600;
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
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 24px;
}

.back-btn {
  display: inline-block;
  padding: 6px 12px;
  background: none;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  color: #606266;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
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
}

.empty-link:hover {
  background-color: #66b1ff;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: #909399;
}

.info-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.info-value.price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 700;
}

.item-list {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.15s;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background-color: #f5f7fa;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.item-name {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.quantity-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #f5f7fa;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.evaluate-hint {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

.dish-evaluate-list {
  display: grid;
  gap: 16px;
}

.dish-evaluate-card {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 20px;
}

.dish-evaluate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.dish-evaluate-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.dish-evaluate-qty {
  font-size: 14px;
  color: #909399;
  background: #fff;
  padding: 2px 12px;
  border-radius: 12px;
}

.dish-evaluate-form {
  display: grid;
  gap: 12px;
}

.evaluate-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.evaluate-label {
  width: 48px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
  line-height: 32px;
}

.evaluate-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.action-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
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
