# Example Custom Command

This is an example custom command that will be shared across all enabled AI agents.

## Usage

This command demonstrates how to create custom commands that will be copied to all agent command directories when you run `tkhrn-ruler apply`.

## Features

- Commands are automatically synced to all enabled agents when running `tkhrn-ruler apply`
- Supports nested `.ruler/` directories with `--nested` flag
- All agents receive the same commands (shared/common commands)

## Creating Commands

1. Create `.md` files directly in `.ruler/commands/` (no subdirectories)
2. Run `tkhrn-ruler apply` to sync to all enabled agents
3. Commands will be available in all your AI agent interfaces

## Example Structure

```
.ruler/commands/
├── example-command.md      # This file
├── my-command.md           # Your custom command
└── another-command.md      # Another command
```

When you run `tkhrn-ruler apply`, these will be copied to:
- `.cursor/commands/` (if Cursor is enabled)
- `.claude/commands/` (if Claude is enabled)
- `.codex/commands/` (if Codex is enabled)
