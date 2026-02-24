# Decisions

## [2026-02-24] User Decisions

- NButton variants: Extend MuNET Button with variant/danger/size props (NOT CSS-only)
- Mobile sidebar: Bottom tab bar on <768px (NOT hidden, NOT keep 48px)
- NDrawer replacement: Full-screen overlay (ForegroundTask pattern, NOT Modal)
- NDataTable: Keep naive-ui (too complex to replace)
- NAnchor: Keep naive-ui
- Plan structure: Split by directory (NOT by component type) to avoid parallel file conflicts

## [2026-02-25] Task 4 Button Props
- 保持向后兼容优先：variant/danger/size 全为可选且无默认值，不传即不注入新样式。
- 复用主题变量 --link-color 实现 primary/secondary/ghost 颜色，避免硬编码主题色。
