<script setup>
  defineProps({
   name: String,
   description: String,
   tech: Array,
   url: String,
   to: String
  })
</script>

<template>
  <div class="app-item">
    <h3> {{ name }}</h3>
    <p>{{ description }}</p>
    <p>使用技術: {{ tech.join(' / ')}}</p>
    <div class="links">
      <a :href="url" target="_blank">GitHubリポジトリ</a>  
      <router-link v-if="to" :to="to" class="link-btn">
        アプリを開く
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.app-item{
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: none;
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
  display: inline-block;
  padding: 5px 15px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
 