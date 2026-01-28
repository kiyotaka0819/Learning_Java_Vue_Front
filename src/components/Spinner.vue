<template>
  <div class="spinner"></div>
</template>

<script setup>
</script>

<style scoped>
.spinner {
  width: 120px;
  height: 120px;
  border: 4px solid gray;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
