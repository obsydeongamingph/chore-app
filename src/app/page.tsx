import { HeroSection } from '@/components/dashboard/HeroSection'
import { TodayChores } from '@/components/dashboard/TodayChores'
import { OverdueChores } from '@/components/dashboard/OverdueChores'
import { UpcomingChores } from '@/components/dashboard/UpcomingChores'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <TodayChores />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OverdueChores />
        <UpcomingChores />
      </div>
    </div>
  )
}
