import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const isLoggedIn = ref(false)

  // Getters
  const userName = computed(() => currentUser.value?.userName || '')
  const userEmail = computed(() => currentUser.value?.userEmail || '')
  const userShow = computed(() => currentUser.value?.userShow || '')
  const userTime = computed(() => currentUser.value?.userTime || '')
  const userId = computed(() => currentUser.value?.userId || 0)

  // Actions
  const login = (user: User) => {
    currentUser.value = user
    isLoggedIn.value = true
    console.log('用户登录成功:', user)
  }

  const logout = () => {
    currentUser.value = null
    isLoggedIn.value = false
    console.log('用户已登出')
  }

  const updateUser = (updatedUser: Partial<User>) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updatedUser }
      console.log('用户信息已更新:', currentUser.value)
    }
  }

  return {
    currentUser,
    isLoggedIn,
    userName,
    userEmail,
    userShow,
    userTime,
    userId,
    login,
    logout,
    updateUser
  }
}, {
  persist: true
})