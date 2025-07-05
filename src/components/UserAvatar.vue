<template>
  <div 
    class="user-avatar" 
    :class="[sizeClass, { 'clickable': clickable }]"
    :style="{ backgroundColor: avatarColor }"
    @click="handleClick"
  >
    <div class="avatar-text">{{ displayText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  username: string
  size?: 'small' | 'medium' | 'large'
  userId?: number
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  clickable: false
})

const router = useRouter()

const avatarColor = computed(() => {
  if (!props.username) return '#8b5cf6'
  
  const colors = [
    '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', 
    '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4',
    '#84cc16', '#ec4899', '#6366f1', '#14b8a6'
  ]
  
  let hash = 0
  for (let i = 0; i < props.username.length; i++) {
    hash = props.username.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
})

const displayText = computed(() => {
  return props.username.charAt(0)?.toUpperCase() || '?'
})

const sizeClass = computed(() => {
  return `avatar-${props.size}`
})

const handleClick = () => {
  if (props.clickable && props.userId) {
    router.push(`/profile/${props.userId}`)
  }
}
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar-text {
  color: white;
  font-weight: bold;
}

.avatar-small {
  width: 32px;
  height: 32px;
}

.avatar-small .avatar-text {
  font-size: 14px;
}

.avatar-medium {
  width: 40px;
  height: 40px;
}

.avatar-medium .avatar-text {
  font-size: 18px;
}

.avatar-large {
  width: 45px;
  height: 45px;
  border-radius: 6px;
}

.avatar-large .avatar-text {
  font-size: 22px;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.clickable:active {
  transform: scale(0.98);
}
</style>
