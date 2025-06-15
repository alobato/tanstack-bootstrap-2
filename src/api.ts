// import {
//   createStartAPIHandler,
//   defaultAPIFileRouteHandler,
// } from '@tanstack/react-start/api'

// export default createStartAPIHandler(defaultAPIFileRouteHandler)

import { Hono, Context, Next } from 'hono'
import { cors } from 'hono/cors';
import { jwtVerify, SignJWT } from "jose";

import {
  createStartAPIHandler,
  defaultAPIFileRouteHandler
} from '@tanstack/react-start/api'
import { createYoga, createSchema } from 'graphql-yoga'


// Middleware antigo baseado em Authorization header
// async function authenticateToken(c: Context, next: Next) {
//   const authHeader = c.req.header('Authorization');
//   const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
//
//   if (!token) {
//     return c.json({ error: 'Token não fornecido' }, 401);
//   }
//
//   try {
//     const payload = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'sua-chave-secreta'));
//     c.set('user', payload); // Adiciona o payload ao contexto
//     await next();
//   } catch (error) {
//     console.error('Erro ao verificar token:', error);
//     return c.json({ error: 'Token inválido ou expirado' }, 403);
//   }
// }

// NOVO: Middleware baseado em cookie
export async function authenticateCookie(c: Context, next: Next) {
  const cookie = c.req.header('Cookie') || ''
  const match = cookie.match(/token=([^;]+)/)
  const token = match ? match[1] : null

  if (!token) {
    return c.json({ error: 'Token não fornecido' }, 401)
  }

  try {
    const payload = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'sua-chave-secreta'))
    c.set('user', payload) // Adiciona o payload ao contexto
    await next()
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return c.json({ error: 'Token inválido ou expirado' }, 403)
  }
}

const typeDefs = /* GraphQL */ `
  type Query {
    hello: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Olá, mundo do GraphQL!',
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  landingPage: true, // Habilita o GraphiQL
  fetchAPI: globalThis, // Importante para compatibilidade,
  context: async ({ request }) => {
    console.log("request", request);
    let cloudflare: Env;
    if (import.meta.env.DEV) {
      const wrangler = await import('wrangler');
      const { env } = await wrangler.getPlatformProxy<Env>();
      cloudflare = env;
    } else {
      cloudflare = process.env as unknown as Env;
    }
    console.log("----cloudflare", cloudflare);
    return {
      cloudflare,
    };
  },
});

// Criar instância do Hono
const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['*'],
    exposeHeaders: ['*'],
    maxAge: 86400, // Opcional: cache do preflight por 24h
    credentials: false, // Não permite cookies (true só se precisar)
  })
);

app.use('*', async (c, next) => {
  if (import.meta.env.DEV) {
    const wrangler = await import('wrangler');
    const { env } = await wrangler.getPlatformProxy<Env>();
    c.set('cloudflare', env);
  } else {
    c.set('cloudflare', process.env as unknown as Env);
  }
  await next();
});

// Handler combinado que tenta primeiro o Hono e depois as rotas do TanStack
const combinedHandler = async (ctx: { request: Request }) => {
  const { request } = ctx

  const url = new URL(request.url)
  console.log("url.pathname", url.pathname);

  //   // Verificar se é uma requisição para o GraphQL
  if (url.pathname === '/api/graphql') {
    // return await yoga.fetch(request)

    try {
        // Usar o yoga para processar a requisição
        const yogaResponse = await yoga.fetch(request)

        // Converter a resposta do Yoga para um formato compatível com TanStack Start
        // Extrair os dados necessários da resposta original
        const body = await yogaResponse.text()
        const headers = Object.fromEntries(yogaResponse.headers.entries())
        const status = yogaResponse.status

        // Criar uma nova Response padrão do Web API
        return new Response(body, {
          status,
          headers
        })
      } catch (error) {
        console.error('Erro ao processar requisição GraphQL:', error)
        return new Response(JSON.stringify({
          errors: [{ message: 'Erro ao processar requisição GraphQL' }]
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }


  }

  const honoResponse = await app.fetch(request)

  // Se o Hono retornar 404, usa o handler padrão do TanStack
  if (honoResponse.status === 404) {
    return await defaultAPIFileRouteHandler(ctx)
  }
  return honoResponse
}

// Definir rotas no Hono
app.get('/api/hello', (c) => {
  const cloudflare = c.var?.cloudflare || c.get?.('cloudflare');
  console.log("cloudflare", cloudflare);
  return c.json({ message: 'Olá do Hono!' })
})

// Exemplo de rota com parâmetros
app.get('/api/users/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ id, name: `Usuário ${id}` })
})

// Exemplo de rota POST
app.post('/api/users', async (c) => {
  const body = await c.req.json()
  return c.json({ message: 'Usuário criado', data: body }, 201)
})

app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json();

  console.log("email", email);
  console.log("password", password);

  if (!email || !password) {
    return c.json({ error: 'Email e senha são obrigatórios' }, 400);
  }

  try {
    // Busca o usuário pelo email
    // const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456'
    }

    if (!user) {
      return c.json({ error: 'Email ou senha inválidos' }, 401);
    }

    // Verifica a senha
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = true;
    if (!isPasswordValid) {
      return c.json({ error: 'Email ou senha inválidos' }, 401);
    }

    // Gera o JWT
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'sua-chave-secreta'));

    console.log("token", token);

    // NOVO: Setar o token em um cookie HttpOnly
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure`)
    // return c.json({ token });
    return c.json({ user: { id: user.id, email: user.email } });

  } catch (error) {
    console.error('Erro no login:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// NOVO: Endpoint para logout (limpa o cookie)
app.post('/api/logout', async (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure')
  return c.json({ ok: true })
});

// NOVO: Endpoint para retornar usuário autenticado
app.get('/api/me', async (c) => {
  const cookie = c.req.header('Cookie') || ''
  const match = cookie.match(/token=([^;]+)/)
  const token = match ? match[1] : null
  if (!token) {
    return c.json({ user: null })
  }
  try {
    const payload = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'sua-chave-secreta'))
    console.log("/api/me payload", payload);
    // payload.payload: { userId, email, ... }
    return c.json({ user: { id: payload.payload.userId, email: payload.payload.email } })
  } catch (err) {
    console.error("Error in /api/me", err);
    return c.json({ user: null })
  }
});

app.post('/api/profile', authenticateCookie, (c) => {
  // const user = c.get('user'); // Payload do JWT definido pelo middleware

  console.log("******c", c);

  // const user = {
  //   id: 1,
  //   email: 'test@gmail.com',
  // }

      // {
    //   userId: 1,
    //   email: 'test@gmail.com',
    //   iat: 1746921139,
    //   exp: 1746924739
    // }

    const user = {
      id: 1,
      email: 'test@gmail.com',
      iat: 1746921139,
      exp: 1746924739
    }

  return c.json({ user });
});

// Exemplo de rota GET protegida
app.get('/api/secret', authenticateCookie, (c) => {
  const user = c.get<any>('user')
  return c.json({ message: 'Você acessou uma rota protegida!', user })
})

// app.route('/auth', authRouter);

// Exportar o handler combinado para o TanStack Start usar
export default createStartAPIHandler(combinedHandler)
