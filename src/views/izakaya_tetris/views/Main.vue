<script setup>
import { computed } from 'vue'

const emit = defineEmits(['start'])

// ローカルストレージから過去の会計（スコア）を取得
const stats = computed(() => {
  const orders = JSON.parse(localStorage.getItem('izakaya_orders')) || []
  const total = orders.reduce((sum, o) => sum + (Number(o.price) || 0), 0)
  const ap = Number(localStorage.getItem('izakaya_ap')) || 0
  return { total, ap }
})
</script>

<template>
  <div class="main-menu">
    <div class="hero">
      <div class="logo">🏮</div>
      <h1>居酒屋テトリス</h1>
      <p class="subtitle">〜 食って、積んで、また食え 〜</p>
    </div>

    <div class="status-card">
      <h3>現在の料理一覧</h3>
      <div class="stat-row">
        <span>合計金額:</span>
        <span class="val">¥{{ stats.total.toLocaleString() }}</span>
      </div>
      <div class="stat-row">
        <span>残りブロック数:</span>
        <span class="val">{{ stats.ap }}</span>
      </div>
    </div>

    <div class="actions">
      <button @click="emit('start')" class="btn-start">ゲーム開始</button>
      <p class="hint">※矢印キーで操作、スペースで即落下</p>
    </div>

    <footer class="footer">
      うじとうえだ
    </footer>
  </div>
</template>

<style scoped>
.main-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  color: #fff;
  text-align: center;
  padding: 20px;
}
.hero { margin-bottom: 40px; }
.logo { font-size: 80px; animation: bounce 2s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
h1 { font-size: 3em; color: #ff4757; margin: 10px 0; text-shadow: 2px 2px 10px rgba(255, 71, 87, 0.5); }
.subtitle { color: #ffa502; letter-spacing: 2px; }

.status-card {
  background: #222;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #444;
  width: 100%;
  max-width: 300px;
  margin-bottom: 40px;
}
.stat-row { display: flex; justify-content: space-between; margin: 10px 0; }
.val { color: #2ed573; font-weight: bold; }

.btn-start {
  padding: 18px 40px;
  font-size: 1.2em;
  background: #ff4757;
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
}
.btn-start:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(255, 71, 87, 0.6); }

.hint { margin-top: 15px; font-size: 0.8em; color: #888; }
.footer { position: absolute; bottom: 20px; font-size: 0.7em; color: #444; }
</style>