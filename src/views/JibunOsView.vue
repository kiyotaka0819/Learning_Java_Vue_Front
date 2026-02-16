<script setup lang="ts">
import { ref, reactive, markRaw, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import consts from './jibun_os/consts.json';
import PokemonZukan from './pokemon_zukan/PokemonZukan.vue';
import BusinessCardApp from './business_card/BusinessCardApp.vue';
import ReadMeEditor from './jibun_os/ReadMeEditor.vue';

const router = useRouter();

const componentMap: Record<string, any> = {
  pokedex: markRaw(PokemonZukan),
  'business-card': markRaw(BusinessCardApp),
  'readme-editor': markRaw(ReadMeEditor)
};

const windows = reactive(
  consts.initialWindows.map((win) => ({
    ...win,
    isMaximized: false,
    content: win.type === 'component' ? componentMap[win.id] : win.content || ''
  }))
);

const openFolderId = ref<string | null>(null);
const maxZ = ref(100);
const isDragging = ref(false);
const isResizing = ref(false);

// 座標取得の共通化
const getCoords = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
};

const startDrag = (win: any, e: MouseEvent | TouchEvent) => {
  if (win.isMaximized) return;
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
    ['mousemove', 'mouseup', 'touchmove', 'touchend'].forEach((ev) =>
      document.removeEventListener(
        ev,
        ev.startsWith('touch') ? onMove : (onMove as any)
      )
    );
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchend', onEnd);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
};

const startResize = (win: any, e: MouseEvent | TouchEvent) => {
  e.stopPropagation();
  if (win.isMaximized) return;
  isResizing.value = true;

  const { x, y } = getCoords(e);
  const startW = win.width;
  const startH = win.height;
  const startX = x;
  const startY = y;

  const onMove = (me: MouseEvent | TouchEvent) => {
    if (me.cancelable) me.preventDefault();
    const { x: curX, y: curY } = getCoords(me);
    win.width = Math.max(300, startW + (curX - startX));
    win.height = Math.max(200, startH + (curY - startY));
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
const toggleWin = (id: string) => {
  const win = windows.find((w) => w.id === id);
  if (win) {
    win.isOpen = !win.isOpen;
    if (win.isOpen) win.z = ++maxZ.value;
  }
};
const toggleFolder = (id: string) => {
  openFolderId.value = openFolderId.value === id ? null : id;
};
const getWinById = (id: string) => windows.find((w) => w.id === id);
const toggleMaximize = (win: any) => {
  if (win.isMaximized) {
    win.x = win.oldX || 100;
    win.y = win.oldY || 100;
    win.width = win.oldWidth || 600;
    win.height = win.oldHeight || 450;
    win.isMaximized = false;
  } else {
    win.oldX = win.x;
    win.oldY = win.y;
    win.oldWidth = win.width;
    win.oldHeight = win.height;
    win.x = 0;
    win.y = 32;
    win.width = window.innerWidth;
    win.height = window.innerHeight - 32;
    win.isMaximized = true;
  }
};
const logout = () => router.push('/apps');
const closeFolder = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.dock-item'))
    openFolderId.value = null;
};

onMounted(() => document.addEventListener('mousedown', closeFolder));
onUnmounted(() => document.removeEventListener('mousedown', closeFolder));
</script>

<template>
  <div class="os-root" :class="{ 'is-dragging': isDragging || isResizing }">
    <div class="desktop">
      <div class="top-bar">
        <div class="top-bar-left">
          <span class="logo">🍎</span>
          <span class="app-name">Jibun OS</span>
          <span class="logout-icon" @click="logout">⏻</span>
        </div>
        <div class="top-bar-right">Feb 16 12:00 PM</div>
      </div>

      <div v-for="win in windows" :key="win.id">
        <Transition name="genie">
          <div
            v-show="win.isOpen"
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
              @dblclick="toggleMaximize(win)"
            >
              <div class="controls">
                <span class="dot red" @click.stop="win.isOpen = false"></span>
                <span
                  class="dot green"
                  @click.stop="toggleMaximize(win)"
                ></span>
              </div>
              <div class="title-text">{{ win.title }}</div>
            </div>

            <div class="content-area">
              <div v-if="isDragging || isResizing" class="overlay"></div>
              <component
                v-if="win.type === 'component'"
                :is="win.content"
                v-bind="win.props"
              />
              <iframe
                v-else-if="win.type === 'iframe'"
                :src="win.content"
                class="iframe"
              ></iframe>
            </div>

            <div
              v-if="!win.isMaximized"
              class="resizer"
              @mousedown="startResize(win, $event)"
              @touchstart="startResize(win, $event)"
            ></div>
          </div>
        </Transition>
      </div>

      <div class="dock-container">
        <div class="dock">
          <div
            v-for="cat in consts.categories"
            :key="cat.id"
            class="dock-item"
            @click="toggleFolder(cat.id)"
          >
            <span class="dock-icon">{{ cat.icon }}</span>
            <div class="dock-label">{{ cat.title }}</div>
            <Transition name="pop">
              <div v-if="openFolderId === cat.id" class="folder-menu">
                <div
                  v-for="appId in cat.apps"
                  :key="appId"
                  class="folder-item"
                  @click.stop="
                    toggleWin(appId);
                    openFolderId = null;
                  "
                >
                  <span>{{ getWinById(appId)?.icon }}</span>
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
/* 全体 */
.os-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  overflow: hidden;
  touch-action: none;
  font-family: sans-serif;
}
.desktop {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top left, #7105ec, #ff3d77);
  position: relative;
}

/* トップバー */
.top-bar {
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  color: #fff;
  font-size: 13px;
  z-index: 10000;
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
  padding: 2px 5px;
  transition: 0.2s;
}
.logout-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

/* ウィンドウ */
.window {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px) saturate(150%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: opacity 0.2s;
}
.is-dragging .window {
  transition: none !important;
}
.window.is-max {
  border-radius: 0;
}

.title-bar {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.05);
  cursor: grab;
  user-select: none;
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
}

.content-area {
  flex: 1;
  position: relative;
  background: transparent;
  overflow: auto;
}
.iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}
.overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
}
.resizer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  z-index: 10;
}

/* ドック */
.dock-container {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.dock {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  padding: 10px;
  border-radius: 20px;
  display: flex;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  position: relative;
}
.dock-icon {
  font-size: 22px;
}
.dock-label {
  font-size: 8px;
  font-weight: bold;
  color: #fff;
}

/* フォルダメニュー */
.folder-menu {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(30px);
  border-radius: 15px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: 0.2s;
}
.folder-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* レスポンシブ */
@media (max-width: 600px) {
  .window:not(.is-max) {
    width: 95% !important;
    left: 2.5% !important;
    height: 60% !important;
  }
  .dock-item {
    width: 45px;
    height: 45px;
  }
  .title-text {
    font-size: 11px;
  }
}

/* アニメーション */
.genie-enter-active,
.genie-leave-active {
  transition: all 0.3s ease;
}
.genie-enter-from,
.genie-leave-to {
  transform: scale(0.5) translateY(100px);
  opacity: 0;
}
.pop-enter-active {
  transition: all 0.2s;
}
.pop-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
