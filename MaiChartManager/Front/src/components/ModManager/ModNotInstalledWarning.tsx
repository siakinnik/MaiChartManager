import { computed, defineComponent } from "vue";

import { useI18n } from 'vue-i18n';
import { Modal } from "@munet/ui";

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
    closeModal: {type: Function, required: true}
  },
  setup(props, {emit}) {
    const { t } = useI18n();

    const show = computed({
      get: () => props.show,
      set: (val) => props.closeModal()
    })
    return () => <Modal
      width="min(35vw,45em)"
      title={t('mod.notInstalledTitle')}
      v-model:show={show.value}
    >{{
      default: () => t('mod.notInstalledWarningMessage'),
      actions: () => <button onClick={() => props.closeModal(true)}>{t('mod.dontShowAgain')}</button>
    }}</Modal>;
  }
})
