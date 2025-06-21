<template>
  <MainLayout>
    <div class="home-container">
      <!-- 左侧内容区域 -->
      <div class="main-content">
        <FeedList 
          :posts="posts" 
          :loading="loading"
          :no-more="noMore"
          @load-more="loadMorePosts"
        />
      </div>
      
      <!-- 右侧固定区域 -->
      <div class="sidebar">
        <UserHub 
          @show-login="showLogin"
          @show-register="showRegister"
          @logout="handleLogout"
        />
      </div>
    </div>
    
    <!-- 登录弹窗 -->
    <Login 
      v-if="loginModalVisible"
      @close="closeModals"
      @switch-to-register="switchToRegister"
      @login-success="handleLoginSuccess"
    />
    
    <!-- 注册弹窗 -->
    <Register 
      v-if="registerModalVisible"
      @close="closeModals"
      @switch-to-login="switchToLogin"
      @register-success="handleRegisterSuccess"
    />
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
const currentPage = ref(1)
const pageSize = 10

// 模拟数据生成器
const generateMockPosts = (page: number, size: number): FeedPost[] => {
  const mockTitles = [
    'VSCode Agent + Sonnet 4 从零开始做了个小游戏',
    '很奇怪，为什么使用 Rust 开发的软件，作者喜欢把 Rust 作为宣传点之一',
    'Windows 远程连接害死在公网被攻击崩溃',
    'oschina 已经沦为广告社区，付费推广社区，自媒体营销社区，是否有同感？',
    '境外服务器被攻击，可以买个二狗电点做代理嘛',
    '每题赚多少 5 美元',
    '刚果产品 PRO 是 prompt，LLM 输出技术方案，Figma MCP+Cursor 编写代码',
    '十条规则让你的 AI 工作效率提升 10 倍',
    '分享一个开源的前端组件库',
    '讨论一下最新的技术趋势'
  ]
  
  const mockLabels = ['技术', '分享', '讨论', '问答', '新闻', '工具', '开源', '教程']
  const mockUsernames = ['Livid', 'yulon', 'worker201', 'ruchee', 'Domado', 'pacino', 'awenxjtu', 'nealHuang']
  const mockColors = ['4a90e2', '50C878', 'FF6347', '9370DB', '20B2AA', 'FF4500', '32CD32', 'FF1493']
  
  const startIndex = (page - 1) * size
  const posts: FeedPost[] = []
  
  for (let i = 0; i < size; i++) {
    const index = startIndex + i
    const titleIndex = index % mockTitles.length
    const userIndex = index % mockUsernames.length
    const colorIndex = index % mockColors.length
    const labelIndex = index % mockLabels.length
    
    posts.push({
      id: index + 1,
      title: mockTitles[titleIndex],
      username: mockUsernames[userIndex],
      userAvatar: `https://via.placeholder.com/48x48/${mockColors[colorIndex]}/ffffff?text=${mockUsernames[userIndex][0]}`,
      publishTime: `${Math.floor(Math.random() * 60) + 1} 分钟前`,
      label: mockLabels[labelIndex],
      likeCount: Math.floor(Math.random() * 200)
    })
  }
  
  return posts
}

// 模拟API调用
const fetchPosts = async (page: number, size: number): Promise<{ posts: FeedPost[], hasMore: boolean }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const newPosts = generateMockPosts(page, size)
  const hasMore = page < 5 // 模拟只有5页数据
  
  return { posts: newPosts, hasMore }
}

// 加载更多帖子
const loadMorePosts = async () => {
  if (loading.value || noMore.value) return
  
  loading.value = true
  
  try {
    const { posts: newPosts, hasMore } = await fetchPosts(currentPage.value, pageSize)
    posts.value.push(...newPosts)
    currentPage.value++
    noMore.value = !hasMore
  } catch (error) {
    console.error('加载帖子失败:', error)
  } finally {
    loading.value = false
  }
}

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
  userStore.initializeFromStorage()
  loadMorePosts()
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
  min-width: 0; /* 防止flex项目超出容器 */
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
    order: 1; /* 将侧边栏放在主内容上方 */
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