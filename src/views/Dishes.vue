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
            <button @click="handleLogout" class="logout-btn">退出登录</button>
          </template>
          <template v-if="!userStore.isLoggedIn">
            <router-link to="/login" class="nav-item">登录</router-link>
            <router-link to="/register" class="nav-item">注册</router-link>
          </template>
        </div>
      </div>
    </nav>

    <div class="hero-banner">
      <div class="hero-content">
        <h1>探索校园美食</h1>
        <p>发现您喜爱的菜品，一键下单快捷方便</p>
      </div>
    </div>

    <div class="page-container">
      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-inputs">
            <el-input
              v-model="filterForm.shopId"
              placeholder="输入店铺ID筛选"
              clearable
              class="filter-input"
              @keyup.enter="loadDishes"
            />
            <el-input
              v-model="filterForm.categoryId"
              placeholder="输入分类ID筛选"
              clearable
              class="filter-input"
              @keyup.enter="loadDishes"
            />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="loadDishes">
              <span class="btn-icon-text">🔍</span> 查询
            </el-button>
            <el-button @click="resetFilter">重置</el-button>
          </div>
        </div>
      </div>

      <!-- 店铺评论区域（按店铺筛选时显示） -->
      <div v-if="filterForm.shopId && !loading" class="shop-comment-section">
        <div class="shop-comment-header">
          <h2 class="section-title-text">店铺评价</h2>
          <span class="shop-id-badge">店铺 #{{ filterForm.shopId }}</span>
        </div>

        <!-- 写评论 -->
        <div v-if="userStore.isUser" class="shop-comment-form">
          <div class="comment-form-row">
            <div class="comment-rating-field">
              <span class="comment-label">评分</span>
              <el-rate v-model="shopCommentForm.score" :max="5" show-score />
            </div>
            <div class="comment-input-field">
              <el-input
                v-model="shopCommentForm.context"
                type="textarea"
                :rows="2"
                placeholder="分享您对这家店铺的看法..."
              />
            </div>
            <el-button type="primary" :loading="commentSubmitting" @click="submitShopComment">
              发表评价
            </el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="shopComments.length > 0" class="shop-comment-list">
          <div class="comment-item" v-for="item in shopComments" :key="item.commentId">
            <div class="comment-item-top">
              <el-rate v-model="item.score" disabled show-score size="small" />
              <span class="comment-item-time">{{ item.createTime }}</span>
            </div>
            <p class="comment-item-text">{{ item.context }}</p>
          </div>
        </div>
        <div v-else class="no-comments">暂无店铺评价，快来第一个评价吧</div>
      </div>

      <div v-if="loading" class="loading-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <el-skeleton animated>
            <template #template>
              <div class="skeleton-img"></div>
              <div style="padding: 16px">
                <el-skeleton-item variant="text" style="width: 80%; height: 20px; margin-bottom: 12px" />
                <el-skeleton-item variant="text" style="width: 40%; height: 32px; margin-bottom: 8px" />
                <el-skeleton-item variant="text" style="width: 60%; height: 16px" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <div v-else-if="dishes.length === 0" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>暂未找到菜品</h3>
        <p>请尝试调整筛选条件或稍后再来</p>
        <el-button type="primary" @click="resetFilter">重置筛选</el-button>
      </div>

      <div v-else class="dish-grid">
        <div
          class="dish-card"
          v-for="dish in dishes"
          :key="dish.dishId"
          @click="viewDishDetail(dish)"
        >
          <div class="dish-image">
            <img :src="dish.dishPhoto || defaultImage" :alt="dish.dishName" />
            <el-tag
              :type="getStatusTagType(dish.dishStatus)"
              size="small"
              class="dish-status-tag"
            >
              {{ getDishStatusText(dish.dishStatus) }}
            </el-tag>
          </div>
          <div class="dish-body">
            <h3 class="dish-name">{{ dish.dishName }}</h3>
            <div class="dish-stats">
              <div class="dish-price">¥{{ Number(dish.price).toFixed(2) }}</div>
              <div class="dish-rating">
                <span class="rating-star">⭐</span>
                <span class="rating-value">{{ dish.dishScore }}</span>
              </div>
            </div>
            <div class="dish-meta">
              <span>已售 {{ dish.dishSales }}</span>
              <span>{{ dish.dishScorePerson }} 人评价</span>
            </div>
          </div>
          <div class="dish-footer">
            <el-button
              :type="dish.dishStatus === 1 ? 'primary' : 'info'"
              :disabled="dish.dishStatus !== 1"
              round
              class="cart-btn"
            >
              {{ dish.dishStatus === 1 ? '加入购物车' : '暂不可购' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <p>&copy; 2024 大学食堂订餐系统</p>
    </div>

    <!-- 菜品详情弹窗 -->
    <el-dialog v-model="showDetail" width="640px" class="dish-detail-dialog" :destroy-on-close="true">
      <template #header>
        <div v-if="selectedDish" class="dialog-header">
          <h2>{{ selectedDish.dishName }}</h2>
          <el-tag :type="getStatusTagType(selectedDish.dishStatus)" size="large">
            {{ getDishStatusText(selectedDish.dishStatus) }}
          </el-tag>
        </div>
      </template>
      <div v-if="selectedDish" class="dish-detail">
        <div class="detail-image">
          <img :src="selectedDish.dishPhoto || defaultImage" :alt="selectedDish.dishName" />
        </div>
        <div class="detail-body">
          <div class="detail-price-row">
            <span class="detail-price">¥{{ Number(selectedDish.price).toFixed(2) }}</span>
            <span class="detail-rating">
              ⭐ {{ selectedDish.dishScore }}
              <span class="detail-rating-count">({{ selectedDish.dishScorePerson }}人评价)</span>
            </span>
          </div>
          <div class="detail-info-grid">
            <div class="detail-info-item">
              <span class="detail-label">销量</span>
              <span class="detail-value">{{ selectedDish.dishSales }}</span>
            </div>
            <div class="detail-info-item">
              <span class="detail-label">分类</span>
              <span class="detail-value">{{ selectedDish.categoryId || '未分类' }}</span>
            </div>
          </div>
          <div class="detail-section">
            <h4>食材成分</h4>
            <p>{{ selectedDish.ingredients || '暂无成分信息' }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button
          type="primary"
          v-if="selectedDish?.dishStatus === 1"
          @click="addToCart"
          size="large"
        >
          加入购物车
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOnShelfDishes, getDishesByShop, getDishesByCategory } from '../api/dish'
import { createComment, getShopComments } from '../api/comment'
import { useUserStore } from '../store/user'
import type { Dish, Comment } from '../types'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(true)

const filterForm = ref({
  shopId: '',
  categoryId: ''
})

const dishes = ref<Dish[]>([])
const showDetail = ref(false)
const selectedDish = ref<Dish | null>(null)
const defaultImage = 'https://via.placeholder.com/300x200?text=菜品图片'

// 店铺评论
const shopComments = ref<Comment[]>([])
const commentSubmitting = ref(false)
const shopCommentForm = reactive({
  score: 5,
  context: ''
})

const loadShopComments = async () => {
  if (!filterForm.value.shopId) return
  try {
    const response = await getShopComments(filterForm.value.shopId)
    shopComments.value = response.data.data || []
  } catch (error) {
    console.error('获取店铺评论失败:', error)
    shopComments.value = []
  }
}

const submitShopComment = async () => {
  if (!shopCommentForm.context.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  commentSubmitting.value = true
  try {
    await createComment({
      context: shopCommentForm.context,
      score: shopCommentForm.score,
      shopId: filterForm.value.shopId
    })
    ElMessage.success('评价发表成功')
    shopCommentForm.context = ''
    shopCommentForm.score = 5
    await loadShopComments()
  } catch (error) {
    console.error('发表店铺评论失败:', error)
    ElMessage.error('发表评论失败')
  } finally {
    commentSubmitting.value = false
  }
}

const loadDishes = async () => {
  loading.value = true
  try {
    if (filterForm.value.shopId) {
      const response = await getDishesByShop(filterForm.value.shopId)
      dishes.value = response.data.data || []
    } else if (filterForm.value.categoryId) {
      const response = await getDishesByCategory(filterForm.value.categoryId)
      dishes.value = response.data.data || []
    } else {
      const response = await getOnShelfDishes()
      dishes.value = response.data.data || []
    }
    if (filterForm.value.shopId) {
      await loadShopComments()
    }
  } catch (error) {
    console.error('获取菜品失败:', error)
    ElMessage.error('获取菜品失败')
    dishes.value = []
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.value = { shopId: '', categoryId: '' }
  shopComments.value = []
  loadDishes()
}

const viewDishDetail = (dish: Dish) => {
  selectedDish.value = dish
  showDetail.value = true
}

const getDishStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: '已上架',
    2: '已售罄',
    3: '暂时下架',
    4: '已删除',
    5: '审核未通过'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: number) => {
  if (status === 0) return 'warning'
  if (status === 1) return 'success'
  if (status === 2 || status === 4 || status === 5) return 'danger'
  if (status === 3) return 'info'
  return 'info'
}

const addToCart = () => {
  if (!selectedDish.value) return
  ElMessage.success(`已将 "${selectedDish.value.dishName}" 加入购物车`)
  showDetail.value = false
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  loadDishes()
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

/* Hero banner */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48px 24px;
  text-align: center;
}

.hero-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.hero-content p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
}

/* Main container */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Filter */
.filter-bar {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filter-inputs {
  display: flex;
  gap: 12px;
  flex: 1;
}

.filter-input {
  width: 200px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Loading grid */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.skeleton-img {
  height: 180px;
  background: #f0f0f0;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 24px;
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

/* Dish grid */
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.dish-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dish-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.dish-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f0f0f0;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.dish-body {
  padding: 16px;
}

.dish-name {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dish-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 700;
}

.dish-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-star {
  font-size: 14px;
}

.rating-value {
  font-size: 14px;
  color: #e6a23c;
  font-weight: 600;
}

.dish-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.dish-footer {
  padding: 0 16px 16px;
}

.cart-btn {
  width: 100%;
}

/* Shop comment section */
.shop-comment-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.shop-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.section-title-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.shop-id-badge {
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 20px;
}

.shop-comment-form {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.comment-form-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.comment-rating-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.comment-label {
  font-size: 14px;
  color: #606266;
}

.comment-input-field {
  flex: 1;
}

.shop-comment-list {
  display: grid;
  gap: 12px;
}

.comment-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.comment-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-item-time {
  font-size: 13px;
  color: #909399;
}

.comment-item-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

.no-comments {
  text-align: center;
  padding: 32px 0;
  color: #909399;
  font-size: 14px;
}

/* Page footer */
.page-footer {
  background: #303133;
  color: #909399;
  text-align: center;
  padding: 24px;
  font-size: 14px;
  margin-top: 48px;
}

/* Detail dialog */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.dish-detail {
  display: flex;
  gap: 24px;
}

.detail-image {
  width: 240px;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f0f0;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-body {
  flex: 1;
}

.detail-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: 700;
}

.detail-rating {
  font-size: 15px;
  color: #e6a23c;
  font-weight: 600;
}

.detail-rating-count {
  font-size: 13px;
  color: #909399;
  font-weight: 400;
  margin-left: 4px;
}

.detail-info-grid {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.detail-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 13px;
  color: #909399;
}

.detail-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.detail-section {
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.detail-section p {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-inputs {
    flex-direction: column;
    width: 100%;
  }

  .filter-input {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
  }

  .filter-actions .el-button {
    flex: 1;
  }

  .dish-grid {
    grid-template-columns: 1fr;
  }

  .dish-detail {
    flex-direction: column;
  }

  .detail-image {
    width: 100%;
    height: 200px;
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
