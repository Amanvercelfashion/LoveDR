import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useMatchStore = create((set, get) => ({
  candidates: [],
  currentMatch: null,
  matches: [],
  activeCall: null,
  loading: false,

  fetchCandidates: async (userId) => {
    const { data } = await supabase.rpc('get_candidates', { p_user_id: userId })
    set({ candidates: data || [] })
  },

  sendVideoRequest: async (matchId, receiverId) => {
    const { data, error } = await supabase
      .from('video_requests')
      .insert({ match_id: matchId, sender_id: get().user?.id, receiver_id: receiverId, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  respondToRequest: async (requestId, status) => {
    const { data, error } = await supabase
      .from('video_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  setCurrentMatch: (match) => set({ currentMatch: match }),
  setActiveCall: (call) => set({ activeCall: call }),
}))
