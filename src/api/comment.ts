import axios from 'axios'

// 创建评论请求数据类型
export interface CreateCommentRequest {
  articleId: number
  userId: number
  content: string
}

// 简单评论DTO类型
export interface SimpleCommentDTO {
  id: number
  articleId: number
  userId: number
  content: string
  createTime: string
}

/**
 * 创建新评论
 * @param request 创建评论请求数据
 * @returns Promise<SimpleCommentDTO>
 */
export const createComment = async (request: CreateCommentRequest): Promise<SimpleCommentDTO> => {
  try {
    const response = await axios.post('/api/comments', request, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('创建评论失败:', error)
    throw error
  }
}

// 导出评论API对象
export const commentApi = {
  createComment
}