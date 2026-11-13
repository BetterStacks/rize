import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

const AnalyticsPage = async () => {
  const session = await getServerSession()

  if (!session?.user?.username) {
    redirect('/login')
  }

  // The dashboard draws its own header so the time period can sit next to the title.
  return <AnalyticsDashboard username={session.user.username} />
}

export default AnalyticsPage
