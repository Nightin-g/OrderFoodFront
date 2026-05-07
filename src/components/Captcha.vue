<template>
  <div class="captcha">
    <el-form-item label="验证码" required>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-input
            v-model="captcha"
            placeholder="请输入验证码"
            @keyup.enter="$emit('validate', captcha, captchaKey)"
          />
        </el-col>
        <el-col :span="12">
          <div class="captcha-container">
            <img
              v-if="captchaUrl"
              :src="captchaUrl"
              @click="refreshCaptcha"
              @error="handleImageError"
              class="captcha-image"
              alt="验证码"
            />
            <div v-else class="captcha-placeholder" @click="refreshCaptcha">
              <span class="placeholder-icon">📷</span>
              <span>点击获取验证码</span>
            </div>
            <div v-if="loadError" class="captcha-error">
              <span>加载失败，点击重试</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateCaptcha } from '../api/captcha'

const emit = defineEmits(['validate'])

const captcha = ref('')
const captchaKey = ref('')
const captchaUrl = ref('')
const loadError = ref(false)

const refreshCaptcha = async () => {
  loadError.value = false
  try {
    const response = await generateCaptcha()
    const headers = response.headers
    captchaKey.value = headers['captcha-key'] || headers['Captcha-Key'] || ''
    captchaUrl.value = URL.createObjectURL(response.data)
    captcha.value = ''
  } catch (error) {
    console.error('生成验证码失败:', error)
    loadError.value = true
    captchaUrl.value = ''
    captchaKey.value = ''
  }
}

const handleImageError = () => {
  loadError.value = true
  captchaUrl.value = ''
}

onMounted(() => {
  refreshCaptcha()
})

defineExpose({
  refreshCaptcha,
  getCaptcha: () => captcha.value,
  getCaptchaKey: () => captchaKey.value
})
</script>

<style scoped>
.captcha {
  margin-bottom: 15px;
}

.captcha-container {
  position: relative;
  width: 100%;
  height: 40px;
}

.captcha-image {
  width: 100%;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.captcha-placeholder {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #999;
  font-size: 12px;
}

.captcha-placeholder:hover {
  background-color: #eee;
}

.placeholder-icon {
  margin-right: 5px;
}

.captcha-error {
  position: absolute;
  bottom: -18px;
  left: 0;
  width: 100%;
  color: #f44336;
  font-size: 12px;
  text-align: center;
}
</style>