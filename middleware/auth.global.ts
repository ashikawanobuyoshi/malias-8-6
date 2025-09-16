// middleware/auth.global.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore()

  // 未ログインユーザーがアクセスしてはいけないページだけリダイレクト
  const protectedPaths = ['/customer-page', '/checkout'] // 例：保護したいページ
  if (!user.isLoggedIn && protectedPaths.includes(to.path)) {
    return navigateTo('/') // トップページなどにリダイレクト
  }
})

