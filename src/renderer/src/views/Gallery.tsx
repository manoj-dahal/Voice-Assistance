import { Image, ScanEye, Sparkles } from 'lucide-react'

const galleryItems = [
  {
    title: 'ERA Vision Core',
    description: 'Primary eye-and-signal identity for the voice intelligence layer.',
    src: '/brand/era-vision-core.webp'
  },
  {
    title: 'Persona Neural Field',
    description: 'System artwork used by the Persona OS Center.',
    src: '/brand/persona-os-banner.webp'
  }
]

export function GalleryView() {
  return (
    <div className="reference-secondary-page gallery-page">
      <header><span><Image size={16} /> Visual library</span><h1>Gallery</h1><p>Approved ERA identity assets and generated system visuals.</p></header>
      <div className="reference-gallery-grid">
        {galleryItems.map((item) => (
          <article key={item.title}>
            <img src={item.src} alt={item.title} />
            <div><span><Sparkles size={12} /> SYSTEM ASSET</span><h2>{item.title}</h2><p>{item.description}</p></div>
          </article>
        ))}
        <div className="gallery-empty-slot"><ScanEye size={25} /><strong>Vision captures</strong><span>Approved visual analyses can appear here in a future local gallery.</span></div>
      </div>
    </div>
  )
}
