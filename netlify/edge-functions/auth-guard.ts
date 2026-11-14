import { getUser } from '@netlify/identity'
import type { Config, Context } from '@netlify/edge-functions'

const ALLOWED_DOMAIN = /^[^@\s]+@seidor\.com$/i

// Bloqueia todo o site para quem não estiver logado com um e-mail @seidor.com.
export default async (req: Request, context: Context) => {
  const user = await getUser()
  if (user?.email && ALLOWED_DOMAIN.test(user.email)) {
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
  excludedPath: ['/login', '/login.html', '/.netlify/*'],
}
