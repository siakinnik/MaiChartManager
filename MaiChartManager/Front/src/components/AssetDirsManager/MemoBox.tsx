import { computed, defineComponent, PropType, ref, watch } from "vue";
import { Button, Modal, TextInput } from "@munet/ui";
import { GetAssetsDirsResult } from "@/client/apiGen";
import api from "@/client/api";
import { selectMusicId, updateAssetDirs, updateMusicList } from "@/store/refs";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: Boolean,
    dir: {type: Object as PropType<GetAssetsDirsResult>, required: true},
    name: {type: String, required: true},
  },
  setup(props, {emit}) {
    const show = computed({
      get: () => props.show,
      set: (val) => emit('update:show', val)
    })

    const content = ref('');
    const name = ref('');
    const load = ref(false);
    const { t } = useI18n();

    watch(() => props.show, async (newValue, oldValue) => {
      if (newValue) {
        load.value = true;
        content.value = '';
        name.value = '';
        if (props.name !== 'add') {
          const req = await api.GetAssetDirTxtValue({dirName: props.dir.dirName, fileName: props.name});
          content.value = req.data;
        }
        load.value = false;
      }
    })

    const save = async () => {
      load.value = true;
      await api.PutAssetDirTxtValue({dirName: props.dir.dirName, fileName: props.name === 'add' ? name.value + '.txt' : props.name, content: content.value});
      await updateAssetDirs();
      show.value = false;
      load.value = false;
    }

    const deleteLoading = ref(false);
    const deleteConfirm = ref(false);

    const del = async () => {
      if (!deleteConfirm.value) {
        deleteConfirm.value = true;
        return;
      }
      deleteConfirm.value = false;
      deleteLoading.value = true;
      await api.DeleteAssetDirTxt({dirName: props.dir.dirName, fileName: props.name});
      deleteLoading.value = false;
      show.value = false;
      updateAssetDirs();
    }

    return () => <Modal
      width="min(60vw,80em)"
      title={t('common.edit')}
      v-model:show={show.value}
    >{{
      default: () =>
        <div class="flex flex-col gap-3">
          {props.name === 'add' && <div>
            <div class="ml-1 text-sm">{t('assetDir.memoName')}</div>
            <TextInput v-model:value={name.value}/>
          </div>}
          <TextInput textarea v-model:value={content.value} class="h-60vh" disabled={load.value}/>
        </div>,
      actions: () =>
        <div class="flex justify-between">
          {props.name !== 'add' ? <Button variant="secondary" onClick={del} ing={deleteLoading.value} danger={deleteConfirm.value}
            // @ts-ignore
                                           onMouseleave={() => deleteConfirm.value = false}>{t('common.delete')}</Button> : <div/>}
          <Button variant="secondary" onClick={save}>{t('common.save')}</Button>
        </div>
    }}</Modal>;
  }
})
