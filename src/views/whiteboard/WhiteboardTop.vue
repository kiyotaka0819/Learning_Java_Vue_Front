<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabaseClient'
import WhiteboardLogin from './WhiteboardLogin.vue'
import whiteBoardApp from './WhiteboardApp.vue'

const session = ref(null)

onMounted(() => {
  // 1. 現在のセッション（ログイン状態）を取得
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  // 2. ログイン状態の変化を監視（ログイン・ログアウト時に自動実行）
  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <div class="app-container">
    <whiteBoardApp v-if="session" :session="session" />
    <WhiteboardLogin v-else />
  </div>
</template>

<style>
.app-container {
  background-color: #121212;
  min-height: 100vh;
}
</style>