<script setup lang="ts">
import { HelpCircle, Bot, Sparkles } from 'lucide-vue-next'
import { useChatbotStore } from '@/stores/chatbotStore'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    actionText?: string
    promptContext?: string
  }>(),
  {
    title: 'Butuh bantuan untuk pesananmu?',
    description: 'Tanya KuBot AI untuk rekomendasi menu, panduan bayar, atau panggil pramusaji ke meja Anda.',
    actionText: 'Tanya KuBot AI',
    promptContext: '',
  }
)

const chatbotStore = useChatbotStore()

function handleOpenAiChat() {
  chatbotStore.openChat(props.promptContext || undefined)
}
</script>

<template>
  <div class="help-callout">
    <div class="help-left">
      <div class="help-icon" aria-hidden="true">
        <Bot :size="20" />
      </div>
      <div>
        <div class="help-title">{{ title }}</div>
        <div class="help-desc">{{ description }}</div>
      </div>
    </div>
    <button type="button" class="help-btn" @click="handleOpenAiChat">
      <Sparkles :size="14" />
      <span>{{ actionText }}</span>
    </button>
  </div>
</template>

<style scoped>
.help-callout {
  background-color: var(--surface);
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.help-callout:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 16px rgba(194, 65, 12, 0.06);
}

.help-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.help-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(194, 65, 12, 0.2);
}

.help-title {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-primary);
}

.help-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.help-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #FFFFFF;
  background: var(--primary);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(194, 65, 12, 0.25);
}

.help-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(194, 65, 12, 0.35);
}
</style>
