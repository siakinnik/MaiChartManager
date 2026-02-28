import { defineComponent, ref, onMounted } from "vue";
import { CheckBox, Radio, Select } from "@munet/ui";
import { selectedThemeHue } from "@munet/ui";
import { useI18n } from "vue-i18n";
import { appSettings, saveSettings } from "@/store/settings";
import { MovieCodec } from "@/client/apiGen";
import api from "@/client/api";
import { updateAll } from "@/store/refs";
import styles from "./ThemeSlider.module.scss";
import { selectedChannel } from "@/views/ModManager/shouldShowUpdateController";
import { setLocale, availableLocales, locale } from '@/locales/index';
import type { Locale } from '@/locales/index';


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

    const movieCodecOptions = [
      { label: t('chart.import.option.codecForceH264'), value: MovieCodec.ForceH264 },
      { label: t('chart.import.option.codecForceVP9'), value: MovieCodec.ForceVP9 },
    ];

    const onSettingChange = () => {
      saveSettings();
    };

    const gamePath = ref('');
    const switching = ref(false);
    const error = ref('');

    onMounted(async () => {
      try {
        const res = await api.GetGamePath();
        gamePath.value = res.data || '';
      } catch {}
    });

    const handleChangeDirectory = async () => {
      error.value = '';
      try {
        const res = await api.OpenFolderDialog();
        if (!res.data) return;
        switching.value = true;
        await api.SetGamePath(res.data);
        await api.InitializeGameData();
        await updateAll();
        gamePath.value = res.data;
      } catch (e: any) {
        error.value = t('settings.changeDirectoryFailed');
      } finally {
        switching.value = false;
      }
    };

    return () => (
      <div class="p-xy h-100dvh of-y-auto">
        {/* Appearance */}
        {/* Game Directory */}
        <div class="mb-6">
          <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.gameDirectory')}</div>
          <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
            <div class="flex items-center gap-3">
              <span class="shrink-0 op-60">{t('settings.currentPath')}</span>
              <span class="text-sm break-all">{gamePath.value || '—'}</span>
            </div>
            <div class="flex items-center gap-3">
              <button
                disabled={switching.value}
                onClick={handleChangeDirectory}
              >
                {switching.value ? t('settings.changingDirectory') : t('settings.changeDirectory')}
              </button>
              {error.value && <span class="text-red-500 text-sm">{error.value}</span>}
            </div>
          </div>
        </div>

        <div class="mb-6">
          <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.appearance')}</div>
          <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
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
            <div class="flex items-center gap-3">
              <div class="i-mdi-translate text-xl op-60" />
              <Select
                value={locale.value}
                options={localeOptions}
                onChange={(v: any) => setLocale(v as Locale)}
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

        {/* AquaMai */}
        <div class="mb-6">
          <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">AquaMai</div>
          <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
            <div class="flex gap-3">
              <span class="shrink-0 flex justify-end">{t('settings.updateChannel')}</span>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                  <Radio k={'slow'} v-model:value={selectedChannel.value}>{t('settings.updateChannelSlow')}</Radio>
                  <Radio k={'ci'} v-model:value={selectedChannel.value}>{t('settings.updateChannelCi')}</Radio>
                </div>
                <span class="text-sm op-60">{t('settings.updateChannelDesc')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
