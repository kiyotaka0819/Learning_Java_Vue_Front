import { ref, computed, reactive } from 'vue'

const COLS = 10
const ROWS = 20
const MINO_KEYS = ['I', 'L', 'J', 'O', 'Z', 'S', 'T']
const MINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  L: { shape: [[1, 0, 0], [1, 1, 1]], color: '#f0a000' },
  J: { shape: [[0, 0, 1], [1, 1, 1]], color: '#0000f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' }
}

export function useTetris() {
  const board = ref(Array(ROWS).fill().map(() => Array(COLS).fill(0)))
  const currentMino = ref(null)
  const minoPos = reactive({ x: 3, y: 0 })

  const isDead = computed(() => board.value[0].some(cell => cell !== 0))

  const canMove = (nx, ny, shape) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const tx = nx + x
          const ty = ny + y
          if (tx < 0 || tx >= COLS || ty >= ROWS) return false
          if (ty >= 0 && board.value[ty][tx]) return false
        }
      }
    }
    return true
  }

  const move = (dx, dy) => {
    if (!currentMino.value) return false
    if (canMove(minoPos.x + dx, minoPos.y + dy, currentMino.value.shape)) {
      minoPos.x += dx
      minoPos.y += dy
      return true
    }
    return false
  }

  const rotate = () => {
    if (!currentMino.value) return
    const newShape = currentMino.value.shape[0].map((_, i) =>
      currentMino.value.shape.map(row => row[i]).reverse()
    )
    if (canMove(minoPos.x, minoPos.y, newShape)) {
      currentMino.value.shape = newShape
    }
  }

  const ghostY = computed(() => {
    if (!currentMino.value) return 0
    let gy = minoPos.y
    while (canMove(minoPos.x, gy + 1, currentMino.value.shape)) { gy++ }
    return gy
  })

  const lockMino = () => {
    if (!currentMino.value) return
    currentMino.value.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          const by = minoPos.y + y
          const bx = minoPos.x + x
          if (by >= 0) board.value[by][bx] = currentMino.value.color
        }
      })
    })
    clearLines()
    currentMino.value = null
  }

  const clearLines = () => {
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board.value[y].every(cell => cell !== 0)) {
        board.value.splice(y, 1)
        board.value.unshift(Array(COLS).fill(0))
        y++
      }
    }
  }

  const forceClearLine = () => {
    board.value.splice(ROWS - 1, 1)
    board.value.unshift(Array(COLS).fill(0))
  }

  const cleanupForRestart = (safeRows) => {
    for (let i = 0; i < safeRows; i++) {
      board.value[i] = Array(COLS).fill(0)
    }
  }

  const spawnMino = (key) => {
    const k = key || MINO_KEYS[Math.floor(Math.random() * MINO_KEYS.length)]
    currentMino.value = JSON.parse(JSON.stringify(MINOS[k]))
    minoPos.x = 3
    minoPos.y = 0
    return canMove(minoPos.x, minoPos.y, currentMino.value.shape)
  }

  return {
    board, currentMino, minoPos, ghostY, isDead,
    move, rotate, lockMino, spawnMino, forceClearLine, cleanupForRestart,
    MINOS, MINO_KEYS, COLS, ROWS
  }
}