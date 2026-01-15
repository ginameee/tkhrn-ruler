# Cohesion Skill

Analyze and improve code cohesion for better organization.

## Overview

Related code should stay together.

**Core Philosophy**: Highly cohesive code ensures that files requiring simultaneous modification are consistently changed together. This prevents unintended errors where changes in one place aren't reflected in related code, causing desynchronization.

**The "Modified Together" Principle**: Code that changes together should live together. When a feature requirement changes, all affected code should be easy to find and update in one place.

## Principles

- **Feature-Based Organization**: Organize by domain/feature, not code type
- **Co-location**: Files modified together should live together
- **Constant Proximity**: Define constants near their related logic
- **Form Grouping**: Related form fields and validation together

## Code Patterns

### Directory Structure

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

### Testing Co-location

```
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

### Magic Numbers as Cohesion Issue

Magic numbers scattered throughout code create cohesion problems. When the same value appears in multiple places, changing it requires updating every location—creating risk of desynchronization.

```typescript
// Bad - Hardcoded value in multiple places (Low Cohesion)
async function onLikeClick() {
  await postLike(url)
  await delay(300)  // What is this 300?
  await refetchPostLike()
}

function LikeAnimation() {
  return <Animation duration={300} />  // Same 300, but disconnected
}

// When designer changes animation to 500ms:
// - Developer might miss updating one location
// - Code becomes inconsistent
// - Bugs appear

// Good - Single source of truth (High Cohesion)
const LIKE_ANIMATION_DELAY_MS = 300

async function onLikeClick() {
  await postLike(url)
  await delay(LIKE_ANIMATION_DELAY_MS)
  await refetchPostLike()
}

function LikeAnimation() {
  return <Animation duration={LIKE_ANIMATION_DELAY_MS} />
}

// When designer changes animation:
// - Update constant once
// - All usages automatically synchronized
// - Zero risk of inconsistency
```

**Why this is cohesion, not just readability**: The primary benefit isn't naming (though that helps). It's ensuring related values are modified together consistently. This is a single source of truth pattern.

### Form Field Cohesion

Keep related form fields, validation, and submission logic together:

```typescript
// Bad - Scattered form logic
// in components/UserForm.tsx
function UserForm() {
  const { email, phone, address } = useFormData()
  return <form>...</form>
}

// in validation/userValidation.ts
export const validateEmail = (email) => { ... }
export const validatePhone = (phone) => { ... }
export const validateAddress = (address) => { ... }

// in api/userApi.ts
export const submitUser = (data) => { ... }

// Good - Cohesive form feature
// in features/user/UserForm.tsx
const validateEmail = (email: string) => { ... }
const validatePhone = (phone: string) => { ... }
const validateAddress = (address: string) => { ... }

function UserForm() {
  const { email, phone, address } = useFormData()

  const handleSubmit = async () => {
    if (!validateEmail(email)) return
    if (!validatePhone(phone)) return
    if (!validateAddress(address)) return
    await submitUser({ email, phone, address })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**Exception**: If validation rules are reused across multiple forms, consider extracting them. But if they're form-specific, keep them together for easier modification.

### Constant Proximity

Place constants near their usage, not in a central constants file:

```typescript
// Bad - All constants centralized
// constants/index.ts
export const MAX_FILE_SIZE_MB = 10
export const ANIMATION_DELAY_MS = 300
export const MAX_RETRY_COUNT = 3
export const API_TIMEOUT_MS = 5000

// Good - Constants near usage
// features/file-upload/FileUploader.tsx
const MAX_FILE_SIZE_MB = 10
const MAX_RETRY_COUNT = 3

export function FileUploader() { ... }

// features/animations/LikeButton.tsx
const ANIMATION_DELAY_MS = 300

export function LikeButton() { ... }

// services/api/client.ts
const API_TIMEOUT_MS = 5000

export const apiClient = createClient({ timeout: API_TIMEOUT_MS })
```

**When to centralize**: Only centralize constants that are truly global configuration (e.g., API base URL, feature flags) or shared across many unrelated features.

## Trade-offs

**Cohesion vs Readability**: Increasing cohesion through grouping may reduce readability if it creates large files or complex directory structures. Balance by:
- Split large cohesive modules into smaller focused files within same directory
- Use clear file names that indicate purpose
- Document structure in README when organization is non-obvious

**Cohesion vs Coupling**: Keeping everything together can increase coupling if shared logic isn't properly abstracted. Balance by:
- Extract truly shared logic to `shared/` or `common/`
- Keep feature-specific code in feature directories
- Allow some duplication between features to maintain independence

**When to prioritize cohesion**:
- Changes carry high risk (e.g., payment flows, security features)
- Features are frequently modified together
- Team members often miss related updates
- Bugs arise from desynchronized code

**When to relax cohesion**:
- Code rarely changes
- Strict feature boundaries are more important than grouping
- Readability would suffer significantly from grouping

## Analysis Checklist

When analyzing code for cohesion issues:

- [ ] **Type-Based Organization**: Is code organized by file type instead of feature?
- [ ] **Scattered Related Code**: Are related files in different directories?
- [ ] **Distant Constants**: Are constants defined far from their usage?
- [ ] **Separated Tests**: Are unit tests separated from source files?
- [ ] **Mixed Features**: Are unrelated features mixed in same directory?
- [ ] **Poor Grouping**: Are related form fields/validations scattered?
- [ ] **Magic Number Duplication**: Are the same values hardcoded in multiple places?
- [ ] **Desynchronization Risk**: Could related changes be missed across files?
- [ ] **Form Logic Scattered**: Are validation, fields, and submission logic in different files?
- [ ] **Over-Centralization**: Are feature-specific constants unnecessarily centralized?

## Output Format

### Issues Found
- `[Directory]` Description of cohesion issue
- Severity: High / Medium / Low

### Suggestions
1. Specific reorganization suggestion
2. Directory structure example showing improvement

## Examples

**Issue**: User-related components scattered across `/components`, `/hooks`, `/utils`
**Suggestion**: Group into `features/user/` with subdirectories

**Issue**: Constants defined in separate `constants/` directory
**Suggestion**: Move constants close to usage in feature directories
