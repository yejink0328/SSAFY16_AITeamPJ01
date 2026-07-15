const STORAGE_KEY = 'localhub-seoul-community-posts-v1'

function readPosts() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY)

    if (!savedPosts) {
      return []
    }

    const parsedPosts = JSON.parse(savedPosts)

    return Array.isArray(parsedPosts) ? parsedPosts : []
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

export function createPost({ title, content, password }) {
  const posts = readPosts()
  const now = new Date().toISOString()

  const newPost = {
    id: createId(),
    region: '서울',
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
  { title, content, password },
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