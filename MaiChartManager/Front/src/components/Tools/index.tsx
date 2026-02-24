import api from '@/client/api';
import { NDropdown, NButton, useMessage } from 'naive-ui';
import { computed, defineComponent, ref } from 'vue';
import VideoConvertButton from './VideoConvertButton';
import { useI18n } from 'vue-i18n';

import { DropMenu } from '@munet/ui';

enum DROPDOWN_OPTIONS {
  AudioConvert,
  VideoConvert,
}

export default defineComponent({
  // props: {
  // },
  setup(props, { emit }) {
    const message = useMessage();
    const videoConvertRef = ref<{ trigger: () => void }>();
    const { t } = useI18n();

    const options = computed(() => [
      { label: t('tools.audioConvert'), action: () => handleOptionClick(DROPDOWN_OPTIONS.AudioConvert) },
      { label: t('tools.videoConvert'), action: () => handleOptionClick(DROPDOWN_OPTIONS.VideoConvert) },
    ])

    const handleOptionClick = async (key: DROPDOWN_OPTIONS) => {
      switch (key) {
        case DROPDOWN_OPTIONS.AudioConvert: {
          const res = await api.AudioConvertTool();
          if (res.status === 200) {
            message.success(t('tools.convertSuccess'));
          } else {
            message.error(t('tools.convertFailed'));
          }
          break;
        }
        case DROPDOWN_OPTIONS.VideoConvert: {
          videoConvertRef.value?.trigger();
          break;
        }
      }
    }

    return () => (location.hostname === 'mcm.invalid' || import.meta.env.DEV) && <>
      <DropMenu options={options.value} buttonText={t('tools.title')} />
      <VideoConvertButton ref={videoConvertRef} />
    </>;
  },
});
