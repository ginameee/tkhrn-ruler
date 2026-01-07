# Frontend Common Ruleset

Centralized AI agent instructions for frontend development projects using [Ruler](https://github.com/intellectronica/ruler).

## Quick Start

```bash
# Initialize in your project
npx tkhrn-ruler init

# Apply rules to all agents
npx tkhrn-ruler apply
```

That's it! Your project now has AI agent rules configured.

---

## Installation

### Using CLI (Recommended)

```bash
# Initialize ruleset in current project
npx tkhrn-ruler init

# Options
npx tkhrn-ruler init --skip-env        # Skip .env.mcp.example setup
npx tkhrn-ruler init --skip-gitignore  # Skip .gitignore modification
```

### Manual Installation

```bash
# Copy .ruler directory
npx degit ginameee/tkhrn-ruler/.ruler .ruler

# Copy environment template
npx degit ginameee/tkhrn-ruler/.env.mcp.example .env.mcp.example

# Update .gitignore
echo -e "\n# Agent Handover Context\n.handover/\n\n# MCP tokens\n.env.mcp.local" >> .gitignore
```

---

## Usage

All ruler commands are available through `tkhrn-ruler`:

```bash
# Apply rules to all configured agents
npx tkhrn-ruler apply

# Apply to specific agents
npx tkhrn-ruler apply --agents cursor,claude

# Apply with nested rule discovery
npx tkhrn-ruler apply --nested

# Preview changes without applying
npx tkhrn-ruler apply --dry-run

# Verbose output
npx tkhrn-ruler apply --verbose

# Revert changes
npx tkhrn-ruler revert
```

### Configure MCP Tokens

```bash
# Create local config from template
cp .env.mcp.example .env.mcp.local

# Edit and add your tokens
vim .env.mcp.local
```

---

## Project Structure

After initialization:

```
your-project/
├── .ruler/
│   ├── AGENTS.md          # Project overview
│   ├── code-quality.md    # Code quality principles
│   ├── atomic-design.md   # Atomic Design pattern
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

| Agent  | Output File               |
|--------|---------------------------|
| Cursor | `.cursor/rules/rules.mdc` |
| Claude | `CLAUDE.md`               |
| Codex  | `codex.md`                |

## MCP Servers

| Server              | Purpose                          |
|---------------------|----------------------------------|
| figma               | Design token extraction          |
| notion              | Documentation access             |
| playwright          | Browser automation & E2E testing |
| sequential-thinking | Complex reasoning & analysis     |
| context7            | Library documentation lookup     |

---

## Nested Rules

Sub-projects can extend these rules by creating their own `.ruler/` directory:

```
packages/design-system/.ruler/
├── AGENTS.md           # Design system specific rules
└── component-api.md    # Component API guidelines

packages/admin-app/.ruler/
├── AGENTS.md           # Admin app specific rules
└── security.md         # Security guidelines
```

Apply with nested discovery:

```bash
npx tkhrn-ruler apply --nested
```

---

## Core Principles

This ruleset enforces four fundamental frontend code quality principles:

1. **Readability** - Code should be easy to understand at a glance
2. **Predictability** - Code should behave consistently and unsurprisingly
3. **Cohesion** - Related code should stay together
4. **Low Coupling** - Minimize dependencies between components

See `.ruler/code-quality.md` for detailed guidelines and examples.

---

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
