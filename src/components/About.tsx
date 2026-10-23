import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

const steps = [
  { title: 'Bring your links', text: 'Add the affiliate products you already recommend. Keep your retailer relationships and give your audience one place to explore them.', image: 'camera' },
  { title: 'Make it feel like you', text: 'Shape the collection with your own product notes, visual direction and categories. Build around your perspective, from everyday essentials to a specialist edit.', image: 'fragrance' },
  { title: 'Share your storefront', text: 'Put one destination in your bio. Visitors discover your collection, then follow your affiliate links to purchase with the original retailer.', image: 'sneaker' },
]
export function About() {
  const [selected, setSelected] = useState(0)
  return <section id="about" className="process-section page-section">
    <div className="section-intro"><h2>One link.<br />Your world.</h2><p>A storefront for the way you curate.<br />Bring your recommendations together, give them context, and make the next discovery feel natural.</p></div>
    <div className="process-layout">
      <div className="process-photo"><img src={`/films/${steps[selected].image}-detail.jpg`} alt={`${steps[selected].image} product from the storefront film`} loading="lazy" /><span>From recommendation to destination.</span></div>
      <div className="process-list">{steps.map((step, index) => <div key={step.title} className={`process-step ${selected === index ? 'is-selected' : ''}`}><h3><button onClick={() => setSelected(index)} aria-expanded={selected === index} aria-controls={`process-${index}`}>{step.title}<span aria-hidden="true">{selected === index ? '−' : '+'}</span></button></h3><div id={`process-${index}`} hidden={selected !== index}><p>{step.text}</p></div></div>)}<a className="text-link" href="#contact">Start with a free prototype <ArrowUpRight size={18} aria-hidden="true" /></a></div>
    </div>
  </section>
}
