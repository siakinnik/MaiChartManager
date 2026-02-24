# 组件映射表 — 权威参考文档

> 本文档是所有迁移任务（Task 10-19）的权威参考。所有 naive-ui → @munet/ui 迁移必须严格遵循此映射，不得偏离。
>
> 来源：`.sisyphus/plans/munet-ui-migration.md` 第 1160 行起

---

## 组件映射表

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

---

## 保留 naive-ui 的组件（不迁移）

- `NDataTable` — 保留 naive-ui
- `NAnchor` — 保留 naive-ui

---

## useDialog 迁移模式（关键）

### 有操作的确认对话框

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

### 无操作的提示对话框（error/info）

```tsx
// Before:
dialog.error({ title: '错误', content: msg, positiveText: '确定' })

// After:
await showTransactionalDialog('错误', msg, [{ text: '确定', action: true }])
```

---

## 关键规则速查

| 规则 | 说明 |
|------|------|
| NFlex 必须保留 gap | 默认 `gap-2`，不得省略 |
| NButton loading prop | 改为 `ing` |
| useDialog 返回值 | action 是返回值，不是回调 |
| NDataTable/NAnchor | 保留 naive-ui，不迁移 |
