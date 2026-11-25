function $(id) {
  return document.getElementById(id);
}

let current = {};

chrome.storage.local.get(DEFAULTS, (cfg) => {
  current = Object.assign({}, DEFAULTS, cfg);
  $("enabled").checked = current.enabled;
  $("mirrorMode").value = current.mirrorMode;
  $("mirror").value = current.pinnedMirror || BUNDLED_MIRROR;
  $("extraDomains").value = current.extraDomains;
  renderStatus();
});

function renderStatus() {
  const cfg = Object.assign({}, current);
  const mirror = pickMirror(cfg);
  const state = cfg.enabled === false
    ? "off"
    : cfg.mode === "paused" && (cfg.pauseUntil === 0 || cfg.pauseUntil > Date.now())
      ? "paused"
      : "on";
  let checked = "no health data";
  if (cfg.mirrorStatus && cfg.mirrorStatus.updated) {
    const d = new Date(cfg.mirrorStatus.updated);
    checked = "checked " + d.toLocaleString();
  }
  $("status").textContent =
    "state: " + state + "\nmirror: " + mirror + "\n" + checked +
    "\nversion 2.0.0";
}

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const domains = parseDomains($("extraDomains").value);
  const mirrorMode = $("mirrorMode").value;
  const pinned = normalizeHost($("mirror").value);

  if (domains.length === 0 || (mirrorMode === "manual" && !validHost(pinned))) {
    $("error").textContent = "Enter at least one valid domain. A pinned mirror needs a valid host.";
    return;
  }
  $("error").textContent = "";

  const next = {
    enabled: $("enabled").checked,
    mirrorMode,
    pinnedMirror: mirrorMode === "manual" ? pinned : "",
    extraDomains: domains.join("\n")
  };
  current = Object.assign({}, current, next);
  chrome.storage.local.set(next, renderStatus);

  // Host permissions for the extra domains, granted one at a time from this click.
  // Safari and Firefox for Android have no runtime request, so degrade quietly.
  (async () => {
    if (!chrome.permissions || !chrome.permissions.request) return;
    for (const d of domains) {
      const origins = ["*://" + d + "/*"];
      if (!(await chrome.permissions.contains({ origins }))) {
        await chrome.permissions.request({ origins });
      }
    }
  })();
});

document.querySelectorAll("[data-pause]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const ms = Number(btn.dataset.pause);
    const next = { mode: "paused", pauseUntil: ms === 0 ? 0 : Date.now() + ms };
    current = Object.assign({}, current, next);
    chrome.storage.local.set(next, renderStatus);
  });
});

$("resume").addEventListener("click", () => {
  const next = { mode: "on", pauseUntil: 0 };
  current = Object.assign({}, current, next);
  chrome.storage.local.set(next, renderStatus);
});
