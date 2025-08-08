/**
 * Profile Import Service
 * Automatically imports profile data from GitHub, LinkedIn during OAuth
 */

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
}

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
}

interface LinkedInPosition {
  title?: {
    localized?: {
      en_US: string;
    };
  };
  companyName?: {
    localized?: {
      en_US: string;
    };
  };
  description?: {
    localized?: {
      en_US: string;
    };
  };
  dateRange?: {
    start?: {
      year: number;
      month?: number;
      day?: number;
    };
    end?: {
      year: number;
      month?: number;
      day?: number;
    };
  };
}

export interface ImportedProfile {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  experience?: ExperienceData[];
  projects?: ProjectData[];
  skills?: string[];
  education?: EducationData[];
  socialLinks?: SocialLink[];
}

export interface ExperienceData {
  title: string;
  company: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  currentlyWorking?: boolean;
  description?: string;
}

export interface ProjectData {
  name: string;
  description: string;
  url?: string;
  language?: string;
  stars?: number;
  status: 'completed' | 'wip' | 'archived';
}

export interface EducationData {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
  grade?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

/**
 * Import profile data from GitHub
 */
export async function importFromGitHub(accessToken: string): Promise<ImportedProfile> {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json'
        }
      }),
      fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json'
        }
      })
    ])

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error('Failed to fetch GitHub data')
    }

    const user = await userResponse.json()
    const repos = await reposResponse.json()

    const profile: ImportedProfile = {
      displayName: user.name || user.login,
      bio: user.bio || undefined,
      location: user.location || undefined,
      website: user.blog || user.html_url,
      company: user.company || undefined,
      projects: repos
        .filter((repo: GitHubRepo) => !repo.fork && repo.description) // Only non-forked repos with descriptions
        .slice(0, 10) // Limit to top 10
        .map((repo: GitHubRepo) => ({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          status: repo.archived ? 'archived' as const : 'completed' as const
        })),
      socialLinks: [
        {
          platform: 'github',
          url: user.html_url
        },
        ...(user.blog ? [{
          platform: 'website',
          url: user.blog.startsWith('http') ? user.blog : `https://${user.blog}`
        }] : []),
        ...(user.twitter_username ? [{
          platform: 'twitter',
          url: `https://twitter.com/${user.twitter_username}`
        }] : [])
      ].filter(link => link.url)
    }

    // Extract skills from repository languages
    const languages = repos
      .map((repo: GitHubRepo) => repo.language)
      .filter((lang: string) => lang)
      .reduce((acc: { [key: string]: number }, lang: string) => {
        acc[lang] = (acc[lang] || 0) + 1
        return acc
      }, {})

    profile.skills = Object.keys(languages)
      .sort((a, b) => languages[b] - languages[a])
      .slice(0, 10) // Top 10 languages

    return profile
  } catch (error) {
    console.error('GitHub import error:', error)
    return {}
  }
}

/**
 * Import profile data from LinkedIn
 */
export async function importFromLinkedIn(accessToken: string): Promise<ImportedProfile> {
  try {
    // LinkedIn API v2 calls
    const [profileResponse, experienceResponse] = await Promise.all([
      fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,headline,summary,location,industryName,publicProfileUrl)', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }),
      // Note: LinkedIn API access to experience data requires special permissions
      // This is a basic implementation - you might need to request additional scopes
      fetch('https://api.linkedin.com/v2/positions?person=~&count=10', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }).catch(() => null) // Fail silently if no access to positions
    ])

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile')
    }

    const profileData = await profileResponse.json()
    
    const profile: ImportedProfile = {
      displayName: `${profileData.firstName?.localized?.en_US || ''} ${profileData.lastName?.localized?.en_US || ''}`.trim(),
      bio: profileData.headline?.localized?.en_US || profileData.summary?.localized?.en_US || undefined,
      location: profileData.location?.country?.localized?.en_US || undefined,
      company: profileData.industryName?.localized?.en_US || undefined,
      socialLinks: [
        {
          platform: 'linkedin',
          url: profileData.publicProfileUrl || ''
        }
      ].filter(link => link.url)
    }

    // Process experience data if available
    if (experienceResponse && experienceResponse.ok) {
      const experienceData = await experienceResponse.json()
      profile.experience = experienceData.elements?.map((position: LinkedInPosition) => ({
        title: position.title?.localized?.en_US || '',
        company: position.companyName?.localized?.en_US || '',
        description: position.description?.localized?.en_US || undefined,
        startDate: position.dateRange?.start ? new Date(
          position.dateRange.start.year,
          (position.dateRange.start.month || 1) - 1,
          position.dateRange.start.day || 1
        ) : undefined,
        endDate: position.dateRange?.end ? new Date(
          position.dateRange.end.year,
          (position.dateRange.end.month || 1) - 1,
          position.dateRange.end.day || 1
        ) : undefined,
        currentlyWorking: !position.dateRange?.end
      })).slice(0, 5) || [] // Limit to 5 most recent positions
    }

    return profile
  } catch (error) {
    console.error('LinkedIn import error:', error)
    return {}
  }
}

/**
 * Generate an enhanced bio using imported data
 */
export function generateEnhancedBio(profile: ImportedProfile): string {
  const parts: string[] = []
  
  if (profile.bio) {
    parts.push(profile.bio)
  } else {
    // Generate bio from available data
    const title = profile.experience?.[0]?.title
    const company = profile.experience?.[0]?.company || profile.company
    const topSkill = profile.skills?.[0]
    
    if (title && company) {
      parts.push(`${title} at ${company}`)
    } else if (company) {
      parts.push(`Working at ${company}`)
    }
    
    if (topSkill && !parts.some(p => p.toLowerCase().includes(topSkill.toLowerCase()))) {
      parts.push(`Passionate about ${topSkill}`)
    }
    
    if (profile.location) {
      parts.push(`Based in ${profile.location}`)
    }
    
    // Add a motivational ending
    const endings = [
      'Building the future, one project at a time ✨',
      'Always learning, always building 🚀',
      'Turning ideas into reality 💡',
      'Creating solutions that matter 🌟'
    ]
    
    if (parts.length > 0) {
      parts.push(endings[Math.floor(Math.random() * endings.length)])
    }
  }
  
  return parts.join(' • ') || 'Building something awesome ✨'
}

/**
 * Create a suggested username from imported data
 */
export function generateUsername(profile: ImportedProfile, fallbackName?: string): string {
  const name = profile.displayName || fallbackName || 'user'
  
  // Clean the name and create username
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15)
  
  // Add random number to avoid conflicts
  const randomSuffix = Math.floor(Math.random() * 999) + 1
  
  return `${cleanName}${randomSuffix}`
}