# Adding Theme Support to TanStack Bootstrap 2

This tutorial explains how to implement theme support in a TanStack Bootstrap 2 project, allowing users to switch between light, dark, and system themes.

## Overview

The theme implementation consists of:
- A theme context to manage theme state
- Server functions to persist theme preference
- Theme provider component to wrap the application
- Theme toggle functionality

## Step 1: Create Theme Context

Create a new file `src/context/theme-context.tsx`:

```typescript
import { createContext, use, type PropsWithChildren } from 'react'
import { useRouter } from '@tanstack/react-router'
import { setThemeServerFn } from '@/lib/theme'

export type Theme = 'light' | 'dark' | 'system'

type ThemeContextVal = {
  theme: Theme
  setTheme: (val: Theme) => void
}

type Props = PropsWithChildren<{ theme: Theme }>

const ThemeContext = createContext<ThemeContextVal | null>(null)

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter()

  function setTheme(val: Theme) {
    setThemeServerFn({ data: val })
    router.invalidate()
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const val = use(ThemeContext)
  if (!val) throw new Error('useTheme called outside of ThemeProvider!')
  return val
}
```

## Step 2: Create Theme Server Functions

Create a new file `src/lib/theme.ts`:

```typescript
import { type Theme } from '@/context/theme-context'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const storageKey = 'ui-theme'

export const getThemeServerFn = createServerFn().handler(async () => {
  return (getCookie(storageKey) || 'system') as Theme
})

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (
      typeof data != 'string' ||
      (data != 'dark' && data != 'light' && data != 'system')
    ) {
      throw new Error('Invalid theme provided')
    }
    return data as Theme
  })
  .handler(async ({ data }) => {
    setCookie(storageKey, data)
  })
```

## Step 3: Update Root Component

Modify your root component in `src/routes/__root.tsx` to use the theme provider:

```typescript
import { ThemeProvider } from '@/context/theme-context'
import { getThemeServerFn } from '@/lib/theme'

export const Route = createRootRoute({
  // ... other route config
  loader: () => getThemeServerFn(),
  component: RootComponent,
})

function RootComponent() {
  const data = Route.useLoaderData()

  return (
    <AuthProvider>
      <ThemeProvider theme={data}>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </ThemeProvider>
    </AuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <html className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-regular antialiased tracking-wide">
        {children}
      </body>
    </html>
  )
}
```

## Step 4: Using the Theme

You can now use the theme context anywhere in your application:

```typescript
import { useTheme } from '@/context/theme-context'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

## CSS Setup

Make sure your CSS is set up to handle theme classes. You can use Tailwind's dark mode or custom CSS variables:

```css
/* Example using CSS variables */
:root {
  --background: #ffffff;
  --foreground: #000000;
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

## Features

- Theme persistence using cookies
- Server-side theme handling
- Type-safe theme values
- Easy theme context access throughout the app
- System theme support
- Hydration-safe implementation

## Best Practices

1. Always use the `useTheme` hook to access theme state
2. Handle theme changes through the `setTheme` function
3. Use CSS variables for theme-dependent styles
4. Consider adding a theme toggle component in your layout
5. Test theme changes across different pages and components

## Notes

- The theme is persisted using cookies
- Theme changes trigger a router invalidation to update the UI
- The implementation is hydration-safe using `suppressHydrationWarning`
- System theme detection should be handled on the client side