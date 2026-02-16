<script setup>
import pageData from '../components/pageData.json';
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
      <div
        v-for="concept in pageData.home.concepts"
        :key="concept.title"
        class="concept-card"
      >
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
  color: inherit;
}

.concepts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 30px;
}

.concept-card {
  padding: 20px;
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 8px;
  color: inherit;
  transition: all 0.3s ease;
}

.concept-card:hover {
  background-color: var(--bg-color);
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: #42b983;
}
</style>
