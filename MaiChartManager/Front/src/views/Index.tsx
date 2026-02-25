import { defineComponent, onMounted, ref } from 'vue';
import { showTransactionalDialog } from '@munet/ui';
import MusicList from '@/components/MusicList';
import GenreVersionManager from '@/components/GenreVersionManager';
import { globalCapture, selectedADir, selectedMusic, updateAll, updateVersion, version } from '@/store/refs';
import MusicEdit from '@/components/MusicEdit';
import MusicSelectedTopRightToolbar from '@/components/MusicSelectedTopRightToolbar';
import ModManager from '@/components/ModManager';
import VersionInfo from '@/components/VersionInfo';
import { captureException } from '@sentry/vue';
import AssetDirsManager from '@/components/AssetDirsManager';
import ImportCreateChartButton from '@/components/ImportCreateChartButton';
import { HardwareAccelerationStatus, LicenseStatus } from '@/client/apiGen';
import CopyToButton from '@/components/CopyToButton';
import TransitionOpacity from '@/components/TransitionOpacity';
import Tools from '@/components/Tools';
import { useI18n } from 'vue-i18n';
import DragDropDispatcher, { mainDivRef } from '@/components/DragDropDispatcher';
import Sidebar, { SidebarItem } from '@/components/Sidebar';
import BatchActionButton from '@/components/MusicList/BatchActionButton';

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

    const mobileShowMenu = ref(false);

    return () => (
      <div class="flex justify-center" ref={mainDivRef}>
        <DragDropDispatcher />
        <div class={['grid w-[min(100rem,100%)] max-[767px]:cols-1', sidebarActive.value === 'charts' ? 'cols-[48px_40em_1fr] max-[1440px]:cols-[48px_1fr]' : 'cols-[48px_1fr]']}>
          <Sidebar v-model:active={sidebarActive.value} />
          {sidebarActive.value === 'charts' && <>
            <div class={[
              'p-xy h-100dvh',
              'max-[1440px]:absolute max-[1440px]:left-12 max-[1440px]:w-40em max-[1440px]:max-w-[calc(100dvw-48px)] z-10 transition-transform duration-300',
              'max-[1440px]:bg-white max-[1440px]:border-r-solid max-[1440px]:border-r-1 max-[1440px]:border-r-gray-200',
              'max-[767px]:left-0 max-[767px]:max-w-100dvw',
              mobileShowMenu.value ? 'max-[1440px]:translate-x-0' : 'max-[1440px]:translate-x-[-100%]',
            ]}>
              <MusicList toggleMenu={() => (mobileShowMenu.value = false)} />
            </div>
            <TransitionOpacity>
              {mobileShowMenu.value && (
                <div
                  class="min-[1440px]:hidden absolute-full z-5 bg-white/70 backdrop-blur-sm"
                  onClick={() => (mobileShowMenu.value = false)}
                />
              )}
            </TransitionOpacity>
            <div
              class="flex flex-col gap-4 p-xy h-100dvh"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 16px, rgba(255, 255, 255, 0.1) calc(100% - 16px), transparent 100%)' }}
            >
              <div class="flex items-center gap-2 shrink-0">
                <button onClick={() => (mobileShowMenu.value = true)} class="min-[1440px]:hidden">
                  <span class="i-ic-baseline-menu text-lg" />
                </button>
                <AssetDirsManager />
                <div class="grow-1" />
                {!!selectedMusic.value && <CopyToButton />}
                {selectedADir.value === 'A000' ? (
                  t('assetDir.selectNonA000')
                ) : (
                  <>
                    <MusicSelectedTopRightToolbar />
                    <ImportCreateChartButton />
                  </>
                )}
                <Tools />
                <VersionInfo />
              </div>
              <div class="of-y-auto cst grow-1">
                <MusicEdit />
              </div>
            </div>
          </>}
          {sidebarActive.value === 'mods' && <div class="p-xy h-100dvh of-y-auto"><ModManager /></div>}
          {sidebarActive.value === 'genres' && <div class="flex flex-col p-xy h-100dvh"><GenreVersionManager /></div>}
          {sidebarActive.value === 'batch' && <div class="p-xy h-100dvh"><BatchActionButton /></div>}
        </div>
      </div>
    );
  },
});
