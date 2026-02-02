<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '../../lib/supabaseClient'
// --- 状態管理 ---
const todos = ref([])
const newTask = ref('')
const loading = ref(true)
let subscription = null; // リアルタイム購読管理用
 
// --- データ取得処理 ---
const fetchTodos = async () => {
  try {
    console.log('データ取得開始...');
    loading.value = true;
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('データ取得エラー:', error);
      return;
    }
    console.log('データ取得成功:', data);
    todos.value = data || [];
  } catch (e) {
    console.error('予期せぬエラー:', e);
  } finally {
    loading.value = false;
  }
};
 
// （以下、既存のCRUD処理は変更なし）
 
// コンポーネント初期化時
onMounted(() => {
  // 初期データ読み込み
  fetchTodos();
  // リアルタイム接続設定
  console.log('リアルタイム接続を設定中...');
  const channel = supabase
    .channel('todos-changes') // チャンネル名（任意の名前）
    .on(
      'postgres_changes', 
      {
        event: '*',  // 全てのイベント（INSERT, UPDATE, DELETE）
        schema: 'public',
        table: 'todos' // テーブル名
      },
      (payload) => {
        console.log('リアルタイム更新を検出:', payload);
        fetchTodos(); // データを再取得して表示更新
      }
    )
    .subscribe((status) => {
      console.log('接続ステータス:', status);
    });
  // 後でクリーンアップできるように保存
  subscription = channel;
});
 
// コンポーネント破棄時のクリーンアップ
onBeforeUnmount(() => {
  if (subscription) {
    console.log('リアルタイム接続を解除');
    supabase.removeChannel(subscription);
  }
});
</script>
 
<template>
<div class="todo-container">
<header class="todo-header">
<h1>ToDo</h1>
<p>Supabase連携済み</p>
</header>
 
    <!-- 新規タスク入力エリア -->
<div class="input-group">
<input
        v-model="newTask"
        @keyup.enter="addTodo"
        placeholder="何をやりますか？"
        type="text"
>
<button @click="addTodo" :disabled="!newTask">追加</button>
</div>
 
    <!-- ローディング表示 -->
<div v-if="loading" class="status">
      通信中です...
<button @click="loading = false" style="background-color: #ff9800;">
        ロード強制解除（デバッグ用）
</button>
</div>
<!-- Todoリスト表示 -->
<transition-group name="list" tag="ul" class="todo-list" v-else>
<li v-for="todo in todos" :key="todo.id" class="todo-item" :class="{ 'is-completed': todo.is_done }">
<span class="content" @click="toggleTodo(todo)">
            {{ todo.content }}
</span>
<button class="delete-btn" @click="deleteTodo(todo.id)">削除</button>
</li>
</transition-group>
 
    <!-- Todoが存在しない場合のメッセージ -->
<div v-if="!loading && todos.length === 0" class="status">
      タスクがありません。
</div>
<!-- デバッグ情報表示エリア -->
<div class="debug-panel">
<h3>デバッグ情報</h3>
<p>タスク入力値: "{{ newTask }}"</p>
<p>ロード状態: {{ loading }}</p>
<p>取得データ数: {{ todos.length }}</p>
<button @click="fetchTodos()" style="background-color: #4caf50;">
        データ再取得
</button>
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
 
/* デバッグパネルのスタイル */
.debug-panel {
  margin-top: 30px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
}
 
.debug-panel h3 {
  margin-top: 0;
  color: #666;
}
 
/* アニメーション */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }
</style>