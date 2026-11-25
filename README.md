![Optional Medium](assets/banner.png)

# Optional Medium

**Medium links open on Freedium. The site itself becomes optional.**

A small browser extension that stops Medium from being the only way you read Medium.
Click, paste, or type any Medium link and it opens the same article on a Freedium
mirror. You get the full text without a login or a membership prompt.

Works on `medium.com`, `medium.com/@author/...` publications, `*.medium.com`
subdomains, and custom-domain Medium blogs.

---

## Where to get it

| Browser | Status | Get it |
|---|---|---|
| Chrome, Edge, Brave, Arc, any Chromium | Available now | [Releases](https://github.com/GreatHavoc/optional-medium/releases/latest): download the zip, unzip it, then Load unpacked |
| Firefox | Live on Firefox Add-ons | [Install from AMO](https://addons.mozilla.org/en-US/firefox/addon/optional-medium/) (version 1.0.0) |
| Safari on macOS | Free, your own Mac only | see **Safari on macOS** below |
| Safari on iPhone / iPad | Free, your own device only | see **iPhone and iPad** below |

Chrome Web Store listing is not published yet; the release page is the source of
truth for builds. Each build is the same extension — only the packaging differs.

---

## Install

**Option A: from the build** (works in any Chromium browser)

1. Download `optional-medium.zip` from the [latest release](https://github.com/GreatHavoc/optional-medium/releases/latest)
   and unzip it.
2. Open `chrome://extensions` (or your browser's equivalent) and turn on **Developer mode**.
3. **Load unpacked** → select the unzipped folder.

> A signed `.crx` is faster to install (drag it onto the extensions page) but stock
> Chrome on Windows/macOS blocks `.crx` from outside the Web Store; Chromium forks
> that don't enforce the store accept it. When a `.crx` is attached to the release it
> replaces the two drag steps above.

**Option B: from source**

1. Download and unzip the [release zip](https://github.com/GreatHavoc/optional-medium/releases/latest),
   or `git clone` this repo.
2. `chrome://extensions` → **Developer mode** on → **Load unpacked** → select the folder.
3. Reload the extensions page if you edit anything later.

Done. No configuration needed — it redirects on install.

---

## Use it

Just browse normally. Any Medium link — from Google, X, a newsletter, your
bookmarks — opens on the mirror instead.

**Reading normally.** The article loads on the mirror. Text is complete and free.

**Want the original anyway?** Links clicked *from inside* the mirror page are left
alone, so its own "open original article" button still takes you to Medium. For a
link found elsewhere, pause the extension for 10 minutes, read the article on
Medium, then click Resume.

**Pause it.** Click the toolbar icon and choose 10 min, 1 hour, or Restart. The
redirect comes back when the timer ends, or on the next browser start for Restart.
Resume turns it back on immediately.

**Add another custom-domain blog.** Same popup, paste the domain(s) into
**Extra Medium custom domains** (one per line, e.g. `blog.example.com`),
Save, and accept the browser's access prompt for each. From then on those
publications redirect too.

**The mirror went down?** A daily check probes the known Freedium mirrors and writes
the healthy ones to `mirrors.json`. The extension picks the first healthy mirror
automatically. If every mirror is down, it keeps the last one it used. To override
the choice, set **Mirror mode** to Manual and type a working host in **Mirror domain**.

---

## Settings

| Field | Default | What it does |
|---|---|---|
| Redirect Medium links | on | Master switch; off = plain browsing, extension inert |
| Pause | none | Pause for 10 min, 1 hour, or until browser restart |
| Mirror mode | Automatic | Automatic uses the health list. Manual pins one host |
| Mirror domain | `freedium-mirror.cfd` | Pinned host, used only in Manual mode |
| Extra Medium custom domains | *(a starter example)* | Custom-domain Medium blogs to include |

---

## When it doesn't work

**The article shows on Medium anyway.** The link was clicked from the mirror page itself
(by design) or the domain isn't in the list above. Add it in the popup.

**The mirror page is blank or errors.** Set **Mirror mode** to Manual and type a
working Freedium host in the popup. Automatic mode switches back on the next daily
check once a mirror is healthy again.

**Nothing redirects after a browser update.** `chrome://extensions` → hit the reload
icon on the card; the browser sometimes drops extension state across updates.

**I changed the code and nothing happened.** Same reload button — DNR rules rebuild on
reload.

---

## Safari on macOS

Free to build and run on **your own Mac**. Public distribution is not possible
this way — a signed dev build only counts as signed on the machine that made it,
and every other user has to run the same tool.

1. Install Xcode (the full app) and sign in with a **free** Apple ID in
   Xcode → Settings → Accounts → **Manage Certificates…** → add
   **Apple Development**. No paid membership.
2. Get PortKit, which converts a Chrome extension into a working Safari one and
   rewrites the parts Safari refuses:
   ```
   ./chrome-to-safari.sh /path/to/medium-to-freedium
   ```
   Add `--analyze` first to see what it would change without building.
3. It converts, builds, signs, installs the wrapper app to `/Applications` and
   opens Safari. Enable the extension in Safari → Settings → Extensions.
4. Free certificates expire after about a year — re-run the same command to
   re-sign.

PortKit strips things Chrome-specific, drops permissions Safari has no
equivalent for, and routes `storage.sync` to `storage.local`. This extension is
already `declarativeNetRequest`-based, which is the part WebKit supports, so
nothing about the redirect changes.

---

## iPhone and iPad

Free to build and install on **your own device**. Cannot be shared with anyone
else — an IPA signed with a free Apple ID works only for that Apple ID.

1. Build the wrapper app. Without a Mac, use xtool (free, MIT) on Windows/Linux:
   ```
   xtool dev     # or build, then sign
   ```
   The output is an `.ipa`.
2. Install it with Sideloadly (free, runs on Windows, no jailbreak):
   connect the iPhone, pick the `.ipa`, sign in with your free Apple ID.
3. On the iPhone: Settings → General → VPN & Device Management → trust your
   developer certificate, then Settings → Safari → Extensions → turn
   **Optional Medium** on.

Two limits of the free route, both from Apple: a maximum of **3 apps** per free
Apple ID, and the certificate expires after **7 days**, so you reinstall weekly.
The extension itself works exactly as on desktop once it's on.

To ship to other people's iPhones you need the Apple Developer Program
($99/yr), then Apple's own browser-based extension packager → App Store Connect.
There is no free path for that step.

---

<details>
<summary>Maintainer notes</summary>

- Build assets on the release page: `optional-medium.zip` (Chromium) and
  `optional-medium-firefox.zip` (AMO). Both packages must include `config.js`. The
  Firefox manifest uses `background.scripts: ["config.js", "background.js"]`; Chrome
  loads `config.js` through `importScripts` from the service worker. To make a `.crx`,
  pack the source in chrome://extensions with the existing `.pem`. A new key changes
  the extension ID and wipes saved settings.
- Mirror health: `mirrors.json` and `scripts/probe_mirrors.py` are at the repo root.
  `.github/workflows/probe-mirrors.yml` probes daily and commits changes. The extension
  reads the file from raw.githubusercontent.com and keeps the last good mirror if the
  fetch fails.
- Tests: `node tests/config.test.cjs` and `python tests/test_probe_mirrors.py`.
- Firefox: version 1.0.0 is public on AMO after automated screening on 20 Nov 2026.
  Mozilla may review it by hand later. The listing uses the "Use it" text, the
  `icon128.png` icon, two 1280x800 screenshots, tags `medium freedium paywall redirect`,
  no data collection, and the Contributions URL https://github.com/sponsors/GreatHavoc.
  Firefox for Android is included; the popup guards `permissions.request` there.
- `assets/banner.png` is the social preview; upload it in repo Settings → Options →
  Social preview (no API for this).
</details>
