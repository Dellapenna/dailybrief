/**
 * Hero banner for each page — new artwork carries the page title and
 * tagline baked directly into the image, unlike the earlier crops which
 * were purely decorative. Taller than before and without the extra
 * brightness boost, since these are composed to be read, not just
 * ambient background.
 */
export default function PillarHero({ slug, alt }: { slug: string; alt: string }) {
  return (
    <div className="-mx-5 -mt-6 overflow-hidden md:-mx-8 md:-mt-8">
      <img
        src={`/images/pillars/${slug}.jpg`}
        alt={alt}
        className="h-44 w-full object-cover sm:h-56"
      />
    </div>
  )
}
