import { defineComponent, ref } from "vue";
import { Button, Modal } from "@munet/ui";
import { assetDirs, updateAssetDirs } from "@/store/refs";
import AssetDirDisplay from "@/views/Charts/AssetDirsManager/AssetDirDisplay";
import CreateButton from "./CreateButton";
import api from "@/client/api";
import ImportLocalButton from "./ImportLocalButton";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const show = ref(false);
    const { t } = useI18n();

    return () => <Button variant="secondary" onClick={() => show.value = true}>
      {t('assetDir.title')}

      <Modal
        class="w-80em max-w-100dvw"
        title={t('assetDir.title')}
        v-model:show={show.value}
      >
        <div class="flex flex-col gap-3">
          <div class="flex gap-2">
            <CreateButton/>
            <ImportLocalButton/>
          </div>
          <div class="of-y-auto cst h-80vh">
            <div class="flex flex-col gap-1">
              {assetDirs.value.map(it => <div key={it.dirName!}>
                <AssetDirDisplay dir={it}/>
              </div>)}
            </div>
          </div>
        </div>
      </Modal>
    </Button>;
  }
})
