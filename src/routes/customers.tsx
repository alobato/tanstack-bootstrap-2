import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { customersGet } from '@/db/customer.model'
import { createServerFn } from '@tanstack/react-start'
import { dbMiddleware } from '@/lib/db-middleware'

const getCustomers = createServerFn({method: 'GET'})
  .middleware([dbMiddleware])
  .handler(async (ctx) => {
    const result = await customersGet(ctx.context.db)
    return result
  })

export const Route = createFileRoute('/customers')({
  component: Home,
  loader: async () => await getCustomers(),
})

function Home() {
  const state = Route.useLoaderData()

  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
      <div>
        {state?.map((customer: any) => (
          <div key={customer.id}>{customer.name}</div>
        ))}
      </div>
      <Button>Button</Button>
    </div>
  )
}
