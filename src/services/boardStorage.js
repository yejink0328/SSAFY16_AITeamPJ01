const STORAGE_KEY = 'localhub-seoul-community-posts-v1'

const DEFAULT_POSTS = [
  {
    id: 'sample-1',
    region: '서울',
    category: '맛집',
    title: '성수동에서 조용히 식사하기 좋은 곳 추천해주세요',
    content:
      '주말에 성수동에 방문할 예정입니다.\n웨이팅이 너무 길지 않고 조용하게 식사할 수 있는 장소가 있다면 추천해주세요!',
    password: '1234',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    viewCount: 38,
  },
  {
    id: 'sample-2',
    region: '서울',
    category: '축제',
    title: '이번 주말 서울에서 열리는 축제 정보 공유합니다',
    content:
      '이번 주말 한강공원과 광화문 일대에서 여러 행사가 열린다고 합니다.\n방문 전에 공식 일정을 확인해보세요.',
    password: '1234',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    viewCount: 82,
  },
  {
    id: 'sample-3',
    region: '서울',
    category: '교통',
    title: '서울역에서 경복궁까지 편하게 이동하는 방법',
    content:
      '짐이 많다면 지하철보다 버스를 이용하는 것도 괜찮습니다.\n출퇴근 시간에는 이동 시간이 길어질 수 있으니 참고해주세요.',
    password: '1234',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    viewCount: 55,
  },
]

function normalizePost(post) {
  return {
    ...post,
    region: post.region || '서울',
    category: post.category || '자유',
    viewCount: Number(post.viewCount ?? 0),
  }
}

function readPosts() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY)

    if (!savedPosts) {
      savePosts(DEFAULT_POSTS)
      return DEFAULT_POSTS.map(normalizePost)
    }

    const parsedPosts = JSON.parse(savedPosts)

    if (!Array.isArray(parsedPosts)) {
      return []
    }

    return parsedPosts.map(normalizePost)
  } catch (error) {
    console.error('게시글을 불러오지 못했습니다.', error)
    return []
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getPosts() {
  return readPosts().sort(
    (firstPost, secondPost) =>
      new Date(secondPost.createdAt).getTime() -
      new Date(firstPost.createdAt).getTime(),
  )
}

export function getPostById(postId) {
  return (
    readPosts().find(
      (post) => String(post.id) === String(postId),
    ) ?? null
  )
}

export function createPost({
  title,
  content,
  password,
  category,
}) {
  const posts = readPosts()
  const now = new Date().toISOString()

  const newPost = {
    id: createId(),
    region: '서울',
    category: category || '자유',
    title: title.trim(),
    content: content.trim(),
    password,
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
  }

  posts.push(newPost)
  savePosts(posts)

  return newPost
}

export function updatePost(
  postId,
  {
    title,
    content,
    password,
    category,
  },
) {
  const posts = readPosts()

  const postIndex = posts.findIndex(
    (post) => String(post.id) === String(postId),
  )

  if (postIndex === -1) {
    throw new Error('게시글을 찾을 수 없습니다.')
  }

  if (posts[postIndex].password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.')
  }

  posts[postIndex] = {
    ...posts[postIndex],
    region: '서울',
    category: category || '자유',
    title: title.trim(),
    content: content.trim(),
    updatedAt: new Date().toISOString(),
  }

  savePosts(posts)

  return posts[postIndex]
}

export function deletePost(postId, password) {
  const posts = readPosts()

  const selectedPost = posts.find(
    (post) => String(post.id) === String(postId),
  )

  if (!selectedPost) {
    throw new Error('게시글을 찾을 수 없습니다.')
  }

  if (selectedPost.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.')
  }

  const remainingPosts = posts.filter(
    (post) => String(post.id) !== String(postId),
  )

  savePosts(remainingPosts)
}

export function verifyPassword(postId, password) {
  const selectedPost = getPostById(postId)

  return Boolean(
    selectedPost &&
    selectedPost.password === password,
  )
}

export function increaseViewCount(postId) {
  const posts = readPosts()

  const postIndex = posts.findIndex(
    (post) => String(post.id) === String(postId),
  )

  if (postIndex === -1) {
    return null
  }

  posts[postIndex].viewCount =
    Number(posts[postIndex].viewCount ?? 0) + 1

  savePosts(posts)

  return posts[postIndex]
}
