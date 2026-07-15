<script setup>
import { ref } from 'vue'

import ChatWidget from '@/components/chatWidget.vue'
import BoardList from '@/components/BoardList.vue'
import BoardDetail from '@/components/BoardDetail.vue'
import BoardForm from '@/components/BoardForm.vue'

const currentView = ref('list')
const selectedPostId = ref(null)
const formMode = ref('create')

function openPost(postId) {
  selectedPostId.value = postId
  currentView.value = 'detail'
}

function openWriteForm() {
  selectedPostId.value = null
  formMode.value = 'create'
  currentView.value = 'form'
}

function openEditForm(postId) {
  selectedPostId.value = postId
  formMode.value = 'edit'
  currentView.value = 'form'
}

function goToList() {
  selectedPostId.value = null
  currentView.value = 'list'
}

function goToDetail(postId) {
  selectedPostId.value = postId
  currentView.value = 'detail'
}
</script>

<template>
  <div id="page-content">
    <BoardList
      v-if="currentView === 'list'"
      @select-post="openPost"
      @write="openWriteForm"
    />

    <BoardDetail
      v-else-if="currentView === 'detail'"
      :post-id="selectedPostId"
      @back="goToList"
      @edit="openEditForm"
      @deleted="goToList"
    />

    <BoardForm
      v-else-if="currentView === 'form'"
      :mode="formMode"
      :post-id="selectedPostId"
      @cancel="
        formMode === 'edit'
          ? goToDetail(selectedPostId)
          : goToList()
      "
      @saved="goToDetail"
    />
  </div>

  <ChatWidget />
</template>