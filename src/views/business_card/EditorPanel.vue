<script setup lang="ts">
import { ref, computed } from 'vue';
import consts from './consts.json';

const myData = defineModel<any>({ required: true });
const props = defineProps<{ sample: any }>();
const emit = defineEmits(['copy-url']);

const selCat = ref('');
const selSub = ref('');
const selRole = ref('');
const choiceSkill = ref('');
const selectedSkill = ref('');
const newSkillInput = ref('');
const pendingSkills = ref<{ name: string; type: string }[]>([]);

const isFreeInputNeeded = computed(() => {
  return (
    selRole.value === 'その他' ||
    selRole.value === '自由入力' ||
    selCat.value === 'その他(フリー記述)'
  );
});

const handleRoleChange = () => {
  myData.value.job = isFreeInputNeeded.value ? '' : selRole.value;
};

const holdSkill = () => {
  const skillName =
    selectedSkill.value === 'その他'
      ? newSkillInput.value
      : selectedSkill.value;
  if (skillName && !pendingSkills.value.some((s) => s.name === skillName)) {
    pendingSkills.value.push({
      name: String(skillName),
      type: String(choiceSkill.value)
    });
    newSkillInput.value = '';
    selectedSkill.value = '';
  }
};

const onSkillSelectChange = () => {
  if (selectedSkill.value === 'その他') return;
  if (selectedSkill.value !== '') holdSkill();
};

const removePendingSkill = (index: number) => {
  pendingSkills.value.splice(index, 1);
};

const commitSkills = () => {
  pendingSkills.value.forEach((item) => {
    if (!myData.value.skill[item.type]) myData.value.skill[item.type] = [];
    if (!myData.value.skill[item.type].includes(item.name))
      myData.value.skill[item.type].push(item.name);
  });
  pendingSkills.value = [];
};
</script>

<template>
  <div class="editor-panel">
    <div class="panel-header">
      <h3 class="panel-title">名刺を編集する</h3>
    </div>

    <div class="input-group">
      <label>基本情報</label>
      <div class="input-grid-name">
        <input
          v-model="myData.name"
          :placeholder="props.sample.name"
          class="base-input"
        />
        <input
          v-model="myData.ruby"
          :placeholder="props.sample.ruby"
          class="base-input"
        />
        <input
          v-model.number="myData.age"
          type="number"
          placeholder="年齢"
          class="base-input"
        />
      </div>
    </div>

    <div class="input-group">
      <label>職業</label>
      <div class="flex-stack">
        <select
          v-model="selCat"
          class="base-input"
          @change="
            selSub = '';
            selRole = '';
          "
        >
          <option value="" disabled>大分類</option>
          <option
            v-for="c in consts.jobTree"
            :key="c.category"
            :value="c.category"
          >
            {{ c.category }}
          </option>
        </select>
        <select
          v-if="selCat"
          v-model="selSub"
          class="base-input"
          @change="selRole = ''"
        >
          <option
            v-for="s in consts.jobTree.find((c) => c.category === selCat)
              ?.subCategories"
            :key="s.name"
            :value="s.name"
          >
            {{ s.name }}
          </option>
        </select>
        <select
          v-if="selSub"
          v-model="selRole"
          class="base-input"
          @change="handleRoleChange"
        >
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
          placeholder="具体的な職種を入力"
          class="base-input"
        />
      </div>
    </div>

    <div class="input-group">
      <label>PR・リンク</label>
      <textarea
        v-model="myData.catchCopy"
        rows="2"
        maxlength="35"
        placeholder="キャッチコピー（35文字以内）"
        class="base-input"
      ></textarea>
      <div class="input-grid-half">
        <input
          v-model="myData.githubId"
          placeholder="GitHub ID"
          class="base-input"
        />
        <input
          v-model="myData.portfolio"
          placeholder="Portfolio URL"
          class="base-input"
        />
      </div>
    </div>

    <div class="input-group">
      <label>スキルセットの追加</label>
      <div class="input-grid-half">
        <select
          v-model="choiceSkill"
          class="base-input"
          @change="selectedSkill = ''"
        >
          <option value="" disabled>カテゴリ</option>
          <option
            v-for="(_, key) in consts.skillSuggestions"
            :key="key"
            :value="key"
          >
            {{ key }}
          </option>
        </select>
        <select
          v-model="selectedSkill"
          class="base-input"
          @change="onSkillSelectChange"
        >
          <option value="" disabled>スキル選択</option>
          <option
            v-for="s in (consts.skillSuggestions as any)[choiceSkill]"
            :key="s"
            :value="s"
          >
            {{ s }}
          </option>
        </select>
      </div>
      <div v-if="selectedSkill === 'その他'" class="mt-8">
        <input
          v-model="newSkillInput"
          placeholder="自由入力してEnter"
          class="base-input"
          @keyup.enter="holdSkill"
        />
      </div>

      <div v-if="pendingSkills.length > 0" class="pending-section">
        <div class="pending-tags">
          <span v-for="(ps, i) in pendingSkills" :key="i" class="pending-tag">
            <span class="tag-type">{{ ps.type }}:</span>
            <span class="tag-name">{{ ps.name }}</span>
            <button class="remove-btn" @click="removePendingSkill(i)">✕</button>
          </span>
        </div>
        <button class="apply-btn" @click="commitSkills">名刺に反映する</button>
      </div>
    </div>

    <button class="primary-btn" @click="$emit('copy-url')">
      共有URLをコピーする
    </button>
  </div>
</template>

<style scoped>
.editor-panel {
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
.panel-header {
  border-left: 4px solid #10b981;
  padding-left: 12px;
  margin-bottom: 24px;
}
.panel-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}
.input-group {
  margin-bottom: 20px;
}
.input-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
  margin-bottom: 6px;
}
.input-grid-name {
  display: grid;
  grid-template-columns: 1fr 1fr 0.6fr;
  gap: 8px;
}
.input-grid-half {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}
.flex-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.base-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
.base-input:focus {
  outline: none;
  border-color: #10b981;
  border-width: 1px;
}
textarea.base-input {
  resize: none;
}
.pending-section {
  margin-top: 12px;
  padding: 16px;
  background: #f0fdf4;
  border-radius: 10px;
  border: 1px solid #dcfce7;
}
.pending-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.pending-tag {
  background: white;
  border: 1px solid #86efac;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.tag-type {
  color: #059669;
  font-weight: bold;
  font-size: 10px;
}
.tag-name {
  color: #1f2937;
}
.remove-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
}
.remove-btn:hover {
  color: #ef4444;
}

.apply-btn {
  width: 100%;
  padding: 10px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.apply-btn:hover {
  background: #047857;
}
.primary-btn {
  width: 100%;
  padding: 14px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}
.mt-8 {
  margin-top: 8px;
}
</style>
