<script setup>
import { computed, onMounted, ref } from 'vue'
import { getPosts } from '@/services/boardStorage'

const emit = defineEmits(['select-post', 'write'])

const posts = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 8

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return posts.value
  }

  return posts.value.filter((post) => {
    return (
      post.title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredPosts.value.length / pageSize),
  )
})

const paginatedPosts = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize
  const endIndex = startIndex + pageSize

  return filteredPosts.value.slice(startIndex, endIndex)
})

onMounted(() => {
  loadPosts()
})

function loadPosts() {
  posts.value = getPosts()
}

function searchPosts() {
  currentPage.value = 1
}

function openPost(postId) {
  emit('select-post', postId)
}

function openWriteForm() {
  emit('write')
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) {
    return
  }

  currentPage.value = page
}

function displayPostNumber(index) {
  return (
    filteredPosts.value.length -
    ((currentPage.value - 1) * pageSize + index)
  )
}

function formatDate(dateString) {
  if (!dateString) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dateString))
}
</script>

<template>
  <main class="board-page">
    <section class="board-heading">
      <div>
        <p class="board-heading__eyebrow">
          LOCALHUB SEOUL COMMUNITY
        </p>

        <h1>서울 익명 커뮤니티</h1>

        <p class="board-heading__description">
          서울 주민과 관광객이 맛집, 행사, 교통, 여행 정보를
          자유롭게 공유하는 공간입니다.
        </p>
      </div>

      <button
        type="button"
        class="primary-button"
        @click="openWriteForm"
      >
        글쓰기
      </button>
    </section>

    <section class="board-card">
      <div class="region-tabs">
        <button
          type="button"
          class="region-tab region-tab--active"
        >
          서울
        </button>
      </div>

      <div class="board-toolbar">
        <div>
          <strong>게시글 {{ filteredPosts.length }}개</strong>

          <p>
            현재 브라우저에 저장된 게시글만 표시됩니다.
          </p>
        </div>

        <label class="search-field">
          <span class="sr-only">게시글 검색</span>

          <input
            v-model="searchKeyword"
            type="search"
            placeholder="제목 또는 내용 검색"
            @input="searchPosts"
          />
        </label>
      </div>

      <div class="table-wrapper">
        <table class="post-table">
          <thead>
            <tr>
              <th class="number-column">번호</th>
              <th>제목</th>
              <th class="date-column">작성일</th>
              <th class="view-column">조회</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(post, index) in paginatedPosts"
              :key="post.id"
              class="post-row"
              @click="openPost(post.id)"
            >
              <td>
                {{ displayPostNumber(index) }}
              </td>

              <td class="post-title">
                {{ post.title }}
              </td>

              <td>
                {{ formatDate(post.createdAt) }}
              </td>

              <td>
                {{ post.viewCount || 0 }}
              </td>
            </tr>

            <tr v-if="paginatedPosts.length === 0">
              <td colspan="4" class="empty-state">
                <strong>등록된 게시글이 없습니다.</strong>
                <span>첫 번째 서울 정보를 작성해보세요.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav
        v-if="totalPages > 1"
        class="pagination"
        aria-label="게시글 페이지 이동"
      >
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          이전
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          다음
        </button>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.board-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 48px 0 72px;
  color: #172033;
}

.board-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 28px;
}

.board-heading h1 {
  margin: 6px 0 10px;
  font-size: clamp(28px, 4vw, 42px);
}

.board-heading__eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.board-heading__description {
  margin: 0;
  color: #667085;
  line-height: 1.7;
}

.board-card {
  overflow: hidden;
  border: 1px solid #e4e7ec;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.06);
}

.region-tabs {
  padding: 18px 22px;
  border-bottom: 1px solid #eaecf0;
}

.region-tab {
  padding: 10px 18px;
  border: 1px solid #2563eb;
  border-radius: 999px;
  font-weight: 800;
}

.region-tab--active {
  background: #2563eb;
  color: #ffffff;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 22px;
}

.board-toolbar strong {
  display: block;
}

.board-toolbar p {
  margin: 4px 0 0;
  color: #98a2b3;
  font-size: 13px;
}

.search-field input {
  width: min(320px, 48vw);
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d0d5dd;
  border-radius: 10px;
}

.search-field input:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.primary-button {
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid #2563eb;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

.post-table th,
.post-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #eef0f3;
  text-align: center;
}

.post-table th {
  background: #f8fafc;
  color: #475467;
  font-size: 14px;
}

.number-column {
  width: 80px;
}

.date-column {
  width: 140px;
}

.view-column {
  width: 80px;
}

.post-row {
  cursor: pointer;
}

.post-row:hover {
  background: #f8fbff;
}

.post-title {
  color: #172033;
  font-weight: 800;
  text-align: left !important;
}

.empty-state {
  padding: 60px 20px !important;
}

.empty-state strong,
.empty-state span {
  display: block;
}

.empty-state span {
  margin-top: 8px;
  color: #98a2b3;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 7px;
  padding: 24px;
}

.pagination button {
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  background: #ffffff;
  color: #475467;
  font-weight: 700;
  cursor: pointer;
}

.pagination button.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 760px) {
  .board-page {
    width: min(100% - 24px, 1180px);
    padding-top: 28px;
  }

  .board-heading,
  .board-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .search-field input {
    width: 100%;
  }

  .number-column,
  .view-column,
  .post-table td:first-child,
  .post-table td:last-child {
    display: none;
  }
}
</style>