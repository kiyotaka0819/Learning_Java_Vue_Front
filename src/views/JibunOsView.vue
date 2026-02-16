<script setup lang="ts">
import { ref, reactive, markRaw } from 'vue';
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
    content: win.type === 'component' ? componentMap[win.id] : win.content
  }))
);

const maxZ = ref(100);
const isDragging = ref(false);
const isResizing = ref(false);

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
            v-for="win in windows"
            :key="win.id"
            class="dock-item"
            @click="toggleWin(win.id)"
          >
            <span class="dock-icon">{{ win.icon }}</span>
            <div v-if="win.isOpen" class="active-dot"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.os-fullscreen-container {
  position: fixed;
  inset: 0;
  z-index: 999999;
  overflow: hidden;
  background: #000;
  font-family: sans-serif;
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

.mac-window {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(25px);
  border-radius: 12px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
  background: #fff;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.drag-overlay {
  position: absolute;
  inset: 0;
  z-index: 9999;
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
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.1) 50%);
}

.dock-container {
  position: absolute;
  bottom: 15px;
  width: 100%;
  display: center;
  justify-content: center;
  z-index: 50;
  display: flex;
}
.dock {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(30px);
  padding: 8px 12px;
  border-radius: 22px;
  display: flex;
  gap: 12px;
}
.dock-item {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}
.dock-item:hover {
  transform: scale(1.3) translateY(-10px);
}
.active-dot {
  position: absolute;
  bottom: -8px;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
}

/* 吸い込まれるアニメーション (Genie) */
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

.mac-content::-webkit-scrollbar {
  display: none;
}
.mac-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
</style>
