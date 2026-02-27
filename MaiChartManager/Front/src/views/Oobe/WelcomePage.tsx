import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import mcmLogo from '@/components/Splash/mcm.png';
import { setLocale, availableLocales, locale } from '@/locales/index';
import type { Locale } from '@/locales/index';

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const cycleLocale = () => {
      const idx = availableLocales.indexOf(locale.value as Locale);
      const next = availableLocales[(idx + 1) % availableLocales.length];
      setLocale(next);
    };

    return () => (
      <div class="flex flex-col items-center justify-center h-full gap-6">
        <img src={mcmLogo} alt="MaiChartManager" class="w-48 h-48" />
        <div class="text-2xl font-bold op-90">MaiChartManager</div>
        <div class="text-lg op-70">{t('oobe.welcomeMessage')}</div>
        <button
          class="mt-4 px-4 py-2 rounded-lg bg-[oklch(0.85_0.05_var(--hue))] hover:bg-[oklch(0.8_0.07_var(--hue))] transition-colors cursor-pointer border-none text-sm op-80"
          onClick={cycleLocale}
        >
          {locale.value === 'zh' ? '简体中文' : locale.value === 'zh-TW' ? '繁體中文' : 'English'}
        </button>
      </div>
    );
  },
});
