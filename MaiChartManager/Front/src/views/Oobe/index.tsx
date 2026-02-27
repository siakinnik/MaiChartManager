import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/client/api';
import WelcomePage from './WelcomePage';
import GameDirPage from './GameDirPage';
import ModeSelectPage from './ModeSelectPage';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const step = ref(0);

    // Step 1 state
    const gamePath = ref('');
    const pathValid = ref(false);
    const initializing = ref(false);

    // Step 2 state
    const completing = ref(false);
    const remoteReady = ref(false);
    const lanAddresses = ref<string[]>([]);

    const canGoNext = computed(() => {
      if (step.value === 0) return true;
      if (step.value === 1) return pathValid.value && !initializing.value;
      return false;
    });

    const goNext = async () => {
      if (step.value === 0) {
        step.value = 1;
      } else if (step.value === 1) {
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

    const handleComplete = async (opts: { isRemote: boolean; useAuth: boolean; authUsername: string; authPassword: string }) => {
      completing.value = true;
      try {
        await api.CompleteSetup({
          export: opts.isRemote,
          useAuth: opts.useAuth,
          authUsername: opts.authUsername || null,
          authPassword: opts.authPassword || null,
        });
        if (opts.isRemote) {
          const res = await api.GetLanAddresses();
          lanAddresses.value = res.data || [];
          remoteReady.value = true;
          completing.value = false;
        }
      } catch (e) {
        completing.value = false;
      }
    };

    return () => (
      <div class="fixed inset-0 bg-[oklch(0.97_0.01_var(--hue))] flex flex-col">
        <div class="flex-1 overflow-auto">
          {step.value === 0 && <WelcomePage />}
          {step.value === 1 && (
            <GameDirPage
              gamePath={gamePath.value}
              onUpdate:gamePath={(v: string) => gamePath.value = v}
              pathValid={pathValid.value}
              onUpdate:pathValid={(v: boolean) => pathValid.value = v}
              initializing={initializing.value}
              onUpdate:initializing={(v: boolean) => initializing.value = v}
            />
          )}
          {step.value === 2 && (
            <ModeSelectPage
              completing={completing.value}
              remoteReady={remoteReady.value}
              lanAddresses={lanAddresses.value}
              onComplete={handleComplete}
            />
          )}
        </div>
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
