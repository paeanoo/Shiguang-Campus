import { supabase } from '@lib/supabase'

export const authService = {
  async register(email, password, username, userType, authCode) {
    try {
      const meta = {
        user_type: userType,
        username: username || email.split('@')[0],
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
      }

      if (userType === 'organizer') {
        if (!authCode || authCode.trim() === '') {
          return { data: null, error: '请输入负责人认证码' }
        }
        meta.auth_code = authCode.trim().toUpperCase()
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        return { user: { ...user, ...profile }, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },

  async checkAuthCode(code) {
    try {
      const { data, error } = await supabase
        .rpc('get_auth_code_status', { p_code: code })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getAvailableAuthCodesCount() {
    try {
      const { data, error } = await supabase
        .rpc('get_available_auth_codes_count')

      if (error) throw error

      return { count: data, error: null }
    } catch (error) {
      return { count: null, error }
    }
  },

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
