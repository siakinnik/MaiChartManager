import '@unocss/reset/tailwind-compat.css';
import 'animate.css';
import 'virtual:uno.css';
import '@fontsource/noto-sans-sc';
import '@fontsource/quicksand';
import { createApp } from 'vue';
import App from './App';
import posthog from "@/plugins/posthog";
import sentry from "@/plugins/sentry";
import i18n from '@/locales';
import router from '@/router';
import './global.sass';

createApp(App)
  .use(router)
  .use(i18n)
  .use(posthog)
  .use(sentry)
  .mount('#app');
