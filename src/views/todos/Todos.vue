<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '../../lib/supabaseClient'

// --- 状態管理 ---
const todos = ref([])
const newTask = ref('')
const loading = ref(true)
let subscription = null; // リアルタイム購読管理用
const notificationStatus = ref('確認中...'); // 通知の許可状態

// --- 通知関連の機能 ---

// 通知許可状態を更新する関数
const updateNotificationStatus = () => {
  if (!('Notification' in window)) {
    notificationStatus.value = '通知非対応ブラウザ';
  } else {
    notificationStatus.value = Notification.permission;
  }
};

// 通知の許可を求める関数
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('このブラウザは通知をサポートしていません');
    notificationStatus.value = '通知非対応ブラウザ';
    return false;
  }
  
  if (Notification.permission === 'granted') {
    notificationStatus.value = '許可済み';
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      notificationStatus.value = permission;
      return permission === 'granted';
    } catch (e) {
      console.error('通知許可エラー:', e);
      notificationStatus.value = 'エラー';
      return false;
    }
  }
  
  notificationStatus.value = Notification.permission;
  return false;
};

// 通知を表示する関数
const showNotification = (title, options = {}) => {
  console.log('通知表示試行:', title, options);
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, options);
      console.log('通知表示成功:', notification);
      return notification;
    } catch (e) {
      console.error('通知表示エラー:', e);
      return null;
    }
  } else {
    console.log('通知が許可されていません。現在の状態:', Notification.permission);
  }
};

// --- CRUD処理 ---

// 1. 取得 (Read) - Todoリストを取得する
const fetchTodos = async () => {
  try {
    console.log('データ取得開始...');
    loading.value = true

    // Supabaseからデータを取得
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    // エラー処理
    if (error) {
      console.error('エラーが発生しました:', error.message)
      alert('取得失敗：' + error.message)
    } else {
      // 取得成功時
      console.log('データ取得成功:', data);
      todos.value = data || []
    }
  } catch (e) {
    // 予期せぬエラー処理
    console.error('予期せぬエラー:', e);
    alert('データ取得中に予期せぬエラーが発生しました');
  } finally {
    // 成功・失敗に関わらずロード状態を解除
    loading.value = false
  }
}

// 2. 追加 (Create) - 新しいTodoを作成する
const addTodo = async () => {
  // 空文字チェック（トリムして空なら何もしない）
  if (!newTask.value.trim()) return

  try {
    console.log('タスク追加:', newTask.value);
    // Supabaseにデータを挿入
    const { error } = await supabase
      .from('todos')
      .insert([{ content: newTask.value }])

    // エラー処理
    if (error) {
      console.error('追加失敗:', error);
      alert('追加失敗：' + error.message)
    } else {
      // 追加成功時
      console.log('タスク追加成功');
      newTask.value = ''  // 入力フィールドをクリア
      await fetchTodos() // データを再取得して表示を更新
    }
  } catch (e) {
    console.error('予期せぬエラー:', e);
    alert('タスク追加中に予期せぬエラーが発生しました');
  }
}

// 3. 削除 (Delete) - 指定IDのTodoを削除する
const deleteTodo = async (id) => {
  try {
    console.log('タスク削除:', id);
    // Supabaseからデータを削除
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    // エラー処理
    if (error) {
      console.error('削除失敗:', error);
      alert('削除失敗：' + error.message)
    } else {
      // 削除成功時
      console.log('タスク削除成功');
      await fetchTodos() // データを再取得して表示を更新
    }
  } catch (e) {
    console.error('予期せぬエラー:', e);
    alert('タスク削除中に予期せぬエラーが発生しました');
  }
}

// 4. 更新 (Update) - 完了状態を反転させる
const toggleTodo = async (todo) => {
  try {
    console.log('タスク状態更新:', todo.id);
    // Supabaseでデータを更新（現在の状態を反転）
    const { error } = await supabase
      .from('todos')
      .update({ is_done: !todo.is_done })
      .eq('id', todo.id)

    // エラー処理
    if (error) {
      console.error('更新失敗:', error);
      alert('更新失敗：' + error.message)
    } else {
      // 更新成功時
      console.log('タスク更新成功');
      await fetchTodos() // データを再取得して表示を更新
    }
  } catch (e) {
    console.error('予期せぬエラー:', e);
    alert('タスク更新中に予期せぬエラーが発生しました');
  }
}

// コンポーネント初期化時
onMounted(async () => {
  // 通知状態を最初に確認
  updateNotificationStatus();
  
  // 通知の許可を求める
  await requestNotificationPermission();
  
  // 再度状態を更新
  updateNotificationStatus();
  
  // 初期データ読み込み
  fetchTodos();
  
  // リアルタイム接続設定
  console.log('リアルタイム接続を設定中...');
  
  const channel = supabase
    .channel('todos-realtime-v3') // 新しいチャンネル名
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'todos' },
      (payload) => {
        console.log('🔥 リアルタイムイベント検出:', payload);
        
        // イベント検出時に通知表示とデータ再取得
        if (payload.eventType === 'INSERT') {
          showNotification('新しいタスクが追加されました', {
            body: `内容: ${payload.new.content}`,
            icon: '/favicon.ico' // アプリのアイコン
          });
          fetchTodos();
        } else if (payload.eventType === 'DELETE') {
          showNotification('タスクが削除されました');
          fetchTodos();
        } else if (payload.eventType === 'UPDATE') {
          showNotification('タスクが更新されました', {
            body: `内容: ${payload.new.content}`
          });
          fetchTodos();
        }
      }
    )
    .subscribe((status) => {
      console.log('チャンネル接続状態:', status);
      // 接続状態を定期的に確認
      const intervalId = setInterval(() => {
        console.log('チャンネル接続状態の定期確認:', channel.state);
      }, 5000);
      
      // 5分後にクリア
      setTimeout(() => clearInterval(intervalId), 300000);
    });
  
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
  <title>TODOリストアプリ</title>
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
      <p>通知状態: {{ notificationStatus }}</p>
      <button @click="fetchTodos()" style="background-color: #4caf50;">
        データ再取得
      </button>
      <button @click="requestNotificationPermission(); updateNotificationStatus();" 
              style="background-color: #9c27b0; margin-left: 10px;">
        通知許可を確認
      </button>
      <button @click="showNotification('テスト通知', {body: 'これはテスト通知です'})" 
              style="background-color: #ff9800; margin-left: 10px;">
        通知テスト
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
 