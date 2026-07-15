<script setup>
import {
  nextTick,
  ref,
  watch,
} from 'vue'

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
  const raw = String(password.value || '')
  const trimmed = raw.trim()
  if (!trimmed) {
    return
  }

  emit('confirm', trimmed)
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
        :aria-label="
          action === 'delete'
            ? '게시글 삭제'
            : '게시글 수정'
        "
      >
        <button
          type="button"
          class="modal-close"
          aria-label="닫기"
          @click="closeModal"
        >
          ×
        </button>

        <div
          class="modal-icon"
          :class="{
            'modal-icon--danger':
              action === 'delete',
          }"
        >
          {{ action === 'delete' ? '🗑️' : '🔐' }}
        </div>

        <div class="modal-header">
          <p>
            {{
              action === 'delete'
                ? 'DELETE POST'
                : 'EDIT POST'
            }}
          </p>

          <h2>
            {{
              action === 'delete'
                ? '게시글을 삭제할까요?'
                : '게시글을 수정할까요?'
            }}
          </h2>
        </div>

        <p class="modal-description">
          작성할 때 입력한 비밀번호를 입력해주세요.
          비밀번호가 일치해야 작업을 진행할 수 있습니다.
        </p>

        <form @submit.prevent="confirmPassword">
          <label for="board-password">
            수정·삭제 비밀번호
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
            ⚠ {{ errorMessage }}
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
              :class="{
                'primary-button--danger':
                  action === 'delete',
              }"
              :disabled="!password"
            >
              {{
                action === 'delete'
                  ? '삭제 계속하기'
                  : '확인'
              }}
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
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(6px);
}

.password-modal {
  position: relative;
  width: min(100%, 450px);
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.32);
  animation: modal-open 0.2s ease-out;
}

@keyframes modal-open {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 23px;
  cursor: pointer;
}

.modal-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 18px;
  background: #eff6ff;
  font-size: 27px;
}

.modal-icon--danger {
  background: #fef2f2;
}

.modal-header {
  margin-top: 22px;
}

.modal-header p {
  margin: 0;
  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.11em;
}

.modal-header h2 {
  margin: 6px 0 0;
  color: #172033;
  font-size: 25px;
  letter-spacing: -0.03em;
}

.modal-description {
  margin: 14px 0 22px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.password-modal label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 900;
}

.password-modal input {
  width: 100%;
  height: 49px;
  padding: 0 14px;
  border: 1px solid #dbe3eb;
  border-radius: 12px;
  box-sizing: border-box;
  font: inherit;
}

.password-modal input:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.error-message {
  margin: 10px 0 0;
  color: #dc2626;
  font-size: 13px;
}

.modal-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 26px;
}

.primary-button,
.secondary-button {
  min-height: 46px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.primary-button--danger {
  border-color: #dc2626;
  background: #dc2626;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.secondary-button {
  border: 1px solid #d7dee7;
  background: #ffffff;
  color: #475569;
}
</style>