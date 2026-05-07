<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo-icon">🍽️</div>
          <h1>大学食堂订餐系统</h1>
          <p>选择您的身份注册</p>
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

        <!-- 普通用户注册 -->
        <el-form v-if="activeRole === 'user'" ref="userFormRef" :model="userForm" :rules="userRules" class="register-form" @submit.prevent="handleRegister">
          <el-form-item prop="userAccount">
            <el-input v-model="userForm.userAccount" placeholder="请输入账号" size="large" clearable />
          </el-form-item>
          <el-form-item prop="userName">
            <el-input v-model="userForm.userName" placeholder="请输入用户名（可选）" size="large" clearable />
          </el-form-item>
          <el-form-item prop="phoneNum">
            <el-input v-model="userForm.phoneNum" placeholder="请输入手机号" size="large" clearable />
          </el-form-item>
          <div class="form-row">
            <el-form-item prop="password">
              <el-input type="password" v-model="userForm.password" placeholder="请输入密码" size="large" show-password clearable />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input type="password" v-model="userForm.confirmPassword" placeholder="请确认密码" size="large" show-password clearable />
            </el-form-item>
          </div>
          <el-form-item class="submit-item">
            <el-button type="primary" native-type="submit" size="large" class="submit-btn" :loading="loading">
              {{ loading ? '注册中...' : '注册用户' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 店铺用户注册 -->
        <el-form v-if="activeRole === 'shop'" ref="shopFormRef" :model="shopForm" :rules="shopRules" class="register-form" @submit.prevent="handleRegister">
          <el-form-item prop="shopName">
            <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" size="large" clearable />
          </el-form-item>
          <el-form-item prop="shopAccount">
            <el-input v-model="shopForm.shopAccount" placeholder="请输入店铺账号" size="large" clearable />
          </el-form-item>
          <div class="form-row">
            <el-form-item prop="password">
              <el-input type="password" v-model="shopForm.password" placeholder="请输入密码" size="large" show-password clearable />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input type="password" v-model="shopForm.confirmPassword" placeholder="请确认密码" size="large" show-password clearable />
            </el-form-item>
          </div>
          <el-form-item prop="shopPhone">
            <el-input v-model="shopForm.shopPhone" placeholder="请输入店铺电话" size="large" clearable />
          </el-form-item>
          <div class="form-row">
            <el-form-item prop="shopType" label="店铺类型" label-width="80px">
              <el-input-number v-model="shopForm.shopType" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item prop="position" label="位置编码" label-width="80px">
              <el-input-number v-model="shopForm.position" :min="0" style="width: 100%" />
            </el-form-item>
          </div>
          <div class="captcha-section">
            <captcha ref="captchaRef" />
          </div>
          <el-form-item class="submit-item">
            <el-button type="primary" native-type="submit" size="large" class="submit-btn" :loading="loading">
              {{ loading ? '注册中...' : '注册店铺' }}
            </el-button>
          </el-form-item>
          <p class="shop-notice">⚠️ 店铺注册后需要管理员审核通过才能正常使用</p>
        </el-form>

        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录 →</router-link>
        </div>
      </div>

      <div class="register-decoration">
        <div class="decoration-text">
          <h2>加入我们</h2>
          <p>探索校园美食新体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { register } from '../api/user'
import { registerShop } from '../api/shop'
import Captcha from '../components/Captcha.vue'

const router = useRouter()
const loading = ref(false)
const activeRole = ref<'user' | 'shop'>('user')
const userFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const shopFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const captchaRef = ref<InstanceType<typeof Captcha> | null>(null)

const roles = [
  { key: 'user' as const, label: '普通用户', icon: '👤' },
  { key: 'shop' as const, label: '店铺用户', icon: '🏪' }
]

const userForm = reactive({
  userAccount: '',
  userName: '',
  password: '',
  confirmPassword: '',
  phoneNum: ''
})

const shopForm = reactive({
  shopName: '',
  shopAccount: '',
  password: '',
  confirmPassword: '',
  shopType: 0,
  shopPhone: '',
  position: 0
})

const userRules = {
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== userForm.password) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ],
  userName: [],
  phoneNum: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

const shopRules = {
  shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  shopAccount: [
    { required: true, message: '请输入店铺账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== shopForm.password) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ],
  shopPhone: [
    { required: true, message: '请输入店铺电话', trigger: 'blur' }
  ],
  shopType: [{ required: true, message: '请选择店铺类型', trigger: 'blur' }],
  position: [{ required: true, message: '请输入位置编码', trigger: 'blur' }]
}

const switchRole = (role: 'user' | 'shop') => {
  activeRole.value = role
}

const handleRegister = async () => {
  const formRef = activeRole.value === 'user' ? userFormRef.value : shopFormRef.value
  if (!formRef) return

  try {
    await formRef.validate()
  } catch {
    return
  }

  // 店铺注册需要验证码
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
      response = await register({
        userAccount: userForm.userAccount,
        userName: userForm.userName || undefined,
        password: userForm.password,
        confirmPassword: userForm.confirmPassword,
        phoneNum: userForm.phoneNum
      })
    } else {
      const captcha = captchaRef.value!.getCaptcha()
      const captchaKey = captchaRef.value!.getCaptchaKey()
      response = await registerShop({
        shopName: shopForm.shopName,
        shopAccount: shopForm.shopAccount,
        password: shopForm.password,
        confirmPassword: shopForm.confirmPassword,
        shopType: shopForm.shopType,
        shopPhone: shopForm.shopPhone,
        position: shopForm.position,
        captcha,
        captchaKey
      })
    }

    const { code, msg } = response.data

    if (code === 200) {
      const tip = activeRole.value === 'shop' ? '注册成功，等待管理员审核' : '注册成功'
      ElMessage.success(tip)
      setTimeout(() => router.push('/login'), 1500)
    } else {
      ElMessage.error(msg || '注册失败')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    const errorMsg = error.response?.data?.msg || error.message || '注册失败'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.register-container {
  width: 100%;
  max-width: 960px;
  display: flex;
  align-items: center;
  gap: 48px;
}

.register-card {
  flex: 1;
  background: #fff;
  border-radius: 20px;
  padding: 36px 40px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  max-width: 540px;
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-icon { font-size: 40px; margin-bottom: 10px; }

.register-header h1 {
  font-size: 22px; font-weight: 700; color: #303133; margin-bottom: 6px;
}

.register-header p {
  font-size: 14px; color: #909399;
}

.role-tabs {
  display: flex;
  gap: 6px;
  background: #f5f7fa;
  border-radius: 10px;
  padding: 5px;
  margin-bottom: 24px;
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

.register-form { max-width: 480px; margin: 0 auto; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.captcha-section { margin-bottom: 16px; }

.submit-item { margin-top: 8px; }

.submit-btn {
  width: 100%; height: 48px; border-radius: 10px;
  font-size: 16px; font-weight: 600; letter-spacing: 2px;
}

.shop-notice {
  text-align: center; font-size: 13px; color: #e6a23c; margin-top: -8px;
}

.register-footer {
  text-align: center; margin-top: 20px; font-size: 14px; color: #909399;
}

.register-footer a {
  color: #409eff; text-decoration: none; font-weight: 500; margin-left: 4px;
}

.register-footer a:hover { color: #66b1ff; }

.register-decoration { display: none; flex: 1; text-align: center; }

.decoration-text h2 {
  font-size: 36px; font-weight: 700; color: #fff; margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.decoration-text p { font-size: 18px; color: rgba(255, 255, 255, 0.85); }

@media (min-width: 768px) { .register-decoration { display: block; } }

@media (max-width: 768px) {
  .register-card { padding: 28px 20px; }
  .register-container { max-width: 420px; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
