import { defineComponent, ref } from "vue";
import { globalCapture, updateAll } from "@/store/refs";
import api from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const load = ref(false);
    const { t } = useI18n();

    const reload = async () => {
      load.value = true;
      try {
        await api.ReloadAll();
        await updateAll();
      } catch (err) {
        globalCapture(err, t('error.refreshFailed'))
      } finally {
        load.value = false;
      }
    }

    return () => <Button ing={load.value} onClick={reload} class="p-3">
      <span class="i-ic-baseline-refresh text-lg"/>
    </Button>;
  }
})
