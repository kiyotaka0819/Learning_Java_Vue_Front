<script setup>
import { useMetronome } from './useMetronome.js';
import { METRONOME_CONFIG } from './metronomeConfig.js';
import BeatDisplay from './BeatDisplay.vue';

// Composableから必要なものを取り出す
const {
  isPlaying, // 再生中かどうか
  bpm, // 現在のBPM
  currentBeat, // 現在のビート（1, 2, 3, 4...）
  start, // スタート関数
  stop // ストップ関数
} = useMetronome();
</script>
<template>
  <div>
    <h1>メトロノームアプリ</h1>
    <BeatDisplay
      :currentBeat="currentBeat"
      :totalBeats="METRONOME_CONFIG.BEATS_PER_MEASURE"
    />
    <!-- 現在の状態を表示 -->
    <div>
      <p>BPM: {{ bpm }}</p>
      <p>ビート: {{ currentBeat }}</p>
      <p>状態: {{ isPlaying ? '再生中' : '停止中' }}</p>
    </div>
    <button v-if="isPlaying" @click="stop">ストップ</button>
    <button v-else @click="start">スタート</button>
    <input
      type="number"
      v-model.number="bpm"
      :min="METRONOME_CONFIG.MIN_BPM"
      :max="METRONOME_CONFIG.MAX_BPM"
    />
  </div>
</template>
