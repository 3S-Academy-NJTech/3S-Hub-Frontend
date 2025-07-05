import axios from 'axios'

// ==================== 接口定义 ====================

// 用户注册接口
export interface RegisterRequest {
  userName: string
  userPassword: string
  userShow: string
  userEmail: string
}

// 用户登录接口
export interface LoginRequest {
  email: string
  password: string
}

// 用户信息接口
export interface User {
  userId: number
  userName: string
  userEmail: string
  userTime: string
  userShow: string
}

// ==================== API配置 ====================

// 创建axios实例
const api = axios.create({
  baseURL: '/api/user',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求配置:', config)
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('响应成功:', response)
    return response.data
  },
  (error) => {
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

// ==================== API方法 ====================

// 用户注册的API方法
export const userRegister = (data: RegisterRequest): Promise<number> => {
  const formData = new FormData()
  formData.append('userName', data.userName)
  formData.append('userPassword', data.userPassword)
  formData.append('userShow', data.userShow)
  formData.append('userEmail', data.userEmail)
  
  return api.post('/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 用户登录的API方法
export const userLogin = (data: LoginRequest): Promise<User> => {
  const formData = new FormData()
  formData.append('email', data.email)
  formData.append('password', data.password)
  
  return api.post('/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 根据用户ID获取用户信息的API方法
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const response = await axios.get<User>(`/api/user/${userId}`)
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 导出用户API对象
export const userApi = {
  userRegister,
  userLogin,
  getUserById
}