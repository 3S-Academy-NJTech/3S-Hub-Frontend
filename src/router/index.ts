import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Home from '@/pages/Home.vue'
import CreatePost from '@/pages/CreatePost.vue'
import ArticleDetail from '@/pages/ArticleDetail.vue'
import UserProfile from '@/pages/UserProfile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/create-post',
    name: 'CreatePost',
    component: CreatePost,
    meta: { requiresAuth: true }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    props: true
  },
  {
    path: '/profile/:userId',
    name: 'UserProfileById',
    component: UserProfile,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 检查路由是否需要登录权限
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    
    // 如果未登录，跳转到主页
    if (!userStore.isLoggedIn) {
      next({ name: 'Home' })
      return
    }
  }
  
  next()
})

export default router
