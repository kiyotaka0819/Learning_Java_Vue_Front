<script setup>
import { ref, onMounted, computed, watch } from 'vue'

// Canvas参照用変数
const canvas = ref(null)
// Canvasのペン
let ctx = null
// 今描いているか判定用フラグ
let drawing = false

// ペンの太さ用変数（初期値は3）
const lineWidth = ref(3)
// 消しゴム管理用フラグ
const eraserMode = ref(false)

// 色のRGB値を管理する（初期値は0＝黒）
const red = ref(0)
const green = ref(0)
const blue = ref(0)

// RGBの値からCSSの色文字列を作るcomputed
const currentColor = computed(() => {
  return `rgb(${red.value}, ${green.value}, ${blue.value})`
})

// currentColorが変更時、消しゴムでなければペンの色を管理する
watch(currentColor, (newColor) => {
  if (ctx && !eraserMode.value) {
    ctx.strokeStyle = newColor
  }
})

// 線の太さが変わったらCanvasに反映する
watch(lineWidth, (newWidth) => {
  if (ctx) ctx.lineWidth = newWidth
})

// 消しゴムボタンを押した時の処理
// 消しゴムならペンの色を白、OFFなら現在の色
const toggleEraser = () => {
  eraserMode.value = !eraserMode.value
  if (ctx) {
    ctx.strokeStyle = eraserMode.value ? 'white' : currentColor.value
  }
}

// 全消しボタンを押した時の処理
// Canvas全体を白く塗りつぶし
const allClear = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
}

// 画像保存ボタンを押した時の処理
// Canvasの内容をPNG画像として保存
const saveImage = () => {
  if (!canvas.value) return
  // Canvasの画像をBase64形式のPNGデータURLに変換
  const image = canvas.value.toDataURL('image/png')
  // ダウンロード用のリンクを作成
  const link = document.createElement('a')
  link.href = image
  // 保存するファイル名
  link.download = 'my_drawing.png'
  // 一時的にページに追加
  document.body.appendChild(link)
  // 自動でクリックしてダウンロード開始
  link.click()
  // リンクを削除
  document.body.removeChild(link)
}

// 画面に表示されたときの初回処理
onMounted(() => {
  // Canvasの2D描画ペンを取得
  ctx = canvas.value.getContext('2d')
  // 初期の線の太さと色を設定
  ctx.lineWidth = lineWidth.value
  ctx.strokeStyle = currentColor.value
  // Canvasの背景を白く塗りつぶす
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // マウスの押下で描画開始
  canvas.value.addEventListener('mousedown', (e) => {
    drawing = true
    // 新しい線の描画開始
    ctx.beginPath()
    // 線の開始位置をセット
    ctx.moveTo(e.offsetX, e.offsetY)
  })

  // マウスの移動イベント：描画中は線を引く
  canvas.value.addEventListener('mousemove', (e) => {
    // 描画中でなければ何もしない
    if (!drawing) return
    // 線を引くための座標を追加
    ctx.lineTo(e.offsetX, e.offsetY)
    // 線を実際に描画する
    ctx.stroke()
  })

  // マウスの離したイベント：描画終了
  canvas.value.addEventListener('mouseup', () => {
    drawing = false
  })
})
</script>

<template>
    <div class="todo-container">
        <!-- 画像保存ボタン：押すとCanvasを画像ファイルとして保存 -->
        <div class="saveContainer">
            <button v-on:click="saveImage">画像を保存する</button>
        </div>

        <!-- 描画用Canvas -->
        <canvas ref="canvas" width="500" height="400"></canvas>

        <!-- 消しゴム切替と全消しボタン -->
        <div class="allButton">
            <button v-on:click="toggleEraser">{{ eraserMode ? '消しゴムON' : '消しゴムOFF' }}</button>
            <button v-on:click="allClear">全消し</button>
        </div>

        <!-- ペンの太さ調整スライダー -->
        <div class="sliderContainer">
            <label for="lineWidthRange">太さ: {{ lineWidth }}</label>
            <input type="range" id="lineWidthRange" min="1" max="30" v-model="lineWidth" />
        </div>

        <!-- 色の調整スライダー -->
        <div class="sliderContainer">
            <label>色の調整</label>
            <div>
            <label for="redRange">赤: {{ red }}</label>
            <input type="range" id="redRange" min="0" max="255" v-model="red" />
            </div>
            <div>
            <label for="greenRange">緑: {{ green }}</label>
            <input type="range" id="greenRange" min="0" max="255" v-model="green" />
            </div>
            <div>
            <label for="blueRange">青: {{ blue }}</label>
            <input type="range" id="blueRange" min="0" max="255" v-model="blue" />
            </div>
            <!-- 現在の色を見やすく表示 -->
            <div>
            <span>現在の色: </span>
            <span 
                :style="{ 
                display: 'inline-block', 
                width: '40px', 
                height: '20px', 
                backgroundColor: currentColor 
                }"
            >
            </span>
        </div>
    </div>
  </div>
</template>

<style scoped>

.todo-container {
  background-color: #121212; /* 深い黒 */
  color: #e0e0e0;           /* 明るいグレー */
  padding: 20px;
  min-height: 100vh;
}
/* 画像保存ボタンの親コンテナを中央寄せ */
.saveContainer{
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

/* 全ボタン共通スタイル */
button {
  background-color: #333333;
  color: #ffffff;
  border: 1px solid #555555;
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}
button:hover {
  background-color: #444444;
  border-color: #1890ff;
}

/* 消しゴム・全消しボタンの横並び */
.allButton {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.allButton button:hover {
  background-color: #ddd;
}

/* Canvasのスタイル */
canvas {
display: block;
  margin: 20px auto;
  border: 4px solid #333;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

/* スライダーの親コンテナ */
.sliderContainer {
  margin: 15px auto 0;
  width: 300px;
  text-align: center;
}

.sliderContainer label {
  color: #e0e0e0;
  display: block;
  margin-bottom: 5px;
}

/* スライダーの幅と余白 */
input[type="range"] {
  width: 100%;
  margin: 5px 0 10px;
}


</style>