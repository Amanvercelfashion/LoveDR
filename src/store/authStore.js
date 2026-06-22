import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    set({ profile: data })
    return data
  },

  initSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user })
      await useAuthStore.getState().fetchProfile(session.user.id)
    }
    set({ loading: false })
  },
}))
