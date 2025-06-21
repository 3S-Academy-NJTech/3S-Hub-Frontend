<template>
  <div class="main-layout">
    <Header />
    <div class="layout-container">
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: #f8f8f8;
}

.layout-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 70px 20px 40px;
  min-height: calc(100vh - 70px);
}

.main-content {
  width: 100%;
  min-width: 0;
  /* 确保内容可以正常滚动 */
  position: relative;
}

@media (max-width: 768px) {
  .layout-container {
    padding: 70px 16px 40px;
  }
}
</style>
