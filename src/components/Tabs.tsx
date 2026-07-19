export type TabItem<T extends string> = { value: T; label: string }

export default function Tabs<T extends string>({
  items,
  active,
  onChange,
}: {
  items: TabItem<T>[]
  active: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-rdp-line">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            active === item.value
              ? 'border-rdp-signal text-rdp-signal'
              : 'border-transparent text-rdp-text-dim hover:text-rdp-text'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
