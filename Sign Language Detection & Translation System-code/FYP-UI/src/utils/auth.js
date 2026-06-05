const USERS_KEY = 'ssc-users'
const SESSION_KEY = 'ssc-session'

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function createDemoUser({
  fullName = 'Demo User',
  email = 'demo@sindhisignconnect.app',
  role = 'Signer',
}) {
  return {
    id: crypto.randomUUID(),
    fullName,
    email,
    password: 'demo12345',
    role,
  }
}

export function seedDemoUser() {
  const users = getUsers()
  if (users.length > 0) return users

  const demoUsers = [
    createDemoUser({}),
    createDemoUser({
      fullName: 'Demo Non-Signer',
      email: 'guest@sindhisignconnect.app',
      role: 'Non-Signer',
    }),
  ]

  saveUsers(demoUsers)
  return demoUsers
}
