<script setup>
// props（親から受け取るデータ）を定義
const props = defineProps({
  currentBeat: {
    type: Number, // 数値型
    required: true // 必須
  },
  totalBeats: {
    type: Number,
    default: 4 // デフォルト値は4
  }
});
</script>

<template>
  <div class="beat-display">
    <h3>現在のビート</h3>
    <div
      v-for="beat in totalBeats"
      :key="beat"
      class="beat-circle"
      :class="{ active: beat === currentBeat }"
    >
      {{ beat }}
    </div>
  </div>
</template>

<style scoped>
.beat-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.1s; /* アニメーション */
}

.beat-circle.active {
  background: #4caf50; /* 緑色 */
  color: white;
  transform: scale(1.2); /* 少し大きく */
}
</style>
