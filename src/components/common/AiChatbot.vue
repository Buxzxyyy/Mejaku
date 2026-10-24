<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  MessageSquare,
  Bot,
  Send,
  X,
  Minimize2,
  Sparkles,
  User,
  ExternalLink,
  BellRing,
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
</script>

<template>
  <div class="chatbot-wrapper" aria-label="Asisten AI MejaKu">
    <!-- Floating Trigger Launcher Button (Compact Circular FAB) -->
    <button
      v-if="!chatbotStore.isOpen"
      type="button"
      class="chatbot-launcher-btn"
      aria-label="Buka Chatbot AI Bantuan MejaKu"
      title="Tanya MejaKu Support"
      @click="chatbotStore.toggleChat"
    >
      <Bot :size="24" class="bot-icon" />
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
              <Bot :size="22" />
              <span class="avatar-status-dot" />
            </div>
            <div>
              <div class="chat-title-row">
                <h3 id="chatbot-header-title" class="chat-header-title">
                  MejaKu Support
                </h3>
                <span class="ai-badge">AI</span>
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
              title="Tutup"
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
              <Bot :size="16" />
            </div>

            <div class="msg-bubble-wrap">
              <!-- Message Bubble -->
              <div class="msg-bubble">
                <!-- Simple Markdown-like parser for bold text and line breaks -->
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
                  <ExternalLink :size="14" />
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
              <Bot :size="16" />
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
              placeholder="Tanya MejaKu Support (contoh: Rekomendasi pedas, panggil pramusaji)..."
              class="chat-input"
              @keydown.enter.prevent="handleSend"
            />
            <button
              type="submit"
              class="btn-send"
              :disabled="!inputText.trim()"
              aria-label="Kirim pesan"
            >
              <Send :size="16" />
            </button>
          </form>

          <div class="chat-disclaimer">
            <Sparkles :size="11" />
            <span>Didukung AI cerdas MejaKu · Siap membantu kapan saja</span>
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
}

/* Floating Launcher Button (Compact 52px Circular FAB) */
.chatbot-launcher-btn {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background-color: #2D1A10;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10px 24px rgba(45, 26, 16, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.25);
  transition: all 0.25s var(--ease-spring);
  cursor: pointer;
  padding: 0;
}

.chatbot-launcher-btn:hover {
  background-color: #1A0E08;
  transform: translateY(-3px) scale(1.06);
  box-shadow: 0 14px 30px rgba(45, 26, 16, 0.55);
}

.bot-icon {
  color: #FDFBF7;
}

.online-indicator-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: #22C55E;
  border: 2px solid #2D1A10;
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
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 560px;
  max-height: calc(100vh - 100px);
  background-color: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1.5px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Chat Header (Refined Dark Slate & Espresso Theme) */
.chat-header {
  background: #1E293B;
  color: #FFFFFF;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid #334155;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-avatar-box {
  width: 38px;
  height: 38px;
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
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: #22C55E;
  border: 2px solid #1E293B;
}

.chat-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-header-title {
  font-size: 15px;
  font-weight: 800;
  margin: 0;
  color: #FFFFFF;
}

.ai-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: #F8FAFC;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  letter-spacing: 0.5px;
}

.chat-header-sub {
  font-size: 11px;
  opacity: 0.9;
  display: block;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-action-btn {
  color: #FFFFFF;
  padding: 6px;
  border-radius: var(--radius-full);
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Chat Messages Body */
.chat-messages-body {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #FAF6F0;
}

.message-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.msg-bot {
  align-self: flex-start;
  width: 100%;
}

.msg-user {
  align-self: flex-end;
  flex-direction: row-reverse;
  max-width: 85%;
}

.msg-bot-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  background-color: #F1E9DF;
  color: #1E293B;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 4px;
}

.msg-user-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  background-color: #1E293B;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 4px;
}

.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 82%;
}

.msg-user .msg-bubble-wrap {
  align-items: flex-end;
  max-width: 100%;
}

.msg-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 13.5px;
  line-height: 1.5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
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
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
  padding: 0 4px;
}

.msg-action-wrap {
  margin-top: 8px;
}

.msg-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #F1E9DF;
  color: #1E293B;
  border: 1.5px solid #CBD5E1;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.msg-action-btn:hover {
  background-color: #1E293B;
  color: #FFFFFF;
  transform: translateY(-1px);
}

/* Quick Replies */
.quick-replies-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.quick-reply-chip {
  background-color: #FFFFFF;
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s ease;
  text-align: left;
}

.quick-reply-chip:hover {
  background-color: #F1E9DF;
  border-color: #94A3B8;
  color: #1E293B;
  transform: translateY(-1px);
}

/* Typing Indicator Animation */
.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 12px 18px;
}

.typing-dot {
  width: 7px;
  height: 7px;
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
    transform: translateY(-6px);
  }
}

/* Chat Input Footer */
.chat-input-footer {
  padding: 14px 18px;
  background-color: #FFFFFF;
  border-top: 1px solid var(--border);
}

.chat-form {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #FAF6F0;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 4px 6px 4px 16px;
  transition: border-color 0.2s ease;
}

.chat-form:focus-within {
  border-color: #1E293B;
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
}

.btn-send {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background-color: #1E293B;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  background-color: #0F172A;
  transform: scale(1.05);
}

.btn-send:disabled {
  background-color: #CBD5E1;
  cursor: not-allowed;
}

.chat-disclaimer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 8px;
}

/* Drawer Transitions - Polished open/close animation */
.chat-slide-enter-active {
  animation: chatOpen 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.chat-slide-leave-active {
  animation: chatClose 0.22s cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes chatOpen {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.88);
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
    transform: translateY(16px) scale(0.9);
    transform-origin: bottom right;
  }
}
</style>
