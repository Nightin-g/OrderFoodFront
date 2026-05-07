<template>
  <div class="shop-page">
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
          <router-link to="/shop" class="nav-item active">店铺管理</router-link>
          <router-link to="/comment" class="nav-item">我的评论</router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">店铺管理</h1>
        <p class="page-subtitle">管理您的店铺信息、菜品和营业状态</p>
      </div>

      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="tab-content">
        <!-- 店铺信息 -->
        <div v-if="activeTab === 'info'" class="content-card">
          <h2 class="card-title">店铺信息</h2>
          <el-form :model="shopForm" label-width="100px" class="shop-form">
            <el-form-item label="店铺名称">
              <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" />
            </el-form-item>
            <el-form-item label="店铺类型">
              <el-input-number v-model="shopForm.shopType" :min="0" placeholder="店铺类型编号" style="width: 200px" />
            </el-form-item>
            <el-form-item label="店铺电话">
              <el-input v-model="shopForm.shopPhone" placeholder="请输入店铺电话" />
            </el-form-item>
            <el-form-item label="配送费">
              <el-input-number v-model="shopForm.deliveryFee" :min="0" :precision="2" :step="0.5" style="width: 200px" />
            </el-form-item>
            <el-form-item label="店铺图片URL">
              <el-input v-model="shopForm.shopPhoto" placeholder="请输入图片URL" />
            </el-form-item>
            <el-form-item label="位置编码">
              <el-input-number v-model="shopForm.position" :min="0" placeholder="十位食堂，个位楼层" style="width: 200px" />
            </el-form-item>
            <el-form-item label="营业状态">
              <el-switch v-model="shopForm.operating" :active-value="1" :inactive-value="0" active-text="营业中" inactive-text="休息中" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" @click="updateShopInfo">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 菜品管理 -->
        <div v-else-if="activeTab === 'dishes'" class="content-card">
          <div class="card-header-row">
            <h2 class="card-title" style="margin-bottom: 0; padding-bottom: 0; border-bottom: none;">菜品管理</h2>
            <el-button type="primary" @click="showAddDishForm = true">
              <span style="margin-right: 4px;">+</span> 添加菜品
            </el-button>
          </div>
          <el-table :data="dishes" style="width: 100%" class="dish-table" :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: 600 }">
            <el-table-column prop="dishName" label="菜品名称" min-width="150" />
            <el-table-column prop="price" label="价格" width="100">
              <template #default="scope">¥{{ Number(scope.row.price).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="categoryId" label="分类ID" width="100" />
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getDishStatusTagType(scope.row.dishStatus)" size="small">
                  {{ getDishStatusText(scope.row.dishStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ingredients" label="食材成分" min-width="200" show-overflow-tooltip />
          </el-table>
        </div>

        <!-- 状态管理 -->
        <div v-else-if="activeTab === 'status'" class="content-card">
          <h2 class="card-title">店铺状态管理</h2>
          <div class="status-grid">
            <div class="status-card success" @click="openShop">
              <div class="status-icon">🟢</div>
              <h3>开始营业</h3>
              <p>店铺开始正常接单</p>
            </div>
            <div class="status-card warning" @click="restShop">
              <div class="status-icon">🟡</div>
              <h3>进入休息</h3>
              <p>暂时休息，暂停接单</p>
            </div>
            <div class="status-card info" @click="temporaryCloseShop">
              <div class="status-icon">🔵</div>
              <h3>暂时歇业</h3>
              <p>暂时关闭店铺</p>
            </div>
            <div class="status-card primary" @click="resumeShop">
              <div class="status-icon">🔄</div>
              <h3>恢复营业</h3>
              <p>重新开始营业</p>
            </div>
            <div class="status-card danger" @click="permanentCloseShop">
              <div class="status-icon">🔴</div>
              <h3>永久停业</h3>
              <p>永久关闭店铺</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加菜品弹窗 -->
    <el-dialog v-model="showAddDishForm" title="添加菜品" width="520px" class="add-dish-dialog">
      <el-form :model="dishForm" label-width="100px">
        <el-form-item label="菜品名称">
          <el-input v-model="dishForm.dishName" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="菜品价格">
          <el-input-number v-model="dishForm.price" :min="0" :precision="2" :step="1" style="width: 200px" />
        </el-form-item>
        <el-form-item label="分类ID">
          <el-input v-model="dishForm.categoryId" placeholder="请输入分类ID" />
        </el-form-item>
        <el-form-item label="食材成分">
          <el-input type="textarea" v-model="dishForm.ingredients" rows="3" placeholder="描述菜品的主要食材..." />
        </el-form-item>
        <el-form-item label="菜品图片URL">
          <el-input v-model="dishForm.dishPhoto" placeholder="请输入菜品图片URL" />
        </el-form-item>
        <el-form-item label="图片ID">
          <el-input v-model="dishForm.dishPhotoId" placeholder="请输入图片ID（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDishForm = false">取消</el-button>
        <el-button type="primary" @click="addDish">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateShop as apiUpdateShop, addDish as apiAddDish, openShop as apiOpenShop, restShop as apiRestShop, temporaryCloseShop as apiTemporaryCloseShop, resumeShop as apiResumeShop, permanentCloseShop as apiPermanentCloseShop } from '../api/shop'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('info')
const showAddDishForm = ref(false)

const tabs = [
  { key: 'info', label: '店铺信息', icon: '🏪' },
  { key: 'dishes', label: '菜品管理', icon: '🍲' },
  { key: 'status', label: '状态管理', icon: '⚙️' }
]

const shopForm = ref({
  shopName: '',
  shopType: 0,
  shopPhone: '',
  deliveryFee: 0,
  shopPhoto: '',
  operating: 0,
  position: 0
})

const dishForm = ref({
  dishName: '',
  price: 0,
  categoryId: '',
  ingredients: '',
  dishPhoto: '',
  dishPhotoId: ''
})

interface ShopDish {
  dishId: string
  dishName: string
  price: number
  categoryId: string
  ingredients: string
  dishStatus: number
}

const dishes = ref<ShopDish[]>([])

onMounted(() => {
  shopForm.value = {
    shopName: '张三的餐厅',
    shopType: 0,
    shopPhone: '13800138000',
    deliveryFee: 2.00,
    shopPhoto: '',
    operating: 1,
    position: 12
  }

  dishes.value = [
    { dishId: '1', dishName: '宫保鸡丁', price: 15.00, categoryId: '1', ingredients: '鸡肉、花生、辣椒', dishStatus: 1 },
    { dishId: '2', dishName: '鱼香肉丝', price: 12.00, categoryId: '1', ingredients: '猪肉、木耳、胡萝卜', dishStatus: 1 }
  ]
})

const updateShopInfo = async () => {
  try {
    await apiUpdateShop(shopForm.value)
    ElMessage.success('店铺信息更新成功')
  } catch (error) {
    console.error('更新店铺信息失败:', error)
  }
}

const addDish = async () => {
  try {
    await apiAddDish(dishForm.value)
    ElMessage.success('菜品添加成功，等待审核')
    showAddDishForm.value = false
    dishForm.value = {
      dishName: '',
      price: 0,
      categoryId: '',
      ingredients: '',
      dishPhoto: '',
      dishPhotoId: ''
    }
  } catch (error) {
    console.error('添加菜品失败:', error)
  }
}

const openShop = async () => {
  try {
    await apiOpenShop()
    ElMessage.success('店铺已开始营业')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const restShop = async () => {
  try {
    await apiRestShop()
    ElMessage.success('店铺已进入休息状态')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const temporaryCloseShop = async () => {
  try {
    await apiTemporaryCloseShop()
    ElMessage.success('店铺已暂时歇业')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const resumeShop = async () => {
  try {
    await apiResumeShop()
    ElMessage.success('店铺已恢复营业')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const permanentCloseShop = async () => {
  try {
    await ElMessageBox.confirm('确定要永久停业吗？此操作不可撤销。', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await apiPermanentCloseShop()
    ElMessage.success('店铺已永久停业')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
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
  return statusMap[status] || '未知状态'
}

const getDishStatusTagType = (status: number) => {
  if (status === 0) return 'warning'
  if (status === 1) return 'success'
  if (status === 2 || status === 4 || status === 5) return 'danger'
  if (status === 3) return 'info'
  return 'info'
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.shop-page {
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
  gap: 6px;
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

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.shop-form {
  max-width: 560px;
}

.dish-table {
  border-radius: 8px;
  overflow: hidden;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.status-card {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.status-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.status-card.success:hover {
  border-color: #67c23a;
}

.status-card.warning:hover {
  border-color: #e6a23c;
}

.status-card.info:hover {
  border-color: #909399;
}

.status-card.primary:hover {
  border-color: #409eff;
}

.status-card.danger:hover {
  border-color: #f56c6c;
}

.status-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.status-card h3 {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.status-card p {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px 16px;
  }

  .tab-bar {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: none;
    width: calc(50% - 4px);
  }

  .content-card {
    padding: 20px;
  }

  .status-grid {
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
