<script setup lang="ts">
import { ref, reactive, markRaw, onMounted, onUnmounted } from 'vue';
import {
  Power,
  Search,
  Contact,
  FileText,
  CloudSun,
  Play,
  Map as MapIcon,
  Code2,
  Settings,
  Monitor,
  Layers,
  Wrench,
  PlayCircle
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import consts from './jibun_os/consts.json';

import PokemonZukan from './pokemon_zukan/PokemonZukan.vue';
import BusinessCardApp from './business_card/BusinessCardApp.vue';
import ReadMeEditor from './jibun_os/ReadMeEditor.vue';
import WeatherApp from './weather/WeatherApp.vue';

const router = useRouter();

const iconMap: Record<string, any> = {
  pokedex: Search,
  'business-card': Contact,
  'code-editor': Code2,
  'readme-editor': FileText,
  Map: MapIcon,
  weather: CloudSun,
  'youtube-app': Play,
  utility: Layers,
  tools: Wrench,
  entertainment: PlayCircle
};

const componentMap: Record<string, any> = {
  pokedex: markRaw(PokemonZukan),
  'business-card': markRaw(BusinessCardApp),
  'readme-editor': markRaw(ReadMeEditor),
  weather: markRaw(WeatherApp)
};

const isMobile = () => window.innerWidth <= 600;

const windows = reactive(
  consts.initialWindows.map((win) => {
    const mobile = isMobile();
    const isMax = win.isOpen && mobile;
    return {
      ...win,
      isMaximized: isMax,
      // 最大化解除時のサイズを保持するプロパティを追加
      prevX: win.x,
      prevY: win.y,
      prevW: win.width,
      prevH: win.height,
      x: isMax ? 0 : win.x,
      y: isMax ? 32 : win.y,
      width: isMax ? window.innerWidth : win.width,
      height: isMax ? window.innerHeight - 32 : win.height,
      content:
        win.type === 'component' ? componentMap[win.id] : win.content || ''
    };
  })
);

/**
 * 最大化・元に戻す処理
 */
const maximizeWin = (win: any) => {
  if (isMobile()) return; // スマホは常に全画面なので無視

  if (!win.isMaximized) {
    // 現在の状態を保存
    win.prevX = win.x;
    win.prevY = win.y;
    win.prevW = win.width;
    win.prevH = win.height;
    // 全画面へ
    win.x = 0;
    win.y = 32;
    win.width = window.innerWidth;
    win.height = window.innerHeight - 32;
    win.isMaximized = true;
  } else {
    // 保存した状態に戻す
    win.x = win.prevX;
    win.y = win.prevY;
    win.width = win.prevW;
    win.height = win.prevH;
    win.isMaximized = false;
  }
};

const openFolderId = ref<string | null>(null);
const maxZ = ref(100);
const isDragging = ref(false);
const isResizing = ref(false);

const getCoords = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e && e.touches.length > 0)
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
};

const startDrag = (win: any, e: MouseEvent | TouchEvent) => {
  if (win.isMaximized || isMobile()) return;
  win.z = ++maxZ.value;
  isDragging.value = true;
  const { x, y } = getCoords(e);
  const startX = x - win.x;
  const startY = y - win.y;
  const onMove = (me: MouseEvent | TouchEvent) => {
    if (me.cancelable) me.preventDefault();
    const { x: curX, y: curY } = getCoords(me);
    win.x = curX - startX;
    win.y = curY - startY;
  };
  const onEnd = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
};

const startResize = (win: any, e: MouseEvent | TouchEvent) => {
  if (win.isMaximized || isMobile()) return;
  isResizing.value = true;
  win.z = ++maxZ.value;
  const { x: startX, y: startY } = getCoords(e);
  const startW = win.width;
  const startH = win.height;
  const onMove = (me: MouseEvent | TouchEvent) => {
    if (me.cancelable) me.preventDefault();
    const { x: curX, y: curY } = getCoords(me);
    win.width = Math.max(200, startW + (curX - startX));
    win.height = Math.max(150, startH + (curY - startY));
  };
  const onEnd = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
};

const focusWin = (win: any) => {
  win.z = ++maxZ.value;
};

/**
 * ウィンドウの表示・非表示を切り替える
 * 閉じるときにリソースを解放
 */
const toggleWin = (id: string) => {
  const win = windows.find((w) => w.id === id);
  if (!win) return;
  if (win.isOpen) {
    // 【クローズ処理】リソース解放
    if (win.type === 'iframe') {
      win._prevContent = win.content;
      win.content = '';
    }
    win.isOpen = false;
  } else {
    win.isOpen = true;
    win.z = ++maxZ.value;
    if (win.type === 'iframe' && win._prevContent) {
      win.content = win._prevContent;
    }
    // モバイルなら全画面
    if (isMobile()) {
      win.isMaximized = true;
      win.x = 0;
      win.y = 32;
      win.width = window.innerWidth;
      win.height = window.innerHeight - 32;
    }
  }
};

const toggleFolder = (id: string) => {
  openFolderId.value = openFolderId.value === id ? null : id;
};
const getWinById = (id: string) => windows.find((w) => w.id === id);
const logout = () => router.push('/apps');
const closeFolder = (e: MouseEvent | TouchEvent) => {
  if (!(e.target as HTMLElement).closest('.dock-item'))
    openFolderId.value = null;
};

onMounted(() => {
  document.addEventListener('mousedown', closeFolder);
  document.addEventListener('touchstart', closeFolder);
});
onUnmounted(() => {
  document.removeEventListener('mousedown', closeFolder);
  document.removeEventListener('touchstart', closeFolder);
});
</script>

<template>
  <div class="os-root">
    <div class="desktop">
      <div class="top-bar">
        <div class="top-bar-left">
          <Monitor :size="16" />
          <span class="app-name">Jibun OS</span>
          <span class="logout-icon" @click="logout">
            <Power :size="18" stroke-width="2.5" />
          </span>
        </div>
        <div class="top-bar-right">Feb 17 10:30 AM</div>
      </div>

      <div v-for="win in windows" :key="win.id">
        <Transition name="genie">
          <div
            v-if="win.isOpen"
            class="window"
            :class="{ 'is-max': win.isMaximized }"
            @mousedown="focusWin(win)"
            @touchstart="focusWin(win)"
            :style="{
              left: win.x + 'px',
              top: win.y + 'px',
              zIndex: win.z,
              width: win.width + 'px',
              height: win.height + 'px'
            }"
          >
            <div
              class="title-bar"
              @mousedown="startDrag(win, $event)"
              @touchstart="startDrag(win, $event)"
            >
              <div class="controls">
                <span class="dot red" @click.stop="toggleWin(win.id)"></span>
                <span
                  v-if="!isMobile()"
                  class="dot green"
                  @click.stop="maximizeWin(win)"
                ></span>
              </div>
              <div class="title-text">
                <component
                  :is="iconMap[win.id] || FileText"
                  :size="14"
                  style="margin-right: 6px; vertical-align: middle"
                />
                {{ win.title }}
              </div>
            </div>

            <div class="content-area">
              <div v-if="isDragging || isResizing" class="iframe-guard"></div>

              <component
                v-if="win.type === 'component'"
                :is="win.content"
                v-bind="win.props"
              />

              <iframe
                v-else-if="win.type === 'iframe'"
                :src="win.content"
                class="iframe"
                :style="{
                  pointerEvents: isDragging || isResizing ? 'none' : 'auto'
                }"
                allow="
                  accelerometer;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                  web-share;
                "
                allowfullscreen
              ></iframe>
            </div>

            <div
              v-if="!isMobile() && !win.isMaximized"
              class="resizer"
              @mousedown.stop.prevent="startResize(win, $event)"
              @touchstart.stop.prevent="startResize(win, $event)"
            ></div>
          </div>
        </Transition>
      </div>

      <div class="dock-container">
        <div
          v-if="openFolderId"
          class="folder-backdrop"
          @click="openFolderId = null"
        ></div>

        <div class="dock">
          <div
            v-for="cat in consts.categories"
            :key="cat.id"
            class="dock-item"
            @click.stop="toggleFolder(cat.id)"
          >
            <component
              :is="iconMap[cat.id] || Settings"
              :size="22"
              class="dock-icon-svg"
            />
            <div class="dock-label">{{ cat.title }}</div>

            <Transition name="pop">
              <div
                v-if="openFolderId === cat.id"
                class="folder-menu"
                @click.stop
              >
                <div
                  v-for="appId in cat.apps"
                  :key="appId"
                  class="folder-item"
                  @click.stop="
                    toggleWin(appId);
                    openFolderId = null;
                  "
                >
                  <component :is="iconMap[appId] || FileText" :size="18" />
                  <span class="folder-item-title">{{
                    getWinById(appId)?.title
                  }}</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* =========================================
   1. 基本レイアウト・背景
   ========================================= */
.os-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  overflow: hidden;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.desktop {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top left, #7105ec, #ff3d77);
  position: relative;
}

/* =========================================
   2. 上部ツールバー (Menu Bar)
   ========================================= */
.top-bar {
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  color: #fff;
  font-size: 13px;
  z-index: 10001;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.top-bar-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.app-name {
  font-weight: bold;
}

.logout-icon {
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  color: #fff;
}

.logout-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ff5f56;
}

/* =========================================
   3. ウィンドウ・タイトルバー (Windows)
   ========================================= */
.window {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  /* window自体がスクロールするとタイトルバーが逃げるので隠す */
  overflow: hidden;
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
}

.window.is-max {
  border-radius: 0;
  border: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.title-bar {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.controls {
  display: flex;
  gap: 8px;
  width: 50px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.red {
  background: #ff5f56;
}
.green {
  background: #27c93f;
}

.title-text {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-right: 50px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================================
   4. コンテンツエリア & アプリ中身
   ========================================= */
.content-area {
  flex: 1;
  position: relative;
  background: transparent;
  /* ここでスクロールを許可 */
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.iframe-guard {
  position: absolute;
  inset: 0;
  z-index: 9999;
  background: transparent;
}

.iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
  display: block;
}

.component-content {
  min-height: 100%;
  width: 100%;
}

/* =========================================
   5. ★モダン・スクロールバー (全アプリ共通)
   ========================================= */
/* エディター内部などの子要素すべてに適用 */
.content-area *,
.content-area::-webkit-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

/* Chrome/Safari系: 細くて丸いデザイン */
.content-area ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.content-area ::-webkit-scrollbar-track {
  background: transparent;
}

.content-area ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.content-area *:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
}

/* =========================================
   6. ドック & メニュー (Dock & Folders)
   ========================================= */
.dock-container {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 999999;
  pointer-events: none;
}

.folder-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: transparent;
  pointer-events: auto;
}

.dock {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  padding: 10px;
  border-radius: 20px;
  display: flex;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.dock-item {
  width: 55px;
  height: 55px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.dock-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
}

.dock-icon-svg {
  color: #fff;
}
.dock-label {
  font-size: 8px;
  font-weight: bold;
  color: #fff;
  margin-top: 2px;
}

/* 改善：ドックのフォルダメニュー */
.folder-menu {
  position: absolute;
  bottom: 75px;
  left: 50%;
  transform: translateX(-50%);
  /* 背景を白っぽくして文字を黒くし、視認性を大幅アップ */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 18px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 180px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  color: #222; /* テキストを濃く */
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.folder-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.folder-item svg {
  color: #555;
}

/* =========================================
   7. その他パーツ & レスポンシブ
   ========================================= */
.resizer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  z-index: 1000;
  background: linear-gradient(
    135deg,
    transparent 10px,
    rgba(0, 0, 0, 0.1) 10px
  );
}

@media (max-width: 600px) {
  .window {
    border-radius: 0;
  }
  .dock-container {
    bottom: 10px;
  }
  .dock {
    padding: 6px;
    gap: 6px;
    border-radius: 15px;
  }
  .dock-item {
    width: 48px;
    height: 48px;
  }
  .title-text {
    margin-right: 20px;
    font-size: 11px;
  }
}

/* アニメーション設定 */
.genie-enter-active,
.genie-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.genie-enter-from,
.genie-leave-to {
  transform: scale(0.5) translateY(100px);
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: all 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
