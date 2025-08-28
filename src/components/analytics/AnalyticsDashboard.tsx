'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  Users, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  ExternalLink, 
  FileText, 
  Mail, 
  Download,
  TrendingUp,
  Calendar,
  Globe
} from 'lucide-react'
import { getProfileAnalytics } from '@/actions/analytics-actions'

type AnalyticsData = {
  overview: {
    totalViews: number
    uniqueViews: number
    totalLikes: number
    totalComments: number
    totalBookmarks: number
  }
  clicksByType: Record<string, number>
  dailyViews: Array<{
    date: string
    views: number
    uniqueViews: number
  }>
  topReferrers: Array<{
    referrer: string | null
    count: number
  }>
  timeframe: '7d' | '30d' | '90d'
}

interface AnalyticsDashboardProps {
  username: string
}

const timeframeLabels = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days', 
  '90d': 'Last 90 days'
}

const elementTypeIcons = {
  social_link: <ExternalLink className="size-4" />,
  project: <FileText className="size-4" />,
  writing: <FileText className="size-4" />,
  email: <Mail className="size-4" />,
  resume: <Download className="size-4" />
}

const elementTypeLabels = {
  social_link: 'Social Links',
  project: 'Projects',
  writing: 'Writings',
  email: 'Email',
  resume: 'Resume Downloads'
}

export default function AnalyticsDashboard({ username }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')

  const fetchAnalytics = async (selectedTimeframe: '7d' | '30d' | '90d') => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getProfileAnalytics(username, selectedTimeframe)
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(timeframe)
  }, [username, timeframe])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { overview, clicksByType, dailyViews, topReferrers } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your profile views, engagement, and interactions
          </p>
        </div>
        
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as '7d' | '30d' | '90d')}>
          <TabsList>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
            <TabsTrigger value="90d">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {timeframeLabels[timeframe]}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.uniqueViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Unique IP addresses
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalLikes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                On your posts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                On your posts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
              <Bookmark className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalBookmarks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                People saved your posts
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Views Over Time
              </CardTitle>
              <CardDescription>
                Daily profile views for the {timeframeLabels[timeframe].toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyViews.length > 0 ? (
                  dailyViews.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {day.views} views
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {day.uniqueViews} unique
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No views data available for this timeframe
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Click Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="size-5" />
                Profile Interactions
              </CardTitle>
              <CardDescription>
                Clicks on your profile elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(clicksByType).length > 0 ? (
                  Object.entries(clicksByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {elementTypeIcons[type as keyof typeof elementTypeIcons]}
                        <span className="text-sm font-medium">
                          {elementTypeLabels[type as keyof typeof elementTypeLabels] || type}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {count} clicks
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No interaction data available for this timeframe
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Referrers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5" />
                Top Referrers
              </CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topReferrers.length > 0 ? (
                  topReferrers.map((referrer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate max-w-xs">
                          {referrer.referrer || 'Direct traffic'}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {referrer.count} visits
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No referrer data available for this timeframe
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}