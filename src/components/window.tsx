import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { avatars } from "./home/hero";
import Profile from "./profile/profile";
import { Separator } from "./ui/separator";
const positions = [
  { x: 1030, y: -780, scale: 1.2, z: 1 }, // latte
  { x: -680, y: -850, scale: 1.2, z: 1 }, //dog
  { x: -600, y: -650, scale: 1.4, z: 1 }, //drake
  { x: 400, y: -560, scale: 1.2, z: 6 }, //cliff
  { x: 480, y: -560, scale: 1.4, z: 4 }, //plane
];
const items = [
  "https://i.pinimg.com/736x/8f/49/7c/8f497c92e003cc627e52dc583f883289.jpg",
  "https://i.pinimg.com/736x/5c/32/17/5c3217f51447f88fb206031eaabc411d.jpg",
  "https://i.pinimg.com/736x/94/11/bb/9411bbf53f68c6db841b54ace7e86b5d.jpg",
  "https://i.pinimg.com/736x/4a/5b/a1/4a5ba10b1ee6b6f4a4af6d5b3da0b0cf.jpg",
  "https://i.pinimg.com/736x/c2/6e/33/c26e33c90ec137102f1230525b64c4f9.jpg",
];

const Window = () => {
  const { scrollYProgress } = useScroll({
    axis: "y",
  });
  const [start, setStart] = useState(false);
  const [isWindowHovered, setIsWindowHovered] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.1 && latest < 0.13) {
      setStart(true);
      setIsWindowHovered(false);
    } else if (latest < 0.1) {
      setStart(false);
      setCurrentProfile(0);
    } else if (latest > 0.13) {
      setStart(false);
      setIsWindowHovered(true);
    }
  });

  const displayNames = [
    {
      name: "Ashwin Parande 🌻🌊",
      bio: `Blessed Stressed and Football obsessed 🌱💫
      MUACM Techical Head | Footballer by passion, Creative by destiny`,
      avatar:
        "https://res.cloudinary.com/dfccipzwz/image/upload/v1747331760/fyp-stacks/avatar/50b0d332-5bce-4722-a1c3-9affeacdca71.avatar.png",
      gallery: items,
    },
    {
      name: "Gaurav Mehta 🍵💫",
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
      name: "Siddharth Singh 🐉🌌",
      bio: `Content Creator by passion, Developer by profession | Exploring the intersection of technology and creativity`,
      avatar: avatars[1],
      gallery: [
        "https://i.pinimg.com/736x/28/8b/98/288b982eee2d40f2ef71b93d4caf8d57.jpg",
        "https://i.pinimg.com/736x/2e/1b/d5/2e1bd5c453aa330eb1e2b064a13bc883.jpg",
        "https://i.pinimg.com/736x/91/fc/87/91fc87e5cc959c89d44f88f80c0c41be.jpg",
        "https://i.pinimg.com/736x/76/c2/c5/76c2c5c95df07c3070c7de0ca9b312c7.jpg",
        "https://i.pinimg.com/736x/a8/4f/2b/a84f2bffe3cb7ce568da6c88f60770ca.jpg",
      ],
    },
    {
      name: "Aviral Signh 🌿✨",
      bio: `
      Udaipur | Heir to the throne of the royal family | Visionary with a passion for art and culture | Exploring the world one frame at a time 
      `,
      avatar: avatars[5],
      gallery: [
        "https://i.pinimg.com/736x/d6/f6/c9/d6f6c902433f535f2c9745d37436a11c.jpg",
        "https://i.pinimg.com/736x/49/8f/ed/498fede2e94b856df8b76d184a59c073.jpg",
        "https://i.pinimg.com/736x/54/4e/95/544e9508b144b7af2f853a656af8ac9a.jpg",
        "https://i.pinimg.com/736x/4b/25/03/4b2503de86f481ac9685396a4bff1df8.jpg",
        "https://i.pinimg.com/736x/5a/cb/32/5acb32a39639a75ecdb6986eb381b5bc.jpg",
      ],
    },
    {
      name: "Antonio Corella 🦁🌟",
      bio: `
      Movie Buff | Hala Madrid | Theater artist on the side | Passionate about exploring the world of cinema and football
      `,
      avatar: avatars[4],
      gallery: [
        "https://i.pinimg.com/736x/5a/cb/32/5acb32a39639a75ecdb6986eb381b5bc.jpg",
        "https://i.pinimg.com/736x/0c/93/c1/0c93c16a316b10d062dd32e45a49d548.jpg",
        "https://i.pinimg.com/736x/1e/b7/ab/1eb7ab4380acee66bc52a87666ef9bc8.jpg",
        "https://i.pinimg.com/736x/fb/18/0e/fb180e3be368c04682aa1d9388ac6f0b.jpg",
        "https://i.pinimg.com/736x/cf/ea/60/cfea608773eb886b2ac5980f8099bc60.jpg",
      ],
    },
  ];
  const [currentProfile, setCurrentProfile] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (start && !isWindowHovered) {
      interval = setInterval(() => {
        setCurrentProfile((prev) => {
          if (isWindowHovered) {
            if (interval) clearInterval(interval);
            return prev;
          }
          return (prev + 1) % displayNames.length;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [start, isWindowHovered, currentProfile, displayNames.length]);

  return (
    <motion.div className="relative hidden md:flex px-6 md:px-4  w-full  flex-col gap-x-20  items-center justify-start mt-20 pb-10">
      <div className="size-[250px] bg-gradient-to-tr from-purple-500 to-purple-300 rounded-full absolute bottom-10 left-10 -z-10 blur-[100px] " />
      <div className="size-[250px] bg-gradient-to-b dark:from-blue-700/60 dark:to-blue-500/60 from-blue-500/80 to-blue-200 rounded-full absolute top-10 right-10 -z-10 blur-[100px] " />
      <motion.div
        onMouseEnter={() => setIsWindowHovered(true)}
        onMouseLeave={() => setIsWindowHovered(false)}
        className="ring-4 ring-neutral-300 dark:ring-dark-border rounded-3xl  bg-white flex flex-col  items-center justify-start aspect-video  w-full max-w-5xl dark:bg-neutral-800 shadow-2xl"
      >
        <div className="flex w-full px-4 py-4 items-center justify-start gap-x-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="size-3 md:size-4 bg-neutral-200 dark:bg-dark-border  rounded-full"
            />
          ))}
        </div>
        <div
          className={cn(
            "flex max-w-xl w-full items-center justify-start flex-col pb-10"
          )}
        >
          <Profile
            isLoading={false}
            isMine={false}
            data={{
              isLive: true,
              id: "ef13432c-fd23-4179-a3a5-7275d6691ec9",
              name: "ashwin parande",
              email: "ashwinparande1156610c@gmail.com",
              image:
                "https://lh3.googleusercontent.com/a/ACg8ocIz77cwJ74v43xH9B1nhK0_bTMs1y6nNxAmh4EZxGKk2g1bMQY=s96-c",
              username: "ashwinwasgood",
              profileImage: displayNames[currentProfile]?.avatar || avatars[0],
              displayName: displayNames[currentProfile]?.name,
              hasCompletedWalkthrough: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              location: "India",
              bio: displayNames[currentProfile]?.bio,
              website: "https://ashwinparande.com",
              age: 19,
              pronouns: "he/him",
              userId: "",
            }}
            bioContainerClassName="h-[60px] mt-2"
          />
          {/* <div className="flex flex-wrap items-center justify-start  gap-2 w-full mt-2 ">
            {dummyLinks.map((item, index) => (
              <motion.div key={index} className="pointer-events-none">
                <SocialLinkButton {...item} />
              </motion.div>
            ))}
          </div> */}
          <Separator className="max-w-2xl w-full mt-2" />
          <div className="flex -space-x-16 mt-6">
            {displayNames[currentProfile]?.gallery?.map((item, index) => {
              return (
                <GalleryItem
                  key={index}
                  item={item}
                  index={index}
                  initalScale={positions[index]?.scale}
                  scrollYProgress={scrollYProgress}
                  xPos={positions[index]?.x}
                  yPos={positions[index]?.y}
                />
              );
            })}
          </div>
        </div>
        <div className=" flex md:hidden  relative overflow-hidden flex-col items-center justify-center w-full h-full">
          <Image alt="" fill className="" src="/minimal3.png" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Window;

type GalleryItemProps = {
  item: string;
  index: number;
  xPos: number;
  yPos: number;
  initalScale: number;
  scrollYProgress?: any;
};

const GalleryItem: FC<GalleryItemProps> = ({
  index,
  item,
  initalScale,
  scrollYProgress,
  xPos,
  yPos,
}) => {
  const x = useTransform(scrollYProgress, [0.02, 0.1], [xPos, 0]);
  const y = useTransform(scrollYProgress, [0.02, 0.1], [yPos, 0]);
  const scale = useTransform(scrollYProgress, [0.02, 0.1], [initalScale, 1]);
  return (
    <div
      key={index}
      className="size-44 even:rotate-6 odd:-rotate-6 rounded-3xl shadow-2xl aspect-square bg-neutral-100 dark:shadow-black/50 dark:bg-neutral-700 "
    >
      <motion.div
        style={{
          position: "absolute",
          x,
          y,
          scale,
          zIndex: positions[index].z,
        }}
        transition={{
          duration: 0.9,
          ease: [0.6, 0.05, -0.01, 0.9],
        }}
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        className=" aspect-square size-44 rounded-3xl overflow-hidden "
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
    </div>
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
