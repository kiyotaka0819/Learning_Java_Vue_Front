<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Spring Bootから受け取るデータの型定義
// バックエンドのQuizEntityと合わせる
interface Quiz {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explanation: string;
  category: string;
  needsReview: boolean;
}

// 複数のクイズを格納する配列
const quizzes = ref<Quiz[]>([]);
const loading = ref(true);
const message = ref<string>('読み込み中...');
const errorMsg = ref<string | null>(null);

  onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/api/quizzes');
    if (!response.ok) throw new Error('DB接続に失敗しました。');
    
    const data = await response.json();
    quizzes.value = data; // ここで受け子にセット
  } catch (e) {
    errorMsg.value = 'Javaが動いているか、CORS許可されているか確認してください。';
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="quiz-container">
    <h1>学習特化型クイズ</h1>
    
    <div v-if="loading">読み込み中...</div>
    
    <div v-else-if="quizzes.length > 0">
      <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-card">
        <h3>問{{ quiz.id }}: {{ quiz.question }}</h3>
        <ul>
          <li>A: {{ quiz.optionA }}</li>
          <li>B: {{ quiz.optionB }}</li>
          <li>C: {{ quiz.optionC }}</li>
          <li>D: {{ quiz.optionD }}</li>
        </ul>
        <p class="answer-preview">正解: {{ quiz.answer }}</p>
      </div>
    </div>
    <div v-else>クイズが見つかりません。</div>
  </div>
</template>

<style scoped>
.quiz-container {
  padding: 20px;
  text-align: center;
}
</style>