<script setup>
import { ref } from 'vue'
import Main from './views/Main.vue'
import PlayMode from './views/PlayMode.vue'

// 画面遷移の管理
const currentView = ref('main') // 'main' | 'play'

const startGame = () => {
  currentView.value = 'play'
}

const backToMenu = () => {
  currentView.value = 'main'
}
</script>

<template>
  <div class="app-container">
    <transition name="fade" mode="out-in">
      <Main v-if="currentView === 'main'" @start="startGame" />
      <PlayMode v-else @back="backToMenu" />
    </transition>
  </div>
</template>

<style scoped>
/* アプリ全体の共通スタイル（リセット含む） */
body { margin: 0; padding: 0; overflow: hidden; background: #000; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.app-container {
  font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>