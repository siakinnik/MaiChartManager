import { defineComponent, PropType } from 'vue';
import { useVModel } from '@vueuse/core';

export type SidebarItem = 'charts' | 'mods' | 'batch' | 'genres';

const items: { key: SidebarItem; icon: string; label: string }[] = [
  { key: 'charts', icon: 'i-mdi-music-note', label: '谱面管理' },
  { key: 'mods', icon: 'i-mdi-cog', label: 'Mod设置' },
  { key: 'batch', icon: 'i-mdi-playlist-edit', label: '批量操作' },
  { key: 'genres', icon: 'i-mdi-tag-multiple', label: '流派/版本管理' },
];

export default defineComponent({
  props: {
    active: {
      type: String as PropType<SidebarItem>,
      default: 'charts',
    },
  },
  emits: ['update:active'],
  setup(props, { emit }) {
    const active = useVModel(props, 'active', emit);

    return () => (
      <>
        {/* Desktop sidebar */}
        <div class="max-[767px]:hidden w-12 flex flex-col items-center py-2 gap-1 h-100dvh shrink-0 border-r border-r-gray-200 border-r-solid bg-gray-50">
          {items.map((item) => (
            <button
              key={item.key}
              title={item.label}
              class={[
                'w-10 h-10 flex items-center justify-center rounded-md cursor-pointer',
                'transition-all duration-200 border-none bg-transparent relative',
                active.value === item.key
                  ? 'bg-[var(--link-color)]/12 text-[var(--link-color)]'
                  : 'text-gray-500 hover:bg-gray-200/60 hover:text-gray-700',
              ]}
              onClick={() => (active.value = item.key)}
            >
              {active.value === item.key && (
                <div class="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-full bg-[var(--link-color)]" />
              )}
              <span class={[item.icon, 'text-xl']} />
            </button>
          ))}
        </div>

        {/* Mobile bottom tab bar */}
        <div class={[
          'min-[768px]:hidden fixed bottom-0 left-0 right-0 z-50',
          'flex justify-around items-center h-14',
          'bg-white/90 backdrop-blur-sm border-t border-t-gray-200 border-t-solid',
        ]}>
          {items.map((item) => (
            <button
              key={item.key}
              class={[
                'flex-1 flex flex-col items-center justify-center gap-0.5 h-full',
                'border-none bg-transparent cursor-pointer transition-colors duration-200',
                active.value === item.key
                  ? 'text-[var(--link-color)]'
                  : 'text-gray-400',
              ]}
              onClick={() => (active.value = item.key)}
            >
              <span class={[item.icon, 'text-xl']} />
              <span class="text-2.5 leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  },
});
