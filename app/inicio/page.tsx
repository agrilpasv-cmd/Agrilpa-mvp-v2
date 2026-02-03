import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { ForBuyers } from "@/components/for-buyers"
import { ForProducers } from "@/components/for-producers"
import { Products } from "@/components/products"
import { SuccessStories } from "@/components/success-stories"
import { Newsletter } from "@/components/newsletter"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <ForBuyers />
      <ForProducers />
      <Products />
      <SuccessStories />
      <Newsletter />
    </main>
  )
}
