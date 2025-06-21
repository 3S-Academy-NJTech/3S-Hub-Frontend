<template>
  <div class="register-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>注册 3S-Hub</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 错误信息显示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="form-group">
          <label for="userName">用户名</label>
          <input
            id="userName"
            v-model="formData.userName"
            type="text"
            placeholder="请输入用户名"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="userPassword">密码</label>
          <input
            id="userPassword"
            v-model="formData.userPassword"
            type="password"
            placeholder="请输入密码"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="userShow">个性签名</label>
          <input
            id="userShow"
            v-model="formData.userShow"
            type="text"
            placeholder="请输入个性签名"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="userEmail">邮箱</label>
          <input
            id="userEmail"
            v-model="formData.userEmail"
            type="email"
            placeholder="请输入邮箱"
            required
            class="form-input"
          />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <div class="form-footer">
        <span>已有账号？</span>
        <button @click="$emit('switch-to-login')" class="link-btn">立即登录</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { userRegister, type RegisterRequest } from '@/api/user'

const emit = defineEmits(['close', 'switch-to-login', 'register-success'])

const loading = ref(false)
const errorMessage = ref('')

const formData = reactive({
  userName: '',
  userPassword: '',
  userShow: '',
  userEmail: ''
})

const handleRegister = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    // 验证表单数据
    console.log('原始表单数据:', formData)
    
    if (!formData.userName || !formData.userPassword || !formData.userShow || !formData.userEmail) {
      errorMessage.value = '请填写所有必填字段'
      loading.value = false
      return
    }
    
    const requestData: RegisterRequest = {
      userName: formData.userName.trim(),
      userPassword: formData.userPassword.trim(),
      userShow: formData.userShow.trim(),
      userEmail: formData.userEmail.trim()
    }
    
    console.log('发送注册请求:', requestData)
    
    const response = await userRegister(requestData)
    
    console.log('注册响应:', response)
    
    // 后端直接返回状态码：200成功，404失败
    if (response === 200) {
      // 注册成功
      emit('register-success', {
        ...formData,
        message: '注册成功！'
      })
      emit('close')
      
      // 清空表单
      Object.keys(formData).forEach(key => {
        formData[key as keyof typeof formData] = ''
      })
    } else if (response === 404) {
      // 注册失败
      errorMessage.value = '注册失败，用户名或邮箱可能已存在'
    } else {
      errorMessage.value = '注册失败，请重试'
    }
  } catch (error: any) {
    console.error('注册失败完整错误:', error)
    
    // 处理不同类型的错误
    if (error.response) {
      // 服务器响应了错误状态码
      const { status, data } = error.response
      console.log('错误状态码:', status)
      console.log('错误数据完整信息:', data)
      
      if (status === 400) {
        // 显示具体的错误信息
        errorMessage.value = '请求参数错误，请检查输入的信息'
      } else if (status === 409) {
        errorMessage.value = '用户名或邮箱已存在'
      } else if (status >= 500) {
        errorMessage.value = '服务器错误，请稍后重试'
      } else {
        errorMessage.value = '注册失败，请重试'
      }
    } else if (error.request) {
      // 网络错误
      console.log('网络请求错误:', error.request)
      errorMessage.value = '网络连接失败，请检查网络后重试'
    } else {
      // 其他错误
      console.log('其他错误:', error.message)
      errorMessage.value = '注册失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-modal {
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
  width: 450px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
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

.register-form {
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
  background: white;
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