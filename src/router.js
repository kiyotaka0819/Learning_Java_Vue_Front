import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import WeatherApp from './views/weather/WeatherApp.vue'
import AppsView from './views/AppsView.vue'
import PortfolioView from './views/PortfolioView.vue'
import AboutView from './views/AboutView.vue'

/**
 * ルーティング定義
 * path: ブラウザのアドレスバーに表示されるURL
 * component: その時に表示する画面
 */
const routes = [
  // ホーム画面
  { path: '/', component: HomeView },
  // アプリケーション一覧画面
  { path: '/apps', component: AppsView },
  // 天気予報アプリ画面
  { path: '/weather', component: WeatherApp },
  // ポートフォリオ画面
  { path: '/portfolio', component: PortfolioView },
  //  ABOUT ME画面
  { path: '/about', component: AboutView }
]


const router = createRouter({
  history: createWebHistory('/Learning_Java_Vue_Front/'),
  routes
})

export default router