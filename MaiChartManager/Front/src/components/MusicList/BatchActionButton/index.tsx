import { defineComponent, ref } from "vue";
import MusicSelector from "@/components/MusicList/BatchActionButton/MusicSelector";
import EditProps from "@/components/MusicList/BatchActionButton/EditProps";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import ChooseAction from "@/components/MusicList/BatchActionButton/ChooseAction";
import ProgressDisplay from "@/components/MusicList/BatchActionButton/ProgressDisplay";
import { useI18n } from 'vue-i18n';
import { Button, Modal } from "@munet/ui";

export enum STEP {
  None,
  Select,
  ChooseAction,
  EditProps,
  ProgressDisplay
}

export default defineComponent({
  setup(props) {
    const step = ref(STEP.None);
    const selectedMusic = ref<MusicXmlWithABJacket[]>([]);
    const { t } = useI18n();

    const show = () => {
      step.value = STEP.Select;
      selectedMusic.value = [];
    }

    // TODO: 移到单独页面

    return () => <>
      <button onClick={show}>
        {t('music.batch.batchAndSearch')}
      </button>
      <Modal
        width={step.value === STEP.Select ? "min(90vw,120em)" : "min(50vw,60em)"}
        title={t('music.batch.title')}
        esc={step.value !== STEP.ProgressDisplay}
        show={step.value !== STEP.None}
        onUpdateShow={() => step.value = STEP.None}
      >{{
        default: ()=><>
          {step.value === STEP.Select && <MusicSelector v-model:selectedMusicIds={selectedMusic.value} continue={() => step.value = STEP.ChooseAction} cancel={() => step.value = STEP.None}/>}
          {step.value === STEP.ChooseAction && <ChooseAction selectedMusic={selectedMusic.value} continue={(action: STEP) => step.value = action}/>}
          {step.value === STEP.EditProps && <EditProps selectedMusicIds={selectedMusic.value} closeModal={() => step.value = STEP.None}/>}
          {step.value === STEP.ProgressDisplay && <ProgressDisplay/>}
        </>,
      }}</Modal>
    </>;
  }
})
