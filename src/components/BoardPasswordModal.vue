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
const openCycle = ref(0)

async function resetAndFocus() {
  password.value = ''
  openCycle.value += 1
  await nextTick()
  passwordInput.value?.focus()
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await resetAndFocus()
    } else {
      password.value = ''
    }
  },
  { immediate: true },
)

watch(
  () => props.action,
  async () => {
    if (props.open) {
      await resetAndFocus()
    }
  },
)

function closeModal() {
  password.value = ''
  emit('close')
}

function confirmPassword() {
  const enteredPassword = password.value

  if (!enteredPassword) {
    passwordInput.value?.focus()
    return
  }

  emit('confirm', enteredPassword)
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
        aria-labelledby="password-modal-title"
      >
        <div class="modal-header">
          <div>
            <p>LOCALHUB PASSWORD</p>
            <h2 id="password-modal-title">
              {{ action === 'delete' ? '게시글 삭제' : '게시글 수정' }}
            </h2>
          </div>

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
          작성할 때 입력한 비밀번호를 입력해주세요.
          확인 후 {{ action === 'delete' ? '삭제' : '수정 화면으로 이동' }}합니다.
        </p>

        <form
          :key="openCycle"
          autocomplete="off"
          @submit.prevent="confirmPassword"
        >
          <label for="board-password">
            비밀번호
          </label>

          <input
            id="board-password"
            ref="passwordInput"
            v-model="password"
            type="password"
            maxlength="30"
            autocomplete="new-password"
            name="localhub-board-password-check"
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
              :class="{ danger: action === 'delete' }"
            >
              {{ action === 'delete' ? '삭제 확인' : '수정 확인' }}
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
  padding: 20px;
  place-items: center;
  background: rgba(27, 48, 54, 0.48);
  backdrop-filter: blur(7px);
  animation: backdropIn 0.2s ease both;
}

.password-modal {
  width: min(100%, 430px);
  padding: 26px;
  border: 1px solid rgba(213, 229, 230, 0.9);
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 28px 80px rgba(24, 57, 63, 0.22);
  animation: modalIn 0.24s ease both;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.modal-header p {
  margin: 0 0 5px;
  color: #689197;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.modal-header h2 {
  margin: 0;
  color: #294b51;
  font-size: 23px;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: #f0f6f6;
  color: #71868c;
  font-size: 25px;
  cursor: pointer;
}

.modal-description {
  margin: 17px 0 21px;
  color: #71858c;
  line-height: 1.7;
}

.password-modal label {
  display: block;
  margin-bottom: 8px;
  color: #425f66;
  font-weight: 850;
}

.password-modal input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #cbdcdc;
  border-radius: 12px;
  color: #314d54;
}

.password-modal input:focus {
  border-color: #75a2a6;
  outline: 0;
  box-shadow: 0 0 0 4px rgba(96, 148, 153, 0.13);
}

.error-message {
  margin: 10px 0 0;
  color: #b75e59;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 23px;
}

.primary-button,
.secondary-button {
  min-height: 43px;
  padding: 0 18px;
  border-radius: 11px;
  font-weight: 850;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #5d9197;
  background: #5d9197;
  color: #fff;
}

.primary-button.danger {
  border-color: #b97772;
  background: #b97772;
}

.secondary-button {
  border: 1px solid #d1dfe0;
  background: #fff;
  color: #5a7177;
}

@keyframes backdropIn {
  from { opacity: 0; }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
}
</style>
