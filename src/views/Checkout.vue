<template>
  <div class="checkout-page">
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
      <div class="page-header">
        <button class="back-btn" @click="$router.push('/cart')">← 返回购物车</button>
        <h1 class="page-title">确认订单</h1>
      </div>

      <div v-if="cartStore.items.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>购物车为空</h3>
        <p>请先添加菜品到购物车</p>
        <router-link to="/dishes" class="empty-link">去浏览 →</router-link>
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-main">
          <!-- 收货信息 -->
          <div class="section-card">
            <h2 class="section-title">收货信息</h2>
            <el-form :model="orderForm" label-width="80px" class="order-form">
              <el-form-item label="联系电话" required>
                <el-input v-model="orderForm.phone" placeholder="请输入联系电话" maxlength="20" />
              </el-form-item>
              <el-form-item label="配送地址" required>
                <el-input v-model="orderForm.address" placeholder="请输入配送地址（如：XX宿舍楼XXX室）" />
              </el-form-item>
              <el-form-item label="订单备注">
                <el-input
                  v-model="orderForm.remark"
                  type="textarea"
                  :rows="2"
                  placeholder="如有特殊需求请备注（选填）"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 订单商品 -->
          <div class="section-card">
            <h2 class="section-title">订单商品</h2>
            <div
              class="shop-group"
              v-for="group in cartStore.groupedByShop"
              :key="group.shopId"
            >
              <div class="shop-group-header">🏪 {{ group.shopName }}</div>
              <div class="order-item" v-for="item in group.items" :key="item.dishId">
                <span class="order-item-name">{{ item.dishName }}</span>
                <span class="order-item-qty">×{{ item.quantity }}</span>
                <span class="order-item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="checkout-sidebar">
          <div class="summary-card">
            <h3 class="summary-title">费用明细</h3>
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
              <span>应付金额</span>
              <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="submitting"
              @click="submitOrder"
            >
              提交订单
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
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createOrder } from '../api/order'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const submitting = ref(false)

const orderForm = reactive({
  phone: '',
  address: '',
  remark: ''
})

onMounted(() => {
  // 预填用户信息
  if (userStore.userInfo) {
    orderForm.phone = userStore.userInfo.phoneNum || ''
    orderForm.address = userStore.userInfo.address || ''
  } else {
    userStore.fetchCurrentInfo().then(() => {
      if (userStore.userInfo) {
        orderForm.phone = userStore.userInfo.phoneNum || ''
        orderForm.address = userStore.userInfo.address || ''
      }
    })
  }
})

const submitOrder = async () => {
  // 验证
  if (!orderForm.phone.trim()) {
    ElMessage.warning('请输入联系电话')
    return
  }
  if (!orderForm.address.trim()) {
    ElMessage.warning('请输入配送地址')
    return
  }

  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空，无法下单')
    return
  }

  submitting.value = true
  try {
    const items = cartStore.items.map(item => ({
      dishId: item.dishId,
      dishName: item.dishName,
      quantity: item.quantity,
      price: item.price
    }))

    const response = await createOrder({
      items,
      totalPrice: cartStore.totalPrice,
      address: orderForm.address,
      phone: orderForm.phone,
      remark: orderForm.remark
    })

    if (response.data?.code === 200) {
      ElMessage.success('订单提交成功')
      cartStore.clearCart()
      const orderId = response.data.data?.orderId
      if (orderId) {
        router.push(`/order/detail/${orderId}`)
      } else {
        router.push('/order')
      }
    } else {
      ElMessage.error(response.data?.msg || '下单失败')
    }
  } catch (error) {
    console.error('下单失败:', error)
    ElMessage.error('下单失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.checkout-page {
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

/* Page */
.page-container {
  max-width: 1000px; margin: 0 auto; padding: 32px 24px;
}

.page-header { margin-bottom: 24px; }

.back-btn {
  display: inline-block; padding: 6px 12px;
  background: none; border: 1px solid #dcdfe6; border-radius: 6px;
  color: #606266; cursor: pointer; font-size: 14px;
  margin-bottom: 12px; transition: all 0.2s;
}

.back-btn:hover { border-color: #409eff; color: #409eff; }

.page-title { font-size: 28px; font-weight: 700; color: #303133; }

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

/* Checkout content */
.checkout-content { display: flex; gap: 24px; align-items: flex-start; }

.checkout-main { flex: 1; }

.section-card {
  background: #fff; border-radius: 12px; padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); margin-bottom: 16px;
}

.section-title {
  font-size: 18px; font-weight: 600; color: #303133;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.order-form { max-width: 500px; }

/* Order items */
.shop-group { margin-bottom: 16px; }

.shop-group-header {
  font-size: 15px; font-weight: 600; color: #303133;
  margin-bottom: 10px; padding: 8px 12px;
  background: #f5f7fa; border-radius: 6px;
}

.order-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid #f5f5f5;
}

.order-item:last-child { border-bottom: none; }

.order-item-name {
  flex: 1; font-size: 14px; color: #303133;
}

.order-item-qty {
  font-size: 13px; color: #909399;
  background: #f5f7fa; padding: 2px 10px; border-radius: 10px;
}

.order-item-price {
  font-size: 14px; font-weight: 500; color: #f56c6c;
  min-width: 80px; text-align: right;
}

/* Sidebar */
.checkout-sidebar { width: 280px; flex-shrink: 0; position: sticky; top: 88px; }

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

.submit-btn { width: 100%; }

/* Page footer */
.page-footer {
  background: #303133; color: #909399; text-align: center;
  padding: 24px; font-size: 14px; margin-top: 48px;
}

@media (max-width: 768px) {
  .page-container { padding: 16px; }

  .checkout-content { flex-direction: column; }

  .checkout-sidebar { width: 100%; position: static; }

  .navbar-menu { gap: 4px; }
  .nav-item { padding: 6px 8px; font-size: 12px; }
}
</style>
