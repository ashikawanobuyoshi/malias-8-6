// middleware/locale-redirect.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/ja') {
    return navigateTo('/')  // 例: トップページにリダイレクト
  }
})
