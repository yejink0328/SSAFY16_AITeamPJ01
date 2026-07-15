<script setup>
// App acts as router host — individual pages are rendered via `router-view`
import ChatWidget from './components/ChatWidget.vue'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <NavBar />
  <router-view />
  <ChatWidget />
</template>
