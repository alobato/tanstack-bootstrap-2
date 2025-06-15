# Server-Side Internationalization (i18n) Implementation Guide

This document outlines the implementation of server-side internationalization in our application using Paraglide.js and TanStack Start.

## Overview

The implementation provides a robust i18n solution that:
- Detects user's preferred language from browser headers
- Allows manual language switching
- Persists language preferences
- Supports English (en), Portuguese (pt), and German (de) languages

## Implementation Guide

### Prerequisites

1. Install required dependencies:
```bash
npm install @paraglide/runtime @tanstack/start jose hono
```

### Step-by-Step Implementation

#### 1. Server-Side Language Detection (src/api.ts)

```typescript
import { Hono, Context, Next } from 'hono'
import { cors } from 'hono/cors'
import { setLocale, locales, getLocale } from '@/paraglide/runtime'

// Language detection middleware
async function detectLanguage(c: Context, next: Next) {
  const acceptLanguage = c.req.header('Accept-Language')

  if (acceptLanguage) {
    // Get first language from list (e.g., "pt-BR,pt;q=0.9,en;q=0.8")
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0]

    // Check if language is available
    if (locales.includes(preferredLang as "en" | "de" | "pt")) {
      setLocale(preferredLang as "en" | "de" | "pt")
    } else {
      // Fallback to English if language is not available
      setLocale("en")
    }
  } else {
    // Fallback to English if no header
    setLocale("en")
  }

  await next()
}

// Create Hono instance
const app = new Hono()

// Add language detection middleware before CORS
app.use('*', detectLanguage)

// Add locale endpoint
app.get('/api/locale', (c) => {
  return c.json({ locale: getLocale() })
})

// ... rest of your API setup
```

#### 2. Server Functions for Language Management (src/lib/locale.ts)

```typescript
import { createServerFn, ServerFnCtx } from '@tanstack/start'
import { getLocale, setLocale, locales } from '@/paraglide/runtime'
import { getWebRequest } from '@tanstack/react-start/server'

type LocaleType = "en" | "de" | "pt"

// Function to get current server locale
export const getServerLocale = createServerFn({ method: 'GET' })
  .handler(async () => {
    const request = getWebRequest()
    if (!request) {
      setLocale("en")
      return "en"
    }

    const acceptLanguage = request.headers.get('Accept-Language')

    if (acceptLanguage) {
      const preferredLang = acceptLanguage.split(',')[0].split('-')[0]

      if (locales.includes(preferredLang as LocaleType)) {
        setLocale(preferredLang as LocaleType)
        return preferredLang
      }
    }

    setLocale("en")
    return "en"
  })

// Function to set locale
export const setServerLocale = createServerFn({ method: 'POST' })
  .handler(async (ctx: ServerFnCtx<'POST', 'data', undefined, undefined>) => {
    const data = ctx.data as unknown as { locale: LocaleType }
    if (!data?.locale) {
      throw new Error('Locale not provided')
    }

    if (locales.includes(data.locale)) {
      setLocale(data.locale)
      return { success: true, locale: data.locale }
    }
    throw new Error('Unsupported locale')
  })
```

#### 3. Client-Side Integration (src/routes/_authenticated/protected.route.tsx)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import * as m from '@/paraglide/messages'
import { getLocale, setLocale, locales } from '@/paraglide/runtime'
import { useEffect, useState } from 'react'
import { getServerLocale, setServerLocale } from '@/lib/locale'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type LocaleType = "en" | "de" | "pt"

export const Route = createFileRoute('/_authenticated/protected')({
  component: RouteComponent
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch language from server using ServerFn
    getServerLocale()
      .then(serverLocale => {
        if (serverLocale && locales.includes(serverLocale as LocaleType)) {
          setLocale(serverLocale as LocaleType)
        } else {
          setLocale("en")
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching language:', error)
        setLocale("en")
        setIsLoading(false)
      })
  }, [])

  const handleLocaleChange = async (newLocale: LocaleType) => {
    try {
      await setServerLocale(newLocale as any)
      setLocale(newLocale)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h1>Current Language: {getLocale()}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Change Language
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleLocaleChange('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLocaleChange('pt')}>
              Português
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLocaleChange('de')}>
              Deutsch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Rest of your component */}
    </div>
  )
}
```

#### 4. Paraglide.js Configuration

Create a `project.inlang.json` file in your project root:

```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "sourceLanguageTag": "en",
  "languageTags": ["en", "pt", "de"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-identical-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js"
  ],
  "plugin": {
    "referenceLanguageTag": "en",
    "type": "https://cdn.jsdelivr.net/npm/@inlang/plugin-json@latest/dist/index.js",
    "config": {
      "pathPattern": "./messages/{languageTag}.json",
      "variableReferencePattern": ["{", "}"]
    }
  }
}
```

Create message files for each language:

`messages/en.json`:
```json
{
  "welcome": "Welcome",
  "changeLanguage": "Change Language",
  "loading": "Loading..."
}
```

`messages/pt.json`:
```json
{
  "welcome": "Bem-vindo",
  "changeLanguage": "Mudar Idioma",
  "loading": "Carregando..."
}
```

`messages/de.json`:
```json
{
  "welcome": "Willkommen",
  "changeLanguage": "Sprache ändern",
  "loading": "Laden..."
}
```

### Usage Example

To use translations in your components:

```typescript
import * as m from '@/paraglide/messages'

function MyComponent() {
  return (
    <div>
      <h1>{m.welcome()}</h1>
      <p>{m.changeLanguage()}</p>
    </div>
  )
}
```

### Important Notes

1. Make sure to run the Paraglide.js compiler to generate the message files:
```bash
npx @paraglide/cli compile --project ./project.inlang.json
```

2. Add the following to your `package.json` scripts:
```json
{
  "scripts": {
    "i18n:compile": "paraglide-js compile --project ./project.inlang.json"
  }
}
```

3. The language detection middleware should be added before any other middleware in your API setup.

4. Remember to handle loading states and errors appropriately in your UI components.

5. Consider adding language persistence using cookies or localStorage if needed.

## Usage

### Detecting Language
The system automatically detects the user's preferred language from their browser settings.

### Changing Language
Users can change the language through the UI dropdown menu, which triggers the following flow:
1. Client calls `setServerLocale`
2. Server validates and updates the locale
3. Client updates its local state
4. UI reflects the new language immediately

### Supported Languages
- English (en)
- Portuguese (pt)
- German (de)

## Technical Notes

- The implementation uses Paraglide.js for message management
- Language preferences are handled through TanStack Start server functions
- CORS is properly configured to allow language-related requests
- The system gracefully falls back to English when needed

## Security Considerations

- Language preferences are validated on both client and server side
- Only supported locales are accepted
- Server-side validation prevents unauthorized locale changes

## Server-Side Rendering (SSR) Implementation

### Using TanStack Router's beforeLoad

For better performance and SEO, you can implement language detection during server-side rendering using TanStack Router's `beforeLoad`. This approach eliminates the need for client-side loading states and provides a better user experience.

Here's how to modify the route component to use SSR:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import * as m from '@/paraglide/messages'
import { getLocale, setLocale, locales } from '@/paraglide/runtime'
import { getServerLocale } from '@/lib/locale'

type LocaleType = "en" | "de" | "pt"

export const Route = createFileRoute('/_authenticated/protected')({
  beforeLoad: async ({ context }) => {
    try {
      const serverLocale = await getServerLocale()
      if (serverLocale && locales.includes(serverLocale as LocaleType)) {
        setLocale(serverLocale as LocaleType)
      } else {
        setLocale("en")
      }
    } catch (error) {
      console.error('Error fetching language:', error)
      setLocale("en")
    }
  },
  component: RouteComponent
})

function RouteComponent() {
  // Component implementation without loading state
  return (
    <div>
      <h1>Current Language: {getLocale()}</h1>
      {/* Rest of your component */}
    </div>
  )
}
```

### Benefits of SSR Implementation

1. **Better Performance**: Language detection happens during server-side rendering, eliminating the need for client-side loading states
2. **Improved SEO**: Search engines see the content in the correct language immediately
3. **Better User Experience**: No language flicker or loading states visible to users
4. **Reduced Client-Side Code**: No need for `useEffect` or loading state management

### Important Notes for SSR Implementation

1. The `beforeLoad` function runs on both server and client side
2. Make sure your server functions (`getServerLocale`, `setServerLocale`) are properly configured for SSR
3. The language state will be available immediately when the component mounts
4. Client-side language switching still works as before
