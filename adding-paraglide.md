# Adding Paraglide to Your Project

This tutorial will guide you through the process of adding Paraglide.js for internationalization (i18n) to your project. Paraglide is a lightweight, type-safe internationalization library that works great with modern JavaScript/TypeScript projects.

## Prerequisites

- A Node.js project (preferably using pnpm, npm, or yarn)
- TypeScript support
- Vite as your build tool

## Step 1: Install Dependencies

First, install the required Paraglide packages:

```bash
pnpm add -D @inlang/paraglide-js @inlang/paraglide-vite
```

## Step 2: Initialize Paraglide

You have two options to initialize Paraglide:

### Option 1: Using CLI (Recommended)

Run the Paraglide CLI to automatically set up your project:

```bash
npx @inlang/paraglide-js@latest init
```

The CLI will:
- Create a new inlang project
- Ask where to place compiled files (default: `./src/paraglide`)
- Add `@inlang/paraglide-js` to devDependencies
- Add build command to package.json
- Add Sherlock VSCode extension to workspace recommendations
- Offer to set up automatic translations

### Option 2: Manual Setup

If you prefer manual setup, follow these steps:

1. Create a `project.inlang` directory in your project root
2. Create a `settings.json` file inside it with the following content:

```json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "baseLocale": "en",
  "locales": [
    "en",
    "de",
    "pt"
  ],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@4/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@2/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{locale}.json"
  }
}
```

## Step 3: Configure Vite

Update your `app.config.ts` (or `vite.config.ts`) to include the Paraglide plugin:

```typescript
import { defineConfig } from "@tanstack/react-start/config";
import { paraglide } from "@inlang/paraglide-vite";

export default defineConfig({
  plugins: [
    // ... other plugins
    paraglide({
      project: "./project.inlang",
      outdir: "./src/paraglide",
    }),
  ],
});
```

## Step 4: Create Message Files

Create a `messages` directory in your project root and add JSON files for each locale:

```bash
mkdir messages
touch messages/en.json messages/de.json messages/pt.json
```

Example content for `messages/en.json`:
```json
{
  "example_message": "Hello, {username}!"
}
```

## Step 5: Add VSCode Extension (Optional but Recommended)

Add the Inlang VSCode extension to your workspace recommendations by creating or updating `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "inlang.vs-code-extension"
  ]
}
```

## Step 6: Using Paraglide in Your Code

Here's how to use Paraglide in your React components:

```typescript
import * as m from '@/paraglide/messages'
import { getLocale, setLocale, locales } from '@/paraglide/runtime'

// Example component
function MyComponent() {
  // Get current locale
  const currentLocale = getLocale()

  // Set locale
  const changeLocale = (newLocale: typeof locales[number]) => {
    setLocale(newLocale)
  }

  // Use messages
  return (
    <div>
      <h1>{m.example_message({ username: 'John' })}</h1>
      <button onClick={() => changeLocale('pt')}>Switch to Portuguese</button>
    </div>
  )
}
```

## Step 7: Auto-detect User's Language

To automatically detect and set the user's preferred language, you can use this effect in your root component:

```typescript
import { useEffect } from 'react'
import { getLocale, setLocale, locales } from '@/paraglide/runtime'

useEffect(() => {
  const lang = navigator.languages?.[0] || navigator.language
  const baseLang = lang.split('-')[0] as typeof locales[number]

  if (locales.includes(lang as typeof locales[number])) {
    setLocale(lang as typeof locales[number])
  } else if (locales.includes(baseLang)) {
    setLocale(baseLang)
  } else {
    setLocale('en') // fallback to English
  }
}, [])
```

## Additional Tips

1. Add the following to your `.gitignore`:
```
/src/paraglide
/project.inlang/cache
```

2. Make sure to run the Paraglide compiler during your build process. The CLI should have added this automatically to your package.json scripts.

3. Use TypeScript for better type safety and autocompletion with your messages.

4. Consider using the Inlang VSCode extension for a better development experience with message management.

## Troubleshooting

- If messages aren't updating, try clearing the Paraglide cache in `project.inlang/cache`
- Make sure your message files are properly formatted JSON
- Check that your locale codes match exactly in both `settings.json` and your message files
- Verify that the Paraglide plugin is properly configured in your Vite config

## Resources

- [Paraglide Documentation](https://inlang.com/documentation)
- [GitHub Repository](https://github.com/inlang/inlang)
- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension)
