<template>
  <div class="article-detail">
    <!-- 返回按钮 -->
    <div class="back-button">
      <button @click="goBack" class="btn-back">
        ← 返回
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="articleData" class="article-container">
      <!-- 文章头部信息 -->
      <div class="article-header">
        <h1 class="article-title">{{ articleData.article.artTitle }}</h1>
        <div class="article-meta">
          <div class="author-info">
            <img 
              :src="articleData.user.userImg || '/logo.svg'" 
              :alt="articleData.user.userName"
              class="author-avatar"
            >
            <div class="author-details">
              <span class="author-name">{{ articleData.user.userName }}</span>
              <span class="publish-time">{{ formatTime(articleData.article.artCreTime) }}</span>
            </div>
          </div>
          <div class="article-stats">
            <span class="stat-item">
              <span class="stat-icon">👁️</span>
              <span class="stat-count">{{ formatCount(articleData.article.artView || 0) }}</span>
            </span>
            <span 
              class="stat-item like-stat" 
              :class="{ 'liked': isLiked, 'liking': isLiking }"
              @click="handleLike"
            >
              <span class="stat-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
              <span class="stat-count">{{ formatCount(likeCount) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <div class="content-text" v-html="formatContent(articleData.article.artContent)"></div>
      </div>

      <!-- 文章底部操作 -->
      <div class="article-actions">
        <button 
          class="action-btn like-btn" 
          :class="{ 'liked': isLiked, 'liking': isLiking }"
          @click="handleLike"
          :disabled="isLiking"
        >
          <span class="btn-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
          <span>{{ isLiked ? '已点赞' : '点赞' }}</span>
          <span class="btn-count">({{ formatCount(likeCount) }})</span>
        </button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <div class="error-message">
        <h3>文章加载失败</h3>
        <p>可能是文章不存在或网络连接问题</p>
        <button @click="loadArticle" class="btn-retry">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi, type ViewArtAndUser } from '@/api/article'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const articleData = ref<ViewArtAndUser | null>(null)
const loading = ref(true)
const isLiking = ref(false)
const likeCount = ref(0)
const isLiked = ref(false)

const articleId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : 0
})

// 加载文章详情
const loadArticle = async () => {
  if (!articleId.value) {
    router.push('/')
    return
  }

  loading.value = true
  try {
    const data = await articleApi.getArticleDetail(articleId.value)
    if (data) {
      articleData.value = data
      likeCount.value = data.article.artLikeNum || 0
      
      // 如果用户已登录，检查点赞状态
      if (userStore.isLoggedIn) {
        await checkLikeStatus()
      }
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 检查点赞状态
const checkLikeStatus = async () => {
  if (!userStore.isLoggedIn || !articleId.value) return
  
  try {
    const [liked, count] = await Promise.all([
      articleApi.checkLikeStatus(userStore.userId, articleId.value),
      articleApi.getArticleLikeCount(articleId.value)
    ])
    
    isLiked.value = liked
    likeCount.value = count
  } catch (error) {
    console.error('检查点赞状态失败:', error)
  }
}

// 处理点赞
const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    // TODO: 显示登录提示或跳转登录
    console.log('请先登录')
    return
  }

  if (isLiking.value) return

  isLiking.value = true
  const originalLiked = isLiked.value
  const originalCount = likeCount.value

  // 乐观更新
  if (originalLiked) {
    isLiked.value = false
    likeCount.value -= 1
  } else {
    isLiked.value = true
    likeCount.value += 1
  }

  try {
    const result = await articleApi.toggleLikeArticle(userStore.userId, articleId.value)
    
    if (result.success) {
      isLiked.value = result.isLiked
      const latestCount = await articleApi.getArticleLikeCount(articleId.value)
      likeCount.value = latestCount
    } else {
      // 回滚
      isLiked.value = originalLiked
      likeCount.value = originalCount
    }
  } catch (error) {
    // 回滚
    isLiked.value = originalLiked
    likeCount.value = originalCount
    console.error('点赞操作失败:', error)
  } finally {
    isLiking.value = false
  }
}

// 格式化时间
const formatTime = (timeString: string): string => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 格式化文章内容
const formatContent = (content: string): string => {
  if (!content) return ''
  
  // 简单的换行处理
  return content.replace(/\n/g, '<br>')
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  min-height: 100vh;
}

/* 返回按钮 */
.back-button {
  margin-bottom: 20px;
}

.btn-back {
  background: #f5f5f5;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #e0e0e0;
  color: #333;
}

/* 加载状态 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: #666;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 文章容器 */
.article-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* 文章头部 */
.article-header {
  padding: 0 0 24px 0;
  border-bottom: 1px solid #f0f0f0;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin: 0 0 20px 0;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.stat-item.like-stat {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.stat-item.like-stat:hover {
  background: #ffe6e6;
}

.stat-item.like-stat.liked {
  background: #ffe6e6;
  color: #e91e63;
}

.stat-item.like-stat.liking {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 文章内容 */
.article-content {
  padding: 32px 0;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  word-wrap: break-word;
}

.content-text :deep(p) {
  margin: 0 0 16px 0;
}

.content-text :deep(p:last-child) {
  margin-bottom: 0;
}

/* 文章操作 */
.article-actions {
  padding: 24px 0 0 0;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.action-btn.like-btn.liked {
  background: #ffe6e6;
  border-color: #e91e63;
  color: #e91e63;
}

.action-btn.like-btn.liking {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-count {
  font-size: 12px;
  opacity: 0.8;
}

/* 错误状态 */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.error-message {
  text-align: center;
  color: #666;
}

.error-message h3 {
  color: #333;
  margin: 0 0 8px 0;
}

.error-message p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.btn-retry {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.btn-retry:hover {
  background: #357abd;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-detail {
    padding: 16px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .article-stats {
    align-self: flex-end;
  }
  
  .content-text {
    font-size: 15px;
  }
}
</style>
