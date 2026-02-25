import api from '@/client/api';
import { Entry, IEntryState, ISectionState, Section } from '@/client/apiGen';
import { t } from '@/locales';
import { globalCapture, modInfo, updateModInfo } from '@/store/refs';
import { useAsyncState } from '@vueuse/core';
import { Button, Select, CheckBox } from '@munet/ui';
import { defineComponent, PropType, ref, computed, watch } from 'vue';

export default defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: {type: Object as PropType<Record<string, IEntryState>>, required: true},
    sectionState: {type: Object as PropType<ISectionState>, required: true},
  },
  setup(props, { emit }) {
    const install = useAsyncState(async () => {
      await api.InstallMmlLibs();
      await updateModInfo();
    }, undefined, {
      immediate: false,
      onError(e) {
        globalCapture(e, t('mod.mmlIo.installFailed'));
      },
    })

    const options = [
      { label: t('mod.ioKeyMap.disabled'), value: 'None' },
      { label: t('mod.ioKeyMap.select'), value: 'Select' },
      { label: t('mod.ioKeyMap.select1P'), value: 'Select1P' },
      { label: t('mod.ioKeyMap.select2P'), value: 'Select2P' },
      { label: t('mod.ioKeyMap.service'), value: 'Service' },
      { label: t('mod.ioKeyMap.test'), value: 'Test' },
    ];

    const PREFIX = 'GameSystem.MaimollerIO.';

    return () => <div class="flex flex-col gap-2">
      {!modInfo.value?.isMmlLibInstalled ? <div class="flex gap-2 items-center m-l-35">
        <span class="c-orange">{t('mod.mmlIo.notInstalled')}</span>
        <Button variant="secondary" onClick={() => install.execute()} ing={install.isLoading.value}>{t('mod.mmlIo.oneClickInstall')}</Button>
      </div>
        : <div class="flex gap-2 items-center m-l-35">
          <span class="c-green-6">{t('mod.mmlIo.installed')}</span>
        </div>}
      <div class="m-l-35">
        {t('mod.mmlIo.tip')}
      </div>
      <div class="grid grid-cols-1 min-[500px]:grid-cols-2 gap-y-12px">
        <div>
          <div class="flex flex-col gap-2">
            {props.section.entries?.filter(it=>
              ['P1', 'Touch1p', 'Button1p', 'Led1p'].map(it=>PREFIX + it).includes(it.path!))
              .map((entry) => {
                return <div class="flex gap-2 items-start">
                  <div class="ml-1 text-sm w-10em shrink-0">{t(`mod.mmlIo.${entry.path!.split('.').pop()}`)}</div>
                  <div class="flex h-34px items-center">
                    <CheckBox v-model:value={props.entryStates[entry.path!].value}>{props.entryStates[entry.path!].value ? '开' : '关'}</CheckBox>
                  </div>
                </div>
              })
            }
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.mmlIo.button1')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates[PREFIX + 'Button1'].value} options={options}/>
              </div>
            </div>
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.mmlIo.button2')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates[PREFIX + 'Button2'].value} options={options}/>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-2">
            {props.section.entries?.filter(it=>
              ['P2', 'Touch2p', 'Button2p', 'Led2p'].map(it=>PREFIX + it).includes(it.path!))
              .map((entry) => {
                return <div class="flex gap-2 items-start">
                  <div class="ml-1 text-sm w-10em shrink-0">{t(`mod.mmlIo.${entry.path!.split('.').pop()}`)}</div>
                  <div class="flex h-34px items-center">
                    <CheckBox v-model:value={props.entryStates[entry.path!].value}>{props.entryStates[entry.path!].value ? '开' : '关'}</CheckBox>
                  </div>
                </div>
              })
            }
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.mmlIo.button3')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates[PREFIX + 'Button3'].value} options={options}/>
              </div>
            </div>
            <div class="flex gap-2 items-start">
              <div class="ml-1 text-sm w-10em shrink-0">{t('mod.mmlIo.button4')}</div>
              <div class="flex flex-col gap-2 w-full ws-pre-line">
                <Select v-model:value={props.entryStates[PREFIX + 'Button4'].value} options={options}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  },
});
