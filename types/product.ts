// types/product.ts
export interface Product {
  productId: number
  src: string
  description: string
  productName?: string
  style?: {
    width: string
    height: string
  }
}
