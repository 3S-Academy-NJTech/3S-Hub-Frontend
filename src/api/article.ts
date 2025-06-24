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

