import { computed, defineComponent, ref } from "vue";
import { Popover, Qrcode } from "@munet/ui";
import AppIcon from '@/components/AppIcon';
import '@fontsource/nerko-one'
import { updateVersion, version } from "@/store/refs";
import StorePurchaseButton from "@/components/StorePurchaseButton";
import AfdianIcon from "@/icons/afdian.svg";
import { HardwareAccelerationStatus, LicenseStatus } from "@/client/apiGen";
import { useI18n } from 'vue-i18n';
import { Modal, TextInput, Button, addToast, theme } from "@munet/ui";
import api from "@/client/api";

export default defineComponent({
  setup(props) {
    const show = ref(false);
    const showOfflineActivation = ref(false);
    const activationCode = ref('');
    const activating = ref(false);
    const displayVersion = computed(() => version.value?.version?.split('+')[0]);
    const { t } = useI18n();

    const onVersionClick = (e: MouseEvent) => {
      if (e.shiftKey && version.value?.license !== LicenseStatus.Active) {
        showOfflineActivation.value = true;
        activationCode.value = '';
        return;
      }
      show.value = true;
    };

    const submitOfflineKey = async () => {
      if (!activationCode.value.trim() || activating.value) return;
      activating.value = true;
      try {
        const { data: result } = await api.VerifyOfflineKey(activationCode.value.trim());
        if (result) {
          addToast({ message: t('about.activationSuccess'), type: 'success' });
          showOfflineActivation.value = false;
          await updateVersion();
        } else {
          addToast({ message: t('about.activationCodeInvalid'), type: 'error' });
        }
      } catch {
        addToast({ message: t('about.activationCodeInvalid'), type: 'error' });
      } finally {
        activating.value = false;
      }
    };

    return () => version.value && <div class={'w-15 py-1 flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 bg-avatarMenuButton text-3.5 shrink-0'} onClick={onVersionClick}>
      v{displayVersion.value}

      <Modal
        width="min(85vw,60em)"
        title={t('about.title')}
        v-model:show={show.value}
      >
        <div class="flex flex-col gap-2" style={{containerType: 'inline-size'}}>
          <AppIcon class="mb-10 max-[540px]:scale-75"/>
          <div class="flex justify-center gap-1 text-10 c-gray-4">
          <a class="i-mdi-github hover:c-[var(--text-color)] transition-300" href="https://github.com/clansty/MaiChartManager" target="_blank"/>
          <a class="i-ri-qq-fill hover:c-[var(--text-color)] transition-300" href="https://qm.qq.com/q/U3gT7CDuy6" target="_blank" />
          </div>
          <div>
            {t('about.version')}: v{version.value.version}
          </div>
          <div>
            {t('about.gameVersion')}: 1.{version.value.gameVersion}
          </div>
          {version.value.hardwareAcceleration === HardwareAccelerationStatus.Enabled && <div>
            {t('about.vp9Enabled')}
          </div>}
          {version.value.hardwareAcceleration === HardwareAccelerationStatus.Disabled && <div>
            {t('about.vp9Disabled')}
          </div>}
          <div>
            {t('about.h264Encoder')}: {version.value.h264Encoder}
          </div>
          {version.value.license === LicenseStatus.Active && <div>
            {t('about.premiumActive')}
            <a
              href="https://afdian.com/a/Clansty"
              target="_blank"
              class={[theme.value.lc, 'fl']}
            >{t('about.continueSupport')}</a>
          </div>}
          {version.value.license === LicenseStatus.Inactive && <div class="flex gap-2 items-center">
            {t('purchase.supportDev')}
            <StorePurchaseButton/>
            <button onClick={() => window.open("https://afdian.com/item/90b4d1fe70e211efab3052540025c377")}>
              <span class="text-lg c-#946ce6 mr-2 translate-y-.25">
                <AfdianIcon/>
              </span>
              {t('purchase.afdian')}
            </button>
          </div>}
          <div class="op-80 text-center translate-y-2">
            © 2024-2025 MuNET Team
            <br />
            Open source under GNU GPL v3
            <br />
            Not affiliated with or endorsed by SEGA.
          </div>
        </div>
      </Modal>

      <Modal
        width="30em"
        title={t('about.offlineActivation')}
        v-model:show={showOfflineActivation.value}
      >{{
        default: () => <div class="flex flex-col gap-4">
          <div>{t('about.enterActivationCode')}</div>
          <TextInput
            v-model:value={activationCode.value}
            onEnterPressed={submitOfflineKey}
            disabled={activating.value}
          />
        </div>,
        actions: () => <Button
          onClick={submitOfflineKey}
          disabled={!activationCode.value.trim() || activating.value}
          ing={activating.value}
        >
          {t('common.confirm')}
        </Button>,
      }}</Modal>
    </div>;
  }
})
