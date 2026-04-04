<script setup>
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  tetris: Object,
  settings: Object,
  gameState: String
})

const emit = defineEmits(['lock', 'place'])

let dropTimer = null

const startDropTimer = () => {
  if (dropTimer) clearInterval(dropTimer)
  if (props.gameState !== 'playing') return
  const ms = Math.max(props.settings.dropIntervalSec, 0.05) * 1000
  dropTimer = setInterval(() => {
    if (!props.tetris.move(0, 1)) emit('lock')
  }, ms)
}

const handleKeyDown = (e) => {
  if (props.gameState !== 'playing') return
  switch (e.key) {
    case 'ArrowLeft':  props.tetris.move(-1, 0); break
    case 'ArrowRight': props.tetris.move(1, 0); break
    case 'ArrowDown':  if (!props.tetris.move(0, 1)) emit('lock'); break
    case 'ArrowUp':    props.tetris.rotate(); break
    case ' ':          while(props.tetris.move(0, 1)) {}; emit('lock'); break
  }
}

const onBoardClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const colWidth = rect.width / props.tetris.COLS
  emit('place', Math.floor(x / colWidth))
}

watch(() => [props.gameState, props.settings.dropIntervalSec], startDropTimer, { immediate: true })

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  clearInterval(dropTimer)
})
</script>

<template>
  <div class="board-canvas" @click="onBoardClick">
    <div class="death-line" :style="{ top: (settings.deadLineRows * 30) + 'px' }"></div>
    <div v-for="(row, y) in tetris.board.value" :key="y" class="grid-row">
      <div v-for="(cell, x) in row" :key="x" class="grid-cell">
        <div v-if="cell" class="block fixed" :style="{ backgroundColor: cell }"></div>
        <div v-if="tetris.currentMino.value && y >= tetris.ghostY.value && y < tetris.ghostY.value + tetris.currentMino.value.shape.length &&
             x >= tetris.minoPos.x && x < tetris.minoPos.x + tetris.currentMino.value.shape[0].length &&
             tetris.currentMino.value.shape[y - tetris.ghostY.value][x - tetris.minoPos.x]"
             class="block ghost" :style="{ borderColor: tetris.currentMino.value.color }"></div>
        <div v-if="tetris.currentMino.value && y >= tetris.minoPos.y && y < tetris.minoPos.y + tetris.currentMino.value.shape.length &&
             x >= tetris.minoPos.x && x < tetris.minoPos.x + tetris.currentMino.value.shape[0].length &&
             tetris.currentMino.value.shape[y - tetris.minoPos.y][x - tetris.minoPos.x]"
             class="block active" :style="{ backgroundColor: tetris.currentMino.value.color }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-canvas { position: relative; background: #000; border: 4px solid #444; display: inline-block; cursor: crosshair; }
.death-line { position: absolute; left: 0; right: 0; border-top: 2px dashed rgba(255, 71, 87, 0.7); z-index: 10; pointer-events: none; }
.grid-row { display: flex; }
.grid-cell { width: 30px; height: 30px; border: 0.5px solid #1a1a1a; position: relative; }
.block { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
.block.active { z-index: 5; border: 1px solid rgba(255,255,255,0.3); }
.block.ghost { z-index: 2; background: rgba(255,255,255,0.1) !important; border: 1px dashed; opacity: 0.5; }
</style>