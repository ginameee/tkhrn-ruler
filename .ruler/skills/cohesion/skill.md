# Cohesion Skill

Analyze and improve code cohesion for better organization.

## Overview

Related code should stay together.

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

## Analysis Checklist

When analyzing code for cohesion issues:

- [ ] **Type-Based Organization**: Is code organized by file type instead of feature?
- [ ] **Scattered Related Code**: Are related files in different directories?
- [ ] **Distant Constants**: Are constants defined far from their usage?
- [ ] **Separated Tests**: Are unit tests separated from source files?
- [ ] **Mixed Features**: Are unrelated features mixed in same directory?
- [ ] **Poor Grouping**: Are related form fields/validations scattered?

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
