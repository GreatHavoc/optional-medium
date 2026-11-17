![Optional Medium](assets/banner.png)

# Optional Medium

**Medium links open on Freedium. The site itself becomes optional.**

A small browser extension that stops Medium from being the only way you read Medium.
Click, paste, or type any Medium link and it opens the same article on a Freedium
mirror — no paywall wall, no login prompt, no "member-only" truncation.

Works on `medium.com`, `medium.com/@author/...` publications, `*.medium.com`
subdomains, and custom-domain Medium blogs.

---

## Where to get it

| Browser | Status | Get it |
|---|---|---|
| Chrome, Edge, Brave, Arc, any Chromium | Available now | [Releases](https://github.com/GreatHavoc/optional-medium/releases/latest) — `.zip`, then Load unpacked (a signed `.crx` is attached whenever it is re-packed) |
| Firefox | Package ready, listing pending | `optional-medium-firefox.zip` on the same release page; the addons.mozilla.org link follows when the listing is live |
| Safari on macOS | Free, your own Mac only | see **Safari on macOS** below |
| Safari on iPhone / iPad | Free, your own device only | see **iPhone and iPad** below |

Chrome Web Store listing is not published yet; the release page is the source of
truth for builds. Each build is the same extension — only the packaging differs.

---

## Install

**Option A — from the build** (works in any Chromium browser)

1. Download `optional-medium.zip` from the [latest release](https://github.com/GreatHavoc/optional-medium/releases/latest)
   and unzip it.
2. Open `chrome://extensions` (or your browser's equivalent) and turn on **Developer mode**.
3. **Load unpacked** → select the unzipped folder.

> A signed `.crx` is faster to install (drag it onto the extensions page) but stock
> Chrome on Windows/macOS blocks `.crx` from outside the Web Store; Chromium forks
> that don't enforce the store accept it. When a `.crx` is attached to the release it
> replaces the two drag steps above.

**Option B — from source**

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
alone, so its own "open original article" button still takes you to Medium. If you
want Medium for one link only, copy the URL and open it in a private window with the
extension disabled, or just disable the redirect in the popup first.

**Pause it.** Click the toolbar icon → untick **Redirect Medium links** → Save.

**Add another custom-domain blog.** Same popup, paste the domain(s) into
**Extra Medium custom domains** (one per line, e.g. `blog.example.com`),
Save, and accept the browser's access prompt for each. From then on those
publications redirect too.

**The mirror went down?** Freedium's domains rotate and the current one may die.
The popup's **Mirror domain** field is the only thing you change — type the working
one (currently `freedium-mirror.cfd`), Save, and links start resolving again.
Nothing else to edit, no rebuild.

---

## Settings

| Field | Default | What it does |
|---|---|---|
| Redirect Medium links | on | Master switch; off = plain browsing, extension inert |
| Mirror domain | `freedium-mirror.cfd` | Which Freedium instance links go to |
| Extra Medium custom domains | *(a starter example)* | Custom-domain Medium blogs to include |

---

## When it doesn't work

**The article shows on Medium anyway.** The link was clicked from the mirror page itself
(by design) or the domain isn't in the list above. Add it in the popup.

**The mirror page is blank or errors.** That mirror is down — change **Mirror domain**
in the popup to the current Freedium domain.

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

- Build assets live on the release page: `optional-medium.crx`, `optional-medium.zip`
  (Chromium store), `optional-medium-firefox.zip` (AMO, contains the
  `background.scripts` fallback Chrome rejects). Repack the `.crx` with the **existing**
  `.pem`, never a fresh key — the extension ID comes from it and a new key wipes every
  user's settings.
- **Firefox (AMO) is not yet submitted** — it needs a Firefox Account login or AMO API
  credentials, which must be run by the account owner:
  1. Sign in at [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) and
     **Submit a New Add-on** → upload `optional-medium-firefox.zip`, list on AMO.
  2. Or from a shell you control: `web-ext sign --channel listed --api-key <user> --api-secret <secret>`
  3. Listing text to paste: name `Optional Medium`; summary "Opens Medium links on a
     Freedium mirror instead of Medium itself."; description = the "Use it" section above;
     categories *Other*, tags `medium freedium paywall redirect`; icon `icon128.png`;
     two screenshots 1280×800. Data collection: none — already declared in the manifest.
  4. Firefox for Android is supported too; `permissions.request` is guarded so the popup
     degrades quietly there.
- `assets/banner.png` is the social preview; upload it in repo Settings → Options →
  Social preview (no API for this).
</details>
