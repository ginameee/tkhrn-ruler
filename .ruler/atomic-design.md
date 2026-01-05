# Atomic Design Pattern & Boilerplate

> These rules apply ONLY to frontend projects in the apps directory of this monorepo.
> Backend projects and other non-frontend applications should follow their own guidelines.

---

## Project Structure

```
src/
├── components/      # Shared components using Atomic Design
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── layout/
├── pages/           # Route-based screens
├── apis/            # API request logic
├── hooks/           # Global shared hooks
├── types/           # Global type definitions
├── utils/           # Pure utility functions
└── theme/           # Style theme configuration
```

---

## Component Organization

### Shared vs Page-Specific

| Location | Pattern | Description |
|----------|---------|-------------|
| `src/components/` | Atomic Design | Reusable across pages |
| `pages/*/_components/` | Flat structure | Page-specific only |

**Key Rules:**
- Apply atomic design ONLY to shared components in `src/components/`
- Use simplified flat structure for page-specific components
- Prefix with underscore (`_components`, `_hooks`) for page-specific resources
- Use standard names (`components`, `hooks`) for shared resources

---

## Atomic Design Hierarchy

### atoms/

Basic UI units without business logic or side effects.

```typescript
// atoms/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export const Button = ({ variant, size, children, ...props }: ButtonProps) => {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  )
}
```

**Requirements:**
- No external API calls
- No context dependencies
- No side effects
- Tests and Storybook files are **REQUIRED**

**Examples:** Button, Input, Icon, Typography, Badge, Avatar, Spinner

**File Structure:**
```
atoms/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Button.stories.tsx
│   └── index.ts
├── Input/
└── Icon/
```

---

### molecules/

Combinations of 2+ atoms with internal state but no side effects.

```typescript
// molecules/SearchBar/SearchBar.tsx
import { Input, Button, Icon } from '@/components/atoms'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
}

export const SearchBar = ({ placeholder, onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('')

  const handleSubmit = () => {
    onSearch(query)
  }

  return (
    <Container>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <Button onClick={handleSubmit}>
        <Icon name="search" />
      </Button>
    </Container>
  )
}
```

**Requirements:**
- Combines 2+ atoms
- May have internal state
- No external API calls
- No context dependencies
- Tests and Storybook files are **REQUIRED**

**Examples:** SearchBar, FormField, ToggleSwitch, Dropdown, Modal, Tabs

---

### organisms/

Complex components with business logic, async operations, or API calls.

```typescript
// organisms/UserProfileCard/UserProfileCard.tsx
import { Avatar, Typography, Button } from '@/components/atoms'
import { useUserProfile } from '@/hooks/useUserProfile'

interface UserProfileCardProps {
  userId: string
}

export const UserProfileCard = ({ userId }: UserProfileCardProps) => {
  const { data: user, isLoading, error } = useUserProfile(userId)

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <Card>
      <Avatar src={user.avatar} alt={user.name} />
      <Typography variant="h3">{user.name}</Typography>
      <Typography variant="body">{user.bio}</Typography>
      <Button onClick={() => handleFollow(userId)}>Follow</Button>
    </Card>
  )
}
```

**Characteristics:**
- Combines atoms and molecules
- Contains business logic
- May include async operations and API calls
- May use context and global state
- Tests/Storybook optional (consider mocking complexity)

**Examples:** UserProfileCard, LoginForm, ProductList, CommentSection, Navbar

---

### layout/

Structural components used across multiple pages.

```typescript
// layout/PageContainer/PageContainer.tsx
interface PageContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export const PageContainer = ({ children, maxWidth = 'lg' }: PageContainerProps) => {
  return (
    <Container maxWidth={maxWidth}>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </Container>
  )
}
```

**Examples:** Header, Footer, Sidebar, PageContainer, Navigation, Drawer

---

## Page Structure

Each page follows a consistent internal structure:

```
pages/
├── products/
│   ├── index.tsx              # Main route component
│   ├── _components/           # Page-specific components (flat, no atomic)
│   │   ├── ProductFilter.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductSortMenu.tsx
│   ├── _hooks/                # Page-specific hooks
│   │   ├── useProductFilter.ts
│   │   └── useProductSort.ts
│   └── _types.ts              # Page-specific types
├── product/
│   └── [id]/
│       ├── index.tsx
│       ├── _components/
│       └── _hooks/
└── auth/
    ├── login/
    └── register/
```

**Key Points:**
- `index.tsx` is the main route entry point
- `_components/` contains page-specific components without atomic subdivision
- `_hooks/` contains page-specific custom hooks
- `_types.ts` contains page-specific type definitions
- Underscore prefix (`_`) indicates non-shared resources

---

## API Structure

Organize by domain with each endpoint as a separate file:

```
apis/
├── product/
│   ├── getList.ts
│   ├── getList.schema.ts
│   ├── getDetail.ts
│   ├── getDetail.schema.ts
│   ├── create.ts
│   ├── create.schema.ts
│   └── index.ts
├── user/
│   ├── getProfile.ts
│   ├── getProfile.schema.ts
│   ├── updateProfile.ts
│   └── index.ts
└── auth/
    ├── login.ts
    ├── login.schema.ts
    ├── register.ts
    └── index.ts
```

**API File Template:**

```typescript
// apis/product/getList.ts
import { api } from '@/lib/api'
import { ProductListResponse, ProductListParams } from './getList.schema'

export const getProductList = async (params: ProductListParams): Promise<ProductListResponse> => {
  const response = await api.get('/products', { params })
  return response.data
}

// apis/product/getList.schema.ts
import { z } from 'zod'

export const ProductListParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  category: z.string().optional(),
})

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string(),
})

export const ProductListResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
  page: z.number(),
})

export type ProductListParams = z.infer<typeof ProductListParamsSchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>
```

---

## Code Guidelines

### API Calls

```typescript
// Bad - API call directly in component
const ProductPage = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts)
  }, [])

  return <ProductList products={products} />
}

// Good - API call through hook
const ProductPage = () => {
  const { data: products, isLoading } = useProductList()

  if (isLoading) return <Spinner />
  return <ProductList products={products} />
}
```

### Business Logic Separation

```typescript
// Bad - logic mixed in component
const CheckoutPage = () => {
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    return subtotal * (1 - discount)
  }

  const applyDiscount = async (code: string) => {
    const res = await fetch(`/api/discount/${code}`)
    const data = await res.json()
    setDiscount(data.rate)
  }

  // ... more logic
}

// Good - logic separated into hook
const CheckoutPage = () => {
  const { cart, total, applyDiscount, isLoading } = useCheckout()

  return (
    <CheckoutForm
      cart={cart}
      total={total}
      onApplyDiscount={applyDiscount}
    />
  )
}
```

### Store Implementation

```typescript
// hooks/useCartStore.ts
import { create } from 'zustand'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const useCartStoreInternal = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    )
  })),
  clearCart: () => set({ items: [] }),
  get total() {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  },
}))

// Expose through hook - encapsulate store instance
export const useCartStore = () => {
  const items = useCartStoreInternal((state) => state.items)
  const total = useCartStoreInternal((state) => state.total)
  const addItem = useCartStoreInternal((state) => state.addItem)
  const removeItem = useCartStoreInternal((state) => state.removeItem)
  const updateQuantity = useCartStoreInternal((state) => state.updateQuantity)
  const clearCart = useCartStoreInternal((state) => state.clearCart)

  return { items, total, addItem, removeItem, updateQuantity, clearCart }
}
```

### Error Handling

```typescript
// hooks/useUserProfile.ts
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserProfile(userId),
    retry: 3,
    onError: (error) => {
      // Log error for monitoring
      logger.error('Failed to fetch user profile', { userId, error })

      // Show user-friendly message
      toast.error('Failed to load profile. Please try again.')
    },
  })
}
```

---

## Default Tech Stack

| Category | Library |
|----------|---------|
| UI Framework | React |
| UI Components | MUI (Material-UI) |
| Data Fetching | React Query (TanStack Query) |
| State Management | Zustand |
| Form Handling | React Hook Form + Zod |
| Styling | Emotion / Styled Components |

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `UserProfile.tsx` |
| Hook | camelCase with use prefix | `useUserProfile.ts` |
| Utility | camelCase | `formatDate.ts` |
| Type file | camelCase or kebab | `types.ts`, `user-types.ts` |
| Test file | Same as source + .test | `UserProfile.test.tsx` |
| Story file | Same as source + .stories | `UserProfile.stories.tsx` |
| Schema file | Same as API + .schema | `getList.schema.ts` |

---

## Component Checklist

### atoms/ & molecules/
- [ ] No API calls or async operations
- [ ] No context or global state dependencies
- [ ] Props fully typed with TypeScript
- [ ] Unit tests written
- [ ] Storybook stories created
- [ ] Exported from index.ts

### organisms/
- [ ] Business logic extracted to hooks
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Accessible (ARIA attributes)

### Pages
- [ ] Uses shared components from `components/`
- [ ] Page-specific components in `_components/`
- [ ] Complex logic in `_hooks/`
- [ ] Types in `_types.ts`
