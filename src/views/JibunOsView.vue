<script setup lang="ts">
import { ref, reactive, markRaw, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import consts from './jibun_os/consts.json';
import PokemonZukan from './pokemon_zukan/PokemonZukan.vue';
import BusinessCardApp from './business_card/BusinessCardApp.vue';
import ReadMeEditor from './jibun_os/ReadMeEditor.vue';

const router = useRouter();

// コンポーネントの紐付け
const componentMap: Record<string, any> = {
  pokedex: markRaw(PokemonZukan),
  'business-card': markRaw(BusinessCardApp),
  'readme-editor': markRaw(ReadMeEditor)
};

// ウィンドウの状態管理
const windows = reactive(
  consts.initialWindows.map((win) => ({
    ...win,
    isMaximized: false,
    // typeがcomponentならcomponentMapから取得、そうでなければcontent(URL)をそのまま使用
    content: win.type === 'component' ? componentMap[win.id] : win.content || ''
  }))
);

// フォルダ（カテゴリ）の開閉状態
const openFolderId = ref<string | null>(null);

const maxZ = ref(100);
const isDragging = ref(false);
const isResizing = ref(false);

// ウィンドウ操作ロジック
const startDrag = (win: any, e: MouseEvent) => {
  if (win.isMaximized) return;
  win.z = ++maxZ.value;
  isDragging.value = true;
  const startX = e.clientX - win.x;
  const startY = e.clientY - win.y;

  const onMouseMove = (e: MouseEvent) => {
    win.x = e.clientX - startX;
    win.y = e.clientY - startY;
  };
  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const startResize = (win: any, e: MouseEvent) => {
  e.stopPropagation();
  if (win.isMaximized) return;
  isResizing.value = true;
  const startWidth = win.width;
  const startHeight = win.height;
  const startX = e.clientX;
  const startY = e.clientY;

  const onMouseMove = (e: MouseEvent) => {
    win.width = Math.max(300, startWidth + (e.clientX - startX));
    win.height = Math.max(200, startHeight + (e.clientY - startY));
  };
  const onMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
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

const toggleFolder = (folderId: string) => {
  openFolderId.value = openFolderId.value === folderId ? null : folderId;
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

// フォルダ外クリックで閉じる処理
const closeFolderOnOutsideClick = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.dock-item')) {
    openFolderId.value = null;
  }
};

onMounted(() =>
  document.addEventListener('mousedown', closeFolderOnOutsideClick)
);
onUnmounted(() =>
  document.removeEventListener('mousedown', closeFolderOnOutsideClick)
);
</script>

<template>
  <div
    class="os-fullscreen-container"
    :class="{ 'is-dragging': isDragging || isResizing }"
  >
    <div class="mac-desktop">
      <div class="top-bar">
        <div class="left">
          <span class="logo">🍎</span>
          <span class="menu-item bold">Jibun OS</span>
          <span class="menu-item logout-btn" @click="logout">⏻</span>
        </div>
        <div class="right">
          <span class="menu-item">Feb 16 12:00 PM</span>
        </div>
      </div>

      <div v-for="win in windows" :key="win.id">
        <Transition name="window-genie">
          <div
            v-show="win.isOpen"
            class="mac-window"
            :class="{ maximized: win.isMaximized }"
            @mousedown="focusWin(win)"
            :style="{
              left: win.x + 'px',
              top: win.y + 'px',
              zIndex: win.z,
              width: win.width + 'px',
              height: win.height + 'px'
            }"
          >
            <div
              class="mac-title-bar"
              :style="
                ['code-editor', 'readme-editor'].includes(win.id)
                  ? { background: '#333', color: '#fff' }
                  : {}
              "
              @mousedown="startDrag(win, $event)"
              @dblclick="toggleMaximize(win)"
            >
              <div class="traffic-lights">
                <span class="light red" @click.stop="win.isOpen = false"></span>
                <span
                  class="light green"
                  @click.stop="toggleMaximize(win)"
                ></span>
              </div>
              <div class="title">{{ win.title }}</div>
            </div>

            <div class="mac-content">
              <div v-if="isDragging || isResizing" class="drag-overlay"></div>
              <component
                v-if="win.type === 'component'"
                :is="win.content"
                v-bind="win.props"
              />
              <iframe
                v-else-if="win.type === 'iframe'"
                :src="win.content"
                frameborder="0"
                class="app-iframe"
              ></iframe>
            </div>

            <div
              v-if="!win.isMaximized"
              class="resizer"
              @mousedown="startResize(win, $event)"
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
            <div class="folder-label">{{ cat.title }}</div>

            <Transition name="folder-pop">
              <div v-if="openFolderId === cat.id" class="folder-menu">
                <div
                  v-for="appId in cat.apps"
                  :key="appId"
                  class="folder-app-item"
                  @click.stop="
                    toggleWin(appId);
                    openFolderId = null;
                  "
                >
                  <span class="folder-app-icon">{{
                    getWinById(appId)?.icon
                  }}</span>
                  <span class="folder-app-title">{{
                    getWinById(appId)?.title
                  }}</span>
                  <div
                    v-if="getWinById(appId)?.isOpen"
                    class="active-dot-small"
                  ></div>
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
/* 基本コンテナ */
.os-fullscreen-container {
  position: fixed;
  inset: 0;
  z-index: 999999;
  overflow: hidden;
  background: #000;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.mac-desktop {
  width: 100%;
  height: 100%;
  position: relative;
  background: radial-gradient(at 0% 0%, #7105ec 0%, #ff3d77 100%);
}
.top-bar {
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: white;
  font-size: 13px;
  z-index: 2000000;
}

/* ウィンドウ関連 */
.mac-window {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px) saturate(160%);
  border-radius: 12px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.is-dragging .mac-window {
  transition: none !important;
}
.mac-window.maximized {
  border-radius: 0;
}

.mac-title-bar {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  cursor: grab;
  background: rgba(0, 0, 0, 0.05);
}
.traffic-lights {
  display: flex;
  gap: 8px;
  width: 40px;
}
.light {
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
.title {
  flex-grow: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-right: 40px;
}

.mac-content {
  flex-grow: 1;
  position: relative;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  overflow: auto;
}
.mac-content::-webkit-scrollbar {
  width: 8px;
}
.mac-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.app-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
.resizer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 15px;
  height: 15px;
  cursor: nwse-resize;
}

/* ドックとフォルダ階層システム */
.dock-container {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 50;
}
.dock {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(30px);
  padding: 10px 15px;
  border-radius: 24px;
  display: flex;
  gap: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.dock-item {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}
.dock-item:hover {
  transform: scale(1.1) translateY(-5px);
}
.dock-icon {
  font-size: 24px;
}
.folder-label {
  font-size: 9px;
  color: #333;
  font-weight: bold;
  margin-top: 2px;
}

/* フォルダポップアップメニュー */
.folder-menu {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(40px);
  border-radius: 18px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.folder-app-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  transition: background 0.2s;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.folder-app-item:hover {
  background: rgba(255, 255, 255, 0.25);
}
.folder-app-icon {
  font-size: 20px;
}
.folder-app-title {
  font-size: 14px;
  white-space: nowrap;
}
.active-dot-small {
  position: absolute;
  right: 10px;
  width: 5px;
  height: 5px;
  background: #fff;
  border-radius: 50%;
}
.logout-btn {
  position: relative;
  cursor: pointer;
  padding: 2px 6px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

.logout-btn::after {
  content: 'ログアウト';
  position: absolute;
  top: 35px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.1s ease;
  transition-delay: 0.2s;
}

.logout-btn:hover::after {
  content: 'ログアウト';
  position: absolute;
  top: 35px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.logout-btn::after {
  transform: translateY(5px);
}

/* アニメーション */
.folder-pop-enter-active,
.folder-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.folder-pop-enter-from,
.folder-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.8);
}

.window-genie-enter-active,
.window-genie-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}
.window-genie-enter-from {
  transform: translateY(100px) scale(0.1);
  opacity: 0;
}
.window-genie-leave-to {
  transform: translateY(500px) scale(0.1) !important;
  opacity: 0;
}

.bold {
  font-weight: bold;
}
</style>
