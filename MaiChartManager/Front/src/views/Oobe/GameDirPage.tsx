import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/client/api';

export default defineComponent({
  props: {
    gamePath: { type: String, default: '' },
    pathValid: { type: Boolean, default: false },
    initializing: { type: Boolean, default: false },
  },
  emits: ['update:gamePath', 'update:pathValid', 'update:initializing'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const pathError = ref('');

    const browseFolder = async () => {
      pathError.value = '';
      emit('update:pathValid', false);
      try {
        const res = await api.OpenFolderDialog();
        if (!res.data) return;
        emit('update:gamePath', res.data);
        await api.SetGamePath(res.data);
        emit('update:pathValid', true);
      } catch (e: any) {
        pathError.value = t('oobe.pathNotValid');
      }
    };

    return () => (
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
        {props.gamePath && (
          <div class="flex flex-col items-center gap-2">
            <div class={['text-sm px-4 py-2 rounded-lg', props.pathValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']}>
              {props.pathValid ? t('oobe.selectedPath') : pathError.value}: {props.gamePath}
            </div>
          </div>
        )}
        {props.initializing && (
          <div class="text-sm op-60 animate-pulse">{t('oobe.initializingData')}</div>
        )}
      </div>
    );
  },
});
