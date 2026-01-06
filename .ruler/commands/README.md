# Custom Commands

This directory contains **common custom commands** that will be applied to all enabled AI agents.

## Structure

```
.ruler/commands/
├── my-command.md        # Common command for all agents
├── another-command.md   # Another common command
└── ...
```

## Usage

When you run `tkhrn-ruler apply`, all commands in this directory will be copied to each enabled agent's command directory:

- **Cursor**: `.cursor/commands/` (default)
- **Claude**: `.claude/commands/` (default, customizable in `ruler.toml`)
- **Codex**: `.codex/commands/` (default, customizable in `ruler.toml`)

## Adding Commands

1. Create command files directly in `.ruler/commands/` (no subdirectories)
2. Run `tkhrn-ruler apply` to sync commands to all enabled agent directories
3. Commands will be available in all your AI agent interfaces

## Example

Create `.ruler/commands/my-command.md`:

```markdown
# My Custom Command

This command does something useful...
```

When you run `tkhrn-ruler apply`, this will be copied to:
- `.cursor/commands/my-command.md`
- `.claude/commands/my-command.md`
- `.codex/commands/my-command.md`

(Only for enabled agents)
