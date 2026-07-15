<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
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
const router = useRouter()

const categories = [
  { value: '맛집', icon: '🍜' },
  { value: '축제', icon: '🎉' },
  { value: '교통', icon: '🚇' },
  { value: '여행', icon: '🧳' },
  { value: '생활', icon: '🏠' },
  { value: '자유', icon: '💬' },
]

const form = reactive({
  category: '자유',
  title: '',
  content: '',
  password: '',
})

const errors = reactive({
  category: '',
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

  form.category = post.category || '자유'
  form.title = post.title
  form.content = post.content
})

function clearErrors() {
  errors.category = ''
  errors.title = ''
  errors.content = ''
  errors.password = ''
}

function validateForm() {
  clearErrors()

  if (!form.category) {
    errors.category = '카테고리를 선택해주세요.'
  }

  if (!form.title.trim()) {
    errors.title = '제목을 입력해주세요.'
  } else if (form.title.trim().length > 100) {
    errors.title = '제목은 100자 이하로 입력해주세요.'
  }

  if (!form.content.trim()) {
    errors.content = '내용을 입력해주세요.'
  } else if (form.content.trim().length < 10) {
    errors.content = '내용을 10자 이상 입력해주세요.'
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

    const postData = {
      category: form.category,
      title: form.title,
      content: form.content,
      password: form.password,
    }

    if (props.mode === 'edit') {
      savedPost = updatePost(
        props.postId,
        postData,
      )

      alert('게시글이 수정되었습니다.')
    } else {
      savedPost = createPost(postData)
      alert('게시글이 등록되었습니다.')
    }

    emit('saved', savedPost.id)
    // SPA navigation: go to the newly created/updated post detail
    router.push({ path: `/board/${savedPost.id}` })
  } catch (error) {
    errors.password = error.message
  }
}
</script>

<template>
  <main class="form-page">
    <section class="form-layout">
      <aside class="form-guide">
        <div class="guide-logo">
          <span>📍</span>
          LocalHub
        </div>

        <h2>
          서울의 새로운 이야기를
          <br />
          들려주세요.
        </h2>

        <p>
          주민에게는 유용한 생활 정보를,
          여행객에게는 특별한 서울의 경험을
          공유할 수 있습니다.
        </p>

        <div class="guide-list">
          <div>
            <span>01</span>
            <p>
              게시글은 익명으로 등록됩니다.
            </p>
          </div>

          <div>
            <span>02</span>
            <p>
              비밀번호는 수정과 삭제에 필요합니다.
            </p>
          </div>

          <div>
            <span>03</span>
            <p>
              개인정보는 작성하지 않도록 주의해주세요.
            </p>
          </div>
        </div>
      </aside>

      <section class="form-card">
        <header class="form-header">
          <button
            type="button"
            class="back-button"
            @click="emit('cancel')"
          >
            ← 돌아가기
          </button>

          <p class="form-header__eyebrow">
            LOCALHUB SEOUL COMMUNITY
          </p>

          <h1>
            {{
              mode === 'edit'
                ? '게시글 수정'
                : '새 게시글 작성'
            }}
          </h1>

          <p>
            서울과 관련된 유용한 이야기를 작성해주세요.
          </p>
        </header>

        <form
          class="post-form"
          @submit.prevent="submitPost"
        >
          <div class="form-field">
            <label>지역</label>

            <div class="fixed-region">
              <span>📍</span>
              서울특별시
            </div>
          </div>

          <fieldset class="form-field category-field">
            <legend>카테고리</legend>

            <div class="category-options">
              <label
                v-for="category in categories"
                :key="category.value"
                class="category-option"
                :class="{
                  'category-option--selected':
                    form.category === category.value,
                }"
              >
                <input
                  v-model="form.category"
                  type="radio"
                  name="category"
                  :value="category.value"
                />

                <span class="category-option__icon">
                  {{ category.icon }}
                </span>

                <span>{{ category.value }}</span>
              </label>
            </div>

            <p class="error-message">
              {{ errors.category }}
            </p>
          </fieldset>

          <div class="form-field">
            <div class="label-row">
              <label for="post-title">
                제목
              </label>

              <span>
                {{ form.title.length }}/100
              </span>
            </div>

            <input
              id="post-title"
              v-model="form.title"
              type="text"
              maxlength="100"
              placeholder="어떤 이야기를 나누고 싶으신가요?"
            />

            <p class="error-message">
              {{ errors.title }}
            </p>
          </div>

          <div class="form-field">
            <div class="label-row">
              <label for="post-content">
                내용
              </label>

              <span>
                {{ form.content.length }}자
              </span>
            </div>

            <textarea
              id="post-content"
              v-model="form.content"
              rows="13"
              placeholder="서울 맛집, 행사, 교통, 여행 정보 등을 자유롭게 작성해주세요."
            ></textarea>

            <p class="error-message">
              {{ errors.content }}
            </p>
          </div>

          <div class="form-field password-field">
            <label for="post-password">
              수정·삭제 비밀번호
            </label>

            <input
              id="post-password"
              v-model="form.password"
              type="password"
              maxlength="30"
              autocomplete="new-password"
              placeholder="4자 이상 입력해주세요."
            />

            <div class="password-notice">
              <span>🔒</span>
              <p>
                별도의 회원가입 없이 글을 관리하기 위한
                비밀번호입니다. 잊어버리지 않도록 주의해주세요.
              </p>
            </div>

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
              {{
                mode === 'edit'
                  ? '수정 완료'
                  : '게시글 등록'
              }}
            </button>
          </div>
        </form>
      </section>
    </section>
  </main>
</template>

<style scoped>
.form-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 46px 0 80px;
  color: #172033;
}

.form-layout {
  display: grid;
  grid-template-columns: 0.65fr 1.35fr;
  gap: 24px;
  align-items: start;
}

.form-guide {
  position: sticky;
  top: 24px;
  overflow: hidden;
  padding: 36px;
  border-radius: 28px;
  background:
    linear-gradient(
      145deg,
      #1d4ed8 0%,
      #2563eb 45%,
      #0f766e 130%
    );
  color: #ffffff;
  box-shadow: 0 22px 60px rgba(37, 99, 235, 0.24);
}

.form-guide::after {
  position: absolute;
  right: -90px;
  bottom: -100px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  content: '';
}

.guide-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 900;
}

.form-guide h2 {
  margin: 48px 0 18px;
  font-size: 32px;
  line-height: 1.35;
  letter-spacing: -0.04em;
}

.form-guide > p {
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.8;
}

.guide-list {
  display: grid;
  gap: 18px;
  margin-top: 46px;
}

.guide-list > div {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.guide-list span {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.13);
  font-size: 12px;
  font-weight: 900;
}

.guide-list p {
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  line-height: 1.6;
}

.form-card {
  padding: 38px;
  border: 1px solid #e4e9f0;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.07);
}

.back-button {
  margin-bottom: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #64748b;
  font-weight: 800;
  cursor: pointer;
}

.back-button:hover {
  color: #2563eb;
}

.form-header {
  padding-bottom: 28px;
  border-bottom: 1px solid #edf0f4;
}

.form-header__eyebrow {
  margin: 0 !important;
  color: #2563eb !important;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.form-header h1 {
  margin: 7px 0 8px;
  font-size: 36px;
  letter-spacing: -0.04em;
}

.form-header > p {
  margin: 0;
  color: #64748b;
}

.post-form {
  display: grid;
  gap: 27px;
  padding-top: 30px;
}

.form-field {
  min-width: 0;
}

.form-field label,
.form-field legend {
  color: #334155;
  font-weight: 900;
}

.form-field legend {
  margin-bottom: 12px;
}

.category-field {
  min-width: 0;
  padding: 0;
  border: 0;
}

.fixed-region {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  margin-top: 10px;
  padding: 0 15px;
  border: 1px solid #dbe3eb;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  font-weight: 800;
}

.category-options {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 9px;
}

.category-option {
  display: flex;
  min-height: 78px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #dbe3eb;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  flex-direction: column;
  font-size: 13px;
  transition: 0.2s ease;
}

.category-option input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.category-option:hover {
  border-color: #93c5fd;
  background: #f8fbff;
}

.category-option--selected {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8 !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.category-option__icon {
  font-size: 22px;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.label-row span {
  color: #94a3b8;
  font-size: 12px;
}

.post-form input[type='text'],
.post-form input[type='password'],
.post-form textarea {
  width: 100%;
  border: 1px solid #dbe3eb;
  border-radius: 12px;
  background: #ffffff;
  box-sizing: border-box;
  color: #1e293b;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.post-form input[type='text'],
.post-form input[type='password'] {
  height: 50px;
  padding: 0 15px;
}

.post-form textarea {
  padding: 15px;
  line-height: 1.8;
  resize: vertical;
}

.post-form input:focus,
.post-form textarea:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.password-field > label {
  display: block;
  margin-bottom: 9px;
}

.password-notice {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 11px;
  background: #f8fafc;
}

.password-notice p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.error-message {
  min-height: 18px;
  margin: 7px 0 0;
  color: #dc2626;
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

.primary-button,
.secondary-button {
  min-height: 48px;
  padding: 0 22px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.2);
}

.primary-button:hover {
  transform: translateY(-2px);
  background: #1d4ed8;
}

.secondary-button {
  border: 1px solid #d7dee7;
  background: #ffffff;
  color: #475569;
}

.secondary-button:hover {
  background: #f8fafc;
}

@media (max-width: 950px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .form-guide {
    position: static;
  }

  .guide-list {
    margin-top: 26px;
  }
}

@media (max-width: 760px) {
  .form-page {
    width: min(100% - 24px, 1180px);
    padding-top: 22px;
  }

  .form-guide {
    padding: 28px 24px;
    border-radius: 22px;
  }

  .form-guide h2 {
    margin-top: 30px;
    font-size: 27px;
  }

  .form-card {
    padding: 24px 18px;
    border-radius: 22px;
  }

  .category-options {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-actions button {
    flex: 1;
  }
}
</style>