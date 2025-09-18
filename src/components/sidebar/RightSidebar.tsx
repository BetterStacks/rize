'use client'

import { useActiveSidebarTab } from '@/lib/context'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import React, { useMemo } from 'react'
import SectionManager from '../SectionManager'
import SocialLinksManager from '../SocialLinksManager'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { GalleryEditor } from './components/GalleryEditor'
import { EducationForm } from './forms/EducationForm'
import { ExperienceForm } from './forms/ExperienceForm'
import { ProjectForm } from './forms/ProjectForm'
import { useSession } from '@/hooks/useAuth'
import {Card, CardContent, CardDescription, CardHeader} from '@/components/ui/card'
import letrazLogo from '@/../public/letraz-logo.svg'
import letrazBanner from '@/../public/letraz-banner.png'
import Image from 'next/image'

const RightSidebar = ({ className }: { className?: string }) => {
  const [active, setActive] = useActiveSidebarTab()
  const { data } = useSession()

  const letrazBaseUrl = process.env.NEXT_PUBLIC_LETRAZ_URL
  const hasLetraz = !!data?.user?.letrazId
  const authMethod = data?.authMethod || 'email'
  const rizeUserId = data?.user?.id

  const sections = useMemo(() => ({
    gallery: (
      <>
        <GalleryEditor />
        <SocialLinksManager />
        <SectionManager />
      </>
    ),
    projects: <ProjectForm id={active?.id as string} />,
    education: <EducationForm id={active?.id as string} />,
    experience: <ExperienceForm id={active?.id as string} />,
  }), [active?.id])

  return (
    <div
      className={cn(
        className,
        'h-screen w-full flex flex-col items-center justify-start'
      )}
    >
      <ScrollArea className="relative h-full w-full overflow-y-auto flex flex-col items-center justify-start">
        {active?.tab !== 'gallery' && (
          <Button
            onClick={() => {
              setActive({ id: null, tab: 'gallery' })
            }}
            size={'smallIcon'}
            variant={'outline'}
            className="absolute top-3 left-3 z-50"
          >
            <ChevronLeft className="size-4 opacity-80" />
          </Button>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.9, ease: [0.075, 0.82, 0.165, 1] }}
          key={active.tab}
          className="mt-6 mb-20 flex flex-col items-center justify-start relative w-full"
        >
          {letrazBaseUrl && rizeUserId && (
            <div className="w-full flex justify-center">
              <Card className="max-w-sm w-full mt-16 shadow-lg dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
                <CardHeader>
                  <Image src={letrazLogo} alt="Letraz Logo" className="w-[40%]" />
                  <CardDescription className="text-left leading-snug">
                    Letraz helps you easily build unique resumes for each job you apply for. Give it a try.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Image src={letrazBanner} alt="Letraz Banner" className="w-full rounded-xl mb-4" />

                  <Button
                      variant="secondary"
                      className="w-full bg-[#F4421F]"
                      style={{color: 'white'}}
                      onClick={() => {
                        const url = hasLetraz
                            ? `${letrazBaseUrl}/app`
                            : `${letrazBaseUrl}/signup?userId=${encodeURIComponent(rizeUserId)}&authMethod=${encodeURIComponent(authMethod)}`
                        window.open(url, '_blank', 'noopener,noreferrer')
                      }}
                  >
                    {hasLetraz ? 'Open Letraz' : 'Create Letraz account'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          {sections[active?.tab as keyof typeof sections]}
        </motion.div>
      </ScrollArea>
    </div>
  )
}

export default RightSidebar