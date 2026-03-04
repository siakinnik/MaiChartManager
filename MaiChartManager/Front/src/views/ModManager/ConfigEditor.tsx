import { defineComponent, ref, watch } from "vue";

import api from "@/client/api";
import { globalCapture, modInfo, updateModInfo, updateMusicList } from "@/store/refs";
import AquaMaiConfigurator from "./AquaMaiConfigurator";
import { latestVersion, shouldShowUpdate } from "./shouldShowUpdateController";
import ModInstallDropdown from "@/views/ModManager/ModInstallDropdown";
import { useI18n } from 'vue-i18n';
import { Button, addToast } from '@munet/ui';
import { debounce } from 'perfect-debounce';
import AquaMaiSignatureStatusDisplay from "./AquaMaiSignatureStatusDisplay";
import { useAsyncState } from '@vueuse/core';
import { aquaMaiConfig as config, configReadErr, configReadErrTitle, updateAquaMaiConfig, configJustLoaded } from "./refs";

export default defineComponent({
  setup() {

    const { t } = useI18n();

    const { isLoading: installingMelonLoader, execute: installMelonLoader } = useAsyncState(async () => {
      await api.InstallMelonLoader()
      await updateModInfo()
    }, undefined, {
      immediate: false,
      onError: (e: any) => globalCapture(e, t('mod.installMelonLoaderFailed')),
    })


    const saveImpl = async () => {
      if (!config.value) return;
      try {
        await api.SetAquaMaiConfig(config.value)
        await updateMusicList()
        addToast({ message: t('music.save.saveSuccess'), type: 'success' })
      } catch (e) {
        globalCapture(e, t('mod.saveConfigFailed'))
      }
    }
    const save = debounce(saveImpl, 2000);

    watch(() => config.value, async (val) => {
      if (configJustLoaded.value) {
        configJustLoaded.value = false;
        console.log('配置刚加载')
        return;
      }
      if (configReadErr.value) return
      if (val) {
        console.log('配置变动')
        save()
      }
    }, { deep: true })

    const resetToDefault = async () => {
      await updateAquaMaiConfig(true);
      await saveImpl();
    }

    const loadConfigIgnoreSignature = async () => {
      await updateAquaMaiConfig(false, true);
    }

    return () => {

      let editorPart = <></>;
      if (configReadErrTitle.value.includes('ConfigCorruptedException')) {
        editorPart = <div class="flex flex-col gap-2 justify-center items-center min-h-100">
          <div class="text-8">{t('mod.configCorrupted')}</div>
          <div class="c-gray-5 text-lg">{t('mod.configCorruptedMessage')}</div>
          <div>
            <Button onClick={resetToDefault}>
              {t('mod.resetToDefault')}
            </Button>
          </div>
        </div>
      }
      else if (configReadErrTitle.value.includes('AquaMaiSignatureVerificationFailedException')) {
        editorPart = <div class="flex flex-col gap-2 justify-center items-center min-h-100">
          <div class="text-8">{t('mod.aquaMaiSignatureVerificationFailed')}</div>
          <div class="c-gray-5 text-lg">{t('mod.aquaMaiSignatureVerificationFailedMessage')}</div>
          <div>
            <Button onClick={loadConfigIgnoreSignature}>
              {t('mod.loadConfigIgnoreSignature')}
            </Button>
          </div>
        </div>
      }
      else if (configReadErr.value) {
        const errTitle = t(configReadErrTitle.value === 'mod.configVersionHigher' ? 'mod.configVersionHigher' : 'mod.needInstallOrUpdate');
        const errMsg = configReadErr.value.startsWith('mod.') ? t(configReadErr.value) : configReadErr.value;
        editorPart = <div class="flex flex-col gap-2 justify-center items-center min-h-100">
          <div class="text-8">{errTitle}</div>
          <div class="c-gray-5 text-lg">{errMsg}</div>
          <div class="c-gray-4 text-sm">{configReadErrTitle.value}</div>
        </div>
      }
      else {
        editorPart = <AquaMaiConfigurator config={config.value!} useNewSort={true}/>
      }

      return <div class="flex flex-col gap-2 h-full of-y-auto">
        {!!modInfo.value && <div class="flex flex-col gap-2">
          <div class="flex gap-2 items-center flex-wrap">
            <span class="max-[1060px]:hidden">MelonLoader:</span>
            {modInfo.value.melonLoaderInstalled ? <span class="c-green-6 max-[1060px]:hidden">{t('mod.installed')}</span> : <span class="c-red-6">{t('mod.notInstalled')}</span>}
            {!modInfo.value.melonLoaderInstalled && <Button ing={installingMelonLoader.value} onClick={() => installMelonLoader()}>{t('mod.install')}</Button>}
            <div class={["w-8", "max-[1060px]:hidden"]}/>
            <span class="max-[1060px]:hidden">AquaMai:</span>
            {modInfo.value.aquaMaiInstalled ?
              !shouldShowUpdate.value ? <span class="c-green-6 max-[1060px]:hidden">{t('mod.installed')}</span> : <span class="c-orange">{t('mod.updateAvailable')}</span> :
              <span class="c-red-6">{t('mod.notInstalled')}</span>}
            <ModInstallDropdown/>
            <span class="max-[1060px]:hidden">{t('mod.installedVersion')}:</span>
            <span class="max-[450px]:hidden">{modInfo.value.aquaMaiVersion !=='N/A' && 'v'}{modInfo.value.aquaMaiVersion}</span>
            <AquaMaiSignatureStatusDisplay/>
            <span class="max-[1060px]:hidden">{t('mod.availableVersion')}:</span>
            <span class={[shouldShowUpdate.value && "c-orange", "max-[1060px]:hidden"]}>{latestVersion.value.version}</span>
            <Button onClick={() => api.KillGameProcess()}>
              {t('mod.killGameProcess')}
            </Button>
          </div>
          {editorPart}
        </div>}
      </div>
    };
  }
})
