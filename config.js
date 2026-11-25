// Shared defaults, validation and pure rule helpers. Loaded by the popup and
// the background worker; also read by the Node validation tests.

const DEFAULTS = {
  enabled: true,
  mode: "on",              // "on" or "paused"
  pauseUntil: 0,           // epoch ms; 0 means "until browser restart"
  mirrorMode: "auto",      // "auto" or "manual"
  pinnedMirror: "",
  extraDomains: "blog.vijayasekhardeepak.com",
  lastMirror: "freedium-mirror.cfd",
  mirrorStatus: null
};

const BUNDLED_MIRROR = "freedium-mirror.cfd";
const MIRRORS_URL =
  "https://raw.githubusercontent.com/GreatHavoc/optional-medium/main/mirrors.json";
const MIRROR_ALARM = "mirror-check";
const PAUSE_ALARM = "pause-end";
const RULE_ID = 1;

const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

function normalizeHost(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[/?#].*$/, "")
    .replace(/\/+$/, "");
}

function validHost(value) {
  const host = normalizeHost(value);
  return host.length <= 253 && HOST_RE.test(host);
}

function parseDomains(text) {
  const seen = new Set();
  return String(text || "")
    .split(/[\s,]+/)
    .map(normalizeHost)
    .filter((d) => validHost(d))
    .filter((d) => !seen.has(d) && seen.add(d));
}

function buildRegexFilter(extraDomains) {
  const hosts = ["([a-z0-9-]+\\.)*medium\\.com"];
  const extras = parseDomains(extraDomains).map((d) => "(www\\.)?" + d.replace(/\./g, "\\."));
  return "^https?://(" + hosts.concat(extras).join("|") + ")/.+";
}

function pickMirror(cfg) {
  if (cfg.mirrorMode === "manual" && validHost(cfg.pinnedMirror)) {
    return normalizeHost(cfg.pinnedMirror);
  }
  const list = cfg.mirrorStatus && cfg.mirrorStatus.mirrors;
  if (Array.isArray(list)) {
    const up = list.find((m) => m && m.up === true && validHost(m.host));
    if (up) return normalizeHost(up.host);
  }
  if (validHost(cfg.lastMirror)) return normalizeHost(cfg.lastMirror);
  return BUNDLED_MIRROR;
}
