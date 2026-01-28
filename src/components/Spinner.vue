<template>
  <div class="spinner"></div>
</template>

<script>
export default {
  name: 'Spinner', // このコンポーネントの名前
};
</script>

<style>
.spinner {
  width: 40px;
  height: 40px;
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
