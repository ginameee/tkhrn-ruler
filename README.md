# Frontend Common Ruleset

Centralized AI agent instructions for frontend development projects using [Ruler](https://github.com/intellectronica/ruler).

## Quick Start

### 1. Install Ruler

```bash
npm install -g @intellectronica/ruler
```

### 2. Configure MCP Tokens

```bash
# Copy the example file
cp .env.mcp.example .env.mcp.local

# Edit and add your tokens
vim .env.mcp.local
```

### 3. Apply Rules

```bash
# Apply to all configured agents (Cursor, Claude, Codex)
ruler apply

# Apply to specific agents
ruler apply --agents cursor,claude

# Preview changes without applying
ruler apply --dry-run
```

## Project Structure

```
.
├── .ruler/
│   ├── AGENTS.md          # Frontend code quality rules
│   └── ruler.toml         # Ruler configuration
├── .env.mcp.example       # MCP token template
├── .env.mcp.local         # Your MCP tokens (gitignored)
├── .gitignore
└── README.md
```

## Configured Agents

| Agent  | Output File              |
|--------|--------------------------|
| Cursor | `.cursor/rules/rules.mdc` |
| Claude | `CLAUDE.md`              |
| Codex  | `codex.md`               |

## MCP Servers

| Server               | Purpose                              |
|----------------------|--------------------------------------|
| figma                | Design token extraction              |
| notion               | Documentation access                 |
| playwright           | Browser automation & E2E testing     |
| sequential-thinking  | Complex reasoning & analysis         |
| context7             | Library documentation lookup         |

## Nested Rules

Sub-projects can extend these rules:

```bash
# Create sub-project rules
mkdir -p packages/my-app/.ruler

# Add sub-project specific rules
echo "# My App Rules" > packages/my-app/.ruler/AGENTS.md
```

When running `ruler apply`, nested rules are discovered and concatenated with parent rules.

## Commands

```bash
# Apply rules to all agents
ruler apply

# Apply with nested rule discovery
ruler apply --nested

# Apply to specific agents
ruler apply --agents cursor,claude

# Preview changes
ruler apply --dry-run

# Verbose output
ruler apply --verbose

# Revert changes
ruler revert
```

## Core Principles

This ruleset enforces four fundamental frontend code quality principles:

1. **Readability** - Code should be easy to understand at a glance
2. **Predictability** - Code should behave consistently and unsurprisingly
3. **Cohesion** - Related code should stay together
4. **Low Coupling** - Minimize dependencies between components

See `.ruler/AGENTS.md` for detailed guidelines and examples.

## Customization

### Adding Custom Rules

Create additional `.md` files in `.ruler/`:

```bash
# Add TypeScript-specific rules
echo "# TypeScript Rules" > .ruler/typescript.md

# Add testing conventions
echo "# Testing Rules" > .ruler/testing.md
```

Files are concatenated alphabetically after `AGENTS.md`.

### Modifying Agent Configuration

Edit `.ruler/ruler.toml` to:

- Enable/disable specific agents
- Change output paths
- Add/remove MCP servers
- Configure merge strategies

## Links

- [Ruler Documentation](https://github.com/intellectronica/ruler)
- [Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/)
