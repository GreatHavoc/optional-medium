# Optional Medium

Makes the Medium site optional: links to `medium.com`, `*.medium.com`, or a
custom-domain Medium publication open on a Freedium mirror instead:

```
https://medium.com/@user/post              → https://freedium-mirror.cfd/https://medium.com/@user/post
https://blog.vijayasekhardeepak.com/<slug> → https://freedium-mirror.cfd/https://blog.vijayasekhardeepak.com/<slug>
```

Covers every way a link can be opened: address bar, paste, click, Ctrl-click,
"open in new tab/window", and links inside Medium pages.

## Install

**Direct install from a store** — the only one-click path, see the table below.
**Manual (works everywhere):**

1. Open `chrome://extensions` (or the browser's equivalent).
2. Turn on **Developer mode**.
3. Either **Load unpacked** → pick this folder, or drag `optional-medium.crx`
   from the [Releases](../../releases) page onto the extensions page.

> Note: stock Chrome on Windows/macOS blocks installing a `.crx` from outside the
> Web Store, so on those the "Load unpacked" route is the reliable one. Some
> Chromium forks accept the drag-drop.

Pre-packed `optional-medium.crx` and `optional-medium.zip` are attached to
the latest GitHub Release. The `.pem` signing key is deliberately not in this repo.

### Where one-click install is actually possible

| Route | Installs in | Cost |
|---|---|---|
| Chrome Web Store | any Chromium browser | one-time dev fee, review |
| Edge Add-ons | Edge | free |

## Settings (toolbar-icon popup)

- **Enable/disable** the redirect.
- **Mirror domain** — default `freedium-mirror.cfd`. Freedium's mirror domains rotate
  (`freedium.cfd` is currently dead), so this is editable without touching the code.
- **Extra Medium custom domains** — comma or newline separated, one per line.
  `medium.com` and its subdomains are always covered. Saving the popup asks the
  browser for host access to each listed domain.

Links clicked *from the mirror itself* are not redirected, so the mirror's
"open original article" link still works.

## Pack it

- **Store submission:** zip the folder contents (manifest.json at the archive root) and
  upload at `chrome.google.com/webstore/dev/dashboard`.
- **Sideload / distribution:** `chrome://extensions` → Developer mode → **Pack extension…**
  → root: this folder, key: `../medium-to-freedium.pem` (leave blank on the first pack to
  generate it — the name of the key file doesn't matter, only its contents). Output:
  `optional-medium.crx`. Drag the `.crx` onto the extensions page.
  Re-packing without the same `.pem` changes the extension ID and wipes saved settings.

## Icons

`icon.svg` is the source; `icon16/32/48/128.png` were rasterised from it with
`@resvg/resvg-js`. Chrome Web Store requires PNG, so the SVGs cannot be used
directly in the manifest.
