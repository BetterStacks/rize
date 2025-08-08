export interface OnboardingFormData {
  username: string;
  displayName: string;
  profileImage: string;
  interests: string[];
  resumeData: ResumeData | null;
}

export interface ResumeData {
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description?: string;
    url?: string;
    technologies?: string[];
  }>;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
}

export interface ImportedData {
  profile?: {
    displayName?: string;
    bio?: string;
    location?: string;
  };
  experience?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
  }>;
  education?: Array<{
    school: string;
    degree?: string;
    field?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    url?: string;
    languages?: string[];
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}