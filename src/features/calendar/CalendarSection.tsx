import { useState } from 'react'
import Tabs from '@/components/Tabs'
import TodayEvents from './TodayEvents'
import MonthView from './MonthView'

type View = 'agenda' | 'month'

export default function CalendarSection() {
  const [view, setView] = useState<View>('agenda')

  return (
    <div>
      <Tabs
        items={[
          { value: 'agenda', label: 'Agenda' },
          { value: 'month', label: 'Month' },
        ]}
        active={view}
        onChange={setView}
      />
      <div className="mt-3">{view === 'agenda' ? <TodayEvents /> : <MonthView />}</div>
    </div>
  )
}
