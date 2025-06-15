import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { getCloudflareContext } from '@/lib/cloudflare-helpers'
import { initDb } from '@/lib/db'
import { customer } from '@/db/schema'
// import { eq } from 'drizzle-orm'

export interface Env {
  DB: D1Database
}

type Customer = {
  id: number
  name: string
}

export const APIRoute = createAPIFileRoute('/api/customers')({
  GET: async ({ request }) => {
    try {
      const ctx = await getCloudflareContext()
      // const result = await ctx.env.DB.prepare(`
      //   SELECT name FROM sqlite_master WHERE type='table';
      // `).all()
      // console.log('Tabelas:', result.results.map((row) => row.name))

      const db = initDb({ DB: ctx.env.DB })
      const customers = await db.select().from(customer).limit(100).all()
      console.log("customers", customers)

      return json(customers)
    } catch (error) {
      console.error("Error db", error)
      return json({ error: 'Internal Server Error' }, { status: 500 })
    }

    // console.info('Fetching users... @', request.url)
    // const res = await fetch('https://jsonplaceholder.typicode.com/users')
    // if (!res.ok) {
    //   throw new Error('Failed to fetch users 2')
    // }

    // const data = (await res.json()) as Array<User>

    // const list = data.slice(0, 10)

    // return json(list.map((u) => ({ id: u.id, name: u.name, email: u.email })))
  }
})
