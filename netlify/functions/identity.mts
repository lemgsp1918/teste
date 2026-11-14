import type { UserLoginEvent, UserSignupEvent, UserValidateEvent } from '@netlify/functions'

const ALLOWED_DOMAIN = /^[^@\s]+@seidor\.com$/i
const isAllowed = (email?: string | null) => !!email && ALLOWED_DOMAIN.test(email.trim())

// Garante no servidor que apenas e-mails @seidor.com possam se cadastrar e entrar.
export default {
  userValidate(event: UserValidateEvent) {
    if (!isAllowed(event.user.email)) return event.deny()
  },
  userSignup(event: UserSignupEvent) {
    if (!isAllowed(event.user.email)) return event.deny()
  },
  userLogin(event: UserLoginEvent) {
    if (!isAllowed(event.user.email)) return event.deny()
  },
}
