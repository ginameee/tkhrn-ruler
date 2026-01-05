# Frontend Common Ruleset

Centralized AI agent instructions for frontend development projects using [Ruler](https://github.com/intellectronica/ruler).

## Installation

### Apply to Existing Project

```bash
# Copy .ruler directory to your project
npx degit ginameee/tkhrn-ruler/.ruler .ruler

# Copy environment template
npx degit ginameee/tkhrn-ruler/.env.mcp.example .env.mcp.example

# Add to .gitignore
echo -e "\n# Agent Handover Context\n.handover/\n\n# MCP tokens\n.env.mcp.local" >> .gitignore
```

### Configure MCP Tokens

```bash
# Create local config from template
cp .env.mcp.example .env.mcp.local

# Edit and add your tokens
vim .env.mcp.local
```

### Apply Rules

```bash
# Install Ruler globally (if not installed)
npm install -g @intellectronica/ruler

# Apply to all configured agents (Cursor, Claude, Codex)
ruler apply

# Apply to specific agents
ruler apply --agents cursor,claude

# Preview changes without applying
ruler apply --dry-run
```

---

## Project Structure

```
.
├── .ruler/
│   ├── AGENTS.md          # Project overview
│   ├── code-quality.md    # Code quality 4 principles
│   ├── atomic-design.md   # Atomic Design pattern & boilerplate
│   ├── handover.md        # Agent handover protocol
│   └── ruler.toml         # Ruler configuration
├── .handover/             # Handover context (gitignored)
├── .env.mcp.example       # MCP token template
├── .env.mcp.local         # Your MCP tokens (gitignored)
└── .gitignore
```

## Rule Files

| File | Description |
|------|-------------|
| `AGENTS.md` | Project overview and configuration |
| `code-quality.md` | 4 principles: Readability, Predictability, Cohesion, Coupling |
| `atomic-design.md` | Atomic Design pattern & boilerplate structure |
| `handover.md` | Cross-agent context transfer protocol |

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

---

## Nested Rules

Sub-projects can extend these rules:

```bash
# Create sub-project rules
mkdir -p packages/my-app/.ruler

# Add sub-project specific rules
echo "# My App Rules" > packages/my-app/.ruler/AGENTS.md
```

When running `ruler apply --nested`, rules are discovered and concatenated with parent rules.

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

---

## Core Principles

This ruleset enforces four fundamental frontend code quality principles:

1. **Readability** - Code should be easy to understand at a glance
2. **Predictability** - Code should behave consistently and unsurprisingly
3. **Cohesion** - Related code should stay together
4. **Low Coupling** - Minimize dependencies between components

See `.ruler/code-quality.md` for detailed guidelines and examples.

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

---

## Links

- [Ruler Documentation](https://github.com/intellectronica/ruler)
- [Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/)
