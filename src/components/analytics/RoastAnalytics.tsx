'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Flame, Calendar, Clock } from 'lucide-react'
import { getRoastAnalytics } from '@/actions/roast-analytics'
import { Button } from '@/components/ui/button'

interface RoastAnalyticsProps {
  username: string
}

type AnalyticsData = {
  totalRoasts: number
  firstRoastAt: Date | null
  lastRoastAt: Date | null
}

export default function RoastAnalytics({ username }: RoastAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await getRoastAnalytics(username)
        if (result.success && result.data) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Failed to load roast analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [username])

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="w-full border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-orange-500" />
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </div>
            <ChevronUp className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-20 bg-muted rounded-lg animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="size-5 text-orange-500" />
              Your Roast Stats
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <CardContent className="space-y-4 pt-0">
                {/* Total Roasts - Always visible */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Roasts</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {data?.totalRoasts || 0}
                    </p>
                  </div>
                  <Flame className="size-10 text-orange-500 opacity-50" />
                </div>

                {/* First & Last Roast - Show even if empty */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="size-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">First Roast</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(data?.firstRoastAt || null)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="size-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Last Roast</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(data?.lastRoastAt || null)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Motivation message for first-timers */}
                {(!data || data.totalRoasts === 0) && (
                  <div className="text-center py-3 px-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                    <p className="text-sm text-muted-foreground">
                      🔥 Ready to get roasted? Upload your resume!
                    </p>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}