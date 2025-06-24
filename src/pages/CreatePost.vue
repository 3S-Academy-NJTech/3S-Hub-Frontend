<template>
  <MainLayout>
    <div class="create-post-container">
      <div class="post-editor">
        <div class="editor-container">
          <h2 class="editor-title">发布新文章</h2>
          
          <form @submit.prevent="handleSubmit" class="editor-form">
            <!-- 文章标题 -->
            <div class="form-group">
              <label for="title" class="form-label">文章标题</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                class="form-input"
                placeholder="请输入文章标题"
                maxlength="100"
                required
              />
              <div class="char-count">{{ formData.title.length }}/100</div>
            </div>

            <!-- 文章分类 -->
            <div class="form-group">
              <label for="category" class="form-label">文章分类</label>
              <select
                id="category"
                v-model="formData.category"
                class="form-select"
                required
              >
                <option value="">请选择分类</option>
                <option
                  v-for="category in categories"
                  :key="category.value"
                  :value="category.value"
                >
                  {{ category.label }}
                </option>
              </select>
            </div>

            <!-- 文章内容 -->
            <div class="form-group">
              <label class="form-label">文章内容</label>
              <textarea
                id="content"
                v-model="formData.content"
                class="form-textarea"
                placeholder="请输入文章内容..."
                rows="20"
                required
              ></textarea>
              <div class="char-count">{{ formData.content.length }} 字符</div>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="submitting || !isFormValid"
              >
                {{ submitting ? '发布中...' : '发布文章' }}
              </button>
            </div>
          </form>

          <!-- 成功提示 -->
          <div v-if="showSuccess" class="success-message">
            文章发布成功！
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useUserStore } from '@/stores/user'
import { createNewPost } from '@/api/article'
import { POST_CATEGORIES } from '@/constants/categories'

const userStore = useUserStore()
const router = useRouter()

// 表单数据
const formData = ref({
  title: '',
  category: '',
  content: '',
  tags: [] as string[]
})

// 文章分类
const categories = POST_CATEGORIES

// 状态
const submitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

// 表单验证
const isFormValid = computed(() => {
  return formData.value.title.trim() !== '' &&
         formData.value.category !== '' &&
         formData.value.content.trim() !== ''
})

// 提交表单
const handleSubmit = async () => {
  // 验证表单
  if (!isFormValid.value) {
    errorMessage.value = '请填写完整的文章信息'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const requestData = {
      userId: userStore.userId,
      title: formData.value.title.trim(),
      text: formData.value.content.trim(),
      select: parseInt(formData.value.category)
    }

    const response = await createNewPost(requestData)
    
    if (response === 200) {
      showSuccess.value = true
      // 重置表单
      formData.value = {
        title: '',
        category: '',
        content: '',
        tags: []
      }
      
      // 2秒后跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      errorMessage.value = '发布失败，请重试'
    }
  } catch (error) {
    console.error('发布文章失败:', error)
    errorMessage.value = '发布失败，请检查网络连接或稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-post-container {
  min-height: calc(100vh - 120px);
  background: #f8f8f8;
  padding: 0;
}

.post-editor {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
}

.editor-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
  min-height: 400px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.char-count {
  align-self: flex-end;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #ccc;
}

.btn-primary {
  background: #4a90e2;
  color: white;
  border: 1px solid #4a90e2;
}

.btn-primary:hover:not(:disabled) {
  background: #357abd;
  border-color: #357abd;
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
  color: #155724;
  text-align: center;
  font-weight: 600;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
  color: #721c24;
  text-align: center;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-editor {
    padding: 10px;
  }
  
  .editor-container {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>