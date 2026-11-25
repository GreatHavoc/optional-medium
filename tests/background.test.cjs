const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert");

const root = path.join(__dirname, "..");
const ctx = {
  console,
  fetch: async () => ({
    ok: true,
    json: async () => ({
      mirrors: [{ host: "freedium-mirror.cfd", up: true, failCount: 0 }]
    })
  })
};

const state = {
  rules: [],
  storage: {},
  installed: null,
  changed: null
};

ctx.chrome = {
  runtime: {
    onInstalled: { addListener: (fn) => { state.installed = fn; } },
    onStartup: { addListener: () => {} }
  },
  storage: {
    local: {
      get: async (defaults) => ({ ...defaults, ...state.storage }),
      set: async (values) => {
        Object.assign(state.storage, values);
        // Chrome fires onChanged without waiting for listeners to finish.
        if (state.changed) Promise.resolve(state.changed(values)).catch(() => {});
      }
    },
    onChanged: { addListener: (fn) => { state.changed = fn; } }
  },
  declarativeNetRequest: {
    getDynamicRules: async () => state.rules.slice(),
    updateDynamicRules: async ({ removeRuleIds, addRules }) => {
      // Widen the window the way a real async browser API does.
      await new Promise((resolve) => setImmediate(resolve));
      state.rules = state.rules.filter((r) => !removeRuleIds.includes(r.id));
      for (const rule of addRules) {
        if (state.rules.some((r) => r.id === rule.id)) {
          throw new Error(`Rule with id ${rule.id} does not have a unique ID.`);
        }
        state.rules.push(rule);
      }
    }
  },
  alarms: {
    create: () => {},
    clear: async () => true,
    onAlarm: { addListener: () => {} }
  }
};

vm.createContext(ctx);
for (const file of ["config.js", "background.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
}

(async () => {
  assert.ok(state.installed, "onInstalled listener registered");
  assert.ok(state.changed, "storage.onChanged listener registered");

  // Reproduce the race: install fires applyConfig, and the mirror refresh
  // writes storage which fires onChanged with another applyConfig.
  await Promise.all([state.installed(), state.installed()]);

  assert.strictEqual(state.rules.length, 1, "exactly one dynamic rule exists");
  assert.strictEqual(state.rules[0].id, 1, "rule id is 1");
  console.log("PASS concurrent applyConfig keeps one rule with id 1");
})().catch((err) => {
  console.error("FAIL", err.message);
  process.exitCode = 1;
});
