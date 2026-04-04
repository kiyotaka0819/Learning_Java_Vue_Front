<script setup>
import { reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import { useTetris } from '../composables/useTetris'
import TetrisBoard from '../components/TetrisBoard.vue'

const tetris = useTetris()

const settings = reactive({
  difficulty: 'normal',
  dropIntervalSec: 0.5,
  deadLineRows: 6,
})

const game = reactive({
  phase: 'setup', 
  status: 'playing',
  ap: 0,
  orders: [],
  history: [],
  msg: '難易度を選んで入店してや！'
})

const newOrder = reactive({ name: '', price: 300 })
const rouletteMino = ref(null)

const preventScroll = (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', preventScroll))
onUnmounted(() => window.removeEventListener('keydown', preventScroll))

const applyDifficulty = () => {
  const levels = { easy: 0.8, normal: 0.5, hard: 0.2, death: 0.05 }
  settings.dropIntervalSec = levels[settings.difficulty]
  game.phase = 'manual'
  game.msg = 'ガチプレイ開始！'
  tetris.spawnMino()
}

watch(() => tetris.isDead.value, (dead) => {
  if (dead && game.phase === 'manual') {
    game.phase = 'izakaya'
    game.status = 'standby'
    tetris.cleanupForRestart(settings.deadLineRows)
    settings.dropIntervalSec = 1.0 
    game.msg = '全滅！ここからは食って取り返せ！'
  }
})

// 【修正箇所】ミノが固まった後の処理
const handleLock = () => {
  tetris.lockMino()
  if (game.phase === 'manual') {
    // 自力期は即座に次を出す
    if (!tetris.spawnMino()) {
      // 死亡判定はwatchが拾う
    }
  } else {
    // 居酒屋期は待機状態へ
    game.status = 'standby'
    game.msg = '着地！次は何を食う？'
  }
}

const handlePlace = (colIndex) => {
  if (game.phase !== 'izakaya' || game.status !== 'playing') return
  const minoWidth = tetris.currentMino.value.shape[0].length
  tetris.minoPos.x = Math.min(Math.max(colIndex, 0), tetris.COLS - minoWidth)
  while (tetris.move(0, 1)) {}
  handleLock()
}

const startRoulette = () => {
  if (game.ap <= 0) return
  game.status = 'roulette'
  game.msg = '注文中...'
  let count = 0
  const interval = setInterval(() => {
    const key = tetris.MINO_KEYS[Math.floor(Math.random() * tetris.MINO_KEYS.length)]
    rouletteMino.value = tetris.MINOS[key]
    if (++count >= 12) {
      clearInterval(interval)
      tetris.spawnMino(key)
      game.ap--
      game.status = 'playing'
    }
  }, 100)
}

const placeOrder = () => {
  if (!newOrder.name) return
  const item = { id: Date.now(), name: newOrder.name, price: Number(newOrder.price), status: 'eating' }
  game.orders.push(item)
  if (!game.history.find(h => h.name === item.name)) {
    game.history.push({ name: item.name, price: item.price })
  }
  newOrder.name = ''
}

const reOrder = (h) => {
  game.orders.push({ id: Date.now(), name: h.name, price: h.price, status: 'eating' })
}

const finishDish = (index) => {
  const item = game.orders[index]
  item.status = 'done'
  game.ap += 1
  if (item.name.toUpperCase() === 'J' || Math.random() < 0.1) {
    tetris.forceClearLine()
    game.msg = 'ジョーカー！一列消去！'
  } else {
    game.msg = '完食！APチャージ！'
  }
}
</script>

<template>
  <div class="play-root">
    <div v-if="game.phase === 'setup'" class="setup-screen">
      <div class="setup-card">
        <h1>🏮 居酒屋テトリス</h1>
        <div class="setup-item">
          <label>難易度（落下速度）</label>
          <div class="btn-group">
            <button v-for="l in ['easy', 'normal', 'hard', 'death']" :key="l" 
              @click="settings.difficulty = l" :class="{ active: settings.difficulty === l }">
              {{ {easy:'かんたん', normal:'普通', hard:'むずい', death:'地獄'}[l] }}
            </button>
          </div>
        </div>
        <div class="setup-item">
          <label class="no-wrap">デッドライン（上から{{ settings.deadLineRows }}行目）</label>
          <input type="range" min="1" max="15" v-model.number="settings.deadLineRows" class="wide-range">
        </div>
        <button class="btn-start-game" @click="applyDifficulty">いざ、入店！</button>
      </div>
    </div>

    <div v-else class="game-container">
      <header class="game-header">
        <div class="phase-badge" :class="game.phase">
          {{ game.phase === 'manual' ? '🔥 ガチプレイ期' : '🏮 大食い復活期' }}
        </div>
        <div class="ap-display">AP: <span>{{ game.ap }}</span></div>
      </header>

      <div class="main-layout">
        <section class="game-area">
          <div class="msg-box">{{ game.msg }}</div>
          <div class="board-wrapper">
            <div v-if="game.status === 'roulette'" class="roulette-overlay">
              <div class="r-mino">
                <div v-for="(row, y) in rouletteMino?.shape" :key="y" class="r-row">
                  <div v-for="(cell, x) in row" :key="x" class="r-cell" 
                       :style="{ backgroundColor: cell ? rouletteMino.color : 'transparent' }"></div>
                </div>
              </div>
            </div>
            <TetrisBoard :tetris="tetris" :settings="settings" :gameState="game.status" @lock="handleLock" @place="handlePlace" />
          </div>
          <div class="controls" v-if="game.phase === 'izakaya'">
            <button v-if="game.status === 'standby'" @click="startRoulette" class="btn-spawn" :disabled="game.ap <= 0">
              {{ game.ap > 0 ? 'ブロックを注文' : '完食してAPを貯めろ' }}
            </button>
          </div>
        </section>

        <aside class="sidebar" v-if="game.phase === 'izakaya'">
          <div class="order-form">
            <input v-model="newOrder.name" placeholder="商品名">
            <input v-model.number="newOrder.price" type="number" class="p-input">
            <button @click="placeOrder">注文</button>
          </div>
          <div class="history-area" v-if="game.history.length">
            <p>🔁 おかわり</p>
            <div class="h-btns">
              <button v-for="h in game.history" :key="h.name" @click="reOrder(h)">{{ h.name }}</button>
            </div>
          </div>
          <div class="order-list">
            <div v-for="(o, i) in game.orders.slice().reverse()" :key="o.id" class="order-item" :class="o.status">
              <div class="o-txt">
                <span class="n">{{ o.name }}</span>
                <span class="p">¥{{ o.price }}</span>
              </div>
              <button v-if="o.status === 'eating'" @click="finishDish(game.orders.indexOf(o))">完食</button>
              <span v-else>✔</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* セットアップ画面の修正 */
.setup-screen { display: flex; align-items: center; justify-content: center; height: 100vh; background: #111; }
.setup-card { background: #222; padding: 30px; border-radius: 20px; border: 2px solid #ffa502; width: 380px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
.setup-item { margin: 25px 0; }
.no-wrap { white-space: nowrap; display: block; margin-bottom: 10px; font-weight: bold; }
.wide-range { width: 100%; cursor: pointer; }

/* 既存スタイル */
.play-root { background: #111; color: #fff; min-height: 100vh; overflow: hidden; }
.btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-group button { padding: 12px; background: #333; color: #fff; border: 1px solid #444; border-radius: 8px; cursor: pointer; }
.btn-group button.active { background: #ffa502; color: #000; font-weight: bold; border-color: #fff; }
.btn-start-game { width: 100%; padding: 15px; background: #ff4757; border: none; border-radius: 12px; color: #fff; font-size: 1.2em; font-weight: bold; margin-top: 10px; cursor: pointer; transition: 0.2s; }
.btn-start-game:hover { transform: scale(1.02); background: #ff6b81; }

.game-container { max-width: 950px; margin: 0 auto; padding: 10px; }
.main-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
.game-header { display: flex; justify-content: space-between; align-items: center; background: #222; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #333; }
.phase-badge { padding: 5px 20px; border-radius: 20px; font-weight: bold; font-size: 0.9em; }
.phase-badge.manual { background: #ff4757; box-shadow: 0 0 10px rgba(255, 71, 87, 0.4); }
.phase-badge.izakaya { background: #ffa502; color: #000; }
.ap-display span { color: #2ed573; font-size: 1.6em; font-weight: bold; }
.msg-box { height: 45px; text-align: center; color: #ffa502; font-weight: bold; font-size: 1.1em; display: flex; align-items: center; justify-content: center; }
.board-wrapper { position: relative; display: flex; justify-content: center; background: #000; padding: 5px; border-radius: 5px; }

.sidebar { background: #1a1a1a; padding: 15px; border-radius: 12px; height: 78vh; display: flex; flex-direction: column; gap: 15px; border: 1px solid #333; }
.order-form { display: grid; grid-template-columns: 1fr 70px 55px; gap: 5px; }
.order-form input { background: #333; border: 1px solid #444; color: #fff; padding: 8px; border-radius: 5px; font-size: 0.9em; }
.h-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.h-btns button { font-size: 0.75em; padding: 4px 10px; background: #222; color: #88ff88; border: 1px solid #333; border-radius: 5px; cursor: pointer; }
.order-list { overflow-y: auto; flex-grow: 1; padding-right: 5px; }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #222; margin-bottom: 8px; border-radius: 8px; border: 1px solid #333; }
.order-item.done { opacity: 0.3; background: #111; }
.o-txt { display: flex; flex-direction: column; }
.o-txt .p { font-size: 0.85em; color: #2ed573; margin-top: 2px; }
.btn-spawn { width: 100%; padding: 18px; background: #2ed573; color: #000; font-weight: bold; border: none; border-radius: 12px; cursor: pointer; margin-top: 15px; font-size: 1.1em; box-shadow: 0 4px 10px rgba(46, 213, 115, 0.3); }
</style>