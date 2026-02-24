# Issues

## [2026-02-24] Known Issues

- showTransactionalDialog: action field is return value T, NOT a callback. Must use await+if pattern.
- NFlex default gap: naive-ui NFlex has 8px gap by default. Replacing with <div class="flex"> loses gap. MUST use gap-2.
- NButton loading prop: maps to `ing` in MuNET Button
- AquaMaiConfigurator has NAnchor - must keep naive-ui import for that file
- MusicSelector has NDataTable - must keep naive-ui import for that file
