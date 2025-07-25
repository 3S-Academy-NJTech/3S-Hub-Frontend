import axios from 'axios'

// ==================== 接口定义 ====================

export interface CreateArticleRequest {
  userId: number
  title: string
  text: string
  select: number
}

// 文章接口定义
export interface Article {
  artId: number
  artUserId: number
  artTitle: string
  artTypeId: number
  artContent: string
  artCreTime: string
  artLikeNum: number | null
}

// 用户接口定义
export interface User {
  userId: number
  userName: string
  userEmail: string
  userTime: string
  userShow: string
}

// 文章和用户组合数据接口
export interface ViewArtAndUser {
  article: Article
  user: User
}

// 分页数据接口
export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      unsorted: boolean
      sorted: boolean
    }
    offset: number
    unpaged: boolean
    paged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  first: boolean
  size: number
  number: number
  sort: {
    empty: boolean
    unsorted: boolean
    sorted: boolean
  }
  numberOfElements: number
  empty: boolean
}

// 获取最新文章请求参数接口
export interface GetNewArticlesParams {
  page?: number
  size?: number
}

// 根据用户ID获取文章请求参数接口
export interface GetArticlesByUserIdParams {
  userId: number
}

// ==================== API方法 ====================

export const createNewPost = async (data: CreateArticleRequest) => {
  try {
    const response = await axios.post('/api/articles/new-post', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('API调用失败:', error)
    throw error
  }
}

// 获取最新文章的API方法
export const getNewArticles = async (params: GetNewArticlesParams = {}) => {
  const { page = 0, size = 20 } = params
  
  try {
    const response = await axios.get<PageResponse<ViewArtAndUser>>('/api/articles/get-new', {
      params: {
        page,
        size
      }
    })
    return response.data
  } catch (error) {
    console.error('获取最新文章失败:', error)
    throw error
  }
}

// 根据用户ID获取文章的API方法
export const getArticlesByUserId = async (userId: number): Promise<Article[]> => {
  try {
    const response = await axios.post<Article[]>('/api/articles/find-by-user-id', null, {
      params: { userId }
    })
    return response.data
  } catch (error) {
    console.error('获取用户文章失败:', error)
    return []
  }
}

// 点赞文章的API方法
export const likeArticle = async (userId: number, articleId: number): Promise<boolean> => {
  try {
    const response = await axios.post('/api/article-likes/like', null, {
      params: { userId, articleId }
    })
    return response.data === 200
  } catch (error) {
    console.error('点赞失败:', error)
    return false
  }
}

// 取消点赞文章的API方法
export const unlikeArticle = async (userId: number, articleId: number): Promise<boolean> => {
  try {
    const response = await axios.post('/api/article-likes/unlike', null, {
      params: { userId, articleId }
    })
    return response.data === 200
  } catch (error) {
    console.error('取消点赞失败:', error)
    return false
  }
}

// 切换点赞状态的API方法
export const toggleLikeArticle = async (userId: number, articleId: number): Promise<{ success: boolean, isLiked: boolean }> => {
  try {
    const response = await axios.post('/api/article-likes/toggle', null, {
      params: { userId, articleId }
    })
    
    const result = response.data
    if (result.includes('200')) {
      return {
        success: true,
        isLiked: result.startsWith('liked')
      }
    }
    return { success: false, isLiked: false }
  } catch (error) {
    console.error('切换点赞状态失败:', error)
    return { success: false, isLiked: false }
  }
}

// 检查用户点赞状态的API方法
export const checkLikeStatus = async (userId: number, articleId: number): Promise<boolean> => {
  try {
    const response = await axios.get('/api/article-likes/status', {
      params: { userId, articleId }
    })
    return response.data === true
  } catch (error) {
    console.error('检查点赞状态失败:', error)
    return false
  }
}

// 获取文章点赞数的API方法
export const getArticleLikeCount = async (articleId: number): Promise<number> => {
  try {
    const response = await axios.get('/api/article-likes/count', {
      params: { articleId }
    })
    return response.data || 0
  } catch (error) {
    console.error('获取点赞数失败:', error)
    return 0
  }
}

// 获取文章详情的API方法
export const getArticleDetail = async (articleId: number): Promise<ViewArtAndUser | null> => {
  try {
    const response = await axios.get<ViewArtAndUser>(`/api/articles/${articleId}`)
    return response.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
    return null
  }
}

// 导出文章API对象
export const articleApi = {
  likeArticle,
  unlikeArticle,
  toggleLikeArticle,
  checkLikeStatus,
  getArticleLikeCount,
  getArticleDetail,
  getArticlesByUserId
}

