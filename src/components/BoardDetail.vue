<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import BoardPasswordModal from '@/components/BoardPasswordModal.vue'
import {
  addComment,
  deletePost,
  getPostById,
  increaseLikeCount,
  increaseViewCount,
  verifyPassword,
} from '@/services/boardStorage'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
})


const emit = defineEmits(['back', 'edit', 'deleted'])

const post = ref(null)
const modalOpen = ref(false)
const modalAction = ref('edit')
const modalError = ref('')
const modalVersion = ref(0)
const commentError = ref('')

const commentForm = reactive({
  author: '',
  content: '',
})

onMounted(loadPost)

watch(
  () => props.postId,
  () => {
    closePasswordModal()
    resetCommentForm()
    loadPost()
  },
)

// also reload when route param changes (robustness for navigation)

function loadPost() {
  const selectedPost = getPostById(props.postId)

  if (!selectedPost) {
    alert('게시글을 찾을 수 없습니다.')
    emit('back')
    return
  }

  post.value = increaseViewCount(props.postId) ?? selectedPost
}

function refreshPost() {
  post.value = getPostById(props.postId)
}

function openPasswordModal(action) {
  modalAction.value = action
  modalError.value = ''
  modalVersion.value += 1
  modalOpen.value = true
}

function closePasswordModal() {
  modalOpen.value = false
  modalError.value = ''
}

function goBack() {
  emit('back')
}

function confirmPassword(password) {
  const matched = verifyPassword(props.postId, password)

  if (!matched) {
    modalError.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  if (modalAction.value === 'edit') {
    closePasswordModal()
    emit('edit', props.postId)
    return
  }

  const confirmed = window.confirm(
    '게시글을 정말 삭제하시겠습니까?',
  )

  if (!confirmed) {
    closePasswordModal()
    return
  }

  try {
    deletePost(props.postId, password)
    closePasswordModal()
    alert('게시글이 삭제되었습니다.')
    emit('deleted')
  } catch (error) {
    modalError.value = error.message
  }
}

function likePost() {
  try {
    post.value = increaseLikeCount(props.postId)
  } catch (error) {
    alert(error.message)
  }
}

function submitComment() {
  commentError.value = ''

  try {
    addComment(props.postId, {
      author: commentForm.author,
      content: commentForm.content,
    })

    resetCommentForm()
    refreshPost()
  } catch (error) {
    commentError.value = error.message
  }
}

function resetCommentForm() {
  commentForm.author = ''
  commentForm.content = ''
  commentError.value = ''
}

function formatDateTime(dateString) {
  if (!dateString) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(dateString))
}
</script>

<template>
  <main v-if="post" class="detail-page">
    <section class="detail-card">
      <div class="detail-actions">
        <button
          type="button"
          class="text-button"
          @click="emit('back')"
        >
          ← 목록으로
        </button>

        <div class="detail-actions__buttons">
          <button
            type="button"
            class="secondary-button"
            @click="openPasswordModal('edit')"
          >
            수정
          </button>

          <button
            type="button"
            class="danger-button"
            @click="openPasswordModal('delete')"
          >
            삭제
          </button>
        </div>
      </div>

      <header class="detail-header">
        <span class="region-badge">서울</span>

        <h1>{{ post.title }}</h1>

        <div class="detail-meta">
          <span>작성 {{ formatDateTime(post.createdAt) }}</span>

          <span v-if="post.updatedAt !== post.createdAt">
            수정 {{ formatDateTime(post.updatedAt) }}
          </span>

          <span>조회 {{ post.viewCount ?? 0 }}</span>
          <span>좋아요 {{ post.likeCount ?? 0 }}</span>
        </div>
      </header>

      <article class="detail-content">
        {{ post.content }}
      </article>

      <div class="like-area">
        <button
          type="button"
          class="like-button"
          aria-label="이 게시글 좋아요"
          @click="likePost"
        >
          <span class="like-button__icon" aria-hidden="true">👍</span>
          <span>좋아요</span>
          <strong>{{ post.likeCount ?? 0 }}</strong>
        </button>
      </div>
    </section>

    <section class="comment-card">
      <header class="comment-header">
        <div>
          <p>COMMUNITY COMMENT</p>
          <h2>댓글 {{ post.comments?.length ?? 0 }}개</h2>
        </div>
      </header>

      <form
        class="comment-form"
        autocomplete="off"
        @submit.prevent="submitComment"
      >
        <label class="comment-author-field">
          <span>닉네임</span>
          <input
            v-model="commentForm.author"
            type="text"
            maxlength="20"
            placeholder="미입력 시 익명"
          />
        </label>

        <label class="comment-content-field">
          <span>댓글</span>
          <textarea
            v-model="commentForm.content"
            rows="3"
            maxlength="500"
            placeholder="댓글을 입력해주세요."
          ></textarea>
        </label>

        <div class="comment-form__bottom">
          <p class="comment-error">{{ commentError }}</p>
          <button type="submit" class="comment-submit-button">
            댓글 등록
          </button>
        </div>
      </form>

      <div v-if="post.comments?.length" class="comment-list">
        <article
          v-for="comment in [...post.comments].reverse()"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-item__top">
            <strong>{{ comment.author || '익명' }}</strong>
            <time>{{ formatDateTime(comment.createdAt) }}</time>
          </div>

          <p>{{ comment.content }}</p>
        </article>
      </div>

      <div v-else class="comment-empty">
        첫 댓글을 남겨보세요.
      </div>
    </section>

    <BoardPasswordModal
      :key="modalVersion"
      :open="modalOpen"
      :action="modalAction"
      :error-message="modalError"
      @close="closePasswordModal"
      @confirm="confirmPassword"
    />
  </main>
</template>

<style scoped>
.detail-page {
  width: min(1000px, calc(100% - 40px));
  margin: 0 auto;
  padding: 58px 0 82px;
  color: #2c454c;
}

.detail-card,
.comment-card {
  padding: 34px;
  border: 1px solid #dce8e9;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 55px rgba(51, 83, 89, 0.07);
}

.comment-card {
  margin-top: 22px;
}

.detail-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.detail-actions__buttons {
  display: flex;
  gap: 9px;
}

.text-button {
  padding: 7px 0;
  border: 0;
  background: transparent;
  color: #668087;
  font-weight: 850;
  cursor: pointer;
}

.text-button:hover {
  color: #416d73;
  text-decoration: underline;
  text-underline-offset: 5px;
}

.secondary-button,
.danger-button {
  min-height: 43px;
  padding: 0 18px;
  border-radius: 11px;
  font-weight: 850;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.secondary-button {
  border: 1px solid #cfdddd;
  background: #fff;
  color: #5a747a;
}

.danger-button {
  border: 1px solid #dfbbb8;
  background: #fffafa;
  color: #a75f5b;
}

.secondary-button:hover,
.danger-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 20px rgba(47, 82, 88, 0.09);
}

.detail-header {
  padding: 39px 0 29px;
  border-bottom: 1px solid #e7efef;
}

.region-badge {
  display: inline-flex;
  min-height: 31px;
  padding: 0 12px;
  align-items: center;
  border-radius: 999px;
  background: #e5f0f0;
  color: #5f888d;
  font-weight: 850;
}

.detail-header h1 {
  margin: 15px 0 13px;
  color: #294b51;
  font-size: clamp(29px, 4vw, 42px);
  line-height: 1.35;
  letter-spacing: -0.035em;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  color: #8c9da1;
  font-size: 14px;
}

.detail-content {
  min-height: 260px;
  padding: 38px 3px;
  color: #405c63;
  line-height: 1.95;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.like-area {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
}

.like-button {
  display: inline-flex;
  min-height: 52px;
  padding: 0 20px;
  align-items: center;
  gap: 9px;
  border: 1px solid #bfd5d7;
  border-radius: 999px;
  background: #f4f9f9;
  color: #47737a;
  font-weight: 850;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.like-button:hover {
  transform: translateY(-3px);
  background: #ecf5f5;
  box-shadow: 0 11px 24px rgba(51, 91, 97, 0.1);
}

.like-button:active {
  transform: scale(0.97);
}

.like-button__icon {
  font-size: 21px;
}

.comment-header p {
  margin: 0 0 5px;
  color: #689197;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.comment-header h2 {
  margin: 0;
  color: #294b51;
  font-size: 24px;
}

.comment-form {
  display: grid;
  margin-top: 24px;
  padding: 20px;
  gap: 14px;
  border: 1px solid #e0ebeb;
  border-radius: 17px;
  background: #f8fbfb;
}

.comment-form label > span {
  display: block;
  margin-bottom: 7px;
  color: #4b686f;
  font-size: 13px;
  font-weight: 850;
}

.comment-form input,
.comment-form textarea {
  width: 100%;
  border: 1px solid #cddddd;
  border-radius: 11px;
  background: #fff;
  color: #314d54;
  font: inherit;
}

.comment-form input {
  height: 44px;
  padding: 0 13px;
}

.comment-form textarea {
  padding: 12px 13px;
  line-height: 1.65;
  resize: vertical;
}

.comment-form input:focus,
.comment-form textarea:focus {
  border-color: #75a2a6;
  outline: 0;
  box-shadow: 0 0 0 4px rgba(96, 148, 153, 0.12);
}

.comment-author-field {
  max-width: 260px;
}

.comment-form__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.comment-error {
  min-height: 20px;
  margin: 0;
  color: #b75e59;
  font-size: 13px;
}

.comment-submit-button {
  min-height: 43px;
  padding: 0 18px;
  border: 1px solid #5d9197;
  border-radius: 11px;
  background: #5d9197;
  color: #fff;
  font-weight: 850;
  cursor: pointer;
}

.comment-list {
  display: grid;
  margin-top: 24px;
  gap: 12px;
}

.comment-item {
  padding: 18px 19px;
  border: 1px solid #e1ebec;
  border-radius: 15px;
  background: #fff;
}

.comment-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.comment-item__top strong {
  color: #3f5f66;
}

.comment-item__top time {
  color: #94a4a8;
  font-size: 12px;
}

.comment-item p {
  margin: 10px 0 0;
  color: #526c73;
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.comment-empty {
  margin-top: 24px;
  padding: 34px;
  border: 1px dashed #cfdddd;
  border-radius: 15px;
  color: #8b9da1;
  text-align: center;
}

@media (max-width: 760px) {
  .detail-page {
    width: min(100% - 24px, 1000px);
    padding-top: 38px;
  }

  .detail-card,
  .comment-card {
    padding: 21px;
  }

  .detail-actions {
    align-items: flex-start;
  }

  .comment-form__bottom,
  .comment-item__top {
    align-items: stretch;
    flex-direction: column;
  }

  .comment-submit-button,
  .comment-author-field {
    width: 100%;
    max-width: none;
  }
}
</style>
