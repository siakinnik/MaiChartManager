import { computed, defineComponent, PropType, ref } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";
import { DropDown, Button } from '@munet/ui';
import MemoBox from "@/components/AssetDirsManager/MemoBox";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: {type: Object as PropType<GetAssetsDirsResult>, required: true}
  },
  setup(props) {
    const { t } = useI18n();
    const memos = computed(() => props.dir.subFiles!.filter(f => f.toLowerCase().endsWith('.txt')));
    const ddRef = ref<any>(null);

    const showBox = ref(false)
    const selectMemo = ref('')

    const onSelect = (key: string) => {
      selectMemo.value = key
      showBox.value = true
    }

    return () => <>
      <DropDown ref={ddRef as any}>
        {{
          trigger: (toggle: Function) => <Button variant="secondary" onClick={() => toggle()}>
            <div class="flex items-center gap-1">
              <span class="i-material-symbols-edit-note text-lg translate-y-.3"/>
              {memos.value.length || ''}
            </div>
          </Button>,
          default: () => <div class="flex flex-col gap-1 min-w-30">
            {memos.value.map(it => <div class="px-4 py-2 rounded-lg bg-avatarMenuButton cursor-pointer" onClick={() => { ddRef.value?.setShow(false); onSelect(it); }}>{it}</div>)}
            <div class="px-4 py-2 rounded-lg bg-avatarMenuButton cursor-pointer" onClick={() => { ddRef.value?.setShow(false); onSelect('add'); }}>
              <span class="c-blue-5 flex items-center">{t('common.create')}</span>
            </div>
          </div>
        }}
      </DropDown>
      <MemoBox v-model:show={showBox.value} dir={props.dir} name={selectMemo.value}/>
    </>;
  }
})
