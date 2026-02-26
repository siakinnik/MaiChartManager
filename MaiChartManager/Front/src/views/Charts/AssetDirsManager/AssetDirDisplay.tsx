import { computed, defineComponent, PropType, ref } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";
import { Button, DropDown, Popover } from '@munet/ui';
import OfficialChartToggle from "@/views/Charts/AssetDirsManager/OfficialChartToggle";
import MemosDisplay from "@/views/Charts/AssetDirsManager/MemosDisplay";
import DeleteButton from "@/views/Charts/AssetDirsManager/DeleteButton";
import CheckConflictButton from "@/views/Charts/AssetDirsManager/CheckConflictButton";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: { type: Object as PropType<GetAssetsDirsResult>, required: true },
    selected: { type: Boolean, default: false },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const ddRef = ref<any>(null);
    const hasDataConfig = computed(() => props.dir.subFiles!.some(it => it === 'DataConfig.xml'));

    return () => (
      <div
        class={[
          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
          props.selected ? "bg-primary/10" : "hover:bg-neutral/10",
        ]}
        onClick={() => emit('select')}
      >
        <div class="grow-1 min-w-0">
          <div class="truncate">
            {props.dir.dirName}
            <span class="op-70">{props.dir.version ? ` (Ver.${props.dir.version})` : ''}</span>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0" onClick={(e: Event) => e.stopPropagation()}>
          <MemosDisplay dir={props.dir} />
          {props.dir.dirName! !== 'A000' && (
            <DropDown ref={ddRef as any}>
              {{
                trigger: (toggle: Function) => (
                  <Button variant="secondary" onClick={() => toggle()}>
                    <span class="i-ic-baseline-more-vert text-lg" />
                  </Button>
                ),
                default: () => (
                  <div class="flex flex-col gap-1 min-w-40 p-1">
                    <div class="px-3 py-2 rounded-lg hover:bg-neutral/10 cursor-pointer">
                      {hasDataConfig.value ? (
                        <Popover trigger="hover">
                          {{
                            trigger: () => t('assetDir.storingOfficial'),
                            default: () => t('assetDir.dataConfigExists'),
                          }}
                        </Popover>
                      ) : (
                        <OfficialChartToggle dir={props.dir} />
                      )}
                    </div>
                    <div class="px-3 py-1 rounded-lg hover:bg-neutral/10">
                      <CheckConflictButton dir={props.dir.dirName!} />
                    </div>
                    <div class="px-3 py-1 rounded-lg hover:bg-neutral/10">
                      <DeleteButton dir={props.dir} />
                    </div>
                  </div>
                ),
              }}
            </DropDown>
          )}
        </div>
      </div>
    );
  }
})
