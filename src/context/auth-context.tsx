// https://tanstack.com/router/latest/docs/framework/react/examples/authenticated-routes
import * as React from 'react'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface AuthContext {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  user: string | null
}

const AuthContext = React.createContext<AuthContext | null>(null)

// const key = 'tanstack.auth.user'

// // function getStoredUser() {
// //   return localStorage.getItem(key)
// // }

// function getStoredUser() {
//   if (typeof window === "undefined") {
//     // SSR: Não tente acessar localStorage
//     return null;
//   }
//   const user = localStorage.getItem(key);
//   return user;
// }

// function setStoredUser(user: string | null) {
//   if (user) {
//     localStorage.setItem(key, user)
//   } else {
//     localStorage.removeItem(key)
//   }
// }

// NOVO: Busca usuário autenticado via cookie
async function fetchUserFromCookie() {
  const res = await fetch('/api/me', { credentials: 'include' })
  if (res.ok) {
    const data: any = await res.json()
    return data.user // ou null
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // const [user, setUser] = React.useState<string | null>(getStoredUser())
  const [user, setUser] = React.useState<string | null>(null)
  const isAuthenticated = !!user

  // NOVO: Buscar usuário autenticado ao montar
  React.useEffect(() => {
    fetchUserFromCookie().then(setUser)
  }, [])

  const logout = React.useCallback(async () => {
    // await sleep(250)
    // setStoredUser(null)
    // setUser(null)
    await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    // await sleep(500)
    // console.log("login username", username);
    // setStoredUser(username)
    // setUser(username)
    const res = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      const data: any = await res.json()
      setUser(data.user)
    } else {
      throw new Error('Login inválido')
    }
  }, [])

  // React.useEffect(() => {
  //   setUser(getStoredUser())
  // }, [])

  const value = React.useMemo(() => ({
    isAuthenticated,
    user,
    login,
    logout
  }), [isAuthenticated, user, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  console.log("context1", context);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
