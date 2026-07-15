<script setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import {
  createPost,
  getPostById,
  updatePost,
} from '@/services/boardStorage'

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
  },
  postId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['cancel', 'saved'])

const titleInput = ref(null)

const form = reactive({
  title: '',
  content: '',
  password: '',
})

const errors = reactive({
  title: '',
  content: '',
  password: '',
})

onMounted(initializeForm)

watch(
  () => [props.mode, props.postId],
  initializeForm,
)

async function initializeForm() {
  clearErrors()
  form.title = ''
  form.content = ''
  form.password = ''

  if (props.mode === 'edit') {
    const post = getPostById(props.postId)

    if (!post) {
      alert('게시글을 찾을 수 없습니다.')
      emit('cancel')
      return
    }

    form.title = post.title
    form.content = post.content
  }

  await nextTick()
  titleInput.value?.focus()
}

function clearErrors() {
  errors.title = ''
  errors.content = ''
  errors.password = ''
}

function validateForm() {
  clearErrors()

  if (!form.title.trim()) {
    errors.title = '제목을 입력해주세요.'
  } else if (form.title.trim().length > 100) {
    errors.title = '제목은 100자 이하로 입력해주세요.'
  }

  if (!form.content.trim()) {
    errors.content = '내용을 입력해주세요.'
  }

  if (!form.password) {
    errors.password = '비밀번호를 입력해주세요.'
  } else if (form.password.length < 4) {
    errors.password = '비밀번호는 4자 이상 입력해주세요.'
  }

  return !Object.values(errors).some(Boolean)
}

function submitPost() {
  if (!validateForm()) {
    return
  }

  try {
    let savedPost

    if (props.mode === 'edit') {
      savedPost = updatePost(props.postId, {
        title: form.title,
        content: form.content,
        password: form.password,
      })

      alert('게시글이 수정되었습니다.')
    } else {
      savedPost = createPost({
        title: form.title,
        content: form.content,
        password: form.password,
      })

      alert('게시글이 등록되었습니다.')
    }

    form.password = ''
    emit('saved', savedPost.id)
  } catch (error) {
    form.password = ''
    errors.password = error.message
  }
}
</script>

<template>
  <main class="form-page">
    <section class="form-card">
      <header class="form-header">
        <p class="form-header__eyebrow">
          LOCALHUB SEOUL COMMUNITY
        </p>

        <h1>
          {{ mode === 'edit' ? '게시글 수정' : '새 게시글 작성' }}
        </h1>

        <p>
          서울 지역의 생활 정보와 여행 팁을 자유롭게 공유해주세요.
        </p>
      </header>

      <form
        class="post-form"
        autocomplete="off"
        @submit.prevent="submitPost"
      >
        <div class="form-field">
          <label>지역</label>
          <div class="fixed-region">서울</div>
        </div>

        <div class="form-field">
          <label for="post-title">제목</label>

          <input
            id="post-title"
            ref="titleInput"
            v-model="form.title"
            type="text"
            maxlength="100"
            autocomplete="off"
            placeholder="제목을 입력해주세요."
          />

          <div class="field-bottom">
            <p class="error-message">{{ errors.title }}</p>
            <span>{{ form.title.length }}/100</span>
          </div>
        </div>

        <div class="form-field">
          <label for="post-content">내용</label>

          <textarea
            id="post-content"
            v-model="form.content"
            rows="14"
            placeholder="맛집, 행사, 교통, 여행 정보를 작성해주세요."
          ></textarea>

          <p class="error-message">{{ errors.content }}</p>
        </div>

        <div class="form-field password-field">
          <label for="post-password">
            {{ mode === 'edit' ? '기존 비밀번호 확인' : '수정·삭제용 비밀번호' }}
          </label>

          <input
            id="post-password"
            v-model="form.password"
            type="password"
            maxlength="30"
            autocomplete="new-password"
            name="localhub-new-board-password"
            placeholder="4자 이상 입력"
          />

          <p class="field-description">
            {{
              mode === 'edit'
                ? '게시글 작성 시 설정한 비밀번호를 입력해야 수정할 수 있습니다.'
                : '나중에 이 글을 수정하거나 삭제할 때 사용합니다.'
            }}
          </p>

          <p class="error-message">{{ errors.password }}</p>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="secondary-button"
            @click="emit('cancel')"
          >
            취소
          </button>

          <button type="submit" class="primary-button">
            {{ mode === 'edit' ? '수정 완료' : '게시글 등록' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.form-page {
  width: min(900px, calc(100% - 40px));
  margin: 0 auto;
  padding: 58px 0 82px;
  color: #2c454c;
}

.form-card {
  padding: 34px;
  border: 1px solid #dce8e9;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 55px rgba(51, 83, 89, 0.07);
}

.form-header {
  margin-bottom: 32px;
}

.form-header__eyebrow {
  margin: 0 !important;
  color: #58858a !important;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.form-header h1 {
  margin: 7px 0 10px;
  color: #294b51;
  font-size: clamp(30px, 4vw, 44px);
  letter-spacing: -0.04em;
}

.form-header p {
  margin: 0;
  color: #788b91;
  line-height: 1.7;
}

.post-form {
  display: grid;
  gap: 25px;
}

.form-field label {
  display: block;
  margin-bottom: 9px;
  color: #425f66;
  font-weight: 850;
}

.fixed-region {
  display: inline-flex;
  min-height: 33px;
  padding: 0 13px;
  align-items: center;
  border-radius: 999px;
  background: #e5f0f0;
  color: #5c858a;
  font-weight: 850;
}

.post-form input,
.post-form textarea {
  width: 100%;
  padding: 0 14px;
  border: 1px solid #ccdcdd;
  border-radius: 12px;
  background: #fcfefe;
  color: #304c53;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.post-form input {
  height: 49px;
}

.post-form textarea {
  padding-top: 14px;
  padding-bottom: 14px;
  line-height: 1.8;
  resize: vertical;
}

.post-form input:focus,
.post-form textarea:focus {
  border-color: #77a3a7;
  outline: 0;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(96, 148, 153, 0.12);
}

.password-field {
  padding: 20px;
  border: 1px solid #e0ebeb;
  border-radius: 16px;
  background: #f7fbfb;
}

.field-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #91a1a5;
  font-size: 13px;
}

.field-description {
  margin: 8px 0 0;
  color: #87999e;
  font-size: 13px;
  line-height: 1.6;
}

.error-message {
  min-height: 18px;
  margin: 8px 0 0;
  color: #b75e59;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.primary-button,
.secondary-button {
  min-height: 46px;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 850;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}

.primary-button {
  border: 1px solid #5d9197;
  background: #5d9197;
  color: #fff;
}

.secondary-button {
  border: 1px solid #d0dfe0;
  background: #fff;
  color: #5d7379;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(48, 86, 92, 0.11);
}

.primary-button:active,
.secondary-button:active {
  transform: translateY(0) scale(0.98);
}

@media (max-width: 760px) {
  .form-page {
    width: min(100% - 24px, 900px);
    padding-top: 38px;
  }

  .form-card {
    padding: 21px;
  }
}
</style>
