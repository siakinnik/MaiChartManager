import { defineComponent, ref, computed, Transition } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/client/api';
import mcmLogo from '@/components/Splash/mcm.png';
import { setLocale, availableLocales, locale } from '@/locales/index';
import type { Locale } from '@/locales/index';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const step = ref(0);

    // Step 1: Game directory
    const gamePath = ref('');
    const pathError = ref('');
    const pathValid = ref(false);
    const initializing = ref(false);

    // Step 2: Mode selection
    const isRemote = ref(false);
    const useAuth = ref(false);
    const authUsername = ref('');
    const authPassword = ref('');
    const completing = ref(false);
    const remoteReady = ref(false);
    const lanAddresses = ref<string[]>([]);

    const canGoNext = computed(() => {
      if (step.value === 0) return true;
      if (step.value === 1) return pathValid.value && !initializing.value;
      return false;
    });

    const cycleLocale = () => {
      const idx = availableLocales.indexOf(locale.value as Locale);
      const next = availableLocales[(idx + 1) % availableLocales.length];
      setLocale(next);
    };

    const browseFolder = async () => {
      pathError.value = '';
      pathValid.value = false;
      try {
        const res = await api.OpenFolderDialog();
        if (!res.data) return;
        gamePath.value = res.data;
        await api.SetGamePath(res.data);
        pathValid.value = true;
      } catch (e: any) {
        pathError.value = t('oobe.pathNotValid');
      }
    };

    const goNext = async () => {
      if (step.value === 0) {
        step.value = 1;
      } else if (step.value === 1) {
        // Initialize game data before moving to step 2
        initializing.value = true;
        try {
          await api.InitializeGameData();
          initializing.value = false;
          step.value = 2;
        } catch (e) {
          initializing.value = false;
        }
      }
    };

    const goPrev = () => {
      if (step.value > 0) step.value--;
    };

    const completeSetup = async () => {
      completing.value = true;
      try {
        await api.CompleteSetup({
          export: isRemote.value,
          useAuth: useAuth.value,
          authUsername: authUsername.value || null,
          authPassword: authPassword.value || null,
        });
        if (isRemote.value) {
          const res = await api.GetLanAddresses();
          lanAddresses.value = res.data || [];
          remoteReady.value = true;
          completing.value = false;
        }
        // local mode: backend closes window, just stay in completing state
      } catch (e) {
        completing.value = false;
      }
    };

    // Welcome page (step 0)
    const WelcomePage = () => (
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

    // Game directory page (step 1)
    const GameDirPage = () => (
      <div class="flex flex-col items-center justify-center h-full gap-6 px-12">
        <div class="i-mdi-folder-open text-5xl op-40" />
        <div class="text-xl font-bold op-90">{t('oobe.selectGameDir')}</div>
        <div class="text-sm op-60 text-center">{t('oobe.selectGameDirDesc')}</div>
        <button
          class="px-6 py-3 rounded-lg bg-[oklch(0.85_0.05_var(--hue))] hover:bg-[oklch(0.8_0.07_var(--hue))] transition-colors cursor-pointer border-none text-base"
          onClick={browseFolder}
        >
          {t('oobe.browse')}
        </button>
        {gamePath.value && (
          <div class="flex flex-col items-center gap-2">
            <div class={['text-sm px-4 py-2 rounded-lg', pathValid.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']}>
              {pathValid.value ? t('oobe.selectedPath') : pathError.value}: {gamePath.value}
            </div>
          </div>
        )}
        {initializing.value && (
          <div class="text-sm op-60 animate-pulse">{t('oobe.initializingData')}</div>
        )}
      </div>
    );

    // Mode selection page (step 2)
    const ModeSelectPage = () => {
      if (completing.value && !remoteReady.value) {
        return (
          <div class="flex flex-col items-center justify-center h-full gap-4">
            <div class="i-mdi-loading animate-spin text-4xl op-40" />
            <div class="text-lg op-70">{t('oobe.completing')}</div>
          </div>
        );
      }
      if (remoteReady.value) {
        return (
          <div class="flex flex-col items-center justify-center h-full gap-6 px-12">
            <div class="i-mdi-check-circle text-5xl text-green-600" />
            <div class="text-xl font-bold op-90">{t('oobe.remoteReady')}</div>
            <div class="text-sm op-60">{t('oobe.lanAddresses')}</div>
            <div class="flex flex-col gap-2 items-center">
              {lanAddresses.value.map(addr => (
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
      return (
        <div class="flex flex-col items-center justify-center h-full gap-6 px-12">
          <div class="text-xl font-bold op-90">{t('oobe.selectMode')}</div>
          <div class="flex gap-4 w-full max-w-md">
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
          {isRemote.value && (
            <div class="flex flex-col gap-3 w-full max-w-sm">
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={useAuth.value} onChange={(e: any) => useAuth.value = e.target.checked} />
                {t('oobe.enableAuth')}
              </label>
              {useAuth.value && (
                <div class="flex flex-col gap-2">
                  <input
                    class="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                    placeholder={t('oobe.username')}
                    value={authUsername.value}
                    onInput={(e: any) => authUsername.value = e.target.value}
                  />
                  <input
                    class="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                    type="password"
                    placeholder={t('oobe.password')}
                    value={authPassword.value}
                    onInput={(e: any) => authPassword.value = e.target.value}
                  />
                </div>
              )}
            </div>
          )}
          <button
            class="mt-2 px-8 py-3 rounded-lg bg-[oklch(0.75_0.1_var(--hue))] hover:bg-[oklch(0.7_0.12_var(--hue))] transition-colors cursor-pointer border-none text-base text-white font-bold"
            onClick={completeSetup}
          >
            {t('oobe.complete')}
          </button>
        </div>
      );
    };
    return () => (
      <div class="fixed inset-0 bg-[oklch(0.97_0.01_var(--hue))] flex flex-col">
        {/* Content area */}
        <div class="flex-1 overflow-auto">
          {step.value === 0 && <WelcomePage />}
          {step.value === 1 && <GameDirPage />}
          {step.value === 2 && <ModeSelectPage />}
        </div>
        {/* Navigation buttons */}
        {!completing.value && !remoteReady.value && (
          <div class="relative h-16 shrink-0">
            {step.value > 0 && (
              <button
                class="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-[oklch(0.88_0.04_var(--hue))] hover:bg-[oklch(0.83_0.06_var(--hue))] transition-colors cursor-pointer border-none flex items-center justify-center shadow-lg"
                onClick={goPrev}
              >
                <div class="i-mdi-arrow-left text-xl" />
              </button>
            )}
            {step.value < 2 && (
              <button
                class={['fixed bottom-6 right-6 w-12 h-12 rounded-full transition-colors border-none flex items-center justify-center shadow-lg',
                  canGoNext.value ? 'bg-[oklch(0.75_0.1_var(--hue))] hover:bg-[oklch(0.7_0.12_var(--hue))] cursor-pointer text-white' : 'bg-gray-200 cursor-not-allowed text-gray-400']}
                onClick={() => canGoNext.value && goNext()}
                disabled={!canGoNext.value}
              >
                <div class="i-mdi-arrow-right text-xl" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
});
