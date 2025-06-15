import { createFileRoute, useNavigate, redirect, useSearch, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from "@/context/auth-context2"
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
// const fallback = '/dashboard' as const

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: z.object({
    redirect: z.string().optional().catch('')
  }),
  component: LoginComponent
})

function LoginComponent() {

  const auth = useAuth()
  const router = useRouter()
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/sign-in' }) as { redirect?: string }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    console.log("auth.isLoading", auth.isLoading)
    console.log("auth?.user", auth?.user);
    if (auth?.isLoading === false && auth?.user) {
      router.navigate({ to: '/protected' })
    }
  }, [auth, router])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email e senha são obrigatórios')
      return
    }

    await auth.login(email, password)

    await router.invalidate()

    // This is just a hack being used to wait for the auth state to update
    // in a real app, you'd want to use a more robust solution
    await sleep(1)

    navigate({ to: search.redirect || '/dashboard' });
    // await navigate({ to: search.redirect || fallback })


    // const success = await signIn(email, password);
    // if (success) {
    //   navigate({ to: search.redirect || '/dashboard' });
    // } else {
    //   setError('Email ou senha inválidos');
    // }
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  )
}