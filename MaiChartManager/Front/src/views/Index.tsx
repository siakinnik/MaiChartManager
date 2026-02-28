import { defineComponent, onMounted, ref } from 'vue';
import { showTransactionalDialog } from '@munet/ui';
import GenreVersionManager from './GenreVersionManager';
import { globalCapture, updateAll, updateVersion, version, assetDirs, selectedADir, sidebarActive } from '@/store/refs';
import ModManager from '@/views/ModManager';
import { captureException } from '@sentry/vue';
import { HardwareAccelerationStatus, LicenseStatus } from '@/client/apiGen';
import { useI18n } from 'vue-i18n';
import DragDropDispatcher, { mainDivRef } from '@/components/DragDropDispatcher';
import Sidebar, { SidebarItem } from '@/components/Sidebar';
import BatchActionButton from '@/views/BatchAction';
import Charts from './Charts';
import Tools from './Tools';
import Settings from './Settings';
import Splash from '@/components/Splash';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const loaded = ref(false);

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

      const waitForBackendUrl = () => new Promise<void>(resolve => {
        // 非 WebView2 环境（远程浏览器），baseUrl 已经是 ''（相对路径），无需等待
        if (location.hostname !== 'mcm.invalid') {
          resolve();
          return;
        }
        if ((globalThis as any).backendUrl) {
          resolve();
          return;
        }
        const interval = setInterval(() => {
          if ((globalThis as any).backendUrl) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });

      await waitForBackendUrl();
      updateVersion().then(() => {
        if (version.value?.license === LicenseStatus.Pending || version.value?.hardwareAcceleration === HardwareAccelerationStatus.Pending) {
          setTimeout(updateVersion, 2000);
        }
      });
      try {
        await updateAll();
        if (assetDirs.value.length > 0) {
          const exists = assetDirs.value.some(d => d.dirName === selectedADir.value)
          if (!exists) {
            selectedADir.value = assetDirs.value[assetDirs.value.length - 1].dirName!
          }
        }
        loaded.value = true;
      } catch (err) {
        loaded.value = true;
        globalCapture(err, t('error.initFailed'));
      }
    });


    return () => (
      <div class="" ref={mainDivRef as any}>
        <DragDropDispatcher />
        <Splash show={!loaded.value} />
        <div class={['grid cols-[auto_1fr] max-[768px]:cols-1']}>
          <Sidebar v-model:active={sidebarActive.value} />
          {sidebarActive.value === 'charts' && <Charts />}
          {sidebarActive.value === 'mods' && <ModManager />}
          {sidebarActive.value === 'genres' && <GenreVersionManager />}
          {sidebarActive.value === 'batch' && <BatchActionButton />}
          {sidebarActive.value === 'tools' && <Tools />}
          {sidebarActive.value === 'settings' && <Settings />}
        </div>
      </div>
    );
  },
});
