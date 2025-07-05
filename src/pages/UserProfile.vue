<template>
  <MainLayout>
    <div class="user-profile-container">
      <!-- 用户信息卡片 -->
      <div class="user-info-card" v-if="displayUserInfo">
        <div class="user-header">
          <UserAvatar :username="displayUserInfo.userName || 'Unknown'" />
          <div class="user-details">
            <h1 class="username">{{ displayUserInfo.userName || 'Unknown' }}</h1>
            <p class="user-bio">{{ displayUserInfo.userShow || '这个人很懒，什么都没有留下' }}</p>
            <div class="user-meta">
              <span class="meta-item" v-if="isCurrentUser">
                <span class="meta-label">邮箱:</span>
                <span class="meta-value">{{ displayUserInfo.userEmail }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">注册时间:</span>
                <span class="meta-value">{{ displayUserInfo.userTime }}</span>
              </span>
            </div>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-number">{{ userArticles.length }}</span>
            <span class="stat-label">发布文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalLikes }}</span>
            <span class="stat-label">获得点赞</span>
          </div>
        </div>
      </div>

      <!-- 用户文章列表 -->
      <div class="user-posts-section">
        <div class="section-header">
          <h2 class="section-title">{{ isCurrentUser ? '我的文章' : `${displayUserInfo?.userName || '用户'}的文章` }}</h2>
          <button v-if="isCurrentUser" @click="goToCreatePost" class="btn-create-post">
            发布新文章
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 文章列表 -->
        <div v-else-if="userArticles.length > 0" class="articles-list">
          <ArticleCard 
            v-for="article in userArticles" 
            :key="article.artId"
            :article="article"
            @view="viewArticle"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📝</div>
          <h3 class="empty-title">{{ isCurrentUser ? '还没有发布文章' : '暂无发布文章' }}</h3>
          <p class="empty-description">
            {{ isCurrentUser ? '开始创作你的第一篇文章吧！' : '该用户还没有发布任何文章' }}
          </p>
          <button v-if="isCurrentUser" @click="goToCreatePost" class="btn-create-first">
            创建第一篇文章
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter} from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { useUserStore } from '@/stores/user'
import { getArticlesByUserId, type Article } from '@/api/article'
import { getUserById } from '@/api/user'

interface Props {
  userId?: string
}

const props = defineProps<Props>()
const userStore = useUserStore()
const router = useRouter()

// 响应式数据
const userArticles = ref<Article[]>([])
const loading = ref(false)
const publicUserInfo = ref<any>(null)

// 计算当前查看的是否为当前用户
const isCurrentUser = computed(() => {
  if (!props.userId) return true // 没有userId参数说明是当前用户
  return parseInt(props.userId) === userStore.userId
})

// 计算显示的用户信息
const displayUserInfo = computed(() => {
  if (isCurrentUser.value) {
    return userStore
  }
  return publicUserInfo.value || {
    userName: `用户${props.userId}`,
    userShow: '',
    userEmail: '',
    userTime: ''
  }
})

// 计算总点赞数
const totalLikes = computed(() => {
  return userArticles.value.reduce((total, article) => {
    return total + (article.artLikeNum || 0)
  }, 0)
})

// 加载用户信息
const loadUserInfo = async (targetUserId: number) => {
  if (isCurrentUser.value) {
    // 当前用户信息已在store中
    return
  }
  
  try {
    const userInfo = await getUserById(targetUserId)
    if (userInfo) {
      publicUserInfo.value = userInfo
    } else {
      // 如果API返回null，使用默认信息
      publicUserInfo.value = {
        userName: `用户${targetUserId}`,
        userShow: '这个人很懒，什么都没有留下',
        userEmail: '',
        userTime: '2023-01-01'
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    publicUserInfo.value = {
      userName: `用户${targetUserId}`,
      userShow: '这个人很懒，什么都没有留下',
      userEmail: '',
      userTime: '2023-01-01'
    }
  }
}

// 加载用户文章
const loadUserArticles = async (targetUserId?: number) => {
  const userId = targetUserId || userStore.userId
  
  if (!userId) {
    console.error('用户ID不存在')
    return
  }

  loading.value = true
  try {
    // 先加载用户信息
    await loadUserInfo(userId)
    
    // 再加载文章
    const articles = await getArticlesByUserId(userId)
    userArticles.value = articles
  } catch (error) {
    console.error('加载用户文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 查看文章
const viewArticle = (articleId: number) => {
  router.push(`/article/${articleId}`)
}

// 跳转到创建文章页面
const goToCreatePost = () => {
  router.push('/create-post')
}

// 监听路由参数变化
watch(
  () => props.userId,
  (newUserId) => {
    if (newUserId) {
      loadUserArticles(parseInt(newUserId))
    } else {
      loadUserArticles()
    }
  },
  { immediate: true }
)

// 组件挂载时加载数据
onMounted(() => {
  if (props.userId) {
    loadUserArticles(parseInt(props.userId))
  } else {
    loadUserArticles()
  }
})
</script>

<style scoped>
.user-profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: calc(100vh - 120px);
}

/* 用户信息卡片 */
.user-info-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 30px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.user-bio {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  font-size: 14px;
}

.meta-label {
  color: #666;
  font-weight: 500;
}

.meta-value {
  color: #333;
  margin-left: 8px;
}

.user-stats {
  display: flex;
  gap: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

/* 文章部分 */
.user-posts-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-create-post {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-create-post:hover {
  background: #357abd;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 文章列表 */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  color: #666;
  margin: 0 0 30px 0;
}

.btn-create-first {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-create-first:hover {
  background: #357abd;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile-container {
    padding: 16px;
  }
  
  .user-info-card,
  .user-posts-section {
    padding: 20px;
  }
  
  .user-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
  
  .username {
    font-size: 28px;
  }
  
  .user-stats {
    justify-content: center;
    gap: 30px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>