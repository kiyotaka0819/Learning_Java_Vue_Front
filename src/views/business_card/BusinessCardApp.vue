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
    .then(() => alert('共有URLをコピーしました！'));
};
</script>

<template>
  <div class="app-container">
    <h2>{{ myData.name || '無名' }} のWeb名刺</h2>

    <BusinessCard
      :myData="myData"
      :sample="consts.sample"
      :isFlipped="isFlipped"
      @click="isFlipped = !isFlipped"
    />

    <button class="gear-btn" @click="isEditMode = !isEditMode">
      {{ isEditMode ? '✖ 閉じる' : '⚙️ 名刺を編集する' }}
    </button>

    <Transition name="fade">
      <EditorPanel
        v-if="isEditMode"
        v-model="myData"
        :sample="consts.sample"
        @copy-url="copyShareUrl"
      />
    </Transition>
  </div>
</template>

<style>
/* アプリ全体の基盤スタイル */
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 20px;
  font-family: 'Noto Sans JP', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.gear-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
