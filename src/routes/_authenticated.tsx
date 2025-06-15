import { useEffect, useState } from 'react'
import { createFileRoute, useRouter, Outlet, redirect } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-context2'
import { getCurrentUser } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated')({
  component: Authenticated,
  beforeLoad: async ({ location }) => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw redirect({ to: '/sign-in', search: { redirect: location.pathname } })
    }
    return { user: currentUser }
  },
  loader: async ({ context }) => {
    const { user } = context
    return { user }
  }
})

function Authenticated() {
  const loaderData = Route.useLoaderData()
  // const { user: serverUser } = Route.useRouteContext()
  const serverUser = loaderData.user

  const router = useRouter()
  const auth = useAuth()
  const { user: clientUser, isLoading } = useAuth()

  const displayUser = clientUser || serverUser

  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {

      if (!clientUser) {
        router.navigate({
          to: '/sign-in',
          search: { redirect: window.location.pathname }
        })
      } else {
        setIsChecking(false)
      }

    }
  }, [auth, router])

  return (
    <div>
      <h1>Authenticated - {displayUser?.email}</h1>
      <div>isChecking: {isChecking.toString()}</div>
      <div>
        <button onClick={() => { auth.logout() }}>Logout</button>
      </div>
      <Outlet />
    </div>
  )
}
