import { computed, defineComponent } from 'vue';
import { dateZhCN, dateZhTW, dateEnUS, NConfigProvider, NDialogProvider, NMessageProvider, NNotificationProvider, zhCN, zhTW, enUS } from 'naive-ui';
import FeedbackErrorDialog from "@/components/FeedbackErrorDialog";
import NeedPurchaseDialog from "@/components/NeedPurchaseDialog";
import Index from "@/views/Index";
import StartupErrorDialog from "@/components/StartupErrorDialog";
import { locale } from '@/locales';
import { modalShowing, selectedThemeHue, GlobalElementsContainer as UIGlobalElementsContainer } from '@munet/ui';
import styles from './App.module.sass';
import { useWindowSize } from '@vueuse/core';

export default defineComponent({
  setup() {
    const { width, height } = useWindowSize();
    // 根据当前语言动态设置 Naive UI 的 locale
    const naiveLocale = computed(() => {
      switch (locale.value) {
        case 'zh':
          return zhCN;
        case 'zh-TW':
          return zhTW;
        case 'en':
          return enUS;
        default:
          return zhCN;
      }
    });

    const naiveDateLocale = computed(() => {
      switch (locale.value) {
        case 'zh':
          return dateZhCN;
        case 'zh-TW':
          return dateZhTW;
        case 'en':
          return dateEnUS;
        default:
          return dateZhCN;
      }
    });

    selectedThemeHue.value = 353;

    return () => (
      <NConfigProvider locale={naiveLocale.value} dateLocale={naiveDateLocale.value}>
        <NNotificationProvider>
          <NDialogProvider>
            <NMessageProvider>
              <div
                class={[styles.contentRoot, modalShowing.value && styles.modalOpen]} style={{ '--screen-width': `${width.value}`, '--screen-height': `${height.value}` }}
              >
                <UIGlobalElementsContainer />
                <Index />
                <FeedbackErrorDialog />
                <NeedPurchaseDialog />
                <StartupErrorDialog />
              </div>
            </NMessageProvider>
          </NDialogProvider>
        </NNotificationProvider>
      </NConfigProvider>
    );
  },
});
