import { computed, defineComponent, ref } from "vue";
import { Popover, Qrcode } from "@munet/ui";
import '@fontsource/nerko-one'
import { version } from "@/store/refs";
import StorePurchaseButton from "@/components/StorePurchaseButton";
import AfdianIcon from "@/icons/afdian.svg";
import { HardwareAccelerationStatus, LicenseStatus } from "@/client/apiGen";
import { useI18n } from 'vue-i18n';
import { Modal, theme } from "@munet/ui";

export default defineComponent({
  setup(props) {
    const show = ref(false);
    const displayVersion = computed(() => version.value?.version?.split('+')[0]);
    const { t } = useI18n();

    return () => version.value && <div class={'w-15 py-1 flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 bg-avatarMenuButton text-3.5'} onClick={() => show.value = true}>
      v{displayVersion.value}

      <Modal
        width="min(85vw,60em)"
        title={t('about.title')}
        v-model:show={show.value}
      >
        <div class="flex flex-col gap-2" style={{containerType: 'inline-size'}}>
          <AppIcon class="mb-10 max-[540px]:scale-75"/>
          <div class="flex justify-center gap-1 text-10 c-gray-4">
            <a class="i-mdi-github hover:c-#1f2328 transition-300" href="https://github.com/clansty/MaiChartManager" target="_blank"/>
            <a class="i-ic-baseline-telegram hover:c-#39a6e6 transition-300" href="https://t.me/MaiChartManager" target="_blank"/>
          <Popover trigger="hover">
            {{
              trigger: () => <div class="i-ri-qq-fill hover:c-#e31b25 transition-300"/>,
              default: () => <div><Qrcode value="https://qm.qq.com/q/U3gT7CDuy6"/></div>
            }}
          </Popover>
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
    </div>;
  }
})

const AppIcon = defineComponent({
  setup() {
    return () => <div class="flex flex-col items-center font-['Nerko_One'] text-20cqw text-stroke-2 lh-[0.8]">
      <div class="flex gap-2">
        <div class="c-#c3c4f8 text-stroke-#8791e2">
          Mai
        </div>
        <div class="c-#f7abca text-stroke-#d079b2">
          Chart
        </div>
      </div>
      <div class="c-#fef19d text-stroke-#e3c86a">
        Manager
      </div>
    </div>
  }
})
