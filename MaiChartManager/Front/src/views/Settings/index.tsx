import { defineComponent } from "vue";
import { CheckBox, Select } from "@munet/ui";
import { selectedThemeHue } from "@munet/ui";
import { useI18n } from "vue-i18n";
import { appSettings, saveSettings } from "@/store/settings";
import { MovieCodec } from "@/client/apiGen";
import styles from "./ThemeSlider.module.scss";

const movieCodecOptions = [
  { label: "Prefer H.264", value: MovieCodec.PreferH264 },
  { label: "Force H.264", value: MovieCodec.ForceH264 },
  { label: "Force VP9", value: MovieCodec.ForceVP9 },
];

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const onSettingChange = () => {
      saveSettings();
    };

    return () => (
      <div class="p-xy h-100dvh of-y-auto">
        {/* Appearance */}
        <div class="mb-6">
          <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.appearance')}</div>
          <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span>{t('settings.themeHue')}</span>
                <button
                  class="px-3 py-1 rounded-md border border-gray-300 border-solid bg-transparent cursor-pointer text-sm hover:bg-gray-100 transition-colors"
                  onClick={() => { selectedThemeHue.value = 353; }}
                >
                  {t('settings.resetDefault')}
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={selectedThemeHue.value}
                onInput={(e) => { selectedThemeHue.value = Number((e.target as HTMLInputElement).value); }}
                class={[styles['chromatic-hue-slider'], 'w-full']}
              />
            </div>
          </div>
        </div>

        {/* Import Options */}
        <div class="mb-6">
          <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.importOptions')}</div>
          <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
            <CheckBox v-model:value={appSettings.value.ignoreLevel} onChange={onSettingChange}>{t('settings.ignoreLevel')}</CheckBox>
            <CheckBox v-model:value={appSettings.value.disableBga} onChange={onSettingChange}>{t('settings.disableBga')}</CheckBox>
          </div>
        </div>

        {/* Video Options */}
        <div class="mb-6">
          <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.videoOptions')}</div>
          <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
            <div class="flex items-center gap-3">
              <span class="shrink-0">{t('settings.movieCodec')}</span>
              <Select v-model:value={appSettings.value.movieCodec} options={movieCodecOptions} onChange={onSettingChange} />
            </div>
            <CheckBox v-model:value={appSettings.value.yuv420p} onChange={onSettingChange}>{t('settings.yuv420p')}</CheckBox>
            <CheckBox v-model:value={appSettings.value.noScale} onChange={onSettingChange}>{t('settings.noScale')}</CheckBox>
          </div>
        </div>
      </div>
    );
  },
});
