<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import ChatWidget from '@/components/ChatWidget.vue'
import BoardList from '@/components/BoardList.vue'
import BoardDetail from '@/components/BoardDetail.vue'
import BoardForm from '@/components/BoardForm.vue'
import TodayRecommendation from '@/components/TodayRecommendation.vue'
import Map from '@/components/Map.vue'

const currentView = ref('home')
const selectedPostId = ref(null)
const formMode = ref('create')

const viewVersion = ref(0)
const isScrolled = ref(false)
const heroProgress = ref(0)

const componentKey = computed(() => {
  return [
    currentView.value,
    selectedPostId.value ?? 'none',
    formMode.value,
    viewVersion.value,
  ].join('-')
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })

  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  const scrollY = window.scrollY
  const heroHeight = Math.max(window.innerHeight, 1)

  isScrolled.value = scrollY > 15
  heroProgress.value = Math.min(scrollY / heroHeight, 1)
}

function changeView(view) {
  currentView.value = view
  viewVersion.value += 1
  scrollToTop()
}

function goHome() {
  selectedPostId.value = null
  formMode.value = 'create'
  changeView('home')
}

function goToList() {
  selectedPostId.value = null
  formMode.value = 'create'
  changeView('list')
}

function openMap() {
  selectedPostId.value = null
  formMode.value = 'create'
  changeView('map')
}

function openPost(postId) {
  selectedPostId.value = postId
  changeView('detail')
}

function openWriteForm() {
  selectedPostId.value = null
  formMode.value = 'create'
  changeView('form')
}

function openEditForm(postId) {
  selectedPostId.value = postId
  formMode.value = 'edit'
  changeView('form')
}

function goToDetail(postId) {
  selectedPostId.value = postId
  changeView('detail')
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
    <header
      class="site-header"
      :class="{
        'site-header--scrolled': isScrolled,
      }"
    >
      <button
        type="button"
        class="site-brand"
        @click="goHome"
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
            active: currentView === 'home',
          }"
          @click="goHome"
        >
          홈
        </button>

        <button
          type="button"
          :class="{
            active: currentView === 'map',
          }"
          @click="openMap"
        >
          지도
        </button>

        <button
          type="button"
          :class="{
            active: ['list', 'detail'].includes(
              currentView,
            ),
          }"
          @click="goToList"
        >
          커뮤니티
        </button>

        <button
          type="button"
          class="write-nav-button"
          :class="{
            active: currentView === 'form',
          }"
          @click="openWriteForm"
        >
          글쓰기
        </button>
      </nav>
    </header>

    <div id="page-content">
      <template v-if="currentView === 'home'">
        <section
          class="hero-section"
          :style="{
            '--hero-progress': heroProgress,
          }"
        >
          <div class="hero-decoration hero-decoration--one">
          </div>

          <div class="hero-decoration hero-decoration--two">
          </div>

          <div class="hero-sparkles" aria-hidden="true">
            <span v-for="sparkle in 14" :key="sparkle"></span>
          </div>

          <div class="hero-content">
            <p class="hero-eyebrow">
              LOCALHUB SEOUL COMMUNITY
            </p>

            <h1>
              <span>서울의 오늘을</span>
              <span>가까운 사람들과 나눠보세요.</span>
            </h1>

            <p class="hero-description">
              지역 주민과 여행자가 맛집, 행사, 교통,
              여행 정보를 자유롭게 공유하는 서울 익명
              커뮤니티입니다.
            </p>

            <div class="hero-buttons">
              <button
                type="button"
                class="primary-button"
                @click="goToList"
              >
                커뮤니티 둘러보기
              </button>

              <button
                type="button"
                class="secondary-button"
                @click="openWriteForm"
              >
                새 글 작성하기
              </button>
            </div>

            <div class="scroll-guide">
              <span>SCROLL</span>
              <i></i>
            </div>
          </div>

          <aside class="hero-card">
            <span class="hero-card__badge">
              LOCAL TIP
            </span>

            <strong>
              지금 서울에서 필요한 정보를 한눈에
            </strong>

            <p>
              맛집과 행사, 교통 상황부터 여행 팁까지
              다양한 서울 정보를 직접 작성하고 확인할
              수 있습니다.
            </p>

            <button
              type="button"
              @click="goToList"
            >
              최신 게시글 보기 →
            </button>
          </aside>
        </section>

        <section class="community-preview">
          <div>
            <p class="section-eyebrow">
              COMMUNITY BOARD
            </p>

            <h2>
              실시간으로 쌓이는 서울 지역 이야기
            </h2>

            <p>
              커뮤니티 메뉴를 누르면 지금까지 작성된
              모든 게시글을 일반 게시판 형태로 확인할
              수 있습니다.
            </p>
          </div>

          <button
            type="button"
            @click="goToList"
          >
            전체 게시판 보기
          </button>
        </section>

        <TodayRecommendation />
      </template>

      <Map v-else-if = "currentView === 'map'" />

      <BoardList
        v-else-if="currentView === 'list'"
        :key="'list-' + componentKey"
        @select-post="openPost"
        @write="openWriteForm"
      />

      <BoardDetail
        v-else-if="currentView === 'detail'"
        :key="'detail-' + componentKey"
        :post-id="selectedPostId"
        @back="goToList"
        @edit="openEditForm"
        @deleted="goToList"
      />

      <BoardForm
        v-else-if="currentView === 'form'"
        :key="'form-' + componentKey"
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
  color: #243940;
  background: #f4f8f9;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: #f4f8f9;
  scroll-behavior: smooth;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(
      circle at top left,
      rgba(184, 220, 221, 0.3),
      transparent 32%
    ),
    radial-gradient(
      circle at top right,
      rgba(194, 211, 228, 0.26),
      transparent 28%
    ),
    #f4f8f9;
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

button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 3px solid rgba(91, 145, 151, 0.22);
  outline-offset: 2px;
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
  background: rgba(244, 248, 249, 0.78);
  backdrop-filter: blur(15px);
  transition:
    height 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.site-header::before {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 74px;
  border-bottom: 1px solid rgba(205, 221, 223, 0.72);
  background: rgba(244, 248, 249, 0.78);
  content: '';
  backdrop-filter: blur(15px);
  transition:
    height 0.25s ease,
    background 0.25s ease;
}

.site-header--scrolled {
  height: 66px;
  background: rgba(248, 251, 251, 0.93);
  box-shadow: 0 10px 28px rgba(41, 76, 82, 0.07);
}

.site-header--scrolled::before {
  height: 66px;
  background: rgba(248, 251, 251, 0.93);
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
  background: linear-gradient(
    145deg,
    #70a5aa,
    #7e9fb7
  );
  font-size: 20px;
  box-shadow: 0 10px 25px rgba(67, 119, 126, 0.18);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.site-brand:hover .site-brand__icon {
  transform: translateY(-2px) rotate(-3deg);
  box-shadow: 0 14px 30px rgba(67, 119, 126, 0.22);
}

.site-brand strong,
.site-brand small {
  display: block;
}

.site-brand strong {
  color: #294b51;
  font-size: 19px;
  letter-spacing: -0.02em;
}

.site-brand small {
  margin-top: 2px;
  color: #8ba0a5;
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
  color: #687d84;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.site-nav button:hover {
  transform: translateY(-2px);
  background: #ffffff;
  color: #4f7e84;
  box-shadow: 0 7px 20px rgba(48, 84, 91, 0.07);
}

.site-nav button:active {
  transform: translateY(0) scale(0.97);
}

.site-nav button.active {
  background: rgba(100, 151, 157, 0.13);
  color: #4f7e84;
}

.site-nav .write-nav-button {
  background: #5d9197;
  color: #ffffff;
}

.site-nav .write-nav-button:hover,
.site-nav .write-nav-button.active {
  background: #527f85;
  color: #ffffff;
}

#page-content {
  min-height: calc(100vh - 74px);
}

.hero-section {
  --hero-progress: 0;
  position: relative;
  display: grid;
  width: min(1180px, calc(100% - 40px));
  min-height: calc(100vh - 74px);
  margin: 0 auto;
  padding: 88px 54px;
  grid-template-columns:
    minmax(0, 1.18fr)
    minmax(300px, 0.82fr);
  align-items: center;
  gap: 70px;
  overflow: hidden;
  isolation: isolate;
  border-radius: 38px;
  transform: translateY(calc(var(--hero-progress) * 8px));
}

.hero-section::before {
  position: absolute;
  inset: 30px 0;
  z-index: -3;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 38px;
  background-image:
    linear-gradient(
      90deg,
      rgba(8, 32, 48, 0.76) 0%,
      rgba(15, 54, 70, 0.57) 46%,
      rgba(11, 39, 54, 0.18) 72%,
      rgba(8, 28, 42, 0.34) 100%
    ),
    linear-gradient(
      180deg,
      rgba(12, 42, 58, 0.05) 42%,
      rgba(7, 28, 40, 0.54) 100%
    ),
    url('./assets/seoul-hero.jpg');
  background-position:
    center,
    center,
    center calc(48% + var(--hero-progress) * 11%);
  background-size: cover;
  box-shadow:
    0 34px 86px rgba(24, 60, 72, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
  content: '';
  opacity: calc(1 - var(--hero-progress) * 0.06);
  transform:
    scale(calc(1.035 + var(--hero-progress) * 0.025));
  transition: background-position 0.08s linear;
}

.hero-section::after {
  position: absolute;
  inset: 30px 0;
  z-index: -2;
  border-radius: 38px;
  background:
    radial-gradient(
      circle at calc(18% + var(--hero-progress) * 18%) 24%,
      rgba(255, 255, 255, 0.24),
      transparent 23%
    ),
    linear-gradient(
      112deg,
      transparent 18%,
      rgba(255, 255, 255, 0.11) 42%,
      transparent 61%
    );
  content: '';
  mix-blend-mode: screen;
  opacity: calc(0.48 + var(--hero-progress) * 0.26);
  transform: translateX(calc(var(--hero-progress) * 18px));
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  opacity: calc(1 - var(--hero-progress) * 0.12);
  transform: translateY(
    calc(var(--hero-progress) * -22px)
  );
  text-shadow: 0 3px 24px rgba(4, 24, 35, 0.3);
}

.hero-eyebrow,
.section-eyebrow {
  margin: 0;
  color: #5e898e;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.hero-section .hero-eyebrow {
  color: rgba(232, 250, 250, 0.9);
  text-shadow: 0 2px 16px rgba(0, 20, 34, 0.35);
}

.hero-section h1 {
  margin: 16px 0 22px;
  color: #ffffff;
  font-family:
    Pretendard,
    'Noto Sans KR',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: clamp(44px, 6vw, 76px);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.058em;
  text-wrap: balance;
  text-shadow:
    0 4px 26px rgba(0, 20, 34, 0.45),
    0 1px 1px rgba(0, 0, 0, 0.28);
}

.hero-section h1 span {
  display: block;
  word-break: keep-all;
  overflow-wrap: normal;
}


.hero-description {
  word-break: keep-all;
  overflow-wrap: normal;
  max-width: 620px;
  margin: 0;
  color: rgba(244, 251, 252, 0.92);
  font-size: clamp(16px, 2vw, 19px);
  font-weight: 580;
  line-height: 1.85;
  text-shadow: 0 2px 18px rgba(0, 20, 34, 0.38);
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.primary-button,
.secondary-button,
.community-preview button {
  min-height: 50px;
  padding: 0 22px;
  border-radius: 13px;
  font-weight: 850;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.primary-button {
  border: 1px solid rgba(255, 255, 255, 0.76);
  background: rgba(70, 143, 151, 0.92);
  color: #ffffff;
  box-shadow:
    0 12px 28px rgba(4, 39, 52, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
}

.secondary-button {
  border: 1px solid rgba(255, 255, 255, 0.54);
  background: rgba(255, 255, 255, 0.17);
  color: #ffffff;
  box-shadow: 0 10px 26px rgba(5, 34, 47, 0.15);
  backdrop-filter: blur(14px);
}

.primary-button:hover,
.secondary-button:hover,
.community-preview button:hover {
  transform: translateY(-3px);
  box-shadow: 0 17px 34px rgba(8, 45, 58, 0.2);
}

.primary-button:hover {
  background: rgba(60, 132, 141, 0.98);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.25);
}

.primary-button:active,
.secondary-button:active,
.community-preview button:active {
  transform: translateY(0) scale(0.98);
}

.hero-card {
  position: relative;
  z-index: 2;
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 27px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.28),
      rgba(230, 246, 248, 0.15)
    );
  color: #ffffff;
  box-shadow:
    0 28px 62px rgba(4, 34, 47, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.36);
  backdrop-filter: blur(20px) saturate(125%);
  transform:
    translateY(calc(var(--hero-progress) * 18px))
    rotate(calc((1 - var(--hero-progress)) * -1deg));
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.hero-card:hover {
  border-color: rgba(255, 255, 255, 0.68);
  box-shadow:
    0 34px 72px rgba(4, 34, 47, 0.29),
    inset 0 1px 0 rgba(255, 255, 255, 0.46);
}

.hero-card__badge {
  display: inline-flex;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(218, 246, 245, 0.19);
  color: #efffff;
  font-size: 12px;
  font-weight: 900;
}

.hero-card strong {
  display: block;
  margin-top: 18px;
  color: #ffffff;
  font-size: 27px;
  line-height: 1.45;
  text-shadow: 0 2px 18px rgba(0, 21, 32, 0.34);
}

.hero-card p {
  margin: 14px 0 22px;
  color: rgba(244, 251, 252, 0.88);
  line-height: 1.75;
}

.hero-card button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #f0ffff;
  font-weight: 850;
  cursor: pointer;
}

.hero-card button:hover {
  text-decoration: underline;
  text-underline-offset: 5px;
}

.hero-decoration {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.hero-decoration--one {
  top: 9%;
  right: 7%;
  width: 230px;
  height: 230px;
  background: rgba(175, 235, 232, 0.18);
  transform: translateY(
    calc(var(--hero-progress) * -42px)
  );
}

.hero-decoration--two {
  bottom: 5%;
  left: 37%;
  width: 165px;
  height: 165px;
  background: rgba(193, 219, 241, 0.16);
  transform: translateY(
    calc(var(--hero-progress) * 35px)
  );
}

.hero-sparkles {
  position: absolute;
  inset: 30px 0;
  z-index: 1;
  overflow: hidden;
  border-radius: 38px;
  opacity: calc(0.45 + var(--hero-progress) * 0.42);
  pointer-events: none;
}

.hero-sparkles span {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.9),
    0 0 18px rgba(182, 239, 244, 0.72);
  animation:
    heroSparkle 3.8s ease-in-out infinite,
    heroFloat 8s ease-in-out infinite;
}

.hero-sparkles span:nth-child(1) { left: 8%; top: 19%; animation-delay: -0.4s; }
.hero-sparkles span:nth-child(2) { left: 17%; top: 48%; animation-delay: -2.1s; }
.hero-sparkles span:nth-child(3) { left: 29%; top: 25%; animation-delay: -1.3s; }
.hero-sparkles span:nth-child(4) { left: 39%; top: 66%; animation-delay: -3.2s; }
.hero-sparkles span:nth-child(5) { left: 48%; top: 15%; animation-delay: -0.9s; }
.hero-sparkles span:nth-child(6) { left: 57%; top: 42%; animation-delay: -2.6s; }
.hero-sparkles span:nth-child(7) { left: 66%; top: 23%; animation-delay: -1.8s; }
.hero-sparkles span:nth-child(8) { left: 74%; top: 59%; animation-delay: -3.5s; }
.hero-sparkles span:nth-child(9) { left: 83%; top: 17%; animation-delay: -1.1s; }
.hero-sparkles span:nth-child(10) { left: 91%; top: 47%; animation-delay: -2.9s; }
.hero-sparkles span:nth-child(11) { left: 14%; top: 76%; animation-delay: -1.6s; }
.hero-sparkles span:nth-child(12) { left: 34%; top: 83%; animation-delay: -3.7s; }
.hero-sparkles span:nth-child(13) { left: 63%; top: 79%; animation-delay: -0.6s; }
.hero-sparkles span:nth-child(14) { left: 87%; top: 82%; animation-delay: -2.3s; }

@keyframes heroSparkle {
  0%, 100% {
    opacity: 0.12;
    transform: scale(0.45);
  }
  45% {
    opacity: 1;
    transform: scale(1.5);
  }
}

@keyframes heroFloat {
  0%, 100% {
    translate: 0 0;
  }
  50% {
    translate:
      calc((var(--hero-progress) + 0.2) * 10px)
      calc((var(--hero-progress) + 0.2) * -14px);
  }
}

.scroll-guide {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 52px;
  color: #84999e;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.scroll-guide i {
  position: relative;
  width: 42px;
  height: 1px;
  overflow: hidden;
  background: #b5c5c8;
}

.scroll-guide i::after {
  position: absolute;
  inset: 0;
  background: #628f94;
  content: '';
  animation: scrollLine 1.8s ease-in-out infinite;
}

.community-preview {
  display: flex;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 90px 0 120px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
}

.community-preview h2 {
  margin: 10px 0 12px;
  color: #2d4d54;
  font-size: clamp(28px, 4vw, 44px);
  letter-spacing: -0.04em;
}

.community-preview p:not(.section-eyebrow) {
  max-width: 670px;
  margin: 0;
  color: #74888e;
  line-height: 1.8;
}

.community-preview button {
  flex: 0 0 auto;
  border: 1px solid #9bbabd;
  background: #ffffff;
  color: #4d777d;
}

.map-placeholder {
  width: min(900px, calc(100% - 40px));
  margin: 0 auto;
  padding: 120px 30px;
  text-align: center;
}

.map-placeholder__icon {
  display: grid;
  width: 82px;
  height: 82px;
  margin: 0 auto 22px;
  place-items: center;
  border-radius: 25px;
  background: #dfeded;
  font-size: 38px;
}

.map-placeholder h1 {
  margin: 11px 0 15px;
  color: #2d4d54;
  font-size: clamp(30px, 5vw, 48px);
}

.map-placeholder p:not(.section-eyebrow) {
  max-width: 620px;
  margin: 0 auto 28px;
  color: #74888e;
  line-height: 1.8;
}

.site-footer {
  display: flex;
  width: min(1180px, calc(100% - 40px));
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding: 34px 0 42px;
  border-top: 1px solid #dbe7e8;
  color: #91a3a8;
  font-size: 12px;
}

.site-footer strong {
  color: #506a70;
  font-size: 14px;
}

.site-footer p {
  margin: 5px 0 0;
}

@keyframes scrollLine {
  0% {
    transform: translateX(-105%);
  }

  50%,
  100% {
    transform: translateX(105%);
  }
}

@media (max-width: 820px) {
  .site-header {
    width: min(100% - 24px, 1180px);
  }

  .site-nav {
    gap: 0;
  }

  .site-nav button {
    padding: 0 10px;
    font-size: 13px;
  }

  .hero-section {
    width: min(100% - 24px, 1180px);
    min-height: auto;
    padding: 65px 21px 75px;
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .hero-section::before {
    inset: 15px 0;
    border-radius: 27px;
  }

  .hero-card {
    padding: 25px;
  }

  .community-preview {
    width: min(100% - 30px, 1180px);
    padding: 65px 0 90px;
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .site-brand small {
    display: none;
  }

  .site-brand strong {
    font-size: 16px;
  }

  .site-brand__icon {
    width: 38px;
    height: 38px;
  }

  .site-nav button {
    padding: 0 7px;
    font-size: 12px;
  }

  .hero-section h1 {
    font-size: 40px;
  }

  .hero-buttons,
  .hero-buttons button {
    width: 100%;
  }

  .site-footer {
    width: min(100% - 24px, 1180px);
    align-items: flex-start;
    gap: 18px;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
