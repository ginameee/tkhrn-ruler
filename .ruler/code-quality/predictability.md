# Predictability Skill

Analyze and improve code predictability for consistent behavior.

## Overview

Code should behave consistently and unsurprisingly.

**Core Philosophy**: Highly predictable code follows consistent rules so colleagues can understand behavior just by looking at function names, parameters, and return values—without reading implementation details.

## Principles

- **Consistent Return Types**: Similar functions should return similar shapes
- **No Hidden Logic**: Functions only perform actions implied by their name
- **Explicit Side Effects**: Make all state changes and side effects visible
- **Descriptive Naming**: Unique names that indicate specific behaviors

## Code Patterns

### Return Type Consistency

Use uniform return shapes across similar functions:

```typescript
// Bad - inconsistent return types
const validateEmail = (email: string) => email.includes('@')
const validatePassword = (password: string) => {
  if (password.length < 8) return 'Too short'
  return true
}

// Good - consistent discriminated unions
type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string }

const validateEmail = (email: string): ValidationResult =>
  email.includes('@')
    ? { ok: true }
    : { ok: false, reason: 'Invalid email format' }

const validatePassword = (password: string): ValidationResult =>
  password.length >= 8
    ? { ok: true }
    : { ok: false, reason: 'Password must be at least 8 characters' }
```

### Single Responsibility

Each component should have one reason to change:

```typescript
// Bad - component does too much
const UserCard = ({ userId }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setIsLoading(false)
      })
  }, [userId])

  if (isLoading) return <Spinner />
  return <div>{user.name}</div>
}

// Good - separated concerns
const useUser = (userId: string) => {
  return useQuery(['user', userId], () => fetchUser(userId))
}

const UserCard = ({ userId }) => {
  const { data: user, isLoading } = useUser(userId)

  if (isLoading) return <Spinner />
  return <div>{user.name}</div>
}
```

### Naming Uniqueness

**Principle**: Manage naming to avoid duplication. Each unique behavior should have a unique, descriptive name.

```typescript
// Bad - Similar names for different behaviors
function updateUser(user: User) {
  // Updates user in database
  return api.put(`/users/${user.id}`, user)
}

function updateUser(userId: string) {
  // Refreshes user data from server
  return api.get(`/users/${userId}`)
}

// This causes confusion - what does "updateUser" actually do?

// Good - Unique names for unique behaviors
function saveUser(user: User) {
  // Clear: saves to database
  return api.put(`/users/${user.id}`, user)
}

function fetchUser(userId: string) {
  // Clear: retrieves from server
  return api.get(`/users/${userId}`)
}

function refetchUser(userId: string) {
  // Clear: re-fetches existing data
  return api.get(`/users/${userId}`)
}
```

**Avoid**: Generic names like `updateData`, `handleClick`, `processItem` that don't reveal specific behavior.

**Prefer**: Specific names like `saveUserToDatabase`, `handleLoginSubmit`, `validateOrderItem` that clearly indicate what happens.

### Revealing Hidden Logic

Functions should only perform actions that their name implies. All side effects should be evident from the function signature and name.

```typescript
// Bad - Hidden side effects
function calculateTotal(items: Item[]): number {
  const total = items.reduce((sum, item) => sum + item.price, 0)

  // Hidden: logs to analytics (not clear from name)
  analytics.track('total_calculated', { total })

  // Hidden: updates global state (not clear from name)
  updateCartTotal(total)

  // Hidden: triggers API call (not clear from name)
  saveCartToServer({ items, total })

  return total
}

// Developer expects: pure calculation
// Reality: calculation + logging + state mutation + API call

// Good - Explicit about all actions
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

function calculateAndSaveTotal(items: Item[]): Promise<number> {
  const total = calculateTotal(items)

  analytics.track('total_calculated', { total })
  updateCartTotal(total)

  return saveCartToServer({ items, total }).then(() => total)
}

// Now the name reveals all side effects
// Developer knows: calculation + persistence
```

**Common hidden side effects to avoid**:
- API calls in seemingly pure functions
- Analytics/logging in calculation functions
- State mutations in functions that appear to only read
- Redirects in functions that appear to only process data
- DOM manipulations in utility functions

**Rule of thumb**: If a function does X and Y, the name should mention both (or split into two functions).

## Trade-offs

**Predictability vs Flexibility**: Highly predictable code may be less flexible to changing requirements. Balance by:
- Prioritize predictability for core business logic and public APIs
- Allow more flexibility in internal implementation details
- Refactor toward predictability as patterns stabilize

**Predictability vs Brevity**: Explicit, predictable code is often more verbose. Balance by:
- Accept verbosity for critical code paths
- Use clear abstractions (not just shorter names) when appropriate
- Prioritize clarity over cleverness

**When to prioritize predictability**:
- Public APIs and library interfaces
- Code used by multiple teams
- Business-critical logic (payments, auth, data integrity)
- Code that changes frequently with different developers

**When to relax predictability**:
- Internal implementation details unlikely to change
- Prototype or experimental code
- Performance-critical code where patterns are well-documented
- Small, isolated utilities with obvious behavior

## Analysis Checklist

When analyzing code for predictability issues:

- [ ] **Inconsistent Returns**: Do similar functions return different shapes?
- [ ] **Hidden Side Effects**: Are there unexpected state mutations, API calls, or redirects?
- [ ] **Misleading Names**: Do function names match their actual behavior?
- [ ] **Multiple Responsibilities**: Do components/functions do too much?
- [ ] **Implicit Behavior**: Are there actions not clear from the interface?
- [ ] **Type Inconsistency**: Are types used inconsistently?
- [ ] **Name Duplication**: Do different behaviors share similar names?
- [ ] **Generic Naming**: Are names too generic to convey specific behavior?
- [ ] **Undisclosed Side Effects**: Do pure-sounding functions modify state or make network calls?
- [ ] **Name-Behavior Mismatch**: Does the implementation do more than the name suggests?

## Output Format

### Issues Found
- `[File:Line]` Description of predictability issue
- Severity: High / Medium / Low

### Suggestions
1. Specific refactoring suggestion
2. Code example showing improvement

## Examples

**Issue**: Inconsistent return types in validation functions
**Suggestion**: Use discriminated union `ValidationResult`

**Issue**: Component fetches data and renders UI
**Suggestion**: Extract data fetching to custom hook
