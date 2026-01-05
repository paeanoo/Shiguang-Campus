import { supabase } from '@lib/supabase'

export const storageService = {
  async uploadImage(file, bucket = 'images', folder = 'uploads', userId = null) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = userId ? `${userId}/${fileName}` : `${folder}/${fileName}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return { url: publicUrl, error: null }
    } catch (error) {
      return { url: null, error }
    }
  },

  async deleteImage(url, bucket = 'images') {
    try {
      const urlParts = url.split('/')
      const filePath = urlParts.slice(-2).join('/')

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async uploadProductImage(file) {
    return this.uploadImage(file, 'products', 'product-images')
  },

  async uploadEventImage(file) {
    return this.uploadImage(file, 'events', 'event-images')
  },

  async uploadAvatar(file, userId) {
    return this.uploadImage(file, 'avatars', null, userId)
  }
}
