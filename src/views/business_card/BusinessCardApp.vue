<script setup lang="ts">
import { ref, onMounted } from 'vue';
import consts from './consts.json';
import BusinessCard from './BusinessCard.vue';
import EditorPanel from './EditorPanel.vue';
import { supabase } from '../../lib/supabaseClient';

// OSから渡される用
const props = defineProps({
  id: String
});

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

// 1. Supabaseへ保存
const copyShareUrl = async () => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .insert([{ data: myData.value }])
      .select('id')
      .single();

    if (error) throw error;

    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
    await navigator.clipboard.writeText(shareUrl);
    alert('URLをコピーしました。');
  } catch (e) {
    console.error('DBとの接続に失敗しました：', e);
    alert('保存に失敗しました。');
  }
};

// 2. データ復元ロジック
onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  // Propsを最優先、なければURLからIDを取得
  const targetId = props.id || params.get('id');

  if (targetId) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('data')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      if (data) {
        myData.value = data.data;
      }
    } catch (e) {
      console.error('データ取得失敗：', e);
    }
  }
});
</script>

<template>
  <div class="app-viewport">
    <main class="main-display" :class="{ 'editor-open': isEditMode }">
      <header class="app-header"></header>

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
/* 画面全体の基盤（OSのウィンドウ内で%基準にする） */
.app-viewport {
  position: relative;
  width: 100%;
  min-height: 100%;
  background-color: #f0f2f5;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* メイン表示エリア */
.main-display {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

/* PC版：エディタが開いた時にスライド */
@media (min-width: 1024px) {
  .main-display.editor-open {
    transform: translateX(-150px);
  }
}

.app-header {
  margin-bottom: 20px;
  text-align: center;
}

.app-header h1 {
  font-size: 1.2rem;
  color: #1a202c;
  font-weight: 800;
}

.card-container {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.edit-toggle-btn {
  background: white;
  color: #1a202c;
  border: 1px solid #cbd5e0;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

/* エディタとオーバーレイ */
.editor-overlay {
  position: absolute; /* fixedから変更 */
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 90;
}

.side-editor {
  position: absolute; /* fixedから変更 */
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow-y: auto;
}

.drag-handle {
  height: 4px;
  width: 40px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 12px auto;
  cursor: pointer;
}

/* アニメーション */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1023px) {
  .side-editor {
    width: 100%;
    height: 70%;
    top: auto;
    bottom: 0;
    border-radius: 20px 20px 0 0;
  }
  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(100%);
  }
}
</style>
