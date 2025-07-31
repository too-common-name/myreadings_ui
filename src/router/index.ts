import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import BooksView from '@/views/BooksView.vue'
import SearchView from '@/views/SearchView.vue'

const initRouter = () => createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/collections',
      name: 'collections',
      component: BooksView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    }
  ],
})

export default initRouter
