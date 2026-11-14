import { useMediaQuery } from "@mantine/hooks";
import { motion, useTransform } from "framer-motion";
import Image from "next/image";
import { Phone } from "lucide-react";
import { FC } from "react";
import { CreativeAvatar } from "./ui/creative-avatar";
import { Initials } from "./home/mock-profile-card";
import { initialValue } from "./editor/utils";
import { getIcon, platformLabel } from "@/lib/utils";
import { SocialPlatform } from "@/lib/types";
import ProjectCard from "./projects/project-card";
import { Separator } from "./ui/separator";
import WritingCard from "./writings/writing-card";
const positions = [
  { x: 960, y: -1300, scale: 0.9, z: 1, rotate: -6 }, // latte
  { x: -620, y: -1300, scale: 0.9, z: 1, rotate: 6 }, //dog
  { x: -620, y: -1100, scale: 0.9, z: 1, rotate: -6 }, //drake
  { x: 380, y: -1100, scale: 0.9, z: 6, rotate: 6 }, //cliff
  { x: 450, y: -900, scale: 0.9, z: 4, rotate: -6 }, //plane
];

/** A gallery tile is either an image URL or a short note in the person's own words. */
export type GalleryTile = string | { note: string };

type ProfileContainerProps = {
  avatar: string | null;
  name: string;
  bio: string;
  gallery: GalleryTile[];
  projects?: any[];
  username: string;
  writings?: any[];
  /** One shared moment, quoted from the person's own words. */
  moment?: { quote: string; date: string };
  links?: SocialPlatform[];
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
  moment,
  links = ["instagram", "twitter", "linkedin"],
  scrollYProgress,
  isFirst,
}) => {
  return (
    <div className="w-full h-full  px-6 py-10 max-w-2xl mx-auto">
      <div className="flex flex-col items-start 4k:mt-10  justify-start">
        {avatar ? (
          <CreativeAvatar
            src={avatar}
            name={name}
            size="xl"
            variant="auto"
            showHoverEffect={false}
            className="border-2 border-hairline"
          />
        ) : (
          <Initials name={name} className="size-16 text-3xl ring-1 ring-ink/10" />
        )}
        <h3 className="font-instrument text-3xl text-ink mt-4">{name}</h3>
        <span className="text-ink-secondary bg-subtle px-3 rounded-full text-sm py-1 font-medium mt-2">
          @{username}
        </span>
        <p className="text-ink-secondary mt-2">
          {bio}
        </p>
        <ul className="flex mt-4 items-center gap-2" aria-label={`${name}'s links`}>
          {links.map((platform) => (
            <li
              key={platform}
              title={platformLabel(platform)}
              className="size-9 rounded-full border border-hairline bg-surface flex items-center justify-center"
            >
              <Image
                src={`/${getIcon(platform) || "globe.svg"}`}
                alt={platformLabel(platform)}
                width={16}
                height={16}
                className={`size-4 ${platform === "github" || platform === "twitter" ? "dark:invert" : ""}`}
              />
            </li>
          ))}
        </ul>
      </div>
      {moment && (
        <figure className="mt-6 w-full rounded-2xl landing-wash-soft px-5 py-4">
          <figcaption className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <Phone aria-hidden="true" strokeWidth={1.8} className="size-3.5" />
            From a call · {moment.date}
          </figcaption>
          <blockquote className="mt-2 font-instrument text-2xl leading-snug text-ink">
            &ldquo;{moment.quote}&rdquo;
          </blockquote>
        </figure>
      )}
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
                    status: "wip",
                    thumbnail: "",
                    logo: "",
                    tagline: "",
                    url: project.link,
                    id: "",
                    profileId: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    upvoteCount: 0,
                    downvoteCount: 0,
                  }}
                  onOpenProject={() => { }}
                  onEditProject={() => { }}
                />
              );
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
                    id: "",
                    title: writing.title,
                    content: JSON.stringify(initialValue),
                    profileId: "",
                    status: "published",
                    thumbnail: writing.thumbnail,
                    createdAt: new Date(),
                  }}
                />
              );
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileContainer;

type GalleryItemProps = {
  item: GalleryTile;
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
  const isScreen4k = useMediaQuery("(min-width: 2560px)");
  const x = useTransform(
    scrollYProgress,
    [0, isScreen4k ? 0.04 : 0.1],
    [xPos, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, isScreen4k ? 0.04 : 0.1],
    [yPos, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.06, 0.1],
    [initalScale, 1, 1]
  );
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
      className="p-2 bg-surface border border-hairline aspect-square flex items-center justify-center size-48 rounded-3xl shadow-float even:rotate-6 odd:-rotate-6"
    >
      <motion.div
        style={{
          zIndex: 0,
        }}
        className="relative aspect-square size-44 rounded-3xl overflow-hidden "
      >
        {typeof item === "string" ? (
          <Image
            loading="eager"
            priority
            src={item}
            alt=""
            draggable={false}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="absolute inset-0 bg-highlight flex items-center p-4">
            <p className="font-instrument text-xl leading-tight text-ink">
              &ldquo;{item.note}&rdquo;
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
