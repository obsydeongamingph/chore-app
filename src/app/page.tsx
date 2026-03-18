import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { TodayChores } from '@/components/dashboard/TodayChores'
import { OverdueChores } from '@/components/dashboard/OverdueChores'
import { UpcomingChores } from '@/components/dashboard/UpcomingChores'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <OverdueChores />
          <TodayChores />
        </div>
        <UpcomingChores />
      </div>
    </div>
  )
}
