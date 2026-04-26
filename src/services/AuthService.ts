import { supabase } from './supabaseClient'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  organizationName: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  organizationId: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer'
  isActive: boolean
}

export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

class AuthService {
  // Sign up with email, password, and create organization
  async signUp(data: SignUpData): Promise<{ user: UserProfile; organization: Organization }> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Create organization
      const slug = data.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          slug,
          description: null,
          is_active: true,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Create user profile with admin role for first user
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          organization_id: orgData.id,
          email: data.email,
          full_name: data.fullName,
          role: 'admin',
          is_active: true,
        })
        .select()
        .single()

      if (profileError) throw profileError

      return {
        user: this.mapUserProfile(profileData),
        organization: this.mapOrganization(orgData),
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  // Login with email and password
  async login(data: LoginData): Promise<UserProfile> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to login')

      // Fetch user profile
      const profile = await this.getCurrentUser()
      if (!profile) throw new Error('User profile not found')

      return profile
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<UserProfile | null> {
    let authUser: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      authUser = authData.user

      if (authError || !authUser) return null

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error || !data) {
        return this.mapAuthUserFallback(authUser)
      }

      return this.mapUserProfile(data)
    } catch (error) {
      console.error('Get current user error:', error)
    }

    return authUser ? this.mapAuthUserFallback(authUser) : null
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Get user's organization
  async getOrganization(orgId: string): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (error || !data) return null

      return this.mapOrganization(data)
    } catch (error) {
      console.error('Get organization error:', error)
      return null
    }
  }

  // Add user to organization (admin only)
  async inviteUserToOrganization(
    organizationId: string,
    email: string,
    role: 'admin' | 'manager' | 'staff' | 'viewer'
  ): Promise<UserProfile> {
    try {
      // Create auth user with temporary password (user will reset on first login)
      const tempPassword = Math.random().toString(36).slice(-12)

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: false,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Create user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          organization_id: organizationId,
          email,
          role,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      return this.mapUserProfile(data)
    } catch (error) {
      console.error('Invite user error:', error)
      throw error
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = await this.getCurrentUser()

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          role: updates.role,
          is_active: updates.isActive,
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return this.mapUserProfile(data)
    } catch (error) {
      console.error('Update user profile error:', error)
    }

    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to update user profile')

    return {
      ...(currentUser || this.mapAuthUserFallback(authData.user)),
      fullName: updates.fullName ?? currentUser?.fullName ?? null,
      avatarUrl: updates.avatarUrl ?? currentUser?.avatarUrl ?? null,
    }
  }

  // Helper: Map database user profile to interface
  private mapUserProfile(data: any): UserProfile {
    return {
      id: data.id,
      organizationId: data.organization_id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role,
      isActive: data.is_active,
    }
  }

  private mapAuthUserFallback(authUser: any): UserProfile {
    return {
      id: authUser.id,
      organizationId: authUser.user_metadata?.organization_id || '',
      email: authUser.email || authUser.user_metadata?.email || '',
      fullName: authUser.user_metadata?.full_name || null,
      avatarUrl: authUser.user_metadata?.avatar_url || null,
      role: authUser.user_metadata?.role || 'viewer',
      isActive: true,
    }
  }

  // Helper: Map database organization to interface
  private mapOrganization(data: any): Organization {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      isActive: data.is_active,
    }
  }
}

export default new AuthService()
