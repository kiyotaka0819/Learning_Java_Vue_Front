<script setup lang="ts">
import { ref, computed } from 'vue';
import consts from './consts.json';

const myData = defineModel<any>({ required: true });
const props = defineProps<{ sample: any }>();
const emit = defineEmits(['copy-url']);

// --- 状態管理 ---
const selCat = ref('');
const selSub = ref('');
const selRole = ref('');
const choiceSkill = ref('');
const selectedSkill = ref('');
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

const handleRoleChange = () => {
  myData.value.job = isFreeInputNeeded.value ? '' : selRole.value;
};

const holdSkill = () => {
  const skillName =
    selectedSkill.value === 'その他'
      ? newSkillInput.value
      : selectedSkill.value;

  if (skillName && !pendingSkills.value.some((s) => s.name === skillName)) {
    pendingSkills.value.push({ name: skillName, type: choiceSkill.value });
    newSkillInput.value = '';
    selectedSkill.value = '';
  }
};

const onSkillSelectChange = () => {
  if (selectedSkill.value === 'その他') return;
  if (selectedSkill.value !== '') {
    holdSkill();
  }
};

const removePendingSkill = (index: number) => {
  pendingSkills.value.splice(index, 1);
};

const commitSkills = () => {
  pendingSkills.value.forEach((item) => {
    if (!myData.value.skill[item.type]) {
      myData.value.skill[item.type] = [];
    }
    if (!myData.value.skill[item.type].includes(item.name)) {
      myData.value.skill[item.type].push(item.name);
    }
  });
  pendingSkills.value = [];
  alert('名刺を更新しました！');
};
</script>

<template>
  <div class="editor-panel">
    <div class="header">
      <h3 class="title">名刺を編集する</h3>
      <p class="subtitle">
        情報を入力して自分だけのエンジニア名刺を作成しましょう
      </p>
    </div>

    <section class="form-section">
      <label class="group-label">基本情報</label>
      <div class="input-grid">
        <div class="field">
          <label>名前</label>
          <input
            v-model="myData.name"
            :placeholder="props.sample.name"
            class="base-input"
          />
        </div>
        <div class="field">
          <label>ふりがな</label>
          <input
            v-model="myData.ruby"
            :placeholder="props.sample.ruby"
            class="base-input"
          />
        </div>
      </div>
      <div class="field mt-10">
        <label>年齢</label>
        <input
          v-model.number="myData.age"
          type="number"
          placeholder="32"
          class="base-input age-input"
        />
      </div>
    </section>

    <section class="form-section">
      <label class="group-label">職業・役割</label>
      <div class="flex-column">
        <select
          v-model="selCat"
          class="base-input"
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

        <select
          v-if="selCat"
          v-model="selSub"
          class="base-input"
          @change="selRole = ''"
        >
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

        <select
          v-if="selSub"
          v-model="selRole"
          class="base-input"
          @change="handleRoleChange"
        >
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
          class="base-input free-input"
        />
      </div>
    </section>

    <section class="form-section">
      <label class="group-label">自己PR</label>
      <textarea
        v-model="myData.catchCopy"
        rows="2"
        maxlength="35"
        placeholder="例：可変性、可読性を考慮したコーディングを意識しております。"
        class="base-input"
      ></textarea>
    </section>

    <section class="form-section">
      <label class="group-label">リンク設定</label>
      <div class="field">
        <label>GitHub ID</label>
        <input
          v-model="myData.githubId"
          placeholder="ユーザーIDのみ入力"
          class="base-input"
        />
      </div>
      <div class="field mt-10">
        <label>Portfolio URL</label>
        <input
          v-model="myData.portfolio"
          placeholder="https://..."
          class="base-input"
        />
      </div>
    </section>

    <section class="form-section">
      <label class="group-label">スキルセット追加</label>
      <div class="skill-input-row">
        <select
          v-model="choiceSkill"
          class="base-input skill-select"
          @change="selectedSkill = ''"
        >
          <option value="">分類</option>
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
          class="base-input skill-select"
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

      <div v-if="selectedSkill === 'その他'" class="mt-10">
        <input
          v-model="newSkillInput"
          placeholder="直接入力してEnter"
          class="base-input"
          @keyup.enter="holdSkill"
        />
      </div>

      <div v-if="pendingSkills.length > 0" class="pending-area">
        <p class="pending-title">選択中のスキル</p>
        <div class="pending-tags">
          <span
            v-for="(ps, index) in pendingSkills"
            :key="index"
            class="tag-chip"
          >
            {{ ps.name }}
            <button class="remove-btn" @click="removePendingSkill(index)">
              ×
            </button>
          </span>
        </div>
        <button class="commit-btn" @click="commitSkills">
          名刺データへ適用
        </button>
      </div>
    </section>

    <footer class="panel-footer">
      <button class="share-btn" @click="$emit('copy-url')">
        共有URLを発行する
      </button>
    </footer>
  </div>
</template>

<style scoped>
.editor-panel {
  flex: 1;
  max-width: 800px;
  min-width: 350px; 
  box-sizing: border-box;
  background: #ffffff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  color: #333;
}

/* ヘッダー */
.header {
  margin-bottom: 25px;
  border-left: 4px solid #42b883;
  padding-left: 15px;
}
.title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  color: #2c3e50;
}
.subtitle {
  font-size: 12px;
  color: #7f8c8d;
  margin: 4px 0 0;
}

/* セクション設定 */
.form-section {
  margin-bottom: 24px;
}
.group-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}
.field label {
  display: block;
  font-size: 11px;
  color: #95a5a6;
  margin-bottom: 4px;
}

/* 入力欄の共通デザイン */
.base-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 12px 14px;
  border: 1.5px solid #edf2f7;
  border-radius: 8px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
  box-sizing: border-box;
  color: #2d3748;
}

.base-input:focus {
  outline: none;
  border-color: #42b883;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.1);
}

/* 特殊な入力欄 */
.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.flex-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.flex-row {
  display: flex;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}
.skill-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.age-input {
  width: 80px;
}
.free-input {
  border-style: dashed;
  border-color: #cbd5e0;
}

textarea.base-input {
  min-height: 60px;
  line-height: 1.5;
  resize: vertical;
}

/* 反映待ちエリア */
.pending-area {
  margin-top: 15px;
  padding: 15px;
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 10px;
}
.pending-title {
  font-size: 11px;
  font-weight: 700;
  color: #2f855a;
  margin-bottom: 8px;
}
.pending-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-chip {
  background: #fff;
  border: 1px solid #9ae6b4;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #276749;
  display: flex;
  align-items: center;
  gap: 5px;
}
.remove-btn {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
}

.commit-btn {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background: #2f855a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* フッター・共有ボタン */
.panel-footer {
  margin-top: 30px;
}
.share-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #42b883 0%, #34495e 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

.mt-10 {
  margin-top: 10px;
}

.skill-select {
  flex: 1;
  min-width: 150px;
}
</style>
