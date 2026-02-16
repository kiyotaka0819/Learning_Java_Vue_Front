<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const owner = 'kiyotaka0819';
const repo = 'Learning_Java_Vue_Front';
const mdText = ref('READMEを読み込み中...');

onMounted(async () => {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`
    );
    mdText.value = await res.text();
  } catch (e) {
    mdText.value = '# Error\nREADMEの取得に失敗しました。';
  }
});

const renderedHtml = computed(() => {
  return mdText.value
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n/gim, '<br>')
    .replace(/<\/ul><ul>/gim, '');
});
</script>

<template>
  <div class="editor-container dark">
    <div class="editor-pane">
      <div class="pane-label">EDITOR (README.md)</div>
      <textarea v-model="mdText" spellcheck="false"></textarea>
    </div>

    <div class="preview-pane">
      <div class="pane-label">PREVIEW</div>
      <div class="markdown-body" v-html="renderedHtml"></div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.pane-label {
  font-size: 10px;
  color: #858585;
  padding: 5px 10px;
  background: #252526;
  border-bottom: 1px solid #333;
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
}

textarea {
  flex: 1;
  padding: 15px;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  background: #1e1e1e;
  color: #9cdcfe;
  caret-color: #fff;
}

.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #252526;
}

.markdown-body {
  padding: 20px;
  color: #e0e0e0;
  line-height: 1.6;
}

/* マークダウン表示用スタイル */
:deep(h1) {
  font-size: 1.6em;
  border-bottom: 1px solid #444;
  margin-bottom: 12px;
  color: #569cd6;
}
:deep(h2) {
  font-size: 1.3em;
  margin-top: 20px;
  color: #4ec9b0;
}
:deep(ul) {
  padding-left: 1.5em;
  color: #dcdcdc;
}
:deep(strong) {
  color: #ce9178;
}

/* スクロールバー */
.preview-pane::-webkit-scrollbar {
  width: 10px;
}
.preview-pane::-webkit-scrollbar-thumb {
  background: #3e3e42;
  border-radius: 5px;
}
.preview-pane::-webkit-scrollbar-track {
  background: #252526;
}
</style>
