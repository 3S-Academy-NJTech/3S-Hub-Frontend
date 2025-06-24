<template>
  <MainLayout>
    <div class="home-container">
      <!-- 左侧内容区域 -->
      <div class="main-content">
        <FeedList :posts="posts" :loading="loading" :no-more="noMore" />
      </div>

      <!-- 右侧固定区域 -->
      <div class="sidebar">
        <UserHub @show-login="showLogin" @show-register="showRegister" @logout="handleLogout" />
      </div>
    </div>

    <!-- 登录弹窗 -->
    <Login v-if="loginModalVisible" @close="closeModals" @switch-to-register="switchToRegister"
      @login-success="handleLoginSuccess" />

    <!-- 注册弹窗 -->
    <Register v-if="registerModalVisible" @close="closeModals" @switch-to-login="switchToLogin"
      @register-success="handleRegisterSuccess" />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import FeedList, { type FeedPost } from '@/components/FeedList.vue'
import UserHub from '@/components/UserHub.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import { useUserStore } from '@/stores/user'

// Use Pinia store
const userStore = useUserStore()

const posts = ref<FeedPost[]>([])
const loading = ref(false)
const noMore = ref(false)

// Modal state
const loginModalVisible = ref(false)
const registerModalVisible = ref(false)

// Modal methods
const showLogin = () => {
  loginModalVisible.value = true
  registerModalVisible.value = false
}

const showRegister = () => {
  registerModalVisible.value = true
  loginModalVisible.value = false
}

const switchToLogin = () => {
  loginModalVisible.value = true
  registerModalVisible.value = false
}

const switchToRegister = () => {
  registerModalVisible.value = true
  loginModalVisible.value = false
}

const closeModals = () => {
  loginModalVisible.value = false
  registerModalVisible.value = false
}

const handleLoginSuccess = (data: any) => {
  console.log('登录成功:', data)
  userStore.login(data.user)
}

const handleRegisterSuccess = (userData: any) => {
  console.log('注册成功:', userData)
  switchToLogin()
}

const handleLogout = () => {
  userStore.logout()
}

// 初始加载
onMounted(() => {
})
</script>

<style scoped>
/* 主容器样式 */
.home-container {
  display: flex;
  gap: 15px;
  max-width: 1200px;
  margin: 0;
  padding: 20px;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  max-width: none;
  min-width: 0;
  /* 防止flex项目超出容器 */
}

/* 侧边栏 */
.sidebar {
  width: 300px;
  position: sticky;
  top: 20px;
  align-self: flex-start;
  margin-left: auto;
  margin-right: 0;
  flex-shrink: 0;
}

/* 响应式设计 */
/* 大屏平板 (1024px 及以下) */
@media (max-width: 1024px) {
  .home-container {
    max-width: 100%;
    padding: 15px;
  }

  .sidebar {
    width: 250px;
  }
}

/* 平板和大屏手机 (768px 及以下) */
@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
    padding: 15px 10px;
    gap: 20px;
    max-width: 100%;
  }

  .sidebar {
    width: 100%;
    position: static;
    margin: 0;
    order: 1;
    /* 将侧边栏放在主内容上方 */
  }

  .main-content {
    max-width: 100%;
    order: 2;
  }
}

/* 小屏手机 (480px 及以下) */
@media (max-width: 480px) {
  .home-container {
    padding: 10px 8px;
    gap: 15px;
  }
}

/* 超小屏设备 (360px 及以下) */
@media (max-width: 360px) {
  .home-container {
    padding: 8px 5px;
    gap: 12px;
  }
}
</style>