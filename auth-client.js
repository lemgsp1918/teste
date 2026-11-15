import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://acswsuffuemuylnqjbkj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_q4y2OVWRipih5rpaAUEuPQ_D5HjWvbv'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// O servidor (auth-guard) não lê o localStorage do Supabase. Por isso o
// access token também é gravado em um cookie, que o guard valida a cada acesso.
const COOKIE = 'sb_at'

export function syncCookie(session) {
  if (session?.access_token) {
    const secs = session.expires_at
      ? Math.max(60, session.expires_at - Math.floor(Date.now() / 1000))
      : 3600
    document.cookie = `${COOKIE}=${session.access_token}; Path=/; Max-Age=${secs}; SameSite=Lax; Secure`
  } else {
    document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`
  }
}

// Mantém o cookie atualizado (login, renovação automática do token, logout).
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') syncCookie(null)
  else if (session) syncCookie(session)
})

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  syncCookie(data.session)
  return data.user
}

export async function signup(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: location.href.split(/[?#]/)[0],
    },
  })
  if (error) throw error
  if (data.session) syncCookie(data.session)
  return data.user
}

export async function logout() {
  syncCookie(null)
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession()
  if (error) throw error
  syncCookie(data.session)
  return data.session
}

export async function requestPasswordRecovery(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: location.href.split(/[?#]/)[0],
  })
  if (error) throw error
}

export async function updateUser(attributes) {
  const { data, error } = await supabase.auth.updateUser(attributes)
  if (error) throw error
  return data.user
}
