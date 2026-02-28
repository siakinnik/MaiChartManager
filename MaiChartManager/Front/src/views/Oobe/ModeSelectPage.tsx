import { defineComponent, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/client/api';
import { TransitionVertical, TextInput, CheckBox, Button } from '@munet/ui';

export default defineComponent({
  props: {
    completing: { type: Boolean, default: false },
    remoteReady: { type: Boolean, default: false },
    lanAddresses: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const isRemote = ref(false);
    const useAuth = ref(false);
    const authUsername = ref('');
    const authPassword = ref('');
    const startupEnabled = ref(false);
    const startupCanChange = ref(true);

    // Fetch startup status when component mounts
    (api as any).GetStartupStatus?.().then((res: any) => {
      startupEnabled.value = res.data.enabled;
      startupCanChange.value = res.data.canChange;
    }).catch(() => { });

    const handleComplete = () => {
      emit('complete', {
        isRemote: isRemote.value,
        useAuth: useAuth.value,
        authUsername: authUsername.value,
        authPassword: authPassword.value,
      });
    };


    return () => {
      if (props.remoteReady) {
        return (
          <div class="flex flex-col items-center justify-center h-full gap-6 px-12">
            <div class="i-material-symbols:check-circle-rounded text-5xl text-green-600" />
            <div class="text-xl font-bold op-90">{t('oobe.remoteReady')}</div>
            <div class="text-sm op-60">{t('oobe.lanAddresses')}</div>
            <div class="flex flex-col gap-2 items-center">
              {props.lanAddresses.map(addr => (
                <div class="px-4 py-2 rounded-lg bg-[oklch(0.92_0.02_var(--hue))] text-sm font-mono">https://{addr}:5001</div>
              ))}
            </div>
            {/* TODO: 应该是 API 调用 */}
            <a
              href="/"
              target="_blank"
            >
              {t('oobe.openMainUI')}
            </a>
          </div>
        );
      }
      return (
        <div class="flex flex-col items-center justify-center h-full px-12">
          <div class="text-5 font-bold op-90">{t('oobe.selectMode')}</div>
          <div class="flex gap-4 w-full max-w-md mt-6 mb-3">
            <div
              class={['flex-1 p-5 rounded-xl cursor-pointer transition-all border-2 flex flex-col items-center gap-3',
                !isRemote.value ? 'border-[oklch(0.7_0.1_var(--hue))] bg-[oklch(0.95_0.03_var(--hue))]' : 'border-transparent bg-[oklch(0.96_0.01_var(--hue))] hover:bg-[oklch(0.94_0.02_var(--hue))]']}
              onClick={() => isRemote.value = false}
            >
              <div class="i-mdi-monitor text-3xl op-60" />
              <div class="font-bold">{t('oobe.localMode')}</div>
              <div class="text-xs op-60 text-center">{t('oobe.localModeDesc')}</div>
            </div>
            <div
              class={['flex-1 p-5 rounded-xl cursor-pointer transition-all border-2 flex flex-col items-center gap-3',
                isRemote.value ? 'border-[oklch(0.7_0.1_var(--hue))] bg-[oklch(0.95_0.03_var(--hue))]' : 'border-transparent bg-[oklch(0.96_0.01_var(--hue))] hover:bg-[oklch(0.94_0.02_var(--hue))]']}
              onClick={() => isRemote.value = true}
            >
              <div class="i-mdi-lan text-3xl op-60" />
              <div class="font-bold">{t('oobe.remoteMode')}</div>
              <div class="text-xs op-60 text-center">{t('oobe.remoteModeDesc')}</div>
            </div>
          </div>
          <TransitionVertical>
            {isRemote.value && (
              <div class="flex flex-col gap-3 w-full max-w-sm my-3">
                <CheckBox v-model:value={useAuth.value}>
                  {t('oobe.enableAuth')}
                </CheckBox>
                <TransitionVertical>
                  {useAuth.value && (
                    <div class="flex flex-col gap-2">
                      <TextInput
                        placeholder={t('oobe.username')}
                        v-model:value={authUsername.value}
                      />
                      <TextInput
                        type="password"
                        placeholder={t('oobe.password')}
                        v-model:value={authPassword.value}
                      />
                    </div>
                  )}
                </TransitionVertical>
                <CheckBox v-model:value={startupEnabled.value} onChange={() => (api as any).SetStartupEnabled(startupEnabled.value)}>
                  {t('oobe.startupOnBoot')}
                </CheckBox>
              </div>
            )}
          </TransitionVertical>
          <Button
            onClick={handleComplete}
            ing={props.completing && !props.remoteReady}
          >
            {t('oobe.complete')}
          </Button>
        </div>
      );
    }
  },
});
