// services/dataFilter.js
// 질문에 포함된 키워드로 관련 카테고리를 찾고, 해당 JSON 파일을 동적으로 불러와
// 필요한 필드만 추려서(title, addr1, tel) 반환한다.
// (원본 파일은 카테고리당 수백 건이라 통째로 프롬프트에 넣으면 토큰이 너무 커짐)

const categoryKeywords = {
  관광지: ['관광', '명소', '가볼만한', '여행지'],
  숙박: ['숙소', '호텔', '펜션', '잠잘'],
  축제공연행사: ['축제', '행사', '공연', '이벤트'],
  문화시설: ['박물관', '미술관', '전시', '문화'],
  레포츠: ['레포츠', '액티비티', '체험'],
  여행코스: ['코스', '일정', '루트'],
  쇼핑: ['쇼핑', '시장', '아울렛'],
}

// 서울 데이터 7개 파일을 카테고리명 → 동적 import 함수로 매핑
// (다른 권역을 추가하게 되면 이 매핑만 늘리면 됨)
const dataLoaders = {
  관광지: () => import('@/data/서울/서울_관광지.json'),
  숙박: () => import('@/data/서울/서울_숙박.json'),
  축제공연행사: () => import('@/data/서울/서울_축제공연행사.json'),
  문화시설: () => import('@/data/서울/서울_문화시설.json'),
  레포츠: () => import('@/data/서울/서울_레포츠.json'),
  여행코스: () => import('@/data/서울/서울_여행코스.json'),
  쇼핑: () => import('@/data/서울/서울_쇼핑.json'),
}

function simplifyItems(items, limit = 15) {
  return items.slice(0, limit).map((item) => ({
    title: item.title,
    addr: item.addr1,
    tel: item.tel || '정보 없음',
    lat: item.mapy,
    lng: item.mapx,
  }))
}

// question 에 매칭되는 카테고리들의 데이터를 불러와 간단한 형태로 반환
export async function filterRelevantData(question) {
  const matched = Object.entries(categoryKeywords)
    .filter(([, keywords]) => keywords.some((k) => question.includes(k)))
    .map(([category]) => category)

  // 매칭 안 되면 기본값으로 관광지
  const targets = matched.length > 0 ? matched : ['관광지']

  const results = await Promise.all(
    targets.map(async (category) => {
      const loader = dataLoaders[category]
      if (!loader) return { category, items: [] }
      const mod = await loader()
      const items = simplifyItems(mod.default.items ?? [])
      return { category, items }
    })
  )

  return results
}

// 특정 카테고리와 구(예: '강남구')로 필터링해서 좌표를 포함한 항목 반환
export async function filterByCategoryAndDistrict(category = '관광지', district = '', limit = 200) {
  const loader = dataLoaders[category]
  if (!loader) return []
  const mod = await loader()
  const items = mod.default.items ?? []

  // district가 비어있으면 전체 반환, 있으면 addr1에 district 문자열 포함 여부로 필터
  const filtered = district
    ? items.filter((it) => (it.addr1 || '').includes(district))
    : items

  // 변환 및 좌표가 있는 항목만 반환
  const mapped = filtered
    .filter((it) => it.mapx && it.mapy)
    .map((it) => ({
        title: it.title,
        addr: it.addr1,
        tel: it.tel || '정보 없음',
        mapx: Number(it.mapx),
        mapy: Number(it.mapy),
        contentid: it.contentid,
        image: it.firstimage || it.firstimage2 || '',
    }))

  return mapped.slice(0, limit)
}
