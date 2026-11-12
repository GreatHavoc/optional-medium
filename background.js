// Rewrites navigations to medium.com, its subdomains, or any user-listed extra
// Medium custom domain into <mirror>/<original-url>.
// One dynamic rule is (re)built whenever the config changes; nothing else runs here.

const DEFAULTS = {
  enabled: true,
  mirror: "freedium-mirror.cfd",
  extraDomains: "blog.vijayasekhardeepak.com"
};
const RULE_ID = 1;

function normalizeHost(value) {
  return (value || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

// RE2 (no lookaround), so each host is spelled out and alternated.
function buildRegexFilter(extraDomains) {
  const hosts = ["([a-z0-9-]+\\.)*medium\\.com"];
  const extras = extraDomains
    .split(/[\s,]+/)
    .map(normalizeHost)
    .filter(Boolean)
    .map((d) => "(www\\.)?" + d.replace(/\./g, "\\."));
  const alternation = hosts.concat(extras).join("|");
  return "^https?://(" + alternation + ")/.+";
}

function buildRule(mirror, extraDomains) {
  mirror = normalizeHost(mirror);
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
      // Links clicked *from* the mirror itself load normally, so its
      // "open original article" escape hatch does not bounce straight back.
      excludedInitiatorDomains: [mirror]
    }
  };
}

async function applyConfig() {
  const cfg = Object.assign({}, DEFAULTS, await chrome.storage.local.get(DEFAULTS));
  const mirror = normalizeHost(cfg.mirror);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const addRules =
    cfg.enabled && mirror ? [buildRule(mirror, cfg.extraDomains || "")] : [];
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules
  });
}

chrome.runtime.onInstalled.addListener(applyConfig);
chrome.runtime.onStartup.addListener(applyConfig);
chrome.storage.onChanged.addListener(applyConfig);
