<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getPosts } from '@/services/boardStorage'

const emit = defineEmits(['select-post', 'write'])

const posts = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return posts.value
  }

  return posts.value.filter((post) => {
    const title = String(post.title ?? '').toLowerCase()
    const content = String(post.content ?? '').toLowerCase()

    return title.includes(keyword) || content.includes(keyword)
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

  return filteredPosts.value.slice(
    startIndex,
    startIndex + pageSize,
  )
})

watch(totalPages, (pageCount) => {
  if (currentPage.value > pageCount) {
    currentPage.value = pageCount
  }
})

onMounted(loadPosts)

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
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function displayPostNumber(index) {
  return (
    filteredPosts.value.length -
    ((currentPage.value - 1) * pageSize + index)
  )
}

function formatDate(dateString) {
  if (!dateString) {
    return '-'
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
        + 글쓰기
      </button>
    </section>

    <section class="board-card">
      <div class="board-topline">
        <div class="region-tabs">
          <button
            type="button"
            class="region-tab region-tab--active"
          >
            서울
          </button>
        </div>

        <span class="storage-notice">
          내 브라우저에 안전하게 저장됩니다
        </span>
      </div>

      <div class="board-toolbar">
        <div>
          <strong>전체 {{ filteredPosts.length }}개</strong>
          <p>제목을 누르면 게시글 상세 내용을 볼 수 있습니다.</p>
        </div>

        <label class="search-field">
          <span class="sr-only">게시글 검색</span>
          <span class="search-icon">⌕</span>

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
              tabindex="0"
              @click="openPost(post.id)"
              @keydown.enter="openPost(post.id)"
            >
              <td class="post-number">
                {{ displayPostNumber(index) }}
              </td>

              <td class="post-title">
                <span class="post-category">서울</span>
                <span>{{ post.title }}</span>
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
                <div class="empty-state__icon">✦</div>
                <strong>
                  {{
                    searchKeyword
                      ? '검색 결과가 없습니다.'
                      : '등록된 게시글이 없습니다.'
                  }}
                </strong>
                <span>
                  {{
                    searchKeyword
                      ? '다른 검색어를 입력해보세요.'
                      : '첫 번째 서울 정보를 작성해보세요.'
                  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="board-footer" aria-label="게시글 페이지 이동">
        <span>
          {{ currentPage }} / {{ totalPages }} 페이지
        </span>

        <div v-if="totalPages > 1" class="pagination">
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
        </div>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.board-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 62px 0 82px;
  color: #263b44;
}

.board-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 28px;
}

.board-heading h1 {
  margin: 7px 0 10px;
  color: #294b51;
  font-size: clamp(30px, 4vw, 46px);
  letter-spacing: -0.045em;
}

.board-heading__eyebrow {
  margin: 0;
  color: #58858a;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.board-heading__description {
  margin: 0;
  color: #6d8289;
  line-height: 1.75;
}

.primary-button {
  min-height: 48px;
  padding: 0 21px;
  border: 1px solid #5d9197;
  border-radius: 13px;
  background: #5d9197;
  color: #fff;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(67, 123, 130, 0.17);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}

.primary-button:hover {
  transform: translateY(-3px);
  background: #527f85;
  box-shadow: 0 15px 30px rgba(67, 123, 130, 0.2);
}

.primary-button:active {
  transform: translateY(0) scale(0.98);
}

.board-card {
  overflow: hidden;
  border: 1px solid #dce8e9;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 20px 55px rgba(51, 83, 89, 0.07);
}

.board-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 22px;
  border-bottom: 1px solid #e5eeee;
  background: #f8fbfb;
}

.region-tabs {
  display: flex;
  gap: 8px;
}

.region-tab {
  min-height: 38px;
  padding: 0 17px;
  border: 1px solid #8db3b6;
  border-radius: 999px;
  font-weight: 850;
}

.region-tab--active {
  background: #668f94;
  color: #fff;
}

.storage-notice {
  color: #87999e;
  font-size: 12px;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px;
}

.board-toolbar strong {
  display: block;
  color: #35535a;
}

.board-toolbar p {
  margin: 5px 0 0;
  color: #8a9ba0;
  font-size: 13px;
}

.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  color: #85999e;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-field input {
  width: min(340px, 46vw);
  height: 46px;
  padding: 0 14px 0 39px;
  border: 1px solid #cfdedf;
  border-radius: 12px;
  background: #fbfdfd;
  color: #314c53;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.search-field input:focus {
  border-color: #78a3a7;
  outline: 0;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(96, 148, 153, 0.12);
}

.table-wrapper {
  overflow-x: auto;
  border-top: 1px solid #edf3f3;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

.post-table th,
.post-table td {
  padding: 17px 18px;
  border-bottom: 1px solid #edf3f3;
  text-align: center;
}

.post-table th {
  background: #f5f9f9;
  color: #71868c;
  font-size: 13px;
  font-weight: 850;
}

.number-column {
  width: 86px;
}

.date-column {
  width: 145px;
}

.view-column {
  width: 90px;
}

.post-row {
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.post-row:hover,
.post-row:focus {
  background: #f4f9f9;
  outline: none;
}

.post-row:active {
  background: #edf5f5;
}

.post-number {
  color: #84979c;
}

.post-title {
  color: #2e4b52;
  font-weight: 800;
  text-align: left !important;
}

.post-category {
  display: inline-flex;
  margin-right: 10px;
  padding: 5px 8px;
  border-radius: 999px;
  background: #e7f1f1;
  color: #5f888d;
  font-size: 11px;
  vertical-align: middle;
}

.empty-state {
  padding: 74px 20px !important;
}

.empty-state__icon {
  margin-bottom: 11px;
  color: #81a9ac;
  font-size: 25px;
}

.empty-state strong,
.empty-state span {
  display: block;
}

.empty-state strong {
  color: #425f66;
}

.empty-state span {
  margin-top: 8px;
  color: #93a3a8;
}

.board-footer {
  display: flex;
  min-height: 78px;
  padding: 18px 22px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: #8b9da1;
  font-size: 13px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 7px;
}

.pagination button {
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #d2e0e1;
  border-radius: 10px;
  background: #fff;
  color: #647b81;
  font-weight: 750;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #f1f7f7;
  box-shadow: 0 7px 16px rgba(68, 104, 110, 0.08);
}

.pagination button.active {
  border-color: #668f94;
  background: #668f94;
  color: #fff;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
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
    padding-top: 38px;
  }

  .board-heading,
  .board-toolbar,
  .board-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .search-field input {
    width: 100%;
  }

  .storage-notice {
    display: none;
  }

  .number-column,
  .view-column,
  .post-table td:first-child,
  .post-table td:last-child {
    display: none;
  }

  .post-category {
    display: none;
  }
}
</style>
