<template>
  <div class="feed-list" ref="feedListRef">
    <!-- 帖子列表 -->
    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <div class="post-content">
          <div class="post-title">
            <a href="#" class="title-link" @click.prevent="viewPost(post.id)">{{ post.title }}</a>
          </div>
          <div class="post-excerpt" v-if="post.content">
            {{ truncateContent(post.content) }}
          </div>
          <div class="post-meta">
            <span class="post-label" :class="`label-${getLabelClass(post.label)}`">{{ post.label }}</span>
            <span class="bullet">•</span>
            <a href="#" class="author-link" @click.prevent="viewAuthor(post.username)">{{ post.username }}</a>
            <span class="bullet">•</span>
            <span class="post-time">{{ post.publishTime }}</span>
          </div>
        </div>
        <div class="post-stats">
          <div class="like-count" @click="handleLike(post.id)">
            <span class="like-icon">❤️</span>
            <span class="count">{{ formatCount(post.likeCount) }}</span>
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
import { POST_CATEGORIES } from '@/constants/categories'

export interface FeedPost {
  id: number
  title: string
  username: string
  publishTime: string
  label: string
  likeCount: number
  content?: string
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

// 截取内容预览
const truncateContent = (content: string, maxLength: number = 120): string => {
  if (!content) return ''
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
}

// 获取标签样式类 - 使用constants中的映射
const getLabelClass = (label: string): string => {
  const labelMap: Record<string, string> = POST_CATEGORIES.reduce((map, category) => {
    const labelKey = category.label
    let styleClass = ''
    
    switch (labelKey) {
      case '技术':
        styleClass = 'tech'
        break
      case '问答':
        styleClass = 'qa'
        break
      case '校园生活':
        styleClass = 'campus'
        break
      default:
        styleClass = 'other'
    }
    
    map[labelKey] = styleClass
    return map
  }, {} as Record<string, string>)
  
  return labelMap[label] || 'other'
}

// 格式化数字显示
const formatCount = (count: number): string => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 查看文章详情
const viewPost = (postId: number) => {
  console.log('查看文章:', postId)
  // TODO: 实现文章详情跳转
}

// 查看作者信息
const viewAuthor = (username: string) => {
  console.log('查看作者:', username)
  // TODO: 实现作者主页跳转
}

// 点赞功能
const handleLike = (postId: number) => {
  console.log('点赞文章:', postId)
  // TODO: 实现点赞功能
}
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

.post-excerpt {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
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
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.label-tech {
  background: #e3f2fd;
  color: #1976d2;
}

.label-qa {
  background: #f3e5f5;
  color: #7b1fa2;
}

.label-campus {
  background: #e8f5e8;
  color: #388e3c;
}

.label-other {
  background: #f5f5f5;
  color: #757575;
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
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f8f8f8;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.like-count:hover {
  background: #ffe6e6;
  transform: scale(1.05);
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
  
  .title-link {
    font-size: 15px;
  }
  
  .post-meta {
    font-size: 11px;
  }
}
</style>


