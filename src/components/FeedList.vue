<template>
  <div class="feed-list" ref="feedListRef">
    <!-- 帖子列表 -->
    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <div class="post-avatar">
          <img :src="post.userAvatar" :alt="post.username" />
        </div>
        <div class="post-content">
          <div class="post-title">
            <a href="#" class="title-link">{{ post.title }}</a>
          </div>
          <div class="post-meta">
            <span class="post-label">{{ post.label }}</span>
            <span class="bullet">•</span>
            <a href="#" class="author-link">{{ post.username }}</a>
            <span class="bullet">•</span>
            <span class="post-time">{{ post.publishTime }}</span>
          </div>
        </div>
        <div class="post-stats">
          <div class="like-count">
            <span class="like-icon">❤️</span>
            <span class="count">{{ post.likeCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <!-- 没有更多数据 -->
    <div v-if="noMore && posts.length > 0" class="no-more-indicator">
      没有更多内容了
    </div>
    
    <!-- 空状态 -->
    <div v-if="posts.length === 0 && !loading" class="empty-state">
      暂无内容
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface FeedPost {
  id: number
  title: string
  username: string
  userAvatar: string
  publishTime: string
  label: string
  likeCount: number
}

interface Props {
  posts: FeedPost[]
  loading?: boolean
  noMore?: boolean
}

interface Emits {
  (e: 'loadMore'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  noMore: false
})

const emit = defineEmits<Emits>()

const feedListRef = ref<HTMLElement>()

const handleScroll = () => {
  if (!feedListRef.value || props.loading || props.noMore) return
  
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  const threshold = 100 // 距离底部100px时触发加载
  
  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    emit('loadMore')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.feed-list {
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
}

/* 帖子列表 */
.posts-list {
  background: white;
}

.post-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.post-item:hover {
  background: #f9f9f9;
}

.post-item:last-child {
  border-bottom: none;
}

.post-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-title {
  margin-bottom: 8px;
}

.title-link {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  display: block;
}

.title-link:hover {
  color: #4a90e2;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  flex-wrap: wrap;
}

.post-label {
  background: #f0f0f0;
  color: #666;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.bullet {
  margin: 0 2px;
}

.author-link {
  color: #666;
  text-decoration: none;
}

.author-link:hover {
  color: #4a90e2;
}

.post-stats {
  display: flex;
  align-items: center;
  padding-top: 4px;
}

.like-count {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f8f8f8;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.like-icon {
  font-size: 12px;
}

.count {
  color: #666;
  font-weight: 600;
}

/* 加载状态 */
.loading-indicator, .no-more-indicator, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.loading-indicator {
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .post-item {
    gap: 8px;
    padding: 12px;
  }
  
  .post-avatar img {
    width: 40px;
    height: 40px;
  }
  
  .title-link {
    font-size: 15px;
  }
  
  .post-meta {
    font-size: 11px;
  }
}
</style>


