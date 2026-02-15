<script setup lang="ts">
const props = defineProps<{
  myData: any;
  sample: any;
  isFlipped: boolean;
}>();

// カテゴリに応じた色分け
const getCategoryClass = (cat: string | number) => {
  if (!cat) return 'tool';
  // 文字列に変換してから判定する
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
      <div class="card-front">
        <div class="card-content-wrapper">
          <div class="name-area">
            <ruby class="card-name">
              {{ myData.name || sample.name }}
              <rt class="card-ruby">{{ myData.ruby || sample.ruby }}</rt>
            </ruby>
            <span v-if="myData.age" class="age-suffix">({{ myData.age }})</span>
          </div>

          <p class="card-job">{{ myData.job || sample.job }}</p>
          <hr class="separator" />

          <div class="card-skills-grid">
            <template
              v-if="myData.skill && Object.keys(myData.skill).length > 0"
            >
              <div
                v-for="(skills, category) in myData.skill"
                :key="category"
                class="skill-block"
              >
                <template v-if="skills && skills.length > 0">
                  <span class="skill-label">{{ category }}</span>
                  <div class="tags-container">
                    <span
                      v-for="s in skills"
                      :key="s"
                      class="tag"
                      :class="getCategoryClass(category)"
                    >
                      {{ s }}
                    </span>
                  </div>
                </template>
              </div>
            </template>
            <p v-else class="no-skill-hint">⚙️ 編集ボタンからスキルを追加</p>
          </div>

          <div class="card-footer">
            <a
              :href="myData.portfolio || sample.portfolio"
              target="_blank"
              class="card-link"
              @click.stop
            >
              Portfolio Website 🔗
            </a>
            <span class="hint">Click to Flip 🔄</span>
          </div>
        </div>
      </div>

      <div class="card-back">
        <div class="card-content-wrapper">
          <div class="back-section">
            <h3 class="section-title">CATCH COPY</h3>
            <p class="catch-copy">
              "{{ myData.catchCopy || 'No Catch Copy' }}"
            </p>
          </div>

          <div class="back-section github-section">
            <h3 class="section-title">GITHUB CONTRIBUTIONS</h3>
            <div class="grass-container">
              <img
                v-if="myData.githubId"
                :src="`https://ghchart.rshah.org/42b883/${myData.githubId}`"
                alt="GitHub Grass"
              />
              <p v-else class="no-data">GitHub IDを入力</p>
            </div>
          </div>

          <div class="card-footer back-footer">
            <span class="hint">Click to Flip 🔄</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');

.card-stage {
  width: 95vw;
  max-width: 520px;
  aspect-ratio: 1.618 / 1;
  perspective: 1500px;
  margin: 10px auto;
  font-family: 'Noto Serif JP', 'YuMincho', serif;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 2px;
  padding: 20px 25px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-front {
  border-top: 4px solid #2c3e50;
}
.card-back {
  transform: rotateY(180deg);
  border-top: 4px solid #34495e;
  background: #fafafa;
}

.card-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 名前・職種 */
.name-area {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.card-name {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.card-ruby {
  font-size: 9px;
  letter-spacing: 0.1em;
}
.age-suffix {
  font-size: 14px;
  color: #666;
}
.card-job {
  font-size: 13px;
  font-weight: 700;
  color: #2e7d32;
  margin: 2px 0 6px 0;
}
.separator {
  border: 0;
  border-top: 1px solid #444;
  margin: 0 0 12px 0;
}

/* スキルグリッド */
.card-skills-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 15px;
  row-gap: 8px;
  align-content: start;
  overflow-y: auto;
  padding-right: 4px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.card-skills-grid::-webkit-scrollbar {
  display: none;
  width: 0;
}

.skill-block {
  border-left: 1px solid #ddd;
  padding-left: 8px;
}
.skill-label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  color: #888;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.tag {
  font-size: 9px;
  padding: 0px 4px;
  border-radius: 1px;
  border: 1px solid #eee;
  font-family: sans-serif;
}

.tag.front {
  background: #f0fdf4;
  color: #166534;
}
.tag.back {
  background: #eff6ff;
  color: #1e40af;
}
.tag.infra {
  background: #fff7ed;
  color: #9a3412;
}
.tag.db {
  background: #f5f3ff;
  color: #5b21b6;
}
.tag.pm {
  background: #fef2f2;
  color: #991b1b;
}
.tag.tool {
  background: #f8fafc;
  color: #334155;
}

/* フッター */
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  border-top: 1px solid #f0f0f0;
  padding-top: 5px;
}
.back-footer {
  justify-content: flex-end;
}

.card-link {
  color: #2c3e50;
  text-decoration: none;
  border-bottom: 1px solid #2c3e50;
  font-weight: 700;
}
.hint {
  font-size: 9px;
  color: #ccc;
}

.back-section {
  margin-bottom: 15px;
}
.section-title {
  font-size: 9px;
  color: #999;
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
  letter-spacing: 0.1em;
}
.catch-copy {
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  margin: 15px 0;
  line-height: 1.6;
}
.grass-container img {
  width: 100%;
  border-radius: 2px;
}
.no-data {
  font-size: 11px;
  color: #999;
  text-align: center;
}
</style>
