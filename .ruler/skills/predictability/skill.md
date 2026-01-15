# Predictability Skill

Analyze and improve code predictability for consistent behavior.

## Overview

Code should behave consistently and unsurprisingly.

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

## Analysis Checklist

When analyzing code for predictability issues:

- [ ] **Inconsistent Returns**: Do similar functions return different shapes?
- [ ] **Hidden Side Effects**: Are there unexpected state mutations?
- [ ] **Misleading Names**: Do function names match their actual behavior?
- [ ] **Multiple Responsibilities**: Do components/functions do too much?
- [ ] **Implicit Behavior**: Are there actions not clear from the interface?
- [ ] **Type Inconsistency**: Are types used inconsistently?

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
