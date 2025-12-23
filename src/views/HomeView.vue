<script setup>
import pageData from '../components/pageData.json'
</script>

<template>
  <div v-if="pageData" class="home-container">
    <section class="hero">
      <h2>{{ pageData.home.title }}</h2>
      <p>{{ pageData.home.description }}</p>
    </section>

    <section class="info-section">
      <p class="description-text">{{ pageData.home.info }}</p>
    </section>

    <div class="concepts-grid">
      <div v-for="concept in pageData.home.concepts" :key="concept.title" class="concept-card">
        <h4>{{ concept.title }}</h4>
        <p>{{ concept.detail }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.description-text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #444;
}

.concepts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 30px;
  transition: all 0.3s ease;
}

.concepts-grid:hover {
  background-color: #ffffff;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #42b983;
}

.concept-card {
  padding: 20px;
  background: #fdfdfd;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>