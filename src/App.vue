<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
onMounted(() => {
  const redirect = sessionStorage.getItem('redirect');
  if (redirect) {
    sessionStorage.removeItem('redirect');
    const url = new URL(redirect);
    const repoName = '/Learning_Java_Vue_Front';
    let path = url.pathname;
    if (path.startsWith(repoName)) {
      path = path.replace(repoName, '');
    }
    // パスが空になったら '/' に、そうでなければ抽出したパスへ
    router.push((path || '/') + url.search + url.hash);
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
  <div :class="['portfolio-container', { 'dark-mode': isDarkMode }]">
    
    <header>
      <h1>My Portfolio</h1>
      <p>天本のポートフォリオサイト</p>
      <button class="toggle-btn" @click="toggleDarkMode">
        {{ isDarkMode ? 'ライトモード' : 'ダークモード' }}
      </button>
    </header>
    
    <nav class="main-menu">
      <button @click="$router.push('/')">ホーム</button>
      <button @click="$router.push('/apps')">アプリ</button>
      <button @click="$router.push('/portfolio')">ポートフォリオ</button>
      <button @click="$router.push('/about')">ABOUT ME</button>
    </nav>
    
    <main class="page-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

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
/* コンテナ全体の設定 */
.portfolio-container {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #cccccc;
  
  max-width: 900px; /* 少し広めに */
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

/* ダークモードの変数上書き */
.dark-mode {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --border-color: #444444;
}

header {
  text-align: center; /* ヘッダーだけ中央寄せ */
  margin-bottom: 30px;
}

.main-menu {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
}

/* ページの中身が表示されるエリア */
.page-content {
  text-align: left; /* 基本は左寄せに戻す */
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-color);
}

/* ボタンの共通スタイル */
button {
  padding: 8px 16px;
  cursor: pointer;
  border: 1px solid var(--text-color);
  background: transparent;
  color: var(--text-color);
  border-radius: 6px;
  transition: 0.2s;
}

button:hover {
  background: var(--text-color);
  color: var(--bg-color);
}

/* フェードアニメーション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>