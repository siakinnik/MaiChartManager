import { computed, defineComponent, PropType } from "vue";
import { Button, NumberInput, Popover } from "@munet/ui";
import { b15ver, gameVersion, selectedADir, version } from "@/store/refs";
import { useI18n } from 'vue-i18n';

// 这是 version 不是 addVersion，是大家都喜欢写 22001 的那个 version
export default defineComponent({
  props: {
    value: Number
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    const value = computed({
      get: () => props.value || 0,
      set: (v) => emit('update:value', v)
    })

    return () => <div class="flex">
      <NumberInput class="w-full" v-model:value={value.value} min={0}/>
      {!!version.value?.gameVersion && <>
        <Button class={value.value < b15ver.value ? "z-1" : ""} variant={value.value < b15ver.value ? 'primary' : 'ghost'}
                 disabled={selectedADir.value === 'A000'} onClick={() => value.value = 20000}>{t('music.edit.includeB35')}</Button>
        <Button class={value.value >= b15ver.value ? "z-1" : ""} variant={value.value >= b15ver.value ? 'primary' : 'ghost'}
                 disabled={selectedADir.value === 'A000'} onClick={() => value.value = 20000 + version.value!.gameVersion! * 100}>{t('music.edit.includeB15')}</Button>
      </>}
      <Popover trigger="hover">
        {{
          trigger: () => <span class="flex items-center px-2 bg-neutral/10 rounded-r cursor-help">
            ?
          </span>,
          default: () => <div>
            {t('music.edit.versionHint', {gameVersion: gameVersion.value, b15ver: b15ver.value})}
          </div>
        }}
      </Popover>
    </div>;
  }
})
