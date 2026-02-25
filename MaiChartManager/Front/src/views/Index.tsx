import { defineComponent, onMounted, ref } from 'vue';
import { showTransactionalDialog } from '@munet/ui';
import GenreVersionManager from './GenreVersionManager';
import { globalCapture, updateAll, updateVersion, version } from '@/store/refs';
import ModManager from '@/views/ModManager';
import { captureException } from '@sentry/vue';
import { HardwareAccelerationStatus, LicenseStatus } from '@/client/apiGen';
import { useI18n } from 'vue-i18n';
import DragDropDispatcher, { mainDivRef } from '@/components/DragDropDispatcher';
import Sidebar, { SidebarItem } from '@/components/Sidebar';
import BatchActionButton from '@/views/BatchAction';
import Charts from './Charts';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const sidebarActive = ref<SidebarItem>('charts');

    onMounted(async () => {
      document.title = `MaiChartManager (${location.host})`;
      addEventListener('unhandledrejection', (event) => {
        console.log(event);
        captureException(event.reason?.error || event.reason, {
          tags: { context: 'unhandledrejection' },
        });
      });

      if (window.showDirectoryPicker === undefined) {
        const showError = () => {
          showTransactionalDialog(
            t('error.browserUnsupported.title'),
            t('error.browserUnsupported.content'),
            [{ text: t('error.browserUnsupported.confirm'), action: true }],
          );
        };
        window.showDirectoryPicker = () => {
          showError();
          throw new DOMException(t('error.browserUnsupported.title'), 'AbortError');
        };
        showError();
      }

      updateVersion().then(() => {
        if (version.value?.license === LicenseStatus.Pending || version.value?.hardwareAcceleration === HardwareAccelerationStatus.Pending) {
          setTimeout(updateVersion, 2000);
        }
      });
      try {
        await updateAll();
      } catch (err) {
        globalCapture(err, t('error.initFailed'));
      }
    });


    return () => (
      <div class="flex justify-center" ref={mainDivRef}>
        <DragDropDispatcher />
        <div class={['grid w-[min(100rem,100%)] max-[767px]:cols-1', sidebarActive.value === 'charts' ? 'cols-[48px_40em_1fr] max-[1440px]:cols-[48px_1fr]' : 'cols-[48px_1fr]']}>
          <Sidebar v-model:active={sidebarActive.value} />
          {sidebarActive.value === 'charts' && <Charts />}
          {sidebarActive.value === 'mods' && <ModManager />}
          {sidebarActive.value === 'genres' && <GenreVersionManager />}
          {sidebarActive.value === 'batch' && <BatchActionButton />}
        </div>
      </div>
    );
  },
});
