<template>
  <!-- 顶部导航栏 -->
  <header class="header">
    <div class="header-content">
      <!-- 网站LOGO -->
      <div class="logo">
        <img src="/title.jpg" alt="3S-Hub" class="logo-image" @click="goToHome" />
      </div>
      
      <!-- 头部操作区域 -->
      <div class="header-actions">
        <!-- 搜索框 -->
        <div class="search-box">
          <input 
            type="text" 
            placeholder="搜索..." 
            class="search-input"
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">🔍</button>
        </div>
        
        <!-- 用户操作链接 -->
        <div class="user-actions">
          <button class="action-link" @click="goToHome">首页</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    console.log('搜索:', searchKeyword.value)
    // TODO: 实现搜索功能
  }
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* 头部导航栏样式 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-bottom: 1px solid #e2e2e2;
  padding: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

/* 头部内容容器 */
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* LOGO区域 */
.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 32px;
  width: auto;
  object-fit: contain;
  cursor: pointer;
}

/* 头部操作区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 搜索框样式 */
.search-box {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 6px;
  padding: 2px;
  border: 1px solid #e2e2e2;
  transition: border-color 0.2s ease;
}

.search-box:focus-within {
  border-color: #4a90e2;
}

.search-input {
  border: none;
  background: transparent;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  width: 200px;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.search-btn {
  background: transparent;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.search-btn:hover {
  background: #e8e8e8;
}

/* 用户操作链接 */
.user-actions {
  display: flex;
  gap: 12px;
}

.action-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.action-link:hover {
  background: #f0f0f0;
  color: #333;
}

/* 响应式设计 */
/* 大屏幕设备 (1200px+) */
@media (min-width: 1200px) {
  .header-content {
    max-width: 1400px;
    padding: 14px 24px;
  }
  
  .search-input {
    width: 280px;
  }
  
  .logo-image {
    height: 36px;
  }
}

/* 桌面设备 (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .header-content {
    padding: 12px 20px;
  }
  
  .search-input {
    width: 220px;
  }
}

/* 平板设备 (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .header-content {
    padding: 12px 18px;
    gap: 16px;
  }
  
  .search-input {
    width: 180px;
  }
  
  .user-actions {
    gap: 10px;
  }
  
  .action-link {
    padding: 6px 10px;
    font-size: 13px;
  }
}

/* 小屏幕平板 (576px - 767px) */
@media (min-width: 576px) and (max-width: 767px) {
  .header-content {
    padding: 10px 16px;
    gap: 12px;
  }
  
  .logo-image {
    height: 28px;
  }
  
  .search-input {
    width: 140px;
    font-size: 13px;
  }
  
  .search-btn {
    padding: 6px 10px;
  }
  
  .user-actions {
    gap: 8px;
  }
  
  .action-link {
    padding: 5px 8px;
    font-size: 12px;
  }
}

/* 手机设备 (最大575px) */
@media (max-width: 575px) {
  .header-content {
    padding: 8px 12px;
    gap: 8px;
    flex-wrap: nowrap;
  }
  
  .logo-image {
    height: 24px;
  }
  
  .header-actions {
    gap: 8px;
    flex-shrink: 0;
  }
  
  .search-box {
    padding: 1px;
  }
  
  .search-input {
    width: 100px;
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .search-btn {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .user-actions {
    gap: 6px;
  }
  
  .action-link {
    padding: 4px 6px;
    font-size: 11px;
  }
}

/* 超小屏幕 (最大320px) */
@media (max-width: 320px) {
  .header-content {
    padding: 6px 8px;
    gap: 6px;
  }
  
  .logo-image {
    height: 20px;
  }
  
  .search-input {
    width: 80px;
    padding: 4px 6px;
  }
  
  .search-btn {
    padding: 4px 6px;
  }
  
  .action-link {
    padding: 3px 4px;
    font-size: 10px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .search-btn,
  .action-link {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logo-image {
    cursor: default;
  }
}

/* 横屏手机优化 */
@media (max-width: 767px) and (orientation: landscape) {
  .header-content {
    padding: 6px 12px;
  }
  
  .logo-image {
    height: 20px;
  }
  
  .search-input {
    width: 120px;
  }
}
</style>