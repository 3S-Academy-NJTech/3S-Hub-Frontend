<template>
  <MainLayout>
    <div class="home-container">
      <!-- 左侧内容区域 -->
      <div class="main-content">
        <FeedList :posts="posts" :loading="loading" :no-more="noMore" @load-more="loadMorePosts" />
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
import { getNewArticles, type ViewArtAndUser } from '@/api/article'
import { POST_CATEGORIES } from '@/constants/categories'

// Use Pinia store
const userStore = useUserStore()

const posts = ref<FeedPost[]>([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(0)
const pageSize = 20

// 文章类型映射 - 从常量文件获取
const articleTypeMap: Record<number, string> = POST_CATEGORIES.reduce((map, category) => {
  map[parseInt(category.value)] = category.label
  return map
}, {} as Record<number, string>)

// Modal state
const loginModalVisible = ref(false)
const registerModalVisible = ref(false)

// 转换后端数据为前端显示格式
const transformArticleData = (items: ViewArtAndUser[]): FeedPost[] => {
  return items.map(item => ({
    id: item.article.artId,
    title: item.article.artTitle,
    username: item.user.userName,
    userId: item.user.userId,  // 添加userId字段
    publishTime: item.article.artCreTime,
    label: articleTypeMap[item.article.artTypeId] || '其他',
    likeCount: item.article.artLikeNum || 0,
    content: item.article.artContent
  }))
}

// 加载文章数据
const loadArticles = async (page: number = 0, append: boolean = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await getNewArticles({ page, size: pageSize })
    const newPosts = transformArticleData(response.content)
    
    if (append) {
      posts.value.push(...newPosts)
    } else {
      posts.value = newPosts
    }
    
    // 更新分页状态
    noMore.value = response.last
    currentPage.value = page
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载更多文章
const loadMorePosts = () => {
  if (!noMore.value && !loading.value) {
    loadArticles(currentPage.value + 1, true)
  }
}

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
  closeModals()
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
  loadArticles()
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