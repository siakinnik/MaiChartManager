import { computed, defineComponent } from "vue";
import { Modal } from "@munet/ui";
import FileTypeIcon from "@/components/FileTypeIcon";
import FileContentIcon from "@/components/FileContentIcon";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
    closeModal: {type: Function, required: true}
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    
    const show = computed({
      get: () => props.show,
      set: (val) => props.closeModal()
    })

    return () => <Modal v-model:show={show.value} title={t('music.edit.selectFileTypes')} width="min(50vw,40em)">
      <div class="flex flex-col gap-3">
        {t('chart.import.folderHint')}
        <div class="grid cols-[2fr_1fr] justify-items-center h-50 gap-5 w-50%">
          <div class="flex flex-col gap-1 items-center w-full">
            <FileContentIcon type="maidata"/>
            maidata.txt
          </div>
          <div class="grid rows-2">
            <div class="flex flex-col gap-1 items-center justify-center w-full">
              <FileTypeIcon type="mp3" class="text-16"/>
              track.mp3
            </div>
            <div class="flex flex-col gap-1 items-center justify-center w-full">
              <FileTypeIcon type="jpg" class="text-16"/>
              bg.jpg / bg.png
            </div>
          </div>
        </div>
      </div>
    </Modal>;
  }
})
