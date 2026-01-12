import { reactive } from 'vue'
import { supabase } from '@lib/supabase'

export const userProfileModalState = reactive({
  show: false,
  user: null
})

export async function openUserProfileModal(userId) {
  if (!userId) return
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, nickname, avatar_url, coins, carbon_reduced, check_in_streak, bio, created_at')
      .eq('id', userId)
      .single()
    if (error) {
      console.warn('openUserProfileModal fetch failed', error)
      return
    }
    userProfileModalState.user = data || null
    userProfileModalState.show = true
  } catch (e) {
    console.error('openUserProfileModal error', e)
  }
}

export function closeUserProfileModal() {
  userProfileModalState.show = false
  userProfileModalState.user = null
}

