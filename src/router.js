import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import WeatherApp from './views/weather/WeatherApp.vue';
import AppsView from './views/AppsView.vue';
import PortfolioView from './views/PortfolioView.vue';
import AboutView from './views/AboutView.vue';
import RecipeApp from './views/recipe/RecipeApp.vue';
import MetronomeApp from './views/metronome/MetronomeApp.vue';
import CalculatorApp from './views/calculator/CalculatorApp.vue';
import NewsReaderApp from './views/news_reader/NewsReaderApp.vue';
import Todos from './views/todos/Todos.vue';
import WhiteboardTop from './views/whiteboard/WhiteboardTop.vue';
import SleepChecker from './views/sleep_checker/SleepChecker.vue';
import BusinessCardApp from './views/business_card/BusinessCardApp.vue';
import PokemonZukan from './views/pokemon_zukan/PokemonZukan.vue';
import JibunOsView from './views/JibunOsView.vue';
import QuizProject from './views/quiz_project/QuizProject.vue';

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
  // 献立アプリ画面

  // ポートフォリオ画面
  { path: '/portfolio', component: PortfolioView },
  //  ABOUT ME画面
  { path: '/about', component: AboutView },
  //  レシピアプリ画面
  { path: '/recipe', component: RecipeApp },
  // メトロノーム画面
  { path: '/metronome', component: MetronomeApp },
  // 電卓画面
  { path: '/calculator', component: CalculatorApp },
  // ニュースアプリ画面
  { path: '/news_reader', component: NewsReaderApp },
  // Todoアプリ画面
  { path: '/todos', component: Todos },
  // ホワイトボードアプリ画面
  { path: '/whiteboard', component: WhiteboardTop },
  // 睡眠計算アプリ画面
  { path: '/sleep_checker', component: SleepChecker },
  // 名刺生成アプリ画面
  { path: '/business_card', component: BusinessCardApp },
  // ポケモン図鑑アプリ画面
  { path: '/pokemon_zukan', component: PokemonZukan },
  // 自分用の仮想OSアプリ画面
  {
    path: '/jibun_os',
    name: 'JibunOsView',
    component: () => import('./views/JibunOsView.vue')
  },
  // Javaとの接続を行うクイズアプリ
  { path: '/quiz_project', component: QuizProject },
];

const router = createRouter({
  history: createWebHistory('/Learning_Java_Vue_Front/'),
  routes
});

export default router;
