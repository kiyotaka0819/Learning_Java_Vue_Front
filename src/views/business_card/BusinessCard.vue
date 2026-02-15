<script setup lang="ts">
const props = defineProps<{
  myData: any;
  sample: any;
  isFlipped: boolean;
}>();

const getCategoryClass = (cat: string | number) => {
  if (!cat) return 'tool';
  const c = String(cat).toLowerCase();
  if (c.includes('フロント')) return 'front';
  if (c.includes('バック')) return 'back';
  if (c.includes('インフラ')) return 'infra';
  if (c.includes('db')) return 'db';
  if (c.includes('プロジェクト')) return 'pm';
  return 'tool';
};
</script>

<template>
  <div class="card-stage">
    <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
      <div class="card-side card-front">
        <div class="card-body">
          <div class="header">
            <div class="name-row">
              <ruby class="name">
                {{ myData.name || sample.name }}
                <rt>{{ myData.ruby || sample.ruby }}</rt>
              </ruby>
              <span v-if="myData.age" class="age">({{ myData.age }})</span>
            </div>
            <div class="job">{{ myData.job || sample.job }}</div>
            <hr class="line" />
          </div>

          <div class="skills-container">
            <div class="skills-grid">
              <template
                v-for="(skills, category) in myData.skill"
                :key="category"
              >
                <div v-if="skills && skills.length > 0" class="skill-group">
                  <label class="cat-label">{{ category }}</label>
                  <div class="tags">
                    <span
                      v-for="s in skills"
                      :key="s"
                      class="tag"
                      :class="getCategoryClass(category)"
                    >
                      {{ s }}
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="footer">
            <a
              :href="myData.portfolio || sample.portfolio"
              target="_blank"
              class="link"
              >Portfolio 🔗</a
            >
            <span class="flip-hint">Click to Flip 🔄</span>
          </div>
        </div>
      </div>

      <div class="card-side card-back">
        <div class="card-body">
          <div class="section">
            <label class="cat-label">CATCH COPY</label>
            <p class="copy">"{{ myData.catchCopy || 'No Catch Copy' }}"</p>
          </div>
          <div class="section">
            <label class="cat-label">GITHUB CONTRIBUTIONS</label>
            <div class="grass">
              <img
                v-if="myData.githubId"
                :src="`https://ghchart.rshah.org/42b883/${myData.githubId}`"
              />
              <p v-else>GitHub ID not set</p>
            </div>
          </div>
          <div class="footer">
            <span class="flip-hint">Click to Flip 🔄</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&family=Noto+Sans+JP:wght@400;700&display=swap');

/* 土台設定 */
.card-stage {
  width: 100%;
  max-width: 550px;
  perspective: 1500px;
}

.card-inner {
  position: relative;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-inner.is-flipped { transform: rotateY(180deg); }

.card-side {
  width: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  background: white;
  box-sizing: border-box;
}

.card-front { 
  position: relative; 
  padding: 30px; 
  min-height: 340px; 
  display: flex;
  flex-direction: column;
}

.card-back {
  position: absolute;
  top: 50%; left: 0;
  transform: translateY(-50%) rotateY(180deg);
  height: 100%; 
  max-height: 340px;
  padding: 30px; 
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* タイポグラフィ */
.name-row { 
  display: flex; 
  align-items: baseline; 
  gap: 12px;
  font-family: 'Noto Serif JP', serif;
}
.name { font-size: 2rem; font-weight: 700; color: #1a202c; }
.age { font-size: 1.2rem; color: #718096; }

.job { 
  color: #059669; 
  font-weight: bold; 
  margin-top: 8px; 
  font-size: 1.1rem; 
  font-family: 'Noto Sans JP', sans-serif; 
}

.line { border: none; border-top: 2px solid #1a202c; margin: 15px 0; }

/* スキルセクションのレイアウト */
.skills-container { flex: 1; margin-bottom: 20px; }
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.skill-group { border-left: 2px solid #e2e8f0; padding-left: 10px; }

.cat-label { 
  font-size: 11px; 
  font-weight: 800; 
  color: #94a3b8; 
  text-transform: uppercase; 
  margin-bottom: 8px; 
  display: block; 
  font-family: 'Noto Sans JP', sans-serif;
}

.tags { display: flex; flex-wrap: wrap; gap: 4px; }

/* 【復活】スキルタグの色分け設定 */
.tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-family: 'Noto Sans JP', sans-serif;
}
/* カテゴリ別の配色 */
.tag.front { background: #f0fdf4; color: #166534; border-color: #dcfce7; }
.tag.back { background: #eff6ff; color: #1e40af; border-color: #dbeafe; }
.tag.infra { background: #fff7ed; color: #9a3412; border-color: #ffedd5; }
.tag.db { background: #f5f3ff; color: #5b21b6; border-color: #ede9fe; }
.tag.pm { background: #fef2f2; color: #991b1b; border-color: #fee2e2; }
.tag.tool { background: #f8fafc; color: #64748b; border-color: #e2e8f0; }

/* 裏面：キャッチコピー */
.copy { 
  font-size: 1.2rem; 
  font-weight: bold; 
  text-align: center; 
  margin: 20px 0; 
  color: #1a202c; 
  font-family: 'Noto Serif JP', serif;
  line-height: 1.6;
}

.grass {
  width: 100%;
  overflow: hidden;
  margin-top: 10px;
  background: #fff;
  border-radius: 4px;
  padding: 5px;
  box-sizing: border-box;
}

.grass img {
  width: 100%;
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain; 
  filter: saturate(1.2);
}

/* フッター */
.footer {
  margin-top: auto;
  width: 100%; /* これを明示 */
  display: flex;
  justify-content: space-between; /* 両端に振り分ける */
  align-items: center;
  font-size: 11px; /* 少し小さくして上品に */
  font-family: 'Noto Sans JP', sans-serif;
  color: #94a3b8;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  box-sizing: border-box; /* はみ出し防止 */
}

.link { 
  color: #1e293b; 
  text-decoration: none; 
  font-weight: bold; 
  border-bottom: 1px solid #cbd5e0;
  flex-shrink: 0;
}

.flip-hint { 
  font-style: italic;
  text-align: right;
  flex-grow: 1;
}

/* スマホ対応 */
@media (max-width: 600px) {
  .card-front { padding: 20px; }
  .card-back { padding: 20px; }
  .name { font-size: 1.6rem; }
  .skills-grid { grid-template-columns: 1fr; }
}
</style>