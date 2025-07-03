<template>
  <div class="article-card">
    <div class="article-header">
      <h3 class="article-title">{{ article.artTitle }}</h3>
      <span class="article-date">{{ formatDate(article.artCreTime) }}</span>
    </div>
    
    <div class="article-content" v-html="truncateContent(article.artContent)"></div>
    
    <div class="article-footer">
      <div class="article-stats">
        <span class="like-count">
          ❤️ {{ article.artLikeNum || 0 }}
        </span>
      </div>
      
      <div class="article-actions">
        <button @click="viewArticle" class="btn-view">
          查看详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Article } from '@/api/article'

interface Props {
  article: Article
}

const props = defineProps<Props>()
const emit = defineEmits(['view'])

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 截取内容
const truncateContent = (content: string) => {
  const maxLength = 30
  if (content.length <= maxLength) {
    return content
  }
  return content.substring(0, maxLength) + '...'
}

// 查看文章
const viewArticle = () => {
  emit('view', props.article.artId)
}
</script>

<style scoped>
.article-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.article-date {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 16px;
}

.article-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 14px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-stats {
  display: flex;
  gap: 16px;
}

.like-count {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-actions {
  display: flex;
  gap: 8px;
}

.btn-view {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: #f0f0f0;
  color: #333;
}

.btn-view:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .article-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .article-date {
    margin-left: 0;
  }
  
  .article-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .article-actions {
    justify-content: flex-end;
  }
}
</style>
