<script setup>
const props = defineProps({ settings: Object })
const emit = defineEmits(['close'])
</script>

<template>
  <div class="modal-bg" @click.self="emit('close')">
    <div class="modal-body">
      <h3>🏮 ルール設定</h3>
      
      <div class="opt">
        <label>ジョーカーの扱い</label>
        <select v-model="settings.jokerRule">
          <option value="line">一列消去（動画風）</option>
          <option value="none">なし</option>
        </select>
      </div>

      <div class="opt">
        <label>落下速度: {{ settings.dropIntervalSec }}秒</label>
        <input type="range" min="0.1" max="2.0" step="0.1" v-model.number="settings.dropIntervalSec">
      </div>

      <div class="opt">
        <label>
          <input type="checkbox" v-model="settings.isSakeMode"> 泥酔演出（画面揺れ）
        </label>
      </div>

      <div class="modal-footer">
        <button @click="emit('close')" class="btn-back">保存して戻る</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; color: #333; }
.modal-body { background: #fff; padding: 25px; border-radius: 16px; width: 300px; display: flex; flex-direction: column; gap: 20px; }
.opt { display: flex; flex-direction: column; gap: 8px; font-weight: bold; }
.btn-back { background: #1e90ff; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%; }
</style>