<template>
  <div class="profile-page">
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
          <router-link to="/profile" class="nav-item active">个人中心</router-link>
          <router-link v-if="userStore.isUser" to="/order" class="nav-item">我的订单</router-link>
          <router-link v-if="userStore.isShop" to="/shop" class="nav-item">店铺管理</router-link>
          <router-link v-if="userStore.isUser || userStore.isShop" to="/comment" class="nav-item">我的评论</router-link>
          <router-link v-if="userStore.isAdmin" to="/admin" class="nav-item">管理员后台</router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">个人中心</h1>
        <p class="page-subtitle">查看和管理您的个人信息</p>
      </div>

      <div class="content-grid">
        <!-- 用户信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <h2 class="card-title">基本信息</h2>
            <el-button type="primary" size="small" @click="toggleEdit">
              {{ editing ? '取消编辑' : '编辑信息' }}
            </el-button>
          </div>

          <div v-if="editing" class="edit-form">
            <!-- 普通用户/管理员编辑表单 -->
            <el-form v-if="userStore.isUser || userStore.isAdmin" :model="editForm" label-width="80px">
              <el-form-item label="用户名">
                <el-input v-model="editForm.userName" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="editForm.sex" style="width: 100%">
                  <el-option label="未知" :value="0" />
                  <el-option label="男" :value="1" />
                  <el-option label="女" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="地址">
                <el-input v-model="editForm.address" placeholder="请输入地址" />
              </el-form-item>
              <el-form-item label="头像URL">
                <el-input v-model="editForm.userPhoto" placeholder="请输入头像URL" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="editForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
              </el-form-item>
            </el-form>

            <!-- 店铺用户编辑表单 -->
            <el-form v-if="userStore.isShop" :model="shopEditForm" label-width="80px">
              <el-form-item label="店铺名称">
                <el-input v-model="shopEditForm.shopName" placeholder="请输入店铺名称" />
              </el-form-item>
              <el-form-item label="店铺类型">
                <el-input-number v-model="shopEditForm.shopType" :min="0" style="width: 100%" />
              </el-form-item>
              <el-form-item label="店铺电话">
                <el-input v-model="shopEditForm.shopPhone" placeholder="请输入店铺电话" />
              </el-form-item>
              <el-form-item label="配送费">
                <el-input-number v-model="shopEditForm.deliveryFee" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
              <el-form-item label="图片URL">
                <el-input v-model="shopEditForm.shopPhoto" placeholder="请输入图片URL" />
              </el-form-item>
              <el-form-item label="位置编码">
                <el-input-number v-model="shopEditForm.position" :min="0" style="width: 100%" />
              </el-form-item>
              <el-form-item label="营业状态">
                <el-switch v-model="shopEditForm.operating" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-else class="info-list">
            <!-- 普通用户 / 管理员 信息 -->
            <template v-if="userStore.isUser || userStore.isAdmin">
              <div class="info-item">
                <span class="info-label">账号</span>
                <span class="info-value">{{ userInfo?.userAccount || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户名</span>
                <span class="info-value">{{ userInfo?.userName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">性别</span>
                <span class="info-value">{{ sexText(userInfo?.sex) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">手机号</span>
                <span class="info-value">{{ userInfo?.phoneNum || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">地址</span>
                <span class="info-value">{{ userInfo?.address || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">头像</span>
                <span class="info-value">
                  <img v-if="userInfo?.userPhoto" :src="userInfo.userPhoto" class="avatar-preview" />
                  <span v-else>-</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">注册时间</span>
                <span class="info-value">{{ userInfo?.createTime || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">账户状态</span>
                <el-tag :type="statusTagType(userInfo?.userStatus)" size="small">
                  {{ userStatusText(userInfo?.userStatus) }}
                </el-tag>
              </div>
            </template>

            <!-- 店铺用户信息 -->
            <template v-if="userStore.isShop">
              <div class="info-item">
                <span class="info-label">店铺ID</span>
                <span class="info-value">{{ userInfo?.shopId || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺名称</span>
                <span class="info-value">{{ userInfo?.shopName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺账号</span>
                <span class="info-value">{{ userInfo?.shopAccount || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺电话</span>
                <span class="info-value">{{ userInfo?.shopPhone || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">配送费</span>
                <span class="info-value">¥{{ Number(userInfo?.deliveryFee || 0).toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">位置编码</span>
                <span class="info-value">{{ userInfo?.position ?? '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺评分</span>
                <span class="info-value">{{ userInfo?.shopScore ?? '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺销量</span>
                <span class="info-value">{{ userInfo?.shopSales ?? '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺状态</span>
                <el-tag :type="shopStatusTagType(userInfo?.shopStatus)" size="small">
                  {{ shopStatusText(userInfo?.shopStatus) }}
                </el-tag>
              </div>
            </template>
          </div>
        </div>

        <!-- 头像展示卡片 -->
        <div class="avatar-card">
          <div class="avatar-placeholder" v-if="!userInfo?.userPhoto">
            <span class="avatar-letter">{{ (userInfo?.userName || userInfo?.shopName || userInfo?.userAccount || '?')[0] }}</span>
          </div>
          <img v-else :src="userInfo.userPhoto" class="avatar-large" />
          <h3>{{ userInfo?.userName || userInfo?.userAccount || userInfo?.shopName || '未知用户' }}</h3>
          <p class="avatar-role">{{ roleText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { updateUser } from '../api/user'
import { updateShop } from '../api/shop'

const router = useRouter()
const userStore = useUserStore()
const editing = ref(false)
const saving = ref(false)

onMounted(() => {
  userStore.fetchCurrentInfo()
})

const userInfo = computed(() => userStore.userInfo)

const roleText = computed(() => {
  if (userStore.isAdmin) return '管理员'
  if (userStore.isShop) return '店铺用户'
  return '普通用户'
})

const editForm = ref({
  userName: '',
  sex: 0,
  address: '',
  userPhoto: '',
  phone: ''
})

const shopEditForm = ref({
  shopName: '',
  shopType: 0,
  shopPhone: '',
  deliveryFee: 0,
  shopPhoto: '',
  operating: 0,
  position: 0
})

const toggleEdit = () => {
  if (!editing.value) {
    if (userStore.isShop) {
      shopEditForm.value = {
        shopName: userInfo.value?.shopName || '',
        shopType: userInfo.value?.shopType ?? 0,
        shopPhone: userInfo.value?.shopPhone || '',
        deliveryFee: userInfo.value?.deliveryFee ?? 0,
        shopPhoto: userInfo.value?.shopPhoto || '',
        operating: userInfo.value?.operating ?? 0,
        position: userInfo.value?.position ?? 0
      }
    } else {
      editForm.value = {
        userName: userInfo.value?.userName || '',
        sex: userInfo.value?.sex ?? 0,
        address: userInfo.value?.address || '',
        userPhoto: userInfo.value?.userPhoto || '',
        phone: userInfo.value?.phoneNum || ''
      }
    }
  }
  editing.value = !editing.value
}

const saveProfile = async () => {
  saving.value = true
  try {
    if (userStore.isShop) {
      await updateShop(shopEditForm.value)
    } else {
      await updateUser(editForm.value)
    }
    ElMessage.success('信息更新成功')
    if (userInfo.value) {
      if (userStore.isShop) {
        Object.assign(userInfo.value, shopEditForm.value)
      } else {
        Object.assign(userInfo.value, editForm.value)
      }
    }
    editing.value = false
  } catch (error) {
    console.error('更新信息失败:', error)
  } finally {
    saving.value = false
  }
}

const sexText = (sex?: number) => {
  if (sex === 1) return '男'
  if (sex === 2) return '女'
  return '未知'
}

const userStatusText = (status?: number) => {
  if (status === 0) return '正常'
  if (status === 1) return '受限'
  if (status === 2) return '注销'
  return '未知'
}

const statusTagType = (status?: number) => {
  if (status === 0) return 'success'
  if (status === 1) return 'warning'
  if (status === 2) return 'danger'
  return 'info'
}

const shopStatusText = (status?: number) => {
  const map: Record<number, string> = { 0: '待审核', 1: '营业中', 2: '休息中', 3: '暂时歇业', 4: '永久停业', 5: '审核未通过' }
  return map[status ?? -1] || '未知'
}

const shopStatusTagType = (status?: number) => {
  if (status === 0) return 'warning'
  if (status === 1) return 'success'
  if (status === 2) return 'info'
  if (status === 3 || status === 4 || status === 5) return 'danger'
  return 'info'
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-page {
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

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 0;
}

.info-list {
  display: grid;
  gap: 0;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f7fa;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 100px;
  font-size: 14px;
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  font-size: 15px;
  color: #303133;
}

.avatar-preview {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
  align-self: flex-start;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.avatar-letter {
  font-size: 40px;
  color: #fff;
  font-weight: 600;
}

.avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 16px;
  display: block;
}

.avatar-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.avatar-role {
  font-size: 13px;
  color: #909399;
}

.edit-form {
  max-width: 400px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .page-container {
    padding: 20px 16px;
  }

  .info-card {
    padding: 20px;
  }

  .navbar-menu {
    gap: 4px;
    flex-wrap: wrap;
  }

  .nav-item {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
