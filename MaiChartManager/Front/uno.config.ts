// uno.config.ts
import { defineConfig, presetIcons, presetTypography, presetUno, presetAttributify, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
  content: {
    filesystem: ['../../MuNET-UI/src/**/*.{ts,tsx}'],
  },
  presets: [
    presetUno(),
    presetTypography(),
    presetIcons(),
    presetAttributify(),
  ],
  transformers: [
    transformerDirectives({
      applyVariable: ['--at-apply'],
    }),
    transformerVariantGroup(),
  ],
});
