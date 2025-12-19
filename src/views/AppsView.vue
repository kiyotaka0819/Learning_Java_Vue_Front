<template>
  <div>
    <h2>{{ pageData.apps.title }}</h2>
    <AppCard
      v-for="app in pageData.apps.items"
      :key="app.name"
      :name="app.name"
      :description="app.description"
      :tech="app.tech"
      :url="app.url"
      :to="app.to" 
    />
  </div>
</template>

<script setup>
import pageData from '../components/pageData.json'
import AppCard from '../components/AppCard.vue'
</script>