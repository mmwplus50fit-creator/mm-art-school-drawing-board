# First release — October 28, 2026

Target: November 1, 2026. First production deployment completed early.

Vercel project: `prj_QAo11ZQihYhDi5DY859GvpkuD5Uz`, team `mmwplus50fit-creators-projects`.
Production: https://mm-art-school-drawing-board.vercel.app

## Verified in the live browser

- Created a board and imported a PNG through the file chooser.
- Renamed the board, reloaded, and verified the name, image, and reference count persisted.
- Exported JSON backup and imported it. Boards and images were restored as new copies; original boards remained.
- Started a session. Countdown advanced; pause displayed Resume and held its value.
- Checked desktop and 390 px phone layouts.

## Limitations

- Browser-local library, manual Drive downloads/imports, no accounts or automatic sync.
- HEIC conversion is not included; use JPG/PNG.
- Up to 20 MB per reference, 200 MB backup import.
- No Neon resources or paid service configuration required.
- Mobile layout checked in desktop emulation; physical iPad testing is still pending.

Source is in GitHub; reference images and exported personal libraries are not part of the repository.

## Clipboard upgrade — October 30, 2026

Added direct Ctrl+V / Command+V import while a board is open. Clipboard image files are automatically named and go through the same validation and IndexedDB importer as drops and chosen files. Paste in form fields and dialogs is preserved. Multiple clipboard image entries are supported when provided by the browser. No clipboard polling, new permissions, external API, or paid service was introduced.

Live browser checks passed for PNG clipboard paste with Ctrl+V, saved image persistence after reload, no-image feedback, ordinary text paste in the rename dialog, and file chooser import. Automated regression checks cover multiple clipboard entries, file-list fallback, scope guards, board switching during import, invalid/oversized files, and drop-handler import. A physical Windows Snipping Tool capture and browser context-menu Copy Image were not separately exercised; their clipboard image payload is supported by the same paste handler.

## Session planner and image cycling — October 30, 2026

Request `a71c8136-1725-43ca-a510-78b079954854`: implemented all-reference defaults, editable reference rounds and seconds per reference, a calculated session summary, total-duration planning, and image recycling. Three modes support count + time each, total + time each, and total + count. Shuffled cycles use every image before repeating, avoiding immediate boundary repeats when multiple images exist. A shorter final round fills non-divisible total-duration plans exactly. Drawing time excludes pauses; skipped rounds end early.

Seventeen automated checks passed. Live browser checks verified board-count defaults, 10 minutes at 30 seconds = 20 rounds with only 2 images, cycling into round 3, total + count calculation, and a 1-minute session at 45 seconds ending with a 15-second final round. Reference title saving, persistence, cancellation, session display, and backup round trip were verified in the preceding release; the owner also confirmed clipboard operation.
