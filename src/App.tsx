import { Hero } from './components/Hero'
import { Services } from './components/Services'
import { Pricing } from './components/Pricing'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Toaster } from './components/ui/toaster'

export default function App() {
  return <div className="storefront"><main><section id="hero" aria-label="Product film experience"><Hero /></section><Services /><Pricing /><div className="contact-shell"><Contact /></div></main><Footer /><Toaster /></div>
}
