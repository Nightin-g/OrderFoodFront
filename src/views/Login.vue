<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">🍽️</div>
          <h1>大学食堂订餐系统</h1>
          <p>选择您的身份登录</p>
        </div>

        <!-- 角色选择标签 -->
        <div class="role-tabs">
          <button
            v-for="r in roles"
            :key="r.key"
            :class="['role-tab', { active: activeRole === r.key }]"
            @click="switchRole(r.key)"
          >
            <span class="role-icon">{{ r.icon }}</span>
            <span>{{ r.label }}</span>
          </button>
        </div>

        <!-- 普通用户登录 -->
        <el-form v-if="activeRole === 'user'" ref="userFormRef" :model="userForm" :rules="userRules" class="login-form" @submit.prevent="handleLogin">
          <el-form-item prop="userAccount">
            <el-input v-model="userForm.userAccount" placeholder="请输入账号" size="large" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="userForm.password" placeholder="请输入密码" size="large" show-password clearable />
          </el-form-item>
          <el-form-item class="submit-item">
            <el-button type="primary" native-type="submit" size="large" class="submit-btn" :loading="loading">
              {{ loading ? '登录中...' : '用户登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 店铺用户登录 -->
        <el-form v-if="activeRole === 'shop'" ref="shopFormRef" :model="shopForm" :rules="shopRules" class="login-form" @submit.prevent="handleLogin">
          <el-form-item prop="shopAccount">
            <el-input v-model="shopForm.shopAccount" placeholder="请输入店铺账号" size="large" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="shopForm.password" placeholder="请输入密码" size="large" show-password clearable />
          </el-form-item>
          <div class="captcha-section">
            <captcha ref="captchaRef" />
          </div>
          <el-form-item class="submit-item">
            <el-button type="primary" native-type="submit" size="large" class="submit-btn" :loading="loading">
              {{ loading ? '登录中...' : '店铺登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 管理员登录 -->
        <el-form v-if="activeRole === 'admin'" ref="adminFormRef" :model="adminForm" :rules="adminRules" class="login-form" @submit.prevent="handleLogin">
          <el-form-item prop="adminAccount">
            <el-input v-model="adminForm.adminAccount" placeholder="请输入管理员账号" size="large" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="adminForm.password" placeholder="请输入密码" size="large" show-password clearable />
          </el-form-item>
          <el-form-item class="submit-item">
            <el-button type="primary" native-type="submit" size="large" class="submit-btn" :loading="loading">
              {{ loading ? '登录中...' : '管理员登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册 →</router-link>
        </div>
      </div>

      <div class="login-decoration">
        <div class="decoration-text">
          <h2>便捷订餐</h2>
          <p>美味即刻送达</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { useUserStore } from '../store/user'
import { login } from '../api/user'
import { loginShop } from '../api/shop'
import { adminLogin } from '../api/admin'
import { UserRole } from '../types'
import Captcha from '../components/Captcha.vue'

const router = useRouter()
const userStore = useUserStore()

const activeRole = ref<'user' | 'shop' | 'admin'>('user')
const loading = ref(false)
const userFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const shopFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const adminFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const captchaRef = ref<InstanceType<typeof Captcha> | null>(null)

const roles = [
  { key: 'user' as const, label: '普通用户', icon: '👤' },
  { key: 'shop' as const, label: '店铺用户', icon: '🏪' },
  { key: 'admin' as const, label: '管理员', icon: '🛡️' }
]

const userForm = reactive({ userAccount: '', password: '' })
const shopForm = reactive({ shopAccount: '', password: '' })
const adminForm = reactive({ adminAccount: '', password: '' })

const userRules = {
  userAccount: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }]
}
const shopRules = {
  shopAccount: [{ required: true, message: '请输入店铺账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }]
}
const adminRules = {
  adminAccount: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }]
}

const switchRole = (role: 'user' | 'shop' | 'admin') => {
  activeRole.value = role
}

const handleLogin = async () => {
  const formRef = activeRole.value === 'user' ? userFormRef.value : activeRole.value === 'shop' ? shopFormRef.value : adminFormRef.value
  if (!formRef) return

  try {
    await formRef.validate()
  } catch {
    return
  }

  // 店铺登录需要验证码
  if (activeRole.value === 'shop') {
    if (!captchaRef.value) {
      ElMessage.warning('请获取验证码')
      return
    }
    const captcha = captchaRef.value.getCaptcha()
    if (!captcha) {
      ElMessage.warning('请输入验证码')
      return
    }
  }

  loading.value = true

  try {
    let response: any

    if (activeRole.value === 'user') {
      response = await login({ userAccount: userForm.userAccount, password: userForm.password })
    } else if (activeRole.value === 'shop') {
      const captcha = captchaRef.value!.getCaptcha()
      const captchaKey = captchaRef.value!.getCaptchaKey()
      response = await loginShop({ shopAccount: shopForm.shopAccount, password: shopForm.password, captcha, captchaKey })
    } else {
      response = await adminLogin({ adminAccount: adminForm.adminAccount, password: adminForm.password })
    }

    const { code, msg, data, extra } = response.data

    if (code === 200) {
      // 提取 token
      let token = ''
      if (typeof data === 'string') {
        token = data
      } else if (data?.token) {
        token = data.token
      }
      if (!token && extra?.token) {
        token = extra.token
      }
      if (!token) {
        const authHeader = response.headers['authorization']
        if (authHeader) token = authHeader.replace('Bearer ', '')
      }

      if (token) {
        userStore.setToken(token)
      } else {
        userStore.markLoggedIn()
      }

      // 设置角色
      userStore.setRole(activeRole.value as UserRole)

      // 保存用户信息（登录响应中的 data 作为初始值）
      if (data?.userInfo) {
        userStore.setUserInfo(data.userInfo)
      } else if (data?.shopInfo) {
        userStore.setUserInfo(data.shopInfo)
      } else if (typeof data === 'object' && data !== null && !data.token && !Array.isArray(data) && Object.keys(data).length > 0) {
        userStore.setUserInfo(data)
      }

      // 从后端 /me 接口获取完整的用户信息
      await userStore.fetchCurrentInfo()

      ElMessage.success(msg || '登录成功')
      router.push('/')
    } else {
      ElMessage.error(msg || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    const errorMsg = error.response?.data?.msg || error.message || '登录失败'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-container {
  width: 100%;
  max-width: 960px;
  display: flex;
  align-items: center;
  gap: 48px;
}

.login-card {
  flex: 1;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  max-width: 460px;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-icon { font-size: 48px; margin-bottom: 12px; }

.login-header h1 {
  font-size: 22px; font-weight: 700; color: #303133; margin-bottom: 6px;
}

.login-header p {
  font-size: 14px; color: #909399;
}

/* 角色选择标签 */
.role-tabs {
  display: flex;
  gap: 6px;
  background: #f5f7fa;
  border-radius: 10px;
  padding: 5px;
  margin-bottom: 28px;
}

.role-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.2s;
}

.role-tab:hover { color: #409eff; }

.role-tab.active {
  background: #409eff;
  color: #fff;
}

.role-icon { font-size: 16px; }

.login-form { max-width: 360px; margin: 0 auto; }

.captcha-section { margin-bottom: 16px; }

.submit-item { margin-top: 8px; }

.submit-btn {
  width: 100%; height: 48px; border-radius: 10px;
  font-size: 16px; font-weight: 600; letter-spacing: 2px;
}

.login-footer {
  text-align: center; margin-top: 24px; font-size: 14px; color: #909399;
}

.login-footer a {
  color: #409eff; text-decoration: none; font-weight: 500; margin-left: 4px;
}

.login-footer a:hover { color: #66b1ff; }

.login-decoration { display: none; flex: 1; text-align: center; }

.decoration-text h2 {
  font-size: 36px; font-weight: 700; color: #fff; margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.decoration-text p { font-size: 18px; color: rgba(255, 255, 255, 0.85); }

@media (min-width: 768px) { .login-decoration { display: block; } }

@media (max-width: 768px) {
  .login-card { padding: 32px 24px; }
  .login-container { max-width: 420px; }
}
</style>
