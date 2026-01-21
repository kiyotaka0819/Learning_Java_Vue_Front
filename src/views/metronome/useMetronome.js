// useMetronome.js
import { ref, computed, watch } from 'vue';
import { playBeep } from './audioService.js';
import { METRONOME_CONFIG } from './metronomeConfig.js';

export function useMetronome() {
  // ===== 状態管理（ref = リアクティブな変数） =====
  // 再生中かどうか
  const isPlaying = ref(false);
  // 現在のBPM（テンポ）
  const bpm = ref(METRONOME_CONFIG.DEFAULT_BPM);
  // 現在のビート位置（1, 2, 3, 4...）
  const currentBeat = ref(1);
  // タイマーのID（停止するときに使う）
  let timerId = null;
  
  // ===== 計算プロパティ（computed = 他の値から自動計算） =====
  
  // BPMから次の音までの間隔（ミリ秒）を計算
  const interval = computed(() => {
    // BPM 60 = 1秒に1回 = 1000ミリ秒
    // BPM 120 = 1秒に2回 = 500ミリ秒
    return 60000 / bpm.value;
  });
  
  
  // ===== 関数（メソッド） =====
  
  // ビープ音を鳴らす処理
  function tick() {
    // 1拍目（強拍）なら高い音、それ以外は低い音
    const frequency = currentBeat.value === 1 
      ? METRONOME_CONFIG.SOUND.ACCENT_FREQ 
      : METRONOME_CONFIG.SOUND.NORMAL_FREQ;
    
    playBeep(frequency, METRONOME_CONFIG.SOUND.DURATION);
    
    // 次のビートへ（4拍子なら 1→2→3→4→1→2...）
    currentBeat.value = currentBeat.value >= METRONOME_CONFIG.BEATS_PER_MEASURE 
      ? 1 
      : currentBeat.value + 1;
  }
  
function start() {
  // すでに再生中なら何もしない
  if (isPlaying.value) return;
  // 再生状態にする
  isPlaying.value = true;  
  // すぐに最初の音を鳴らす
  tick();
  // タイマーをセット（interval.valueミリ秒ごとにtick()を実行）
  timerId = setInterval(() => {
    tick();
  }, interval.value);
}

function stop() {
  // 再生状態を解除
  isPlaying.value = false;
  // タイマーを停止
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  // ビートをリセット
  currentBeat.value = 1;
}
  // BPMが変わったときの処理
  watch(bpm, () => {
    // 再生中の場合のみ、タイマーをリセット
    if (isPlaying.value) {
      stop();   // 一旦停止
      start();  // 新しいBPMで再開
    }
  });
  // 外部から使えるように返す
  return {
    // 状態
    isPlaying,
    bpm,
    currentBeat,
    interval,
    // 関数
    start,
    stop,
  };
}