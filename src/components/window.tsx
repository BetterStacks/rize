import { cn } from "@/lib/utils";
import {
  MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { FC, useRef, useState } from "react";
import { initialValue } from "./editor/utils";
import { dummyLinks, SocialLinkButton } from "./profile/social-links";
import ProjectCard from "./projects/project-card";
import { Separator } from "./ui/separator";
import WritingCard from "./writings/writing-card";
const positions = [
  { x: 1000, y: -1200, scale: 0.9, z: 1, rotate: -6 }, // latte
  { x: -560, y: -1200, scale: 0.9, z: 1, rotate: 6 }, //dog
  { x: -540, y: -1000, scale: 0.9, z: 1, rotate: -6 }, //drake
  { x: 400, y: -1000, scale: 0.9, z: 6, rotate: 6 }, //cliff
  { x: 500, y: -900, scale: 0.9, z: 4, rotate: -6 }, //plane
];
const avatars = [
  "https://i.pinimg.com/736x/6e/81/48/6e8148281a25fb25230a983b09371ae5.jpg",
  "https://i.pinimg.com/736x/59/59/52/5959526847cf6be79778c37505604411.jpg",
  "https://i.pinimg.com/736x/cf/6e/c4/cf6ec445df41899479978aa16f05c996.jpg",
  "https://i.pinimg.com/736x/0d/00/fa/0d00faf7e0a04fe724ecd886df774e4c.jpg",
  "https://i.pinimg.com/736x/af/6c/76/af6c761bac0ef8d3e5f775fe1200b1a9.jpg",
  "https://i.pinimg.com/736x/70/5a/2c/705a2c53fa0b166937c6847410ccb3d5.jpg",
  "https://lh3.googleusercontent.com/a/AEdFTp6zJR7vEcGJmGFt0Gxk2Ech8ic0LGCVTPDTB95lVpg=s256-c",
];
const items = [
  "https://i.pinimg.com/736x/8f/49/7c/8f497c92e003cc627e52dc583f883289.jpg",
  "https://i.pinimg.com/736x/5c/32/17/5c3217f51447f88fb206031eaabc411d.jpg",
  "https://i.pinimg.com/736x/94/11/bb/9411bbf53f68c6db841b54ace7e86b5d.jpg",
  "https://i.pinimg.com/736x/4a/5b/a1/4a5ba10b1ee6b6f4a4af6d5b3da0b0cf.jpg",
  "https://i.pinimg.com/736x/c2/6e/33/c26e33c90ec137102f1230525b64c4f9.jpg",
];
const displayNames = [
  {
    username: "ashhhwwinnn",
    banner:
      "https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg",
    name: "Ashwin Parande🌻🌊",
    bio: `Blessed Stressed and Football obsessed 🌱💫
    MUACM Techical Head | Footballer by passion, Creative by destiny`,
    avatar:
      "https://i.pinimg.com/736x/7d/b9/3d/7db93dbe7d2de085d247816ea79a7c92.jpg",
    gallery: items,
  },
  {
    username: "haileyvannn",
    banner:
      "https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg",
    name: "Hailey Van🌻🌊",
    bio: `Blessed Stressed and Football obsessed 🌱💫
    MUACM Techical Head | Footballer by passion, Creative by destiny`,
    avatar:
      "https://i.pinimg.com/736x/94/3e/46/943e468e2193f42206c4640dfec13ea4.jpg",
    gallery: items,
    projects: [
      {
        name: "pluto.ai",
        link: "https://pluto.ai",
        description:
          "AI powered platform for creating and managing your own AI agents",
        // image:"https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg"
      },
      {
        name: "make.ai",
        link: "https://make.ai",
        description: "Create your own AI agents with ease",
        // image:"https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg"
      },
    ],
  },
  {
    username: "singhrajat",
    banner:
      "https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg",
    name: "Rajat Singh 🍵💫",
    bio: `Caffe Hoping in Delhi | Fashion Enthusiast | on a mission to redefine style and elegance`,
    avatar: avatars[3],
    gallery: [
      "https://i.pinimg.com/736x/d6/c2/e4/d6c2e416f4f5b6f59fad89f6c7f138fe.jpg",
      "https://i.pinimg.com/736x/f6/6b/d6/f66bd6960d1907de075ea330a13d4858.jpg",
      "https://i.pinimg.com/736x/22/34/de/2234ded64d5f3c959017c49c195bc992.jpg",
      "https://i.pinimg.com/736x/97/15/ba/9715bab175b78fa152e11520959c1afc.jpg",
      "https://i.pinimg.com/736x/f5/c8/fa/f5c8fadba5527382a7b28b65f25b4d11.jpg",
    ],
  },
  {
    username: "linusatwork",
    banner:
      "https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg",
    name: "Linus Mathew 🐉🌌",
    bio: `Content Creator by passion, Developer by profession | Exploring the intersection of technology and creativity`,
    avatar: avatars[1],
    writings: [
      {
        title:
          "How to understand hard CS concepts and scale applications using the Black Box method",
        description: "A journey of self-discovery and growth",
        thumbnail:
          "https://i.pinimg.com/736x/11/25/7b/11257b84f71336ba7e78574d24189fc2.jpg",
      },
    ],
    gallery: [
      "https://i.pinimg.com/736x/28/8b/98/288b982eee2d40f2ef71b93d4caf8d57.jpg",
      "https://i.pinimg.com/736x/2e/1b/d5/2e1bd5c453aa330eb1e2b064a13bc883.jpg",
      "https://i.pinimg.com/736x/91/fc/87/91fc87e5cc959c89d44f88f80c0c41be.jpg",
      "https://i.pinimg.com/736x/76/c2/c5/76c2c5c95df07c3070c7de0ca9b312c7.jpg",
      "https://i.pinimg.com/736x/a8/4f/2b/a84f2bffe3cb7ce568da6c88f60770ca.jpg",
    ],
  },
  // {
  //   username: "aviralsingh",
  //   banner:
  //     "https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg",
  //   name: "Aviral Signh 🌿✨",
  //   bio: `
  //   Udaipur | Heir to the throne of the royal family | Visionary with a passion for art and culture | Exploring the world one frame at a time
  //   `,
  //   avatar: avatars[5],
  //   gallery: [
  //     "https://i.pinimg.com/736x/d6/f6/c9/d6f6c902433f535f2c9745d37436a11c.jpg",
  //     "https://i.pinimg.com/736x/49/8f/ed/498fede2e94b856df8b76d184a59c073.jpg",
  //     "https://i.pinimg.com/736x/54/4e/95/544e9508b144b7af2f853a656af8ac9a.jpg",
  //     "https://i.pinimg.com/736x/4b/25/03/4b2503de86f481ac9685396a4bff1df8.jpg",
  //     "https://i.pinimg.com/736x/5a/cb/32/5acb32a39639a75ecdb6986eb381b5bc.jpg",
  //   ],
  // },
];
const stickers = {
  0: [
    { url: "stars.png", x: -40, y: -10 },
    { url: "figma.png", x: 400, y: 500, rotate: 6, scale: 2 },
  ],
  1: [
    { url: "computer.png", x: 400, y: -10, rotate: 10, scale: 2.1 },
    { url: "bash.png", x: -50, y: 460, scale: 2.5 },
    { url: "cursor.png", x: 100, y: 100 },
  ],
  2: [
    { url: "hello.png", x: -40, y: -100 },
    { url: "headphone.png", x: 100, y: 100 },
  ],
  3: [
    { url: "stars.png", x: -40, y: -100 },
    { url: "warning.png", x: 100, y: 100 },
  ],
};
const Window = () => {
  const { scrollYProgress } = useScroll({
    axis: "y",
  });
  const [insideProfileContainer, setInsideProfileContainer] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log({ window: latest });

    setInsideProfileContainer(latest >= 0.12);
  });

  const x = useTransform(scrollYProgress, [0.12, 0.4], [0, -2700]);

  return (
    <div
      // ref={containerRef}
      className="h-[600vh] hidden mt-10 w-full lg:flex flex-col justify-start"
    >
      {/* <div className="relative w-full flex items-center justify-start"> */}
      <div className="max-w-5xl w-full mx-auto px-4 ">
        <h3 className="text-2xl md:text-3xl font-medium tracking-tight leading-tight">
          Rise is for{" "}
          <span className="font-instrument font-thin text-3xl md:text-4xl italic">
            Everyone
          </span>
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 font-medium mt-2">
          Real people. Diverse stories. One platform to express it all — see how
          creators, professionals, <br className="hidden md:block" /> and
          dreamers showcase their authentic selves on Rize.
        </p>
      </div>
      {/* <div className="w-full overflow-x-hidden flex items-center justify-start"> */}
      <motion.div
        style={{ x }}
        className="w-full  flex  gap-8  scroll-smooth snap-x snap-mandatory items-center justify-start  h-screen sticky top-0 md:pl-[260px] "
      >
        {displayNames.map((item, index) => {
          return (
            <motion.div
              key={index}
              className={cn(
                "max-w-4xl shrink-0 border border-neutral-200 dark:bg-neutral-900 dark:border-dark-border rounded-3xl h-[640px] aspect-video  flex items-start shadow-xl flex-col w-full snap-mandatory snap-center relative ",
                insideProfileContainer && "overflow-hidden"
              )}
            >
              <ProfileContainer
                avatar={item.avatar}
                name={item.name}
                bio={item.bio}
                gallery={item.gallery}
                username={item.username}
                projects={item.projects as any}
                writings={item.writings as any}
                scrollYProgress={scrollYProgress}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

type ProfileContainerProps = {
  avatar: string;
  name: string;
  bio: string;
  gallery: string[];
  projects?: any[];
  username: string;
  writings?: any[];
  scrollYProgress: any;
};

const ProfileContainer: FC<ProfileContainerProps> = ({
  avatar,
  name,
  bio,
  gallery,
  username,
  projects,
  writings,
  scrollYProgress,
}) => {
  return (
    <div className="w-full h-full  px-6 py-10 max-w-2xl mx-auto">
      <div className="flex flex-col items-start justify-start">
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
            );
          })}
        </div>
      </div>
      {projects!?.length > 0 && (
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
                    status: "wip",
                    thumbnail: "",
                    logo: "",
                    url: project.link,
                    id: "",
                    profileId: "",
                  }}
                />
              );
            })}
          </div>
        </>
      )}
      {writings!?.length > 0 && (
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
          <Separator className="mt-4" />
          <div className="flex -space-x-16 mt-6">
            {gallery.map((item, index) => {
              return (
                <GalleryItem
                  key={index}
                  item={item}
                  index={index}
                  xPos={positions[index]?.x}
                  yPos={positions[index]?.y}
                  initalScale={positions[index]?.scale}
                  scrollYProgress={scrollYProgress}
                  rotate={positions[index]?.rotate ?? 0}
                  // insideProfileContainer={insideProfileContainer}
                />
                // <div className="size-44 rounded-3xl shadow-2xl aspect-square bg-neutral-100 dark:shadow-black/50 dark:bg-neutral-700 relative p-2">
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Window;

type GalleryItemProps = {
  item: string;
  index: number;
  xPos: number;
  yPos: number;
  currentProfile?: number;
  initalScale: number;
  scrollYProgress?: any;
  rotate: number;
  // insideProfileContainer: boolean;
};

const GalleryItem: FC<GalleryItemProps> = ({
  index,
  item,
  initalScale,
  scrollYProgress,
  xPos,
  yPos,
  currentProfile,
  rotate,
  // insideProfileContainer,
}) => {
  const x = useTransform(scrollYProgress, [0, 0.1], [xPos, 0]);
  const y = useTransform(scrollYProgress, [0, 0.1], [yPos, 0]);
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
        x,
        y,
        scale: scale,
      }}
      transition={{
        duration: 0.9,
        ease: [0.6, 0.05, -0.01, 0.9],
      }}
      className="p-2 bg-white border border-neutral-200  aspect-square flex items-center justify-center size-48 dark:bg-neutral-800 rounded-3xl  shadow-2xl even:rotate-6 odd:-rotate-6 dark:border-dark-border"
    >
      <motion.div
        // key={currentProfile}
        style={{
          zIndex: 0,
        }}
        // style={{
        //   position: "absolute",
        //   // x,
        //   // y,
        //   // scale,
        //   zIndex: positions[index].z,
        // }}
        className="relative aspect-square size-44 rounded-3xl overflow-hidden "
      >
        <Image
          loading="eager"
          priority
          src={item}
          alt=""
          draggable={false}
          fill
          style={{ objectFit: "cover" }}
        />
      </motion.div>
    </motion.div>
  );
};

// <div className="flex w-full items-center justify-center  -space-x-16">
//   {items.map((item, index) => {
//     return (
//       <motion.div
//         // style={{ zIndex: index - items?.length }}
//         variants={socialLinksVariants[index]}
//         animate={control}
//         transition={{
//           duration: 0.6,
//           type: "spring",
//           stiffness: 100,
//           damping: 20,
//           mass: 0.5,
//         }}
//         className={cn(
//           "size-44  shadow-2xl overflow-hidden  rounded-3xl"
//         )}
//       >
//         <img
//           src={item}
//           style={{ objectFit: "fill" }}
//           className="aspect-square w-full h-full"
//         />
//       </motion.div>
//     );
//   })}
// </div>
