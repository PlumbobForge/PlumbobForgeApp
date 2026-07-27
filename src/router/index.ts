import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'ContentManager',
      component: () => import('@/views/ContentManagerView.vue')
    },
    {
      path: '/configurations',
      name: 'Configurations',
      component: () => import('@/views/ConfigurationsView.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/SettingsView.vue')
    }
  ]
});

export default router;
