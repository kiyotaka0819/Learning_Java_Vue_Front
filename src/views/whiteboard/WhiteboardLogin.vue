<script setup>
import { ref } from 'vue'
import { supabase } from '../../lib/supabaseClient'

const email = ref('')
const password = ref('')

// 新規登録
const handleSignUp = async () => {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })
  if (error) alert(error.message)
  else alert('登録完了！メールを確認')
}

// ログイン
const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) alert(error.message)
}
</script>

<template>
  <div class="auth-container">
    <h2>冷蔵庫メモにログイン</h2>
    <input v-model="email" type="email" placeholder="メールアドレス" />
    <input v-model="password" type="password" placeholder="パスワード" />
    <div class="auth-buttons">
      <button @click="handleLogin">ログイン</button>
      <button @click="handleSignUp">新規登録</button>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 300px;
  margin: 100px auto;
  padding: 20px;
  background: #333;
  border-radius: 10px;
}
input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #555;
  background: #222;
  color: white;
}
</style>