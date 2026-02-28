import { createRouter, createWebHashHistory } from 'vue-router';
import Index from '@/views/Index';
import ChartPreviewPage from '@/views/ChartPreviewPage';
import api from '@/client/api';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Index },
    { path: '/chart-preview', component: ChartPreviewPage },
    { path: '/oobe', component: () => import('@/views/Oobe') },
  ],
});

export default router;
