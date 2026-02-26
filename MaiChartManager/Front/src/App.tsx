import { computed, defineComponent } from 'vue';
import FeedbackErrorDialog from "@/components/FeedbackErrorDialog";
import NeedPurchaseDialog from "@/components/NeedPurchaseDialog";
import StartupErrorDialog from "@/components/StartupErrorDialog";
import { RouterView } from 'vue-router';

import { modalShowing, selectedThemeHue, GlobalElementsContainer as UIGlobalElementsContainer } from '@munet/ui';
import styles from './App.module.sass';
import { useWindowSize } from '@vueuse/core';

export default defineComponent({
  setup() {
    const { width, height } = useWindowSize();

    if (localStorage.getItem('theme-hue') === null) selectedThemeHue.value = 353;

    return () => (
      <div
        class={[styles.contentRoot, modalShowing.value && styles.modalOpen]} style={{ '--screen-width': `${width.value}`, '--screen-height': `${height.value}` }}
      >
        <UIGlobalElementsContainer />
        <RouterView />
        <FeedbackErrorDialog />
        <NeedPurchaseDialog />
        <StartupErrorDialog />
      </div>
    );
  },
});
