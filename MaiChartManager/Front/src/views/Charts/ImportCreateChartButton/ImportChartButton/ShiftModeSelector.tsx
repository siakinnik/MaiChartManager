import { defineComponent, PropType } from "vue";
import { Popover, Radio } from "@munet/ui";
import { ShiftMethod } from "@/client/apiGen";
import { TempOptions } from "./types";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    tempOptions: {type: Object as PropType<TempOptions>, required: true},
  },
  setup(props) {
    const {t} = useI18n();

    return () => <div>
      <div class="ml-1 text-sm">{t('chart.import.option.shiftMode')}</div>
      <div class="flex flex-col gap-2 w-full">
        <div class="flex gap-2 h-34px items-center">
          <Popover trigger="hover">
            {{
              trigger: () => <Radio value={ShiftMethod.Bar} checked={props.tempOptions.shift === ShiftMethod.Bar} onUpdate:checked={() => { if (!props.tempOptions.shiftLocked) props.tempOptions.shift = ShiftMethod.Bar }}>{t('chart.import.option.shiftByBar')}</Radio>,
              default: () => <div>
                {props.tempOptions.shiftLocked ? t('chart.import.option.shiftModeLocked') : t('chart.import.option.shiftByBarDesc')}
              </div>
            }}
          </Popover>
          <Popover trigger="hover">
            {{
              trigger: () => <Radio value={ShiftMethod.Legacy} checked={props.tempOptions.shift === ShiftMethod.Legacy} onUpdate:checked={() => { if (!props.tempOptions.shiftLocked) props.tempOptions.shift = ShiftMethod.Legacy }}>{t('chart.import.option.shiftLegacy')}</Radio>,
              default: () => <div>
                {props.tempOptions.shiftLocked ? t('chart.import.option.shiftModeLocked') : t('chart.import.option.shiftLegacyDesc')}
              </div>
            }}
          </Popover>
          <Popover trigger="hover">
            {{
              trigger: () => <Radio value={ShiftMethod.NoShift} checked={props.tempOptions.shift === ShiftMethod.NoShift} onUpdate:checked={() => { if (!props.tempOptions.shiftLocked) props.tempOptions.shift = ShiftMethod.NoShift }}>{t('chart.import.option.shiftNoMove')}</Radio>,
              default: () => <div>
                {props.tempOptions.shiftLocked ? t('chart.import.option.shiftModeLocked') : t('chart.import.option.shiftNoMoveDesc')}
              </div>
            }}
          </Popover>
        </div>
      </div>
    </div>
  }
})
