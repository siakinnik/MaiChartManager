# Learnings

## [2026-02-24] Session Start

### Codebase Conventions
- MuNET UI: TSX + defineComponent + UnoCSS, workdir D:\Projects\MuNET\MuFront
- MCM frontend: Vue 3 TSX, workdir D:\Projects\mai\Sitreamai\MaiChartManager\Front
- MCM global styles: `src/global.sass` (NOT style.scss)
- BatchActionButton is at `src/components/MusicList/BatchActionButton/` (NOT BatchAction/)
- MusicSelector is at `src/components/MusicList/BatchActionButton/MusicSelector.tsx`
- MuNET .cst scrollbar: `packages/ui/src/themes/global.module.sass` ~L141
- virtua version in MuFront: ^0.41.5

### Git State
- Branch: feat/munet-ui
- Merge from main: DONE (commit 8cacafe)
- pnpm-lock.yaml: modified (needs pnpm install after virtua added)

### Component Mapping (key rules)
- NFlex → <div class="flex gap-2"> (MUST keep gap-2 default)
- NButton → Button with variant/danger/size (Task 4 extends Button)
- useDialog → showTransactionalDialog with await+if pattern (action is return value, NOT callback)
- NDataTable, NAnchor: KEEP naive-ui (do not migrate)

## [2026-02-25] Popover Component Notes

### Implementation Pattern
- Popover in MuNET UI should use TSX + defineComponent and Teleport to `#app` for layer safety.
- Hover mode needs delayed close (`~120ms`) and shared enter/leave handling on both trigger and content to avoid flicker.
- Simple viewport detection follows Select pattern: compare `spaceBelow` and `spaceAbove` via `getBoundingClientRect`, then place top/bottom.
- Click mode outside-close should use a document click capture listener with trigger/content containment checks (works with current VueUse typing setup).

## [2026-02-25] Wave 1 Task 1

### Tabs Component Conventions
- New MuNET UI tabs component added at `packages/ui/src/components/Tabs/index.tsx` with TSX + `defineComponent`.
- `Tabs` uses `v-model:value` via `useVModel` and auto-falls back to first enabled pane when active pane is missing/disabled.
- `TabPane` props: `name` (string/number), `tab` (string), `disabled` (boolean), `color` (optional CSS color string).
- Tab header supports per-pane active color styling (text and border) to cover MusicEdit difficulty colors.
- Barrel export appended in `packages/ui/src/index.ts`: `export { default as Tabs, TabPane } from './components/Tabs';`

## [2026-02-25] Task 4 Button 扩展
-  新增可选 props:  ()、、 ()。
- 默认不传时返回空样式类，保留原始主题按钮外观与尺寸，不影响旧调用。
- 颜色映射使用主题变量 ； 为红底白字，其他 danger 为红字红边。
-  使用 ， 使用 。

## [2026-02-25] Task 4 Button 扩展（修正记录）
- 文件路径: packages/ui/src/components/Button/index.tsx。
- 新增可选 props: variant(primary|secondary|ghost)、danger(boolean)、size(small|medium)。
- 默认不传新 props 时只保留基础类 relative/of-hidden，按钮外观和尺寸与旧实现一致。
- 颜色映射使用 CSS 变量 --link-color；danger 且 variant=primary 使用红底白字，其他 danger 使用红字红边。
- 尺寸映射: size=small -> h-8 text-sm px-2；size=medium -> h-10 text-base px-4。

## [2026-02-25] F4 Scope Fidelity Audit
- Task 8/9/13/14/21 checked against plan What to do and Must NOT do: all compliant in current snapshot.
- Sidebar contract confirmed: 4 items + desktop 48px rail + mobile bottom tab bar +  update channel.
- Intentional naive-ui residuals confirmed unchanged:  (MusicSelector) and  (AquaMaiConfigurator).
- App.tsx confirmed provider removal while preserving  and CSS vars ().

### Audit Clarification
- Sidebar contract confirmed: 4 items + desktop 48px rail + mobile bottom tab bar + `v-model:active` update channel.
- Intentional naive-ui residuals confirmed unchanged: `NDataTable` (MusicSelector) and `NAnchor` (AquaMaiConfigurator).
- App.tsx confirmed provider removal while preserving `GlobalElementsContainer` and CSS vars (`--screen-width`/`--screen-height`).
