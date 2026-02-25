import { computed, defineComponent, onMounted, ref } from "vue";

import { useStorage, watchOnce } from "@vueuse/core";
import ModNotInstalledWarning from "@/views/ModManager/ModNotInstalledWarning";
import ConfigEditor from "@/views/ModManager/ConfigEditor";
import { modInfo } from "@/store/refs";
import { shouldShowUpdate } from "@/views/ModManager/shouldShowUpdateController";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const isWarningConfirmed = useStorage('isWarningConfirmed', false);
    const showWarning = ref(false);
    const { t } = useI18n();

    watchOnce(() => modInfo.value, async (info) => {
      if (!info) return;
      if (isWarningConfirmed.value) return;
      showWarning.value = !info.aquaMaiInstalled || !info.melonLoaderInstalled;
    })

    const badgeType = computed(() => {
      if (!modInfo.value) return
      if (!modInfo.value.aquaMaiInstalled || !modInfo.value.melonLoaderInstalled) return 'error'
      if (shouldShowUpdate.value) return 'warning'
    })

    return () => <div class="p-xy h-100dvh of-y-auto">
      <ModNotInstalledWarning show={showWarning.value} closeModal={(dismiss: boolean) => {
        showWarning.value = false
        isWarningConfirmed.value = dismiss
      }}/>
      {modInfo.value && <ConfigEditor />}
    </div>;
  }
})
