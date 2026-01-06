import { program } from 'commander';
import { spawn } from 'child_process';
import pc from 'picocolors';
import { init } from './commands/init.js';
import { apply } from './commands/apply.js';
import { VERSION } from '../index.js';

program
  .name('tkhrn-ruler')
  .description('Frontend common ruleset CLI for AI agents')
  .version(VERSION);

// Custom init command
program
  .command('init')
  .description('Initialize tkhrn-ruler in current project')
  .option('-i, --interactive', 'Interactive mode for selecting options')
  .option('--skip-env', 'Skip .env.mcp.example setup')
  .option('--skip-gitignore', 'Skip .gitignore modification')
  .action(init);

// Custom apply command with command copying
program
  .command('apply', { isDefault: false })
  .description('Apply rules and copy custom commands to configured agents')
  .option('--nested', 'Include nested .ruler directories')
  .allowUnknownOption(true)
  .action(async () => {
    const nested = process.argv.includes('--nested');
    await apply({ nested });
  });

program
  .command('revert')
  .description('Revert applied rules (passthrough to ruler)')
  .allowUnknownOption(true)
  .action(() => passthrough('revert'));

// Catch-all for any other ruler commands
program
  .arguments('<command> [args...]')
  .allowUnknownOption(true)
  .action((command: string) => passthrough(command));

function passthrough(command: string) {
  const args = process.argv.slice(process.argv.indexOf(command));

  console.log(pc.dim(`→ ruler ${args.join(' ')}`));

  const child = spawn('ruler', args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (err) => {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(pc.red('\nError: ruler is not installed.'));
      console.error(pc.dim('Install it with: npm install -g @intellectronica/ruler'));
      process.exit(1);
    }
    console.error(pc.red(`Error: ${err.message}`));
    process.exit(1);
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
}

program.parse();
