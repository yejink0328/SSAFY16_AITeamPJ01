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
        <label>구 입력 (예: 강남구)
          <input v-model="district" placeholder="예: 종로구" />
        </label>
        <button @click="applyFilter">적용</button>
      </div>

      <div ref="mapEl" class="kakao-map" />
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

const categories = ['관광지','숙박','축제공연행사','문화시설','레포츠','여행코스','쇼핑']

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
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function initMap(key) {
  await loadKakaoScript(key)
  window.kakao.maps.load(() => {
    const center = new window.kakao.maps.LatLng(37.566826, 126.978656)
    map = new window.kakao.maps.Map(mapEl.value, { center, level: 8 })
    clusterer = new window.kakao.maps.MarkerClusterer({ map, averageCenter: true, minLevel: 6 })
    // initial load
    applyFilter()
  })
}

async function applyFilter() {
  if (!map) return
  // clear existing markers
  markers.forEach((m) => m.setMap(null))
  markers = []
  if (clusterer && clusterer.clear) clusterer.clear()

  const items = await filterByCategoryAndDistrict(category.value, district.value, 500)
  const kakao = window.kakao
  const markerList = items.map((it) => {
    const position = new kakao.maps.LatLng(it.mapy, it.mapx)
    const marker = new kakao.maps.Marker({ position })
    const infowindow = new kakao.maps.InfoWindow({
      content: `<div style="padding:8px;max-width:200px"><strong>${it.title}</strong><div>${it.addr}</div><div>${it.tel}</div></div>`,
    })
    marker.addListener('click', () => infowindow.open(map, marker))
    return marker
  })

  markers = markerList
  if (clusterer && clusterer.addMarkers) clusterer.addMarkers(markers)
  if (markers.length > 0) map.setCenter(markers[0].getPosition())
}

onMounted(() => {
  if (!effectiveKey) {
    console.warn('Map.vue: apiKey not provided — map will not load')
    return
  }
  initMap(effectiveKey).catch((e) => console.error('Kakao load error', e))
})

onBeforeUnmount(() => {
  markers.forEach((m) => m.setMap(null))
  if (clusterer && clusterer.clear) clusterer.clear()
})
</script>

<style scoped>
.map-container { display:flex; flex-direction:column; gap:8px }
.controls { display:flex; gap:8px; align-items:center }
.kakao-map { width:100%; height:560px; }
.map-placeholder { padding:16px; color:#666 }
label { font-size:14px }
button { padding:6px 10px }
</style>
