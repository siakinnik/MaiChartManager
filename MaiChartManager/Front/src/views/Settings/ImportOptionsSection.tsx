import { defineComponent } from "vue";
import { CheckBox } from "@munet/ui";
import { useI18n } from "vue-i18n";
import { appSettings, saveSettings } from "@/store/settings";

export default defineComponent({
  setup() {
    const { t } = useI18n();

    const onSettingChange = () => {
      saveSettings();
    };

    return () => (
      <div class="mb-6">
        <div class="text-lg font-semibold mb-3 text-[var(--link-color)]">{t('settings.importOptions')}</div>
        <div class="rounded-xl bg-white/60 p-4 flex flex-col gap-4 border border-gray-200 border-solid">
          <CheckBox v-model:value={appSettings.value.ignoreLevel} onChange={onSettingChange}>{t('settings.ignoreLevel')}</CheckBox>
          <CheckBox v-model:value={appSettings.value.disableBga} onChange={onSettingChange}>{t('settings.disableBga')}</CheckBox>
        </div>
      </div>
    );
  },
});
