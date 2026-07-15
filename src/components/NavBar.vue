<template>
  <header class="site-nav">
    <div class="nav-inner">
      <div class="logo">LocalHub</div>
      <nav class="links">
        <a href="#" class="nav-link" @click.prevent="goTo('/')">Community</a>
        <a href="#" class="nav-link" @click.prevent="goTo('/map')">Map</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(path) {
  router.push(path).catch(() => {})
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
