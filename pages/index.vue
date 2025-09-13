<template>
  <div class="p-4 max-w-5xl mx-auto">
    <!-- 認証フォーム -->
    <div v-if="!isAuthenticated" class="mb-6">
      <h2 class="text-lg font-semibold mb-2">メールアドレスとパスワードをご入力ください</h2>
      <input v-model="emailInput" type="email" placeholder="メールアドレス" class="border p-2 rounded w-full mb-2" />
      <input v-model="passwordInput" type="password" placeholder="パスワード" class="border p-2 rounded w-full mb-2" @keyup.enter="checkPassword" />
      <input v-model="folderInput" type="text" placeholder="フォルダ名（例: omiyamairi_2025）" class="border p-2 rounded w-full mb-2" />
      <button @click="checkPassword" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">ログイン＆読み込み</button>
      <p v-if="authError" class="text-red-500 mt-2">メールアドレス・パスワードが正しくありません</p>
    </div>

    <!-- ギャラリー表示 -->
    <div>
      <h1 class="text-xl font-bold mb-2">ようこそ、{{ isAuthenticated ? emailInput : 'ゲスト' }} さん。</h1>
      <h2 class="text-2xl font-bold mb-4">{{ isAuthenticated ? '会員様ギャラリー' : `公開ギャラリー（${publicFolder}）` }}</h2>

      <div v-if="loading" class="mt-4 text-gray-500">読み込み中...</div>
      <div v-else-if="imagesData.length === 0" class="mt-4 text-gray-500">画像が見つかりません。</div>

      <div v-else>
        <!-- モニター -->
        <div class="monitor-container flex gap-4 mb-4">
          <div class="monitor">
           <img
  v-if="imagesData[leftIndex]"
  :src="imagesData[leftIndex].url"
  data-zoomable
  />
          </div>
          <div class="monitor">
          <img
  v-if="imagesData[rightIndex]"
  :src="imagesData[rightIndex].url"
  data-zoomable
  />
          </div>
        </div>

        <!-- サムネイル -->
        <div class="toggle-scroll-link mb-4">
          <label><input type="checkbox" v-model="isScrollLinked" /> サムネイル連動</label>
        </div>
        <div class="thumbnail-container flex gap-4 mb-6">
          <div ref="leftThumb" class="thumb-list overflow-x-auto whitespace-nowrap">
            <div v-for="(img, idx) in imagesData" :key="`l-${idx}`" class="thumbnail-item w-32 inline-block" :class="{ active: idx === leftIndex }" @click="leftIndex=idx">
              <img :src="img.url" :alt="img.fileName" class="rounded" />
              <span class="thumb-name">{{ img.fileName }}</span>
            </div>
          </div>
          <div ref="rightThumb" class="thumb-list overflow-x-auto whitespace-nowrap">
            <div v-for="(img, idx) in imagesData" :key="`r-${idx}`" class="thumbnail-item w-32 inline-block" :class="{ active: idx === rightIndex }" @click="rightIndex=idx">
               <img :src="img.url" :alt="img.fileName" class="rounded" />
              <span class="thumb-name">{{ img.fileName }}</span>
            </div>
          </div>
        </div>

        <!-- お気に入りボタン -->
        <div v-if="enableFavorites" class="text-center mb-6">
          <button @click="addFavorite(leftImage)" class="mr-2 bg-green-600 text-white px-4 py-2 rounded">左をお気に入り</button>
          <button @click="addFavorite(rightImage)" class="bg-green-600 text-white px-4 py-2 rounded">右をお気に入り</button>
        </div>

        <!-- お気に入りリンク -->
        <div v-if="enableFavorites" class="favorites-nav text-center mb-6">
          <NuxtLink to="/favorites">
            <button class="bg-purple-600 text-white px-4 py-2 rounded">お気に入りページへ</button>
          </NuxtLink>
        </div>

        <!-- お気に入り一覧 -->
        <div v-if="enableFavorites">
          <h3 class="text-lg font-semibold mb-2">お気に入り画像</h3>
          <div class="flex flex-wrap gap-4">
            <div v-for="(f, i) in favoritesStore.favoriteImages" :key="i" class="cursor-pointer" @click="removeFavorite(i)">
              <img :src="f.url" :alt="f.fileName" class="w-24 h-24 object-contain border rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import mediumZoom from 'medium-zoom'

// 型定義
type ImageItem = { url: string; fileName: string }

// --- ストア・ルーター ---
const router = useRouter()
const favoritesStore = useFavoritesStore()
const auth = useAuthStore()

// --- 状態管理 ---
const imagesData = ref<ImageItem[]>([])
const leftIndex = ref(0)
const rightIndex = ref(1)
const zoom: ReturnType<typeof mediumZoom> | null = null

const emailInput = ref('')
const passwordInput = ref('')
const folderInput = ref('')
const authError = ref(false)
const loading = ref(false)

const publicFolder = ref('omiyamairi_2025')
const privateFolder = ref<string | null>(null)

const displayedFolder = computed(() => privateFolder.value || publicFolder.value)
const enableFavorites = computed(() => displayedFolder.value === publicFolder.value)

const validAccount = { email: 'test@example.com', password: '2024pass' }
const isScrollLinked = ref(true)

// --- サムネイルスクロール同期 ---
const leftThumb = ref<HTMLElement | null>(null)
const rightThumb = ref<HTMLElement | null>(null)
let leftScrollHandler: (() => void) | null = null
let rightScrollHandler: (() => void) | null = null

watchEffect(() => {
  if (!leftThumb.value || !rightThumb.value) return

  // 既存イベント削除
  if (leftScrollHandler) leftThumb.value.removeEventListener('scroll', leftScrollHandler)
  if (rightScrollHandler) rightThumb.value.removeEventListener('scroll', rightScrollHandler)

  if (isScrollLinked.value) {
    leftScrollHandler = () => {
      if (rightThumb.value) rightThumb.value.scrollLeft = leftThumb.value.scrollLeft
    }
    rightScrollHandler = () => {
      if (leftThumb.value) leftThumb.value.scrollLeft = rightThumb.value.scrollLeft
    }
    leftThumb.value.addEventListener('scroll', leftScrollHandler)
    rightThumb.value.addEventListener('scroll', rightScrollHandler)
  }
})

// --- mediumZoom 初期化 ---
watch(
  () => imagesData.value.length,
  async (len) => {
    if (len > 0) {
      await nextTick()
      mediumZoom('[data-zoomable]', { background: '#000', margin: 24 })
    }
  },
  { immediate: true }
)

watch([leftIndex, rightIndex], async () => {
  await nextTick()
  mediumZoom('[data-zoomable]')
})

// --- 画像計算 ---
const leftImage = computed(() => imagesData.value[leftIndex.value] ?? { url: '', fileName: '' })
const rightImage = computed(() => imagesData.value[rightIndex.value] ?? { url: '', fileName: '' })

// --- 認証チェック ---
if (!auth.checkAuth()) {
  console.warn('未認証状態です')
}

// --- 認証処理 ---
function checkPassword() {
  console.log('📥 email:', emailInput.value, '📥 password:', passwordInput.value)
  if (emailInput.value === validAccount.email && passwordInput.value === validAccount.password) {
    authError.value = false
    const folderName = folderInput.value.trim()
    if (!folderName) {
      console.error('フォルダ名未入力')
      return
    }
    favoritesStore.clearFavorites()
    router.push({ path: '/malias', query: { folder: folderName } })
  } else {
    authError.value = true
    console.warn('❌ ログイン失敗')
  }
}

// --- 画像取得 ---
async function fetchImages(folderName: string) {
  loading.value = true
  try {
    const res = await $fetch('/api/list-images', { params: { folder: folderName } })
    imagesData.value = (res.images || []).map((i: any) => ({
      url: i.url,
      fileName: i.key?.split('/').pop() || '不明'
    }))
    leftIndex.value = 0
    rightIndex.value = imagesData.value.length > 1 ? 1 : 0
  } catch {
    imagesData.value = []
  } finally {
    loading.value = false
  }
}

// --- お気に入り操作 ---
function addFavorite(img: { url: string; fileName: string }) {
  if (!favoritesStore.favoriteImages.find(f => f.url === img.url)) {
    favoritesStore.addFavorite({ ...img, selectedType: '', quantity: 1 })
  }
}

function removeFavorite(idx: number) {
  favoritesStore.removeFavorite(idx)
}

watch(
  () => favoritesStore.favoriteImages,
  (v) => window.localStorage.setItem('favoriteImages', JSON.stringify(v)),
  { deep: true }
)

// --- 初期処理 ---
onMounted(() => {
  fetchImages(publicFolder.value)
  const stored = localStorage.getItem('favoriteImages')
  if (stored) {
    const arr = JSON.parse(stored)
    if (Array.isArray(arr)) {
      favoritesStore.favoriteImages.splice(0, favoritesStore.favoriteImages.length, ...arr)
    }
  }
})
</script>

<style scoped>
.monitor-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.monitor {
  flex: 1;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}
.monitor img {
  max-width: 100%;
  max-height: 100%;
}
.thumbnail-item.active {
  background: #d1e7dd;
}
.thumb-name {
  display: block;
  text-align: center;
  font-size: 12px;
  margin-top: 4px;
}
.thumb-list {
  display: inline-block;
  vertical-align: top;
}
</style>
