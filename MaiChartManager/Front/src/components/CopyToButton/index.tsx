import { computed, defineComponent, ref } from "vue";
import api, { getUrl } from "@/client/api";
import { globalCapture, selectedADir, selectedMusic, selectMusicId, showNeedPurchaseDialog, updateMusicList, version } from "@/store/refs";
import { Button, DropDown, addToast } from "@munet/ui";
import { BlobWriter, ZipReader } from "@zip.js/zip.js";
import ChangeIdDialog from "./ChangeIdDialog";
import getSubDirFile from "@/utils/getSubDirFile";
import { useI18n } from 'vue-i18n';

enum DROPDOWN_OPTIONS {
  export,
  exportZip,
  changeId,
  showExplorer,
  exportMaidata,
  exportMaidataIgnoreVideo,
  exportMaiDataZip,
  exportMaiDataZipIgnoreVideo,
  editXml,
}

export default defineComponent({
  setup() {
    const wait = ref(false);
    const showChangeId = ref(false);
    const { t } = useI18n();
    const ddRef = ref<any>(null);

    const options = computed(() => [
      {
        label: () => <a href={getUrl(`ExportOptApi/${selectedADir.value}/${selectMusicId.value}`)} download={`${selectMusicId.value} - ${selectedMusic.value?.name}.zip`}>{t('copy.exportZip')}</a>,
        key: DROPDOWN_OPTIONS.exportZip,
      },
      {
        label: t('copy.exportMaidata'),
        key: DROPDOWN_OPTIONS.exportMaidata,
      },
      {
        label: () => <a href={getUrl(`ExportAsMaidataApi/${selectedADir.value}/${selectMusicId.value}`)} download={`${selectMusicId.value} - ${selectedMusic.value?.name} - Maidata.zip`}>{t('copy.exportMaidataZip')}</a>,
        key: DROPDOWN_OPTIONS.exportMaiDataZip,
      },
      {
        label: t('copy.exportMaidataNoVideo'),
        key: DROPDOWN_OPTIONS.exportMaidataIgnoreVideo,
      },
      {
        label: () => <a href={getUrl(`ExportAsMaidataApi/${selectedADir.value}/${selectMusicId.value}?ignoreVideo=true`)} download={`${selectMusicId.value} - ${selectedMusic.value?.name} - Maidata.zip`}>{t('copy.exportMaidataZipNoVideo')}</a>,
        key: DROPDOWN_OPTIONS.exportMaiDataZipIgnoreVideo,
      },
      ...(selectedADir.value === 'A000' ? [] : [{
        label: t('copy.changeId'),
        key: DROPDOWN_OPTIONS.changeId,
      }]),
      {
        label: t('copy.showInExplorer'),
        key: DROPDOWN_OPTIONS.showExplorer,
      },
      {
        label: t('copy.editXml'),
        key: DROPDOWN_OPTIONS.editXml,
      }
    ])

    const handleOptionClick = (key: DROPDOWN_OPTIONS) => {
      switch (key) {
        case DROPDOWN_OPTIONS.changeId:
          if (version.value?.license !== 'Active') {
            showNeedPurchaseDialog.value = true
            return
          }
          showChangeId.value = true;
          break;
        case DROPDOWN_OPTIONS.showExplorer:
          api.RequestOpenExplorer(selectMusicId.value, selectedADir.value);
          break;
        case DROPDOWN_OPTIONS.exportMaidata:
        case DROPDOWN_OPTIONS.exportMaidataIgnoreVideo:
          copy(key);
          break;
        case DROPDOWN_OPTIONS.editXml:
          api.RequestOpenXml(selectMusicId.value, selectedADir.value);
          break;
      }
    }

    const copy = async (type: DROPDOWN_OPTIONS) => {
      wait.value = true;
      if (location.hostname !== 'mcm.invalid' || type === DROPDOWN_OPTIONS.exportMaidata || type === DROPDOWN_OPTIONS.exportMaidataIgnoreVideo) {
        // 浏览器模式，使用 zip.js 获取并解压
        let folderHandle: FileSystemDirectoryHandle;
        try {
          folderHandle = await window.showDirectoryPicker({
            id: 'copyToSaveDir',
            mode: 'readwrite'
          });
        } catch (e) {
          wait.value = false;
          console.log(e)
          return;
        }
        try {
          let url = getUrl(`${type === DROPDOWN_OPTIONS.export ? 'ExportOptApi' : 'ExportAsMaidataApi'}/${selectedADir.value}/${selectMusicId.value}`);
          if (type === DROPDOWN_OPTIONS.exportMaidataIgnoreVideo) {
            url += '?ignoreVideo=true';
          }
          const zip = await fetch(url)
          const zipReader = new ZipReader(zip.body!);
          try {
            const entries = zipReader.getEntriesGenerator();
            for await (const entry of entries) {
              console.log(entry.filename);
              if (entry.filename.endsWith('/')) {
                continue;
              }
              if (!entry.getData) {
                continue;
              }
              const fileHandle = await getSubDirFile(folderHandle, entry.filename);
              const writable = await fileHandle.createWritable();
              try {
                const blob = await entry.getData(new BlobWriter());
                await writable.write(blob);
              } finally {
                await writable.close();
              }
            }
            addToast({message: t('message.exportSuccess'), type: 'success'});
          } finally {
            await zipReader.close();
          }
        } catch (e) {
          globalCapture(e, t('copy.exportError'))
        } finally {
          wait.value = false;
        }
        return;
      }
      try {
        // 本地 webview 打开，使用本地模式
        await api.RequestCopyTo({
          music: [{id: selectMusicId.value, assetDir: selectedADir.value}],
          removeEvents: false,
        });
      } finally {
        wait.value = false;
      }
    }

    return () =>
      <div class="flex">
        <Button variant="secondary" onClick={() => copy(DROPDOWN_OPTIONS.export)} ing={wait.value}>
          {t('copy.title')}...
        </Button>
        <DropDown ref={ddRef}>
          {{
            trigger: (toggle: Function) => <Button variant="secondary" class="px-.5 b-l b-l-solid b-l-[rgba(255,255,255,0.5)]" onClick={() => toggle()}>
              <span class="i-mdi-arrow-down-drop text-6 translate-y-.25"/>
            </Button>,
            default: () => <div class="flex flex-col gap-1 min-w-40">
              {options.value.map(o => {
                const label = typeof o.label === 'function' ? o.label() : o.label;
                return <div key={o.key} class="px-4 py-2 rounded-lg bg-avatarMenuButton cursor-pointer" onClick={() => { ddRef.value?.setShow(false); handleOptionClick(o.key); }}>
                  {label}
                </div>
              })}
            </div>
          }}
        </DropDown>
        <ChangeIdDialog v-model:show={showChangeId.value}/>
      </div>
  }
})
