import { Products } from "./types"
export async function getProductBySKU(Sku:string):Promise<Products> {
    const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?sku=${Sku}`, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
        }
      })
    console.log(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?sku=${Sku}`,`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
    return await response.json()
}