import '@unocss/reset/sanitize/sanitize.css';
import 'animate.css';
import 'virtual:uno.css';
import '@fontsource/noto-sans-sc';
import './global.sass';
import { createApp } from 'vue';
import App from './App';
import posthog from "@/plugins/posthog";
import sentry from "@/plugins/sentry";
import i18n from '@/locales';

createApp(App)
  .use(i18n)
  .use(posthog)
  .use(sentry)
  .mount('#app');
