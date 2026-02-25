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
          'w-15 h-15 flex flex-col items-center justify-center rounded-md cursor-pointer',
          'transition-all duration-200 border-none bg-transparent relative group',
          load.value
            ? 'text-[var(--link-color)]'
            : 'text-gray-500 bg-avatarMenuButton hover:text-gray-700',
        ]}
        onClick={reload}
      >
        <span class={['i-ic-baseline-refresh text-6', load.value && 'animate-spin']} />
        <span class="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-[oklch(0.7_0.13_var(--hue))] text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-100">
          {t('sidebar.refreshData')}
        </span>
      </div>
    );
  }
})
