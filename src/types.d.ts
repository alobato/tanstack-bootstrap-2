import 'hono'
import { AuthContext } from '@/context/auth-context'


declare module 'hono' {
  interface ContextVariableMap {
    cloudflare: Env
  }
}

declare module '@tanstack/react-router' {
  interface RouterContext {
    auth: AuthContext | null
  }
}
