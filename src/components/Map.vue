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

const categories = ['관광지','숙박','축제공연사','문화시설','레포츠','여행코스','쇼핑']

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
      clusterer = new window.kakao.maps.MarkerClusterer({ map, averageCenter: true, minLevel: 6 })
      // initial load
      applyFilter()
    } catch (err) {
      console.error('Map init error', err)
      throw err
    }
  })
}

async function applyFilter() {
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
    const imgHtml = it.image ? `<div class="info-image"><img src="${it.image}" alt="${it.title}" /></div>` : ''
    const infoHtml = `
      <div class="info-window" style="max-width:260px">
        ${imgHtml}
        <div class="info-body" style="padding:8px">
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
  if (markers.length > 0) map.setCenter(markers[0].getPosition())
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
.map-container { display:flex; flex-direction:column; gap:8px }
.controls { display:flex; gap:8px; align-items:center }
.kakao-map { width:100%; height:560px; }
.map-placeholder { padding:16px; color:#666 }
.
.map-wrapper { position:relative }
.map-overlay {
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(255,255,255,0.9);
  z-index: 10;
  padding: 16px;
  color:#666;
}
.info-image img { width:100%; height:auto; border-radius:6px; display:block }
.info-body { padding: 8px }
label { font-size:14px }
button { padding:6px 10px }
</style>
