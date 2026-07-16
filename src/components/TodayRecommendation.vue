<script setup>
import { computed, ref } from 'vue'

import attractions from '@/data/서울/서울_관광지.json'
import leisure from '@/data/서울/서울_레포츠.json'
import culture from '@/data/서울/서울_문화시설.json'
import shopping from '@/data/서울/서울_쇼핑.json'
import lodging from '@/data/서울/서울_숙박.json'
import courses from '@/data/서울/서울_여행코스.json'
import festivals from '@/data/서울/서울_축제공연행사.json'

const categories = [
  { key: 'attractions', label: '관광지', data: attractions },
  { key: 'leisure', label: '레포츠', data: leisure },
  { key: 'culture', label: '문화시설', data: culture },
  { key: 'shopping', label: '쇼핑', data: shopping },
  { key: 'lodging', label: '숙박', data: lodging },
  { key: 'courses', label: '여행코스', data: courses },
  { key: 'festivals', label: '축제공연행사', data: festivals },
]

const refreshSeed = ref(0)

const recommendations = computed(() => {
  refreshSeed.value

  return categories.map((category) => {
    const items = Array.isArray(category.data?.items)
      ? category.data.items.filter((item) => item?.title)
      : []

    const item = items[Math.floor(Math.random() * items.length)] ?? {}
    const query = [item.title, item.addr1].filter(Boolean).join(' ')

    return {
      ...category,
      item,
      image: normalizeImage(item.firstimage || item.firstimage2),
      link: `https://map.naver.com/p/search/${encodeURIComponent(query)}`,
    }
  })
})

function normalizeImage(url) {
  if (!url) return ''
  return url.replace(/^http:\/\//, 'https://')
}

function refreshRecommendations() {
  refreshSeed.value += 1
}
</script>

<template>
  <section class="recommendation-section">
    <header class="recommendation-heading">
      <div>
        <p class="recommendation-eyebrow">TODAY'S PICK</p>
        <h2>오늘의 추천</h2>
        <p>서울 데이터에서 카테고리별 장소를 무작위로 골랐어요.</p>
      </div>

      <button type="button" class="refresh-button" @click="refreshRecommendations">
        추천 다시 받기 ↻
      </button>
    </header>

    <div class="recommendation-grid">
      <a
        v-for="recommendation in recommendations"
        :key="`${recommendation.key}-${recommendation.item.contentid}-${refreshSeed}`"
        class="recommendation-card"
        :href="recommendation.link"
        target="_blank"
        rel="noopener noreferrer"
        :style="recommendation.image
          ? { '--recommendation-image': `url(${recommendation.image})` }
          : {}"
      >
        <div class="recommendation-overlay"></div>

        <div class="recommendation-content">
          <span class="recommendation-category">
            {{ recommendation.label }}
          </span>

          <div>
            <h3>{{ recommendation.item.title || '추천 장소 준비 중' }}</h3>
            <p>{{ recommendation.item.addr1 || '서울특별시' }}</p>
            <span class="recommendation-link">관련 장소 바로가기 →</span>
          </div>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.recommendation-section {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 0 0 120px;
}

.recommendation-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.recommendation-eyebrow {
  margin: 0;
  color: #5e898e;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.recommendation-heading h2 {
  margin: 10px 0 12px;
  color: #2d4d54;
  font-size: clamp(30px, 4vw, 46px);
  letter-spacing: -0.04em;
}

.recommendation-heading p:not(.recommendation-eyebrow) {
  margin: 0;
  color: #74888e;
  line-height: 1.75;
}

.refresh-button {
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid #a8c2c5;
  border-radius: 13px;
  background: rgba(255,255,255,.82);
  color: #4f777d;
  font-weight: 850;
  cursor: pointer;
  transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
}

.refresh-button:hover {
  transform: translateY(-3px);
  background: #fff;
  box-shadow: 0 14px 28px rgba(47,91,98,.12);
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.recommendation-card {
  --recommendation-image: linear-gradient(135deg, #9ebfc1, #8ca8bd);
  position: relative;
  min-height: 260px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.45);
  border-radius: 24px;
  background-image: var(--recommendation-image);
  background-position: center;
  background-size: cover;
  box-shadow: 0 20px 48px rgba(38,75,82,.12);
  color: #fff;
  text-decoration: none;
  isolation: isolate;
  transition: transform .3s ease, box-shadow .3s ease;
}

.recommendation-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 62px rgba(38,75,82,.2);
}

.recommendation-card::before {
  position: absolute;
  inset: -8%;
  z-index: -2;
  background-image: var(--recommendation-image);
  background-position: center;
  background-size: cover;
  content: '';
  transition: transform .55s ease;
}

.recommendation-card:hover::before {
  transform: scale(1.07);
}

.recommendation-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(8,31,42,.12), rgba(7,26,37,.82)),
    linear-gradient(120deg, rgba(31,84,92,.18), transparent 60%);
}

.recommendation-content {
  display: flex;
  min-height: 260px;
  padding: 21px;
  flex-direction: column;
  justify-content: space-between;
}

.recommendation-category {
  align-self: flex-start;
  padding: 7px 11px;
  border: 1px solid rgba(255,255,255,.42);
  border-radius: 999px;
  background: rgba(13,42,53,.3);
  font-size: 12px;
  font-weight: 900;
  backdrop-filter: blur(8px);
}

.recommendation-card h3 {
  margin: 0 0 8px;
  font-size: 21px;
  line-height: 1.35;
  letter-spacing: -0.03em;
  word-break: keep-all;
}

.recommendation-card p {
  margin: 0;
  color: rgba(255,255,255,.82);
  font-size: 13px;
  line-height: 1.55;
  word-break: keep-all;
}

.recommendation-link {
  display: inline-block;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 900;
}

@media (max-width: 980px) {
  .recommendation-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 620px) {
  .recommendation-section { width: min(100% - 24px, 1180px); padding-bottom: 86px; }
  .recommendation-heading { align-items: stretch; flex-direction: column; }
  .refresh-button { width: 100%; }
  .recommendation-grid { grid-template-columns: 1fr; }
  .recommendation-card, .recommendation-content { min-height: 230px; }
}
</style>
