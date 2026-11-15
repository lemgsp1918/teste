
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://acswsuffuemuylnqjbkj.supabase.co/rest/v1/'
const SUPABASE_ANON_KEY = 'sb_publishable_q4y2OVWRipih5rpaAUEuPQ_D5HjWvbv'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
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
  return data.user
}

export async function logout() {
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
