import { defineComponent, onMounted } from "vue";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import { Button, Select } from "@munet/ui";
import { VList } from 'virtua/vue';
import MusicEntry from "@/components/MusicList/MusicEntry";
import { assetDirs, musicList, selectedADir, selectMusicId, updateMusicList } from "@/store/refs";
import RefreshAllButton from "@/components/RefreshAllButton";
import BatchActionButton from "@/components/MusicList/BatchActionButton";

export default defineComponent({
  props: {
    toggleMenu: { type: Function, required: true },
  },
  setup(props) {


    const setAssetsDir = async (dir: string) => {
      selectedADir.value = dir;
      selectMusicId.value = 0;
    }

    return () => (
      <div class="flex flex-col gap-3 h-full">
        <div class="flex items-center gap-2">
          <Button variant="secondary" onClick={() => props.toggleMenu()} class="min-[1440px]:hidden">
            <span class="i-ic-baseline-menu text-lg" />
          </Button>
          <Select
            class="grow w-0"
            value={selectedADir.value}
            options={assetDirs.value.map(dir => ({ label: dir.dirName! + (dir.version ? ` (Ver.${dir.version})` : ''), value: dir.dirName! }))}
            onChange={setAssetsDir}
          />
          <RefreshAllButton class="shrink-0" />
        </div>
        <VList class="flex-1" data={musicList.value}>
          {({item}: {item: MusicXmlWithABJacket}) => (
            <MusicEntry music={item} selected={selectMusicId.value === item.id} onClick={() => selectMusicId.value = item.id!} key={item.id} />
          )}
        </VList>
      </div>
    )
  }
})
