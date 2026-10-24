<script setup lang="ts">
import AiChatbot from '@/components/common/AiChatbot.vue'
</script>

<template>
  <div id="mejaku-app" class="mejaku-app-wrapper">
    <!-- Main View with Page Transition -->
    <RouterView v-slot="{ Component }">
      <Transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Global Interactive AI Chatbot Assistant -->
    <AiChatbot />
  </div>
</template>

<style scoped>
.mejaku-app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
