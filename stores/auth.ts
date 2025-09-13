// ~/stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    userEmail: '',
    folder: ''
  }),
  actions: {
    async login(email: string, password: string, folder: string) {
      // 簡易チェック（本番はAPI連携にする）
      if (email === 'test@example.com' && password === '2024pass') {
        this.isAuthenticated = true
        this.userEmail = email
        this.folder = folder
        return true
      }
      this.isAuthenticated = false
      return false
    },
    logout() {
      this.isAuthenticated = false
      this.userEmail = ''
      this.folder = ''
    },
    checkAuth() {
      return this.isAuthenticated
    }
  }
})

