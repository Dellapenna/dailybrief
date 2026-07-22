import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const AXIS_STYLE = { fontSize: 11, fill: '#6b7688' }
const GRID_COLOR = '#1e2536'
const TOOLTIP_STYLE = {
  backgroundColor: '#131826',
  border: '1px solid #1e2536',
  borderRadius: 8,
  fontSize: 12,
  color: '#e6e9f0',
}

function formatDate(d: unknown) {
  if (!d) return ''
  const date = new Date(String(d) + 'T00:00:00')
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Empty state shared by every chart when there's no data yet for that metric. */
function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-rdp-line">
      <p className="text-sm text-rdp-text-faint">No {label} data logged yet</p>
    </div>
  )
}

export function WeightTrendChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length === 0) return <EmptyChart label="weight" />
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatDate} />
        <Line type="monotone" dataKey="weight" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 3, fill: '#2dd4bf' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function CalorieTrendChart({ data, goal }: { data: { date: string; consumed: number }[]; goal: number | null }) {
  if (data.length === 0) return <EmptyChart label="calorie" />
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatDate} />
        {goal && <ReferenceLine y={goal} stroke="#d4a72c" strokeDasharray="4 4" />}
        <Bar dataKey="consumed" fill="#2dd4bf" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function WaterTrendChart({ data }: { data: { date: string; glasses: number }[] }) {
  if (data.length === 0) return <EmptyChart label="water" />
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatDate} />
        <ReferenceLine y={8} stroke="#d4a72c" strokeDasharray="4 4" />
        <Bar dataKey="glasses" fill="#38bdf8" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function HabitConsistencyChart({ data }: { data: { date: string; completed: number; total: number }[] }) {
  if (data.length === 0) return <EmptyChart label="habit" />
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatDate} />
        <Bar dataKey="completed" fill="#a78bfa" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TaskCompletionChart({ data }: { data: { date: string; completed: number }[] }) {
  if (data.length === 0) return <EmptyChart label="task completion" />
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatDate} />
        <Bar dataKey="completed" fill="#34d399" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
