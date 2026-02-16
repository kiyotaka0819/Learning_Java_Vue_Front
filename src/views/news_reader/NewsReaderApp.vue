<script setup>
import { ref, onMounted } from 'vue';
import newsGeneral from './newsGeneral';
import Spinner from '../../components/Spinner.vue';

// ジャンルリストを取り込む
const genres = newsGeneral.genres;
// 選択中のジャンルを判別するための変数
const currentGenre = ref(genres[0]);
// 記事を表示するための変数
const articles = ref([]);
// ロード中を管理するための変数
const loading = ref(false);
// エラーメッセージを管理するための変数
const error = ref(null);
// お気に入りを管理するための変数
const favorites = ref([]);

// 初回処理
onMounted(() => {
  // お気に入りをlocalStorageから読み込む
  const savedFavorites = localStorage.getItem('favoriteGenres');
  if (savedFavorites) {
    try {
      favorites.value = JSON.parse(savedFavorites);
    } catch (e) {
      console.error('お気に入りの読み込みエラー:', e);
    }
  }
  // 初期ニュース読み込み
  fetchNews(currentGenre.value);
});

// 日付フォーマット関数
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('ja-JP', options);
  } catch (e) {
    console.error('日付のフォーマットエラー:', e);
    return dateString;
  }
};

// ニュースを取得する関数 - 最初に動いていたAPIエンドポイントを使用
async function fetchNews(genre) {
  loading.value = true;
  error.value = null;
  articles.value = [];

  // NHKのRSSフィードURL
  const baseUrl = 'https://www3.nhk.or.jp/rss/news/';
  const rssUrl = encodeURIComponent(`${baseUrl}${genre.url}`);
  const apiUrl = `https://rss2json.com/api.json?rss_url=${rssUrl}`; // 元々動作していたエンドポイント

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.status === 'ok') {
      articles.value = data.items;
      console.log(`記事を取得しました: ${articles.value.length}件`);
    } else {
      error.value = data.message || 'ニュースの取得に失敗しました';
      console.error('Failed to fetch news:', data.message);
    }
  } catch (err) {
    error.value = err.message || 'ネットワークエラーが発生しました';
    console.error('Fetch error:', err);
  } finally {
    loading.value = false;
  }
}

// ジャンル選択イベントハンドラ
const onGenreSelected = (genre) => {
  currentGenre.value = genre;
  fetchNews(genre);
};

// お気に入り追加関数
const addFavorite = (genre) => {
  if (!isFavorite(genre)) {
    favorites.value.push({ ...genre });
    saveFavorites();
  }
};
// お気に入り削除関数
const removeFavorite = (genre) => {
  favorites.value = favorites.value.filter((fav) => fav.id !== genre.id);
  saveFavorites();
};
// お気に入りに追加対象があるのかを判別する関数
const isFavorite = (genre) => {
  return favorites.value.some((fav) => fav.id === genre.id);
};
// お気に入りをlocalStorageに保存する関数
const saveFavorites = () => {
  localStorage.setItem('favoriteGenres', JSON.stringify(favorites.value));
};
</script>

<template>
  <div class="news-container">
    <h1>NHKニュースリーダー</h1>

    <!-- お気に入り機能 -->
    <div class="favorites">
      <h3>お気に入りジャンル</h3>
      <div v-if="favorites.length > 0">
        <button
          v-for="genre in favorites"
          :key="genre.id"
          @click="onGenreSelected(genre)"
          class="fav-button"
        >
          {{ genre.name }}
          <span @click.stop="removeFavorite(genre)" class="remove-btn">×</span>
        </button>
      </div>
      <div v-else>
        <p>お気に入りジャンルを追加してください</p>
      </div>
      <div class="add-fav">
        <button
          v-if="!isFavorite(currentGenre)"
          @click="addFavorite(currentGenre)"
          class="add-button"
        >
          現在のジャンルをお気に入りに追加
        </button>
      </div>
    </div>

    <!-- ジャンル選択 -->
    <div class="genre-selector">
      <h3>ジャンル選択</h3>
      <div class="genre-buttons">
        <button
          v-for="genre in genres"
          :key="genre.id"
          @click="onGenreSelected(genre)"
          class="genre-button"
          :class="{ active: currentGenre.id === genre.id }"
        >
          {{ genre.name }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <Spinner></Spinner>
    </div>

    <div v-else-if="error" class="error">
      エラーが発生しました: {{ error }}
      <button @click="fetchNews(currentGenre)" class="retry-button">
        再読み込み
      </button>
    </div>

    <div v-else>
      <p>現在表示中: {{ currentGenre.name }}</p>

      <ul class="news-list">
        <li v-for="item in articles" :key="item.guid" class="news-item">
          <a :href="item.link" target="_blank" rel="noopener">{{
            item.title
          }}</a>
          <p class="date">{{ formatDate(item.pubDate) }}</p>
          <div class="description" v-html="item.description"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.news-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: inherit;
}

h1 {
  color: #d9333f; /* NHKカラー */
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

h3 {
  margin-top: 0;
  color: #333;
}

a {
  font-weight: bold;
  text-decoration: none;
  color: #52d398;
}

a:hover {
  text-decoration: underline;
}

.favorites {
  margin-bottom: 1.5em;
  padding: 1em;
  background-color: rgba(128, 128, 128, 0.1);
  border-radius: 8px;
  color: inherit;
}

.fav-button {
  margin-right: 0.5em;
  margin-bottom: 0.5em;
  padding: 0.3em 0.6em;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn {
  margin-left: 0.3em;
  color: #ffcccc;
}

.add-button {
  margin-top: 0.5em;
  padding: 0.3em 0.6em;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.genre-selector {
  margin-bottom: 1.5em;
}

.genre-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.genre-button {
  padding: 0.5em 1em;
  background-color: rgba(128, 128, 128, 0.1);
  color: inherit;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.genre-button:hover {
  background-color: #e3e3e3;
}

.genre-button.active {
  background-color: #d9333f; /* NHKカラー */
  color: white;
  border-color: #c02c36;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.error {
  padding: 1em;
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  margin-bottom: 1em;
}

.retry-button {
  margin-top: 0.5em;
  padding: 0.5em 0.8em;
  background-color: #607d8b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.news-list {
  list-style-type: none;
  padding: 0;
}

.news-item {
  margin-bottom: 1.5em;
  padding-bottom: 1em;
  border-bottom: 1px solid #eee;
}

.date {
  color: #666;
  font-size: 0.9em;
  margin: 0.3em 0;
}

.description {
  margin-top: 0.5em;
}
</style>
