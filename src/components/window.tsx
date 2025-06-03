import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Profile from "./profile/profile";
import { Separator } from "./ui/separator";
const items = [
  "https://i.pinimg.com/736x/8f/49/7c/8f497c92e003cc627e52dc583f883289.jpg",
  "https://i.pinimg.com/736x/5c/32/17/5c3217f51447f88fb206031eaabc411d.jpg",
  "https://i.pinimg.com/736x/94/11/bb/9411bbf53f68c6db841b54ace7e86b5d.jpg",
  "https://i.pinimg.com/736x/4a/5b/a1/4a5ba10b1ee6b6f4a4af6d5b3da0b0cf.jpg",
  "https://i.pinimg.com/736x/c2/6e/33/c26e33c90ec137102f1230525b64c4f9.jpg",
];

const Window = () => {
  // const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    axis: "y",
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log("Scroll Progress:", latest);
  });

  const positions = [
    { x: 1030, y: -780, scale: 1.2, z: 1 }, // latte
    { x: -680, y: -850, scale: 1.2, z: 1 }, //dog
    { x: -600, y: -650, scale: 1.4, z: 1 }, //drake
    { x: 400, y: -560, scale: 1.2, z: 6 }, //cliff
    { x: 480, y: -560, scale: 1.4, z: 4 }, //plane
  ];
  return (
    <motion.div className=" hidden md:flex px-6 md:px-4  w-full  flex-col gap-x-20  items-center justify-start mt-20 pb-10">
      <motion.div className="ring-4 ring-neutral-300 dark:ring-dark-border rounded-3xl  bg-white flex flex-col  items-center justify-start aspect-video  w-full max-w-5xl dark:bg-neutral-800 shadow-2xl">
        <div className="flex w-full px-4 py-4 items-center justify-start gap-x-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="size-3 md:size-4 bg-neutral-200 dark:bg-dark-border  rounded-full"
            />
          ))}
        </div>
        <div className="flex max-w-xl w-full items-center justify-start flex-col pb-10">
          <Profile
            isLoading={false}
            isMine={false}
            data={{
              id: "ef13432c-fd23-4179-a3a5-7275d6691ec9",
              name: "ashwin parande",
              email: "ashwinparande1156610c@gmail.com",
              image:
                "https://lh3.googleusercontent.com/a/ACg8ocIz77cwJ74v43xH9B1nhK0_bTMs1y6nNxAmh4EZxGKk2g1bMQY=s96-c",
              username: "ashwinwasgood",
              profileImage:
                "https://res.cloudinary.com/dfccipzwz/image/upload/v1747331760/fyp-stacks/avatar/50b0d332-5bce-4722-a1c3-9affeacdca71.avatar.png",
              displayName: "Ashwin Parande🌻🌊",
              hasCompletedWalkthrough: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              location: "India",
              bio: `Blessed Stressed and Football obsessed 🌱💫
            MUACM Techical Head | Footballer by passion, Creative by destiny`,
              website: "https://ashwinparande.com",
              age: 19,
              pronouns: "he/him",
              userId: "",
            }}
          />
          {/* <div className="flex flex-wrap items-center justify-start  gap-2 w-full mt-2 ">
            {dummyLinks.map((item, index) => (
              <motion.div key={index} className="pointer-events-none">
                <SocialLinkButton {...item} />
              </motion.div>
            ))}
          </div> */}
          <Separator className="max-w-2xl w-full mt-4" />
          <div className="flex -space-x-16 mt-6">
            {items?.map((item, index) => {
              const x = useTransform(
                scrollYProgress,
                [0.02, 0.12],
                [positions[index].x, 0]
              );
              const y = useTransform(
                scrollYProgress,
                [0.02, 0.12],
                [positions[index].y, 0]
              );
              const scale = useTransform(
                scrollYProgress,
                [0.02, 0.12],
                [positions[index].scale, 1]
              );
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
