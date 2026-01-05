# Frontend Common Ruleset

This is a centralized AI agent instruction set for frontend development projects.
All sub-projects inherit these rules, with the ability to extend via nested `.ruler/` directories.

## Project Structure

```
project/
├── .ruler/              # Global rules (this directory)
│   ├── AGENTS.md        # Main ruleset (this file)
│   ├── ruler.toml       # Configuration
│   └── *.md             # Additional rule files
├── packages/
│   └── feature-a/
│       └── .ruler/      # Feature-specific rules (nested)
└── .env.mcp.local       # MCP token configuration (gitignored)
```

## MCP Server Configuration

Required tokens should be defined in `.env.mcp.local`:

```bash
FIGMA_ACCESS_TOKEN=your_figma_token
NOTION_API_KEY=your_notion_api_key
```

---

## Core Principles

Follow these four fundamental principles for maintainable frontend code:

### 1. Readability (가독성)

Code should be easy to understand at a glance.

- **Reduce Context**: Separate code that doesn't execute together
- **Abstract Implementation**: Hide complex logic behind clear interfaces
- **Clear Naming**: Use descriptive names for conditions and magic numbers
- **Natural Flow**: Structure code to read top-to-bottom, left-to-right

### 2. Predictability (예측 가능성)

Code should behave consistently and unsurprisingly.

- **Consistent Return Types**: Similar functions should return similar shapes
- **No Hidden Logic**: Functions only perform actions implied by their name
- **Explicit Side Effects**: Make all state changes and side effects visible
- **Descriptive Naming**: Unique names that indicate specific behaviors

### 3. Cohesion (응집도)

Related code should stay together.

- **Feature-Based Organization**: Organize by domain/feature, not code type
- **Co-location**: Files modified together should live together
- **Constant Proximity**: Define constants near their related logic
- **Form Grouping**: Related form fields and validation together

### 4. Low Coupling (낮은 결합도)

Minimize dependencies between components.

- **Single Responsibility**: Each component manages one concern
- **Accept Duplication**: Prefer duplication over tight coupling when appropriate
- **Composition Over Props Drilling**: Render children directly
- **Scoped State**: Break broad state into focused, single-purpose units

---

## Code Style Guidelines

### Naming Conventions

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

---

## Directory Structure

Organize by feature/domain, not by code type:

```
// Bad - organized by type
src/
├── components/
│   ├── UserProfile.tsx
│   ├── UserAvatar.tsx
│   └── ProductCard.tsx
├── hooks/
│   ├── useUser.ts
│   └── useProduct.ts
└── utils/
    ├── userUtils.ts
    └── productUtils.ts

// Good - organized by feature
src/
├── features/
│   ├── user/
│   │   ├── components/
│   │   │   ├── UserProfile.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── hooks/
│   │   │   └── useUser.ts
│   │   └── utils/
│   │       └── userUtils.ts
│   └── product/
│       ├── components/
│       │   └── ProductCard.tsx
│       ├── hooks/
│       │   └── useProduct.ts
│       └── utils/
│           └── productUtils.ts
└── shared/
    ├── components/
    ├── hooks/
    └── utils/
```

---

## Component Patterns

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

---

## State Management

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

---

## Error Handling

```typescript
// Use discriminated unions for error states
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

// Handle all states explicitly
const UserProfile = () => {
  const state = useUserQuery()

  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return <Spinner />
    case 'error':
      return <ErrorMessage error={state.error} />
    case 'success':
      return <Profile user={state.data} />
  }
}
```

---

## Testing Guidelines

- **Unit Tests**: Test individual functions and hooks in isolation
- **Integration Tests**: Test component interactions and data flow
- **E2E Tests**: Test critical user journeys with Playwright

```typescript
// Test file location: co-locate with source
src/
├── features/
│   └── user/
│       ├── components/
│       │   ├── UserProfile.tsx
│       │   └── UserProfile.test.tsx  # Co-located test
│       └── hooks/
│           ├── useUser.ts
│           └── useUser.test.ts       # Co-located test
└── tests/
    └── e2e/                          # E2E tests separate
        └── user-journey.spec.ts
```

---

## Anti-Patterns to Avoid

1. **Magic Numbers**: Always use named constants
2. **Nested Ternaries**: Use if/else or switch statements
3. **Props Drilling**: Use composition or context
4. **God Components**: Split by responsibility
5. **Inconsistent Return Types**: Use discriminated unions
6. **Hidden Side Effects**: Make all effects explicit
7. **Premature Abstraction**: Duplicate until patterns emerge
8. **Mixed Organization**: Stick to feature-based structure

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

Nested rules are concatenated with parent rules, allowing progressive customization.
