import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/protected/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/protected/"!</div>
}
