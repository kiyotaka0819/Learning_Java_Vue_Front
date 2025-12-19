import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import WeatherApp from './views/weather/WeatherApp.vue'
import AppsView from './views/AppsView.vue'
import PortfolioView from './views/PortfolioView.vue'
import AboutView from './views/AboutView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/apps', component: AppsView },
  { path: '/weather', component: WeatherApp },
  { path: '/portfolio', component: PortfolioView },
  { path: '/about', component: AboutView }
]


const router = createRouter({
  history: createWebHistory('/Learning_Java_Vue_Front/'),
  routes
})

export default router