import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

const AnalyticsPage = async () => {
  const session = await getServerSession()
  
  if (!session?.user?.username) {
    redirect('/login')
  }

  return (
    <div className="w-full flex flex-col">
      {/* Back Button */}
      <div className="w-full mb-6 pt-6 px-6 max-w-7xl mx-auto">
        <Link 
          href="/settings"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 h-8 px-3 text-xs rounded-2xl hover:bg-neutral-100 dark:hover:bg-dark-border/60 backdrop-blur-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pb-12 w-full">
        <AnalyticsDashboard username={session.user.username} />
      </div>
    </div>
  )
}

export default AnalyticsPage