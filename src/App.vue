<script setup>
// App acts as router host — individual pages are rendered via `router-view`
import ChatWidget from './components/ChatWidget.vue'
</script>

<template>
  <router-view />
  <ChatWidget />
</template>
