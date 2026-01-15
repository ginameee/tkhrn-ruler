#!/usr/bin/env node

// src/cli/index.ts
import { program } from "commander";
import { spawn as spawn3 } from "child_process";
import pc3 from "picocolors";

// src/cli/commands/init.ts
import { spawn } from "child_process";
import { existsSync, appendFileSync, readFileSync, writeFileSync, readdirSync, renameSync, mkdirSync, cpSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import pc from "picocolors";

// src/index.ts
var VERSION = "0.1.0";
var REPO = "ginameee/tkhrn-ruler";

// src/cli/commands/init.ts
async function init(options) {
  const cwd = process.cwd();
  const rulerDir = join(cwd, ".ruler");
  const rulerExists = existsSync(rulerDir);
  console.log(pc.bold("\n\u{1F680} Initializing tkhrn-ruler...\n"));
  console.log(pc.dim("\u2192 Downloading ruleset..."));
  try {
    if (rulerExists) {
      const tempDir = join(tmpdir(), `tkhrn-ruler-${Date.now()}`);
      mkdirSync(tempDir, { recursive: true });
      await runCommand("npx", ["degit", `${REPO}/.ruler`, tempDir, "--force"]);
      const downloadedFiles = readdirSync(tempDir);
      let backedUp = 0;
      let added = 0;
      for (const file of downloadedFiles) {
        const targetPath = join(rulerDir, file);
        const sourcePath = join(tempDir, file);
        if (existsSync(targetPath) && file.endsWith(".md")) {
          const bakName = file.replace(/\.md$/, ".bak.md");
          const bakPath = join(rulerDir, bakName);
          renameSync(targetPath, bakPath);
          backedUp++;
          console.log(pc.yellow(`  \u21B3 Backed up ${file} \u2192 ${bakName}`));
        }
        cpSync(sourcePath, targetPath, { recursive: true });
        added++;
      }
      console.log(pc.green(`\u2713 .ruler directory updated (${added} files added, ${backedUp} backed up)`));
    } else {
      await runCommand("npx", ["degit", `${REPO}/.ruler`, ".ruler"]);
      console.log(pc.green("\u2713 .ruler directory created"));
    }
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

// src/cli/commands/apply.ts
import { spawn as spawn2 } from "child_process";
import { existsSync as existsSync2, readdirSync as readdirSync2, copyFileSync, mkdirSync as mkdirSync2, readFileSync as readFileSync2, renameSync as renameSync2 } from "fs";
import { join as join2, basename as basename2, extname } from "path";
import pc2 from "picocolors";
import { parse } from "@iarna/toml";
var DEFAULT_COMMAND_PATHS = {
  cursor: ".cursor/commands",
  claude: ".claude/commands",
  codex: ".codex/commands"
};
var DEFAULT_SKILLS_PATHS = {
  cursor: ".cursor/skills",
  claude: ".claude/skills",
  codex: ".codex/skills"
};
var DEFAULT_SUBAGENTS_PATHS = {
  cursor: ".cursor/subagents",
  claude: ".claude/commands",
  // Claude treats subagents as commands
  codex: ".codex/subagents"
};
async function apply(options = {}) {
  const cwd = process.cwd();
  const rulerPath = join2(cwd, ".ruler");
  const rulerTomlPath = join2(rulerPath, "ruler.toml");
  if (!existsSync2(rulerPath)) {
    console.error(pc2.red("Error: .ruler directory not found."));
    console.error(pc2.dim('Run "tkhrn-ruler init" first.'));
    process.exit(1);
  }
  let config = {};
  if (existsSync2(rulerTomlPath)) {
    try {
      const tomlContent = readFileSync2(rulerTomlPath, "utf-8");
      config = parse(tomlContent);
    } catch (error) {
      console.warn(pc2.yellow("Warning: Could not parse ruler.toml"));
    }
  }
  console.log(pc2.dim("\u2192 Running ruler apply..."));
  await runRulerApply(options.nested);
  console.log(pc2.dim("\n\u2192 Copying custom commands..."));
  await copyCommands(cwd, config, options.nested);
  console.log(pc2.dim("\n\u2192 Copying skills..."));
  await copySkills(cwd, config, options.nested);
  console.log(pc2.dim("\n\u2192 Copying subagents..."));
  await copySubagents(cwd, config, options.nested);
  console.log(pc2.bold(pc2.green("\n\u2705 Rules, commands, skills, and subagents applied successfully!\n")));
}
async function runRulerApply(nested) {
  return new Promise((resolve, reject) => {
    const args = ["apply"];
    if (nested) {
      args.push("--nested");
    }
    const child = spawn2("ruler", args, {
      stdio: "inherit",
      shell: true
    });
    child.on("error", (err) => {
      if (err.code === "ENOENT") {
        console.error(pc2.red("\nError: ruler is not installed."));
        console.error(pc2.dim("Install it with: npm install -g @intellectronica/ruler"));
        reject(err);
        return;
      }
      reject(err);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ruler apply failed with code ${code}`));
      }
    });
  });
}
async function copyCommands(cwd, config, nested) {
  const rulerCommandsPath = join2(cwd, ".ruler", "commands");
  if (!existsSync2(rulerCommandsPath)) {
    console.log(pc2.dim("  No .ruler/commands directory found, skipping command copy"));
    return;
  }
  const agents = config.agents || {};
  const defaultAgents = ["cursor", "claude", "codex"];
  for (const agentName of defaultAgents) {
    const agentConfig = agents[agentName] || {};
    if (agentConfig.enabled === false) {
      continue;
    }
    const commandPath = agentConfig.command_path || DEFAULT_COMMAND_PATHS[agentName];
    if (!commandPath) {
      console.warn(pc2.yellow(`  Warning: No command_path configured for ${agentName}, skipping`));
      continue;
    }
    const destPath = join2(cwd, commandPath);
    try {
      copyCommandsWithBackup(rulerCommandsPath, destPath);
      console.log(pc2.green(`  \u2713 Copied commands to ${agentName} \u2192 ${commandPath}`));
    } catch (error) {
      console.error(pc2.red(`  \u2717 Failed to copy commands to ${agentName}: ${error}`));
    }
  }
  if (nested) {
    await copyNestedCommands(cwd, config);
  }
}
async function copyNestedCommands(cwd, config) {
  const nestedRulers = findNestedRulers(cwd);
  for (const nestedRulerPath of nestedRulers) {
    const nestedCommandsPath = join2(nestedRulerPath, "commands");
    if (!existsSync2(nestedCommandsPath)) {
      continue;
    }
    const relativePath = nestedRulerPath.replace(cwd, "").replace(/\\.ruler$/, "").replace(/^\//, "").replace(/^\\/, "");
    const nestedProjectPath = relativePath ? join2(cwd, relativePath) : cwd;
    const agents = config.agents || {};
    const defaultAgents = ["cursor", "claude", "codex"];
    for (const agentName of defaultAgents) {
      const agentConfig = agents[agentName] || {};
      if (agentConfig.enabled === false) {
        continue;
      }
      const commandPath = agentConfig.command_path || DEFAULT_COMMAND_PATHS[agentName];
      if (!commandPath) {
        continue;
      }
      const destPath = join2(nestedProjectPath, commandPath);
      try {
        copyCommandsWithBackup(nestedCommandsPath, destPath);
        console.log(pc2.green(`  \u2713 Copied nested commands to ${agentName} in ${relativePath} \u2192 ${commandPath}`));
      } catch (error) {
        console.error(pc2.red(`  \u2717 Failed to copy nested commands to ${agentName} in ${relativePath}: ${error}`));
      }
    }
  }
}
function findNestedRulers(rootPath, currentPath = rootPath, results = []) {
  try {
    const entries = readdirSync2(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".ruler") {
        continue;
      }
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
        continue;
      }
      const fullPath = join2(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === ".ruler" && fullPath !== join2(rootPath, ".ruler")) {
          results.push(fullPath);
        } else {
          findNestedRulers(rootPath, fullPath, results);
        }
      }
    }
  } catch (error) {
  }
  return results;
}
function copyCommandsWithBackup(source, dest) {
  if (!existsSync2(dest)) {
    mkdirSync2(dest, { recursive: true });
  }
  const entries = readdirSync2(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = join2(source, entry.name);
    const destPath = join2(dest, entry.name);
    if (entry.isDirectory()) {
      copyCommandsWithBackup(sourcePath, destPath);
    } else {
      if (entry.name === ".gitkeep") {
        continue;
      }
      if (existsSync2(destPath)) {
        const fileName = basename2(destPath, extname(destPath));
        const fileExt = extname(destPath);
        const backupPath = join2(dest, `${fileName}.bak${fileExt}`);
        try {
          renameSync2(destPath, backupPath);
          console.log(pc2.dim(`    \u2192 Backed up existing file: ${entry.name} \u2192 ${basename2(backupPath)}`));
        } catch (error) {
          console.warn(pc2.yellow(`    \u26A0 Could not backup ${entry.name}, skipping...`));
          continue;
        }
      }
      copyFileSync(sourcePath, destPath);
    }
  }
}
async function copySkills(cwd, config, nested) {
  const rulerSkillsPath = join2(cwd, ".ruler", "skills");
  if (!existsSync2(rulerSkillsPath)) {
    console.log(pc2.dim("  No .ruler/skills directory found, skipping skills copy"));
    return;
  }
  const agents = config.agents || {};
  const defaultAgents = ["cursor", "claude", "codex"];
  for (const agentName of defaultAgents) {
    const agentConfig = agents[agentName] || {};
    if (agentConfig.enabled === false) {
      continue;
    }
    const skillsPath = agentConfig.skills_path || DEFAULT_SKILLS_PATHS[agentName];
    if (!skillsPath) {
      console.warn(pc2.yellow(`  Warning: No skills_path configured for ${agentName}, skipping`));
      continue;
    }
    const destPath = join2(cwd, skillsPath);
    try {
      copyCommandsWithBackup(rulerSkillsPath, destPath);
      console.log(pc2.green(`  \u2713 Copied skills to ${agentName} \u2192 ${skillsPath}`));
    } catch (error) {
      console.error(pc2.red(`  \u2717 Failed to copy skills to ${agentName}: ${error}`));
    }
  }
  if (nested) {
    await copyNestedSkills(cwd, config);
  }
}
async function copyNestedSkills(cwd, config) {
  const nestedRulers = findNestedRulers(cwd);
  for (const nestedRulerPath of nestedRulers) {
    const nestedSkillsPath = join2(nestedRulerPath, "skills");
    if (!existsSync2(nestedSkillsPath)) {
      continue;
    }
    const relativePath = nestedRulerPath.replace(cwd, "").replace(/\\.ruler$/, "").replace(/^\//, "").replace(/^\\/, "");
    const nestedProjectPath = relativePath ? join2(cwd, relativePath) : cwd;
    const agents = config.agents || {};
    const defaultAgents = ["cursor", "claude", "codex"];
    for (const agentName of defaultAgents) {
      const agentConfig = agents[agentName] || {};
      if (agentConfig.enabled === false) {
        continue;
      }
      const skillsPath = agentConfig.skills_path || DEFAULT_SKILLS_PATHS[agentName];
      if (!skillsPath) {
        continue;
      }
      const destPath = join2(nestedProjectPath, skillsPath);
      try {
        copyCommandsWithBackup(nestedSkillsPath, destPath);
        console.log(pc2.green(`  \u2713 Copied nested skills to ${agentName} in ${relativePath} \u2192 ${skillsPath}`));
      } catch (error) {
        console.error(pc2.red(`  \u2717 Failed to copy nested skills to ${agentName} in ${relativePath}: ${error}`));
      }
    }
  }
}
async function copySubagents(cwd, config, nested) {
  const rulerSubagentsPath = join2(cwd, ".ruler", "subagents");
  if (!existsSync2(rulerSubagentsPath)) {
    console.log(pc2.dim("  No .ruler/subagents directory found, skipping subagents copy"));
    return;
  }
  const agents = config.agents || {};
  const defaultAgents = ["cursor", "claude", "codex"];
  for (const agentName of defaultAgents) {
    const agentConfig = agents[agentName] || {};
    if (agentConfig.enabled === false) {
      continue;
    }
    const subagentsPath = agentConfig.subagents_path || DEFAULT_SUBAGENTS_PATHS[agentName];
    if (!subagentsPath) {
      console.warn(pc2.yellow(`  Warning: No subagents_path configured for ${agentName}, skipping`));
      continue;
    }
    const destPath = join2(cwd, subagentsPath);
    try {
      copyCommandsWithBackup(rulerSubagentsPath, destPath);
      console.log(pc2.green(`  \u2713 Copied subagents to ${agentName} \u2192 ${subagentsPath}`));
    } catch (error) {
      console.error(pc2.red(`  \u2717 Failed to copy subagents to ${agentName}: ${error}`));
    }
  }
  if (nested) {
    await copyNestedSubagents(cwd, config);
  }
}
async function copyNestedSubagents(cwd, config) {
  const nestedRulers = findNestedRulers(cwd);
  for (const nestedRulerPath of nestedRulers) {
    const nestedSubagentsPath = join2(nestedRulerPath, "subagents");
    if (!existsSync2(nestedSubagentsPath)) {
      continue;
    }
    const relativePath = nestedRulerPath.replace(cwd, "").replace(/\\.ruler$/, "").replace(/^\//, "").replace(/^\\/, "");
    const nestedProjectPath = relativePath ? join2(cwd, relativePath) : cwd;
    const agents = config.agents || {};
    const defaultAgents = ["cursor", "claude", "codex"];
    for (const agentName of defaultAgents) {
      const agentConfig = agents[agentName] || {};
      if (agentConfig.enabled === false) {
        continue;
      }
      const subagentsPath = agentConfig.subagents_path || DEFAULT_SUBAGENTS_PATHS[agentName];
      if (!subagentsPath) {
        continue;
      }
      const destPath = join2(nestedProjectPath, subagentsPath);
      try {
        copyCommandsWithBackup(nestedSubagentsPath, destPath);
        console.log(pc2.green(`  \u2713 Copied nested subagents to ${agentName} in ${relativePath} \u2192 ${subagentsPath}`));
      } catch (error) {
        console.error(pc2.red(`  \u2717 Failed to copy nested subagents to ${agentName} in ${relativePath}: ${error}`));
      }
    }
  }
}

// src/cli/index.ts
program.name("tkhrn-ruler").description("Frontend common ruleset CLI for AI agents").version(VERSION);
program.command("init").description("Initialize tkhrn-ruler in current project").option("-i, --interactive", "Interactive mode for selecting options").option("--skip-env", "Skip .env.mcp.example setup").option("--skip-gitignore", "Skip .gitignore modification").action(init);
program.command("apply", { isDefault: false }).description("Apply rules and copy custom commands to configured agents").option("--nested", "Include nested .ruler directories").allowUnknownOption(true).action(async () => {
  const nested = process.argv.includes("--nested");
  await apply({ nested });
});
program.command("revert").description("Revert applied rules (passthrough to ruler)").allowUnknownOption(true).action(() => passthrough("revert"));
program.arguments("<command> [args...]").allowUnknownOption(true).action((command) => passthrough(command));
function passthrough(command) {
  const args = process.argv.slice(process.argv.indexOf(command));
  console.log(pc3.dim(`\u2192 ruler ${args.join(" ")}`));
  const child = spawn3("ruler", args, {
    stdio: "inherit",
    shell: true
  });
  child.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error(pc3.red("\nError: ruler is not installed."));
      console.error(pc3.dim("Install it with: npm install -g @intellectronica/ruler"));
      process.exit(1);
    }
    console.error(pc3.red(`Error: ${err.message}`));
    process.exit(1);
  });
  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
}
program.parse();
//# sourceMappingURL=index.js.map