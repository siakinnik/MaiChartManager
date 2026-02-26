import { createRouter, createWebHashHistory } from 'vue-router';
import Index from '@/views/Index';
import ChartPreviewPage from '@/views/ChartPreviewPage';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Index },
    { path: '/chart-preview', component: ChartPreviewPage },
  ],
});

export default router;
