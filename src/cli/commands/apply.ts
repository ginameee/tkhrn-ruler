import { spawn } from 'child_process';
import { existsSync, readdirSync, copyFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import pc from 'picocolors';
import { parse } from '@iarna/toml';

interface AgentConfig {
  enabled?: boolean;
  output_path?: string;
  command_path?: string;
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

  console.log(pc.bold(pc.green('\n✅ Rules and commands applied successfully!\n')));
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
      copyDirectory(rulerCommandsPath, destPath);
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
        copyDirectory(nestedCommandsPath, destPath);
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

function copyDirectory(source: string, dest: string): void {
  // Create destination directory if it doesn't exist
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      // Skip .gitkeep files
      if (entry.name === '.gitkeep') {
        continue;
      }
      copyFileSync(sourcePath, destPath);
    }
  }
}
