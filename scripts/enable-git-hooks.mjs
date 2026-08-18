import { spawnSync } from "node:child_process";

if (process.env.CI) {
  console.log("Skipping Git hook setup in CI.");
  process.exit(0);
}

const insideWorkTree = spawnSync(
  "git",
  ["rev-parse", "--is-inside-work-tree"],
  { encoding: "utf8" },
);

if (
  insideWorkTree.status !== 0 ||
  insideWorkTree.stdout.trim() !== "true"
) {
  console.log("Skipping Git hook setup outside a Git worktree.");
  process.exit(0);
}

const configureHooks = spawnSync(
  "git",
  ["config", "--local", "core.hooksPath", ".githooks"],
  { stdio: "inherit" },
);

if (configureHooks.status !== 0) {
  console.error("Unable to configure the repository Git hooks path.");
  process.exit(configureHooks.status ?? 1);
}

console.log("Git hooks enabled from .githooks.");
