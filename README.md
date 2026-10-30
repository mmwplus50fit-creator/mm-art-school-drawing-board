# MM | Art School — The Drawing Board

A quiet place to collect references and practice drawing. Buildless HTML, CSS and JavaScript, deployed on Vercel.

## Use it

Open **Runners**, choose images downloaded from your Drive archive, and start a timed session. Create more boards for other studies. Reference rounds initially default to all images in the board. Choose a reference count and seconds per image, a total duration and seconds per image, or a total duration and reference count. The live summary shows the calculated drawing time and any repeated rounds. Pause, resume, skip, or enter fullscreen while drawing.

Sessions cycle through images when more rounds than available images are needed. Shuffle uses every image once per pass and avoids an immediate repeat between passes when there is more than one image. For a total duration that is not divisible by the time per reference, the final round is shorter so the planned drawing time matches the target. Pauses add wall-clock time; skipping advances early. Choose 1–1200 seconds per reference; total-duration plans allow up to 480 minutes and 10,000 rounds.

On an open board, paste a copied image with **Ctrl+V** (or **⌘+V**). For Windows screenshots, use **Win+Shift+S**, snip the reference, return to the board and paste. The image is named automatically and saved to that board. The import card also accepts dropped image files and **choose files**. Paste works while the board is visible and no text field or dialog is being edited; it does not read clipboard contents in the background or ask for clipboard permissions.

Supported imports: JPG, PNG, WebP, GIF and AVIF, up to 20 MB per image. Convert HEIC to JPG or PNG before importing. References are displayed uncropped in drawing sessions.

Click or tap an image's title beneath its thumbnail to edit it. Titles appear in drawing sessions and are retained in backups. To rename an entire board, open it and choose **Rename**.

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

Regression checks: `node --test tests/*.test.cjs`.
