export type  Product= {
    id: number
    name: string
    slug: string
    permalink: string
    date_created: string
    date_created_gmt: string
    date_modified: string
    date_modified_gmt: string
    type: string
    status: string
    featured: boolean
    catalog_visibility: string
    description: string
    short_description: string
    sku: string
    price: string
    regular_price: string
    sale_price: string
    date_on_sale_from: any
    date_on_sale_from_gmt: any
    date_on_sale_to: any
    date_on_sale_to_gmt: any
    on_sale: boolean
    purchasable: boolean
    total_sales: number
    virtual: boolean
    downloadable: boolean
    downloads: Array<any>
    download_limit: number
    download_expiry: number
    external_url: string
    button_text: string
    tax_status: string
    tax_class: string
    manage_stock: boolean
    stock_quantity: number
    backorders: string
    backorders_allowed: boolean
    backordered: boolean
    low_stock_amount: any
    sold_individually: boolean
    weight: string
    dimensions: {
      length: string
      width: string
      height: string
    }
    shipping_required: boolean
    shipping_taxable: boolean
    shipping_class: string
    shipping_class_id: number
    reviews_allowed: boolean
    average_rating: string
    rating_count: number
    upsell_ids: Array<number>
    cross_sell_ids: Array<any>
    parent_id: number
    purchase_note: string
    categories: Array<{
      id: number
      name: string
      slug: string
    }>
    tags: Array<{
      id: number
      name: string
      slug: string
    }>
    images: Array<{
      id: number
      date_created: string
      date_created_gmt: string
      date_modified: string
      date_modified_gmt: string
      src: string
      name: string
      alt: string
    }>
    attributes: Array<{
      id: number
      name: string
      slug: string
      position: number
      visible: boolean
      variation: boolean
      options: Array<string>
    }>
    default_attributes: Array<any>
    variations: Array<any>
    grouped_products: Array<any>
    menu_order: number
    price_html: string
    related_ids: Array<number>
    meta_data: Array<{
      id: number
      key: string
      value: any
    }>
    stock_status: string
    has_options: boolean
    post_password: string
    global_unique_id: string
    yoast_head: string
    yoast_head_json: {
      title: string
      description: string
      robots: {
        index: string
        follow: string
        "max-snippet": string
        "max-image-preview": string
        "max-video-preview": string
      }
      canonical: string
      schema: {
        "@context": string
        "@graph": Array<{
          "@type": string
          "@id": string
          url?: string
          name?: string
          isPartOf?: {
            "@id": string
          }
          primaryImageOfPage?: {
            "@id": string
          }
          image?: {
            "@id": string
          }
          thumbnailUrl?: string
          datePublished?: string
          dateModified?: string
          description?: string
          breadcrumb?: {
            "@id": string
          }
          inLanguage?: string
          potentialAction?: Array<{
            "@type": string
            target: any
            "query-input"?: {
              "@type": string
              valueRequired: boolean
              valueName: string
            }
          }>
          contentUrl?: string
          width?: number
          height?: number
          caption?: string
          itemListElement?: Array<{
            "@type": string
            position: number
            name: string
            item?: string
          }>
          publisher?: {
            "@id": string
          }
          alternateName?: string
          logo?: {
            "@type": string
            inLanguage: string
            "@id": string
            url: string
            contentUrl: string
            width: number
            height: number
            caption: string
          }
          sameAs?: Array<string>
        }>
      }
    }
    brands: Array<{
      id: number
      name: string
      slug: string
    }>
    _links: {
      self: Array<{
        href: string
        targetHints: {
          allow: Array<string>
        }
      }>
      collection: Array<{
        href: string
      }>
    }
  }
export type Products = Array<Product> 
export type ProductTable = {
  attrbute: string|null
  brand: string
  stock: number
  dimentions: string
  id: number
  link: string
  name: string
  price: number
  short_desc: string
  weight: number
}
