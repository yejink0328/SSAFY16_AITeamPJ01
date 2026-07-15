const STORAGE_KEY = 'localhub-seoul-community-posts-v1'

function normalizeComment(comment) {
  return {
    id: comment?.id ?? createId(),
    author: String(comment?.author ?? '익명').trim() || '익명',
    content: String(comment?.content ?? '').trim(),
    createdAt: comment?.createdAt ?? new Date().toISOString(),
  }
}

function normalizePost(post) {
  return {
    ...post,
    region: post?.region ?? '서울',
    viewCount: Number(post?.viewCount ?? 0),
    likeCount: Number(post?.likeCount ?? 0),
    comments: Array.isArray(post?.comments)
      ? post.comments.map(normalizeComment)
      : [],
  }
}

function readPosts() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY)

    if (!savedPosts) {
      return []
    }

    const parsedPosts = JSON.parse(savedPosts)

    return Array.isArray(parsedPosts)
      ? parsedPosts.map(normalizePost)
      : []
  } catch (error) {
    console.error('게시글을 불러오지 못했습니다.', error)
    return []
  }
}

function savePosts(posts) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(posts.map(normalizePost)),
  )
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function findPostIndex(posts, postId) {
  return posts.findIndex(
    (post) => String(post.id) === String(postId),
  )
}

export function getPosts() {
  return [...readPosts()].sort(
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
    likeCount: 0,
    comments: [],
  }

  posts.push(newPost)
  savePosts(posts)

  return normalizePost(newPost)
}

export function updatePost(
  postId,
  { title, content, password },
) {
  const posts = readPosts()
  const postIndex = findPostIndex(posts, postId)

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

  return normalizePost(posts[postIndex])
}

export function deletePost(postId, password) {
  const posts = readPosts()
  const postIndex = findPostIndex(posts, postId)

  if (postIndex === -1) {
    throw new Error('게시글을 찾을 수 없습니다.')
  }

  if (posts[postIndex].password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.')
  }

  posts.splice(postIndex, 1)
  savePosts(posts)
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
  const postIndex = findPostIndex(posts, postId)

  if (postIndex === -1) {
    return null
  }

  posts[postIndex].viewCount += 1
  savePosts(posts)

  return normalizePost(posts[postIndex])
}

export function increaseLikeCount(postId) {
  const posts = readPosts()
  const postIndex = findPostIndex(posts, postId)

  if (postIndex === -1) {
    throw new Error('게시글을 찾을 수 없습니다.')
  }

  posts[postIndex].likeCount += 1
  savePosts(posts)

  return normalizePost(posts[postIndex])
}

export function addComment(postId, { author, content }) {
  const posts = readPosts()
  const postIndex = findPostIndex(posts, postId)

  if (postIndex === -1) {
    throw new Error('게시글을 찾을 수 없습니다.')
  }

  const trimmedContent = String(content ?? '').trim()

  if (!trimmedContent) {
    throw new Error('댓글 내용을 입력해주세요.')
  }

  const newComment = normalizeComment({
    id: createId(),
    author: String(author ?? '').trim() || '익명',
    content: trimmedContent,
    createdAt: new Date().toISOString(),
  })

  posts[postIndex].comments.push(newComment)
  savePosts(posts)

  return newComment
}
