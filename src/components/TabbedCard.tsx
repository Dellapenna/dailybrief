import { useState, type ReactNode } from 'react'

/**
 * Consolidates several same-shape "read one short thing" cards into a
 * single section with a tab switcher — used where multiple pieces of
 * daily content (quotes, words, tips) were each getting their own
 * Disclosure, adding up to a lot of scrolling for content that's all the
 * same size and shape. Each tab's content only mounts (and fetches)
 * once selected, not all up front.
 */
export default function TabbedCard({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-rdp-void p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              active === i ? 'bg-rdp-signal text-white' : 'text-rdp-text-dim hover:text-rdp-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-3">{tabs[active].content}</div>
    </div>
  )
}
