# Frontend Common Ruleset

Centralized AI agent instructions for frontend development projects.
All sub-projects inherit these rules, with the ability to extend via nested `.ruler/` directories.

## Scope

These rules apply ONLY to frontend projects in the apps directory of this monorepo.
Backend projects and other non-frontend applications should follow their own guidelines.

---

## Rule Files

| File | Description |
|------|-------------|
| `AGENTS.md` | Project overview and configuration (this file) |
| `code-quality.md` | Code quality principles (Readability, Predictability, Cohesion, Coupling) |
| `atomic-design.md` | Atomic Design pattern and boilerplate structure |
| `handover.md` | Cross-agent context transfer protocol |

## Custom Commands

Common custom commands for all AI agents can be managed in the `commands/` directory:

```
.ruler/
└── commands/        # Common commands for all agents
    ├── my-command.md
    └── another-command.md
```

When you run `tkhrn-ruler apply`, all commands in `.ruler/commands/` will be automatically copied to each enabled agent's command directory:

- **Cursor**: `.cursor/commands/` (default)
- **Claude**: `.claude/commands/` (default)
- **Codex**: `.codex/commands/` (default)

Command paths can be customized in `ruler.toml`:

```toml
[agents.cursor]
command_path = ".cursor/commands"

[agents.claude]
command_path = ".claude/commands"  # or "CLAUDE_COMMANDS" if you prefer

[agents.codex]
command_path = ".codex/commands"   # or "CODEX_COMMANDS" if you prefer
```

> **Note**: 
> - Commands in `.ruler/commands/` are **shared** across all enabled agents
> - If you need agent-specific commands, you can manage them manually in each agent's command directory
> - If your Claude or Codex setup uses a different directory structure, you can customize the `command_path` in `ruler.toml` to match your configuration

See `commands/README.md` for more details.

---

## Project Structure

```
project/
├── .ruler/                  # Global rules (this directory)
│   ├── AGENTS.md            # Overview (this file)
│   ├── code-quality.md      # Code quality principles
│   ├── atomic-design.md     # Atomic Design pattern
│   ├── handover.md          # Agent handover protocol
│   ├── ruler.toml           # Ruler configuration
│   └── commands/            # Common custom commands (shared by all agents)
├── .handover/               # Handover context storage (gitignored)
│   ├── active.md            # Current active handover
│   └── archive/             # Completed handovers
├── packages/
│   └── feature-a/
│       └── .ruler/          # Feature-specific rules (nested)
└── .env.mcp.local           # MCP token configuration (gitignored)
```

---

## MCP Server Configuration

Required tokens should be defined in `.env.mcp.local`:

```bash
FIGMA_ACCESS_TOKEN=your_figma_token
NOTION_API_KEY=your_notion_api_key
```

### Available MCP Servers

| Server | Purpose |
|--------|---------|
| figma | Design token extraction and component specs |
| notion | Documentation and knowledge base access |
| playwright | Browser automation and E2E testing |
| sequential-thinking | Complex reasoning and analysis |
| context7 | Library documentation lookup |

---

## Configured Agents

| Agent | Rules Output | Commands Path |
|-------|-------------|---------------|
| Cursor | `.cursor/rules/rules.mdc` | `.cursor/commands/` |
| Claude | `CLAUDE.md` | `.claude/commands/` |
| Codex | `codex.md` | `.codex/commands/` |

---

## Nested Rules

Sub-projects can extend these rules by creating their own `.ruler/` directory:

```
packages/design-system/.ruler/
├── AGENTS.md           # Design system specific rules
└── component-api.md    # Component API guidelines

packages/admin-app/.ruler/
├── AGENTS.md           # Admin app specific rules
└── security.md         # Security guidelines for admin
```

When running `ruler apply --nested`, rules are discovered and concatenated:
1. Root `.ruler/` rules (this directory)
2. Nested `.ruler/` rules in subdirectories

---

## Quick Reference

### Default Tech Stack

| Category | Library |
|----------|---------|
| UI Framework | React |
| UI Components | MUI (Material-UI) |
| Data Fetching | React Query (TanStack Query) |
| State Management | Zustand |
| Form Handling | React Hook Form + Zod |
| Styling | Emotion / Styled Components |

### Testing Guidelines

- **Unit Tests**: Test individual functions and hooks in isolation
- **Integration Tests**: Test component interactions and data flow
- **E2E Tests**: Test critical user journeys with Playwright

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `UserProfile.tsx` |
| Hook | camelCase + use | `useUserProfile.ts` |
| Utility | camelCase | `formatDate.ts` |
| Test | source + .test | `UserProfile.test.tsx` |
| Story | source + .stories | `UserProfile.stories.tsx` |
