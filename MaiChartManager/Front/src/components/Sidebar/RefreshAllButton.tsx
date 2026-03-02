import { defineComponent, ref } from "vue";
import { globalCapture, updateAll } from "@/store/refs";
import api from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const load = ref(false);
    const { t } = useI18n();

    const reload = async () => {
      if (load.value) return;
      load.value = true;
      try {
        await api.ReloadAll();
        await updateAll();
      } catch (err) {
        globalCapture(err, t('error.refreshFailed'))
      } finally {
        load.value = false;
      }
    }

    return () => (
      <div
        class={[
          'w-12 h-12 min-[768px]:w-15 min-[768px]:h-15 flex items-center justify-center rounded-md cursor-pointer shrink-0',
          'transition-all duration-200 border-none bg-transparent relative group',
          load.value
            ? 'text-[var(--link-color)]'
            : 'text-gray-500 bg-avatarMenuButton hover:text-gray-700',
        ]}
        onClick={reload}
      >
        <span class={['i-ic-baseline-refresh text-6', load.value && 'animate-spin']} />
        <span class={[
          'absolute px-3 py-1.5 rounded-lg bg-[oklch(0.7_0.13_var(--hue))] text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-100',
          'bottom-full mb-2 left-1/2 -translate-x-1/2',
          'min-[768px]:bottom-auto min-[768px]:left-full min-[768px]:ml-2 min-[768px]:mb-0 min-[768px]:translate-x-0',
        ]}>
          {t('sidebar.refreshData')}
        </span>
      </div>
    );
  }
})
