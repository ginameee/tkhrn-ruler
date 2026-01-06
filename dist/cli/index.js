#!/usr/bin/env node

// src/cli/index.ts
import { program } from "commander";
import { spawn as spawn2 } from "child_process";
import pc2 from "picocolors";

// src/cli/commands/init.ts
import { spawn } from "child_process";
import { existsSync, appendFileSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import pc from "picocolors";

// src/index.ts
var VERSION = "0.1.0";
var REPO = "ginameee/tkhrn-ruler";

// src/cli/commands/init.ts
async function init(options) {
  const cwd = process.cwd();
  console.log(pc.bold("\n\u{1F680} Initializing tkhrn-ruler...\n"));
  if (existsSync(join(cwd, ".ruler"))) {
    console.log(pc.yellow("\u26A0\uFE0F  .ruler directory already exists."));
    console.log(pc.dim('   Use "tkhrn-ruler apply" to apply rules.\n'));
    return;
  }
  console.log(pc.dim("\u2192 Downloading ruleset..."));
  try {
    await runCommand("npx", ["degit", `${REPO}/.ruler`, ".ruler"]);
    console.log(pc.green("\u2713 .ruler directory created"));
  } catch (error) {
    console.error(pc.red("\u2717 Failed to download ruleset"));
    process.exit(1);
  }
  if (!options.skipEnv) {
    console.log(pc.dim("\u2192 Downloading MCP environment template..."));
    try {
      await runCommand("npx", ["degit", `${REPO}/.env.mcp.example`, ".env.mcp.example", "--force"]);
      console.log(pc.green("\u2713 .env.mcp.example created"));
    } catch {
      console.log(pc.yellow("\u26A0\uFE0F  Could not download .env.mcp.example, creating empty template"));
      await createEnvTemplate(cwd);
    }
  }
  if (!options.skipGitignore) {
    updateGitignore(cwd);
  }
  console.log(pc.dim("\u2192 Running ruler init..."));
  try {
    await runCommand("ruler", ["init"], { silent: true });
    console.log(pc.green("\u2713 Ruler initialized"));
  } catch {
    console.log(pc.yellow("\u26A0\uFE0F  ruler not found, skipping ruler init"));
    console.log(pc.dim("   Install ruler: npm install -g @intellectronica/ruler"));
  }
  console.log(pc.bold(pc.green("\n\u2705 tkhrn-ruler initialized successfully!\n")));
  console.log(pc.dim("Next steps:"));
  console.log(pc.dim("  1. Configure MCP tokens in .env.mcp.local"));
  console.log(pc.dim('  2. Run "tkhrn-ruler apply" to apply rules'));
  console.log("");
}
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.silent ? "ignore" : "inherit",
      shell: true
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}
function updateGitignore(cwd) {
  const gitignorePath = join(cwd, ".gitignore");
  const additions = `
# Agent Handover Context
.handover/

# MCP tokens
.env.mcp.local
`;
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, "utf-8");
    if (!content.includes(".handover/")) {
      appendFileSync(gitignorePath, additions);
      console.log(pc.green("\u2713 .gitignore updated"));
    } else {
      console.log(pc.dim("  .gitignore already configured"));
    }
  } else {
    writeFileSync(gitignorePath, additions.trim() + "\n");
    console.log(pc.green("\u2713 .gitignore created"));
  }
}
async function createEnvTemplate(cwd) {
  const template = `# MCP Server Tokens
# Copy this file to .env.mcp.local and add your tokens

# Figma - Design token extraction
FIGMA_ACCESS_TOKEN=

# Notion - Documentation access
NOTION_API_KEY=
`;
  writeFileSync(join(cwd, ".env.mcp.example"), template);
  console.log(pc.green("\u2713 .env.mcp.example created"));
}

// src/cli/index.ts
program.name("tkhrn-ruler").description("Frontend common ruleset CLI for AI agents").version(VERSION);
program.command("init").description("Initialize tkhrn-ruler in current project").option("-i, --interactive", "Interactive mode for selecting options").option("--skip-env", "Skip .env.mcp.example setup").option("--skip-gitignore", "Skip .gitignore modification").action(init);
program.command("apply", { isDefault: false }).description("Apply rules to configured agents (passthrough to ruler)").allowUnknownOption(true).action(() => passthrough("apply"));
program.command("revert").description("Revert applied rules (passthrough to ruler)").allowUnknownOption(true).action(() => passthrough("revert"));
program.arguments("<command> [args...]").allowUnknownOption(true).action((command) => passthrough(command));
function passthrough(command) {
  const args = process.argv.slice(process.argv.indexOf(command));
  console.log(pc2.dim(`\u2192 ruler ${args.join(" ")}`));
  const child = spawn2("ruler", args, {
    stdio: "inherit",
    shell: true
  });
  child.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error(pc2.red("\nError: ruler is not installed."));
      console.error(pc2.dim("Install it with: npm install -g @intellectronica/ruler"));
      process.exit(1);
    }
    console.error(pc2.red(`Error: ${err.message}`));
    process.exit(1);
  });
  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
}
program.parse();
//# sourceMappingURL=index.js.map