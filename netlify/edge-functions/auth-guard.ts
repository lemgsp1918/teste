import type { Config, Context } from '@netlify/edge-functions'

const ALLOWED_DOMAIN = /^[^@\s]+@seidor\.com$/i
const SUPABASE_URL = 'https://acswsuffuemuylnqjbkj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_q4y2OVWRipih5rpaAUEuPQ_D5HjWvbv'

function readCookie(req: Request, name: string) {
  const header = req.headers.get('cookie') || ''
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return null
}

// Pergunta ao Supabase quem é o dono do token. O servidor nunca confia só no cookie.
async function validUser(token: string | null) {
  if (!token) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const user = await res.json()
    if (!user?.email || !ALLOWED_DOMAIN.test(user.email)) return null
    if (!user.email_confirmed_at) return null
    return user
  } catch {
    return null
  }
}

// Bloqueia todo o site para quem não estiver logado com um e-mail @seidor.com confirmado.
export default async (req: Request, context: Context) => {
  const user = await validUser(readCookie(req, 'sb_at'))
  if (user) {
    const res = await context.next()
    res.headers.set('Cache-Control', 'private, no-store')
    return res
  }
  const url = new URL(req.url)
  const login = new URL('/login', url)
  login.searchParams.set('next', url.pathname + url.search)
  return Response.redirect(login, 302)
}

export const config: Config = {
  path: '/*',
  // /auth-client.js precisa ficar público: a tela de login o importa.
  excludedPath: ['/login', '/login.html', '/auth-client.js', '/.netlify/*'],
}
