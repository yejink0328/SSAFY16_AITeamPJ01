<template>
  <div class="kakao-map-embed">
    <div ref="mapEl" class="map-el"></div>
    <p v-if="error" class="map-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadKakaoMaps } from '@/services/kakaoMap'

const props = defineProps({
  places: { type: Array, required: true },
  route: { type: Boolean, default: false }, // true면 번호 마커 + 이동 경로 선으로 표시
})

const mapEl = ref(null)
const error = ref('')

function addPlainMarker(kakaoMaps, map, place, position) {
  const marker = new kakaoMaps.Marker({ position, map })
  const infoWindow = new kakaoMaps.InfoWindow({
    content: `<div style="padding:6px 8px;font-size:12px;white-space:nowrap;">${place.title}</div>`,
  })
  kakaoMaps.event.addListener(marker, 'click', () => infoWindow.open(map, marker))
}

function addRouteMarker(kakaoMaps, map, place, position, order) {
  const badge = document.createElement('div')
  badge.textContent = order
  badge.title = place.title
  badge.style.cssText =
    'background:#2563eb;color:#fff;width:22px;height:22px;border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;' +
    'box-shadow:0 1px 3px rgba(0,0,0,0.35);cursor:pointer;'

  new kakaoMaps.CustomOverlay({ position, map, content: badge, yAnchor: 0.5 })
}

onMounted(async () => {
  try {
    const kakaoMaps = await loadKakaoMaps()

    const first = props.places[0]
    const center = new kakaoMaps.LatLng(Number(first.lat), Number(first.lng))
    const map = new kakaoMaps.Map(mapEl.value, { center, level: 6 })

    const bounds = new kakaoMaps.LatLngBounds()
    const path = []

    props.places.forEach((place, i) => {
      const position = new kakaoMaps.LatLng(Number(place.lat), Number(place.lng))
      bounds.extend(position)
      path.push(position)

      if (props.route) {
        addRouteMarker(kakaoMaps, map, place, position, i + 1)
      } else {
        addPlainMarker(kakaoMaps, map, place, position)
      }
    })

    if (props.route && path.length > 1) {
      new kakaoMaps.Polyline({
        map,
        path,
        strokeWeight: 4,
        strokeColor: '#2563eb',
        strokeOpacity: 0.85,
        strokeStyle: 'solid',
      })
    }

    if (props.places.length > 1) {
      map.setBounds(bounds)
    }
  } catch (e) {
    console.error(e)
    error.value = '지도를 불러오지 못했습니다.'
  }
})
</script>

<style scoped>
.kakao-map-embed {
  margin-top: 6px;
  border-radius: 10px;
  overflow: hidden;
}

.map-el {
  width: 100%;
  height: 160px;
}

.map-error {
  font-size: 12px;
  color: #c00;
  padding: 4px 0;
}
</style>
