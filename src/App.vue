<template>
  <div class="container">
    <header>
      <h1>My Portfolio</h1>
      <p>天本のポートフォリオサイト</p>
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

<script setup>
  import { ref } from 'vue'
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
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

button {
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid #333;
  background: white;
  border-radius: 4px;
}

button:hover {
  background: #f0f0f0;
}

.content {
  margin-top: 40px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: left;
}
</style>