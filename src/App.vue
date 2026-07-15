<script setup>
import { ref } from 'vue'

import ChatWidget from '@/components/chatWidget.vue'
import BoardList from '@/components/BoardList.vue'
import BoardDetail from '@/components/BoardDetail.vue'
import BoardForm from '@/components/BoardForm.vue'

const currentView = ref('list')
const selectedPostId = ref(null)
const formMode = ref('create')

function openPost(postId) {
  selectedPostId.value = postId
  currentView.value = 'detail'
  scrollToTop()
}

function openWriteForm() {
  selectedPostId.value = null
  formMode.value = 'create'
  currentView.value = 'form'
  scrollToTop()
}

function openEditForm(postId) {
  selectedPostId.value = postId
  formMode.value = 'edit'
  currentView.value = 'form'
  scrollToTop()
}

function goToList() {
  selectedPostId.value = null
  currentView.value = 'list'
  scrollToTop()
}

function goToDetail(postId) {
  selectedPostId.value = postId
  currentView.value = 'detail'
  scrollToTop()
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <button
        type="button"
        class="site-brand"
        @click="goToList"
      >
        <span class="site-brand__icon">📍</span>

        <span>
          <strong>LocalHub</strong>
          <small>SEOUL COMMUNITY</small>
        </span>
      </button>

      <nav class="site-nav">
        <button
          type="button"
          :class="{
            active: currentView === 'list',
          }"
          @click="goToList"
        >
          커뮤니티
        </button>

        <button
          type="button"
          @click="openWriteForm"
        >
          글쓰기
        </button>
      </nav>
    </header>

    <div id="page-content">
      <BoardList
        v-if="currentView === 'list'"
        @select-post="openPost"
        @write="openWriteForm"
      />

      <BoardDetail
        v-else-if="currentView === 'detail'"
        :post-id="selectedPostId"
        @back="goToList"
        @edit="openEditForm"
        @deleted="goToList"
      />

      <BoardForm
        v-else-if="currentView === 'form'"
        :mode="formMode"
        :post-id="selectedPostId"
        @cancel="
          formMode === 'edit'
            ? goToDetail(selectedPostId)
            : goToList()
        "
        @saved="goToDetail"
      />
    </div>

    <footer class="site-footer">
      <div>
        <strong>📍 LocalHub Seoul</strong>
        <p>
          지역 주민과 여행객이 함께 만드는 서울 커뮤니티
        </p>
      </div>

      <span>
        © 2026 LocalHub Team
      </span>
    </footer>
  </div>

  <ChatWidget />
</template>

<style>
:root {
  font-family:
    Pretendard,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  color: #172033;
  background: #f8fafc;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: #f8fafc;
  scroll-behavior: smooth;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(
      circle at top left,
      rgba(219, 234, 254, 0.52),
      transparent 30%
    ),
    #f8fafc;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

.app-shell {
  min-height: 100vh;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  width: min(1180px, calc(100% - 40px));
  height: 74px;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  background: rgba(248, 250, 252, 0.82);
  backdrop-filter: blur(15px);
}

.site-header::before {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 74px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.75);
  background: rgba(248, 250, 252, 0.82);
  content: '';
  backdrop-filter: blur(15px);
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.site-brand__icon {
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(145deg, #2563eb, #14b8a6);
  font-size: 20px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);
}

.site-brand strong,
.site-brand small {
  display: block;
}

.site-brand strong {
  color: #172033;
  font-size: 19px;
  letter-spacing: -0.02em;
}

.site-brand small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.site-nav {
  display: flex;
  gap: 5px;
}

.site-nav button {
  min-height: 39px;
  padding: 0 15px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.site-nav button:hover,
.site-nav button.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.site-footer {
  display: flex;
  width: min(1180px, calc(100% - 40px));
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding: 34px 0 42px;
  border-top: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 12px;
}

.site-footer strong {
  color: #475569;
  font-size: 14px;
}

.site-footer p {
  margin: 5px 0 0;
}

@media (max-width: 760px) {
  .site-header {
    width: min(100% - 24px, 1180px);
  }

  .site-brand small {
    display: none;
  }

  .site-nav button {
    padding: 0 10px;
  }

  .site-footer {
    width: min(100% - 24px, 1180px);
    align-items: flex-start;
    gap: 18px;
    flex-direction: column;
  }
}
</style>