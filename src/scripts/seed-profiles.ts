/**
 * Seed Profile Generator
 * Creates realistic, high-quality profiles to populate the platform
 */

import db from '@/lib/db'
import { users, profile, projects, experience, education, socialLinks, posts, media } from '@/db/schema'
import { eq, like, desc } from 'drizzle-orm'

// Sample data for generating diverse profiles
const SAMPLE_DATA = {
  tech_roles: [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
    'Data Scientist', 'Product Manager', 'UX Designer', 'Mobile Developer', 
    'Machine Learning Engineer', 'Cloud Architect', 'Software Engineer', 'AI Engineer'
  ],
  
  companies: [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Airbnb',
    'Uber', 'Tesla', 'Stripe', 'Figma', 'Notion', 'Linear', 'Vercel', 'Supabase',
    'OpenAI', 'GitHub', 'Slack', 'Discord', 'Shopify', 'Twilio', 'MongoDB', 'Atlassian'
  ],
  
  startup_companies: [
    'TechFlow', 'DataVibe', 'CloudNine', 'CodeCraft', 'PixelForge', 'ByteStream',
    'NeuralLab', 'FlowState', 'BuildFast', 'DevTools', 'AppLaunch', 'ScaleUp',
    'GrowthHack', 'InnovateCo', 'StartupX', 'VentureAI', 'TechForward', 'NextGen'
  ],

  universities: [
    'Stanford University', 'MIT', 'Harvard University', 'UC Berkeley', 'Carnegie Mellon',
    'Georgia Tech', 'University of Washington', 'Caltech', 'Cornell University', 
    'Columbia University', 'Princeton University', 'Yale University', 'NYU', 'UCLA'
  ],

  degrees: [
    'Computer Science', 'Software Engineering', 'Data Science', 'Information Systems',
    'Electrical Engineering', 'Mathematics', 'Design', 'Business Administration',
    'Product Management', 'Human-Computer Interaction', 'Artificial Intelligence'
  ],

  locations: [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
    'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Miami, FL',
    'London, UK', 'Berlin, Germany', 'Toronto, Canada', 'Amsterdam, Netherlands',
    'Singapore', 'Tokyo, Japan', 'Sydney, Australia', 'Tel Aviv, Israel'
  ],

  skills: [
    'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'JavaScript', 'Java',
    'C++', 'Swift', 'Kotlin', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'GCP', 'Azure', 'GraphQL', 'REST APIs', 'Machine Learning', 'AI', 'Blockchain',
    'React Native', 'Flutter', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Express',
    'Django', 'FastAPI', 'Spring Boot', 'Ruby on Rails', 'Laravel', 'Phoenix'
  ],

  project_types: [
    'Web App', 'Mobile App', 'API', 'CLI Tool', 'Browser Extension', 'Desktop App',
    'Machine Learning Model', 'Data Pipeline', 'DevOps Tool', 'Game', 'Library',
    'Framework', 'SaaS Platform', 'E-commerce Site', 'Social Network', 'Analytics Tool'
  ],

  bio_templates: [
    'Building the future of {field} at {company} 🚀 Previously at {prev_company}. Love {hobby}.',
    'Passionate {role} focused on creating delightful user experiences. {years}+ years in tech.',
    'Ex-{prev_company} engineer turned entrepreneur. Building {project} to help {audience}.',
    'Full-stack developer who loves {tech}. Open source contributor and {hobby} enthusiast.',
    'Data scientist turning complex problems into simple solutions. {university} alum 🎓',
    'Product-minded engineer building tools for developers. Always learning new tech 📚',
    'Designer who codes. Creating beautiful and functional digital experiences ✨',
    'DevOps engineer obsessed with automation and performance. Coffee addict ☕'
  ],

  hobbies: [
    'hiking', 'photography', 'cooking', 'music', 'reading', 'gaming', 'traveling',
    'rock climbing', 'surfing', 'cycling', 'chess', 'art', 'yoga', 'running'
  ],

  post_templates: [
    'Just shipped a new feature that reduces load time by 40%! The key was optimizing our database queries and implementing Redis caching. Details in the comments 👇',
    'Working on an exciting AI project that can automatically generate code documentation. Early results are promising! What\'s your biggest pain point with documentation?',
    'Attended an amazing tech conference today. Key takeaway: the future is all about developer experience. What tools are you most excited about in 2024?',
    'Been experimenting with {tech} lately and I\'m blown away by the performance improvements. Here\'s what I learned building a {project_type} with it...',
    'Just open-sourced my latest project: {project_name}! It\'s a {project_type} built with {tech}. Would love to get feedback from the community 🙏',
    'Interesting challenge today: how to handle real-time updates for 10k+ concurrent users. Ended up using WebSockets with Redis pub/sub. Thread below 🧵',
    'Quick tip: Always measure before optimizing. Spent hours optimizing the wrong bottleneck before profiling showed the real issue was elsewhere 🤦‍♂️',
    'The best code is the code you don\'t have to write. Just refactored 500 lines into 50 by leveraging an existing library. Sometimes simplicity wins.'
  ]
}

// Helper functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateBio(role: string, company: string, prevCompany: string, hobby: string, field: string, years: number, university: string): string {
  const template = randomChoice(SAMPLE_DATA.bio_templates)
  return template
    .replace('{field}', field.toLowerCase())
    .replace('{company}', company)
    .replace('{prev_company}', prevCompany)
    .replace('{hobby}', hobby)
    .replace('{role}', role.toLowerCase())
    .replace('{years}', years.toString())
    .replace('{university}', university)
    .replace('{project}', generateProjectName())
    .replace('{audience}', randomChoice(['developers', 'designers', 'startups', 'creators', 'teams']))
}

function generateProjectName(): string {
  const prefixes = ['Dev', 'Code', 'Build', 'Ship', 'Flow', 'Quick', 'Smart', 'Auto', 'Meta', 'Super']
  const suffixes = ['Kit', 'Hub', 'Lab', 'Tools', 'Flow', 'Stack', 'Craft', 'Forge', 'Studio', 'Works']
  return randomChoice(prefixes) + randomChoice(suffixes)
}

function generateProjectDescription(type: string, tech: string): string {
  const descriptions = [
    `A modern ${type.toLowerCase()} built with ${tech} that helps developers streamline their workflow`,
    `Open-source ${type.toLowerCase()} designed to solve common development challenges using ${tech}`,
    `Minimalist ${type.toLowerCase()} that leverages ${tech} to provide excellent user experience`,
    `High-performance ${type.toLowerCase()} built from scratch with ${tech} and best practices`,
    `Community-driven ${type.toLowerCase()} powered by ${tech} with focus on simplicity and speed`
  ]
  return randomChoice(descriptions)
}

async function generateSeedProfile(index: number) {
  const firstName = randomChoice([
    'Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Jamie', 'Riley', 'Avery', 'Quinn',
    'Blake', 'Drew', 'Sage', 'River', 'Phoenix', 'Kai', 'Rowan', 'Skyler', 'Emery', 'Finley'
  ])
  
  const lastNames = [
    'Chen', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson',
    'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez',
    'Hall', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Patel', 'Kumar', 'Singh', 'Ahmed', 'Ali', 'Kim', 'Park'
  ]
  
  const lastName = randomChoice(lastNames)
  const displayName = `${firstName} ${lastName}`
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 99) + 1}`
  
  const role = randomChoice(SAMPLE_DATA.tech_roles)
  const currentCompany = Math.random() > 0.3 ? randomChoice(SAMPLE_DATA.companies) : randomChoice(SAMPLE_DATA.startup_companies)
  const prevCompany = randomChoice(SAMPLE_DATA.companies)
  const hobby = randomChoice(SAMPLE_DATA.hobbies)
  const field = randomChoice(['tech', 'AI', 'web development', 'mobile', 'data science', 'cloud computing'])
  const years = Math.floor(Math.random() * 8) + 2
  const university = randomChoice(SAMPLE_DATA.universities)
  
  const profileData = {
    username,
    displayName,
    bio: generateBio(role, currentCompany, prevCompany, hobby, field, years, university),
    location: randomChoice(SAMPLE_DATA.locations),
    profileImage: `https://images.unsplash.com/photo-${1500000000 + index}?w=400&h=400&fit=crop&crop=face`,
    age: Math.floor(Math.random() * 15) + 22, // 22-37 years old
    pronouns: randomChoice(['he/him', 'she/her', 'they/them'] as const),
    isLive: false,
    hasCompletedWalkthrough: true,
  }

  return { profileData, metadata: { role, currentCompany, prevCompany, university, years } }
}

interface SeedMetadata {
  role: string;
  currentCompany: string;
  prevCompany: string;
  university: string;
  years: number;
}

async function generateExperience(profileId: string, metadata: SeedMetadata) {
  const experiences = []
  
  // Current job
  experiences.push({
    profileId,
    title: metadata.role,
    company: metadata.currentCompany,
    location: randomChoice(SAMPLE_DATA.locations),
    employmentType: 'Full-time' as const,
    startDate: generateRandomDate(new Date(2022, 0, 1), new Date(2024, 0, 1)),
    endDate: null,
    currentlyWorking: true,
    description: 'Leading development of innovative solutions using modern technologies. Collaborate with cross-functional teams to deliver high-quality products.'
  })
  
  // Previous job (maybe)
  if (metadata.years > 3 && Math.random() > 0.3) {
    experiences.push({
      profileId,
      title: randomChoice(['Software Engineer', 'Developer', 'Junior Developer', 'Intern']),
      company: metadata.prevCompany,
      location: randomChoice(SAMPLE_DATA.locations),
      employmentType: 'Full-time' as const,
      startDate: generateRandomDate(new Date(2019, 0, 1), new Date(2022, 0, 1)),
      endDate: generateRandomDate(new Date(2021, 6, 1), new Date(2023, 0, 1)),
      currentlyWorking: false,
      description: 'Developed and maintained web applications, collaborated with team members on various projects, and gained valuable experience in software development.'
    })
  }
  
  return experiences
}

async function createPlaceholderLogo(profileId: string, projectName: string) {
  // Create a placeholder media entry for the project logo
  const logoMedia = await db.insert(media).values({
    url: `https://via.placeholder.com/100x100/6366f1/ffffff?text=${projectName.charAt(0)}`,
    type: 'image' as const,
    width: 100,
    height: 100,
    profileId: profileId,
  }).returning()
  
  return logoMedia[0].id
}

async function generateProjects(profileId: string) {
  const projectCount = Math.floor(Math.random() * 4) + 2 // 2-5 projects
  const projects = []
  
  for (let i = 0; i < projectCount; i++) {
    const projectType = randomChoice(SAMPLE_DATA.project_types)
    const tech = randomChoice(SAMPLE_DATA.skills)
    const name = generateProjectName()
    
    // Create placeholder logo
    const logoId = await createPlaceholderLogo(profileId, name)
    
    projects.push({
      profileId,
      name,
      description: generateProjectDescription(projectType, tech),
      url: Math.random() > 0.5 ? `https://github.com/user${Math.floor(Math.random() * 1000)}/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : null,
      status: randomChoice(['completed', 'wip', 'completed', 'completed'] as const), // bias toward completed
      logo: logoId,
    })
  }
  
  return projects
}

async function generateEducation(profileId: string, metadata: SeedMetadata) {
  return [{
    profileId,
    school: metadata.university,
    degree: 'Bachelor\'s Degree',
    fieldOfStudy: randomChoice(SAMPLE_DATA.degrees),
    startDate: generateRandomDate(new Date(2015, 8, 1), new Date(2018, 8, 1)),
    endDate: generateRandomDate(new Date(2019, 4, 1), new Date(2022, 4, 1)),
    grade: null,
  }]
}

async function generateSocialLinks(profileId: string, username: string) {
  const links = []
  
  // GitHub (high probability)
  if (Math.random() > 0.2) {
    links.push({
      profileId,
      platform: 'github',
      url: `https://github.com/${username.toLowerCase()}`
    })
  }
  
  // LinkedIn (medium probability)
  if (Math.random() > 0.4) {
    links.push({
      profileId,
      platform: 'linkedin',
      url: `https://linkedin.com/in/${username.toLowerCase()}`
    })
  }
  
  // Twitter (lower probability)
  if (Math.random() > 0.6) {
    links.push({
      profileId,
      platform: 'twitter',
      url: `https://twitter.com/${username.toLowerCase()}`
    })
  }
  
  // Personal website (low probability)
  if (Math.random() > 0.8) {
    links.push({
      profileId,
      platform: 'website',
      url: `https://${username.toLowerCase()}.dev`
    })
  }
  
  // Filter out any links with empty URLs (safety check)
  return links.filter(link => link.url && link.url.trim() !== '')
}

async function generatePost(profileId: string, metadata: SeedMetadata) {
  if (Math.random() > 0.4) return null // Not everyone posts
  
  const tech = randomChoice(SAMPLE_DATA.skills)
  const projectType = randomChoice(SAMPLE_DATA.project_types).toLowerCase()
  const projectName = generateProjectName()
  
  const template = randomChoice(SAMPLE_DATA.post_templates)
  const content = template
    .replace('{tech}', tech)
    .replace('{project_type}', projectType)
    .replace('{project_name}', projectName)
  
  return {
    profileId,
    content,
    createdAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
  }
}

export async function seedProfiles(count: number = 100) {
  console.log(`🌱 Seeding ${count} profiles...`)
  
  try {
    // Find the last seed user to continue from where we left off
    const lastSeedUsers = await db.select()
      .from(users)
      .where(like(users.id, 'seed-user-%'))
      .orderBy(users.id)
    
    let startIndex = 0
    if (lastSeedUsers.length > 0) {
      // Extract the highest number from seed-user-X format
      const lastUserNumbers = lastSeedUsers.map(user => {
        const match = user.id.match(/seed-user-(\d+)/)
        return match ? parseInt(match[1]) : 0
      })
      startIndex = Math.max(...lastUserNumbers)
      console.log(`📍 Found ${lastSeedUsers.length} existing seed users. Starting from index ${startIndex + 1}...`)
    }
    
    for (let i = 0; i < count; i++) {
      const actualIndex = startIndex + i + 1
      console.log(`Creating profile ${actualIndex} (${i + 1}/${count})...`)
      
      // Generate profile
      const { profileData, metadata } = await generateSeedProfile(actualIndex)
      
      // Create a user first
      const email = `${profileData.username}@example.com`
      const insertedUser = await db.insert(users).values({
        id: `seed-user-${actualIndex}`,
        name: profileData.displayName,
        email: email,
        emailVerified: true,
        image: profileData.profileImage,
        isOnboarded: true,
      }).returning()
      
      const userId = insertedUser[0].id
      
      // Insert profile
      const insertedProfile = await db.insert(profile).values({
        userId,
        ...profileData,
      }).returning()
      
      const profileId = insertedProfile[0].id
      
      // Generate and insert related data (projects need to be created separately because they create media)
      const [experienceData, educationData, socialData, postData] = await Promise.all([
        generateExperience(profileId, metadata),
        generateEducation(profileId, metadata),
        generateSocialLinks(profileId, profileData.username),
        generatePost(profileId, metadata)
      ])
      
      // Insert projects separately (they create their own media entries)
      const projectsData = await generateProjects(profileId)
      
      // Insert all other related data
      await Promise.all([
        experienceData.length > 0 ? db.insert(experience).values(experienceData) : Promise.resolve(),
        educationData.length > 0 ? db.insert(education).values(educationData) : Promise.resolve(),
        socialData.length > 0 ? db.insert(socialLinks).values(socialData) : Promise.resolve(),
        postData ? db.insert(posts).values(postData) : Promise.resolve(),
        projectsData.length > 0 ? db.insert(projects).values(projectsData) : Promise.resolve(),
      ])
      
      // Small delay to avoid overwhelming the database
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`✅ Successfully seeded ${count} profiles! (seed-user-${startIndex + 1} to seed-user-${startIndex + count})`)
    return { success: true, count, startIndex: startIndex + 1, endIndex: startIndex + count }
    
  } catch (error) {
    console.error('❌ Error seeding profiles:', error)
    return { success: false, error }
  }
}

// CLI usage
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 100
  seedProfiles(count).then(result => {
    if (result.success) {
      console.log(`🎉 Seeding complete! Created ${result.count} profiles.`)
    } else {
      console.error('💥 Seeding failed:', result.error)
    }
    process.exit(result.success ? 0 : 1)
  })
}