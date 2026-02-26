import { defineComponent, ref } from 'vue';

import { globalCapture, modInfo, modUpdateInfo, updateModInfo } from "@/store/refs";
import api from "@/client/api";
import { latestVersion } from './shouldShowUpdateController';
import { useI18n } from 'vue-i18n';
import { Button } from '@munet/ui';
import { useAsyncState } from '@vueuse/core';
import { updateAquaMaiConfig } from './refs';
export default defineComponent({
  setup() {
    const showAquaMaiInstallDone = ref(false)
    const { t } = useI18n();
    const { isLoading: installingAquaMai, execute: installAquaMai } = useAsyncState(async () => {
      const type = latestVersion.value.type;
      console.log(type)
      // 但是你根本看不到这个加载图标，因为太快了
      if (type === 'builtin') {
        await api.InstallAquaMai()
      } else {
        const version = modUpdateInfo.value?.find(it => it.type === type);
        if (!version) {
          throw new Error(t('mod.versionNotFound'));
        }
        const urls = [version.url!];
        if (version.url2) {
          urls.push(version.url2);
        }
        await api.InstallAquaMaiOnline({
          type,
          urls,
          sign: version.sign,
        });
      }
      await updateModInfo()
      await updateAquaMaiConfig()
      showAquaMaiInstallDone.value = true
      setTimeout(() => showAquaMaiInstallDone.value = false, 3000);
    }, undefined, {
      immediate: false,
      onError: (e: any) => globalCapture(e, t('mod.installFailed')),
    })

    return () =>
      <Button ing={installingAquaMai.value} onClick={() => installAquaMai()}>
        {showAquaMaiInstallDone.value ? <span class="i-material-symbols-done" /> : modInfo.value?.aquaMaiInstalled ? t('mod.reinstallUpdate') : t('mod.install')}
      </Button>
  },
});
