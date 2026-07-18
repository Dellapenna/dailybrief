/**
 * Small hero banner for each pillar page, cropped from the same
 * reference map image used on the home screen — reusing an asset
 * that already exists rather than generating anything new. Crop
 * boundaries are estimated, not pixel-verified (same caveat as the nav
 * map's tap zones) — flag any that look wrong once live.
 */
export default function PillarHero({ slug, alt }: { slug: string; alt: string }) {
  return (
    <div className="-mx-5 -mt-6 overflow-hidden md:-mx-8 md:-mt-8">
      <img src={`/images/pillars/${slug}.jpg`} alt={alt} className="h-28 w-full object-cover sm:h-36" />
    </div>
  )
}
