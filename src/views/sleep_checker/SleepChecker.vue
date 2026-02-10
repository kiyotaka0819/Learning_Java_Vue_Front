<script setup>
import { ref, computed } from 'vue';

// --- [1] 状態管理 (Reactive Data) ---
const bedHour = ref(23);
const bedMinute = ref(0);
const wakeHour = ref(7);
const wakeMinute = ref(0);

// 長押し用のタイマーIDを保持
const timerId = ref(null);

// --- [2] 睡眠時間の計算ロジック (Computed) ---
// 依存する値が変わるたびに自動で再計算される
const sleepResult = computed(() => {
  // 全て「分」に変換して計算するのが、日跨ぎ処理の最短ルート
  const bedTotal = bedHour.value * 60 + bedMinute.value;
  const wakeTotal = wakeHour.value * 60 + wakeMinute.value;
  
  let diff = wakeTotal - bedTotal;
  
  // マイナスになる場合（例：23時寝、7時起き）は24時間分（1440分）を足して補正
  if (diff < 0) diff += 24 * 60;

  return {
    h: Math.floor(diff / 60),  // 時間部分
    m: diff % 60,              // 分部分
    totalHours: diff / 60      // 色変え判定用の数値
  };
});

// --- [3] 数値変更の共通処理 ---
// target: どの値を、direction: どっち方向に変えるかを一括管理
const changeValue = (target, direction) => {
  if (target === 'bedH')  bedHour.value   = (bedHour.value + direction + 24) % 24;
  if (target === 'bedM')  bedMinute.value = (bedMinute.value + direction + 60) % 60;
  if (target === 'wakeH') wakeHour.value  = (wakeHour.value + direction + 24) % 24;
  if (target === 'wakeM') wakeMinute.value = (wakeMinute.value + direction + 60) % 60;
};

// --- [4] 長押し（連続実行）の制御 ---
// speed: 実行間隔(ms)。分は短め（80msなど）にすると操作性が上がる
const startContinuous = (target, direction, speed = 130) => {
  // 二重起動防止：念のため動いているタイマーを掃除
  stopContinuous();
  // 1回目は即実行
  changeValue(target, direction);
  // 指定したスピードで繰り返し実行
  timerId.value = setInterval(() => {
    changeValue(target, direction);
  }, speed);
};

// タイマーを止める処理（指を離した時、マウスが外れた時用）
const stopContinuous = () => {
  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = null;
  }
};
</script>

<template>
  <div class="app-container">
    <header>
      <h1>睡眠計算ツール</h1>
      <p class="subtitle">睡眠時間計測を行います</p>
    </header>

    <main>
      <section class="card">
        <label>就寝時刻</label>
        <div class="input-row">
          <div class="control-group">
            <button 
              @touchstart.prevent="startContinuous('bedH', 1, 130)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('bedH', 1, 130)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">+</button>
            <div class="display"><span>{{ bedHour }}</span>時</div>
            <button 
              @touchstart.prevent="startContinuous('bedH', -1, 130)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('bedH', -1, 130)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">−</button>
          </div>
          <div class="control-group">
            <button 
              @touchstart.prevent="startContinuous('bedM', 1, 80)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('bedM', 1, 80)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">+</button>
            <div class="display"><span>{{ bedMinute }}</span>分</div>
            <button 
              @touchstart.prevent="startContinuous('bedM', -1, 80)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('bedM', -1, 80)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">−</button>
          </div>
        </div>
      </section>

      <section class="card">
        <label>起床時刻</label>
        <div class="input-row">
          <div class="control-group">
            <button 
              @touchstart.prevent="startContinuous('wakeH', 1, 150)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('wakeH', 1, 150)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">+</button>
            <div class="display"><span>{{ wakeHour }}</span>時</div>
            <button 
              @touchstart.prevent="startContinuous('wakeH', -1, 150)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('wakeH', -1, 150)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">−</button>
          </div>
          <div class="control-group">
            <button 
              @touchstart.prevent="startContinuous('wakeM', 1, 80)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('wakeM', 1, 80)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">+</button>
            <div class="display"><span>{{ wakeMinute }}</span>分</div>
            <button 
              @touchstart.prevent="startContinuous('wakeM', -1, 80)" 
              @touchend="stopContinuous" 
              @mousedown="startContinuous('wakeM', -1, 80)" 
              @mouseup="stopContinuous" 
              @mouseleave="stopContinuous">−</button>
          </div>
        </div>
      </section>
      
      <div class="result-card" :class="{ 'good': sleepResult.totalHours >= 7, 'warn': sleepResult.totalHours < 6 }">
        <p>合計睡眠時間</p>
        <div class="time-display">
          <strong>{{ sleepResult.h }}</strong>時間 <strong>{{ sleepResult.m }}</strong>分
        </div>
        <p class="status-msg">
          {{ sleepResult.totalHours >= 7 ? '十分な睡眠時間' : '少し寝不足…' }}
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", sans-serif;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

header { text-align: center; margin-bottom: 25px; }
h1 { margin: 0; font-size: 1.6rem; color: #1a1a1a; }
.subtitle { font-size: 0.85rem; color: #666; margin-top: 5px; }

.card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

label { display: block; font-weight: bold; margin-bottom: 15px; color: #333; font-size: 1rem; }

.input-row { display: flex; justify-content: space-around; gap: 15px; }

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px;
  width: 45%;
}

.display { margin: 12px 0; color: #222; }
.display span { font-size: 1.8rem; font-weight: 800; margin-right: 2px; }

button {
  width: 100%;
  height: 50px;
  border: none;
  background: white;
  border-radius: 10px;
  font-size: 1.6rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  user-select: none; /* 長押し時にテキストが選択されるのを防ぐ */
  -webkit-tap-highlight-color: transparent; /* タップ時の青い枠を消す */
  color: #007aff;
}
button:active { background: #eef2ff; transform: scale(0.96); }

.result-card {
  margin-top: 35px;
  text-align: center;
  padding: 25px;
  border-radius: 24px;
  background: #e9ecef;
  transition: all 0.4s ease;
}

.time-display { font-size: 1.3rem; margin: 12px 0; color: #333; }
.time-display strong { font-size: 2.6rem; color: #333; }

/* 状態別のカラーリング */
.good { background: #d4edda; border: 2px solid #28a745; }
.good strong { color: #155724; }
.warn { background: #f8d7da; border: 2px solid #dc3545; }
.warn strong { color: #721c24; }

.status-msg { font-size: 1rem; font-weight: 600; margin-top: 5px; }
</style>