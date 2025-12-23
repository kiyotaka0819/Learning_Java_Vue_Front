<script setup>
/**
 * アプリ一覧に表示するコンポーネント
 * AppsViewから受け取ったアプリ情報を整形して表示する
 */
defineProps({
  name: String,        // アプリ名
  description: String, // アプリの詳細説明（\n による改行に対応）
  tech: Array,         // 使用技術の配列
  url: String,         // 外部リポジトリのURL
  to: String           // SPA内部のルーティングパス
})
</script>

<template>
  <div class="app-item">
    <h3> {{ name }}</h3>
    <p class="description-text">{{ description }}</p>
    <p>使用技術: {{ tech.join(' / ')}}</p>
    
    <div class="links">
      <a :href="url" target="_blank">GitHubリポジトリ</a>  
      <router-link v-if="to" :to="to" class="link-btn">
        アプリを開く <span>→</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.app-item {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  border-radius: 12px;
}
.app-item:hover {
  background-color: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #42b983;
}
.app-item:last-child{
  border-bottom: none;
}
a {
  color: #42b983;
  text-decoration: none;
}
a:hover{
  text-decoration: underline;
}
.links {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 10px;
}
.link-btn {
  background-color: transparent;
  color: #42b983;
  border: 1px solid #42b983;
  display: inline-block;
  padding: 5px 15px;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.link-btn:hover {
  background-color: #42b983;
  color: white;
  box-shadow: 0 5px 15px rgba(66, 185, 131, 0.3);
}
.link-btn span {
  display: inline-block;
  transition: transform 0.3s ease;
}

.app-item:hover .link-btn span {
  transform: translateX(4px);
}

a:hover {
  color: #34a872;
  text-decoration: underline;
}

.description-text {
  white-space: pre-wrap;
}

@keyframes hyoko-hyoko {
  0% { transform: translateX(0); }
  50% { transform: translateX(6px); }
  100% { transform: translateX(0); }
}

.app-item:hover .link-btn span {
  animation: hyoko-hyoko 0.8s infinite ease-in-out;
}
</style>
 