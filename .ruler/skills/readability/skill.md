# Readability Skill

Analyze and improve code readability for maintainable frontend code.

## Overview

Code should be easy to understand at a glance.

## Principles

- **Reduce Context**: Separate code that doesn't execute together
- **Abstract Implementation**: Hide complex logic behind clear interfaces
- **Clear Naming**: Use descriptive names for conditions and magic numbers
- **Natural Flow**: Structure code to read top-to-bottom, left-to-right

## Naming Conventions

```typescript
// Components: PascalCase
const UserProfile = () => { ... }

// Hooks: camelCase with 'use' prefix
const useUserData = () => { ... }

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const ANIMATION_DELAY_MS = 300

// Functions/Variables: camelCase
const getUserById = (id: string) => { ... }
const isAuthenticated = true

// Types/Interfaces: PascalCase
interface UserProfile { ... }
type ButtonVariant = 'primary' | 'secondary'
```

## Code Patterns

### Magic Numbers

Replace unexplained values with named constants:

```typescript
// Bad
setTimeout(callback, 300)
if (items.length > 10) { ... }

// Good
const ANIMATION_DELAY_MS = 300
const MAX_VISIBLE_ITEMS = 10

setTimeout(callback, ANIMATION_DELAY_MS)
if (items.length > MAX_VISIBLE_ITEMS) { ... }
```

### Complex Conditions

Name complex boolean expressions:

```typescript
// Bad
if (user.age >= 18 && user.hasVerifiedEmail && !user.isBanned) { ... }

// Good
const canAccessPremiumContent =
  user.age >= 18 &&
  user.hasVerifiedEmail &&
  !user.isBanned

if (canAccessPremiumContent) { ... }
```

### Conditional Rendering

Separate complex conditional UI into distinct components:

```typescript
// Bad
const Dashboard = ({ user }) => {
  return user.role === 'admin'
    ? <AdminDashboard />
    : user.role === 'manager'
      ? <ManagerDashboard />
      : <UserDashboard />
}

// Good
const Dashboard = ({ user }) => {
  const DashboardComponent = {
    admin: AdminDashboard,
    manager: ManagerDashboard,
    user: UserDashboard,
  }[user.role] ?? UserDashboard

  return <DashboardComponent user={user} />
}
```

## Analysis Checklist

When analyzing code for readability issues:

- [ ] **Magic Numbers**: Are there unexplained numeric/string literals?
- [ ] **Complex Conditions**: Are there boolean expressions that need naming?
- [ ] **Nested Ternaries**: Are there nested ternary operators?
- [ ] **Long Functions**: Are functions longer than 50 lines?
- [ ] **Poor Naming**: Are variable/function names unclear?
- [ ] **Mixed Concerns**: Does code mix different levels of abstraction?

## Output Format

### Issues Found
- `[File:Line]` Description of readability issue
- Severity: High / Medium / Low

### Suggestions
1. Specific refactoring suggestion
2. Code example showing improvement

## Examples

**Issue**: Magic number `300` in setTimeout
**Suggestion**: Extract to `const ANIMATION_DELAY_MS = 300`

**Issue**: Complex condition `user.age >= 18 && user.hasVerifiedEmail && !user.isBanned`
**Suggestion**: Extract to `const canAccessPremiumContent = ...`
