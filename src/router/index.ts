import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue')
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: () => import('@/pages/EditorPage.vue')
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/pages/ProjectListPage.vue')
    }
  ]
})

export default router
