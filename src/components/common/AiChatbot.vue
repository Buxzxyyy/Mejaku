<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bot,
  Send,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-vue-next'
import { useChatbotStore } from '@/stores/chatbotStore'

const router = useRouter()
const chatbotStore = useChatbotStore()

const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>()

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(
  () => chatbotStore.messages.length,
  () => {
    scrollToBottom()
  }
)

watch(
  () => chatbotStore.isTyping,
  () => {
    scrollToBottom()
  }
)

function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  chatbotStore.sendMessage(text)
  inputText.value = ''
  scrollToBottom()
}

function handleQuickReply(replyText: string) {
  chatbotStore.sendMessage(replyText)
  scrollToBottom()
}

function handleAction(url?: string) {
  if (url) {
    chatbotStore.closeChat()
    router.push(url)
  }
}

// ─── DRAGGABLE LAUNCHER SYSTEM ───
const launcherPos = ref<{ x: number | null; y: number | null }>({ x: null, y: null })
const isDragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let initialLeft = 0
let initialTop = 0
let hasMoved = false

const launcherStyle = computed(() => {
  if (launcherPos.value.x !== null && launcherPos.value.y !== null) {
    return {
      left: `${launcherPos.value.x}px`,
      top: `${launcherPos.value.y}px`,
      right: 'auto',
      bottom: 'auto',
    }
  }
  return {}
})

function onPointerDown(e: PointerEvent) {
  // Only primary mouse click or touch
  if (e.button !== 0) return
  const target = e.currentTarget as HTMLElement
  try {
    target.setPointerCapture(e.pointerId)
  } catch (_) {
    // ignore
  }

  const rect = target.getBoundingClientRect()
  dragStartX = e.clientX
  dragStartY = e.clientY
  initialLeft = rect.left
  initialTop = rect.top
  hasMoved = false
  isDragging.value = true
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY

  if (!hasMoved && Math.hypot(deltaX, deltaY) > 5) {
    hasMoved = true
  }

  if (hasMoved) {
    const btnSize = 54
    const pad = 12
    const minX = pad
    const maxX = Math.max(pad, window.innerWidth - btnSize - pad)
    const minY = pad
    const maxY = Math.max(pad, window.innerHeight - btnSize - pad)

    const newX = Math.min(Math.max(initialLeft + deltaX, minX), maxX)
    const newY = Math.min(Math.max(initialTop + deltaY, minY), maxY)

    launcherPos.value = { x: newX, y: newY }
  }
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging.value) return
  const target = e.currentTarget as HTMLElement
  try {
    target.releasePointerCapture(e.pointerId)
  } catch (_) {
    // ignore
  }
  isDragging.value = false

  if (!hasMoved) {
    // Clean tap/click without drag
    chatbotStore.toggleChat()
  }
}
</script>

<template>
  <div class="chatbot-wrapper" aria-label="Asisten AI MejaKu">
    <!-- Floating Trigger Launcher Button (Draggable) -->
    <button
      v-if="!chatbotStore.isOpen"
      type="button"
      class="chatbot-launcher-btn"
      :class="{ 'is-dragging': isDragging }"
      :style="launcherStyle"
      aria-label="Buka Chatbot AI Bantuan MejaKu (Dapat digeser)"
      title="Tanya MejaKu Support · Tahan & geser untuk memindahkan posisi"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <Bot :size="22" class="bot-icon" />
      <span class="online-indicator-dot" />

      <span v-if="chatbotStore.unreadCount > 0" class="launcher-badge">
        {{ chatbotStore.unreadCount }}
      </span>
    </button>

    <!-- Chatbot Window Drawer -->
    <Transition name="chat-slide">
      <div
        v-if="chatbotStore.isOpen"
        class="chatbot-window card-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-header-title"
      >
        <!-- Window Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar-box">
              <Bot :size="20" />
              <span class="avatar-status-dot" />
            </div>
            <div class="chat-header-titles">
              <div class="chat-title-row">
                <h3 id="chatbot-header-title" class="chat-header-title">
                  MejaKu Support
                </h3>
                <span class="ai-badge">AI</span>
                <span class="chat-table-tag">Meja {{ chatbotStore.currentTable }}</span>
              </div>
              <span class="chat-header-sub">
                Aktif melayani · Siap membantu Anda
              </span>
            </div>
          </div>

          <div class="chat-header-actions">
            <button
              type="button"
              class="chat-action-btn"
              title="Tutup chat"
              aria-label="Tutup chat"
              @click="chatbotStore.closeChat"
            >
              <X :size="18" />
            </button>
          </div>
        </div>

        <!-- Messages Body -->
        <div ref="messagesContainer" class="chat-messages-body">
          <div
            v-for="msg in chatbotStore.messages"
            :key="msg.id"
            class="message-row"
            :class="[`msg-${msg.sender}`]"
          >
            <!-- Bot Avatar for bot messages -->
            <div v-if="msg.sender === 'bot'" class="msg-bot-avatar">
              <Bot :size="14" />
            </div>

            <div class="msg-bubble-wrap">
              <!-- Message Bubble -->
              <div class="msg-bubble">
                <p
                  class="msg-text"
                  v-html="
                    msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                  "
                />
              </div>

              <!-- Message Timestamp -->
              <span class="msg-time">{{ msg.timestamp }}</span>

              <!-- Action Link Button if message has an actionable CTA -->
              <div v-if="msg.action" class="msg-action-wrap">
                <button
                  type="button"
                  class="msg-action-btn"
                  @click="handleAction(msg.action.url)"
                >
                  <ExternalLink :size="13" />
                  <span>{{ msg.action.label }}</span>
                </button>
              </div>

              <!-- Quick Reply Chips -->
              <div
                v-if="msg.quickReplies && msg.quickReplies.length > 0"
                class="quick-replies-wrap"
              >
                <button
                  v-for="(reply, rIdx) in msg.quickReplies"
                  :key="rIdx"
                  type="button"
                  class="quick-reply-chip"
                  @click="handleQuickReply(reply)"
                >
                  <span>{{ reply }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="chatbotStore.isTyping" class="message-row msg-bot">
            <div class="msg-bot-avatar">
              <Bot :size="14" />
            </div>
            <div class="msg-bubble typing-bubble">
              <span class="typing-dot" />
              <span class="typing-dot" />
              <span class="typing-dot" />
            </div>
          </div>
        </div>

        <!-- Chat Input Footer -->
        <div class="chat-input-footer">
          <form class="chat-form" @submit.prevent="handleSend">
            <input
              v-model="inputText"
              type="text"
              placeholder="Tanya MejaKu Support..."
              maxlength="200"
              class="chat-input"
              @keydown.enter.prevent="handleSend"
            />
            <button
              type="submit"
              class="btn-send"
              :disabled="!inputText.trim()"
              aria-label="Kirim pesan"
            >
              <Send :size="15" />
            </button>
          </form>

          <div class="chat-disclaimer">
            <Sparkles :size="11" />
            <span>AI cerdas MejaKu · Terhubung langsung dengan mejamu</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

/* Floating Launcher Button (Draggable) */
.chatbot-launcher-btn {
  pointer-events: auto;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background-color: #1E293B;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 24px;
  right: 24px;
  box-shadow: 0 10px 24px rgba(30, 41, 59, 0.35), 0 2px 8px rgba(0, 0, 0, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.25);
  transition: transform 0.2s var(--ease-spring), box-shadow 0.2s ease, background-color 0.2s ease;
  cursor: grab;
  padding: 0;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.chatbot-launcher-btn:hover {
  background-color: #0F172A;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 14px 30px rgba(30, 41, 59, 0.45);
}

.chatbot-launcher-btn.is-dragging {
  cursor: grabbing !important;
  transform: scale(1.1) !important;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.5) !important;
  transition: none !important;
}

.chatbot-window {
  pointer-events: auto;
}

.bot-icon {
  color: #F8FAFC;
}

.online-indicator-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: #22C55E;
  border: 2px solid #1E293B;
}

.launcher-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 800;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* Chatbot Window */
.chatbot-window {
  width: 375px;
  max-width: calc(100vw - 32px);
  height: 540px;
  max-height: calc(100vh - 100px);
  background-color: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.2), 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Chat Header */
.chat-header {
  background: #1E293B;
  color: #FFFFFF;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid #334155;
  gap: 10px;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.chat-avatar-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: #334155;
  color: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.avatar-status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border-radius: var(--radius-full);
  background-color: #22C55E;
  border: 2px solid #1E293B;
}

.chat-header-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.chat-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chat-header-title {
  font-size: 14.5px;
  font-weight: 800;
  margin: 0;
  color: #FFFFFF;
  white-space: nowrap;
}

.ai-badge {
  background-color: rgba(255, 255, 255, 0.18);
  color: #F8FAFC;
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: var(--radius-full);
  letter-spacing: 0.5px;
}

.chat-table-tag {
  background-color: rgba(34, 197, 94, 0.18);
  color: #86EFAC;
  border: 1px solid rgba(134, 239, 172, 0.35);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.chat-header-sub {
  font-size: 11px;
  color: #CBD5E1;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-header-actions {
  display: flex;
  align-items: center;
}

.chat-action-btn {
  color: #94A3B8;
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.chat-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
}

/* Chat Messages Body */
.chat-messages-body {
  flex: 1;
  padding: 14px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: #FAF6F0;
  scrollbar-width: thin;
  scrollbar-color: rgba(30, 41, 59, 0.18) transparent;
}

.chat-messages-body::-webkit-scrollbar {
  width: 5px;
}

.chat-messages-body::-webkit-scrollbar-thumb {
  background-color: rgba(30, 41, 59, 0.2);
  border-radius: 99px;
}

.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.msg-bot {
  align-self: flex-start;
  width: 100%;
}

.msg-user {
  align-self: flex-end;
  flex-direction: row-reverse;
  max-width: 88%;
}

.msg-bot-avatar {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background-color: #E2D9CF;
  color: #1E293B;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 3px;
}

.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.msg-user .msg-bubble-wrap {
  align-items: flex-end;
  max-width: 100%;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.msg-bot .msg-bubble {
  background-color: #FFFFFF;
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.msg-user .msg-bubble {
  background-color: #1E293B;
  color: #FFFFFF;
  border-bottom-right-radius: 4px;
}

.msg-text {
  margin: 0;
  word-break: break-word;
}

.msg-time {
  font-size: 9.5px;
  color: var(--text-muted);
  margin-top: 3px;
  padding: 0 3px;
}

.msg-action-wrap {
  margin-top: 8px;
}

.msg-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary);
  color: #FFFFFF;
  border: none;
  padding: 7px 14px;
  border-radius: var(--radius-full);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(194, 65, 12, 0.25);
  transition: all 0.2s ease;
}

.msg-action-btn:hover {
  background-color: #A3360A;
  transform: translateY(-1px);
}

/* Quick Replies */
.quick-replies-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.quick-reply-chip {
  background-color: #FFFFFF;
  border: 1.5px solid #E2D9CF;
  color: var(--text-primary);
  padding: 6px 11px;
  border-radius: var(--radius-full);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.35;
  transition: all 0.15s ease;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.quick-reply-chip:hover {
  background-color: #F8EFE4;
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

/* Typing Indicator Animation */
.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: #1E293B;
  animation: typingBounce 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

/* Chat Input Footer */
.chat-input-footer {
  padding: 12px 14px;
  background-color: #FFFFFF;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.chat-form {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #FAF6F0;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 3px 5px 3px 14px;
  transition: border-color 0.2s ease;
}

.chat-form:focus-within {
  border-color: #1E293B;
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 12.5px;
  color: var(--text-primary);
  outline: none;
  min-width: 0;
}

.chat-input::placeholder {
  color: #94A3B8;
  font-size: 12px;
}

.btn-send {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: #1E293B;
  color: #FFFFFF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
  cursor: pointer;
}

.btn-send:hover:not(:disabled) {
  background-color: #0F172A;
  transform: scale(1.06);
}

.btn-send:disabled {
  background-color: #CBD5E1;
  cursor: not-allowed;
  opacity: 0.7;
}

.chat-disclaimer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* Drawer Transitions */
.chat-slide-enter-active {
  animation: chatOpen 0.28s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.chat-slide-leave-active {
  animation: chatClose 0.2s cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes chatOpen {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.92);
    transform-origin: bottom right;
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    transform-origin: bottom right;
  }
}

@keyframes chatClose {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
    transform-origin: bottom right;
  }
  to {
    opacity: 0;
    transform: translateY(14px) scale(0.94);
    transform-origin: bottom right;
  }
}

/* ==================== RESPONSIVE DESIGN ==================== */

/* Tablet (641px - 900px) */
@media (max-width: 900px) and (min-width: 641px) {
  .chatbot-wrapper {
    bottom: 20px;
    right: 20px;
  }

  .chatbot-window {
    width: 350px;
    height: 500px;
    max-height: calc(100vh - 90px);
  }

  .chatbot-launcher-btn {
    width: 48px;
    height: 48px;
  }
}

/* Mobile (≤ 640px) */
@media (max-width: 640px) {
  .chatbot-wrapper {
    bottom: 12px;
    right: 12px;
    left: 12px;
    align-items: stretch;
  }

  .chatbot-launcher-btn {
    align-self: flex-end;
    width: 46px;
    height: 46px;
  }

  .chatbot-window {
    width: 100%;
    max-width: 100%;
    height: min(500px, calc(100vh - 80px));
    border-radius: 18px;
  }

  .chat-header {
    padding: 12px 14px;
  }

  .chat-header-title {
    font-size: 13.5px;
  }

  .chat-messages-body {
    padding: 12px 10px;
    gap: 12px;
  }

  .msg-bubble-wrap {
    max-width: 90%;
  }

  .msg-bubble {
    padding: 9px 12px;
    font-size: 12.5px;
  }

  .quick-reply-chip {
    padding: 5px 9px;
    font-size: 11px;
  }

  .chat-input-footer {
    padding: 10px 12px;
  }

  .chat-input {
    font-size: 12px;
  }

  .chat-input::placeholder {
    font-size: 11.5px;
  }

  .btn-send {
    width: 30px;
    height: 30px;
  }

  .chat-disclaimer {
    font-size: 9px;
    margin-top: 4px;
  }
}

/* Ultra Compact Mobile (≤ 380px) */
@media (max-width: 380px) {
  .chat-title-row {
    gap: 4px;
  }

  .chat-header-title {
    font-size: 13px;
  }

  .chat-table-tag {
    font-size: 9px;
    padding: 1px 5px;
  }

  .quick-reply-chip {
    font-size: 10.5px;
    padding: 4px 8px;
  }
}
</style>
