import { defineComponent, PropType, ref, computed, h } from 'vue';
import { IEntryState, ISectionState, Section } from "@/client/apiGen";
import { Button, Select } from '@munet/ui';
import api from "@/client/api";
import { modInfo, updateModInfo } from "@/store/refs";
import { useI18n } from 'vue-i18n';
import ConfigEntry from '../../ConfigEntry';

export default defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props, { emit }) {
    const load = ref(false)
    const { t } = useI18n();

    const options = [
      { label: t('mod.ioKeyMap.disabled'), value: 'None' },
      { label: t('mod.ioKeyMap.select'), value: 'Select' },
      { label: t('mod.ioKeyMap.select1P'), value: 'Select1P' },
      { label: t('mod.ioKeyMap.select2P'), value: 'Select2P' },
      { label: t('mod.ioKeyMap.service'), value: 'Service' },
      { label: t('mod.ioKeyMap.test'), value: 'Test' },
    ];

    const del = async () => {
      load.value = true
      await api.DeleteHidConflict();
      await updateModInfo();
      load.value = false
    }

    return () => <div class="flex flex-col gap-2">
      {modInfo.value?.isHidConflictExist ? <div class="flex gap-2 items-center m-l-35">
          <span class="c-orange">{t('mod.adxHid.conflictDetected')}</span>
          <Button variant="secondary" onClick={del} ing={load.value}>{t('mod.adxHid.oneClickDelete')}</Button>
        </div>
        : <div class="flex gap-2 items-center m-l-35">
          <span class="c-green-6">{t('mod.adxHid.noConflict')}</span>
        </div>}
      <div class="grid grid-cols-1 min-[500px]:grid-cols-2 gap-y-12px">
        <div>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.adxHid.button1')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates['GameSystem.AdxHidInput.Button1'].value} options={options}/>
                {t('mod.adxHid.button1Desc')}
              </div>
            </div>
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.adxHid.button2')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates['GameSystem.AdxHidInput.Button2'].value} options={options}/>
                {t('mod.adxHid.button2Desc')}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.adxHid.button3')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates['GameSystem.AdxHidInput.Button3'].value} options={options}/>
                {t('mod.adxHid.button3Desc')}
              </div>
            </div>
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.adxHid.button4')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates['GameSystem.AdxHidInput.Button4'].value} options={options}/>
                {t('mod.adxHid.button4Desc')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2 p-l-3">
        {props.section.entries?.filter(it=>
          ['GameSystem.AdxHidInput.DisableButtons']
          .includes(it.path!))
          .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
      </div>
    </div>
  },
});
