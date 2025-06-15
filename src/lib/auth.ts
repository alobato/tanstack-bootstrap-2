// app/lib/auth.ts
import { createServerFn } from '@tanstack/start'
import { getWebRequest, setCookie } from '@tanstack/react-start/server'
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-aqui'

// Fake users DB
const fakeUsers = [
  { id: '1', email: 'test@gmail.com', password: '123456', name: 'Test User' },
  { id: '2', email: 'admin@gmail.com', password: 'admin', name: 'Admin User' }
]

// Utilitário para parse de cookies
function parseCookies(cookieHeader: string) {
  return cookieHeader
    .split(';')
    .reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=')
      cookies[name] = value
      return cookies
    }, {} as Record<string, string>)
}

// Login
export const login = createServerFn({ method: 'POST' })
  .validator((data: { email: string, password: string }) => data)
  .handler(async ({ data }) => {
    const user = fakeUsers.find((u) => u.email === data.email && u.password === data.password)
    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(JWT_SECRET))

    setCookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  })

// Logout
export const logout = createServerFn({ method: 'POST' })
  .handler(async () => {
    setCookie('token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0
    })

    return {
      success: true
    }
  })

// Verificar usuário atual
export const getCurrentUser = createServerFn({method: 'GET'})
  .handler(async ({ context, response, signal }) => {
    const request = getWebRequest()
    // console.log("---request", request);
    // if (!context || !(context as any).request) return null
    const cookieHeader = (request as any).headers.get('Cookie')
    if (!cookieHeader) return null

    const cookies = parseCookies(cookieHeader)
    const token = cookies['token']

    if (!token) return null

    // return { id: 1, email: "aa@aa.com", name: 'bbb' }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      const user = fakeUsers.find(u => u.id === payload.userId)
      if (!user) return null
      return { id: user.id, email: user.email, name: user.name }
    } catch {
      return null
    }
  })
