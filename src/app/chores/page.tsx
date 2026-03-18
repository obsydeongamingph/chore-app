import { ChoreList } from '@/components/chores/ChoreList'

export default function ChoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-widest uppercase neon-text-cyan">
          All Chores
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5 tracking-wide">
          Manage and track all your chores
        </p>
      </div>
      <ChoreList />
    </div>
  )
}
