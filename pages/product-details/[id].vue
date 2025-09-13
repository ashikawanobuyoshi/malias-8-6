<template>
  <div v-if="product">
    <h1>{{ product.productName }}</h1>
    <p>{{ product.description }}</p>
  </div>
  <div v-else>
    <p>商品情報を読み込み中です...</p>
  </div>
  <main class="pb-24">
    <div class="p-4 space-y-6">
      <!-- 戻るボタン -->
      <button @click="handleGoBack" class="px-4 py-2 bg-gray-200 rounded">
        ← 戻る
      </button>

      <!-- 商品詳細 -->
      <div v-if="plainProduct" class="space-y-4">
        <h2 class="text-2xl font-bold">{{ plainProduct.productName }}</h2>
        <img :src="plainProduct.src" alt="" class="w-full max-w-sm rounded" />
        <p class="whitespace-pre-line">{{ plainProduct.description }}</p>
      </div>

      <!-- お気に入り画像一覧 -->
      <div class="favorites-gallery">
        <h3 class="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          📷 お気に入り画像一覧
        </h3>

        <div
          v-if="favoritesStore.favoriteImages.length === 0"
          class="text-gray-600"
        >
          お気に入り画像はありません
        </div>

        <!-- 画像があるとき -->
        <div v-else class="favorites-list flex flex-wrap gap-4">
          <div
            v-for="(favImg, index) in favoritesStore.favoriteImages"
            :key="index"
            class="favorite-item border p-4 rounded shadow-sm w-60 flex flex-col items-center bg-white"
          >
            <!-- 画像表示 -->
            <div
              class="w-40 h-40 flex items-center justify-center bg-gray-50 rounded mb-3 border"
            >
              <img
                :src="favImg.url"
                alt="お気に入り画像"
                class="max-w-full h-auto object-contain rounded border"
              />
            </div>

            <!-- ファイル名 -->
            <p
              class="font-medium mb-2 text-center break-words w-full text-gray-700"
            >
              ファイル名: {{ favImg.fileName }}
              {{ img }}
            </p>

            <!-- 商品IDが1のときのみ表示される注文フォーム -->
            <div v-if="productId === '1'" class="w-full">
              <!-- プリント種類セレクター -->
              <label class="block mb-2 w-full text-sm text-gray-700">
                <span class="block mb-1 font-semibold">プリント種類:</span>
                <select
                  v-model="favImg.selectedType"
                  class="border rounded px-2 py-1 w-full"
                >
                  <option disabled value="">選択してください</option>
                  <option value="四つ切">四つ切</option>
                  <option value="六切り">六切り</option>
                  <option value="キャビネ">キャビネ</option>
                  <option value="手札">手札</option>
                </select>
              </label>

              <!-- 枚数入力 -->
              <label class="block mb-2 w-full text-sm text-gray-700">
                <span class="block mb-1 font-semibold">枚数:</span>
                <input
                  type="number"
                  v-model.number="favImg.quantity"
                  min="1"
                  class="border rounded px-2 py-1 w-full"
                />
              </label>

              <!-- 小計 -->
              <p class="mt-2 font-semibold text-gray-800 text-center w-full">
                小計: ¥{{
                  calculatePrice(
                    favImg.selectedType,
                    favImg.quantity
                  ).toLocaleString()
                }}
              </p>

              <!-- 注文ボタン -->
              <button
                 class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                 @click="addToOrder(favImg)"
              >
              注文する
              </button>
            </div>

            <!-- 削除ボタン -->
            <button
              @click="removeFavorite(index)"
              class="text-red-600 font-bold text-xl mt-4"
              title="削除"
            >
              ×
            </button>
          </div>
        </div>
      </div>

            <!-- 注文リスト表示 -->
      <div v-if="orderList.length > 0" class="mt-6 border-t pt-4">
        <h3 class="text-xl font-semibold mb-2">📝 注文リスト</h3>
        <ul>
          <li
            v-for="(item, index) in orderList"
            :key="index"
            class="flex justify-between border-b py-2"
          >
            <div>
              {{ item.fileName }} - {{ item.printType }} × {{ item.quantity }}
            </div>
            <div>
              ¥{{ item.price.toLocaleString() }}
            </div>
          </li>
        </ul>
        <p class="mt-2 font-bold text-right">
          合計: ¥{{ orderList.reduce((sum, i) => sum + i.price, 0).toLocaleString() }}
        </p>
      </div>

      <!-- 追加オプション -->
      <div>
        <h3 class="text-lg font-semibold mt-6">オプション選択</h3>

        <!-- 2列のグリッド -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div
            v-for="(item, index) in additionalItems"
            :key="index"
            class="flex items-center border p-2 rounded shadow-sm bg-white"
          >
            <!-- 左: 画像 -->
            <img
              v-if="item.image"
              :src="item.image"
              alt="オプション画像"
              class="w-20 h-20 object-contain mr-4"
            />

            <!-- 右: チェックボックスと説明 -->
            <div class="flex-1">
              <label class="flex items-start">
                <input
                  type="checkbox"
                  v-model="item.selected"
                  class="mr-2 mt-1"
                  @change="onSelectChange(item)"
                />
                <span class="font-medium text-gray-800">
                  {{ item.name }}（+¥{{ item.price.toLocaleString() }}）
                </span>
              </label>

              <!-- 説明文 -->
              <p
                v-if="item.description"
                class="text-sm text-gray-600 mt-1"
                v-html="item.description"
              ></p>

              <!-- ✅ 数量入力（選択された場合のみ表示） -->
              <div
                v-if="item.selected"
                class="mt-2 flex items-center space-x-2"
              >
                <button
                  class="px-2 py-1 bg-gray-200 rounded"
                  @click="decreaseQuantity(item)"
                >
                  －
                </button>

                <input
                  type="number"
                  v-model.number="item.quantity"
                  min="1"
                  class="w-16 text-center border rounded"
                />

                <button
                  class="px-2 py-1 bg-gray-200 rounded"
                  @click="increaseQuantity(item)"
                >
                  ＋
                </button>
              </div>
            </div>
          </div>
        </div>

<!-- カスタムアイテム入力欄 -->
<div class="border p-4 rounded bg-gray-50">
  <label class="block text-sm font-medium mb-1">各コースに付属の六切プリント及チーパスキーホルダーのお写真番号をご記入ください。（例）六切り1234、チーパス7123 ＊文字を入力しないとエラーになりますので、ご注意下さい。
    
  </label>
  <input
    v-model="newCustomItem.name"
    placeholder="例: no,7777.jpg"
    class="border p-2 w-full rounded"
  />
</div>


  <div>
    <label class="block text-sm font-medium mb-1">価格（円）</label>
    <input
      type="number"
      v-model.number="newCustomItem.price"
      placeholder="例: 12000"
      class="border p-2 w-full rounded"
    />
  </div>

  <div>
    <label class="block text-sm font-medium mb-1">数量</label>
    <input
      type="number"
      v-model.number="newCustomItem.quantity"
      placeholder="1"
      min="1"
      class="border p-2 w-full rounded"
    />
  </div>

  <button
    @click="addCustomItem"
    class="px-4 py-2 bg-blue-600 text-white rounded"
  >
    カスタムアイテムを追加
  </button>
</div>


          

        <!-- ✅ 追加済みオプション表示 -->
        <div v-if="selectedAdditionalItems.length > 0" class="mt-4 space-y-2">
          <h4 class="text-lg font-semibold">追加済みオプション</h4>
          <div
            v-for="(item, index) in selectedAdditionalItems"
            :key="index"
            class="border p-2 rounded flex justify-between items-center"
          >
            <div>
              {{ item.name }} - ¥{{ item.price.toLocaleString() }} ×
              {{ item.quantity }}
            </div>
            <button
              @click="
                () => {
                  item.selected = false;
                  item.quantity = 0;
                }
              "
              class="text-red-600 underline"
            >
              削除
            </button>
          </div>
        </div>

        <!-- 登録済みカスタムアイテム一覧 -->
        <div v-if="customItems.length > 0" class="mt-4 space-y-2">
          <h4 class="text-lg font-semibold">追加済みアイテム</h4>
          <div
            v-for="(item, index) in customItems"
            :key="index"
            class="border p-2 rounded flex justify-between items-center"
          >
            <div>
              {{ item.fileName || item.name }} - ¥{{
                item.price.toLocaleString()
              }}
              × {{ item.quantity }}
            </div>
            <button
              @click="customItems.splice(index, 1)"
              class="text-red-600 underline"
            >
              削除
            </button>
          </div>
        </div>
      </div>

      <!-- 合計金額 -->
      <div>
        <p>合計金額（税抜）：¥{{ totalPrice.toLocaleString() }}</p>
        <p class="font-bold">
          合計金額（税込）：¥{{ totalPriceWithTax.toLocaleString() }}
        </p>
      </div>

    <!-- 注文フォーム -->
    <div class="space-y-2 pb-32">
      <h3 class="text-xl font-semibold">お客様情報</h3>

      <input
        v-model="form.customerName"
        placeholder="お名前（必須）"
        class="w-full border p-2 rounded"
        :class="{ 'border-red-500': !form.customerName && formTouched }"
      />

      <input
  v-model="form.email"
  placeholder="メールアドレス（必須）"
  class="w-full border p-2 rounded"
  :class="{
    'border-red-500':
      (!form.email || !emailRegex.test(form.email)) && formTouched,
  }"
/>

      <textarea
        v-model="form.comment"
        placeholder="備考（例：お写真の貼る順番 1:左 2:中央 3:右）"
        class="w-full border p-2 rounded h-24"
      />

      <p v-if="success" class="text-green-600 font-semibold">
        ご注文ありがとうございました！確認メールを送信しました。
      </p>
      <p v-if="error" class="text-red-600 font-semibold">
        {{ error }}
      </p>
    </div>
  </main>

  <!-- 注文ボタンを画面下に固定 -->
  <div
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50"
  >
    <button
      @click="sendOrderEmail"
      :disabled="isSubmitting"
      class="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isSubmitting ? "送信中..." : "注文を確定する" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFavoritesStore } from "~/stores/favorites";
import type { OptionItem, CustomItem, Product, PrintOption } from "~/types";

// -------------------- ルート＆ルーター --------------------
const route = useRoute();
const router = useRouter();
const favoritesStore = useFavoritesStore();

// -------------------- 商品ID --------------------
const productId = route.params.id ? String(route.params.id) : null;

// 商品IDがない場合はトップページにリダイレクト
if (!productId && process.client) {
  router.replace("/");
}

// -------------------- 商品情報 --------------------
const product = ref<Product | null>(null);

// plainProduct はテンプレート用に安全な computed
const plainProduct = computed(() => product.value ?? { name: "商品名未設定", price: 0 });

// --- 注文追加関数
const orderList = ref<any[]>([]);

const addToOrder = (item: any) => {
  if (!item.selectedType || !item.quantity) {
    alert("プリント種類と枚数を入力してください");
    return;
  }

  orderList.value.push({
    fileName: item.fileName,
    printType: item.selectedType,
    quantity: item.quantity,
    price: calculatePrice(item.selectedType, item.quantity),
  });

  console.log("現在の注文リスト:", orderList.value);
  alert(`${item.fileName} を注文リストに追加しました`);
};

// -------------------- 追加オプション & カスタムアイテム --------------------
const additionalItems = ref<OptionItem[]>([]);
const customItems = ref<{ name: string; price: number; quantity: number; fileName: string }[]>([]);
const printOptions = ref<PrintOption[]>([]);
const isSubmitting = ref(false);

// カスタムアイテム用の1列 reactive
const newCustomItem = ref<{
  name: string;
  price: number;
  quantity: number;
  fileName: string;
}>({
  name: "",
  price: 0,
  quantity: 1,
  fileName: ""
});

// -------------------- カスタムアイテム追加関数 --------------------
const addCustomItem = () => {
  if (!newCustomItem.value.name) {
    alert("カスタム名を入力してください");
    return;
  }

  // 1列分だけ追加
  customItems.value.push({ ...newCustomItem.value });

  // 入力欄リセット
  newCustomItem.value = { name: "", price: 0, quantity: 1, fileName: "" };
};

// -------------------- 商品詳細 & 追加オプション取得 --------------------
onMounted(() => {
  if (process.client) {
  const stored = localStorage.getItem("favoriteImages");
  if (stored) {
    try {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr)) {
        favoritesStore.favoriteImages.splice(
          0,
          favoritesStore.favoriteImages.length,
          ...arr.map(img => ({
            ...img,
            selectedType: img.selectedType || "", // プリント種類
            quantity: img.quantity || 1          // 枚数
          }))
        );
      }
    } catch (e) {
      console.error("お気に入り画像復元失敗:", e);
    }
  }
}
});

// -------------------- 選択状態と数量制御 --------------------
const onSelectChange = (item: OptionItem) => {
  if (item.selected && item.quantity === 0) item.quantity = 1;
  if (!item.selected) item.quantity = 0;
};
const increaseQuantity = (item: OptionItem | CustomItem) => item.quantity++;
const decreaseQuantity = (item: OptionItem | CustomItem) => {
  if (item.quantity > 1) item.quantity--;
};

// -------------------- 選択された追加オプション --------------------
const selectedAdditionalItems = computed(() =>
  additionalItems.value.filter(item => item.selected && item.quantity > 0)
);
const additionalTotal = computed(() =>
  selectedAdditionalItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// -------------------- 合計金額計算 --------------------
const TAX_RATE = 0.1;

// お気に入り価格計算
function calculatePrice(type: string, quantity: number) {
  const prices: Record<string, number> = { 四つ切: 5800, 六切り: 4800, キャビネ: 3800, 手札: 3500 };
  return (prices[type] ?? 0) * quantity;
}

const totalPrice = computed(() => {
  const favTotal = favoritesStore.favoriteImages.reduce((sum, img) => {
    return sum + (img.quantity && img.selectedType ? calculatePrice(img.selectedType, img.quantity) : 0);
  }, 0);

  const customTotal = customItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const optionTotal = additionalItems.value.reduce((sum, item) => (item.selected ? sum + item.price * item.quantity : sum), 0);

  return favTotal + customTotal + optionTotal;
});

const totalPriceWithTax = computed(() => Math.round(totalPrice.value * (1 + TAX_RATE)));

// -------------------- お気に入り保存監視 --------------------
if (process.client) {
  watch(
    () => favoritesStore.favoriteImages,
    (val) => {
      try {
        localStorage.setItem("favoriteImages", JSON.stringify(val));
      } catch (e) {
        console.error("お気に入り画像保存失敗:", e);
      }
    },
    { deep: true }
  );
}

// -------------------- お気に入り削除 ----------
function removeFavorite(index: number) {
  favoritesStore.favoriteImages.splice(index, 1);
}

// -------------------- 戻るボタン --------------------
const handleGoBack = () => {
  if (window.history.length > 1) router.back();
  else router.push("/");
};

// -------------------- メール送信 --------------------
const { sendEmail: sendRealEmail } = useSendEmail();

const ADMIN_EMAILS: string[] = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
  : [];

const form = ref({
  customerName: "",
  email: "",   // ✅ お客様メール必須
  address: "",
  comment: ""
});

const formTouched = ref(false);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const success = ref(false);
const error = ref("");

// 入力チェック
function validateForm(): boolean {
  if (!form.value.customerName) {
    error.value = "お名前を入力してください。";
    return false;
  }
  if (!form.value.email || !emailRegex.test(form.value.email)) {
    error.value = "有効なメールアドレスを入力してください。";
    return false;
  }
  return true;
}

const sendOrderEmail = async () => {
  if (!validateForm()) return;

  try {
    // -------------------- 注文情報 --------------------
    const orderDetails = {
      name: form.value.customerName || "お客様",
      email: form.value.email || "",
      address: form.value.address || "",
      note: form.value.comment || "",
      totalWithTax: totalPriceWithTax.value ?? 0,
      items: favoritesStore.favoriteImages.map(img => ({
        name: img.fileName || "商品名未設定",
        type: img.selectedType || "未選択",
        price: calculatePrice(img.selectedType, img.quantity) || 0,
        qty: img.quantity || 1
      })),
      options: additionalItems.value
        .filter(i => i.selected)
        .map(i => ({
          name: i.name || "追加商品",
          price: i.price || 0,
          qty: i.quantity || 1
        })),
      customItems: customItems.value.map(c => ({
        name: c.name || c.fileName || "カスタム",
        price: c.price || 0,
        qty: c.quantity || 1
      })),
      images: favoritesStore.favoriteImages.map(img => ({
        name: img.fileName || "画像",
        url: img.url || "#"
      }))
    };

    // -------------------- HTML生成関数 --------------------
    const makeListHtml = (arr: any[] = [], renderFn: (item: any) => string) =>
      arr.length ? `<ul>${arr.map(renderFn).join("")}</ul>` : "";

    const itemsHtml = makeListHtml(orderDetails.items, item =>
      `<li>${item.name} (${item.type}) × ${item.qty}：¥${(item.price * item.qty).toLocaleString()}</li>`
    );

    const optionsHtml = makeListHtml(orderDetails.options, item =>
      `<li>${item.name} × ${item.qty}：¥${(item.price * item.qty).toLocaleString()}</li>`
    );

    const customHtml = makeListHtml(orderDetails.customItems, item =>
      `<li>${item.name} × ${item.qty}：¥${(item.price * item.qty).toLocaleString()}</li>`
    );

    // -------------------- HTMLメール本文 --------------------
    const html = `
      <p>${orderDetails.name} 様、</p>
      <p>以下の内容でご注文を承りました：</p>
      ${itemsHtml || "<p>商品注文なし</p>"}
      ${optionsHtml}
      ${customHtml}
      <p>合計（税込）: ¥${orderDetails.totalWithTax.toLocaleString()}</p>
      ${orderDetails.note ? `<p>備考: ${orderDetails.note}</p>` : ""}
      <p>ご利用ありがとうございました。</p>
    `;

    // -------------------- 宛先リスト --------------------
    const recipients = [
      ...(orderDetails.email ? [orderDetails.email] : []),
      ...ADMIN_EMAILS
    ];
    if (!recipients.length) throw new Error("送信先メールアドレスがありません。");

    // -------------------- メール送信 --------------------
    await sendRealEmail({
      to: recipients,
      subject: "【注文確定】ご注文ありがとうございます",
      html,
    });

    success.value = true;
    error.value = "";
    console.log("注文メール送信成功:", recipients);

  } catch (err: any) {
    console.error("注文メール送信失敗:", err);
    success.value = false;
    error.value = (err as Error).message || "メール送信に失敗しました。";
  }
};

</script>


<style scoped>
/* ページヘッダー */
.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}
.back-button {
  background-color: blue;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.back-button:hover {
  background-color: darkblue;
}

/* お気に入りギャラリーのスタイル */

.favorites-gallery {
  padding: 20px;
  margin-bottom: 30px;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.favorites-gallery h3 {
  margin-bottom: 10px;
}

/* ★ 縦並びに変更 ★ */
.favorites-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
}

.favorite-item {
  width: 200px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
  box-sizing: border-box;
  text-align: center;

  display: flex; /* 横並びのデフォルト */
  flex-direction: column; /* これで縦並びにします */
  align-items: center; /* 中央寄せ */
  font-size: 14px;
}

.favorite-item img {
  width: 100%;
  max-width: 150px; /* 最大幅150pxで制限 */
  height: auto; /* アスペクト比を維持して高さを自動調整 */
  object-fit: contain; /* 画像の全体を表示（トリミングしない） */
  border: 1px solid #ccc;
  margin-bottom: 8px;
}

.fav-image-name {
  font-weight: bold;
  margin-bottom: 6px;
  max-width: 180px;
  word-wrap: break-word;
}

.favorite-item select,
.favorite-item input[type="number"] {
  width: 180px;
  padding: 6px;
  font-size: 14px;
  margin-bottom: 6px;
  box-sizing: border-box;
}

.order-details {
  background-color: #f7f7f7;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  max-width: 180px;
  word-wrap: break-word;
}

/* 商品詳細エリア：３カラムレイアウト */
.product-page {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.left-column {
  flex: 1;
  max-width: 30%;
  display: flex;
  flex-direction: column; /* 縦方向に並べる */
  align-items: center;
  justify-content: center;
}
.left-column img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ccc;
}
.center-column {
  flex: 1;
  max-width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.product-title {
  font-size: 2rem;
  margin-bottom: 10px;
}
.product-description {
  font-size: 1.2rem;
  margin-bottom: 15px;
}
.product-price {
  font-weight: bold;
  font-size: 1.5rem;
}

/* 右カラム：受注明細と受注フォーム */
.right-column {
  flex: 1;
  max-width: 30%;
  border-left: 1px solid #eee;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.right-column h2 {
  margin-bottom: 10px;
}
.order-summary table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}
.order-summary table th,
.order-summary table td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: center;
}
.total {
  text-align: right;
  font-weight: bold;
  margin-bottom: 20px;
}
.order-form form > div {
  margin-bottom: 10px;
}
.order-form label {
  display: block;
  margin-bottom: 5px;
}
.order-form input,
.order-form textarea {
  width: 100%;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.order-form button {
  background-color: #f0c14b;
  border: 1px solid #a88734;
  padding: 8px 12px;
  cursor: pointer;
}
.order-form button:hover {
  background-color: #e2b33b;
}

/* 商品が見つからない場合 */
.not-found {
  padding: 20px;
  text-align: center;
  font-size: 1.5rem;
}
/* 商品説明 */
.desc-line {
  line-height: 0.9; /* 好みの行の高さに調整してください */
  margin: 0 0 8px; /* 行間を離したい場合の余白調整 */
}
/* 消費税 */
.total-with-tax {
  font-weight: bold;
  margin-top: 10px;
  color: #d35400; /* オレンジ系など強調色に */
}

/* メール送信テストフォーム */
.manual-mail-form {
  margin-top: 30px;
  padding: 20px;
  border-top: 1px solid #ddd;
}
.manual-mail-form form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.manual-mail-form input,
.manual-mail-form textarea {
  width: 100%;
  padding: 8px;
}
.manual-mail-form button {
  background-color: #007bff33;
  color: white;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}
.manual-mail-form button[disabled] {
  background-color: #aaa;
  cursor: not-allowed;
}
/* tailwind.css */
html,
body,
#__nuxt {
  height: 100%;
}
</style>
