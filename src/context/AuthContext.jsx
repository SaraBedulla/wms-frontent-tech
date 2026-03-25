import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wms_user')) } catch { return null }
  })

  const saveAuth = useCallback((data) => {
    localStorage.setItem('wms_token', data.token)
    localStorage.setItem('wms_user', JSON.stringify({
      username: data.username,
      fullName: data.fullName,
      role: data.role
    }))
    setUser({ username: data.username, fullName: data.fullName, role: data.role })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('wms_token')
    localStorage.removeItem('wms_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
