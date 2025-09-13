// plugins/init-auth.client.ts
import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // Pinia の登録を待ってから store を使う
    nuxtApp.hook('app:mounted', () => {
      const authStore = useAuthStore()
      const savedUser = localStorage.getItem('authUser')
      if (savedUser) {
        try {
          authStore.user = JSON.parse(savedUser)
          console.log('認証情報を復元しました:', authStore.user)
        } catch {
          console.warn('認証情報の復元に失敗しました')
          authStore.user = null
        }
      }
    })
  }
})
