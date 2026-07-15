<script setup>
import { onMounted, reactive } from 'vue'
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

onMounted(() => {
  if (props.mode !== 'edit') {
    return
  }

  const post = getPostById(props.postId)

  if (!post) {
    alert('게시글을 찾을 수 없습니다.')
    emit('cancel')
    return
  }

  form.title = post.title
  form.content = post.content
})

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
    errors.password = '수정용 비밀번호를 입력해주세요.'
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

    emit('saved', savedPost.id)
  } catch (error) {
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
          {{ mode === 'edit' ? '서울 게시글 수정' : '서울 게시글 작성' }}
        </h1>
      </header>

      <form class="post-form" @submit.prevent="submitPost">
        <div class="form-field">
          <label>지역</label>

          <div class="fixed-region">
            서울
          </div>
        </div>

        <div class="form-field">
          <label for="post-title">
            제목
          </label>

          <input
            id="post-title"
            v-model="form.title"
            type="text"
            maxlength="100"
            placeholder="서울 지역 정보의 제목을 입력해주세요."
          />

          <div class="field-bottom">
            <p class="error-message">
              {{ errors.title }}
            </p>

            <span>
              {{ form.title.length }}/100
            </span>
          </div>
        </div>

        <div class="form-field">
          <label for="post-content">
            내용
          </label>

          <textarea
            id="post-content"
            v-model="form.content"
            rows="14"
            placeholder="서울 맛집, 행사, 교통, 여행 정보를 작성해주세요."
          ></textarea>

          <p class="error-message">
            {{ errors.content }}
          </p>
        </div>

        <div class="form-field">
          <label for="post-password">
            수정용 비밀번호
          </label>

          <input
            id="post-password"
            v-model="form.password"
            type="password"
            maxlength="30"
            autocomplete="new-password"
            placeholder="4자 이상 입력"
          />

          <p class="field-description">
            수정과 삭제 시 사용하는 비밀번호입니다.
          </p>

          <p class="error-message">
            {{ errors.password }}
          </p>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="secondary-button"
            @click="emit('cancel')"
          >
            취소
          </button>

          <button
            type="submit"
            class="primary-button"
          >
            {{ mode === 'edit' ? '수정 완료' : '등록' }}
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
  padding: 48px 0 72px;
  color: #172033;
}

.form-card {
  padding: 32px;
  border: 1px solid #e4e7ec;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.06);
}

.form-header {
  margin-bottom: 30px;
}

.form-header__eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.form-header h1 {
  margin: 6px 0 0;
  font-size: clamp(28px, 4vw, 40px);
}

.post-form {
  display: grid;
  gap: 24px;
}

.form-field label {
  display: block;
  margin-bottom: 9px;
  color: #344054;
  font-weight: 800;
}

.fixed-region {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 800;
}

.post-form input,
.post-form textarea {
  width: 100%;
  padding: 0 14px;
  border: 1px solid #d0d5dd;
  border-radius: 10px;
  box-sizing: border-box;
  font: inherit;
}

.post-form input {
  height: 48px;
}

.post-form textarea {
  padding-top: 14px;
  padding-bottom: 14px;
  line-height: 1.7;
  resize: vertical;
}

.post-form input:focus,
.post-form textarea:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.field-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #98a2b3;
  font-size: 13px;
}

.field-description {
  margin: 7px 0 0;
  color: #98a2b3;
  font-size: 13px;
}

.error-message {
  min-height: 18px;
  margin: 7px 0 0;
  color: #d92d20;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

.primary-button,
.secondary-button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.secondary-button {
  border: 1px solid #d0d5dd;
  background: #ffffff;
  color: #344054;
}

@media (max-width: 760px) {
  .form-page {
    width: min(100% - 24px, 900px);
    padding-top: 28px;
  }

  .form-card {
    padding: 20px;
  }
}
</style>