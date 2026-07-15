<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { getPosts } from '@/services/boardStorage'

const emit = defineEmits(['select-post', 'write'])

const posts = ref([])
const searchKeyword = ref('')
const selectedCategory = ref('전체')
const sortOption = ref('latest')
const currentPage = ref(1)
const pageSize = 6

const categories = [
  { name: '전체', icon: '✨' },
  { name: '맛집', icon: '🍜' },
  { name: '축제', icon: '🎉' },
  { name: '교통', icon: '🚇' },
  { name: '여행', icon: '🧳' },
  { name: '생활', icon: '🏠' },
  { name: '자유', icon: '💬' },
]

const categoryIconMap = {
  맛집: '🍜',
  축제: '🎉',
  교통: '🚇',
  여행: '🧳',
  생활: '🏠',
  자유: '💬',
}

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value
    .trim()
    .toLowerCase()

  let result = [...posts.value]

  if (selectedCategory.value !== '전체') {
    result = result.filter(
      (post) =>
        post.category === selectedCategory.value,
    )
  }

  if (keyword) {
    result = result.filter((post) => {
      return (
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword)
      )
    })
  }

  if (sortOption.value === 'views') {
    result.sort(
      (first, second) =>
        Number(second.viewCount ?? 0) -
        Number(first.viewCount ?? 0),
    )
  } else {
    result.sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
  }

  return result
})

const popularPosts = computed(() => {
  return [...posts.value]
    .sort(
      (first, second) =>
        Number(second.viewCount ?? 0) -
        Number(first.viewCount ?? 0),
    )
    .slice(0, 3)
})

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredPosts.value.length / pageSize),
  )
})

const paginatedPosts = computed(() => {
  const startIndex =
    (currentPage.value - 1) * pageSize

  return filteredPosts.value.slice(
    startIndex,
    startIndex + pageSize,
  )
})

onMounted(() => {
  loadPosts()
})

function loadPosts() {
  posts.value = getPosts()
}

function resetPage() {
  currentPage.value = 1
}

function selectCategory(category) {
  selectedCategory.value = category
  resetPage()
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
  window.scrollTo({
    top: 500,
    behavior: 'smooth',
  })
}

function getCategoryIcon(category) {
  return categoryIconMap[category] || '💬'
}

function getPreview(content) {
  const normalized = content.replace(/\s+/g, ' ').trim()

  if (normalized.length <= 95) {
    return normalized
  }

  return `${normalized.slice(0, 95)}...`
}

function formatRelativeTime(dateString) {
  if (!dateString) {
    return ''
  }

  const now = new Date()
  const date = new Date(dateString)
  const difference =
    now.getTime() - date.getTime()

  const minutes = Math.floor(
    difference / (1000 * 60),
  )
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) {
    return '방금 전'
  }

  if (minutes < 60) {
    return `${minutes}분 전`
  }

  if (hours < 24) {
    return `${hours}시간 전`
  }

  if (days < 7) {
    return `${days}일 전`
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
</script>

<template>
  <main class="board-page">
    <section class="hero-section">
      <div class="hero-decoration hero-decoration--one"></div>
      <div class="hero-decoration hero-decoration--two"></div>

      <div class="hero-content">
        <div class="hero-badge">
          <span class="hero-badge__dot"></span>
          LOCALHUB SEOUL
        </div>

        <h1>
          서울의 오늘을
          <br />
          함께 나누는 공간
        </h1>

        <p>
          서울 주민과 여행객이 맛집, 축제, 교통,
          생활 정보를 자유롭게 공유하는 익명 커뮤니티입니다.
        </p>

        <div class="hero-actions">
          <button
            type="button"
            class="hero-write-button"
            @click="openWriteForm"
          >
            <span>✏️</span>
            새 글 작성하기
          </button>

          <span class="hero-helper">
            로그인 없이 익명으로 참여할 수 있어요
          </span>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="map-card">
          <span class="map-pin">📍</span>
          <strong>SEOUL</strong>
          <p>우리 동네의 새로운 이야기</p>

          <div class="map-keywords">
            <span>맛집</span>
            <span>축제</span>
            <span>여행</span>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="popularPosts.length"
      class="popular-section"
    >
      <div class="section-title">
        <div>
          <span class="section-title__icon">🔥</span>
          <div>
            <h2>지금 인기 있는 이야기</h2>
            <p>조회수가 높은 게시글을 모았어요.</p>
          </div>
        </div>
      </div>

      <div class="popular-grid">
        <button
          v-for="(post, index) in popularPosts"
          :key="post.id"
          type="button"
          class="popular-card"
          @click="openPost(post.id)"
        >
          <span class="popular-rank">
            {{ index + 1 }}
          </span>

          <div class="popular-card__content">
            <span
              class="category-chip"
              :class="`category-chip--${post.category}`"
            >
              {{ getCategoryIcon(post.category) }}
              {{ post.category }}
            </span>

            <strong>{{ post.title }}</strong>

            <div class="popular-meta">
              <span>조회 {{ post.viewCount || 0 }}</span>
              <span>{{ formatRelativeTime(post.createdAt) }}</span>
            </div>
          </div>
        </button>
      </div>
    </section>

    <section class="community-section">
      <div class="community-header">
        <div>
          <p class="community-header__eyebrow">
            SEOUL COMMUNITY
          </p>
          <h2>서울 커뮤니티</h2>
          <p>
            궁금한 점을 묻고, 알고 있는 정보를
            이웃과 나눠보세요.
          </p>
        </div>

        <button
          type="button"
          class="desktop-write-button"
          @click="openWriteForm"
        >
          ＋ 글쓰기
        </button>
      </div>

      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.name"
          type="button"
          class="category-tab"
          :class="{
            'category-tab--active':
              selectedCategory === category.name,
          }"
          @click="selectCategory(category.name)"
        >
          <span>{{ category.icon }}</span>
          {{ category.name }}
        </button>
      </div>

      <div class="board-toolbar">
        <div class="result-info">
          <strong>
            게시글 {{ filteredPosts.length }}개
          </strong>
          <span>
            현재 브라우저에 저장된 글을 표시합니다.
          </span>
        </div>

        <div class="toolbar-controls">
          <label class="search-field">
            <span class="search-icon">⌕</span>

            <input
              v-model="searchKeyword"
              type="search"
              placeholder="제목 또는 내용 검색"
              @input="resetPage"
            />
          </label>

          <label class="sort-field">
            <span class="sr-only">게시글 정렬</span>

            <select
              v-model="sortOption"
              @change="resetPage"
            >
              <option value="latest">
                최신순
              </option>
              <option value="views">
                조회순
              </option>
            </select>
          </label>
        </div>
      </div>

      <div
        v-if="paginatedPosts.length"
        class="post-grid"
      >
        <article
          v-for="post in paginatedPosts"
          :key="post.id"
          class="post-card"
          tabindex="0"
          @click="openPost(post.id)"
          @keydown.enter="openPost(post.id)"
        >
          <div class="post-card__top">
            <span
              class="category-chip"
              :class="`category-chip--${post.category}`"
            >
              {{ getCategoryIcon(post.category) }}
              {{ post.category }}
            </span>

            <span class="region-label">
              서울
            </span>
          </div>

          <h3>{{ post.title }}</h3>

          <p class="post-preview">
            {{ getPreview(post.content) }}
          </p>

          <div class="post-card__bottom">
            <div class="post-meta">
              <span>
                👁 {{ post.viewCount || 0 }}
              </span>
              <span>
                {{ formatRelativeTime(post.createdAt) }}
              </span>
            </div>

            <span class="post-arrow">→</span>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state__icon">📝</div>
        <strong>조건에 맞는 게시글이 없습니다.</strong>
        <p>
          검색어를 변경하거나 첫 번째 정보를 작성해보세요.
        </p>

        <button
          type="button"
          @click="openWriteForm"
        >
          새 글 작성하기
        </button>
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
          ‹
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
          ›
        </button>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.board-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 32px 0 80px;
  color: #172033;
}

.hero-section {
  position: relative;
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  min-height: 430px;
  overflow: hidden;
  padding: 64px;
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 32px;
  background:
    linear-gradient(
      135deg,
      #eff6ff 0%,
      #f0fdfa 52%,
      #ffffff 100%
    );
  box-shadow: 0 24px 70px rgba(30, 64, 175, 0.1);
}

.hero-content {
  position: relative;
  z-index: 2;
  align-self: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.hero-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #14b8a6;
  box-shadow: 0 0 0 5px rgba(20, 184, 166, 0.12);
}

.hero-content h1 {
  margin: 24px 0 18px;
  font-size: clamp(40px, 6vw, 66px);
  line-height: 1.12;
  letter-spacing: -0.05em;
}

.hero-content > p {
  max-width: 620px;
  margin: 0;
  color: #526174;
  font-size: 17px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 32px;
}

.hero-write-button,
.desktop-write-button {
  border: 0;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-write-button {
  min-height: 54px;
  padding: 0 24px;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25);
}

.hero-write-button:hover,
.desktop-write-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.3);
}

.hero-helper {
  color: #64748b;
  font-size: 13px;
}

.hero-visual {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
}

.map-card {
  width: min(100%, 300px);
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 24px 60px rgba(15, 118, 110, 0.15);
  backdrop-filter: blur(14px);
  transform: rotate(2deg);
}

.map-pin {
  display: block;
  margin-bottom: 14px;
  font-size: 44px;
}

.map-card strong {
  color: #0f766e;
  font-size: 34px;
  letter-spacing: 0.1em;
}

.map-card p {
  margin: 10px 0 20px;
  color: #526174;
}

.map-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.map-keywords span {
  padding: 7px 11px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  font-size: 13px;
  font-weight: 800;
}

.hero-decoration {
  position: absolute;
  border-radius: 50%;
  filter: blur(4px);
}

.hero-decoration--one {
  top: -100px;
  right: 180px;
  width: 280px;
  height: 280px;
  background: rgba(96, 165, 250, 0.18);
}

.hero-decoration--two {
  right: -80px;
  bottom: -100px;
  width: 320px;
  height: 320px;
  background: rgba(45, 212, 191, 0.2);
}

.popular-section {
  margin-top: 58px;
}

.section-title > div {
  display: flex;
  align-items: center;
  gap: 14px;
}

.section-title__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #fff7ed;
  font-size: 23px;
}

.section-title h2,
.community-header h2 {
  margin: 0;
  font-size: 28px;
  letter-spacing: -0.03em;
}

.section-title p,
.community-header p {
  margin: 5px 0 0;
  color: #718096;
}

.popular-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.popular-card {
  position: relative;
  display: flex;
  gap: 16px;
  min-width: 0;
  padding: 22px;
  border: 1px solid #e6eaf0;
  border-radius: 20px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.popular-card:hover {
  transform: translateY(-4px);
  border-color: #bfdbfe;
  box-shadow: 0 18px 38px rgba(37, 99, 235, 0.1);
}

.popular-rank {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 11px;
  background: #172033;
  color: #ffffff;
  font-weight: 900;
}

.popular-card__content {
  min-width: 0;
}

.popular-card strong {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 12px;
  color: #1e293b;
  font-size: 16px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.popular-meta {
  display: flex;
  gap: 12px;
  margin-top: 14px;
  color: #94a3b8;
  font-size: 13px;
}

.community-section {
  margin-top: 64px;
  padding: 32px;
  border: 1px solid #e6eaf0;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.community-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.community-header__eyebrow {
  margin: 0 0 6px !important;
  color: #2563eb !important;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.desktop-write-button {
  min-height: 46px;
  padding: 0 20px;
  border-radius: 12px;
}

.category-tabs {
  display: flex;
  gap: 9px;
  overflow-x: auto;
  margin-top: 28px;
  padding-bottom: 5px;
}

.category-tab {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #ffffff;
  color: #64748b;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.category-tab:hover {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.category-tab--active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  margin-top: 24px;
  padding: 20px 0;
  border-top: 1px solid #edf0f4;
  border-bottom: 1px solid #edf0f4;
}

.result-info strong,
.result-info span {
  display: block;
}

.result-info span {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 13px;
}

.toolbar-controls {
  display: flex;
  gap: 10px;
}

.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  color: #94a3b8;
  font-size: 23px;
  transform: translateY(-53%);
}

.search-field input,
.sort-field select {
  height: 46px;
  border: 1px solid #dbe1e8;
  border-radius: 12px;
  background: #ffffff;
  box-sizing: border-box;
  font: inherit;
}

.search-field input {
  width: 290px;
  padding: 0 15px 0 43px;
}

.sort-field select {
  min-width: 105px;
  padding: 0 13px;
  color: #475569;
  font-weight: 700;
}

.search-field input:focus,
.sort-field select:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.1);
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.post-card {
  display: flex;
  min-height: 210px;
  padding: 22px;
  border: 1px solid #e6eaf0;
  border-radius: 20px;
  background: #ffffff;
  box-sizing: border-box;
  cursor: pointer;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.post-card:hover,
.post-card:focus {
  transform: translateY(-4px);
  border-color: #bfdbfe;
  outline: none;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.1);
}

.post-card__top,
.post-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
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

.region-label {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
}

.post-card h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 18px 0 10px;
  color: #1e293b;
  font-size: 19px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-preview {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-card__bottom {
  margin-top: auto;
  padding-top: 20px;
}

.post-meta {
  display: flex;
  gap: 13px;
  color: #94a3b8;
  font-size: 13px;
}

.post-arrow {
  color: #2563eb;
  font-size: 20px;
  font-weight: 900;
  transition: transform 0.2s ease;
}

.post-card:hover .post-arrow {
  transform: translateX(4px);
}

.empty-state {
  padding: 70px 20px;
  text-align: center;
}

.empty-state__icon {
  margin-bottom: 14px;
  font-size: 48px;
}

.empty-state strong {
  display: block;
  font-size: 19px;
}

.empty-state p {
  color: #94a3b8;
}

.empty-state button {
  min-height: 44px;
  margin-top: 8px;
  padding: 0 18px;
  border: 0;
  border-radius: 11px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 7px;
  margin-top: 32px;
}

.pagination button {
  min-width: 40px;
  height: 40px;
  border: 1px solid #dbe1e8;
  border-radius: 10px;
  background: #ffffff;
  color: #64748b;
  font-weight: 800;
  cursor: pointer;
}

.pagination button.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 900px) {
  .hero-section {
    grid-template-columns: 1fr;
    padding: 48px 36px;
  }

  .hero-visual {
    display: none;
  }

  .popular-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .board-page {
    width: min(100% - 24px, 1180px);
    padding-top: 18px;
  }

  .hero-section {
    min-height: auto;
    padding: 36px 24px;
    border-radius: 24px;
  }

  .hero-content h1 {
    font-size: 40px;
  }

  .hero-actions,
  .community-header,
  .board-toolbar,
  .toolbar-controls {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-helper {
    line-height: 1.5;
  }

  .hero-write-button,
  .desktop-write-button,
  .search-field input,
  .sort-field select {
    width: 100%;
  }

  .community-section {
    margin-top: 42px;
    padding: 22px 16px;
    border-radius: 22px;
  }

  .post-grid {
    grid-template-columns: 1fr;
  }

  .post-card {
    min-height: 200px;
  }
}
</style>