import { defineComponent, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/client/api';
import { TransitionVertical, TextInput } from '@munet/ui';

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

    if (props.completing && !props.remoteReady) {
      return () => (
        <div class="flex flex-col items-center justify-center h-full gap-4">
          <div class="i-mdi-loading animate-spin text-4xl op-40" />
          <div class="text-lg op-70">{t('oobe.completing')}</div>
        </div>
      );
    }

    if (props.remoteReady) {
      return () => (
        <div class="flex flex-col items-center justify-center h-full gap-6 px-12">
          <div class="i-mdi-check-circle text-5xl text-green-600" />
          <div class="text-xl font-bold op-90">{t('oobe.remoteReady')}</div>
          <div class="text-sm op-60">{t('oobe.lanAddresses')}</div>
          <div class="flex flex-col gap-2 items-center">
            {props.lanAddresses.map(addr => (
              <div class="px-4 py-2 rounded-lg bg-[oklch(0.92_0.02_var(--hue))] text-sm font-mono">{addr}</div>
            ))}
          </div>
          <a
            href="/"
            target="_blank"
            class="mt-2 px-6 py-3 rounded-lg bg-[oklch(0.85_0.05_var(--hue))] hover:bg-[oklch(0.8_0.07_var(--hue))] transition-colors cursor-pointer border-none text-base no-underline text-inherit"
          >
            {t('oobe.openMainUI')}
          </a>
        </div>
      );
    }

    return () => (
      <div class="flex flex-col items-center justify-center h-full px-12">
        <div class="text-xl font-bold op-90">{t('oobe.selectMode')}</div>
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
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={useAuth.value} onChange={(e: any) => useAuth.value = e.target.checked} />
                {t('oobe.enableAuth')}
              </label>
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
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={startupEnabled.value} disabled={!startupCanChange.value} onChange={(e: any) => { startupEnabled.value = e.target.checked; (api as any).SetStartupEnabled(e.target.checked); }} />
                {t('oobe.startupOnBoot')}
              </label>
            </div>
          )}
        </TransitionVertical>
        <button
          class="mt-5 px-8 py-3 rounded-lg bg-[oklch(0.55_0.15_var(--hue))] hover:bg-[oklch(0.55_0.15_var(--hue)/0.8)] transition-colors cursor-pointer border-none text-base text-white font-bold"
          onClick={handleComplete}
        >
          {t('oobe.complete')}
        </button>
      </div>
    );
  },
});
