# MM | Art School — The Drawing Board

A quiet place to collect references and practice drawing. Buildless HTML, CSS and JavaScript, deployed on Vercel.

## Use it

Open **Runners**, choose images downloaded from your Drive archive, and start a timed session. Create more boards for other studies. Choose 30 seconds to 20 minutes per reference, a reference count, and shuffle or sequential order. Pause, resume, skip, or enter fullscreen while drawing.

On an open board, paste a copied image with **Ctrl+V** (or **⌘+V**). For Windows screenshots, use **Win+Shift+S**, snip the reference, return to the board and paste. The image is named automatically and saved to that board. The import card also accepts dropped image files and **choose files**. Paste works while the board is visible and no text field or dialog is being edited; it does not read clipboard contents in the background or ask for clipboard permissions.

Supported imports: JPG, PNG, WebP, GIF and AVIF, up to 20 MB per image. Convert HEIC to JPG or PNG before importing. References are displayed uncropped in drawing sessions.

## Storage and backups

Images and boards stay in IndexedDB in this browser, on this device, at this site's URL. No images are uploaded to Vercel or committed to GitHub. There is no login, database, automatic Drive import, or cross-device synchronization.

Use **Export backup** regularly and keep the downloaded JSON somewhere safe, such as Drive. **Import backup** restores boards as new copies and preserves existing boards. Backups contain the images themselves and should be treated like the original photos. The import limit is 200 MB per backup.

Browser storage can be cleared or evicted. Keep your original files in Drive. Changing browser, device, or site hostname requires exporting and importing your library.

## Development and hosting

Serve this directory with any static HTTP server. There is no install or build step. Vercel uses the repository root with framework preset Other. `vercel.json` sets basic security headers. Google Fonts supplies display fonts, with local fallback fonts when unavailable.

No paid services, backend credentials, or environment variables are required. Hosting remains subject to the connected account's plan limits. Neon is deferred until a future feature needs shared storage or accounts.

## Release checks

- JavaScript syntax and Git whitespace checks.
- Browser check: create/rename a board, import an image, reload and verify persistence, run/pause/skip a session, export and restore a backup.
- Keep personal reference images out of this public repository.

Clipboard and board-routing regression checks: `node --test tests/clipboard.test.cjs`.
