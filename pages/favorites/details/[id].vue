<template>
  <div>
    <h2>お気に入り画像の詳細</h2>
    <div v-if="selectedImage">
      <img :src="selectedImage.url" alt="Favorite Image" />
      <p>ファイル名: {{ selectedImage.fileName }}</p>
      <button @click="removeFavorite">お気に入りから削除</button>
      <NuxtLink to="/favorites/all">戻る</NuxtLink>
    </div>
    <div v-else>
      <p>画像が見つかりません</p>
      <NuxtLink to="/favorites/all">戻る</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFavoritesStore } from "@/stores/favorites";
import { serializeJson } from "@/utils/jsonUtils";

// デバッグ（開発環境のみ）
if (process.env.NODE_ENV === "development") {
  console.log("serializeJson test:", serializeJson('{"key": "value"}'));
}

// ストアとルーター
const route = useRoute();
const router = useRouter();
const favoritesStore = useFavoritesStore();

// ルートパラメータからID取得
const idParam = route.params.id;
const id = Number(idParam);

if (isNaN(id)) {
  console.error("無効なID:", idParam);
  router.replace("/not-found"); // 例：404 ページへ移動
} else {
  if (process.env.NODE_ENV === "development") {
    console.log("Route params:", route.params);
    console.log("Received ID:", id);
  }
}

// お気に入り画像を computed でリアクティブに取得
const selectedImage = computed(() => {
  return id >= 0 && id < favoritesStore.favoriteImages.length
    ? favoritesStore.favoriteImages[id]
    : null;
});
console.log("Selected Image:", selectedImage.value);

// 削除処理
const removeFavorite = () => {
  if (selectedImage.value) {
    favoritesStore.removeFavorite(id);
    router.push("/favorites/all");
  }
};
</script>

<style scoped>
img {
  max-width: 300px;
  height: auto;
  display: block;
  margin-bottom: 20px;
}
button {
  background-color: #ff9800;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #e68900;
}
</style>
