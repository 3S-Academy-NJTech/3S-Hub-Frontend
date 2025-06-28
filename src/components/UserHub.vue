<template>
  <div class="user-hub">
    <!-- Login State -->
    <div v-if="!userStore.isLoggedIn" class="login-container">
      <div class="login-card">
        <h2 class="title">3S-Hub</h2>
        <p class="subtitle">南工测绘地信遥感交流</p>
        
        <button @click="handleRegister" class="login-btn">
          现在注册
        </button>
        
        <div class="login-footer">
          <span class="login-text">已注册用户请</span>
          <a href="#" @click.prevent="handleLogin" class="login-link">登录</a>
        </div>
      </div>
    </div>

    <!-- Profile State -->
    <div v-else class="profile-container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            <img v-if="userStore.userAvatar !== 'default.jpg'" 
                 :src="userStore.userAvatar" 
                 :alt="userStore.userName" 
                 class="avatar-img" />
            <div v-else class="avatar-icon">{{ userStore.userName.charAt(0)?.toUpperCase() || '+' }}</div>
          </div>
          <div class="user-info">
            <span class="username">{{ userStore.userName || 'Unknown' }}</span>
            <span class="user-show">{{ userStore.userShow || '这个人很懒，什么都没有留下' }}</span>
          </div>
        </div>
        
        <div class="user-details">
          <div class="detail-item">
            <span class="detail-label">邮箱</span>
            <span class="detail-value">{{ userStore.userEmail }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">注册时间</span>
            <span class="detail-value">{{ formatDateTime(userStore.userTime) }}</span>
          </div>
        </div>

        <div class="actions">
          <button @click="handleHome" class="action-btn home-btn">主页</button>
          <button @click="handleCreatePost" class="action-btn create-post-btn">发帖</button>
          <button @click="handleLogout" class="action-btn logout-btn">登出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const emit = defineEmits(['show-login', 'show-register', 'logout', 'home', 'create-post'])

const handleLogin = () => {
  emit('show-login')
}

const handleRegister = () => {
  emit('show-register')
}

const handleLogout = () => {
  emit('logout')
}

const handleHome = () => {
  emit('home')
}

const handleCreatePost = () => {
  // 在新标签页中打开发帖页面
  window.open('/create-post', '_blank')
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.user-hub {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 350px;
  margin: 0 auto;
}

/* Login State Styles */
.login-container {
  background: #f8f9fa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: white;
  padding: 40px 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 30px 0;
}

.login-btn {
  background: #e8e8e8;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background: #ddd;
}

.login-footer {
  font-size: 13px;
  color: #666;
}

.login-link {
  color: #666;
  text-decoration: none;
  margin-left: 4px;
}

.login-link:hover {
  text-decoration: underline;
}

/* Profile State Styles */
.profile-container {
  background: #f8f9fa;
  min-height: 400px;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 20px 20px 15px 20px;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 45px;
  height: 45px;
  background: #8b5cf6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.avatar-icon {
  color: white;
  font-size: 22px;
  font-weight: bold;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.username {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.user-show {
  font-size: 13px;
  color: #666;
  line-height: 1.3;
}

.user-details {
  padding: 20px;
  background: white;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #333;
  font-weight: 400;
}

.actions {
  padding: 15px 20px 20px 20px;
  background: #fafafa;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  border: 1px solid #ddd;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.home-btn {
  background: #f8f9fa;
  color: #666;
}

.home-btn:hover {
  background: #e9ecef;
  color: #333;
  border-color: #ccc;
}

.logout-btn {
  background: #f5f5f5;
  color: #666;
}

.logout-btn:hover {
  background: #e8e8e8;
  color: #333;
  border-color: #ccc;
}

.create-post-btn {
  background: #f8f9fa;
  color: #666;
}

.create-post-btn:hover {
  background: #e9ecef;
  color: #333;
  border-color: #ccc;
}

/* Transition Effects */
.login-container,
.profile-container {
  transition: all 0.3s ease;
}
</style>