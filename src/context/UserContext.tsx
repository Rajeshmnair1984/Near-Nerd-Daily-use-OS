import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AuthService, { UserProfile, Organization } from '@services/AuthService'

interface UserContextType {
  user: UserProfile | null
  organization: Organization | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          setUserState(currentUser)
          const org = await AuthService.getOrganization(currentUser.organizationId)
          setOrganization(org)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const currentUser = await AuthService.login({ email, password })
    setUserState(currentUser)
    const org = await AuthService.getOrganization(currentUser.organizationId)
    setOrganization(org)
  }

  const logout = async () => {
    await AuthService.logout()
    setUserState(null)
    setOrganization(null)
  }

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    const updatedUser = await AuthService.updateUserProfile(user.id, updates)
    setUserState(updatedUser)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
