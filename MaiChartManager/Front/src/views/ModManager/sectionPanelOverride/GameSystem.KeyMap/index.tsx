import {defineComponent, h, PropType} from "vue";
import { Select, CheckBox } from '@munet/ui';
import {KeyCodeID} from "@/views/ModManager/types/KeyCodeID";
import {IEntryState, ISectionState, Section} from "@/client/apiGen";
import ConfigEntry from "../../ConfigEntry";
import { useI18n } from 'vue-i18n';

const options = Object.entries(KeyCodeID).map(([key, value]) => ({label: key, value}))

export default defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: {type: Object as PropType<Record<string, IEntryState>>, required: true},
    sectionState: {type: Object as PropType<ISectionState>, required: true},
  },
  setup(props) {
    const { t } = useI18n();
    return () => <div>
      <div class="grid grid-cols-1 min-[500px]:grid-cols-2 gap-y-12px">
        <div>
          <div class="flex flex-col gap-2">
            {
              new Array(8).fill(0).map((_, i) => <div key={i} class="flex gap-2 items-start">
                <div class="ml-1 text-sm w-10em shrink-0">{t('mod.keyMap.button1P', {index: i + 1})}</div>
                <Select v-model:value={props.entryStates[`GameSystem.KeyMap.Button${i + 1}_1P`].value} options={options}/>
              </div>)
            }
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.keyMap.select1P')}</div>
              <Select v-model:value={props.entryStates['GameSystem.KeyMap.Select_1P'].value} options={options}/>
            </div>
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">Test</div>
              <Select v-model:value={props.entryStates['GameSystem.KeyMap.Test'].value} options={options}/>
            </div>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-2">
            {
              new Array(8).fill(0).map((_, i) => <div key={i} class="flex gap-2 items-start">
                <div class="ml-1 text-sm w-10em shrink-0">{t('mod.keyMap.button2P', {index: i + 1})}</div>
                <Select v-model:value={props.entryStates[`GameSystem.KeyMap.Button${i + 1}_2P`].value} options={options}/>
              </div>)
            }
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.keyMap.select2P')}</div>
              <Select v-model:value={props.entryStates['GameSystem.KeyMap.Select_2P'].value} options={options}/>
            </div>
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">Service</div>
              <Select v-model:value={props.entryStates['GameSystem.KeyMap.Service'].value} options={options}/>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2 p-l-15">
        {props.section.entries?.some(it=>it.path === 'GameSystem.KeyMap.DisableIO4_1P') &&
          <div class="flex gap-2 items-start">
            <div class="ml-1 text-sm w-9em shrink-0">{t('mod.keyMap.disableIO4')}</div>
            <div class="flex flex-col gap-2 w-full ws-pre-line">
              <div class='flex gap-4 h-34px items-center'>
                <div class="flex items-center gap-2">
                  <CheckBox v-model:value={props.entryStates['GameSystem.KeyMap.DisableIO4_1P'].value}>{props.entryStates['GameSystem.KeyMap.DisableIO4_1P'].value ? '开' : '关'}</CheckBox>
                  1P
                </div>
                <div class="flex items-center gap-2">
                  <CheckBox v-model:value={props.entryStates['GameSystem.KeyMap.DisableIO4_2P'].value}>{props.entryStates['GameSystem.KeyMap.DisableIO4_2P'].value ? '开' : '关'}</CheckBox>
                  2P
                </div>
                <div class="flex items-center gap-2">
                  <CheckBox v-model:value={props.entryStates['GameSystem.KeyMap.DisableIO4System'].value}>{props.entryStates['GameSystem.KeyMap.DisableIO4System'].value ? '开' : '关'}</CheckBox>
                  {t('mod.keyMap.disableIO4System')}
                </div>
              </div>
              {t('mod.keyMap.disableIO4Tip')}
            </div>
          </div>}
        {props.section.entries?.filter(it=>
          ['GameSystem.KeyMap.Autoplay','GameSystem.KeyMap.DisableIO4','GameSystem.KeyMap.DisableDebugInput','GameSystem.KeyMap.DisableDebugFeatureHotkeys']
          .includes(it.path!))
          .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
      </div>
    </div>;
  }
})
