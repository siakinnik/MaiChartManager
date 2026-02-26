import { defineComponent, PropType } from 'vue';
import { useVModel } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import RefreshAllButton from './RefreshAllButton';
import VersionInfo from '@/components/VersionInfo';

export type SidebarItem = 'charts' | 'mods' | 'batch' | 'genres' | 'tools';

const items: { key: SidebarItem; icon: string; labelKey: string }[] = [
  { key: 'charts', icon: 'i-mdi-music-note', labelKey: 'sidebar.charts' },
  { key: 'mods', icon: 'i-mdi:puzzle', labelKey: 'sidebar.mods' },
  { key: 'batch', icon: 'i-mdi-playlist-edit', labelKey: 'sidebar.batch' },
  { key: 'genres', icon: 'i-mdi-tag-multiple', labelKey: 'sidebar.genres' },
  { key: 'tools', icon: 'i-ri:tools-fill', labelKey: 'sidebar.tools' },
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
    const { t } = useI18n();
    const active = useVModel(props, 'active', emit);

    return () => (
      <>
        {/* Desktop sidebar */}
        <div class="max-[767px]:hidden w-16 flex flex-col items-center py-2 gap-1 h-100dvh shrink-0 border-r border-r-[oklch(0.9_0.02_var(--hue))] border-r-solid bg-[oklch(0.98_0.01_var(--hue))]">
          {items.map((item) => (
            <div
              key={item.key}
              class={[
                'w-15 h-15 flex flex-col items-center justify-center rounded-md cursor-pointer',
                'transition-all duration-200 border-none bg-transparent relative group',
                active.value === item.key
                  ? 'bg-[var(--link-color)]/12 text-[var(--link-color)]'
                  : 'text-gray-500 bg-avatarMenuButton hover:text-gray-700',
              ]}
              onClick={() => (active.value = item.key)}
            >
              {active.value === item.key && (
                <div class="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-full bg-[var(--link-color)]" />
              )}
              <span class={[item.icon, 'text-6']} />
              <span class="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-[oklch(0.7_0.13_var(--hue))] text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-100">
                {t(item.labelKey)}
              </span>
            </div>
          ))}
          <div class="mt-auto" />
          <RefreshAllButton />
          <VersionInfo />
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
              <span class="text-2.5 leading-tight">{t(item.labelKey)}</span>
            </button>
          ))}
        </div>
      </>
    );
  },
});
