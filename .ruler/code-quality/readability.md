# Readability Skill

Analyze and improve code readability for maintainable frontend code.

## Overview

Code should be easy to understand at a glance.

**Core Philosophy**: Readable code minimizes the number of contexts a developer must consider simultaneously. Human cognitive capacity is limited—when reading code, we can only hold a few concepts in working memory at once. Readable code respects this constraint.

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

### Separating Code That Doesn't Execute Together

The most effective way to reduce context is to completely separate code paths that never run together:

```typescript
// Bad - Mixed viewer and admin logic
function SubmitButton() {
  const isViewer = useRole() === 'viewer'

  useEffect(() => {
    if (isViewer) return
    showButtonAnimation()  // Viewer code must skip this
  }, [isViewer])

  return isViewer
    ? <TextButton disabled>Submit</TextButton>
    : <Button type="submit">Submit</Button>
}

// Good - Completely separated concerns
function SubmitButton() {
  const isViewer = useRole() === 'viewer'
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />
}

function ViewerSubmitButton() {
  return <TextButton disabled>Submit</TextButton>
}

function AdminSubmitButton() {
  useEffect(() => { showButtonAnimation() }, [])
  return <Button type="submit">Submit</Button>
}
```

**Why this matters**: In the bad example, anyone reading the code must understand both viewer AND admin logic simultaneously. The good example allows developers to focus on one role at a time.

### Avoiding Organization by Logic Type

Don't group code by technical type (queries, state, effects). Instead, split by feature or responsibility:

```typescript
// Bad - Monolithic hook managing all query params
export function usePageState() {
  const [query, setQuery] = useQueryParams({
    cardId: NumberParam,
    statementId: NumberParam,
    dateFrom: DateParam,
    dateTo: DateParam,
    statusList: ArrayParam
  })

  return useMemo(() => ({
    values: {
      cardId: query.cardId,
      statementId: query.statementId,
      dateRange: { from: query.dateFrom, to: query.dateTo },
      statusList: query.statusList
    },
    controls: {
      setCardId: (id) => setQuery({ cardId: id }),
      setStatementId: (id) => setQuery({ statementId: id }),
      setDateRange: (range) => setQuery({ dateFrom: range.from, dateTo: range.to }),
      setStatusList: (list) => setQuery({ statusList: list })
    }
  }), [query, setQuery])
}

// Good - Separate focused hooks
export function useCardIdQueryParam() {
  const [cardId, _setCardId] = useQueryParam('cardId', NumberParam)
  const setCardId = useCallback((cardId: number) => {
    _setCardId({ cardId }, 'replaceIn')
  }, [_setCardId])
  return [cardId ?? undefined, setCardId] as const
}

export function useStatementIdQueryParam() {
  const [statementId, _setStatementId] = useQueryParam('statementId', NumberParam)
  const setStatementId = useCallback((id: number) => {
    _setStatementId({ statementId: id }, 'replaceIn')
  }, [_setStatementId])
  return [statementId ?? undefined, setStatementId] as const
}

// Component usage
function MyComponent() {
  const [cardId, setCardId] = useCardIdQueryParam()
  const [statementId, setStatementId] = useStatementIdQueryParam()
  // Only import the query params you actually need
}
```

**Why this matters**: The monolithic approach forces readers to understand ALL query params even when they only care about one. Focused hooks reduce context and allow components to import only what they need.

### Complex Nested Logic

Name intermediate results in complex filtering or mapping operations:

```typescript
// Bad - Nested anonymous functions
const result = products.filter((product) =>
  product.categories.some((category) =>
    category.id === targetCategory.id &&
    product.prices.some((price) => price >= minPrice && price <= maxPrice)
  )
)

// Good - Named conditions
const matchedProducts = products.filter((product) => {
  return product.categories.some((category) => {
    const isSameCategory = category.id === targetCategory.id
    const isPriceInRange = product.prices.some(
      (price) => price >= minPrice && price <= maxPrice
    )
    return isSameCategory && isPriceInRange
  })
})
```

## Abstraction Guidelines

**When to abstract:**
- Logic is complex and implementation details distract from intent
- Same pattern repeats in multiple places
- Abstraction reduces total cognitive load

**When NOT to abstract:**
- Logic is simple and self-explanatory
- Abstraction would add more complexity than it removes
- Pattern appears only once or twice

**Example of when NOT to name:**
```typescript
// Simple condition - naming adds overhead without benefit
if (user.age >= 18) {
  allowAccess()
}

// Complex condition - naming clarifies intent
const isEligibleForPremiumFeatures =
  user.age >= 18 &&
  user.hasVerifiedEmail &&
  !user.isBanned &&
  user.subscription.status === 'active'

if (isEligibleForPremiumFeatures) {
  allowAccess()
}
```

## Trade-offs

**Readability vs Cohesion**: Increasing readability through abstraction may decrease cohesion if the abstraction scatters related logic. Balance these by:
- Abstract when it truly reduces cognitive load
- Keep related modifications together even if it means some duplication
- Prioritize readability for code that changes frequently

**Readability vs Performance**: Sometimes readable code is slightly less performant (e.g., multiple small functions vs one optimized function). Prioritize readability unless profiling shows a genuine bottleneck.

## Analysis Checklist

When analyzing code for readability issues:

- [ ] **Magic Numbers**: Are there unexplained numeric/string literals?
- [ ] **Complex Conditions**: Are there boolean expressions that need naming?
- [ ] **Nested Ternaries**: Are there nested ternary operators?
- [ ] **Long Functions**: Are functions longer than 50 lines?
- [ ] **Poor Naming**: Are variable/function names unclear?
- [ ] **Mixed Concerns**: Does code mix different levels of abstraction?
- [ ] **Non-Concurrent Code**: Are there execution paths that never run together but share a component?
- [ ] **Logic Type Organization**: Are hooks/functions organized by technical type rather than feature?
- [ ] **Nested Anonymous Functions**: Are there deeply nested callbacks without named intermediate steps?
- [ ] **Over-Abstraction**: Are simple, self-explanatory patterns being abstracted unnecessarily?

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
