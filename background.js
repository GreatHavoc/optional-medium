// Rewrites navigations to medium.com, its subdomains, or any user-listed extra
// Medium custom domain into <mirror>/<original-url>.
// The mirror comes from a bundled default, a local health file, or a manual pin.
// A failed health fetch never removes the current rule.

if (typeof DEFAULTS === "undefined") importScripts("config.js");

function buildRule(mirror, extraDomains) {
  return {
    id: RULE_ID,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { regexSubstitution: "https://" + mirror + "/\\0" }
    },
    condition: {
      regexFilter: buildRegexFilter(extraDomains),
      resourceTypes: ["main_frame", "sub_frame"],
      // Links clicked from the mirror itself load normally, so its
      // "open original article" escape hatch does not bounce straight back.
      excludedInitiatorDomains: [mirror]
    }
  };
}

async function applyConfig() {
  const cfg = Object.assign({}, DEFAULTS, await chrome.storage.local.get(DEFAULTS));
  const mirror = pickMirror(cfg);
  const paused =
    cfg.mode === "paused" && (cfg.pauseUntil === 0 || cfg.pauseUntil > Date.now());
  const addRules = cfg.enabled && !paused ? [buildRule(mirror, cfg.extraDomains)] : [];

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules
  });

  if (mirror !== cfg.lastMirror) {
    await chrome.storage.local.set({ lastMirror: mirror });
  }
}

async function refreshMirrors() {
  try {
    const res = await fetch(MIRRORS_URL, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !Array.isArray(data.mirrors)) return;
    await chrome.storage.local.set({
      mirrorStatus: { updated: Date.now(), mirrors: data.mirrors }
    });
  } catch (err) {
    // Keep the last known good mirror. No rule change on a failed fetch.
  }
}

async function schedulePauseAlarm() {
  await chrome.alarms.clear(PAUSE_ALARM);
  const cfg = await chrome.storage.local.get({ mode: "on", pauseUntil: 0 });
  if (cfg.mode === "paused" && cfg.pauseUntil > 0) {
    chrome.alarms.create(PAUSE_ALARM, { when: cfg.pauseUntil });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(MIRROR_ALARM, { periodInMinutes: 1440 });
  await refreshMirrors();
  await applyConfig();
});

chrome.runtime.onStartup.addListener(async () => {
  const cfg = await chrome.storage.local.get({ mode: "on", pauseUntil: 0 });
  if (cfg.mode === "paused" && cfg.pauseUntil === 0) {
    await chrome.storage.local.set({ mode: "on" });
  } else {
    await applyConfig();
  }
  await schedulePauseAlarm();
  await refreshMirrors();
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.mode || changes.pauseUntil) await schedulePauseAlarm();
  await applyConfig();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === MIRROR_ALARM) {
    await refreshMirrors();
  } else if (alarm.name === PAUSE_ALARM) {
    await chrome.storage.local.set({ mode: "on", pauseUntil: 0 });
  }
});
