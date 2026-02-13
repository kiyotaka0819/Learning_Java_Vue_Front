<script setup lang="ts">
// Propsの定義
defineProps<{ myData: any; sample: any; isFlipped: boolean }>();

// カテゴリー名によってタグの色を変える関数
const getCategoryClass = (cat: string) => {
  if (cat.includes('フロント')) return 'front';
  if (cat.includes('バック')) return 'back';
  if (cat.includes('インフラ')) return 'infra';
  return 'tool'; // Slackとかツール系
};
</script>

<template>
  <div class="card-stage">
    <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
      <div class="card-front">
        <div class="card-content">
          <div class="name-area">
            <ruby class="card-name">
              {{ myData.name || sample.name }}
              <rt class="card-ruby">{{ myData.ruby || sample.ruby }}</rt>
            </ruby>
            <span v-if="myData.age" class="age-suffix">({{ myData.age }})</span>
          </div>

          <p class="card-job">{{ myData.job || sample.job }}</p>

          <div class="card-skills">
            <div
              v-for="(skills, category) in myData.skill"
              :key="category"
              class="skill-row"
            >
              <template v-if="skills && skills.length > 0">
                <span class="skill-label">{{ category.toUpperCase() }}:</span>
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
        <div class="card-content">
          <div class="back-header">
            <h3 class="section-title">CATCH COPY</h3>
            <p class="catch-copy">
              "{{ myData.catchCopy || 'No Catch Copy' }}"
            </p>
          </div>

          <div class="github-section">
            <p class="section-title">GITHUB CONTRIBUTIONS</p>
            <div class="grass-container">
              <img
                v-if="myData.githubId"
                :src="`https://ghchart.rshah.org/42b883/${myData.githubId}`"
                alt="GitHub Grass"
              />
              <p v-else class="no-data">GitHub IDを入力して草を表示</p>
            </div>
          </div>
          <span class="hint">Click to Flip 🔄</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基本サイズ設定 */
.card-stage {
  width: 600px;
  height: 360px;
  perspective: 1500px;
  cursor: pointer;
  margin: 20px 0;
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
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.card-front {
  background: white;
  border-top: 12px solid #42b883;
}

.card-back {
  background: #fdfdfd;
  transform: rotateY(180deg);
  border-top: 12px solid #35495e;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.name-area {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 5px;
}

.card-name {
  font-family: 'Noto Serif JP', serif;
  font-size: 40px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

.card-ruby {
  font-size: 14px;
  color: #7f8c8d;
}

.age-suffix {
  font-size: 20px;
  color: #444;
}

.card-job {
  font-size: 20px;
  color: #42b883;
  font-weight: bold;
  margin-top: 4px;
  margin-bottom: 8px;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
  flex-shrink: 0;
}

/* スキルエリア */
.card-skills {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  margin: 15px 0;
  padding-right: 10px;
}

/* カテゴリーごとの行 */
.skill-row {
  margin-bottom: 15px;
}

/* 追加：スキルラベル（TOOL: とか BACKEND:） */
.skill-label {
  font-size: 11px;
  font-weight: bold;
  color: #aaa;
  display: block;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  white-space: nowrap;
  font-weight: 500;
}

.tag.back {
  background: #e1f5fe;
  border: 1px solid #b3e5fc;
  color: #0288d1;
}
.tag.front {
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  color: #2e7d32;
}
.tag.infra {
  background: #fff3e0;
  border: 1px solid #ffe0b2;
  color: #e65100;
}
.tag.tool {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #616161;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.card-link {
  font-size: 16px;
  color: #42b883;
  text-decoration: none;
  font-weight: bold;
}

.hint {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 11px;
  color: #bbb;
}

.catch-copy {
  font-family: 'Noto Serif JP', serif;
  font-size: 20px;
  font-weight: bold;
  color: #35495e;
  text-align: center;
  margin: 20px 0;
  line-height: 1.6;
}

.github-section img {
  width: 100%;
  border-radius: 8px;
}

.section-title {
  font-size: 12px;
  margin-bottom: 10px;
  font-weight: bold;
  color: #999;
  border-left: 4px solid #42b883;
  padding-left: 8px;
}

.no-data {
  font-size: 12px;
  color: #ccc;
  text-align: center;
  margin-top: 20px;
}
</style>
