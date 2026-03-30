<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Spring Bootから受け取るデータの型定義
interface HelloResponse {
  message: string;
}

const message = ref<string>('読み込み中...');
const errorMsg = ref<string | null>(null);

onMounted(async () => {
  try {
    // Spring Boot（8080ポート）を叩く
    const response = await fetch('http://localhost:8080/api/hello');
    if (!response.ok) throw new Error('サーバーに繋がりません');
    
    const data: HelloResponse = await response.json();
    message.value = data.message;
  } catch (e) {
    errorMsg.value = '接続エラー発生。Spring Boot側でCORS許可確認';
    console.error(e);
  }
});
</script>

<template>
  <div class="quiz-container">
    <h1>クイズアプリ</h1>
    <p v-if="!errorMsg">サーバーからの返事: {{ message }}</p>
    <p v-else style="color: red;">{{ errorMsg }}</p>
  </div>
</template>

<style scoped>
.quiz-container {
  padding: 20px;
  text-align: center;
}
</style>