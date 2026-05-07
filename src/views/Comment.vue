<template>
  <div class="comment-page">
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
          <router-link v-if="userStore.isUser" to="/order" class="nav-item">我的订单</router-link>
          <router-link v-if="userStore.isShop" to="/shop" class="nav-item">店铺管理</router-link>
          <router-link to="/comment" class="nav-item active">我的评论</router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">我的评论</h1>
        <p class="page-subtitle">查看和管理您发表的评论</p>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else-if="comments.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>暂无评论</h3>
        <p>您还没有发表过评论</p>
        <router-link v-if="userStore.isUser" to="/order" class="empty-link">去订单页评价菜品</router-link>
      </div>

      <div v-else class="comment-list">
        <div class="comment-card" v-for="item in comments" :key="item.commentId">
          <div class="comment-card-header">
            <div class="comment-left">
              <div class="comment-rating">
                <el-rate v-model="item.score" disabled show-score size="small" />
              </div>
              <el-tag v-if="item.shopId" size="small" type="warning">店铺评价</el-tag>
              <el-tag v-if="item.dishId" size="small" type="success">菜品评价</el-tag>
            </div>
            <div class="comment-right">
              <span class="comment-time">{{ item.createTime }}</span>
              <el-button type="danger" size="small" plain @click="handleDelete(item.commentId)">删除</el-button>
            </div>
          </div>
          <p class="comment-text">{{ item.context }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserComments, deleteComment } from '../api/comment'
import { useUserStore } from '../store/user'
import type { Comment } from '../types'

const router = useRouter()
const userStore = useUserStore()
const comments = ref<Comment[]>([])
const loading = ref(true)

onMounted(() => {
  loadComments()
})

const loadComments = async () => {
  loading.value = true
  try {
    const response = await getUserComments()
    comments.value = response.data.data || []
  } catch (error) {
    console.error('获取我的评论失败:', error)
    comments.value = []
  } finally {
    loading.value = false
  }
}

const handleDelete = async (commentId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteComment(commentId)
    ElMessage.success('评论已删除')
    loadComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
    }
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.comment-page {
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
  max-width: 800px;
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

.comment-list {
  display: grid;
  gap: 12px;
}

.comment-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;
}

.comment-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.comment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.comment-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comment-time {
  font-size: 13px;
  color: #909399;
}

.comment-text {
  font-size: 15px;
  color: #303133;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px 16px;
  }

  .comment-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .comment-right {
    width: 100%;
    justify-content: space-between;
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
