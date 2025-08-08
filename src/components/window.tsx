import { useMediaQuery } from '@mantine/hooks'
import { motion, useTransform } from 'framer-motion'
import Image from 'next/image'
import { FC } from 'react'
import { initialValue } from './editor/utils'
import { dummyLinks, SocialLinkButton } from './profile/social-links'
import ProjectCard from './projects/project-card'
import { Separator } from './ui/separator'
import WritingCard from './writings/writing-card'
const positions = [
  { x: 960, y: -1300, scale: 0.9, z: 1, rotate: -6 }, // latte
  { x: -620, y: -1300, scale: 0.9, z: 1, rotate: 6 }, //dog
  { x: -620, y: -1100, scale: 0.9, z: 1, rotate: -6 }, //drake
  { x: 380, y: -1100, scale: 0.9, z: 6, rotate: 6 }, //cliff
  { x: 450, y: -900, scale: 0.9, z: 4, rotate: -6 }, //plane
]

type ProfileContainerProps = {
  avatar: string;
  name: string;
  bio: string;
  gallery: string[];
  projects?: any[];
  username: string;
  writings?: any[];
  scrollYProgress: any;
  isFirst: boolean;
};

export const ProfileContainer: FC<ProfileContainerProps> = ({
  avatar,
  name,
  bio,
  gallery,
  username,
  projects,
  writings,
  scrollYProgress,
  isFirst,
}) => {
  return (
    <div className="w-full h-full  px-6 py-10 max-w-2xl mx-auto">
      <div className="flex flex-col items-start 4k:mt-10  justify-start">
        <Image
          src={avatar}
          alt=""
          width={100}
          height={100}
          className="object-cover border-2 border-neutral-200 dark:border-neutral-800 aspect-square rounded-full"
        />
        <h3 className="text-2xl font-semibold tracking-tighter mt-4">{name}</h3>
        <span className="text-neutral-600 dark:bg-dark-border bg-neutral-200/80 px-3 rounded-full text-sm  py-1 dark:text-neutral-400 font-medium mt-2">
          @{username}
        </span>
        <p className="text-neutral-600  dark:text-neutral-400 font-medium mt-2">
          {bio}
        </p>
        <div className="flex mt-4 flex-wrap items-center justify-start gap-2">
          {dummyLinks.map((link, index) => {
            return (
              <SocialLinkButton
                buttonClassName="shadow-none"
                key={index}
                platform={link.platform}
                url={link.url}
              />
            )
          })}
        </div>
      </div>
      {projects && projects.length > 0 && (
        <>
          <Separator className="mt-4" />
          <div className="flex flex-col items-start justify-start mt-4 gap-y-2">
            {projects?.map((project, index) => {
              return (
                <ProjectCard
                  key={index}
                  isMine={false}
                  project={{
                    description: project.description,
                    name: project.name,
                    endDate: new Date(),
                    startDate: new Date(),
                    status: 'wip',
                    thumbnail: '',
                    logo: '',
                    url: project.link,
                    id: '',
                    profileId: '',
                  }}
                />
              )
            })}
          </div>
        </>
      )}
      {writings && writings.length > 0 && (
        <>
          <Separator className="mt-4" />
          <div className="flex flex-col items-start justify-start mt-4 gap-y-2">
            {writings?.map((writing, index) => {
              return (
                <WritingCard
                  key={index}
                  data={{
                    id: '',
                    title: writing.title,
                    content: JSON.stringify(initialValue),
                    profileId: '',
                    status: 'published',
                    thumbnail: writing.thumbnail,
                    createdAt: new Date(),
                  }}
                />
              )
            })}
          </div>
        </>
      )}
      {!projects && !writings && gallery.length > 0 && (
        <>
          <Separator className="mt-4  w-full" />
          <div className="flex -space-x-16  w-full mt-6 ">
            {gallery.map((item, index) => {
              return (
                <GalleryItem
                  key={index}
                  item={item}
                  index={index}
                  isFirst={isFirst}
                  xPos={positions[index]?.x}
                  yPos={positions[index]?.y}
                  initalScale={positions[index]?.scale}
                  scrollYProgress={scrollYProgress}
                  rotate={positions[index]?.rotate ?? 0}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default Window

type GalleryItemProps = {
  item: string;
  index: number;
  xPos: number;
  yPos: number;
  initalScale: number;
  scrollYProgress?: any;
  rotate: number;
  isFirst: boolean;
};

const GalleryItem: FC<GalleryItemProps> = ({
  index,
  item,
  initalScale,
  scrollYProgress,
  xPos,
  yPos,
  isFirst,
  rotate,
}) => {
  const isScreen4k = useMediaQuery('(min-width: 2560px)')
  const x = useTransform(
    scrollYProgress,
    [0, isScreen4k ? 0.04 : 0.1],
    [xPos, 0]
  )
  const y = useTransform(
    scrollYProgress,
    [0, isScreen4k ? 0.04 : 0.1],
    [yPos, 0]
  )
  const scale = useTransform(
    scrollYProgress,
    [0, 0.06, 0.1],
    [initalScale, 1, 1]
  )
  return (
    <motion.div
      key={index}
      style={{
        rotate: rotate,
        zIndex: index,
        ...(isFirst && { x, y, scale: scale }),
      }}
      transition={{
        duration: 0.9,
        ease: [0.6, 0.05, -0.01, 0.9],
      }}
      className="p-2 bg-white border border-neutral-200  aspect-square flex items-center justify-center size-48 dark:bg-neutral-800 rounded-3xl  shadow-2xl even:rotate-6 odd:-rotate-6 dark:border-dark-border"
    >
      <motion.div
        style={{
          zIndex: 0,
        }}
        className="relative aspect-square size-44 rounded-3xl overflow-hidden "
      >
        <Image
          loading="eager"
          priority
          src={item}
          alt=""
          draggable={false}
          fill
          style={{ objectFit: 'cover' }}
        />
      </motion.div>
    </motion.div>
  )
}
