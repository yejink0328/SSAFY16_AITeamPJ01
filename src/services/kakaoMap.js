// services/kakaoMap.js
// 카카오맵 JS SDK를 필요할 때 한 번만 동적으로 로드한다.

let loadPromise = null

export function loadKakaoMaps() {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve(window.kakao.maps)
      return
    }

    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!appKey) {
      reject(new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao.maps))
    script.onerror = () => reject(new Error('카카오맵 SDK 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })

  return loadPromise
}
