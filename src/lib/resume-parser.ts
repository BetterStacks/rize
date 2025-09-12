// Types for Letraz API response
export interface LetrazPersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

export interface LetrazEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface LetrazExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  location?: string;
}

export interface LetrazCertification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface LetrazProject {
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
}

export interface LetrazApiResponse {
  data: {
    personalInfo: LetrazPersonalInfo;
    education: LetrazEducation[];
    experience: LetrazExperience[];
    skills: string[];
    certifications: LetrazCertification[];
    projects: LetrazProject[];
  };
  format: string;
}

// Types for our internal use (converted from Letraz API)
export interface ExtractedExperience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
}

export interface ExtractedEducation {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
}

export interface ExtractedProject {
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

export interface ExtractedData {
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
  skills: string[];
  projects: ExtractedProject[];
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
}

/**
 * Parse resume content using Letraz API
 */
export async function parseResumeContent(file: File): Promise<ExtractedData> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://stg.letraz.app/api/resume/parse?format=generic', {
      method: 'POST',
      headers: {
        'x-authentication': process.env.LETRAZ_API_KEY as string,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const apiResponse: LetrazApiResponse = await response.json()
    
    // Convert Letraz API response to our internal format
    return convertLetrazToExtractedData(apiResponse)
  } catch (error) {
    console.error('Error parsing resume with Letraz API:', error)
    // Return empty data structure if parsing fails
    return {
      experience: [],
      education: [],
      skills: [],
      projects: [],
    }
  }
}

/**
 * Convert Letraz API response to our internal ExtractedData format
 */
function convertLetrazToExtractedData(apiResponse: LetrazApiResponse): ExtractedData {
  const { data } = apiResponse

  console.log(data)
  
  // Convert experience
  const experience: ExtractedExperience[] = data.experience.map(exp => ({
    title: exp.position,
    company: exp.company,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    description: exp.description,
    currentlyWorking: isCurrentPosition(exp.startDate, exp.endDate),
  }))

  // Convert education
  const education: ExtractedEducation[] = data.education.map(edu => ({
    school: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.field,
    startDate: edu.startDate,
    endDate: edu.endDate,
    grade: edu.gpa,
  }))

  // Convert projects (if any in the future)
  const projects: ExtractedProject[] = data.projects.map(proj => ({
    name: proj.name || '',
    description: proj.description || '',
    url: proj.url,
  }))

  return {
    experience,
    education,
    skills: data.skills || [],
    projects,
    name: data.personalInfo?.name,
    email: data.personalInfo?.email,
    phone: data.personalInfo?.phone,
    location: data.personalInfo?.location,
    summary: data.personalInfo?.summary,
  }
}

/**
 * Helper function to determine if a position is current based on end date
 */
function isCurrentPosition(startDate: string, endDate?: string): boolean {
  // If endDate is "Present" or undefined/empty, it's a current position
  return !endDate || endDate.toLowerCase() === 'present'
}