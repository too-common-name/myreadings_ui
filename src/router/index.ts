import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import BooksView from '@/views/BooksView.vue'
import SearchView from '@/views/SearchView.vue'
import DiscoverView from '@/views/DiscoverView.vue'

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
      path: '/books',
      name: 'books',
      component: BooksView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/discover',
      name: 'discover',
      component: DiscoverView,
    }
  ],
})

export default initRouter
