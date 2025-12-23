<template>
  <div>
    <h2>{{ pageData.portfolio.title }}</h2>
    <PortfolioLink
      v-for="link in pageData.portfolio.links"
      :key="link.name"
      :name="link.name"
      :url="link.url"
    />
  </div>
</template>

<script setup>
import pageData from '../components/pageData.json'
import PortfolioLink from '../components/PortfolioLink.vue' 
</script>