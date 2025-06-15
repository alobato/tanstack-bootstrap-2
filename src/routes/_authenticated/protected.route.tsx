import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/protected')({
  // beforeLoad: async ({ location }) => {
    // console.log("beforeLoad location", location);
    // Chama a API que retorna o usuário autenticado (usa cookie)
    // try {
    //   const res = await fetch('http://localhost:3000/api/me', { credentials: 'include' })
    //   const data = await res.json() as { user: { id: number; email: string } | null }
    //   console.log("----data", data);
    //   if (!data.user) {
    //     throw redirect({ to: '/sign-in', search: { redirect: location.pathname } })
    //   }
    // } catch (error) {
    //   console.error("Error in beforeLoad", error);
    //   // throw redirect({ to: '/sign-in', search: { redirect: location.pathname } })
    // }

  // },
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div>
      <h1>Protected Route</h1>
      <Outlet />
    </div>
  )
}
