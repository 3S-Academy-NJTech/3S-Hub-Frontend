<script setup lang="ts">
import Home from './pages/Home.vue'
</script>

<template>
  <Home />
</template>

<style>
/* 全局样式重置和基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f8f8;
  line-height: 1.5;
  color: #333;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 链接样式 */
a {
  color: #4a90e2;
  text-decoration: none;
}

a:hover {
  color: #2c5aa0;
}

/* 按钮基础样式 */
button {
  font-family: inherit;
  cursor: pointer;
}

/* 输入框基础样式 */
input {
  font-family: inherit;
}
</style>
