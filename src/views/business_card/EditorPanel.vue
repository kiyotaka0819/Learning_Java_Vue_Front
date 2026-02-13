<script setup lang="ts">
import { ref, computed } from 'vue';
import consts from './consts.json';

const myData = defineModel<any>({ required: true });
const props = defineProps<{ sample: any }>();
const emit = defineEmits(['copy-url']);

// 編集パネル内部の状態
const selCat = ref('');
const selSub = ref('');
const selRole = ref('');
const choiceSkill = ref('');
const selectedSkillSuggest = ref('');
const newSkillInput = ref('');
const pendingSkills = ref<{ name: string; type: string }[]>([]);

// 自由入力判定
const isFreeInputNeeded = computed(() => {
  return (
    selRole.value === 'その他' ||
    selRole.value === '自由入力' ||
    selCat.value === 'その他(フリー記述)'
  );
});

// 職種変更時の処理
const handleRoleChange = () => {
  myData.value.job = isFreeInputNeeded.value ? '' : selRole.value;
};

// スキルをキープ
const holdSkill = () => {
  const skillName =
    selectedSkillSuggest.value === 'その他'
      ? newSkillInput.value
      : selectedSkillSuggest.value;
  if (skillName && !pendingSkills.value.some((s) => s.name === skillName)) {
    pendingSkills.value.push({ name: skillName, type: choiceSkill.value });
    newSkillInput.value = '';
    selectedSkillSuggest.value = '';
  }
};

// キープ解除
const removePendingSkill = (index: number) => {
  pendingSkills.value.splice(index, 1);
};

// 名刺に反映
const commitSkills = () => {
  pendingSkills.value.forEach(item => {
    // カテゴリー（item.type）がまだ myData.skill に存在しなければ、新しい配列を作る
    if (!myData.value.skill[item.type]) {
      myData.value.skill[item.type] = []
    }
    
    // 重複チェックして追加
    if (!myData.value.skill[item.type].includes(item.name)) {
      myData.value.skill[item.type].push(item.name)
    }
  })
  pendingSkills.value = []
  alert('名刺を更新しました。')
}
</script>

<template>
  <div class="editor-panel">
    <h3>名刺編集フォーム</h3>

    <div class="input-group">
      <label>名前 / ふりがな</label>
      <div class="flex-row">
        <input v-model="myData.name" :placeholder="props.sample.name" />
        <input v-model="myData.ruby" :placeholder="props.sample.ruby" />
      </div>
    </div>

    <div class="input-group">
      <label>職業を選択</label>
      <div class="flex-column">
        <select
          v-model="selCat"
          @change="
            selSub = '';
            selRole = '';
          "
        >
          <option value="" disabled>大分類を選択</option>
          <option
            v-for="c in consts.jobTree"
            :key="c.category"
            :value="c.category"
          >
            {{ c.category }}
          </option>
        </select>

        <select v-if="selCat" v-model="selSub" @change="selRole = ''">
          <option value="" disabled>中分類を選択</option>
          <option
            v-for="s in consts.jobTree.find((c) => c.category === selCat)
              ?.subCategories"
            :key="s.name"
            :value="s.name"
          >
            {{ s.name }}
          </option>
        </select>

        <select v-if="selSub" v-model="selRole" @change="handleRoleChange">
          <option value="" disabled>職種を選択</option>
          <option
            v-for="r in consts.jobTree
              .find((c) => c.category === selCat)
              ?.subCategories.find((s) => s.name === selSub)?.roles"
            :key="r"
            :value="r"
          >
            {{ r }}
          </option>
        </select>

        <input
          v-if="isFreeInputNeeded"
          v-model="myData.job"
          placeholder="具体的な職種を自由に入力"
        />
      </div>
      <label style="margin-top: 10px">年齢</label>
      <input v-model.number="myData.age" type="number" placeholder="18" />
    </div>

    <div class="input-group">
      <label>キャッチコピー</label>
      <textarea
        v-model="myData.catchCopy"
        rows="3"
        maxlength="35"
        placeholder="例：綺麗なコーディングを心掛けております。"
      ></textarea>
    </div>

    <div class="input-group">
      <label>GitHub ID</label>
      <input v-model="myData.githubId" placeholder="GitHub ID" />
    </div>

    <div class="input-group">
      <label>スキル追加</label>
      <div class="flex-row" style="margin-bottom: 8px">
        <select v-model="choiceSkill" @change="selectedSkillSuggest = ''">
          <option value="">スキルの分類を選択</option>
          <option
            v-for="(_, key) in consts.skillSuggestions"
            :key="key"
            :value="key"
          >
            {{ key }}
          </option>
        </select>

        <select v-model="selectedSkillSuggest">
          <option value="">スキルを選択</option>
          <option
            v-for="s in consts.skillSuggestions[choiceSkill]"
            :key="s"
            :value="s"
          >
            {{ s }}
          </option>
        </select>
      </div>

      <div v-if="selectedSkillSuggest" class="flex-row">
        <input
          v-if="selectedSkillSuggest === 'その他'"
          v-model="newSkillInput"
          placeholder="入力してください"
          @keyup.enter="holdSkill"
        />
        <button class="add-btn" @click="holdSkill">追加する</button>
      </div>

      <div v-if="pendingSkills.length > 0" class="pending-area">
        <p class="section-title">反映待ち：</p>
        <div class="pending-tags">
          <span
            v-for="(ps, index) in pendingSkills"
            :key="index"
            class="tag pending"
          >
            {{ ps.name }}
            <button class="delete-tag" @click="removePendingSkill(index)">
              ×
            </button>
          </span>
        </div>
        <button class="update-btn" @click="commitSkills">名刺を更新する</button>
      </div>
    </div>

    <div class="share-area">
      <button class="share-btn" @click="$emit('copy-url')">
        共有URLを発行する
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor-panel {
  width: 100%;
  max-width: 450px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 15px;
  border-bottom: 1px solid #f9f9f9;
  padding-bottom: 10px;
}
.input-group label {
  display: block;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.flex-row {
  display: flex;
  gap: 8px;
}
.flex-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

input,
select,
textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.pending-area {
  margin-top: 15px;
  padding: 15px;
  background: #f0f7ff;
  border: 1px dashed #4a90e2;
  border-radius: 8px;
}
.pending-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag.pending {
  background: white;
  border: 1px solid #4a90e2;
  color: #4a90e2;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}
.delete-tag {
  background: none;
  border: none;
  color: #ff5252;
  font-weight: bold;
  cursor: pointer;
}

.add-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}
.update-btn {
  width: 100%;
  padding: 10px;
  background: #35495e;
  color: white;
  border: none;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
}
.share-btn {
  width: 100%;
  padding: 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.section-title {
  font-size: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  color: #999;
}
</style>
