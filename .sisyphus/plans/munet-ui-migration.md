# MaiChartManager UI 框架迁移 + 侧栏

## TL;DR

> **目标**: 为 MaiChartManager 添加图标侧栏（最左边 48px），将批量操作/Mod设置/流派版本管理移入侧栏，同时完成 naive-ui → @munet/ui 的全量组件迁移。
> 
> **交付物**:
> - 48px 图标侧栏组件（桌面端最左边，移动端底部 tab bar）
> - MuNET UI 新组件: Tabs, Popover, Progress
> - MuNET UI Button 扩展: variant/danger/size prop
> - 所有 naive-ui 组件替换为 @munet/ui 或原生 CSS（NDataTable/NAnchor 保留）
> - 移除 naive-ui 依赖
> 
> **预估工作量**: XL
> **并行执行**: YES - 4 waves + final
> **关键路径**: MuNET UI 新组件 → 按目录迁移 → 清理 → 验证

---

## Context

### Original Request
凌莞喵想继续 UI 框架迁移（从 naive-ui 到 @munet/ui），同时在 MaiChartManager 左侧加一个窄图标侧栏，把批量操作、Mod 设置、流派/版本管理移到侧栏里。

### Interview Summary
**关键决策**:
- 侧栏风格: 48px 图标侧栏，hover 显示文字，类似 VS Code 活动栏
- 侧栏位置: 最左边，grid 变为 `cols-[48px_40em_1fr]`
- 侧栏内容: 谱面管理（默认）、Mod 设置、批量操作、流派/版本管理
- 移动端: 侧栏变底部 tab bar
- NButton: 扩展 MuNET Button 加 variant/danger/size prop
- NSwitch → CheckBox + "开/关" 文字
- NScrollbar → 原生 CSS + `cst` 类
- NVirtualList → `virtua` 的 `VList`
- NDrawer → 全屏遮罩 + 信息展示（类似 MuNET ForegroundTask）
- useDialog → `showTransactionalDialog`（await + if 模式）
- useMessage → `addToast`
- NDataTable、NAnchor 明确保留 naive-ui
- NFlex → UnoCSS flex + 必须保留 gap（默认 gap-2）

### Research Findings
**MuNET UI 已有组件**: Button, TextInput, NumberInput, CheckBox, FlagCheckBox, Radio, Select, Modal, DropMenu, Section, Window, WhateverNaviBar, GlobalElementsContainer, addToast, showTransactionalDialog, Qrcode, ScrollText, Range, DateFormat, TransitionOpacity, TransitionVertical

**MuNET UI 缺少（需新建）**: Tabs/TabPane, Popover, Progress

**仍在使用的 naive-ui 组件**: NFlex(40+), NButton(~30), NModal(~15), NInput(~10), NInputNumber(~10), NSelect(~10), NCheckbox(~6), NSwitch(~6), NDropdown(~6), NFormItem(~12), NRadio/NRadioGroup(~4), NPopover(~10), NScrollbar(~5), NDrawer(~4), NProgress(~4), NBadge(2), NDataTable(2), NVirtualList(1), NAlert(2), NDivider(1), NCollapse(1), NTabs/NTabPane(1), NButtonGroup(2), NInputGroup(2), NList/NListItem(3), NAnchor(1), NQrCode(2), NTime(1), NSpin(1), NGrid(2), NText(1), NA(1), useDialog(~15), useMessage(~10), useNotification(~3)

### Metis Review
**识别的关键问题（已修正）**:
- 原计划按组件类型分 task，导致同一文件被 10+ 个 task 修改 → 改为按目录分 task
- 侧栏和迁移是独立并行线，不应有假依赖 → 修正依赖图
- NFlex 替换丢失默认 gap → 强制 gap-2 默认值
- showTransactionalDialog 的 action 是返回值不是回调 → 修正为 await+if 模式
- NButton 变体映射缺失 → 用户决定扩展 MuNET Button

---

## Work Objectives

### Core Objective
添加图标侧栏并完成 naive-ui → @munet/ui 全量迁移。

### Concrete Deliverables
- `MuNET UI`: 新增 Tabs, Popover, Progress 组件 + Button 扩展
- `MaiChartManager`: Sidebar 组件 + 布局重构 + 移动端底部导航
- `MaiChartManager`: 所有 .tsx 文件中的 naive-ui 组件替换完毕
- `MaiChartManager`: package.json 移除 naive-ui 依赖

### Definition of Done
- [ ] 侧栏正常显示，4 个图标按钮可点击
- [ ] 移动端显示底部 tab bar
- [ ] 批量操作/Mod设置/流派版本管理从侧栏触发
- [ ] 所有 .tsx 文件不再 import naive-ui（NDataTable/NAnchor 除外）
- [ ] `vite build` 成功
- [ ] NFlex 替换后间距无明显变化（保留 gap）

### Must Have
- 图标侧栏在最左边，48px 宽
- 移动端底部 tab bar 替代侧栏
- 侧栏项: 谱面管理、Mod 设置、批量操作、流派/版本管理
- 所有可替代的 naive-ui 组件迁移到 @munet/ui
- MuNET UI 新增 Tabs, Popover, Progress 组件
- MuNET Button 扩展 variant/danger/size

### Must NOT Have (Guardrails)
- 不要改变任何业务逻辑，只做 UI 组件替换
- 不要删除任何功能
- 不要引入新的第三方 UI 库（virtua 除外）
- NDataTable 和 NAnchor 保留 naive-ui
- NFlex 替换时必须保留 gap（默认 `gap-2` = 8px）
- NButton 变体必须统一映射，不允许各 agent 自行决定样式
- showTransactionalDialog 迁移必须用 await+if 模式，不是回调映射
- 同一文件不得被多个并行 task 修改
- naive-ui 类型导入（SelectOption, DialogOptions 等）也必须清理

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: none

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **编译验证**: `vite build` 确认无编译错误
- **残留检查**: `grep -r "naive-ui" src/components/{dir}/ --include='*.tsx'` 确认零残留
- **Gap 检查**: `grep -r 'class="flex"' src/ --include='*.tsx' | grep -v gap` 确认 NFlex gap 未丢失
- **视觉验证**: Playwright 截图关键页面

---

## Execution Strategy

### 并行执行 Waves

> 两条独立并行线：**侧栏功能线** 和 **迁移线**，在 Wave 3 汇合。
> 迁移线按目录分 task，每个 task 独占自己的文件，真正可并行。

```
Wave 1 (基础 — MuNET UI 新组件 + 依赖安装):
├── Task 1: MuNET UI — Tabs 组件 [deep]
├── Task 2: MuNET UI — Popover 组件 [deep]
├── Task 3: MuNET UI — Progress 组件 [quick]
├── Task 4: MuNET UI — Button 扩展 (variant/danger/size) [deep]
├── Task 5: MaiChartManager — cst 滚动条样式 [quick]
├── Task 6: MaiChartManager — 安装 virtua [quick]
└── Task 7: 组件映射表文档 [quick]

Wave 2 (核心 — 侧栏 + 按目录迁移，MAX PARALLEL):
├── [侧栏线]
│   ├── Task 8: Sidebar 组件 + 移动端底部导航 (depends: 4) [visual-engineering]
│   └── Task 9: Index.tsx 布局重构 + 侧栏集成 (depends: 8) [visual-engineering]
├── [迁移线 — 每个目录独立，互不冲突]
│   ├── Task 10: 迁移 MusicEdit/ (depends: 1,2,4) [unspecified-high]
│   ├── Task 11: 迁移 ModManager/ (depends: 4) [unspecified-high]
│   ├── Task 12: 迁移 MusicList/ (depends: 4) [unspecified-high]
│   ├── Task 13: 迁移 GenreVersionManager/ (depends: 4) [unspecified-high]
│   ├── Task 14: 迁移 AssetDirsManager/ (depends: 4) [unspecified-high]
│   ├── Task 15: 迁移 ImportCreateChartButton/ (depends: 4) [unspecified-high]
│   ├── Task 16: 迁移 CopyToButton/ (depends: 4) [unspecified-high]
│   ├── Task 17: 迁移 Tools/ (depends: 4) [quick]
│   ├── Task 18: 迁移 AquaMaiConfigurator (depends: 2,4) [unspecified-high]
│   └── Task 19: 迁移散落组件 (depends: 4) [unspecified-high]

Wave 3 (汇合 — 顶层文件 + 清理):
├── Task 20: 迁移 views/Index.tsx (depends: 9, 10-19) [deep]
├── Task 21: 迁移 App.tsx — 移除 naive-ui Providers (depends: 20) [quick]
├── Task 22: 全屏遮罩组件替代 NDrawer (depends: 4) [unspecified-high]
└── Task 23: 移除 naive-ui 依赖 + vite build 验证 (depends: 21, 22) [deep]

Wave FINAL (验证 — 4 个并行审查):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Real QA — Playwright 截图 [unspecified-high]
└── Task F4: Scope fidelity check [deep]

关键路径: Task 4 → Task 10 → Task 20 → Task 21 → Task 23 → F1-F4
并行加速: ~65% faster than sequential
最大并发: 12 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1-7 | — | 8-19 | 1 |
| 8 | 4 | 9 | 2 |
| 9 | 8 | 20 | 2 |
| 10 | 1,2,4 | 20 | 2 |
| 11-17 | 4 | 20 | 2 |
| 18 | 2,4 | 20 | 2 |
| 19 | 4 | 20 | 2 |
| 20 | 9,10-19 | 21 | 3 |
| 21 | 20 | 23 | 3 |
| 22 | 4 | 23 | 3 |
| 23 | 21,22 | F1-F4 | 3 |
| F1-F4 | 23 | — | FINAL |

### Agent Dispatch Summary

- **Wave 1**: 7 tasks — T1-T2 → `deep`, T3 → `quick`, T4 → `deep`, T5-T6 → `quick`, T7 → `quick`
- **Wave 2**: 12 tasks — T8-T9 → `visual-engineering`, T10-T16,T18-T19 → `unspecified-high`, T17 → `quick`
- **Wave 3**: 4 tasks — T20 → `deep`, T21 → `quick`, T22 → `unspecified-high`, T23 → `deep`
- **FINAL**: 4 tasks — F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> 按目录分 task，每个 task 独占自己的文件，可真正并行。
> 每个迁移 task 必须遵循下方组件映射表。
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

### Wave 1 — 基础（MuNET UI 新组件 + 依赖安装）

- [x] 1. MuNET UI — Tabs 组件

  **What to do**:
  - 在 `D:\Projects\MuNET\MuFront\packages\ui\src\components\Tabs\` 下新建 Tabs 和 TabPane 组件
  - Tabs: 接受 `v-model:value` 控制当前 tab，渲染 tab 头部（支持自定义颜色）
  - TabPane: 接受 `name`、`tab`（标签文字）、`disabled` prop
  - MaiChartManager 的 MusicEdit 用 Tabs 显示难度，每个 tab 有不同颜色（绿/黄/红/紫/白）
  - 参考 MuNET UI 现有组件风格（TSX + defineComponent + UnoCSS）
  - 在 `packages/ui/src/index.ts` 中导出

  **Must NOT do**:
  - 不要做动画/过渡效果（保持简单）
  - 不要做懒加载 tab 内容

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-7)
  - **Blocks**: Task 10
  - **Blocked By**: None

  **References**:
  - `D:\Projects\MuNET\MuFront\packages\ui\src\components\Select\index.tsx` — 参考组件结构和 defineComponent 模式
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicEdit\ChartPanel.tsx` — 当前 NTabs 用法，tab 颜色需求
  - `D:\Projects\MuNET\MuFront\packages\ui\src\index.ts` — barrel export 位置

  **Acceptance Criteria**:
  - [ ] `packages/ui/src/components/Tabs/index.tsx` 存在
  - [ ] `packages/ui/src/index.ts` 导出 Tabs 和 TabPane

  ```
  Scenario: Tabs 组件基本功能
    Tool: Bash
    Steps:
      1. grep -r "export.*Tabs" packages/ui/src/index.ts
      2. grep -r "export.*TabPane" packages/ui/src/index.ts
    Expected Result: 两个 grep 都有匹配
    Evidence: .sisyphus/evidence/task-1-tabs-export.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(munet-ui): add Tabs component`
  - Files: `packages/ui/src/components/Tabs/`, `packages/ui/src/index.ts`

- [x] 2. MuNET UI — Popover 组件

  **What to do**:
  - 在 `D:\Projects\MuNET\MuFront\packages\ui\src\components\Popover\` 下新建
  - 接受 `trigger`（slot，触发元素）和 default slot（弹出内容）
  - 支持 hover 触发（默认）和 click 触发
  - 弹出位置自动检测（参考 Select 组件的 viewport 检测逻辑）
  - 在 `packages/ui/src/index.ts` 中导出

  **Must NOT do**:
  - 不要做复杂的定位引擎（简单的上/下即可）

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1,3-7)
  - **Blocks**: Task 10, 18
  - **Blocked By**: None

  **References**:
  - `D:\Projects\MuNET\MuFront\packages\ui\src\components\Select\index.tsx` — viewport 位置检测逻辑（getBoundingClientRect 判断上下空间）
  - `D:\Projects\MuNET\MuFront\packages\ui\src\components\GlobalElementsContainer\` — Teleport 目标容器

  **Acceptance Criteria**:
  - [ ] `packages/ui/src/components/Popover/index.tsx` 存在
  - [ ] `packages/ui/src/index.ts` 导出 Popover

  ```
  Scenario: Popover 组件导出
    Tool: Bash
    Steps:
      1. grep -r "export.*Popover" packages/ui/src/index.ts
    Expected Result: 有匹配
    Evidence: .sisyphus/evidence/task-2-popover-export.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(munet-ui): add Popover component`
  - Files: `packages/ui/src/components/Popover/`, `packages/ui/src/index.ts`

- [x] 3. MuNET UI — Progress 组件

  **What to do**:
  - 在 `D:\Projects\MuNET\MuFront\packages\ui\src\components\Progress\` 下新建
  - 简单的进度条：接受 `percentage` (0-100)、`status` (default/success/error)、`showIndicator` (显示百分比文字)
  - 用 CSS 实现（div 宽度百分比 + 背景色）
  - 在 `packages/ui/src/index.ts` 中导出

  **Must NOT do**:
  - 不要做圆形进度条
  - 不要做动画

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 19
  - **Blocked By**: None

  **References**:
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicList\BatchAction\BatchActionButton.tsx` — NProgress 当前用法

  **Acceptance Criteria**:
  - [ ] `packages/ui/src/components/Progress/index.tsx` 存在
  - [ ] `packages/ui/src/index.ts` 导出 Progress

  ```
  Scenario: Progress 组件导出
    Tool: Bash
    Steps:
      1. grep -r "export.*Progress" packages/ui/src/index.ts
    Expected Result: 有匹配
    Evidence: .sisyphus/evidence/task-3-progress-export.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(munet-ui): add Progress component`
  - Files: `packages/ui/src/components/Progress/`, `packages/ui/src/index.ts`

- [x] 4. MuNET UI — Button 扩展 (variant/danger/size)
  **What to do**:
  - 修改 `D:\Projects\MuNET\MuFront\packages\ui\src\components\Button\index.tsx`
  - 新增 prop: `variant` ('primary' | 'secondary' | 'ghost')、`danger` (boolean)、`size` ('small' | 'medium')
  - variant='primary': 主色背景（参考 MuNET 主题色）
  - variant='secondary': 透明背景 + 边框
  - variant='ghost': 无背景无边框，hover 显示背景
  - danger: 红色文字/背景
  - size='small': 更小的 padding 和 font-size
  - 默认行为保持不变（无 variant = 当前样式）
  **Must NOT do**:
  - 不要改变现有 Button 的默认行为
  - 不要破坏 MuNET 主站已有的 Button 用法
  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-7)
  - **Blocks**: Tasks 8-19
  - **Blocked By**: None
  **References**:
  - `D:\Projects\MuNET\MuFront\packages\ui\src\components\Button\index.tsx` — 当前 Button 实现，需要扩展
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicList\BatchAction\DeleteButton.tsx` — NButton type="error" secondary 用法示例
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicEdit\AudioPreviewEditor.tsx` — NButton type="error" 用法示例
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\VideoConvertButton.tsx` — NButton type="primary" 用法示例
  **Acceptance Criteria**:
  - [ ] Button 组件支持 variant/danger/size prop
  - [ ] 无 variant 时行为不变
  ```
  Scenario: Button 扩展 prop 存在
    Tool: Bash
    Steps:
      1. grep -n "variant\|danger\|size" packages/ui/src/components/Button/index.tsx
    Expected Result: 找到 variant/danger/size 相关的 prop 定义
    Evidence: .sisyphus/evidence/task-4-button-props.txt
  ```
  **Commit**: YES (groups with Wave 1)
  - Message: `feat(munet-ui): extend Button with variant/danger/size props`
  - Files: `packages/ui/src/components/Button/index.tsx`
- [x] 5. MaiChartManager — cst 滚动条样式
  **What to do**:
  - 在 MaiChartManager 的全局 CSS 中添加 `.cst` 类
  - 样式: `::-webkit-scrollbar-thumb` 背景色 #999，hover #666，圆角
  - 用 `@media (hover: hover)` 包裹（触屏设备不显示自定义滚动条）
  - 可以加在 `src/global.sass` 或单独的 CSS 文件中
  **Must NOT do**:
  - 不要修改 MuNET 主站的样式文件
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 10-19 (迁移时使用 cst 类)
  - **Blocked By**: None
  **References**:
  - `D:\Projects\MuNET\MuFront\packages\ui\src\themes\global.module.sass` — MuNET UI 的 .cst 实现（约 L141 起），参考样式
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\global.sass` — MCM 全局样式文件
  **Acceptance Criteria**:
  - [ ] `.cst` 类在 MCM 全局样式中定义
  ```
  Scenario: cst 类存在
    Tool: Bash
    Steps:
      1. grep -r "\.cst" MaiChartManager/Front/src/ --include='*.sass' --include='*.scss' --include='*.css'
    Expected Result: 找到 .cst 定义
    Evidence: .sisyphus/evidence/task-5-cst-class.txt
  ```
  **Commit**: YES (groups with Wave 1)
  - Message: `style(mcm): add cst custom scrollbar class`
  - Files: `MaiChartManager/Front/src/global.sass`
- [x] 6. MaiChartManager — 安装 virtua
  **What to do**:
  - 在 `MaiChartManager/Front/` 下运行 `pnpm add virtua`
  - 确认 `virtua/vue` 可以 import
  **Must NOT do**:
  - 不要在这个 task 中替换任何 NVirtualList（那是迁移 task 的事）
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 12 (MusicList 迁移用到 VList)
  - **Blocked By**: None
  **References**:
  - `D:\Projects\MuNET\MuFront\package.json` — MuFront 中 virtua 版本号 (^0.41.5)
  **Acceptance Criteria**:
  - [ ] `virtua` 在 package.json dependencies 中
  ```
  Scenario: virtua 已安装
    Tool: Bash
    Steps:
      1. grep "virtua" MaiChartManager/Front/package.json
    Expected Result: 找到 virtua 依赖
    Evidence: .sisyphus/evidence/task-6-virtua-installed.txt
  ```
  **Commit**: YES (groups with Wave 1)
  - Message: `deps(mcm): add virtua for virtual scrolling`
  - Files: `MaiChartManager/Front/package.json`, `MaiChartManager/Front/pnpm-lock.yaml`
- [x] 7. 组件映射表文档
  **What to do**:
  - 创建 `.sisyphus/references/component-mapping.md`，内容即本计划“组件映射表”章节的完整副本
  - 这是所有迁移 task 的权威参考，确保统一映射
  - 包含 useDialog 迁移模式的代码示例
  **Must NOT do**:
  - 不要偏离本计划中定义的映射规则
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 10-19 (所有迁移 task 参考此文档)
  - **Blocked By**: None
  **References**:
  - 本计划文件的“组件映射表”章节
  **Acceptance Criteria**:
  - [ ] `.sisyphus/references/component-mapping.md` 存在且内容完整
  ```
  Scenario: 映射表文档存在
    Tool: Bash
    Steps:
      1. test -f .sisyphus/references/component-mapping.md && echo EXISTS
    Expected Result: EXISTS
    Evidence: .sisyphus/evidence/task-7-mapping-doc.txt
  ```
  **Commit**: NO

### Wave 2 — 核心（侧栏 + 按目录迁移，MAX PARALLEL）

#### 侧栏线

- [ ] 8. Sidebar 组件 + 移动端底部导航
  **What to do**:
  - 新建 `MaiChartManager/Front/src/components/Sidebar/index.tsx`
  - 桌面端: 48px 宽的垂直图标栏，固定在最左边
  - 4 个图标按钮: 谱面管理（默认选中）、Mod设置、批量操作、流派/版本管理
  - hover 显示文字提示（用 Popover 或简单 title 属性）
  - 当前选中项高亮（左侧边框或背景色）
  - 移动端 (<768px): 变成底部 tab bar，水平排列 4 个图标
  - 组件接受 `v-model:active` 控制当前选中项
  - 谱面管理: 显示主界面（默认）
  - Mod设置: 触发 ConfigEditor Modal
  - 批量操作: 触发 BatchAction Modal
  - 流派/版本: 触发 GenreVersionManager Modal
  **Must NOT do**:
  - 不要在这个 task 中修改 Index.tsx 布局（那是 Task 9）
  - 不要修改 BatchActionButton/ModManager/GenreVersionManager 的内部逻辑
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 10-19)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4 (Button 扩展)
  **References**:
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\views\Index.tsx` — 当前布局，理解侧栏将插入的位置
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicList\BatchActionButton\index.tsx` — 批量操作的 Modal show ref
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\ModManager\ConfigEditor.tsx` — Mod设置的 Modal show ref
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\GenreVersionManager\index.tsx` — 流派版本的 Modal show ref
  **Acceptance Criteria**:
  - [ ] `src/components/Sidebar/index.tsx` 存在
  - [ ] 组件接受 active prop 和 4 个侧栏项
  ```
  Scenario: Sidebar 组件文件存在
    Tool: Bash
    Steps:
      1. test -f MaiChartManager/Front/src/components/Sidebar/index.tsx && echo EXISTS
    Expected Result: EXISTS
    Evidence: .sisyphus/evidence/task-8-sidebar-exists.txt
  Scenario: 移动端底部导航样式
    Tool: Bash
    Steps:
      1. grep -n "768\|bottom\|tab-bar\|fixed" MaiChartManager/Front/src/components/Sidebar/index.tsx
    Expected Result: 找到移动端相关样式定义
    Evidence: .sisyphus/evidence/task-8-mobile-nav.txt
  ```
  **Commit**: YES
  - Message: `feat(mcm): add Sidebar component with mobile bottom nav`
  - Files: `MaiChartManager/Front/src/components/Sidebar/`
- [ ] 9. Index.tsx 布局重构 + 侧栏集成
  **What to do**:
  - 修改 `MaiChartManager/Front/src/views/Index.tsx`
  - 桌面端 grid 从 `cols-[40em_1fr]` 变为 `cols-[48px_40em_1fr]`
  - 最左列插入 `<Sidebar>` 组件
  - 从顶部工具栏移除 ModManager 和 GenreVersionManager 的触发按钮
  - 侧栏的 active 状态控制显示哪个功能模块
  - 移动端 (<768px): 底部 tab bar 显示，侧栏列隐藏
  - 保持现有的 <1440px 滑入式 MusicList 行为
  **Must NOT do**:
  - 不要在这个 task 中迁移 naive-ui 组件（那是 Task 20）
  - 不要改变业务逻辑
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 8)
  - **Parallel Group**: Sequential after Task 8
  - **Blocks**: Task 20
  - **Blocked By**: Task 8
  **References**:
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\views\Index.tsx` — 当前布局，2列 grid `cols-[40em_1fr]`
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\Sidebar\index.tsx` — Task 8 创建的侧栏组件
  **Acceptance Criteria**:
  - [ ] Index.tsx 中有 3 列 grid 布局
  - [ ] Sidebar 组件被引用
  ```
  Scenario: 3列布局
    Tool: Bash
    Steps:
      1. grep -n "48px\|cols-\[48px" MaiChartManager/Front/src/views/Index.tsx
    Expected Result: 找到 48px 列定义
    Evidence: .sisyphus/evidence/task-9-layout.txt
  Scenario: 侧栏引用
    Tool: Bash
    Steps:
      1. grep -n "Sidebar" MaiChartManager/Front/src/views/Index.tsx
    Expected Result: 找到 Sidebar import 和使用
    Evidence: .sisyphus/evidence/task-9-sidebar-ref.txt
  ```
  **Commit**: YES
  - Message: `feat(mcm): integrate sidebar into Index.tsx layout`
  - Files: `MaiChartManager/Front/src/views/Index.tsx`

#### 迁移线（按目录，每个 task 独占自己的文件）
- [ ] 10. 迁移 MusicEdit/ 目录
  **What to do**:
  - 迁移 `src/components/MusicEdit/` 下所有文件的 naive-ui 组件
  - 该目录包含: index.tsx, ChartPanel.tsx, AudioPreviewEditor.tsx, MemoBox.tsx, ErrorDisplayIdInput.tsx 等
  - 主要替换: NFlex, NButton, NInput, NInputNumber, NSelect, NSwitch, NFormItem, NRadio, NPopover, NTabs/NTabPane, useDialog, useMessage
  - NTabs/NTabPane → 新建的 Tabs/TabPane（Task 1）
  - NPopover → 新建的 Popover（Task 2）
  - 严格遵循组件映射表（.sisyphus/references/component-mapping.md）
  - 清理所有 naive-ui 类型导入（SelectOption 等）
  **Must NOT do**:
  - 不要修改业务逻辑
  - 不要触碰其他目录的文件
  - NFlex 替换必须保留 gap（默认 gap-2）
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8,11-19)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 1 (Tabs), 2 (Popover), 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表（权威参考）
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicEdit\index.tsx` — 主文件，包含大量 naive-ui 组件
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicEdit\ChartPanel.tsx` — NTabs/NTabPane 用法，难度 tab 颜色
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicEdit\AudioPreviewEditor.tsx` — NButton type="error"、NSlider
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicEdit\MemoBox.tsx` — NButton、NInput
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicEdit\ErrorDisplayIdInput.tsx` — NPopover、NFormItem、NInputNumber
  - `D:\Projects\MuNET\MuFront\packages\ui\src\components\` — MuNET UI 组件源码，理解 prop API
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/MusicEdit/ --include='*.tsx'` 返回 0 结果
  - [ ] 所有文件无语法错误
  ```
  Scenario: MusicEdit 目录零 naive-ui 残留
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/MusicEdit/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配
    Failure Indicators: 任何匹配行
    Evidence: .sisyphus/evidence/task-10-musicedit-clean.txt
  Scenario: NFlex gap 保留
    Tool: Bash
    Steps:
      1. grep -n 'class="flex"' MaiChartManager/Front/src/components/MusicEdit/ -r --include='*.tsx' | grep -v gap
    Expected Result: 0 匹配（所有 flex 都有 gap）
    Evidence: .sisyphus/evidence/task-10-flex-gap.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate MusicEdit/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/MusicEdit/`
- [ ] 11. 迁移 ModManager/ 目录
  **What to do**:
  - 迁移 `src/components/ModManager/` 下所有文件的 naive-ui 组件
  - 该目录包含 14 个文件: ConfigEditor.tsx, AquaMaiConfigurator.tsx 等
  - 主要替换: NFlex, NButton, NInput, NInputNumber, NSelect, NSwitch, NCheckbox, NFormItem, NPopover, NCollapse, useDialog, useMessage
  - AquaMaiConfigurator 中的 NAnchor 明确保留
  - NCollapse → `<details><summary>`
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要替换 NAnchor
  - 不要修改业务逻辑
  - 不要触碰其他目录
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-10, 12-19)
  - **Blocks**: Task 20
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\ModManager\ConfigEditor.tsx` — 主文件，Modal + 表单
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\ModManager\AquaMaiConfigurator.tsx` — 最复杂的文件，NAnchor 保留
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/ModManager/ --include='*.tsx'` 仅返回 NAnchor 相关
  ```
  Scenario: ModManager 目录迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/ModManager/ --include='*.tsx' --include='*.ts'
    Expected Result: 仅 NAnchor 相关的 import 残留（如果有）
    Evidence: .sisyphus/evidence/task-11-modmanager-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate ModManager/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/ModManager/`
- [ ] 12. 迁移 MusicList/ 目录
  **What to do**:
  - 迁移 `src/components/MusicList/` 下所有文件的 naive-ui 组件
  - 包含: index.tsx, MusicSelector.tsx, BatchActionButton/ 子目录
  - 主要替换: NFlex, NButton, NInput, NVirtualList, NProgress, NModal, NCheckbox, NBadge, useDialog, useMessage
  - NVirtualList → VList from 'virtua/vue'（Task 6 已安装）
  - NProgress → Progress（Task 3 新建）
  - NDataTable 在 MusicSelector 中明确保留
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要替换 NDataTable
  - 不要修改业务逻辑
  - 不要触碰其他目录
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 4 (Button), 6 (virtua)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicList\index.tsx` — 主文件，BatchActionButton 触发
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicList\BatchActionButton\MusicSelector.tsx` — NDataTable 保留、NVirtualList 替换
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\MusicList\BatchActionButton\index.tsx` — NProgress、NModal、useDialog
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/MusicList/ --include='*.tsx'` 仅返回 NDataTable 相关
  ```
  Scenario: MusicList 目录迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/MusicList/ --include='*.tsx' --include='*.ts'
    Expected Result: 仅 NDataTable 相关的 import 残留
    Evidence: .sisyphus/evidence/task-12-musiclist-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate MusicList/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/MusicList/`
- [ ] 13. 迁移 GenreVersionManager/ 目录
  **What to do**:
  - 迁移 `src/components/GenreVersionManager/` 下所有文件
  - 主要替换: NFlex, NButton, NModal, NInput, NCheckbox, NDropdown, NList/NListItem, NScrollbar, useDialog, useMessage
  - NScrollbar → `<div class="of-y-auto cst">`
  - NList/NListItem → `<div class="flex flex-col gap-1">` / `<div>`
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要修改业务逻辑
  - 不要触碰其他目录
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\GenreVersionManager\index.tsx` — 主文件
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/GenreVersionManager/ --include='*.tsx'` 返回 0
  ```
  Scenario: GenreVersionManager 目录迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/GenreVersionManager/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-13-genreversion-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate GenreVersionManager/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/GenreVersionManager/`
- [ ] 14. 迁移 AssetDirsManager/ 目录
  **What to do**:
  - 迁移 `src/components/AssetDirsManager/` 下所有文件
  - 主要替换: NFlex, NButton, NModal, NInput, NScrollbar, useDialog, useMessage
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要修改业务逻辑
  - 不要触碰其他目录
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\AssetDirsManager\index.tsx` — 主文件
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/AssetDirsManager/ --include='*.tsx'` 返回 0
  ```
  Scenario: AssetDirsManager 目录迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/AssetDirsManager/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-14-assetdirs-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate AssetDirsManager/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/AssetDirsManager/`
- [ ] 15. 迁移 ImportCreateChartButton/ 目录
  **What to do**:
  - 迁移 `src/components/ImportCreateChartButton/` 下所有文件
  - 主要替换: NFlex, NButton, NModal, NInput, NDropdown, NSelect, NFormItem, useDialog, useMessage
  - NDropdown + NButton trigger 组合 → DropMenu + Button
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要修改业务逻辑
  - 不要触碰其他目录
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\ImportCreateChartButton\index.tsx` — NDropdown + NButton trigger 组合
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/ImportCreateChartButton/ --include='*.tsx'` 返回 0
  ```
  Scenario: ImportCreateChartButton 目录迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/ImportCreateChartButton/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-15-importcreate-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate ImportCreateChartButton/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/ImportCreateChartButton/`
- [ ] 16. 迁移 CopyToButton/ 目录
  **What to do**:
  - 迁移 `src/components/CopyToButton/` 下所有文件
  - 包含: index.tsx, ChangeIdDialog.tsx
  - 主要替换: NFlex, NButton, NModal, NInput, NDropdown, NFormItem, useDialog
  - ChangeIdDialog 中的 dialog 实例可能有 `.destroy()` 调用，需要重构为 await+if 模式
  - 清理 DialogOptions 类型导入
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要修改业务逻辑
  - 不要触碰其他目录
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\CopyToButton\index.tsx` — NDropdown + NButton
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\CopyToButton\ChangeIdDialog.tsx` — useDialog，可能有 dialog.destroy()
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/CopyToButton/ --include='*.tsx'` 返回 0
  ```
  Scenario: CopyToButton 目录迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/CopyToButton/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-16-copyto-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate CopyToButton/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/CopyToButton/`
- [ ] 17. 迁移 Tools/ 目录
  **What to do**:
  - 迁移 `src/components/Tools/` 下所有文件
  - 主要替换: NButton, NDropdown, NFlex
  - NDropdown → DropMenu
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要修改业务逻辑
  - 不要触碰其他目录
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\Tools\index.tsx` — DropMenu 已部分迁移
  **Acceptance Criteria**:
  - [ ] `grep -r "naive-ui" src/components/Tools/ --include='*.tsx'` 返回 0
  ```
  Scenario: Tools 目录迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/Tools/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-17-tools-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate Tools/ from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/Tools/`
- [ ] 18. 迁移 AquaMaiConfigurator 及其子组件
  **What to do**:
  - 迁移 `src/components/ModManager/AquaMaiConfigurator.tsx` 及其相关子组件
  - 注意: 这个文件在 ModManager/ 目录下，但因为它用了 NPopover（依赖 Task 2），所以单独拆出
  - 如果 Task 11 已经处理了这个文件，则跳过此 task
  - 主要替换: NPopover → Popover, NButton 变体, NSwitch → CheckBox, NFormItem, NFlex
  - NAnchor 明确保留
  **Must NOT do**:
  - 不要替换 NAnchor
  - 不要修改业务逻辑
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 2 (Popover), 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\ModManager\AquaMaiConfigurator.tsx` — 最复杂的单文件，多种组件混用
  **Acceptance Criteria**:
  - [ ] AquaMaiConfigurator.tsx 中仅剩 NAnchor 相关的 naive-ui import
  ```
  Scenario: AquaMaiConfigurator 迁移完成
    Tool: Bash
    Steps:
      1. grep -n "naive-ui" MaiChartManager/Front/src/components/ModManager/AquaMaiConfigurator.tsx
    Expected Result: 仅 NAnchor 相关的 import
    Evidence: .sisyphus/evidence/task-18-aquamai-clean.txt
  ```
  **Commit**: YES (groups with Task 11 if same directory)
  - Message: `refactor(mcm): migrate AquaMaiConfigurator from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/ModManager/AquaMaiConfigurator.tsx`
- [ ] 19. 迁移散落组件
  **What to do**:
  - 迁移不属于上述目录的散落组件文件:
    - `src/components/VideoConvertButton.tsx` — NButton type="primary", NProgress, NFlex, useMessage
    - `src/components/ChartPreview.tsx` — NButton, NFlex
    - `src/components/DxRatingCalculator.tsx` — NButton, NInput, NFlex, NGrid
    - `src/components/OfficialDataSyncButton.tsx` — NButton, NProgress, useDialog, useMessage
    - 其他散落在 `src/components/` 根目录的文件
  - NProgress → Progress（Task 3）
  - NGrid → UnoCSS grid classes
  - NQrCode → Qrcode（@munet/ui）
  - NTime → DateFormat（@munet/ui）
  - NSpin → CSS spinner
  - NText → `<span>`, NA → `<a>`
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要触碰已有子目录中的文件（那些由 Task 10-18 处理）
  - 不要修改业务逻辑
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\VideoConvertButton.tsx` — NButton type="primary", NProgress
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\OfficialDataSyncButton.tsx` — useDialog, useMessage, NProgress
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\components\DxRatingCalculator.tsx` — NGrid
  **Acceptance Criteria**:
  - [ ] 所有散落组件文件无 naive-ui import
  ```
  Scenario: 散落组件迁移完成
    Tool: Bash
    Steps:
      1. grep -rn "naive-ui" MaiChartManager/Front/src/components/*.tsx
    Expected Result: 0 匹配（或仅子目录中的 NDataTable/NAnchor）
    Evidence: .sisyphus/evidence/task-19-scattered-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate scattered components from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/components/*.tsx`
### Wave 3 — 汇合（顶层文件 + 清理）
- [ ] 20. 迁移 views/Index.tsx
  **What to do**:
  - 迁移 `src/views/Index.tsx` 中剩余的 naive-ui 组件
  - 此时 Task 9 已经重构了布局，但可能仍有 NFlex、NButton、NScrollbar、useDialog、useMessage 等残留
  - NScrollbar → `<div class="of-y-auto cst">`
  - 清理所有 naive-ui import
  - 严格遵循组件映射表
  **Must NOT do**:
  - 不要破坏 Task 9 的侧栏集成
  - 不要修改业务逻辑
  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 21
  - **Blocked By**: Tasks 9, 10-19 (所有 Wave 2 完成后)
  **References**:
  - `.sisyphus/references/component-mapping.md` — 组件映射表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\views\Index.tsx` — 目标文件
  **Acceptance Criteria**:
  - [ ] `grep -n "naive-ui" src/views/Index.tsx` 返回 0
  ```
  Scenario: Index.tsx 零 naive-ui 残留
    Tool: Bash
    Steps:
      1. grep -n "naive-ui" MaiChartManager/Front/src/views/Index.tsx
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-20-index-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): migrate Index.tsx from naive-ui to @munet/ui`
  - Files: `MaiChartManager/Front/src/views/Index.tsx`
- [ ] 21. 迁移 App.tsx — 移除 naive-ui Providers
  **What to do**:
  - 修改 `src/App.tsx`
  - 移除 NConfigProvider, NDialogProvider, NMessageProvider, NNotificationProvider 包裹
  - 确保 GlobalElementsContainer 已在合适位置（提供 addToast/showTransactionalDialog）
  - 保留 CSS 变量容器 div（--screen-width/--screen-height）
  - 清理所有 naive-ui import
  **Must NOT do**:
  - 不要删除 CSS 变量设置的 div
  - 不要删除 GlobalElementsContainer
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential after Task 20
  - **Blocks**: Task 23
  - **Blocked By**: Task 20
  **References**:
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\src\App.tsx` — 当前结构，NConfigProvider 包裹
  - `D:\Projects\MuNET\MuFront\packages\ui\src\components\GlobalElementsContainer\` — 提供 toast/dialog 的容器
  **Acceptance Criteria**:
  - [ ] `grep -n "naive-ui" src/App.tsx` 返回 0（或仅 NDataTable 相关 provider）
  ```
  Scenario: App.tsx 零 naive-ui Provider
    Tool: Bash
    Steps:
      1. grep -n "naive-ui\|NConfigProvider\|NDialogProvider\|NMessageProvider" MaiChartManager/Front/src/App.tsx
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-21-app-clean.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): remove naive-ui providers from App.tsx`
  - Files: `MaiChartManager/Front/src/App.tsx`
- [ ] 22. 全屏遮罩组件替代 NDrawer
  **What to do**:
  - 新建 `src/components/FullscreenOverlay/index.tsx`（或类似名称）
  - 全屏遮罩 + 内容展示，类似 MuNET ForegroundTask 模式
  - 接受 `v-model:show`、`title`、default slot
  - 背景: fixed 全屏 + backdrop-blur + 半透明黑色
  - 内容区域: 居中或侧边，可滚动
  - 点击背景或关闭按钮关闭
  - 找到所有使用 NDrawer 的文件，替换为 FullscreenOverlay
  - NDrawer 主要用于展示信息提示（tip）
  **Must NOT do**:
  - 不要做复杂的动画
  - 不要改变展示的内容
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: YES (parallel with Task 20-21)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 23
  - **Blocked By**: Task 4 (Button)
  **References**:
  - `D:\Projects\MuNET\MuFront\packages\ui\src\components\GlobalElementsContainer\ForegroundTask.tsx` — MuNET 的全屏遮罩模式
  - `.sisyphus/references/component-mapping.md` — NDrawer 映射规则
  - 搜索 `NDrawer` 在 MCM 中的所有用法: `grep -rn "NDrawer" MaiChartManager/Front/src/`
  **Acceptance Criteria**:
  - [ ] FullscreenOverlay 组件存在
  - [ ] `grep -rn "NDrawer" src/ --include='*.tsx'` 返回 0
  ```
  Scenario: NDrawer 已全部替换
    Tool: Bash
    Steps:
      1. grep -rn "NDrawer" MaiChartManager/Front/src/ --include='*.tsx'
    Expected Result: 0 匹配
    Evidence: .sisyphus/evidence/task-22-drawer-replaced.txt
  Scenario: FullscreenOverlay 组件存在
    Tool: Bash
    Steps:
      1. find MaiChartManager/Front/src/components/ -name "*Overlay*" -o -name "*Fullscreen*" | head -5
    Expected Result: 找到至少一个文件
    Evidence: .sisyphus/evidence/task-22-overlay-exists.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): replace NDrawer with FullscreenOverlay component`
  - Files: `MaiChartManager/Front/src/components/FullscreenOverlay/`, affected files
- [ ] 23. 移除 naive-ui 依赖 + vite build 验证
  **What to do**:
  - 从 `MaiChartManager/Front/package.json` 移除 `naive-ui` 依赖
  - 如果 NDataTable/NAnchor 仍在使用，则保留 naive-ui 但添加注释说明原因
  - 运行 `pnpm install` 更新 lock file
  - 运行 `npx vite build` 验证编译通过
  - 全局搜索确认无意外的 naive-ui 残留
  - 检查 bundle size 是否合理
  **Must NOT do**:
  - 如果 build 失败，不要强行移除 naive-ui，而是修复问题
  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (last task before FINAL)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 21, 22
  **References**:
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\package.json` — 依赖列表
  - `D:\Projects\mai\Sitreamai\MaiChartManager\Front\vite.config.ts` — build 配置
  **Acceptance Criteria**:
  - [ ] `vite build` 成功
  - [ ] naive-ui 从 package.json 移除（或仅保留并注释）
  - [ ] 全局搜索 naive-ui import 仅剩 NDataTable/NAnchor 相关
  ```
  Scenario: vite build 成功
    Tool: Bash
    Steps:
      1. cd MaiChartManager/Front && npx vite build
    Expected Result: Build successful，无错误
    Failure Indicators: ERROR 或 Failed to resolve import
    Evidence: .sisyphus/evidence/task-23-build-output.txt
  Scenario: naive-ui 残留检查
    Tool: Bash
    Steps:
      1. grep -rn "from ['"]naive-ui['"]" MaiChartManager/Front/src/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配或仅 NDataTable/NAnchor 相关文件
    Evidence: .sisyphus/evidence/task-23-naive-residual.txt
  Scenario: 类型导入残留检查
    Tool: Bash
    Steps:
      1. grep -rn "import type.*from ['"]naive-ui['"]" MaiChartManager/Front/src/ --include='*.tsx' --include='*.ts'
    Expected Result: 0 匹配或仅 NDataTable 相关
    Evidence: .sisyphus/evidence/task-23-type-residual.txt
  ```
  **Commit**: YES
  - Message: `refactor(mcm): remove naive-ui dependency and verify build`
  - Files: `MaiChartManager/Front/package.json`, `MaiChartManager/Front/pnpm-lock.yaml`
---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `vite build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction. Verify no `import ... from 'naive-ui'` remains (except NDataTable/NAnchor files).
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real QA — Playwright 截图** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Screenshot: 主页面（音乐列表+编辑区）、侧栏、Mod设置、批量操作、流派版本管理。Test sidebar navigation. Test mobile viewport (375px) bottom tab bar. Verify NFlex gap preserved (visual spacing). Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 compliance. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | VERDICT`

---

## Commit Strategy

每个 Wave 完成后一次 commit：
- Wave 1: `feat(munet-ui): add Tabs, Popover, Progress components and extend Button`
- Wave 2 侧栏: `feat(mcm): add icon sidebar with mobile bottom nav`
- Wave 2 迁移: 每个目录一次 commit `refactor(mcm): migrate {dir} from naive-ui to @munet/ui`
- Wave 3: `refactor(mcm): remove naive-ui dependency and cleanup`

---

## Success Criteria

### Verification Commands
```bash
# 编译验证
cd MaiChartManager/Front && npx vite build  # Expected: Build successful

# naive-ui 残留检查
grep -r "from ['\"]naive-ui['\"]" MaiChartManager/Front/src/ --include='*.tsx' --include='*.ts'
# Expected: 仅 NDataTable/NAnchor 相关文件

# NFlex gap 检查
grep -r 'class="flex"' MaiChartManager/Front/src/ --include='*.tsx' | grep -v gap
# Expected: 0 matches (所有 flex 都有 gap，除非确实不需要)

# 类型导入残留
grep -r "import type.*from ['\"]naive-ui['\"]" MaiChartManager/Front/src/ --include='*.tsx' --include='*.ts'
# Expected: 仅 NDataTable 相关
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] vite build passes
- [ ] Sidebar works on desktop (48px left)
- [ ] Bottom tab bar works on mobile
- [ ] NFlex gap preserved
- [ ] naive-ui removed from package.json (or only NDataTable/NAnchor deps remain)

---

## 组件映射表（所有迁移 task 必须遵循）

```
NFlex                    → <div class="flex gap-2">（默认）
NFlex vertical           → <div class="flex flex-col gap-2">
NFlex size="small"       → gap-1 (4px)
NFlex size="large"       → gap-3 (12px)
NFlex justify/align      → justify-{x} items-{x}
NButton                  → <Button>（MuNET UI 扩展后）
NButton type="primary"   → <Button variant="primary">
NButton type="error"     → <Button danger>
NButton secondary        → <Button variant="secondary">
NButton quaternary       → <Button variant="ghost">
NButton size="small"     → <Button size="small">
NButton loading={x}      → <Button ing={x}>
NButtonGroup             → <div class="flex">（按钮紧贴）
NModal                   → <Modal>（@munet/ui）
NInput                   → <TextInput>（@munet/ui）
NInputNumber             → <NumberInput>（@munet/ui）
NInputGroup              → <div class="flex">
NSelect                  → <Select>（@munet/ui）
NCheckbox                → <CheckBox>（@munet/ui）
NSwitch                  → <CheckBox v-model:value={x}>{x ? '开' : '关'}</CheckBox>
NRadio/NRadioGroup       → <Radio>（@munet/ui）
NDropdown                → <DropMenu>（@munet/ui）
NFormItem                → <div class="ml-1 text-sm">{label}</div> + 组件
NPopover                 → <Popover>（MuNET UI 新建）
NScrollbar               → <div class="of-y-auto cst">
NVirtualList             → <VList> from 'virtua/vue'
NDrawer                  → 全屏遮罩组件（新建）
NProgress                → <Progress>（MuNET UI 新建）
NTabs/NTabPane           → <Tabs>/<TabPane>（MuNET UI 新建）
NBadge                   → <span class="relative"><span class="badge">N</span>...</span>
NAlert                   → <div class="p-3 rounded border border-yellow/30 bg-yellow/10">
NDivider                 → <hr class="border-white/10 my-2">
NCollapse                → <details><summary>
NList/NListItem          → <div class="flex flex-col gap-1"> / <div>
NGrid                    → UnoCSS grid classes
NText                    → <span>
NA                       → <a>
NTime                    → <DateFormat>（@munet/ui）
NSpin                    → 简单 CSS spinner
NQrCode                  → <Qrcode>（@munet/ui）
useDialog                → showTransactionalDialog（await + if 模式）
useMessage               → addToast
useNotification          → addToast
SelectOption type        → 内联 { label: string, value: string }[]
DialogOptions type       → 删除，不需要
```

**useDialog 迁移模式（关键）**:
```tsx
// Before:
dialog.warning({
  title: '确认',
  content: '确定要删除吗？',
  positiveText: '删除',
  onPositiveClick: async () => { await doDelete() }
})

// After:
const confirmed = await showTransactionalDialog('确认', '确定要删除吗？', [
  { text: '删除', action: true, danger: true }
], true)
if (confirmed) await doDelete()
```

```tsx
// Before (error/info dialog, no action needed):
dialog.error({ title: '错误', content: msg, positiveText: '确定' })

// After:
await showTransactionalDialog('错误', msg, [{ text: '确定', action: true }])
```
