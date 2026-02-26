import { computed, defineComponent, PropType, ref } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";
import { DropDown, Button } from '@munet/ui';
import { useI18n } from 'vue-i18n';
import { rightPanel, editingMemoDir, editingMemoName } from "@/views/Charts/refs";

export default defineComponent({
  props: {
    dir: {type: Object as PropType<GetAssetsDirsResult>, required: true}
  },
  setup(props) {
    const { t } = useI18n();
    const memos = computed(() => props.dir.subFiles!.filter(f => f.toLowerCase().endsWith('.txt')));
    const ddRef = ref<any>(null);

    const onSelect = (key: string) => {
      editingMemoDir.value = props.dir;
      editingMemoName.value = key;
      rightPanel.value = 'memoEdit';
    };

    return () => (
      <DropDown ref={ddRef as any}>
        {{
          trigger: (toggle: Function) => (
            <Button variant="secondary" onClick={() => toggle()}>
              <div class="flex items-center gap-1">
                <span class="i-material-symbols-edit-note text-lg translate-y-.3" />
                {memos.value.length || ''}
              </div>
            </Button>
          ),
          default: () => (
            <div class="flex flex-col gap-1 min-w-30">
              {memos.value.map(it => (
                <div class="px-4 py-2 rounded-lg bg-avatarMenuButton cursor-pointer" onClick={() => { ddRef.value?.setShow(false); onSelect(it); }}>
                  {it}
                </div>
              ))}
              <div class="px-4 py-2 rounded-lg bg-avatarMenuButton cursor-pointer" onClick={() => { ddRef.value?.setShow(false); onSelect('add'); }}>
                <span class="c-blue-5 flex items-center">{t('common.create')}</span>
              </div>
            </div>
          ),
        }}
      </DropDown>
    );
  }
})
