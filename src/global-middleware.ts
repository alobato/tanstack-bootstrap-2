import { registerGlobalMiddleware } from '@tanstack/react-start'
import { logMiddleware } from './utils/loggingMiddleware'
import { cloudflareMiddleware } from './lib/cf-middleware'

registerGlobalMiddleware({
  middleware: [logMiddleware, cloudflareMiddleware]
})
