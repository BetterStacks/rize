'use client'
import { getSections } from '@/actions/general-actions'
import Education from '@/components/education/education'
import WorkExperience from '@/components/experience/experience'
import Gallery from '@/components/gallery/gallery'
import PostSection from '@/components/posts-section'
import Projects from '@/components/projects/projects'
import Writings from '@/components/writings/writings'
import CertificatesList from '@/components/certificates/certificates-list'
import { useParams } from 'next/navigation'
import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  GalleryItemProps,
  GetAllProjects,
  GetAllWritings,
  GetExplorePosts,
  TEducation,
  TExperience,
  TSection,
  TCertificate,
} from './types'
import { useQuery } from '@tanstack/react-query'

type SectionContextType = {
  sections: TSection[];
  setSections: React.Dispatch<React.SetStateAction<TSection[]>>;
  isFetching?: boolean;
};

export const SectionContext = createContext<SectionContextType>({
  sections: [],
  setSections: () => { },
  isFetching: false,
})

type SectionProviderProps = {
  children: React.ReactNode;
  isMine: boolean;
  gallery: GalleryItemProps[];
  writings: GetAllWritings[];
  projects: GetAllProjects[];
  education: TEducation[];
  workExperience: TExperience[];
  posts: GetExplorePosts[];
  certificates?: TCertificate[];
  profileSections: {
    id: string;
    profileId: string;
    slug: string;
    enabled: boolean;
    order: number;
  }[];
};

export const useSections = () => {
  const ctx = useContext(SectionContext)

  return {
    sections: ctx.sections,
    setSections: ctx.setSections,
    isFetching: ctx.isFetching,
  }
}

const SectionContextProvider: FC<SectionProviderProps> = ({
  children,
  education,
  gallery,
  isMine,
  posts,
  projects,
  workExperience,
  writings,
  certificates = [],
  profileSections,
}) => {
  const sectionsList: TSection[] = [
    {
      order: 0,
      id: 'gallery',
      name: 'Gallery',
      component: (
        <>
          <Gallery items={gallery} isMine={isMine} />
        </>
      ),
      enabled: isMine || gallery?.length > 0,
    },
    {
      order: 1,
      id: 'posts',
      name: 'Posts',
      component: <PostSection posts={posts} isMine={isMine} />,
      enabled: isMine || posts?.length > 0,
    },
    {
      order: 2,
      id: 'writings',
      name: 'Writings',
      component: <Writings writings={writings} isMine={isMine} />,
      enabled: isMine || writings?.length > 0,
    },
    {
      order: 3,
      id: 'projects',
      name: 'Projects',
      component: <Projects projects={projects} isMine={isMine} />,
      enabled: isMine || projects?.length > 0,
    },
    {
      order: 4,
      id: 'education',
      name: 'Education',
      component: <Education education={education} isMine={isMine} />,
      enabled: isMine || education?.length > 0,
    },
    {
      order: 5,
      id: 'experience',
      name: 'Experience',
      component: (
        <WorkExperience workExperience={workExperience} isMine={isMine} />
      ),
      enabled: isMine || workExperience?.length > 0,
    },
    {
      order: 6,
      id: 'certificates',
      name: 'Certificates',
      component: <CertificatesList certificates={certificates} isMine={isMine} />,
      enabled: isMine || certificates?.length > 0,
    },
  ]
  const params = useParams<{ username: string }>()
  const [sections, setSections] = useState<TSection[]>(sectionsList)

  const { data, isLoading } = useQuery({
    queryKey: ['get-profile-sections', params?.username],
    initialData: profileSections,
    queryFn: () => getSections(params?.username),
  })

  useEffect(() => {
    if (data?.length > 0) {
      const map = new Map(data?.map((item) => [item.slug, item]))
      const updatedSections = sections
        ?.map((section) => {
          const item = map.get(section.id)
          return {
            ...section,
            enabled: item?.enabled as boolean,
            order: item?.order as number,
          }
        })
        .sort((a, b) => a.order - b.order)

      setSections(updatedSections)
      return
    }
  }, [])

  return (
    <SectionContext.Provider
      value={{ sections, setSections, isFetching: isLoading }}
    >
      {children}
    </SectionContext.Provider>
  )
}

export default SectionContextProvider
