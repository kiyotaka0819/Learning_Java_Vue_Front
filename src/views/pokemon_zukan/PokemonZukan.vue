<script setup lang="ts">
import { ref, onMounted } from 'vue';

// --- 1. 型定義 ---
interface PokemonDetail {
  id: number;
  jpName: string;
  image: string;
  weight: number;
  description: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defence: number;
    spAttack: number;
    spDefence: number;
    speed: number;
  };
}

// --- 2. 状態管理 ---
const currentPokemon = ref<PokemonDetail | null>(null);
const isDictLoading = ref(true);
const isPokeLoading = ref(false);
const errorMessage = ref('');
const searchQuery = ref('ピカチュウ');
const masterDataMap = new Map<string, any>();

// --- 3. ロジック ---
const initMasterData = async () => {
  isDictLoading.value = true;
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/kotofurumiya/pokemon_data/master/data/pokemon_data.json'
    );
    const allData = await res.json();
    allData.forEach((p: any) => masterDataMap.set(p.name, p));
  } catch (e) {
    errorMessage.value = 'マスターデータのロードに失敗しました。';
  } finally {
    isDictLoading.value = false;
  }
};

const fetchPokemon = async (input: string) => {
  if (!input || isDictLoading.value) return;
  isPokeLoading.value = true;
  errorMessage.value = '';

  try {
    const localData = masterDataMap.get(input);
    const query = localData ? localData.no : input.toString().toLowerCase();

    const [pokeRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${query}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${query}`)
    ]);

    if (!pokeRes.ok || !speciesRes.ok)
      throw new Error('そのポケモンは見つかりませんでした。');

    const [pokeData, speciesData] = await Promise.all([
      pokeRes.json(),
      speciesRes.json()
    ]);

    // 第5世代のアニメーションデータを指定
    const animatedImg =
      pokeData.sprites.versions['generation-v']['black-white'].animated
        .front_default || pokeData.sprites.front_default; // アニメ版がなければ通常のドット絵

    const flavor = speciesData.flavor_text_entries.find(
      (f: any) => f.language.name === 'ja-Hrkt' || f.language.name === 'ja'
    );
    const description = flavor
      ? flavor.flavor_text.replace(/\s+/g, ' ')
      : '説明なし。';

    currentPokemon.value = {
      id: pokeData.id,
      jpName: localData ? localData.name : pokeData.name,
      image: animatedImg,
      weight: pokeData.weight / 10,
      description: description,
      types: localData
        ? localData.types
        : pokeData.types.map((t: any) => t.type.name),
      stats: localData
        ? localData.stats
        : {
            hp: pokeData.stats[0].base_stat,
            attack: pokeData.stats[1].base_stat,
            defence: pokeData.stats[2].base_stat,
            spAttack: pokeData.stats[3].base_stat,
            spDefence: pokeData.stats[4].base_stat,
            speed: pokeData.stats[5].base_stat
          }
    };
  } catch (e: any) {
    errorMessage.value = '検索に失敗しました。';
  } finally {
    isPokeLoading.value = false;
  }
};

onMounted(async () => {
  await initMasterData();
  fetchPokemon('ピカチュウ');
});
</script>

<template>
  <div class="pokedex-wrapper">
    <div class="pokedex-case">
      <div class="screen-area">
        <div v-if="isDictLoading" class="msg-box">準備中...</div>
        <div v-else-if="isPokeLoading" class="msg-box">通信中...</div>
        <div v-else-if="errorMessage" class="msg-box err">
          {{ errorMessage }}
        </div>

        <div v-else-if="currentPokemon" class="display">
          <div class="top-row">
            <span>No.{{ currentPokemon.id }}</span>
            <span class="p-name">{{ currentPokemon.jpName }}</span>
          </div>

          <div class="main-content">
            <div class="left-col">
              <img :src="currentPokemon.image" class="pixel-art-animated" />
              <div class="types">
                <span
                  v-for="t in currentPokemon.types"
                  :key="t"
                  class="type-tag"
                  >{{ t }}</span
                >
              </div>
            </div>
            <div class="right-col">
              <div class="stat-list">
                <div class="s-row">HP: {{ currentPokemon.stats.hp }}</div>
                <div class="s-row">AT: {{ currentPokemon.stats.attack }}</div>
                <div class="s-row">DF: {{ currentPokemon.stats.defence }}</div>
                <div class="s-row">SP: {{ currentPokemon.stats.speed }}</div>
              </div>
            </div>
          </div>

          <div class="desc-area">
            {{ currentPokemon.description }}
          </div>
        </div>
      </div>

      <div class="ui-area">
        <input
          v-model="searchQuery"
          @keyup.enter="fetchPokemon(searchQuery)"
          class="gb-input"
          placeholder="名前か図鑑番号を入力してください。"
        />
        <button @click="fetchPokemon(searchQuery)" class="gb-btn">
          KETTEI
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokedex-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #333;
  min-height: 100vh;
}
.pokedex-case {
  background: #e63946;
  width: 320px;
  padding: 15px;
  border: 4px solid #333;
  border-radius: 10px 10px 50px 10px;
  box-shadow: 8px 8px 0 #000;
}
.screen-area {
  background: #9bbc0f;
  border: 8px solid #333;
  height: 320px;
  padding: 8px;
  color: #0f380f;
  font-family: monospace;
  overflow: hidden;
}

.display {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 5px;
}
.top-row {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  border-bottom: 2px solid #0f380f;
  font-size: 14px;
}
.main-content {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  height: 100px;
}
.pixel-art-animated {
  height: 70px;
  image-rendering: pixelated;
  object-fit: contain;
}
.type-tag {
  display: block;
  background: #0f380f;
  color: #9bbc0f;
  padding: 1px 4px;
  border-radius: 2px;
  margin-bottom: 2px;
  font-size: 10px;
  text-align: center;
}
.stat-list {
  font-size: 11px;
  font-weight: bold;
}

.desc-area {
  background: rgba(0, 0, 0, 0.08);
  padding: 5px;
  border: 1px solid #0f380f;
  flex-grow: 1;
  font-size: 11px;
  line-height: 1.3;
  overflow-y: auto;
}

.ui-area {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.gb-input {
  padding: 8px;
  border: 3px solid #333;
  font-family: monospace;
}
.gb-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 10px;
  cursor: pointer;
  box-shadow: 4px 4px 0 #000;
  font-weight: bold;
}
.msg-box {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
