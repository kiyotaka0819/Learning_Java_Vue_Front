<script setup lang="ts">
import { ref } from 'vue';

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
      <div class="card-front">
        <div class="card-content-wrapper">
          <div class="card-header-area">
            <div class="name-area">
              <ruby class="card-name">
                {{ myData.name || sample.name }}
                <rt class="card-ruby">{{ myData.ruby || sample.ruby }}</rt>
              </ruby>
              <span v-if="myData.age" class="age-suffix"
                >({{ myData.age }})</span
              >
            </div>
            <p class="card-job">{{ myData.job || sample.job }}</p>
            <hr class="separator" />
          </div>

          <div class="card-skills-scroll-container">
            <div class="card-skills-grid">
              <template
                v-for="(skills, category) in myData.skill"
                :key="category"
              >
                <div v-if="skills && skills.length > 0" class="skill-block">
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
              <p v-else class="no-data">GitHub IDを設定してください</p>
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
.card-stage {
  width: 100%;
  max-width: 550px;
  aspect-ratio: 1.618 / 1;
  perspective: 1500px;
  margin: 0 auto;
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
  border-radius: 4px;
  padding: 25px 30px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #d1d5db;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.card-back {
  transform: rotateY(180deg);
  background: #fafafa;
}
.card-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.name-area {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.card-name {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.card-ruby {
  font-size: 10px;
  letter-spacing: 0.1em;
}
.age-suffix {
  font-size: 16px;
  color: #6b7280;
}
.card-job {
  font-size: 14px;
  font-weight: 700;
  color: #166534;
  margin: 4px 0;
}
.separator {
  border: 0;
  border-top: 1px solid #374151;
  margin: 8px 0 12px 0;
}
.card-skills-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 10px;
}
.card-skills-scroll-container::-webkit-scrollbar {
  width: 4px;
}
.card-skills-scroll-container::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.card-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
  row-gap: 12px;
}
.skill-block {
  border-left: 2px solid #e5e7eb;
  padding-left: 10px;
}
.skill-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  color: #374151;
}
.tag.front {
  background: #f0fdf4;
  color: #166534;
  border-color: #dcfce7;
}
.tag.back {
  background: #eff6ff;
  color: #1e40af;
  border-color: #dbeafe;
}
.tag.infra {
  background: #fff7ed;
  color: #9a3412;
  border-color: #ffedd5;
}
.tag.db {
  background: #f5f3ff;
  color: #5b21b6;
  border-color: #ede9fe;
}
.tag.pm {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fee2e2;
}
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
  font-size: 11px;
}
.card-link {
  color: #1f2937;
  text-decoration: none;
  font-weight: 700;
  border-bottom: 1px solid #1f2937;
}
.hint {
  color: #d1d5db;
}
.back-section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 10px;
  color: #9ca3af;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 10px;
  letter-spacing: 0.1em;
}
.catch-copy {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin: 20px 0;
  line-height: 1.6;
}
.grass-container img {
  width: 100%;
  border-radius: 2px;
}
@media (max-width: 640px) {
  .card-stage {
    aspect-ratio: auto;
    min-height: 350px;
  }
  .card-skills-grid {
    grid-template-columns: 1fr;
  }
}
</style>
