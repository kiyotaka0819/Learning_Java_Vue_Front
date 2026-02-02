<script setup>
import { ref, onMounted, onBeforeUnmount} from 'vue'
import { supabase } from '../../lib/supabaseClient'

// --- 状態管理 ---
const todos = ref([])
const newTask = ref('')
const loading = ref(true)
let subscription = null
// --- CRUD処理 ---

// 1. 取得 (Read)
const fetchTodos = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('エラーが発生しました:', error.message)
  if (error) alert('取得失敗：' + error.message)
  else todos.value = data
  loading.value = false
}

// 2. 追加 (Create)
const addTodo = async () => {
  if (!newTask.value.trim()) return
  
  const { error } = await supabase
    .from('todos')
    .insert([{ content: newTask.value }])

  if (error) alert('追加失敗：' + error.message)
  else {
    newTask.value = ''
    await fetchTodos() // 再読み込み
  }
}

// 3. 削除 (Delete)
const deleteTodo = async (id) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) alert('削除失敗：' + error.message)
  else await fetchTodos()
}

// 4. 更新 (Update) - 完了状態を反転させる
const toggleTodo = async (todo) => {
  const { error } = await supabase
    .from('todos')
    .update({ is_done: !todo.is_done }) // 現在の状態を反転させて送る
    .eq('id', todo.id)

  if (error) alert('更新失敗：' + error.message)
  else await fetchTodos() // 再読み込み
}

onMounted(() => {
  console.log('マウント開始')
  fetchTodos()
    .then(() => {
      console.log('データ取得完了', todos.value)
    })
    .catch(err => {
      console.error('fetchTodos error:', err)
      loading.value = false  // エラー時もロード状態を解除
    });
  // リアルタイムサブスクリプション設定
  try {
    subscription = supabase
      .from('todos')
      .on('*', payload => {
        console.log('変更を検知:', payload);
        fetchTodos();
      })
      .subscribe();
    console.log('サブスクリプション設定成功');
  } catch (err) {
    console.error('サブスクリプション設定エラー:', err);
  }
});
 
onBeforeUnmount(() => {
  console.log('アンマウント処理');
  if (subscription) {
    supabase.removeSubscription(subscription);
  }
});
</script>

<template>
  <div class="todo-container">
    <header class="todo-header">
      <h1>ToDo</h1>
      <p>Supabase連携済み</p>
    </header>

    <div class="input-group">
      <input 
        v-model="newTask" 
        @keyup.enter="addTodo" 
        placeholder="何をやりますか？"
        type="text"
      >
      <button @click="addTodo" :disabled="!newTask">追加</button>
    </div>

    <div v-if="loading" class="status">通信中です...</div>
    
    <transition-group name="list" tag="ul" class="todo-list" v-else>
      <li v-for="todo in todos" :key="todo.id" class="todo-item" :class="{ 'is-completed': todo.is_done }">
        <span class="content" @click="toggleTodo(todo)">
            {{ todo.content }}
        </span>
        <button class="delete-btn" @click="deleteTodo(todo.id)">削除</button>
    </li>
    </transition-group>

    <div v-if="!loading && todos.length === 0" class="status">
      タスクがありません。
    </div>
  </div>
</template>

<style scoped>
.todo-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  background: rgba(128, 128, 128, 0.05);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  color: inherit;
}

.todo-header {
  text-align: center;
  margin-bottom: 30px;
}

.todo-header h1 { color: #1890ff; font-size: 2rem; }

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}

button:hover:not(:disabled) { background: #40a9ff; }
button:disabled { background: #ccc; cursor: not-allowed; }

.todo-list { list-style: none; padding: 0; }

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(128, 128, 128, 0.1);
  margin-bottom: 10px;
  border-radius: 10px;
  border-left: 4px solid #1890ff;
}

.delete-btn {
  background: #ff4d4f;
  font-size: 0.8rem;
  padding: 4px 10px;
}

.todo-item.is-completed {
  opacity: 0.5;
  border-left-color: #52c41a;
}

.todo-item.is-completed .content {
  text-decoration: line-through;
}

.delete-btn:hover { background: #ff7875; }

.status { text-align: center; opacity: 0.6; margin-top: 20px; }

/* アニメーション */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }
</style>