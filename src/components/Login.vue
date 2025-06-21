<template>
  <div class="login-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>登录 3S-Hub</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 错误信息显示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            required
            class="form-input"
          />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="form-footer">
        <span>还没有账号？</span>
        <button @click="$emit('switch-to-register')" class="link-btn">立即注册</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { userLogin, type LoginRequest, type User } from '@/api/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const emit = defineEmits(['close', 'switch-to-register', 'login-success'])

const loading = ref(false)
const errorMessage = ref('')

const formData = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    // 验证表单数据
    if (!formData.email || !formData.password) {
      errorMessage.value = '请填写邮箱和密码'
      loading.value = false
      return
    }
    
    const requestData: LoginRequest = {
      email: formData.email.trim(),
      password: formData.password.trim()
    }
    
    console.log('发送登录请求:', requestData)
    
    const user: User = await userLogin(requestData)
    
    console.log('登录响应:', user)
    
    // 检查是否返回了用户信息（登录成功）
    if (user && user.userId) {
      // 使用Pinia store管理登录状态
      userStore.login(user)
      
      // 触发登录成功事件
      emit('login-success', {
        user: user,
        message: '登录成功！'
      })
      emit('close')
      
      // 清空表单
      formData.email = ''
      formData.password = ''
    } else {
      // 登录失败 - 后端返回null或无效用户信息
      errorMessage.value = '邮箱或密码错误'
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    
    // 处理不同类型的错误
    if (error.response) {
      const { status, data } = error.response
      console.log('错误状态码:', status)
      console.log('错误数据:', data)
      
      if (status === 401) {
        errorMessage.value = '邮箱或密码错误'
      } else if (status === 400) {
        errorMessage.value = '请求参数错误，请检查输入的信息'
      } else if (status >= 500) {
        errorMessage.value = '服务器错误，请稍后重试'
      } else {
        errorMessage.value = '登录失败，请重试'
      }
    } else if (error.request) {
      console.log('网络请求错误:', error.request)
      errorMessage.value = '网络连接失败，请检查网络后重试'
    } else {
      console.log('其他错误:', error.message)
      errorMessage.value = '登录失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.login-form {
  padding: 0 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.submit-btn {
  width: 100%;
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #7c3aed;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-footer {
  padding: 20px 24px 24px 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.link-btn {
  background: none;
  border: none;
  color: #8b5cf6;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 4px;
}

.link-btn:hover {
  color: #7c3aed;
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fecaca;
}
</style>
