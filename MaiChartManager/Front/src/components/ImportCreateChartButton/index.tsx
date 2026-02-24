import { Button, DropMenu } from "@munet/ui";
import { computed, defineComponent, ref } from "vue";
import ImportChartButton from "./ImportChartButton";
import CreateMusicModal from "@/components/ImportCreateChartButton/CreateMusicModal";
import { useI18n } from 'vue-i18n';

enum OPTION {
  None,
  CreateMusic,
}

export default defineComponent({
  setup(props) {
    const current = ref(OPTION.None)
    const { t } = useI18n();

    const options = computed(() => [
      { label: t('chart.import.create'), key: OPTION.CreateMusic },
    ]);

    const handleSelect = (key: OPTION) => {
      current.value = key;
    }

    return () => <div class="flex">
      <ImportChartButton />
      <DropMenu options={options.value} buttonText="">
        {{
          trigger: () => <Button variant="secondary" class="px-.5 b-l b-l-solid b-l-[rgba(255,255,255,0.5)]">
            <span class="i-mdi-arrow-down-drop text-6 translate-y-.25" />
          </Button>
        }}
      </DropMenu>
      <CreateMusicModal show={current.value === OPTION.CreateMusic} closeModal={() => current.value = OPTION.None} />
    </div>;
  }
})
