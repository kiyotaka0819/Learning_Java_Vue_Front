<script setup>
  defineProps({
   name: String,
   description: String,
   tech: Array,
   url: String
  })
</script>

<template>
  <div class="app-item">
    <h3> {{ name }}</h3>
    <p>{{ description }}</p>
    <p>使用技術: {{ tech.join(' / ')}}</p>
    <a :href="url" target="_blank">{{ url }}</a>
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
</style>
 