import { spawn } from 'child_process';
import { existsSync, appendFileSync, readFileSync, writeFileSync, readdirSync, renameSync, mkdirSync, cpSync } from 'fs';
import { join, basename } from 'path';
import { tmpdir } from 'os';
import pc from 'picocolors';
import { REPO } from '../../index.js';

interface InitOptions {
  interactive?: boolean;
  skipEnv?: boolean;
  skipGitignore?: boolean;
}

export async function init(options: InitOptions) {
  const cwd = process.cwd();
  const rulerDir = join(cwd, '.ruler');
  const rulerExists = existsSync(rulerDir);

  console.log(pc.bold('\n🚀 Initializing tkhrn-ruler...\n'));

  // Step 1: Download .ruler directory using degit
  console.log(pc.dim('→ Downloading ruleset...'));

  try {
    if (rulerExists) {
      // Download to temp directory first, then merge
      const tempDir = join(tmpdir(), `tkhrn-ruler-${Date.now()}`);
      mkdirSync(tempDir, { recursive: true });

      await runCommand('npx', ['degit', `${REPO}/.ruler`, tempDir, '--force']);

      // Merge files, backup duplicates
      const downloadedFiles = readdirSync(tempDir);
      let backedUp = 0;
      let added = 0;

      for (const file of downloadedFiles) {
        const targetPath = join(rulerDir, file);
        const sourcePath = join(tempDir, file);

        if (existsSync(targetPath) && file.endsWith('.md')) {
          // Backup existing file
          const bakName = file.replace(/\.md$/, '.bak.md');
          const bakPath = join(rulerDir, bakName);
          renameSync(targetPath, bakPath);
          backedUp++;
          console.log(pc.yellow(`  ↳ Backed up ${file} → ${bakName}`));
        }

        // Copy new file
        cpSync(sourcePath, targetPath, { recursive: true });
        added++;
      }

      console.log(pc.green(`✓ .ruler directory updated (${added} files added, ${backedUp} backed up)`));
    } else {
      await runCommand('npx', ['degit', `${REPO}/.ruler`, '.ruler']);
      console.log(pc.green('✓ .ruler directory created'));
    }
  } catch (error) {
    console.error(pc.red('✗ Failed to download ruleset'));
    process.exit(1);
  }

  // Step 2: Download .env.mcp.example
  if (!options.skipEnv) {
    console.log(pc.dim('→ Downloading MCP environment template...'));

    try {
      await runCommand('npx', ['degit', `${REPO}/.env.mcp.example`, '.env.mcp.example', '--force']);
      console.log(pc.green('✓ .env.mcp.example created'));
    } catch {
      // If degit fails for single file, create it manually
      console.log(pc.yellow('⚠️  Could not download .env.mcp.example, creating empty template'));
      await createEnvTemplate(cwd);
    }
  }

  // Step 3: Update .gitignore
  if (!options.skipGitignore) {
    updateGitignore(cwd);
  }

  // Step 4: Run ruler init if ruler is installed
  console.log(pc.dim('→ Running ruler init...'));

  try {
    await runCommand('ruler', ['init'], { silent: true });
    console.log(pc.green('✓ Ruler initialized'));
  } catch {
    console.log(pc.yellow('⚠️  ruler not found, skipping ruler init'));
    console.log(pc.dim('   Install ruler: npm install -g @intellectronica/ruler'));
  }

  // Done
  console.log(pc.bold(pc.green('\n✅ tkhrn-ruler initialized successfully!\n')));
  console.log(pc.dim('Next steps:'));
  console.log(pc.dim('  1. Configure MCP tokens in .env.mcp.local'));
  console.log(pc.dim('  2. Run "tkhrn-ruler apply" to apply rules'));
  console.log('');
}

function runCommand(
  command: string,
  args: string[],
  options: { silent?: boolean } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.silent ? 'ignore' : 'inherit',
      shell: true,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

function updateGitignore(cwd: string) {
  const gitignorePath = join(cwd, '.gitignore');
  const additions = `
# Agent Handover Context
.handover/

# MCP tokens
.env.mcp.local
`;

  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf-8');

    if (!content.includes('.handover/')) {
      appendFileSync(gitignorePath, additions);
      console.log(pc.green('✓ .gitignore updated'));
    } else {
      console.log(pc.dim('  .gitignore already configured'));
    }
  } else {
    writeFileSync(gitignorePath, additions.trim() + '\n');
    console.log(pc.green('✓ .gitignore created'));
  }
}

async function createEnvTemplate(cwd: string) {
  const template = `# MCP Server Tokens
# Copy this file to .env.mcp.local and add your tokens

# Figma - Design token extraction
FIGMA_ACCESS_TOKEN=

# Notion - Documentation access
NOTION_API_KEY=
`;

  writeFileSync(join(cwd, '.env.mcp.example'), template);
  console.log(pc.green('✓ .env.mcp.example created'));
}
