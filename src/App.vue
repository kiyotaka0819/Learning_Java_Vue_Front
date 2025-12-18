<template>
  <div class="container">
    <header>
      <h1>My Portfolio</h1>
      <p>天本のポートフォリオサイト</p>
    </header>
    
    <div class="menu">
      <button @click="clickMenu('home')">ホーム</button>
      <button @click="clickMenu('apps')">アプリ</button>
      <button @click="clickMenu('portfolio')">ポートフォリオ</button>
      <button @click="clickMenu('about')">ABOUT ME</button>
    </div>
    
    <div class="content">
      <div v-if="currentPage === 'home'">
        <h2>{{ pageData.home.title }}</h2>
        <p>{{ pageData.home.description }}</p>
      </div>

      <div v-if="currentPage === 'apps'">
        <h2>{{ pageData.apps.title }}</h2>
        <AppCard
        v-for="app in pageData.apps.items"
        :key="app.name"
        :name="app.name"
        :description="app.description"
        :tech="app.tech"
        :url="app.url"
        />
      </div>
      
      <div v-if="currentPage === 'portfolio'">
        <h2>{{ pageData.portfolio.title }}</h2>
        <PortfolioLink
        v-for="link in pageData.portfolio.links"
        :key="link.name"
        :name="link.name"
        :url="link.url"
        />
      </div>
      
      <div v-if="currentPage === 'about'">
        <h2>{{ pageData.about.title }}</h2>
        <p>名前: {{ pageData.about.name }}</p>
        <p>{{ pageData.about.bio }}</p>
        <div>
          <h3>スキル</h3>
          <p>{{ pageData.about.skills.join(' / ' )}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import pageData from './components/pageData.json'
import AppCard from './components/AppCard.vue'
import PortfolioLink from './components/PortfolioLink.vue'
const currentPage = ref('home')

const clickMenu = (page) => {
  currentPage.value = page
}
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