# Low Coupling Skill

Analyze and improve code to minimize dependencies between components.

## Overview

Minimize dependencies between components for better maintainability.

**Core Philosophy**: Coupling is measured by the **scope of impact when code is modified**. Low coupling means changes in one component require minimal changes elsewhere. This makes code easier to predict, modify, and maintain.

**Scope of Impact Definition**: When you modify a component, how many other files/components need to change as a consequence? Fewer changes = lower coupling = better maintainability.

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

### When Duplication is Preferable to DRY

**Key Insight**: Duplication is not always bad. Sometimes duplicating code reduces coupling and improves maintainability.

**Prefer duplication when**:
- Abstractions would create tight coupling between unrelated features
- The "shared" code might evolve differently for each use case
- The abstraction adds complexity without genuine reusability benefit
- Features should remain independent for different teams/domains

```typescript
// Bad - Premature abstraction creates tight coupling
// shared/components/DataTable.tsx
interface DataTableProps {
  data: any[]
  userTableConfig?: UserTableConfig    // User feature specifics
  productTableConfig?: ProductTableConfig  // Product feature specifics
  orderTableConfig?: OrderTableConfig  // Order feature specifics
  // 20+ more feature-specific props...
}

export function DataTable({ data, userTableConfig, productTableConfig, ... }: DataTableProps) {
  // Complex conditional logic handling all feature variations
  // Changes for one feature risk breaking others
}

// Good - Accept duplication, reduce coupling
// features/user/UserTable.tsx
export function UserTable({ users }: { users: User[] }) {
  return (
    <table>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
        </tr>
      ))}
    </table>
  )
}

// features/product/ProductTable.tsx
export function ProductTable({ products }: { products: Product[] }) {
  return (
    <table>
      {products.map(product => (
        <tr key={product.id}>
          <td>{product.name}</td>
          <td>{product.price}</td>
        </tr>
      ))}
    </table>
  )
}

// Yes, there's duplication. But:
// - User team can modify UserTable without affecting Product team
// - No complex conditional logic
// - Each table can evolve independently
// - Clear ownership and responsibility
```

**The Two-Question Abstraction Framework**:

Before creating an abstraction, ask:
1. **Does it reduce complexity?** Or does it just hide it?
2. **Does it increase reusability?** Or does it couple unrelated code?

If both answers are "no", don't abstract—keep the duplication.

### Pragmatic Props Drilling Approach

**Important**: Props drilling is not always a problem requiring immediate solving.

```typescript
// Props drilling through 2-3 levels is often fine
const App = () => {
  const [theme, setTheme] = useState('light')
  return <Layout theme={theme} setTheme={setTheme} />
}

const Layout = ({ theme, setTheme }) => {
  return <Header theme={theme} setTheme={setTheme} />
}

const Header = ({ theme, setTheme }) => {
  return <ThemeToggle theme={theme} onToggle={setTheme} />
}
```

**When props drilling is acceptable**:
- Only 2-3 component levels
- Props are genuinely needed by intermediate components (for styling, behavior)
- Components are unlikely to change their nesting
- The drilling path is obvious and stable

**When to address props drilling**:
- Props pass through 4+ component layers
- Intermediate components don't use the props at all (pure pass-through)
- Many unrelated props are being drilled together
- The component tree frequently changes

**Resolution order** (from least to most invasive):
1. **Composition first**: Use `children` pattern to avoid prop threading
2. **Context second**: For truly cross-cutting concerns (theme, auth, i18n)
3. **Global state last**: Only for state needed across multiple pages/routes

**Avoid**: Introducing Context API or global state for simple, local props drilling. The cure can be worse than the disease.

### Managing Responsibilities Individually

Each component should manage exactly one concern. When components have single responsibilities, they can be modified independently.

```typescript
// Bad - UserProfile does too much (tightly coupled)
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetching user data
    fetch(`/api/users/${userId}`).then(/* ... */)
    // Fetching posts data
    fetch(`/api/posts?userId=${userId}`).then(/* ... */)
  }, [userId])

  if (loading) return <Spinner />

  return (
    <div>
      <UserInfo user={user} />
      <PostList posts={posts} />
    </div>
  )
}
// Modifying post fetching requires touching user profile code

// Good - Separated responsibilities (loosely coupled)
function useUser(userId: string) {
  return useQuery(['user', userId], () => fetchUser(userId))
}

function usePosts(userId: string) {
  return useQuery(['posts', userId], () => fetchPosts(userId))
}

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading: userLoading } = useUser(userId)
  const { data: posts, isLoading: postsLoading } = usePosts(userId)

  if (userLoading || postsLoading) return <Spinner />

  return (
    <div>
      <UserInfo user={user} />
      <PostList posts={posts} />
    </div>
  )
}
// Now can modify user/post fetching independently
```

## Trade-offs

**Low Coupling vs High Cohesion**: Allowing duplication reduces coupling but may decrease cohesion if the duplicated code should actually be modified together. Balance by:
- Allow duplication between **unrelated features** (different domains)
- Eliminate duplication **within features** (same domain)
- Monitor duplicated code—if it diverges, you made the right call; if it stays synchronized, consider abstracting

**Low Coupling vs DRY Principle**: Sometimes following DRY creates coupling. Balance by:
- Prioritize low coupling for cross-feature code
- Apply DRY more strictly within a single feature
- Use the Two-Question Framework before abstracting

**When to prioritize low coupling**:
- Features are owned by different teams
- Code evolves at different rates
- Independence is more valuable than sharing
- The abstraction would be complex

**When to accept higher coupling**:
- Code must stay synchronized (e.g., security protocols)
- Strong domain relationships exist
- Abstraction genuinely simplifies without hiding complexity
- Team coordination is strong

## Analysis Checklist

When analyzing code for coupling issues:

- [ ] **Props Drilling**: Are props passed through 4+ layers unnecessarily?
- [ ] **Monolithic State**: Is state too broad and causes unnecessary re-renders?
- [ ] **Tight Dependencies**: Do components depend on many others?
- [ ] **God Components**: Do components know too much about others?
- [ ] **Shared Mutable State**: Is mutable state shared across components?
- [ ] **Over-Abstraction**: Is there premature abstraction that creates coupling?
- [ ] **Scope of Impact**: Would changes here require modifying many other files?
- [ ] **Forced Abstraction**: Are unrelated features coupled through shared abstractions?
- [ ] **Single Responsibility Violation**: Do components manage multiple unrelated concerns?
- [ ] **Abstraction Without Value**: Does the abstraction fail the Two-Question test?

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
