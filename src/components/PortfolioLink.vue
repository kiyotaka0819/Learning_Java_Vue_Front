<script setup>

  defineProps({

   name: String,

   url: String,

  })

</script>



<template>

  <div class="link-item">

    <h3>名前: {{ name }}</h3>

    <a :href="url" target="_blank">{{ url }}</a>

  </div>

</template>



<style scoped>

.link-item{

  margin-bottom: 20px;

  padding-bottom: 20px;

  border-bottom: 1px solid #eee;

}



.link-item:last-child{

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