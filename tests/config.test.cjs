const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "..", "config.js"), "utf8"),
  ctx
);

// Values made inside the vm realm have a different Array prototype, so bring
// arrays back into the host realm before comparing them.
const domains = (text) => Array.from(ctx.parseDomains(text));
const bundled = () => vm.runInContext("BUNDLED_MIRROR", ctx);

const run = (name, fn) => {
  try {
    fn();
    console.log("PASS", name);
  } catch (err) {
    console.error("FAIL", name, "-", err.message);
    process.exitCode = 1;
  }
};

run("simple host accepted", () => {
  assert.deepStrictEqual(domains("blog.example.com"), ["blog.example.com"]);
});

run("url normalised to host", () => {
  assert.deepStrictEqual(domains("https://blog.example.com/path"), ["blog.example.com"]);
});

run("regex metacharacter rejected", () => {
  assert.deepStrictEqual(domains("foo|bar.com"), []);
});

run("wildcard rejected", () => {
  assert.deepStrictEqual(domains("*.example.com"), []);
});

run("empty input stays empty so caller keeps default", () => {
  assert.deepStrictEqual(domains("   "), []);
});

run("duplicates collapsed", () => {
  assert.deepStrictEqual(domains("blog.example.com, blog.example.com"), ["blog.example.com"]);
});

run("regex filter compiles and includes only valid hosts", () => {
  const pattern = ctx.buildRegexFilter("blog.example.com, foo|bar.com");
  assert.match(pattern, /medium\\\.com/);
  assert.match(pattern, /blog\\\.example\\\.com/);
  assert.doesNotMatch(pattern, /foo\|bar/);
  assert.doesNotThrow(() => new RegExp(pattern));
});

run("manual pin overrides health list", () => {
  const cfg = {
    mirrorMode: "manual",
    pinnedMirror: "pinned.example.com",
    mirrorStatus: { mirrors: [{ host: "healthy.example.com", up: true }] },
    lastMirror: bundled()
  };
  assert.strictEqual(ctx.pickMirror(cfg), "pinned.example.com");
});

run("first healthy mirror wins in auto mode", () => {
  const cfg = {
    mirrorMode: "auto",
    pinnedMirror: "",
    mirrorStatus: {
      mirrors: [
        { host: "down.example.com", up: false },
        { host: "healthy.example.com", up: true }
      ]
    },
    lastMirror: bundled()
  };
  assert.strictEqual(ctx.pickMirror(cfg), "healthy.example.com");
});

run("last known mirror used when health data is missing", () => {
  assert.strictEqual(
    ctx.pickMirror({ mirrorMode: "auto", mirrorStatus: null, lastMirror: "last.example.com" }),
    "last.example.com"
  );
});

run("bundled mirror used when nothing else is valid", () => {
  assert.strictEqual(
    ctx.pickMirror({ mirrorMode: "auto", mirrorStatus: null, lastMirror: "" }),
    bundled()
  );
});
