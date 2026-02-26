import { defineComponent, PropType, ref, computed, watch } from 'vue';
import { ConfigDto, IEntryState, ISectionState, Section } from "@/client/apiGen";
import { CheckBox, Popover, TextInput, Button, theme } from '@munet/ui';
import _ from "lodash";
import ProblemsDisplay from "@/components/ProblemsDisplay";
import configSortStub from './configSort.yaml'
import { useMagicKeys, whenever } from "@vueuse/core";
import ConfigEntry from './ConfigEntry';
import { getSectionPanelOverride, getNameForPath, getBigSectionName } from './utils';
import comments from "./modComments.yaml";
import { useI18n } from 'vue-i18n';
import { locale } from "@/locales";

const ConfigSection = defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
    isCommunity: Boolean,
  },
  setup(props, { emit }) {
    const { t, te } = useI18n();

    const CustomPanel = getSectionPanelOverride(props.section.path!)
    const customPanelPosition: 'top' | 'bottom' | 'override' = comments.customPanelPosition[props.section.path!] || 'override';
    const comment = computed(() => {
      const localeKey = 'mod.commentOverrides.' + props.section.path!.replace(/\./g, '_');
      if (te(localeKey)) {
        return t(localeKey);
      }
      if (locale.value.startsWith('zh')) {
        return props.section.attribute?.comment?.commentZh;
      }
      return props.section.attribute?.comment?.commentEn;
    })

    return () => <div class="flex flex-col gap-2 p-1 border-transparent border-solid border-1px rd hover:border-[oklch(0.68_0.17_var(--hue))]">
      {!props.section.attribute!.alwaysEnabled && <div class="flex gap-2 items-start"
        // @ts-ignore
                                                       title={props.section.path!}
      >
        <div class="ml-1 text-lg w-9em shrink-0">{getNameForPath(props.section.path!, props.section.path!.split('.').pop()!, props.section.attribute?.comment?.nameZh)}</div>
        <div class="flex flex-col gap-2 w-full ws-pre-line">
          <div class="flex gap-2 h-34px items-center">
            <CheckBox v-model:value={props.sectionState.enabled}>{props.sectionState.enabled ? '开' : '关'}</CheckBox>
            {comments.shouldEnableOptions[props.section.path!] && !props.sectionState.enabled && <ProblemsDisplay problems={[t('mod.needEnableOption')]}/>}
            {props.isCommunity && <Popover trigger="hover">{{
              trigger: () => <div class="i-ic-baseline-info text-lg c-neutral-5"/>,
              default: () => <div>
                <div class="text-lg mb-2">{t('mod.community.title')}</div>
                <div class="text-sm whitespace-pre-line lh-1.7em">{t('mod.community.description')}</div>
              </div>
            }}</Popover>}
          </div>
          {comment.value}
        </div>
      </div>}
      {props.sectionState.enabled && <>
        {customPanelPosition === 'top' && <CustomPanel entryStates={props.entryStates} sectionState={props.sectionState} section={props.section}/>}
        {(CustomPanel && customPanelPosition === 'override') ?
          <CustomPanel entryStates={props.entryStates} sectionState={props.sectionState} section={props.section}/> :
          !!props.section.entries?.length && <div class="flex flex-col gap-2 p-l-15 max-[900px]:p-l-10 max-[500px]:p-l-5!">
            {props.section.entries?.filter(it => !it.attribute?.hideWhenDefault || (it.attribute?.hideWhenDefault && !props.entryStates[it.path!].isDefault))
              .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
          </div>}
        {customPanelPosition === 'bottom' && <CustomPanel entryStates={props.entryStates} sectionState={props.sectionState} section={props.section}/>}
        </>}
    </div>;
  },
});

export default defineComponent({
  props: {
    config: { type: Object as PropType<ConfigDto>, required: true },
    useNewSort: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const search = ref('');
    const searchRef = ref();
    const activeTab = ref<string | null>(null);
    const scrollContainerRef = ref<HTMLElement>();
    const configSort = computed(() => props.config?.configSort || configSortStub)
    const communityList = computed(() => configSort.value['社区功能'] || []);
    const { t } = useI18n();

    const { ctrl_f } = useMagicKeys({
      passive: false,
      onEventFired(e) {
        if (e.ctrlKey && e.key === 'f' && e.type === 'keydown')
          e.preventDefault()
      },
    })
    whenever(ctrl_f, () => searchRef.value?.select());

    const filteredSections = computed(() => {
      if (!search.value) return props.config?.sections;
      const s = search.value.toLowerCase();
      return props.config.sections?.filter(it =>
        it.path?.toLowerCase().includes(s) ||
        it.attribute?.comment?.nameZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
        it.entries?.some(entry => entry.name?.toLowerCase().includes(s) || entry.path?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.commentZh?.toLowerCase().includes(s) || entry.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.nameZh?.toLowerCase().includes(s))
      );
    })

    const bigSections = computed(() => {
      if (props.useNewSort) {
        return Object.keys(configSort.value).filter(it => it !== '社区功能').filter(it => filteredSections.value!.some(s => configSort.value[it].includes(s.path!)));
      }
      return _.uniq(filteredSections.value!.filter(it => !it.attribute?.exampleHidden).map(s => s.path?.split('.')[0]));
    });

    const otherSection = computed(() => {
      if (!props.useNewSort) return [];
      const knownSections = _.flatten(Object.values(configSort.value) as string[][]);
      return filteredSections.value?.filter(it => !knownSections.includes(it.path!) && !it.attribute!.exampleHidden) || [];
    });

    // 所有可选 tab，包括 "其他"
    const allTabs = computed(() => {
      const tabs = bigSections.value.map(key => ({ key: key!, label: getBigSectionName(key!) }));
      if (otherSection.value.length > 0) {
        tabs.push({ key: '__other__', label: t('mod.other') });
      }
      return tabs;
    });

    // 默认选中第一个 tab
    watch(() => allTabs.value, (tabs) => {
      if (tabs.length > 0 && (!activeTab.value || !tabs.some(t => t.key === activeTab.value))) {
        activeTab.value = tabs[0].key;
      }
    }, { immediate: true });

    watch(activeTab, () => {
      scrollContainerRef.value?.scrollTo(0, 0);
    });

    // 当前要显示的 sections：搜索时显示所有匹配结果，否则只显示当前 tab
    const currentSections = computed(() => {
      if (search.value) {
        // 搜索模式：显示所有匹配的 sections（不限 tab）
        return filteredSections.value?.filter(it => !it.attribute?.exampleHidden) || [];
      }
      if (!activeTab.value) return [];
      if (activeTab.value === '__other__') return otherSection.value;
      return filteredSections.value?.filter(it => {
        if (props.useNewSort) {
          return configSort.value[activeTab.value!]?.includes(it.path!);
        }
        return it.path!.split('.')[0] === activeTab.value && !it.attribute!.exampleHidden;
      }).sort((a, b) => {
        if (!props.useNewSort) return 0;
        return configSort.value[activeTab.value!].indexOf(a.path!) - configSort.value[activeTab.value!].indexOf(b.path!);
      }) || [];
    });

    return () => <div class="grid cols-[15em_auto] max-[900px]:cols-1">
      {/* 左侧导航 */}
      <div class="flex flex-col gap-0.5 max-[900px]:hidden of-y-auto h-[calc(100dvh-80px)]">
        {allTabs.value.map(tab =>
          <div
            key={tab.key}
            class={[
              'px-3 py-1.5 rd cursor-pointer text-sm transition-colors',
              activeTab.value === tab.key && theme.value.listItemSelect, theme.value.listItemHover,
            ]}
            onClick={() => activeTab.value = tab.key}
          >
            {tab.label}
          </div>
        )}
      </div>
      <div class="flex flex-col h-[calc(100dvh-80px)]">
        <div class="flex gap-2 p-2 shrink-0">
          <div class={["min-[900px]:hidden"]}>
            <Popover trigger="click">{{
              trigger: () => <Button variant="secondary" size="small"><span class="i-ic-baseline-menu text-lg"/></Button>,
              default: () => <div class="flex flex-col gap-0.5">
                {allTabs.value.map(tab =>
                  <div
                    key={tab.key}
                    class={[
                      'px-3 py-1.5 rd cursor-pointer text-sm',
                      activeTab.value === tab.key && theme.value.listItemSelect, theme.value.listItemHover,
                    ]}
                    onClick={() => activeTab.value = tab.key}
                  >
                    {tab.label}
                  </div>
                )}
              </div>
            }}</Popover>
          </div>
          {/* @ts-ignore */}
          <TextInput v-model:value={search.value} placeholder={t('mod.searchPlaceholder')} ref={searchRef} class="flex-1"/>
        </div>
        <div ref={scrollContainerRef} class="of-y-auto cst flex-1 p-2 pt-0 text-14px">
          <div class="flex flex-col gap-1">
            {currentSections.value.map((section) =>
              <ConfigSection key={section.path!} section={section}
                             entryStates={props.config.entryStates!}
                             isCommunity={communityList.value.includes(section.path!)}
                             sectionState={props.config.sectionStates![section.path!]}/>)}
          </div>
        </div>
      </div>
    </div>;
  },
});
