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
}

export interface LetrazExperience {
  company: string;
  position: string;
  startDate: string;
  description: string;
}

export interface LetrazApiResponse {
  data: {
    personalInfo: LetrazPersonalInfo;
    education: LetrazEducation[];
    experience: LetrazExperience[];
    skills: string[];
    certifications: any[];
    projects: any[];
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
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://letraz.app/api/resume/parse?format=generic', {
      method: 'POST',
      headers: {
        'x-authentication': 'dcNI1g9QUK1jCkK5Mag6QMEVnvi3l1xc',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiResponse: LetrazApiResponse = await response.json();
    
    // Convert Letraz API response to our internal format
    return convertLetrazToExtractedData(apiResponse);
  } catch (error) {
    console.error('Error parsing resume with Letraz API:', error);
    // Return empty data structure if parsing fails
    return {
      experience: [],
      education: [],
      skills: [],
      projects: [],
    };
  }
}

/**
 * Convert Letraz API response to our internal ExtractedData format
 */
function convertLetrazToExtractedData(apiResponse: LetrazApiResponse): ExtractedData {
  const { data } = apiResponse;

  console.log(data)
  
  // Convert experience
  const experience: ExtractedExperience[] = data.experience.map(exp => ({
    title: exp.position,
    company: exp.company,
    startDate: exp.startDate,
    description: exp.description,
    currentlyWorking: isCurrentPosition(exp.startDate),
  }));

  // Convert education
  const education: ExtractedEducation[] = data.education.map(edu => ({
    school: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.field,
    startDate: edu.startDate,
  }));

  // Convert projects (if any in the future)
  const projects: ExtractedProject[] = data.projects.map(proj => ({
    name: proj.name || '',
    description: proj.description || '',
    url: proj.url,
  }));

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
  };
}

/**
 * Helper function to determine if a position is current based on start date
 */
function isCurrentPosition(startDate: string): boolean {
  // Simple heuristic: if no end date mentioned and start date is recent, assume current
  // This could be enhanced with more sophisticated logic
  return false; // Default to false, could be enhanced based on business logic
}