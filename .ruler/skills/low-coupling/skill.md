# Low Coupling Skill

Analyze and improve code to minimize dependencies between components.

## Overview

Minimize dependencies between components for better maintainability.

## Principles

- **Single Responsibility**: Each component manages one concern
- **Accept Duplication**: Prefer duplication over tight coupling when appropriate
- **Composition Over Props Drilling**: Render children directly
- **Scoped State**: Break broad state into focused, single-purpose units

## Code Patterns

### Composition Over Props Drilling

```typescript
// Bad - props drilling
const App = () => {
  const [user, setUser] = useState(null)
  return <Layout user={user} setUser={setUser} />
}

const Layout = ({ user, setUser }) => {
  return <Sidebar user={user} setUser={setUser} />
}

const Sidebar = ({ user, setUser }) => {
  return <UserMenu user={user} setUser={setUser} />
}

// Good - composition pattern
const App = () => {
  const [user, setUser] = useState(null)

  return (
    <Layout>
      <Sidebar>
        <UserMenu user={user} setUser={setUser} />
      </Sidebar>
    </Layout>
  )
}
```

### Scoped State

Break broad state into focused units:

```typescript
// Bad - monolithic state
const useAppState = () => {
  const [state, setState] = useState({
    user: null,
    products: [],
    cart: [],
    theme: 'light',
    notifications: [],
  })
  // Everything re-renders on any change
}

// Good - scoped state
const useUser = () => useState(null)
const useProducts = () => useState([])
const useCart = () => useState([])
const useTheme = () => useState<'light' | 'dark'>('light')
const useNotifications = () => useState([])
```

## Analysis Checklist

When analyzing code for coupling issues:

- [ ] **Props Drilling**: Are props passed through multiple layers?
- [ ] **Monolithic State**: Is state too broad and causes unnecessary re-renders?
- [ ] **Tight Dependencies**: Do components depend on many others?
- [ ] **God Components**: Do components know too much about others?
- [ ] **Shared Mutable State**: Is mutable state shared across components?
- [ ] **Over-Abstraction**: Is there premature abstraction for DRY?

## Output Format

### Issues Found
- `[File:Line]` Description of coupling issue
- Severity: High / Medium / Low

### Suggestions
1. Specific decoupling suggestion
2. Code example showing improvement

## Examples

**Issue**: User props drilled through 3 component layers
**Suggestion**: Use composition pattern or context

**Issue**: Monolithic state object causes re-renders
**Suggestion**: Split into scoped state hooks by domain
