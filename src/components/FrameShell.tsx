import type { ReactNode } from 'react'

/**
 * A decorative frame image as a fixed backdrop, with actual page content
 * living in a scrollable window positioned over the frame's blank
 * content area — rather than the whole page scrolling normally. The
 * frame's ornate border never stretches or distorts; content of any
 * length scrolls inside its own box instead.
 *
 * `window` percentages describe where the blank/parchment area sits
 * within the frame image — estimated by eye, same caveat as the nav
 * map's tap zones: tell me if the content window doesn't line up with
 * the actual parchment once you see it live, and I'll adjust the numbers.
 */
export default function FrameShell({
  frameSrc,
  frameAlt,
  window: win,
  children,
}: {
  frameSrc: string
  frameAlt: string
  window: { top: number; left: number; width: number; height: number }
  children: ReactNode
}) {
  return (
    <div className="-mx-5 -mt-6 md:-mx-8 md:-mt-8">
      <div className="relative mx-auto" style={{ maxWidth: 560 }}>
        <img src={frameSrc} alt={frameAlt} className="block w-full brightness-[1.375] contrast-105" />
        <div
          className="absolute overflow-y-auto rounded-sm"
          style={{
            top: `${win.top}%`,
            left: `${win.left}%`,
            width: `${win.width}%`,
            height: `${win.height}%`,
          }}
        >
          <div className="px-3 py-2">{children}</div>
        </div>
      </div>
    </div>
  )
}
