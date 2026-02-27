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

router.beforeEach(async (to) => {
  if (to.path === '/chart-preview') return;
  try {
    const res = await api.GetGamePath();
    const hasGamePath = !!res.data;
    if (to.path === '/oobe' && hasGamePath) return '/';
    if (to.path === '/' && !hasGamePath) return '/oobe';
  } catch {
    // If API fails, let navigation proceed
  }
});

export default router;
