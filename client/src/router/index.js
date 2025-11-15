import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },

    {
      path: '/app',  
      component: MainLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UserList.vue')
        },
        {
          path: 'inquiries',
          name: 'inquiries',
          component: () => import('../views/InquiryList.vue')
        },
        {
          path: 'sections',
          name: 'sections',
          component: () => import('../views/SectionList.vue')
        }
      ]
    }
  ]
})

export default router
