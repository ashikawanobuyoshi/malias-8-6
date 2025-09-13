// server/api/product-details/[id].ts
export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  console.log("API called with id:", id) // ビルド後に確認

  // 商品データ取得処理
  // 例: const product = await getProductById(id)
  // if (!product) return { statusCode: 404, message: 'Not found' }
  return { productName: '', description: '', id }
})
