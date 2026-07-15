<script setup>
import { onMounted, ref, watch } from 'vue'
import BoardPasswordModal from '@/components/BoardPasswordModal.vue'
import {
  deletePost,
  getPostById,
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

onMounted(() => {
  loadPost()
})

watch(
  () => props.postId,
  () => {
    loadPost()
  },
)

function loadPost() {
  const selectedPost = getPostById(props.postId)

  if (!selectedPost) {
    alert('게시글을 찾을 수 없습니다.')
    emit('back')
    return
  }

  post.value = increaseViewCount(props.postId) ?? selectedPost
}

function openPasswordModal(action) {
  modalAction.value = action
  modalError.value = ''
  modalOpen.value = true
}

function closePasswordModal() {
  modalOpen.value = false
  modalError.value = ''
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

  const confirmed = confirm('게시글을 정말 삭제하시겠습니까?')

  if (!confirmed) {
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
          <span>
            작성 {{ formatDateTime(post.createdAt) }}
          </span>

          <span v-if="post.updatedAt !== post.createdAt">
            수정 {{ formatDateTime(post.updatedAt) }}
          </span>

          <span>
            조회 {{ post.viewCount ?? 0 }}
          </span>
        </div>
      </header>

      <article class="detail-content">
        {{ post.content }}
      </article>
    </section>

    <BoardPasswordModal
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
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 48px 0 72px;
  color: #172033;
}

.detail-card {
  padding: 30px;
  border: 1px solid #e4e7ec;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.06);
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
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: #475467;
  font-weight: 800;
  cursor: pointer;
}

.secondary-button,
.danger-button {
  min-height: 42px;
  padding: 0 17px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.secondary-button {
  border: 1px solid #d0d5dd;
  background: #ffffff;
  color: #344054;
}

.danger-button {
  border: 1px solid #fda29b;
  background: #ffffff;
  color: #d92d20;
}

.detail-header {
  padding: 38px 0 28px;
  border-bottom: 1px solid #eaecf0;
}

.region-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 800;
}

.detail-header h1 {
  margin: 14px 0 12px;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.3;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  color: #98a2b3;
  font-size: 14px;
}

.detail-content {
  min-height: 260px;
  padding: 34px 2px;
  color: #344054;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 760px) {
  .detail-page {
    width: min(100% - 24px, 1180px);
    padding-top: 28px;
  }

  .detail-card {
    padding: 20px;
  }

  .detail-actions {
    align-items: flex-start;
  }
}
</style>