# Frontend Common Ruleset

Centralized AI agent instructions for frontend development projects.
All sub-projects inherit these rules, with the ability to extend via nested `.ruler/` directories.

## Scope

These rules apply to frontend development projects.
Backend and other non-frontend applications should follow their respective architectural patterns.

---

## Rule Files

| File/Directory | Description |
|----------------|-------------|
| `AGENTS.md` | Project overview and configuration (this file) |
| `code-quality/` | Code quality principles directory |
| ├─ `index.md` | Overview and quick reference of 4 quality principles |
| ├─ `readability.md` | Detailed readability guidelines (Frontend Fundamentals based) |
| ├─ `predictability.md` | Detailed predictability guidelines |
| ├─ `cohesion.md` | Detailed cohesion guidelines |
| └─ `low-coupling.md` | Detailed low coupling guidelines |
| `atomic-design.md` | Atomic Design pattern and boilerplate structure |
| `handover.md` | Cross-agent context transfer protocol |
| `subagents/` | Specialized sub-agents for specific tasks |
| └─ `refactor.md` | Code quality compliance checker and refactoring specialist |

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
├── .ruler/                          # Global rules (this directory)
│   ├── AGENTS.md                    # Overview (this file)
│   ├── code-quality/                # Code quality principles
│   │   ├── index.md                 # Overview & quick reference
│   │   ├── readability.md           # Readability guidelines
│   │   ├── predictability.md        # Predictability guidelines
│   │   ├── cohesion.md              # Cohesion guidelines
│   │   └── low-coupling.md          # Low coupling guidelines
│   ├── subagents/                   # Specialized sub-agents
│   │   └── refactor.md              # Refactoring specialist
│   ├── atomic-design.md             # Atomic Design pattern
│   ├── handover.md                  # Agent handover protocol
│   ├── ruler.toml                   # Ruler configuration
│   └── commands/                    # Custom commands (shared by all agents)
├── .handover/                       # Handover context storage (gitignored)
│   ├── active.md                    # Current active handover
│   └── archive/                     # Completed handovers
├── packages/
│   └── feature-a/
│       └── .ruler/                  # Feature-specific rules (nested)
└── .env.mcp.local                   # MCP token configuration (gitignored)
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

## Code Quality Principles

All code should follow the 4 quality principles based on Toss's [Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/code/):

| Principle | Description | Reference |
|-----------|-------------|-----------|
| **Readability** (가독성) | Minimize contexts to consider simultaneously | `code-quality/readability.md` |
| **Predictability** (예측 가능성) | Behavior predictable from name alone | `code-quality/predictability.md` |
| **Cohesion** (응집도) | Code modified together stays together | `code-quality/cohesion.md` |
| **Low Coupling** (낮은 결합도) | Minimize scope of impact when changing | `code-quality/low-coupling.md` |

**Overview**: See `code-quality/index.md` for quick reference, trade-offs, and anti-patterns.

### Usage in Agents

- **All agents**: Follow these principles when writing code
- **Refactor subagent**: Checks compliance and fixes violations
- **Review workflows**: Use principles as quality gates

### Quick Anti-Patterns Check

Before committing code, ensure:
- ❌ No magic numbers → ✅ Named constants
- ❌ No inconsistent return types → ✅ Discriminated unions
- ❌ No type-based folders → ✅ Feature-based organization
- ❌ No premature abstraction → ✅ Duplication until patterns emerge

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
