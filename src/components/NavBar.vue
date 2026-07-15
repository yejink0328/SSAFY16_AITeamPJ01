<template>
  <header class="site-nav">
    <div class="nav-inner">
      <div class="logo">LocalHub</div>
      <nav class="links">
        <a href="#" class="nav-link" @click.prevent="goTo('/')">Community</a>
        <a href="#" class="nav-link" @click.prevent="goTo('/map')">Map</a>
      </nav>
      <div class="current-route">{{ route.path }}</div>
    </div>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'

let router = null
try {
  // useRouter may throw if router is not provided yet; catch and fallback
  // eslint-disable-next-line vue/prefer-use-router
  router = (await import('vue-router')).useRouter()
} catch (e) {
  // ignore — we'll fallback to location.href when router unavailable
  console.warn('NavBar: router not available yet, will fallback to full navigation')
}
const route = useRoute()

function goTo(path) {
  console.log('[NavBar] navigate to', path)
  if (router && router.push) {
    router.push(path).then(() => {
      console.log('[NavBar] navigation succeeded, current:', router.currentRoute.value.fullPath)
    }).catch((err) => {
      console.error('[NavBar] navigation error', err)
      window.alert('Navigation error: ' + (err && err.message ? err.message : String(err)))
    })
  } else {
    // fallback: use full page navigation
    window.location.href = path
  }
}
</script>

<style scoped>
.site-nav { width:100%; background:#fff; border-bottom:1px solid #eee }
.nav-inner { max-width:1180px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:12px 20px }
.logo { font-weight:900; color:#1d4ed8 }
.links { display:flex; gap:12px }
.nav-link { color:#334155; text-decoration:none; font-weight:700 }
.nav-link.router-link-active { color:#1d4ed8 }
</style>
