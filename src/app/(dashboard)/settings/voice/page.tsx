import { getMyVoiceCalls, getMyVoiceDrafts } from '@/actions/voice-actions'
import VoiceJournal from '@/components/voice/VoiceJournal'
import { getServerSession } from '@/lib/auth'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const VoiceJournalPage = async () => {
  const session = await getServerSession()

  if (!session?.user?.username) {
    redirect('/login')
  }

  const [calls, drafts] = await Promise.all([getMyVoiceCalls(), getMyVoiceDrafts()])

  return (
    <div className="w-full flex flex-col">
      {/* Back Button */}
      <div className="w-full mb-6 pt-6 px-6 max-w-3xl mx-auto">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 h-8 px-3 text-xs rounded-2xl hover:bg-neutral-100 dark:hover:bg-dark-border/60 backdrop-blur-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <VoiceJournal
          phoneNumber={session.user.phoneNumber ?? null}
          phoneVerified={!!session.user.phoneNumberVerified}
          calls={calls}
          drafts={drafts}
        />
      </div>
    </div>
  )
}

export default VoiceJournalPage
