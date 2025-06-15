import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  // createRootRouteWithContext,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

import { AuthProvider } from '@/context/auth-context2'
// import { AuthContext, AuthProvider, useAuth } from '@/context/auth-context'

import { ThemeProvider, useTheme } from '@/context/theme-context'
import { getThemeServerFn } from '@/lib/theme'




// ADDED
// export interface RouterContext {
//   auth: AuthContext | null,
//   test: string | null
//   // authentication: {
//   //   isLogged: () => boolean;
//   //   getToken: () => string | null;
//   //   logout: () => void;
//   // };
// }

// export const Route = createRootRouteWithContext<RouterContext>()({
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title:
          'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  loader: () => getThemeServerFn(),
  component: RootComponent
})

function RootComponent() {
  const data = Route.useLoaderData();

  // const data = Route.useLoaderData();
  // const [isClient, setIsClient] = React.useState(false);
  // console.log("isClient", isClient);
  // console.log("data", data);

  // React.useEffect(() => {
  //   setIsClient(true);
  // }, []);

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
  console.log('theme', theme)
  return (
    <html className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-regular antialiased tracking-wide">
        <div className="p-2 flex gap-2 text-lg">
          <h1>Root</h1>
        </div>
        <hr />
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
