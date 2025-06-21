import axios from 'axios'

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

// 用户注册接口
export interface RegisterRequest {
  userName: string
  userPassword: string
  userShow: string
  userEmail: string
}

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

// 用户登录接口
export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  userId: number
  userName: string
  userEmail: string
  userTime: string
  userShow: string
  userBlog: string
  userImg: string
  userFans: number | null
  userConcern: number | null
  userPassword?: string
  userStatus?: string | null
}

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
