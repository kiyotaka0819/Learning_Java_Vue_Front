<script setup>
import pageData from '../components/pageData.json'
</script>

<template>
  <div v-if="pageData" class="about-content">
    <h2>{{ pageData.about.title }}</h2>
    
    <div class="profile-card">
      <p><strong>名前:</strong> {{ pageData.about.name }}</p>
      <p class="description-text">{{ pageData.about.bio }}</p>
    </div>
    
    <div class="skills-section">
      <h3>スキルセット</h3>
      <p class="skills-list">
        {{ pageData.about.skills.join(' / ') }}
      </p>
    </div>

    <div class="learning-section" v-if="pageData.about.learning">
      <h3>学習状況 & 指針</h3>
      <div v-for="item in pageData.about.learning" :key="item.category" class="learning-item">
        <p><strong>{{ item.category }}:</strong></p>
        <p class="learning-detail">{{ item.detail }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-content {
  line-height: 1.8;
  max-width: 800px;
}

/* AppCardと統一したホバースタイル */
.profile-card, .learning-item {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  border-radius: 12px;
  background-color: #fcfcfc; /* ほんの少しグレー */
}

.profile-card:hover, .learning-item:hover {
  background-color: #ffffff;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #42b983;
}

h3 {
  border-left: 5px solid #42b983;
  padding-left: 15px;
  margin: 30px 0 15px;
}

.description-text, .learning-detail {
  white-space: pre-wrap;
  color: #444;
  margin-top: 5px;
}

.skills-list {
  padding: 15px;
  color: #555;
  font-weight: bold;
}
</style>