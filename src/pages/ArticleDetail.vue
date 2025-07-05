<template>
  <div class="article-detail">
    <!-- 成功提示 -->
    <div v-if="showSuccessMessage" class="success-message">
      <span class="success-icon">✅</span>
      <span>{{ successMessage }}</span>
    </div>

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
            <UserAvatar 
              :username="articleData.user.userName" 
              :userId="articleData.user.userId"
              size="medium"
              :clickable="true"
            />
            <div class="author-details">
              <span class="author-name">{{ articleData.user.userName }}</span>
              <span class="publish-time">{{ formatTime(articleData.article.artCreTime) }}</span>
            </div>
          </div>
          <div class="article-stats">
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

      <!-- 评论区域 -->
      <div class="comments-section">
        <div class="comments-header">
          <h3 class="comments-title">评论 ({{ comments.length }})</h3>
        </div>

        <!-- 评论输入框 -->
        <div class="comment-input-section">
          <div class="comment-input-header">
            <UserAvatar :username="userStore.userName || 'Guest'" size="small" />
            <span class="input-username">{{ userStore.userName || '游客' }}</span>
          </div>
          <div class="comment-input-box">
            <textarea 
              v-model="commentContent"
              class="comment-textarea"
              placeholder="写下你的评论..."
              rows="3"
              :disabled="!userStore.isLoggedIn || isSubmittingComment"
            ></textarea>
            <div class="comment-input-actions">
              <button 
                class="btn-submit" 
                @click="submitComment"
                :disabled="!userStore.isLoggedIn || !commentContent.trim() || isSubmittingComment"
              >
                {{ isSubmittingComment ? '发布中...' : '发表评论' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
            <div class="comment-avatar">
              <UserAvatar :username="comment.userName" size="small" />
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.userName }}</span>
                <span class="comment-time">{{ formatTime(comment.commentTime) }}</span>
              </div>
              <div class="comment-text">{{ comment.commentContent }}</div>
            </div>
          </div>
        </div>

        <!-- 无评论状态 -->
        <div v-else class="no-comments">
          <p>暂无评论，快来发表第一条评论吧！</p>
        </div>
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
import { commentApi, type CreateCommentRequest, type SimpleCommentDTO, getCommentsByArticleId } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import UserAvatar from '@/components/UserAvatar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const articleData = ref<ViewArtAndUser | null>(null)
const loading = ref(true)
const isLiking = ref(false)
const likeCount = ref(0)
const isLiked = ref(false)
const comments = ref<SimpleCommentDTO[]>([])

// 评论相关状态
const commentContent = ref('')
const isSubmittingComment = ref(false)

// 成功提示相关状态
const showSuccessMessage = ref(false)
const successMessage = ref('')

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
      
      // 加载评论列表
      await loadComments()
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载评论列表
const loadComments = async () => {
  if (!articleId.value) return
  
  try {
    const commentsList = await getCommentsByArticleId(articleId.value)
    comments.value = commentsList
  } catch (error) {
    console.error('加载评论失败:', error)
    comments.value = []
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

// 发布评论
const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    console.log('请先登录')
    return
  }

  if (!commentContent.value.trim()) {
    console.log('评论内容不能为空')
    return
  }

  if (isSubmittingComment.value) return

  isSubmittingComment.value = true

  try {
    const request: CreateCommentRequest = {
      articleId: articleId.value,
      userId: userStore.userId,
      content: commentContent.value.trim()
    }

    await commentApi.createComment(request)
    
    // 清空输入框
    commentContent.value = ''
    
    // 重新加载评论列表
    await loadComments()
    
    // 显示成功提示
    showSuccessMessage.value = true
    successMessage.value = '评论发布成功！'
    
    // 3秒后隐藏提示
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('发布评论失败:', error)
  } finally {
    isSubmittingComment.value = false
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

/* 成功提示样式 */
.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.success-icon {
  font-size: 16px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
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

/* 评论区域样式 */
.comments-section {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #f0f0f0;
}

.comments-header {
  margin-bottom: 24px;
}

.comments-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 评论输入框 */
.comment-input-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.comment-input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.input-username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.comment-input-box {
  margin-left: 40px;
}

.comment-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  background: white;
  box-sizing: border-box;
}

.comment-textarea:focus {
  outline: none;
  border-color: #4a90e2;
}

.comment-textarea::placeholder {
  color: #999;
}

.comment-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn-submit {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit {
  background: #4a90e2;
  border: 1px solid #4a90e2;
  color: white;
}

.btn-submit:hover {
  background: #357abd;
}

.btn-submit:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
}

/* 回复样式 */
.replies {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.reply-avatar {
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.reply-author {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.reply-time {
  font-size: 11px;
  color: #999;
}

.reply-text {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 8px;
}

.reply-to {
  color: #4a90e2;
  font-weight: 500;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 无评论状态 */
.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.no-comments p {
  margin: 0;
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
  
  .comment-input-box {
    margin-left: 0;
  }
  
  .comment-input-header {
    margin-bottom: 8px;
  }
  
  .replies {
    padding-left: 12px;
  }
}
</style>

