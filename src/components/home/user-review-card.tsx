import { cn } from '@/lib/utils'
import { AnimatePresence, motion, MotionValue } from 'framer-motion'
import Image from 'next/image'
import { FC, Fragment } from 'react'

type UserReviewCardProps = {
  scrollProgress: MotionValue<number>;
  targetScale: number;
  img: string;
  name: string;
  content: string;
  position: string;
  index: number;
  matches: boolean;
  hovered: number | null;
};

const UserReviewCard: FC<UserReviewCardProps> = ({
  content,
  hovered,
  position,
  img,
  index,
  name,
  matches,
}) => {
  return (
    <div
      className={cn(
        ' relative  overflow-hidden w-full text-white group rounded-[2.5rem]  h-[600px]  '
      )}
    >
      <Image
        src={img}
        fill
        alt=""
        className={cn(
          '-z-10 dark:saturate-75 select-none transition-all brightness-75 duration-200 ease-in-out',
          matches
            ? hovered !== null && hovered !== index && 'brightness-[40%]'
            : 'brightness-75'
        )}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          aspectRatio: 1 / 1,
        }}
      />
      <AnimatePresence>
        <div
          style={{ zIndex: 10 }}
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent "
        />
        <motion.div
          style={{ zIndex: 20 }}
          transition={{ duration: 0.6, ease: [0.075, 0.82, 0.165, 1] }}
          className={cn(
            '  flex flex-col w-full items-start px-6 pb-6 justify-center space-y-3 absolute bottom-0 left-0 right-0 ',
            matches && hovered !== null && hovered !== index && 'brightness-50'
          )}
        >
          <h2 className="tracking-tight font-medium md:font-semibold text-xl md:text-2xl">
            {name}
          </h2>
          <p className="mt-3 shrink-0 text-nowrap text-lg opacity-90 leading-tight ">
            {position.split('\n').map((line, i) => (
              <Fragment key={i}>
                {line} <br />
              </Fragment>
            ))}
          </p>
          {matches ? (
            hovered === index && (
              <motion.p
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  // ease: [0.075, 0.82, 0.165, 1],
                  duration: 0.3,
                }}
                className=" mt-4  tracking-tight   text-xl font-medium leading-snug"
              >
                "
                {content.split('\n').map((line, i) => (
                  <Fragment key={i}>
                    {line}
                    <br className="last:hidden" />
                  </Fragment>
                ))}
                "
              </motion.p>
            )
          ) : (
            <motion.p
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className=" mt-4  tracking-tight   text-xl font-medium leading-snug"
            >
              "
              {content.split('\n').map((line, i) => (
                <Fragment key={i}>
                  {line}
                  <br className="last:hidden" />
                </Fragment>
              ))}
              "
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default UserReviewCard
