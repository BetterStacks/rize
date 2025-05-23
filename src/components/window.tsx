import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";
import { ReactNode } from "react";
import Gallery from "./gallery/gallery";
import { profile } from "console";
import GalleryItem from "./gallery/gallery-item";
import { cn } from "@/lib/utils";
import Image from "next/image";

const Window = () => {
  const items = [
    "https://i.pinimg.com/736x/52/41/de/5241de9a3090d14f86ceb2ef8bcfc7ad.jpg",
    "https://i.pinimg.com/736x/25/eb/47/25eb47fe8752b3ba19867de49eb2c801.jpg",
    "https://i.pinimg.com/736x/01/89/dd/0189dddc13e3e77478fb4d07480d2f9c.jpg",
    "https://i.pinimg.com/736x/d1/1b/98/d11b982a5a2904b3e0bb952240b4149f.jpg",
  ];
  const { scrollYProgress } = useScroll({ axis: "y" });
  const control = useAnimation();
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.16) {
      control.start("animate");
    } else {
      control.start("initial");
    }
  });
  const variants: Record<number, Variants> = {
    0: {
      initial: {
        scale: 0,
        rotate: 0,
        left: 0,
        top: "20%",
      },
      animate: {
        // y: -100,
        scale: 1,
        rotate: 6,
        left: "5%",
        top: "20%",
      },
    },
    1: {
      initial: {
        scale: 0,
        rotate: 0,
        right: 0,
        top: "20%",
      },
      animate: {
        right: "5%",
        top: "20%",
        scale: 1,
        rotate: -8,
      },
    },
    2: {
      initial: {
        scale: 0,
        rotate: 0,
        left: 0,
        top: "60%",
      },
      animate: {
        left: "5%",
        top: "60%",
        scale: 1,
        rotate: -6,
      },
    },
    3: {
      initial: {
        scale: 0,
        rotate: 0,
        right: 0,
        top: "60%",
      },
      animate: {
        right: "5%",
        top: "60%",
        scale: 1,
        rotate: 8,
      },
    },
  };
  return (
    <motion.div className="overflow-x-hidden min-h-[200vh]  p-4 relative w-full   flex flex-col gap-x-20  items-center justify-end pb-10">
      <div className="relative overflow-hidden w-full border-2 rounded-xl max-w-6xl aspect-video ">
        <Image
          src={"/light-mac-mockup.png"}
          alt=""
          fill
          // width={1920}
          // height={1080}
        />
      </div>
      {/* <motion.div className=" rounded-2xl sticky  h-[40%] md:h-screen max-w-6xl bg-white shadow-indigo-500 dark:shadow md:shadow-black/50 shadow-2xl  border border-neutral-200 dark:border-dark-border   w-full ">
        <div className="flex w-full px-4 py-3 items-center justify-start gap-x-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="size-3 md:size-4 bg-neutral-200   rounded-full"
            />
          ))}
        </div>
        <div className="flex w-full items-center justify-center  -space-x-16">
          {items.map((item, index) => {
            const itemPayload = {
              galleryMediaId: "",
              width: 200,
              height: 200,
              url: item,
              createdAt: new Date(),
              id: "",
              profileId: "",
            };
            return (
              <motion.div
                style={{ zIndex: index - items?.length }}
                variants={variants[index]}
                // initial="initial"
                animate={control}
                className={cn(
                  "size-56 even:rotate-6 odd:-rotate-6 shadow-2xl overflow-hidden  rounded-3xl"
                )}
              >
                <GalleryItem
                  index={index}
                  isMine={false}
                  item={itemPayload as any}
                />
              </motion.div>
            );
          })}
        </div>
        {/* <Gallery
          isMine={false}
          items={[
            ...(items?.map((item) => ({
              galleryMediaId: "",
              width: 200,
              height: 200,
              url: item,
              createdAt: new Date(),
              id: "",
              profileId: "",
            })) as any),
          ]}
        /> */}
      {/* </motion.div> */}
    </motion.div>
  );
};

export default Window;
