import { spawn } from 'child_process';
import { existsSync, readdirSync, copyFileSync, mkdirSync, readFileSync, renameSync } from 'fs';
import { join, basename, extname } from 'path';
import pc from 'picocolors';
import { parse } from '@iarna/toml';

interface AgentConfig {
  enabled?: boolean;
  output_path?: string;
  command_path?: string;
  skills_path?: string;
  subagents_path?: string;
}

interface RulerConfig {
  agents?: {
    [key: string]: AgentConfig;
  };
}

// Default command paths for each agent
// These are used as fallback if not specified in ruler.toml
const DEFAULT_COMMAND_PATHS: Record<string, string> = {
  cursor: '.cursor/commands',
  claude: '.claude/commands',
  codex: '.codex/commands',
};

// Default skills paths for each agent
const DEFAULT_SKILLS_PATHS: Record<string, string> = {
  cursor: '.cursor/skills',
  claude: '.claude/skills',
  codex: '.codex/skills',
};

// Default subagents paths for each agent
const DEFAULT_SUBAGENTS_PATHS: Record<string, string> = {
  cursor: '.cursor/subagents',
  claude: '.claude/commands', // Claude treats subagents as commands
  codex: '.codex/subagents',
};

export async function apply(options: { nested?: boolean } = {}) {
  const cwd = process.cwd();
  const rulerPath = join(cwd, '.ruler');
  const rulerTomlPath = join(rulerPath, 'ruler.toml');

  // Check if .ruler exists
  if (!existsSync(rulerPath)) {
    console.error(pc.red('Error: .ruler directory not found.'));
    console.error(pc.dim('Run "tkhrn-ruler init" first.'));
    process.exit(1);
  }

  // Parse ruler.toml to get agent configurations
  let config: RulerConfig = {};
  if (existsSync(rulerTomlPath)) {
    try {
      const tomlContent = readFileSync(rulerTomlPath, 'utf-8');
      config = parse(tomlContent) as RulerConfig;
    } catch (error) {
      console.warn(pc.yellow('Warning: Could not parse ruler.toml'));
    }
  }

  // First, run ruler apply
  console.log(pc.dim('→ Running ruler apply...'));
  await runRulerApply(options.nested);

  // Then, copy commands
  console.log(pc.dim('\n→ Copying custom commands...'));
  await copyCommands(cwd, config, options.nested);

  // Copy skills
  console.log(pc.dim('\n→ Copying skills...'));
  await copySkills(cwd, config, options.nested);

  // Copy subagents
  console.log(pc.dim('\n→ Copying subagents...'));
  await copySubagents(cwd, config, options.nested);

  console.log(pc.bold(pc.green('\n✅ Rules, commands, skills, and subagents applied successfully!\n')));
}

async function runRulerApply(nested?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = ['apply'];
    if (nested) {
      args.push('--nested');
    }

    const child = spawn('ruler', args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        console.error(pc.red('\nError: ruler is not installed.'));
        console.error(pc.dim('Install it with: npm install -g @intellectronica/ruler'));
        reject(err);
        return;
      }
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ruler apply failed with code ${code}`));
      }
    });
  });
}

async function copyCommands(
  cwd: string,
  config: RulerConfig,
  nested?: boolean
): Promise<void> {
  const rulerCommandsPath = join(cwd, '.ruler', 'commands');

  // If commands directory doesn't exist, skip
  if (!existsSync(rulerCommandsPath)) {
    console.log(pc.dim('  No .ruler/commands directory found, skipping command copy'));
    return;
  }

  const agents = config.agents || {};
  const defaultAgents = ['cursor', 'claude', 'codex'];

  // Copy common commands to all enabled agents
  for (const agentName of defaultAgents) {
    const agentConfig = agents[agentName] || {};
    
    // Skip if agent is disabled
    if (agentConfig.enabled === false) {
      continue;
    }

    // Determine destination path
    const commandPath = agentConfig.command_path || DEFAULT_COMMAND_PATHS[agentName];
    if (!commandPath) {
      console.warn(pc.yellow(`  Warning: No command_path configured for ${agentName}, skipping`));
      continue;
    }

    const destPath = join(cwd, commandPath);
    
    // Copy common commands to this agent's command directory
    try {
      copyCommandsWithBackup(rulerCommandsPath, destPath);
      console.log(pc.green(`  ✓ Copied commands to ${agentName} → ${commandPath}`));
    } catch (error) {
      console.error(pc.red(`  ✗ Failed to copy commands to ${agentName}: ${error}`));
    }
  }

  // Handle nested commands if nested option is enabled
  if (nested) {
    await copyNestedCommands(cwd, config);
  }
}

async function copyNestedCommands(
  cwd: string,
  config: RulerConfig
): Promise<void> {
  // Find all nested .ruler directories
  const nestedRulers = findNestedRulers(cwd);
  
  for (const nestedRulerPath of nestedRulers) {
    const nestedCommandsPath = join(nestedRulerPath, 'commands');
    
    if (!existsSync(nestedCommandsPath)) {
      continue;
    }

    // Get relative path from cwd to determine nested project path
    const relativePath = nestedRulerPath
      .replace(cwd, '')
      .replace(/\\.ruler$/, '')
      .replace(/^\//, '')
      .replace(/^\\/, '');
    const nestedProjectPath = relativePath ? join(cwd, relativePath) : cwd;

    const agents = config.agents || {};
    const defaultAgents = ['cursor', 'claude', 'codex'];

    // Copy common commands from nested .ruler/commands to all enabled agents
    for (const agentName of defaultAgents) {
      const agentConfig = agents[agentName] || {};
      
      if (agentConfig.enabled === false) {
        continue;
      }

      const commandPath = agentConfig.command_path || DEFAULT_COMMAND_PATHS[agentName];
      if (!commandPath) {
        continue;
      }

      // For nested, append to nested project path
      const destPath = join(nestedProjectPath, commandPath);
      
      try {
        copyCommandsWithBackup(nestedCommandsPath, destPath);
        console.log(pc.green(`  ✓ Copied nested commands to ${agentName} in ${relativePath} → ${commandPath}`));
      } catch (error) {
        console.error(pc.red(`  ✗ Failed to copy nested commands to ${agentName} in ${relativePath}: ${error}`));
      }
    }
  }
}

function findNestedRulers(rootPath: string, currentPath: string = rootPath, results: string[] = []): string[] {
  try {
    const entries = readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip node_modules, .git, dist, etc.
      if (entry.name.startsWith('.') && entry.name !== '.ruler') {
        continue;
      }
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }

      const fullPath = join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name === '.ruler' && fullPath !== join(rootPath, '.ruler')) {
          results.push(fullPath);
        } else {
          findNestedRulers(rootPath, fullPath, results);
        }
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return results;
}

/**
 * Copy commands from source to destination with backup support.
 * If a file with the same name exists, it will be backed up as {filename}.bak.md
 */
function copyCommandsWithBackup(source: string, dest: string): void {
  // Create destination directory if it doesn't exist
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyCommandsWithBackup(sourcePath, destPath);
    } else {
      // Skip .gitkeep files
      if (entry.name === '.gitkeep') {
        continue;
      }

      // If destination file exists, backup it first
      if (existsSync(destPath)) {
        const fileName = basename(destPath, extname(destPath));
        const fileExt = extname(destPath);
        const backupPath = join(dest, `${fileName}.bak${fileExt}`);
        
        try {
          renameSync(destPath, backupPath);
          console.log(pc.dim(`    → Backed up existing file: ${entry.name} → ${basename(backupPath)}`));
        } catch (error) {
          console.warn(pc.yellow(`    ⚠ Could not backup ${entry.name}, skipping...`));
          continue;
        }
      }

      // Copy the new file
      copyFileSync(sourcePath, destPath);
    }
  }
}

/**
 * Copy skills from .ruler/skills to agent-specific skills directories
 */
async function copySkills(
  cwd: string,
  config: RulerConfig,
  nested?: boolean
): Promise<void> {
  const rulerSkillsPath = join(cwd, '.ruler', 'skills');

  // If skills directory doesn't exist, skip
  if (!existsSync(rulerSkillsPath)) {
    console.log(pc.dim('  No .ruler/skills directory found, skipping skills copy'));
    return;
  }

  const agents = config.agents || {};
  const defaultAgents = ['cursor', 'claude', 'codex'];

  // Copy skills to all enabled agents
  for (const agentName of defaultAgents) {
    const agentConfig = agents[agentName] || {};

    // Skip if agent is disabled
    if (agentConfig.enabled === false) {
      continue;
    }

    // Determine destination path
    const skillsPath = agentConfig.skills_path || DEFAULT_SKILLS_PATHS[agentName];
    if (!skillsPath) {
      console.warn(pc.yellow(`  Warning: No skills_path configured for ${agentName}, skipping`));
      continue;
    }

    const destPath = join(cwd, skillsPath);

    // Copy skills to this agent's skills directory
    try {
      copyCommandsWithBackup(rulerSkillsPath, destPath);
      console.log(pc.green(`  ✓ Copied skills to ${agentName} → ${skillsPath}`));
    } catch (error) {
      console.error(pc.red(`  ✗ Failed to copy skills to ${agentName}: ${error}`));
    }
  }

  // Handle nested skills if nested option is enabled
  if (nested) {
    await copyNestedSkills(cwd, config);
  }
}

/**
 * Copy nested skills from sub-projects
 */
async function copyNestedSkills(
  cwd: string,
  config: RulerConfig
): Promise<void> {
  const nestedRulers = findNestedRulers(cwd);

  for (const nestedRulerPath of nestedRulers) {
    const nestedSkillsPath = join(nestedRulerPath, 'skills');

    if (!existsSync(nestedSkillsPath)) {
      continue;
    }

    const relativePath = nestedRulerPath
      .replace(cwd, '')
      .replace(/\\.ruler$/, '')
      .replace(/^\//, '')
      .replace(/^\\/, '');
    const nestedProjectPath = relativePath ? join(cwd, relativePath) : cwd;

    const agents = config.agents || {};
    const defaultAgents = ['cursor', 'claude', 'codex'];

    for (const agentName of defaultAgents) {
      const agentConfig = agents[agentName] || {};

      if (agentConfig.enabled === false) {
        continue;
      }

      const skillsPath = agentConfig.skills_path || DEFAULT_SKILLS_PATHS[agentName];
      if (!skillsPath) {
        continue;
      }

      const destPath = join(nestedProjectPath, skillsPath);

      try {
        copyCommandsWithBackup(nestedSkillsPath, destPath);
        console.log(pc.green(`  ✓ Copied nested skills to ${agentName} in ${relativePath} → ${skillsPath}`));
      } catch (error) {
        console.error(pc.red(`  ✗ Failed to copy nested skills to ${agentName} in ${relativePath}: ${error}`));
      }
    }
  }
}

/**
 * Copy subagents from .ruler/subagents to agent-specific subagents directories
 */
async function copySubagents(
  cwd: string,
  config: RulerConfig,
  nested?: boolean
): Promise<void> {
  const rulerSubagentsPath = join(cwd, '.ruler', 'subagents');

  // If subagents directory doesn't exist, skip
  if (!existsSync(rulerSubagentsPath)) {
    console.log(pc.dim('  No .ruler/subagents directory found, skipping subagents copy'));
    return;
  }

  const agents = config.agents || {};
  const defaultAgents = ['cursor', 'claude', 'codex'];

  // Copy subagents to all enabled agents
  for (const agentName of defaultAgents) {
    const agentConfig = agents[agentName] || {};

    // Skip if agent is disabled
    if (agentConfig.enabled === false) {
      continue;
    }

    // Determine destination path
    const subagentsPath = agentConfig.subagents_path || DEFAULT_SUBAGENTS_PATHS[agentName];
    if (!subagentsPath) {
      console.warn(pc.yellow(`  Warning: No subagents_path configured for ${agentName}, skipping`));
      continue;
    }

    const destPath = join(cwd, subagentsPath);

    // Copy subagents to this agent's subagents directory
    try {
      copyCommandsWithBackup(rulerSubagentsPath, destPath);
      console.log(pc.green(`  ✓ Copied subagents to ${agentName} → ${subagentsPath}`));
    } catch (error) {
      console.error(pc.red(`  ✗ Failed to copy subagents to ${agentName}: ${error}`));
    }
  }

  // Handle nested subagents if nested option is enabled
  if (nested) {
    await copyNestedSubagents(cwd, config);
  }
}

/**
 * Copy nested subagents from sub-projects
 */
async function copyNestedSubagents(
  cwd: string,
  config: RulerConfig
): Promise<void> {
  const nestedRulers = findNestedRulers(cwd);

  for (const nestedRulerPath of nestedRulers) {
    const nestedSubagentsPath = join(nestedRulerPath, 'subagents');

    if (!existsSync(nestedSubagentsPath)) {
      continue;
    }

    const relativePath = nestedRulerPath
      .replace(cwd, '')
      .replace(/\\.ruler$/, '')
      .replace(/^\//, '')
      .replace(/^\\/, '');
    const nestedProjectPath = relativePath ? join(cwd, relativePath) : cwd;

    const agents = config.agents || {};
    const defaultAgents = ['cursor', 'claude', 'codex'];

    for (const agentName of defaultAgents) {
      const agentConfig = agents[agentName] || {};

      if (agentConfig.enabled === false) {
        continue;
      }

      const subagentsPath = agentConfig.subagents_path || DEFAULT_SUBAGENTS_PATHS[agentName];
      if (!subagentsPath) {
        continue;
      }

      const destPath = join(nestedProjectPath, subagentsPath);

      try {
        copyCommandsWithBackup(nestedSubagentsPath, destPath);
        console.log(pc.green(`  ✓ Copied nested subagents to ${agentName} in ${relativePath} → ${subagentsPath}`));
      } catch (error) {
        console.error(pc.red(`  ✗ Failed to copy nested subagents to ${agentName} in ${relativePath}: ${error}`));
      }
    }
  }
}

/**
 * Legacy function for backward compatibility (not used anymore)
 * @deprecated Use copyCommandsWithBackup instead
 */
function copyDirectory(source: string, dest: string): void {
  copyCommandsWithBackup(source, dest);
}
