<script setup lang="ts">
import { ref, onMounted } from 'vue';
import consts from './consts.json';
import BusinessCard from './BusinessCard.vue';
import EditorPanel from './EditorPanel.vue';

const myData = ref<any>({
  name: '',
  ruby: '',
  job: '',
  age: '',
  portfolio: '',
  githubId: '',
  catchCopy: '',
  skill: {}
});

const isFlipped = ref(false);
const isEditMode = ref(false);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const base64Data = params.get('data');
  if (base64Data) {
    try {
      const decoded = decodeURIComponent(atob(base64Data));
      myData.value = JSON.parse(decoded);
    } catch (e) {
      console.error('復元失敗', e);
    }
  }
});

const copyShareUrl = () => {
  const jsonStr = JSON.stringify(myData.value);
  const base64 = btoa(encodeURIComponent(jsonStr));
  const shareUrl = `${window.location.origin}${window.location.pathname}?data=${base64}`;
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => alert('共有URLをコピーしました。'));
};
</script>

<template>
  <div class="app-viewport">
    <main class="main-display" :class="{ 'editor-open': isEditMode }">
      <header class="app-header">
        <h1>{{ myData.name || '無名' }} のWeb名刺</h1>
      </header>

      <div class="card-container">
        <BusinessCard
          :myData="myData"
          :sample="consts.sample"
          :isFlipped="isFlipped"
          @click="isFlipped = !isFlipped"
        />
        <button class="edit-toggle-btn" @click="isEditMode = !isEditMode">
          {{ isEditMode ? '✖ 閉じる' : '⚙️ 編集する' }}
        </button>
      </div>
    </main>

    <Transition name="fade">
      <div
        v-if="isEditMode"
        class="editor-overlay"
        @click="isEditMode = false"
      ></div>
    </Transition>

    <Transition name="slide">
      <aside v-if="isEditMode" class="side-editor">
        <div class="drag-handle" @click="isEditMode = false"></div>

        <EditorPanel
          v-model="myData"
          :sample="consts.sample"
          @copy-url="copyShareUrl"
        />
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
/* 画面全体の基盤 */
.app-viewport {
  position: relative;
  width: 100%; /* vwから%に変更して突き抜けを防止 */
  min-height: 100vh;
  background-color: #f0f2f5;
  overflow-x: hidden;
  display: flex;
  flex-direction: column; /* 縦並びを基本にする */
}

/* メイン表示エリア */
.main-display {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  /* transitionは特定のプロパティだけに絞る */
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

/* PC版：エディタが開いた時に「全体を左にスライド」させる。
   ただし、画面幅に余裕がある時だけ動かすようにして、右の空白を封じる */
@media (min-width: 1024px) {
  .main-display.editor-open {
    /* paddingではなくtransformで「表示位置」だけをズラす。
       右側に480pxのエディタが重なるので、名刺を左に200pxほど逃がすのが一番綺麗 */
    transform: translateX(-200px);
  }
}

.app-header {
  margin-bottom: 30px;
  text-align: center;
}

.app-header h1 {
  font-size: 1.5rem;
  color: #1a202c;
  font-weight: 800;
  font-family: 'Noto Sans JP', sans-serif; /* ヘッダーのフォント */
}

.card-container {
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.edit-toggle-btn {
  background: white;
  color: #1a202c;
  border: 1px solid #cbd5e0;
  padding: 14px 32px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

/* エディタとオーバーレイ（前回同様） */
.editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 90;
}

.side-editor {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow-y: auto;
}

/* アニメーション設定 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1023px) {
  .side-editor {
    width: 100%;
    height: 85vh;
    top: auto;
    bottom: 0;
    border-radius: 24px 24px 0 0;
  }
  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(100%);
  }
  .main-display.editor-open {
    transform: translateY(-30px);
  }
}
</style>
