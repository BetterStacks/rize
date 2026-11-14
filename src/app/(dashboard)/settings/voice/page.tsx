import { getMyCallMemories, getMyCallSchedule, getMyVoiceCalls, getMyVoiceDrafts, getOnboardingSuggestions } from '@/actions/voice-actions'
import { SettingsHeader } from '@/components/settings/settings-section'
import VoiceJournal from '@/components/voice/VoiceJournal'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const VoiceJournalPage = async () => {
  const session = await getServerSession()

  if (!session?.user?.username) {
    redirect('/login')
  }

  const [calls, drafts, suggestions, schedule, memory] = await Promise.all([
    getMyVoiceCalls(),
    getMyVoiceDrafts(),
    getOnboardingSuggestions(),
    getMyCallSchedule(),
    getMyCallMemories(),
  ])

  return (
    <>
      <SettingsHeader
        title="Voice journal"
        description="Rize calls you about your week. Drafts are cut from your own words and stay private until you share them."
        back={{ href: '/settings', label: 'Back to settings' }}
      />
      <VoiceJournal
        phoneNumber={session.user.phoneNumber ?? null}
        phoneVerified={!!session.user.phoneNumberVerified}
        calls={calls}
        drafts={drafts}
        suggestions={suggestions}
        schedule={schedule}
        memory={memory}
      />
    </>
  )
}

export default VoiceJournalPage
