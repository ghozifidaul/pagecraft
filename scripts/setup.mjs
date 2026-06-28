import { spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

function log(...args) {
  console.log("[setup]", ...args);
}

function cmd(program, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(program, args, {
      stdio: "inherit",
      ...opts,
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${program} exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

// 1. Check Node.js version
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 20) {
  console.error("Error: Node.js >= 20 required (found " + process.version + ")");
  process.exit(1);
}
log("Node.js " + process.version + " ✓");

// 2. Install dependencies in parallel
log("Installing dependencies...");
await Promise.all([
  cmd("npm", ["--prefix", "pagecraft-api", "install"], { cwd: root }),
  cmd("npm", ["--prefix", "pagecraft-ui", "install"], { cwd: root }),
]);
log("Dependencies installed ✓");

// 3. Copy .env.example → .env for both packages (idempotent)
for (const pkg of ["pagecraft-api", "pagecraft-ui"]) {
  const example = resolve(root, pkg, ".env.example");
  const env = resolve(root, pkg, ".env");
  if (!existsSync(env)) {
    copyFileSync(example, env);
    log(`Created ${pkg}/.env from .env.example`);
  } else {
    log(`${pkg}/.env already exists, skipping`);
  }
}
log("Environment files ready ✓");

// 4. Apply D1 migrations locally
log("Applying database migrations...");
await cmd("npx", ["wrangler", "d1", "migrations", "apply", "pagecraft-db", "--local"], {
  cwd: resolve(root, "pagecraft-api"),
});
log("Database migrations applied ✓");

// 5. Summary
console.log("");
console.log("  ┌─────────────────────────────────────────────────────┐");
console.log("  │  Setup complete!                                     │");
console.log("  │                                                     │");
console.log("  │  Make sure to set GEMINI_API_KEY in:                 │");
console.log("  │    pagecraft-api/.env                                │");
console.log("  │                                                     │");
console.log("  │  Then run:                                           │");
console.log("  │    make dev                                          │");
console.log("  │                                                     │");
console.log("  │  API → http://localhost:8787                         │");
console.log("  │  UI  → http://localhost:5173                         │");
console.log("  └─────────────────────────────────────────────────────┘");
