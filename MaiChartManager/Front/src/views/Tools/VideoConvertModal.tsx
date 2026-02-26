import { getUrl } from '@/client/api';
import { Button, CheckBox, Modal, Progress, addToast } from '@munet/ui';
import { defineComponent, ref } from 'vue';
import { appSettings, saveSettings } from '@/store/settings';
import { LicenseStatus } from '@/client/apiGen';
import { globalCapture, showNeedPurchaseDialog, version } from '@/store/refs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useI18n } from 'vue-i18n';

enum STEP {
  None,
  Options,
  Progress,
}

export default defineComponent({
  setup(props, { expose }) {
    const step = ref(STEP.None);
    const progress = ref(0);
    const { t } = useI18n();

    const handleVideoConvert = async () => {
      step.value = STEP.Progress;
      progress.value = 0;

      const controller = new AbortController();

      try {
        await new Promise<void>((resolve, reject) => {
          fetchEventSource(getUrl(`VideoConvertToolApi?noScale=${appSettings.value.noScale}&yuv420p=${appSettings.value.yuv420p}`), {
            signal: controller.signal,
            method: 'POST',
            onerror(e) {
              reject(e);
              controller.abort();
              throw new Error("disable retry onerror");
            },
            onclose() {
              reject(new Error("EventSource Close"));
              controller.abort();
              throw new Error("disable retry onclose");
            },
            openWhenHidden: true,
            onmessage: (e) => {
              switch (e.event) {
                case 'Progress':
                  progress.value = parseInt(e.data);
                  break;
                case 'Success':
                  console.log("success", e.data);
                  controller.abort();
                  addToast({message: t('tools.convertSuccess'), type: 'success'});
                  resolve();
                  break;
                case 'Error':
                  controller.abort();
                  reject(new Error(e.data));
                  break;
              }
            }
          });
        });
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.log(e);
        if (e.message === t('error.file.notSelected')) return;
        globalCapture(e, t('tools.videoConvertError'));
      } finally {
        step.value = STEP.None;
      }
    };

    const trigger = () => {
      // 检查是否为赞助版
      if (version.value?.license !== LicenseStatus.Active) {
        showNeedPurchaseDialog.value = true;
        return;
      }
      // 显示选项对话框
      step.value = STEP.Options;
    };

    // 暴露方法供外部调用
    expose({
      trigger,
    });

    return () => <>

      <Modal
        width="min(30vw,25em)"
        title={t('tools.videoOptions.title')}
        show={step.value === STEP.Options}
        onUpdateShow={() => step.value = STEP.None}
      >{{
        default: () => <div class="flex flex-col gap-3">
          <div>{t('tools.videoOptions.onlyForUsm')}</div>
          <CheckBox v-model:value={appSettings.value.noScale} onUpdateValue={saveSettings}>
            {t('tools.videoOptions.noScale')}
          </CheckBox>
          <CheckBox v-model:value={appSettings.value.yuv420p} onUpdateValue={saveSettings}>
            {t('tools.videoOptions.useYuv420p')}
          </CheckBox>
        </div>,
        actions: () => <>
          <Button class="w-0 grow" onClick={() => step.value = STEP.None}>{t('common.cancel')}</Button>
          <Button class="w-0 grow" variant="primary" onClick={handleVideoConvert}>{t('common.confirm')}</Button>
        </>
      }}</Modal>

      <Modal
        width="min(40vw,40em)"
        title={t('tools.converting')}
        show={step.value === STEP.Progress}
        esc={false}
      >
        <Progress
          percentage={progress.value}
          status="success"
          showIndicator
        >
          {progress.value === 100 ? t('tools.videoOptions.processing') : `${progress.value}%`}
        </Progress>
      </Modal>
    </>;
  },
});

