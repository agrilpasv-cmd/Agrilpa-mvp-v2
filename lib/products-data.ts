export interface Product {
  id: number
  name: string
  category: string
  producer: string
  vendorId: string
  location: string
  country: string
  description: string
  seller?: string // Added to fix type compatibility
  fullDescription: string
  price: string
  minOrder: string
  rating: number
  reviews: number
  image: string
  verified: boolean
  slug: string
  packaging: string
  packagingSize: string
  contactMethod?: string
  contactInfo?: string
  specifications?: {
    label: string
    value: string
  }[]
}

export const allProducts: Product[] = []

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug)
}

export function getProductById(id: number): Product | undefined {
  return allProducts.find((product) => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter((product) => product.category === category)
}
