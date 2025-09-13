// stores/favorites.ts
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
  id: 'favorites',
  state: () => ({
    favoriteImages: [] as { url: string; fileName: string }[],
  }),
  persist: true, // これだけで localStorage に保存される
  actions: {
    addFavorite(image: { url: string; fileName: string }) {
      if (!this.favoriteImages.some(img => img.url === image.url)) {
        this.favoriteImages.push(image)
      }
    },
    removeFavorite(idx: number) {
      this.favoriteImages.splice(idx, 1)
    },
    clearFavorites() {
      this.favoriteImages = []
    },
  },
})


