import { computed, defineComponent, ref } from "vue";
import { CheckBox, DropMenu, Modal } from "@munet/ui";
import GenreDisplay from "./GenreDisplay";
import { addVersionList, genreList } from "@/store/refs";
import { useStorage } from "@vueuse/core";
import CreateButton from "@/components/GenreVersionManager/CreateButton";
import { useI18n } from 'vue-i18n';

export enum EDIT_TYPE {
  None,
  Genre,
  Version,
}

export default defineComponent({
  setup(props) {
    const show = ref(EDIT_TYPE.None);
    const showBuiltIn = useStorage('showBuiltInGenre', true);
    const { t } = useI18n();
    const text = computed(() => show.value === EDIT_TYPE.Genre ? t('genre.title') : t('version.title'));
    const editingId = ref(-1);

    const options = computed(()=>[
      {label: t('genre.management'), action: () => show.value = EDIT_TYPE.Genre},
      {label: t('version.management'), action: () => show.value = EDIT_TYPE.Version},
    ]);

    const list = computed(() => {
      const data = show.value === EDIT_TYPE.Genre ? genreList : addVersionList;
      return showBuiltIn.value ? data.value : data.value.filter(it => it.assetDir !== 'A000');
    });


    return () => (
      <>
        <DropMenu options={options.value} buttonText={t('genre.categoryManagement')} />

      <Modal
        class="w-80em max-w-100dvw"
        title={`${text.value}${t('common.management')}`}
        show={show.value !== EDIT_TYPE.None}
        onUpdateShow={() => show.value = EDIT_TYPE.None}
      >
        <div class="flex flex-col gap-2">
          <div class="flex gap-2 items-center">
            <CheckBox v-model:value={showBuiltIn.value}>{t('genre.showBuiltIn')}</CheckBox>
            <CreateButton setEditId={id => editingId.value = id} type={show.value}/>
          </div>
          <div class="of-y-auto cst h-80vh">
            <div class="flex flex-col gap-1">
              {list.value.map(it => <div key={it.id}>
                <GenreDisplay genre={it} type={show.value} class={`${editingId.value >= 0 && editingId.value !== it.id && 'op-30'}`} disabled={editingId.value >= 0 && editingId.value !== it.id}
                              style={{transition: 'opacity 0.3s'}}
                              editing={editingId.value === it.id} setEdit={isEdit => editingId.value = isEdit ? it.id! : -1}/>
              </div>)}
            </div>
          </div>
        </div>
      </Modal>
      </>
    );
  },
})
