<script setup>
import { ref } from 'vue';

// 状態管理用の変数
const recipeResult = ref('');
const isLoading = ref(false);

// APIの設定（本来は環境変数に入れるのがセーフティやけど、まずは動かすの優先やな）
const genAI = new GoogleGenerativeAI('AIzaSyBtTvJzhBTUyLy63_Qh0E4kmaublgMhohM');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function generateRecipe(weatherInfo) {
  isLoading.value = true;
  try {
    const prompt = `あなたはプロの料理研究家です。
    現在の気温は${weatherInfo.temp}度、天気は${weatherInfo.condition}です。
    この状況に最適な、日本人が喜ぶ簡単で美味しいレシピを1つ提案してください。`;

    const result = await model.generateContent(prompt);
    recipeResult.value = result.response.text();
  } catch (error) {
    console.error('APIエラーや：', error);
    recipeResult.value = 'エラーが発生したわ、堪忍な。';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="recipe-app">
    <h2>AI献立アドバイザー</h2>

    <button
      @click="generateRecipe({ temp: 25, condition: '晴れ' })"
      :disabled="isLoading"
    >
      {{ isLoading ? '考え中や...' : 'レシピを提案してもらう' }}
    </button>

    <div v-if="recipeResult" class="result-area">
      <h3>提案されたレシピ</h3>
      <pre>{{ recipeResult }}</pre>
    </div>
  </div>
</template>

<style scoped>
.recipe-app {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
.result-area {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  white-space: pre-wrap;
}
</style>
