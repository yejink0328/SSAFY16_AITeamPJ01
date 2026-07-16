<template>
  <div class="map-container">
    <div v-if="!effectiveKey" class="map-placeholder">
      카카오 앱키가 설정되어 있지 않습니다. App.vue에서 prop으로 apiKey를 전달하거나 .env의 VITE_KAKAO_KEY를 설정하세요.
    </div>

    <div v-else>
      <div class="controls">
        <label>카테고리
          <select v-model="category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
        <label>구 선택
          <select v-model="district">
            <option value="">전체</option>
            <option v-for="g in districtOptions" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>
        <button @click="applyFilter">적용</button>
      </div>

      <div class="map-wrapper">
        <div v-if="loadState === 'loading'" class="map-overlay">지도를 로딩 중입니다...</div>
        <div v-else-if="loadState === 'error'" class="map-overlay">오류: {{ loadError }}<br/>환경변수 `VITE_KAKAO_KEY`를 확인하세요.</div>
        <div ref="mapEl" class="kakao-map" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { filterByCategoryAndDistrict } from '@/services/dataFilter.js'

// props: kakao API key passed from parent (optional)
const props = defineProps({ apiKey: { type: String, required: false, default: '' } })

// effectiveKey: use prop first, fallback to Vite env var VITE_KAKAO_KEY
const effectiveKey = props.apiKey || import.meta.env.VITE_KAKAO_KEY || ''

const mapEl = ref(null)
let map = null
let markers = []
let clusterer = null
let currentInfoWindow = null
const loadState = ref('idle') // 'idle' | 'loading' | 'ready' | 'error'
const loadError = ref('')

const categories = ['전체','관광지','숙박','축제공연사','문화시설','레포츠','여행코스','쇼핑']

const districtOptions = [
  '종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구',
  '은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구'
]

const category = ref('관광지')
const district = ref('')

function loadKakaoScript(key) {
  return new Promise((resolve, reject) => {
    if (!key) return reject(new Error('Kakao API key is missing'))
    if (window.kakao && window.kakao.maps) return resolve(window.kakao)
    const script = document.createElement('script')
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=clusterer,services`
    script.onload = () => resolve()
    script.onerror = (e) => reject(new Error('Failed to load Kakao Maps SDK'))
    document.head.appendChild(script)
  })
}

async function initMap(key) {
  await loadKakaoScript(key)
  // Wait until mapEl is attached to document
  const waitForElement = async (timeout = 2000) => {
    const interval = 100
    let waited = 0
    while ((!mapEl.value || !document.contains(mapEl.value)) && waited < timeout) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, interval))
      waited += interval
    }
    return Boolean(mapEl.value && document.contains(mapEl.value))
  }

  const ready = await waitForElement(3000)
  if (!ready) {
    throw new Error('Map container not available in DOM')
  }

  window.kakao.maps.load(() => {
    try {
      const center = new window.kakao.maps.LatLng(37.566826, 126.978656)
      map = new window.kakao.maps.Map(mapEl.value, { center, level: 8 })
      // show full Seoul bounds on initial load
      try {
        const bounds = new window.kakao.maps.LatLngBounds()
        // tighter Seoul bounding box (northEast and southWest)
        bounds.extend(new window.kakao.maps.LatLng(37.701, 127.18)) // NE
        bounds.extend(new window.kakao.maps.LatLng(37.413, 126.76)) // SW
        map.setBounds(bounds)
        // Zoom in one level to make Seoul fill the viewport more tightly
        try {
          const lvl = map.getLevel()
          map.setLevel(Math.max(1, lvl - 1))
        } catch (e) {
          // ignore if getLevel not available
        }
      } catch (e) {
        console.warn('Failed to set initial Seoul bounds', e)
      }
      clusterer = new window.kakao.maps.MarkerClusterer({ map, averageCenter: true, minLevel: 6 })
      // initial load (do not recenter on first auto-load)
      applyFilter(false)
    } catch (err) {
      console.error('Map init error', err)
      throw err
    }
  })
}

async function applyFilter(centerIfNeeded = true) {
  if (!map) {
    console.warn('applyFilter called but map is not initialized')
    return
  }
  // clear existing markers
  // close any open info window
  if (currentInfoWindow && currentInfoWindow.close) {
    try { currentInfoWindow.close() } catch (e) {}
    currentInfoWindow = null
  }

  markers.forEach((m) => m.setMap(null))
  markers = []
  if (clusterer && clusterer.clear) clusterer.clear()

  const items = await filterByCategoryAndDistrict(category.value, district.value, 500)
  const kakao = window.kakao
    const markerList = items.map((it) => {
    const position = new kakao.maps.LatLng(it.mapy, it.mapx)
    const marker = new kakao.maps.Marker({ position })
    const imgHtml = it.image
      ? `<div style="flex:0 0 96px; margin-right:8px"><img src="${it.image}" alt="${it.title}" style="width:96px;height:96px;object-fit:cover;border-radius:8px;display:block;"/></div>`
      : ''
    const infoHtml = `
      <div style="display:flex;gap:8px;max-width:260px;align-items:flex-start">
        ${imgHtml}
        <div style="padding:8px;flex:1;min-width:0">
          <strong style="display:block;margin-bottom:6px">${it.title}</strong>
          <div style="font-size:13px;color:#555">${it.addr}</div>
        </div>
      </div>
    `
    const infowindow = new kakao.maps.InfoWindow({ content: infoHtml })
    marker.addListener('click', () => {
      // close previously opened info window
      try {
        if (currentInfoWindow && currentInfoWindow.close) currentInfoWindow.close()
      } catch (e) {
        // ignore
      }
      infowindow.open(map, marker)
      currentInfoWindow = infowindow
    })
    return marker
  })

  markers = markerList
  if (clusterer && clusterer.addMarkers) clusterer.addMarkers(markers)
  if (markers.length > 0 && centerIfNeeded) map.setCenter(markers[0].getPosition())
}

onMounted(() => {
  if (!effectiveKey) {
    loadState.value = 'error'
    loadError.value = '카카오 앱키가 설정되어 있지 않습니다. .env에 VITE_KAKAO_KEY를 설정하거나 Map 컴포넌트에 apiKey prop을 전달하세요.'
    console.warn('Map.vue: apiKey not provided — map will not load')
    return
  }

  loadState.value = 'loading'
  initMap(effectiveKey)
    .then(() => {
      loadState.value = 'ready'
    })
    .catch((e) => {
      console.error('Kakao load error', e)
      loadState.value = 'error'
      loadError.value = e && e.message ? e.message : String(e)
    })
})

onBeforeUnmount(() => {
  markers.forEach((m) => m.setMap(null))
  if (clusterer && clusterer.clear) clusterer.clear()
  if (currentInfoWindow && currentInfoWindow.close) {
    try { currentInfoWindow.close() } catch (e) {}
    currentInfoWindow = null
  }
})
</script>

<style scoped>
.map-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 62px 0 82px;
  color: #263b44;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 28px;
}

.page-eyebrow {
  margin: 0;
  color: #58858a;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.page-heading h1 {
  margin: 7px 0 10px;
  color: #294b51;
  font-size: clamp(30px, 4vw, 46px);
  letter-spacing: -0.045em;
}

.page-description {
  margin: 0;
  color: #6d8289;
  line-height: 1.75;
}

.map-card {
  overflow: hidden;
  border: 1px solid #dce8e9;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 55px rgba(51, 83, 89, 0.07);
}

.map-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
}

.map-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 22px 22px 18px;
  max-height: 560px;
}

.map-sidebar-card {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e5eeee;
  border-radius: 20px;
  background: #fbfdfd;
}

.filter-section-title {
  margin: 0 0 14px;
  color: #425f66;
  font-size: 14px;
  font-weight: 850;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-list.horizontal {
  flex-wrap: wrap;
}

.category-list.vertical {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.filter-button {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #cfdedf;
  border-radius: 14px;
  background: #fff;
  color: #314c53;
  text-align: left;
  font-weight: 750;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.district-list.vertical .filter-button {
  width: 100%;
}

.filter-button:hover {
  transform: translateY(-1px);
  border-color: #8cc0c6;
}

.filter-button.active {
  border-color: #5d9197;
  background: #e4f0f1;
  color: #295055;
}

.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5eeee;
  background: #f8fbfb;
}

.category-toolbar {
  width: 100%;
}

.map-content {
  min-width: 0;
}

.map-field {
  display: grid;
  gap: 8px;
  min-width: 220px;
}

.map-field label {
  font-size: 14px;
  font-weight: 850;
  color: #425f66;
}

.map-field select {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #cfdedf;
  border-radius: 12px;
  background: #fbfdfd;
  color: #314c53;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.map-field select:focus {
  outline: 0;
  border-color: #78a3a7;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(96, 148, 153, 0.12);
}

.district-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
  padding: 4px 0 0;
}

.map-wrapper {
  position: relative;
  min-height: 560px;
}

.kakao-map {
  width: 100%;
  min-height: 560px;
}

.map-placeholder {
  padding: 22px;
  color: #666;
}

.map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  padding: 16px;
  color: #666;
  text-align: center;
}

.info-image img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  display: block;
}

.info-body {
  padding: 8px;
}

@media (max-width: 760px) {
  .map-page,
  .page-heading,
  .map-card {
    width: min(100% - 24px, 1180px);
  }

  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .map-layout {
    grid-template-columns: 1fr;
  }

  .map-sidebar {
    max-height: none;
  }

  .map-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .map-field,
  .district-field {
    min-width: 100%;
  }

  .kakao-map,
  .map-wrapper {
    min-height: 420px;
  }
}
</style>
