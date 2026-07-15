<script setup>
import {
  onMounted,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'
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

const emit = defineEmits([
  'back',
  'edit',
  'deleted',
])
const router = useRouter()

const post = ref(null)
const modalOpen = ref(false)
const modalAction = ref('edit')
const modalError = ref('')

const categoryIconMap = {
  맛집: '🍜',
  축제: '🎉',
  교통: '🚇',
  여행: '🧳',
  생활: '🏠',
  자유: '💬',
}

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
    router.push({ path: '/' })
    return
  }

  post.value =
    increaseViewCount(props.postId) ??
    selectedPost
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
  const matched = verifyPassword(
    props.postId,
    password,
  )

  if (!matched) {
    modalError.value =
      '비밀번호가 일치하지 않습니다.'
    return
  }

  if (modalAction.value === 'edit') {
    closePasswordModal()
    emit('edit', props.postId)
    router.push({ path: '/write', query: { mode: 'edit', id: props.postId } })
    return
  }

  const confirmed = confirm(
    '게시글을 정말 삭제하시겠습니까?',
  )

  if (!confirmed) {
    return
  }

  try {
    deletePost(props.postId, password)
    closePasswordModal()
    alert('게시글이 삭제되었습니다.')
    emit('deleted')
    router.push({ path: '/' })
  } catch (error) {
    modalError.value = error.message
  }
}

function getCategoryIcon(category) {
  return categoryIconMap[category] || '💬'
}

function formatDateTime(dateString) {
  if (!dateString) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}
</script>

<template>
  <main v-if="post" class="detail-page">
    <button
      type="button"
      class="back-button"
      @click="emit('back')"
    >
      ← 커뮤니티 목록으로
    </button>

    <section class="detail-layout">
      <article class="detail-card">
        <header class="detail-header">
          <div class="detail-header__labels">
            <span
              class="category-chip"
              :class="`category-chip--${post.category}`"
            >
              {{ getCategoryIcon(post.category) }}
              {{ post.category || '자유' }}
            </span>

            <span class="region-badge">
              📍 서울
            </span>
          </div>

          <h1>{{ post.title }}</h1>

          <div class="detail-meta">
            <span>
              익명의 LocalHub 사용자
            </span>

            <span class="meta-divider"></span>

            <span>
              {{ formatDateTime(post.createdAt) }}
            </span>

            <span class="meta-divider"></span>

            <span>
              조회 {{ post.viewCount ?? 0 }}
            </span>
          </div>

          <p
            v-if="post.updatedAt !== post.createdAt"
            class="updated-time"
          >
            마지막 수정
            {{ formatDateTime(post.updatedAt) }}
          </p>
        </header>

        <div class="detail-content">
          {{ post.content }}
        </div>

        <footer class="detail-footer">
          <div class="community-message">
            <span>💡</span>

            <p>
              서로를 존중하는 표현으로 건강한
              지역 커뮤니티를 만들어주세요.
            </p>
          </div>

          <div class="detail-actions">
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
        </footer>
      </article>

      <aside class="detail-side">
        <div class="side-card">
          <span class="side-card__icon">📍</span>
          <h2>LocalHub Seoul</h2>
          <p>
            서울 주민과 여행객이 지역 정보를
            자유롭게 공유하는 익명 커뮤니티입니다.
          </p>

          <button
            type="button"
            @click="emit('back')"
          >
            다른 이야기 둘러보기
          </button>
        </div>

        <div class="side-notice">
          <strong>커뮤니티 이용 안내</strong>

          <ul>
            <li>개인정보 작성에 주의해주세요.</li>
            <li>광고와 비방 게시글은 삼가주세요.</li>
            <li>수정과 삭제에는 비밀번호가 필요합니다.</li>
          </ul>
        </div>
      </aside>
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
  padding: 42px 0 80px;
  color: #172033;
}

.back-button {
  margin-bottom: 22px;
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

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
}

.detail-card,
.side-card,
.side-notice {
  border: 1px solid #e4e9f0;
  background: #ffffff;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.detail-card {
  overflow: hidden;
  border-radius: 28px;
}

.detail-header {
  padding: 42px 42px 32px;
  border-bottom: 1px solid #edf0f4;
  background:
    linear-gradient(
      145deg,
      #ffffff,
      #f8fbff
    );
}

.detail-header__labels {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-chip,
.region-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.category-chip {
  gap: 5px;
}

.category-chip--맛집 {
  background: #fff7ed;
  color: #c2410c;
}

.category-chip--축제 {
  background: #fdf2f8;
  color: #be185d;
}

.category-chip--교통 {
  background: #eff6ff;
  color: #1d4ed8;
}

.category-chip--여행 {
  background: #f0fdfa;
  color: #0f766e;
}

.category-chip--생활 {
  background: #f5f3ff;
  color: #6d28d9;
}

.category-chip--자유 {
  background: #f1f5f9;
  color: #475569;
}

.region-badge {
  background: #ecfeff;
  color: #0f766e;
}

.detail-header h1 {
  margin: 22px 0 18px;
  font-size: clamp(30px, 5vw, 46px);
  line-height: 1.3;
  letter-spacing: -0.04em;
}

.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  color: #94a3b8;
  font-size: 13px;
}

.meta-divider {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #cbd5e1;
}

.updated-time {
  margin: 10px 0 0;
  color: #94a3b8;
  font-size: 12px;
}

.detail-content {
  min-height: 340px;
  padding: 44px 42px;
  color: #334155;
  font-size: 16px;
  line-height: 2;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.detail-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 42px 30px;
  border-top: 1px solid #edf0f4;
}

.community-message {
  display: flex;
  align-items: center;
  gap: 9px;
}

.community-message p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: 9px;
}

.secondary-button,
.danger-button {
  min-height: 43px;
  padding: 0 17px;
  border-radius: 11px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;
}

.secondary-button {
  border: 1px solid #d7dee7;
  background: #ffffff;
  color: #475569;
}

.secondary-button:hover {
  border-color: #93c5fd;
  color: #2563eb;
}

.danger-button {
  border: 1px solid #fecaca;
  background: #fffafa;
  color: #dc2626;
}

.danger-button:hover {
  background: #fef2f2;
}

.detail-side {
  display: grid;
  gap: 16px;
}

.side-card,
.side-notice {
  padding: 25px;
  border-radius: 22px;
}

.side-card {
  background:
    linear-gradient(
      145deg,
      #eff6ff,
      #f0fdfa
    );
}

.side-card__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #ffffff;
  font-size: 23px;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
}

.side-card h2 {
  margin: 18px 0 9px;
  font-size: 21px;
}

.side-card p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.side-card button {
  width: 100%;
  min-height: 43px;
  margin-top: 22px;
  border: 0;
  border-radius: 11px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
}

.side-notice strong {
  font-size: 15px;
}

.side-notice ul {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  padding-left: 18px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 950px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-side {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .detail-page {
    width: min(100% - 24px, 1180px);
    padding-top: 26px;
  }

  .detail-card {
    border-radius: 22px;
  }

  .detail-header,
  .detail-content {
    padding: 28px 22px;
  }

  .detail-footer {
    align-items: stretch;
    padding: 22px;
    flex-direction: column;
  }

  .detail-actions button {
    flex: 1;
  }

  .detail-side {
    grid-template-columns: 1fr;
  }
}
</style>