<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  action: {
    type: String,
    default: 'edit',
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'confirm'])

const password = ref('')
const passwordInput = ref(null)

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      return
    }

    password.value = ''

    await nextTick()
    passwordInput.value?.focus()
  },
)

function closeModal() {
  emit('close')
}

function confirmPassword() {
  if (!password.value) {
    return
  }

  emit('confirm', password.value)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop"
      @click.self="closeModal"
    >
      <section
        class="password-modal"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-header">
          <h2>
            {{ action === 'delete' ? '게시글 삭제' : '게시글 수정' }}
          </h2>

          <button
            type="button"
            class="modal-close"
            aria-label="닫기"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <p class="modal-description">
          작성할 때 입력한 수정용 비밀번호를 입력해주세요.
        </p>

        <form @submit.prevent="confirmPassword">
          <label for="board-password">
            수정용 비밀번호
          </label>

          <input
            id="board-password"
            ref="passwordInput"
            v-model="password"
            type="password"
            maxlength="30"
            autocomplete="current-password"
            placeholder="비밀번호 입력"
          />

          <p
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </p>

          <div class="modal-buttons">
            <button
              type="button"
              class="secondary-button"
              @click="closeModal"
            >
              취소
            </button>

            <button
              type="submit"
              class="primary-button"
              :disabled="!password"
            >
              확인
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
}

.password-modal {
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  color: #172033;
  font-size: 22px;
}

.modal-close {
  border: 0;
  background: transparent;
  color: #667085;
  font-size: 28px;
  cursor: pointer;
}

.modal-description {
  margin: 14px 0 18px;
  color: #667085;
  line-height: 1.6;
}

.password-modal label {
  display: block;
  margin-bottom: 8px;
  color: #344054;
  font-weight: 800;
}

.password-modal input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #d0d5dd;
  border-radius: 10px;
  box-sizing: border-box;
}

.password-modal input:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.error-message {
  margin: 10px 0 0;
  color: #d92d20;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  padding: 0 17px;
  border-radius: 9px;
  font-weight: 800;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.secondary-button {
  border: 1px solid #d0d5dd;
  background: #ffffff;
  color: #344054;
}
</style>