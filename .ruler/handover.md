# Agent Handover Protocol

Cross-agent context transfer protocol for seamless workflow continuation.

---

## Overview

When switching between AI coding agents (Claude, Cursor, Codex, etc.), context must be preserved to maintain workflow continuity. This protocol defines how to create, store, and consume handover documents.

---

## Handover Directory

```
.handover/                    # Handover context storage (gitignored)
├── active.md                 # Current active handover (if any)
├── YYYY-MM-DD_HH-MM.md      # Timestamped handover files
└── archive/                  # Completed/old handovers
```

**Important**: The `.handover/` directory is gitignored and exists only locally.

---

## When to Create Handover

### Automatic Triggers

Create a handover document when:

- **Token usage reaches 70-80%** of context limit
- **Session is about to end** (user indicates switching agents)
- **Complex task is partially complete** and will continue later
- **User explicitly requests** handover preparation

### Token Usage Indicators

| Agent | Approximate Token Limit | 70% Threshold | 80% Threshold |
|-------|------------------------|---------------|---------------|
| Claude | 200K | ~140K | ~160K |
| Cursor | 128K | ~90K | ~102K |
| Codex | 128K | ~90K | ~102K |

---

## Handover Document Format

```markdown
# Handover Context

**Created**: YYYY-MM-DD HH:MM
**From Agent**: [Claude/Cursor/Codex]
**Task Status**: [In Progress/Blocked/Ready for Review]

## Current Task

[Brief description of what was being worked on]

## Progress Summary

### Completed
- [x] Task 1
- [x] Task 2

### In Progress
- [ ] Task 3 (current focus)

### Pending
- [ ] Task 4
- [ ] Task 5

## Key Decisions Made

1. **Decision**: [What was decided]
   **Rationale**: [Why this approach was chosen]

2. **Decision**: [What was decided]
   **Rationale**: [Why this approach was chosen]

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/Button.tsx` | Created | New button component |
| `src/hooks/useAuth.ts` | Modified | Added logout function |

## Current State

### Working Branch
`feature/xxx`

### Uncommitted Changes
```bash
# Output of `git status`
```

### Test Status
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing

## Blockers / Issues

- [Issue description and any relevant error messages]

## Next Steps

1. [Immediate next action]
2. [Following action]
3. [etc.]

## Context for Next Agent

[Any important context, gotchas, or things to be aware of]

## Related Resources

- [Links to relevant docs, PRs, issues]
```

---

## Creating Handover

### Step 1: Check Token Usage

When approaching token limit (70-80%), proactively prepare handover.

### Step 2: Generate Handover Document

```bash
# Create handover directory if not exists
mkdir -p .handover

# Create timestamped handover file
touch .handover/$(date +%Y-%m-%d_%H-%M).md
```

### Step 3: Fill Handover Template

Include all sections from the format above, focusing on:
- What was accomplished
- What remains to be done
- Any important decisions or context

### Step 4: Set as Active

```bash
# Copy to active.md for easy discovery
cp .handover/YYYY-MM-DD_HH-MM.md .handover/active.md
```

---

## Consuming Handover

### On Session Start

**Agent MUST check for active handover:**

1. Check if `.handover/active.md` exists
2. If exists, read the handover content
3. **Ask user**: "I found a handover context from [date/agent]. Would you like me to continue from where the previous session left off?"

### If User Confirms

1. Read and acknowledge the handover context
2. Summarize understanding of current state
3. Confirm next steps with user
4. Begin work from the documented state

### If User Declines

1. Archive the handover: `mv .handover/active.md .handover/archive/`
2. Start fresh session

---

## Agent Instructions

### At Session Start

```
Check for handover context:
1. Look for `.handover/active.md`
2. If found, ask user: "핸드오버 컨텍스트가 존재합니다. 이전 세션에서 이어서 진행할까요?"
3. Wait for user confirmation before proceeding
```

### At 70% Token Usage

```
Prepare for potential handover:
1. Begin organizing current progress mentally
2. Warn user: "토큰 사용량이 70%에 도달했습니다. 핸드오버 준비가 필요할 수 있습니다."
```

### At 80% Token Usage

```
Create handover document:
1. Notify user: "토큰 사용량이 80%에 도달했습니다. 핸드오버 문서를 생성합니다."
2. Create `.handover/active.md` with current context
3. Summarize handover content to user
```

### On User Request

```
When user says "handover", "핸드오버", "정리해줘", "다른 에이전트로 넘길게":
1. Immediately create handover document
2. Save to `.handover/active.md`
3. Provide summary of handover content
```

---

## Handover Lifecycle

```
┌─────────────────┐
│  Session Start  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Yes    ┌─────────────────┐
│ Active handover?├───────────►│ Ask to continue │
└────────┬────────┘            └────────┬────────┘
         │ No                           │
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│  Fresh session  │            │ Resume from     │
└────────┬────────┘            │ handover state  │
         │                     └────────┬────────┘
         └──────────┬──────────────────┘
                    ▼
         ┌─────────────────┐
         │   Work...       │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│ 70%: Warn user  │ │ Task complete   │
└────────┬────────┘ └────────┬────────┘
         │                   │
         ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ 80%: Create     │ │ Archive/delete  │
│ handover        │ │ handover        │
└─────────────────┘ └─────────────────┘
```

---

## Example Handover

```markdown
# Handover Context

**Created**: 2024-01-15 14:30
**From Agent**: Claude
**Task Status**: In Progress

## Current Task

Implementing user authentication feature with JWT tokens

## Progress Summary

### Completed
- [x] Set up auth API endpoints structure
- [x] Created useAuth hook
- [x] Implemented login form UI

### In Progress
- [ ] Token refresh logic (50% complete)

### Pending
- [ ] Logout functionality
- [ ] Protected route wrapper
- [ ] Unit tests

## Key Decisions Made

1. **Decision**: Use httpOnly cookies for token storage
   **Rationale**: More secure than localStorage, prevents XSS attacks

2. **Decision**: Implement silent refresh 5 minutes before expiry
   **Rationale**: Better UX than waiting for 401 response

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/apis/auth/login.ts` | Created | Login API call |
| `src/hooks/useAuth.ts` | Created | Auth state management |
| `src/components/LoginForm.tsx` | Created | Login UI component |

## Current State

### Working Branch
`feature/user-auth`

### Uncommitted Changes
- Modified: src/hooks/useAuth.ts (token refresh WIP)

### Test Status
- [x] Unit tests passing (existing)
- [ ] New tests needed for auth

## Next Steps

1. Complete token refresh logic in useAuth.ts
2. Add logout function
3. Create ProtectedRoute component
4. Write unit tests for useAuth hook

## Context for Next Agent

- Token refresh is half-implemented in useAuth.ts line 45-60
- Using React Query for auth state, see pattern in useUser.ts
- API base URL is configured in src/lib/api.ts
```

---

## Cleanup

### After Task Completion

```bash
# Archive the handover
mv .handover/active.md .handover/archive/$(date +%Y-%m-%d_%H-%M)_completed.md

# Or delete if no longer needed
rm .handover/active.md
```

### Periodic Cleanup

```bash
# Remove old archived handovers (older than 7 days)
find .handover/archive -name "*.md" -mtime +7 -delete
```
