const DEFAULTS = {
  enabled: true,
  mirror: "freedium-mirror.cfd",
  extraDomains: "blog.vijayasekhardeepak.com"
};

function $(id) {
  return document.getElementById(id);
}

function parseDomains(text) {
  return (text || "")
    .split(/[\s,]+/)
    .map((d) => d.trim().replace(/^https?:\/\//, "").replace(/\/+$/, ""))
    .filter(Boolean);
}

chrome.storage.local.get(DEFAULTS, (cfg) => {
  $("enabled").checked = cfg.enabled;
  $("mirror").value = cfg.mirror;
  $("extraDomains").value = cfg.extraDomains;
});

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const domains = parseDomains($("extraDomains").value);
  chrome.storage.local.set({
    enabled: $("enabled").checked,
    mirror: $("mirror").value.trim(),
    extraDomains: domains.join("\n")
  });

  // Host permissions for the extra domains, granted one at a time from this click.
  // Safari and Firefox for Android have no runtime permission request, so degrade quietly.
  (async () => {
    if (!chrome.permissions || !chrome.permissions.request) return;
    for (const d of domains) {
      const origins = ["*://" + d + "/*"];
      if (!(await chrome.permissions.contains({ origins }))) {
        await chrome.permissions.request({ origins });
      }
    }
    $("status").textContent = "Saved.";
    setTimeout(window.close, 600);
  })();
});
