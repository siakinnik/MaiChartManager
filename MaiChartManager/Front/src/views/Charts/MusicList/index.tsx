import { defineComponent } from "vue";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import { Button, theme } from "@munet/ui";
import { VList } from 'virtua/vue';
import MusicEntry from "@/views/Charts/MusicList/MusicEntry";
import { assetDirs, musicList, selectedADir, selectMusicId } from "@/store/refs";
import { leftPanel } from "@/views/Charts/refs";

export default defineComponent({
  props: {
    toggleMenu: { type: Function, required: true },
  },
  setup(props) {
    const selectedDirLabel = () => {
      const dir = assetDirs.value.find(d => d.dirName === selectedADir.value);
      if (!dir) return selectedADir.value;
      return <>{dir.dirName}<span class="op-70">{dir.version ? ` (Ver.${dir.version})` : ''}</span></>;
    };

    return () => (
      <div class="flex flex-col gap-3 h-full p-xy">
        <div class="flex items-center gap-2">
          <Button variant="secondary" onClick={() => props.toggleMenu()} class="min-[1440px]:hidden">
            <span class="i-ic-baseline-menu text-lg" />
          </Button>
          <div
            class={["grow w-0 flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-left truncate cursor-pointer border-none h-10", theme.value.listItem, theme.value.listItemHover]}
            onClick={() => leftPanel.value = 'assetDirs'}
          >
            <span class="truncate">{selectedDirLabel()}</span>
          </div>
        </div>
        <VList class="flex-1 cst" data={musicList.value}>
          {({item}: {item: MusicXmlWithABJacket}) => (
            <MusicEntry music={item} selected={selectMusicId.value === item.id} onClick={() => selectMusicId.value = item.id!} key={item.id} />
          )}
        </VList>
      </div>
    )
  }
})
