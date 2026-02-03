<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
onMounted(() => {
  const redirect = sessionStorage.getItem('redirect');
  if (redirect) {
    sessionStorage.removeItem('redirect');
    // URLからドメイン部分を抜いて、パスだけを取り出す処理をしてから移動
    const url = new URL(redirect);
    router.push(url.pathname + url.search);
  }
});

// ダークモードの状態を管理する変数
const isDarkMode = ref(false);

// モードを切り替える関数
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
}
// ダークモードの切り替えを監視
watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.body.classList.add('dark-mode-body');
  } else {
    document.body.classList.remove('dark-mode-body');
  }
}, { immediate: true }); // 初期化時にも実行

</script>

<template>
  <div :class="['container', { 'dark-mode': isDarkMode }]">
    <header>
      <h1>My Portfolio</h1>
      <p>天本のポートフォリオサイト</p>
      <button class="toggle-btn" @click="toggleDarkMode">
        {{ isDarkMode ? 'ライトモード' : 'ダークモード' }}
      </button>
    </header>
    
    <div class="menu">
      <button @click="$router.push('/')">ホーム</button>
      <button @click="$router.push('/apps')">アプリ</button>
      <button @click="$router.push('/portfolio')">ポートフォリオ</button>
      <button @click="$router.push('/about')">ABOUT ME</button>
    </div>
    
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
<style>
body {
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  color: #333333;
  transition: background-color 0.3s ease, color 0.3s ease;
}
body.dark-mode-body {
  background-color: #1a1a1a !important;
  color: #f0f0f0 !important;
}
.dark-mode-body * {
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.dark-mode-body .description, 
.dark-mode-body .date {
  color: #ccc !important;
}
</style>
<style scoped>
/* 変数の定義 */
.container {
  /* ライトモード用の色定義 */
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #cccccc;
  --button-bg: #ffffff;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

/* ダークモード時に変数を上書き */
.dark-mode {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --border-color: #555555;
  --button-bg: #333333;
}

.dark-mode {
  background-color: #1a1a1a;
  color: #f0f0f0;
}

:deep(*) {
  color: inherit;
}

header {
  margin-bottom: 20px;
}

.menu {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

/* ダークモード中のボタン */
.dark-mode button {
  background: #333;
  color: #f0f0f0;
  border-color: #f0f0f0;
}

button {
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid var(--text-color);
  background: var(--button-bg);
  color: var(--text-color);
  border-radius: 4px;
}

button:hover {
  opacity: 0.8;
}

.content {
  margin-top: 40px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: left;
  background-color: var(--bg-color);
}

:deep(.link-btn:hover) {
  color: white !important; /* 背景が緑になるなら文字は絶対白 */
}

.dark-mode :deep(a) {
  color: #52d398;
}

/* ダークモード中の枠線 */
.dark-mode .content {
  border-color: #555;
}

.toggle-btn {
  margin-top: 10px;
  font-weight: bold;
}
</style>