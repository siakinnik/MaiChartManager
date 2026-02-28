import { defineComponent } from "vue";
import { Select } from "@munet/ui";
import { selectedThemeHue } from "@munet/ui";
import { useI18n } from "vue-i18n";
import { setLocale, availableLocales, locale } from '@/locales/index';
import type { Locale } from '@/locales/index';
import styles from "./ThemeSlider.module.scss";

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const localeLabels: Record<Locale, string> = {
      'zh': '简体中文',
      'zh-TW': '繁體中文',
      'en': 'English',
    };
    const localeOptions = availableLocales.map(l => ({
      label: localeLabels[l],
      value: l,
    }));

    return () => (
      <div class="mb-6">
        <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.appearance')}</div>
        <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
          <div class="flex items-center gap-3">
            <div class="i-mdi-translate text-xl op-60" />
            <Select
              value={locale.value}
              options={localeOptions}
              onChange={(v: any) => setLocale(v as Locale)}
            />
          </div>
          <div class="flex flex-col gap-2">
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={selectedThemeHue.value}
              onInput={(e) => { selectedThemeHue.value = Number((e.target as HTMLInputElement).value); }}
              class={[styles['chromatic-hue-slider'], 'w-full']}
            />
            <div class="flex items-center justify-end">
              <button
                onClick={() => { selectedThemeHue.value = 353; }}
              >
                {t('settings.resetDefault')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
