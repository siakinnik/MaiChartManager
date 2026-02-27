import { computed, defineComponent } from "vue";
import { useI18n } from 'vue-i18n';
import { availableLocales, locale, setLocale, type Locale } from '@/locales/index';

const localeLabels: Record<Locale, string> = {
  'zh': '中',
  'zh-TW': '繁',
  'en': 'EN',
};

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const currentLabel = computed(() => localeLabels[locale.value as Locale] ?? locale.value);

    const cycleLocale = () => {
      const currentIndex = availableLocales.indexOf(locale.value as Locale);
      const nextIndex = (currentIndex + 1) % availableLocales.length;
      setLocale(availableLocales[nextIndex]);
    };

    return () => (
      <div
        class={[
          'w-12 h-12 min-[768px]:w-15 min-[768px]:h-15 flex items-center justify-center rounded-md cursor-pointer shrink-0',
          'transition-all duration-200 border-none bg-transparent relative group',
          'text-gray-500 bg-avatarMenuButton hover:text-gray-700',
        ]}
        onClick={cycleLocale}
      >
        <span class="text-3.5 font-bold select-none">{currentLabel.value}</span>
        <span class="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-[oklch(0.7_0.13_var(--hue))] text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-100">
          {t('sidebar.language')}
        </span>
      </div>
    );
  }
});
