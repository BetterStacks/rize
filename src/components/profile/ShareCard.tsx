'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Share2, 
  Download, 
  Copy, 
  Twitter, 
  Linkedin, 
  Facebook,
  CheckCircle,
  Palette,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ShareCardProps {
  profile: {
    displayName: string;
    username: string;
    bio: string;
    profileImage: string;
    location?: string;
    experience?: Array<{
      title: string;
      company: string;
      currentlyWorking: boolean;
    }>;
    projects?: Array<{
      name: string;
      description: string;
    }>;
  };
}

const CARD_THEMES = {
  gradient: {
    name: 'Gradient',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: 'white',
  },
  minimal: {
    name: 'Minimal',
    background: '#ffffff',
    textColor: '#1f2937',
    border: '1px solid #e5e7eb'
  },
  dark: {
    name: 'Dark',
    background: '#1f2937',
    textColor: '#f9fafb',
  },
  purple: {
    name: 'Purple',
    background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
    textColor: 'white',
  },
  green: {
    name: 'Green',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    textColor: 'white',
  }
}

export function ShareCard({ profile }: ShareCardProps) {
  const [open, setOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof CARD_THEMES>('gradient')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentJob = profile.experience?.find(exp => exp.currentlyWorking)
  const topProject = profile.projects?.[0]
  const profileUrl = `${window.location.origin}/${profile.username}`

  const generateCard = async (format: 'png' | 'jpg' = 'png') => {
    setIsGenerating(true)
    try {
      // Create the card HTML
      const cardHtml = `
        <div style="
          width: 800px;
          height: 600px;
          padding: 60px;
          background: ${CARD_THEMES[selectedTheme].background};
          ${'border' in CARD_THEMES[selectedTheme] ? `border: ${(CARD_THEMES[selectedTheme] as any).border};` : ''}
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: ${CARD_THEMES[selectedTheme].textColor};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
          box-sizing: border-box;
        ">
          <div style="
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background-image: url('${profile.profileImage}');
            background-size: cover;
            background-position: center;
            margin-bottom: 30px;
            border: 4px solid rgba(255, 255, 255, 0.2);
          "></div>
          
          <h1 style="
            font-size: 42px;
            font-weight: 700;
            margin: 0 0 10px 0;
            letter-spacing: -0.02em;
          ">${profile.displayName}</h1>
          
          <p style="
            font-size: 20px;
            opacity: 0.9;
            margin: 0 0 20px 0;
            font-weight: 500;
          ">@${profile.username}</p>
          
          ${currentJob ? `
            <p style="
              font-size: 24px;
              margin: 0 0 25px 0;
              opacity: 0.95;
              font-weight: 600;
            ">${currentJob.title} at ${currentJob.company}</p>
          ` : ''}
          
          <p style="
            font-size: 18px;
            line-height: 1.6;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 0 30px 0;
          ">${profile.bio}</p>
          
          ${profile.location ? `
            <p style="
              font-size: 16px;
              opacity: 0.8;
              margin: 0 0 20px 0;
            ">📍 ${profile.location}</p>
          ` : ''}
          
          <div style="
            position: absolute;
            bottom: 60px;
            right: 60px;
            font-size: 16px;
            opacity: 0.7;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 6px;
              background: rgba(255, 255, 255, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
            ">✨</div>
            rize.so/${profile.username}
          </div>
        </div>
      `

      // Use html-to-image library or canvas API to convert to image
      // For now, we'll use a simpler approach with canvas
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')
      
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw background
      if (selectedTheme === 'gradient' || selectedTheme === 'purple' || selectedTheme === 'green') {
        const gradient = ctx.createLinearGradient(0, 0, 800, 600)
        if (selectedTheme === 'gradient') {
          gradient.addColorStop(0, '#667eea')
          gradient.addColorStop(1, '#764ba2')
        } else if (selectedTheme === 'purple') {
          gradient.addColorStop(0, '#a855f7')
          gradient.addColorStop(1, '#3b82f6')
        } else {
          gradient.addColorStop(0, '#10b981')
          gradient.addColorStop(1, '#059669')
        }
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = CARD_THEMES[selectedTheme].background
      }
      ctx.fillRect(0, 0, 800, 600)

      // Set text color
      ctx.fillStyle = CARD_THEMES[selectedTheme].textColor
      ctx.textAlign = 'center'

      // Draw profile image (simplified - using a circle)
      ctx.beginPath()
      ctx.arc(400, 180, 60, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fill()

      // Draw name
      ctx.font = 'bold 42px Inter, sans-serif'
      ctx.fillStyle = CARD_THEMES[selectedTheme].textColor
      ctx.fillText(profile.displayName, 400, 280)

      // Draw username
      ctx.font = '20px Inter, sans-serif'
      ctx.globalAlpha = 0.9
      ctx.fillText(`@${profile.username}`, 400, 310)

      // Draw job title
      if (currentJob) {
        ctx.font = 'bold 24px Inter, sans-serif'
        ctx.globalAlpha = 0.95
        ctx.fillText(`${currentJob.title} at ${currentJob.company}`, 400, 350)
      }

      // Draw bio (simplified)
      ctx.font = '18px Inter, sans-serif'
      ctx.globalAlpha = 0.9
      const bioY = currentJob ? 390 : 350
      const bioText = profile.bio.length > 80 ? profile.bio.substring(0, 80) + '...' : profile.bio
      ctx.fillText(bioText, 400, bioY)

      // Draw location
      if (profile.location) {
        ctx.font = '16px Inter, sans-serif'
        ctx.globalAlpha = 0.8
        ctx.fillText(`📍 ${profile.location}`, 400, bioY + 40)
      }

      // Draw URL
      ctx.font = '16px Inter, sans-serif'
      ctx.globalAlpha = 0.7
      ctx.textAlign = 'right'
      ctx.fillText(`rize.so/${profile.username}`, 740, 540)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${profile.username}-profile-card.${format}`
          a.click()
          URL.revokeObjectURL(url)
          toast.success('Profile card downloaded! 🎉')
        }
      }, `image/${format}`)

    } catch (error) {
      toast.error('Failed to generate profile card')
      console.error('Card generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success('Profile URL copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const shareToSocial = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const text = `Check out my profile: ${profile.displayName} - ${currentJob?.title || 'Creator'} ${currentJob?.company ? `at ${currentJob.company}` : ''}`
    const url = encodeURIComponent(profileUrl)
    const encodedText = encodeURIComponent(text)

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share Profile
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Share Your Profile
            </DialogTitle>
            <DialogDescription>
              Create a beautiful card to share on social media or download for later
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Preview
              </h3>
              
              <div 
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg"
                style={{
                  background: CARD_THEMES[selectedTheme].background,
                  border: 'border' in CARD_THEMES[selectedTheme] ? (CARD_THEMES[selectedTheme] as any).border : undefined,
                  color: CARD_THEMES[selectedTheme].textColor,
                }}
              >
                <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
                  <Image
                    src={profile.profileImage}
                    alt={profile.displayName}
                    width={80}
                    height={80}
                    className="rounded-full mb-4 border-2 border-white/20"
                  />
                  
                  <h2 className="text-2xl font-bold mb-1">{profile.displayName}</h2>
                  <p className="text-sm opacity-90 mb-2">@{profile.username}</p>
                  
                  {currentJob && (
                    <p className="text-lg font-semibold mb-3 opacity-95">
                      {currentJob.title} at {currentJob.company}
                    </p>
                  )}
                  
                  <p className="text-sm opacity-90 mb-2 max-w-xs line-clamp-2">
                    {profile.bio}
                  </p>
                  
                  {profile.location && (
                    <p className="text-xs opacity-80">📍 {profile.location}</p>
                  )}
                  
                  <div className="absolute bottom-4 right-4 text-xs opacity-70">
                    ✨ rize.so/{profile.username}
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className="font-semibold mb-3">Choose Theme</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CARD_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTheme(key as keyof typeof CARD_THEMES)}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-left',
                        selectedTheme === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      )}
                    >
                      <div 
                        className="w-full h-8 rounded mb-2"
                        style={{ background: theme.background }}
                      />
                      <p className="text-sm font-medium">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Options */}
              <div>
                <h3 className="font-semibold mb-3">Download</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => generateCard('png')}
                    disabled={isGenerating}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    {isGenerating ? 'Generating...' : 'Download as PNG'}
                  </Button>
                  <Button
                    onClick={() => generateCard('jpg')}
                    disabled={isGenerating}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    {isGenerating ? 'Generating...' : 'Download as JPG'}
                  </Button>
                </div>
              </div>

              {/* Share Options */}
              <div>
                <h3 className="font-semibold mb-3">Share Link</h3>
                <div className="space-y-2">
                  <Button
                    onClick={copyProfileUrl}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy Profile URL'}
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => shareToSocial('twitter')}
                      className="gap-2"
                      variant="outline"
                      size="sm"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareToSocial('linkedin')}
                      className="gap-2"
                      variant="outline"
                      size="sm"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Button>
                    <Button
                      onClick={() => shareToSocial('facebook')}
                      className="gap-2"
                      variant="outline"
                      size="sm"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}