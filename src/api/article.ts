import axios from 'axios'

export interface CreateArticleRequest {
  userId: number
  title: string
  text: string
  select: number
}

export const createNewPost = async (data: CreateArticleRequest) => {
  const formData = new FormData()
  formData.append('userId', data.userId.toString())
  formData.append('title', data.title)
  formData.append('text', data.text)
  formData.append('select', data.select.toString())

  try {
    const response = await axios.post('/api/articles/new-post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    console.error('API调用失败:', error)
    throw error
  }
}

// 文章接口定义
export interface Article {
  artId: number
  artUserId: number
  artTitle: string
  artTypeId: number
  artContent: string
  artCommentId: number | null
  artCreTime: string
  artView: number | null
  artComNum: number | null
  artHotNum: number | null
  artLikeNum: number | null
}

// 用户接口定义
export interface User {
  userId: number
  userPassword: string
  userName: string
  userEmail: string
  userStatus: string | null
  userTime: string
  userShow: string
  userBlog: string
  userImg: string
  userFans: number | null
  userConcern: number | null
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

// 导出文章API对象
export const articleApi = {
  likeArticle,
  unlikeArticle,
  toggleLikeArticle,
  checkLikeStatus,
  getArticleLikeCount
}

