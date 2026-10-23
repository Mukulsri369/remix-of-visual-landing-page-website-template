import { Hero } from './components/Hero'
import { Services } from './components/Services'
import { Pricing } from './components/Pricing'
import { DeferredContact } from './components/DeferredContact'
import { Footer } from './components/Footer'

export default function App() {
  return <div className="storefront"><main><section id="hero" aria-label="Product film experience"><Hero /></section><Services /><Pricing /><DeferredContact /></main><Footer /></div>
}
