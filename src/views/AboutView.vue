<template>
  <div class="about-content">
    <h2>{{ pageData.about.title }}</h2>
    <div class="profile">
      <p><strong>名前:</strong> {{ pageData.about.name }}</p>
      <p>{{ pageData.about.bio }}</p>
    </div>
    
    <div class="skills-section">
      <h3>スキル</h3>
      <p class="skills-list">
        {{ pageData.about.skills.join(' / ') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import pageData from '../components/pageData.json'
</script>

<style scoped>
.about-content {
  line-height: 1.6;
}
.profile {
  margin-bottom: 20px;
}
.skills-section h3 {
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
.skills-list {
  color: #555;
  font-weight: bold;
}
</style>