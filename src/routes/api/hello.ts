import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/hello')({
  GET: async ({ request }) => {
    return json({ message: 'Hello, world!' })
  }
})
