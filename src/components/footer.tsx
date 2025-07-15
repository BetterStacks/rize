"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Logo from "./logo";
import { Separator } from "./ui/separator";
import { useMediaQuery } from "@mantine/hooks";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Footer = () => {
  // const currentYear = new Date().getFullYear();
  const themeOptions = [
    {
      theme: "light",
      name: "Light",
      icon: <Sun className="opacity-80 size-5" strokeWidth={1.3} />,
    },
    {
      theme: "dark",
      name: "Dark",
      icon: <Moon className="opacity-80 size-5" strokeWidth={1.3} />,
    },
    {
      theme: "system",
      name: "System",
      icon: <Sun className="opacity-80 size-5" strokeWidth={1.3} />,
    },
  ];

  const logos = [
    <a
      href="https://twitter.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-neutral-200"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.56c-0.89 0.39-1.85 0.65-2.86 0.77a5.03 5.03 0 002.21-2.77 10.14 10.14 0 01-3.2 1.22 5 5 0 00-8.54 4.56A14.18 14.18 0 013 3.16a5 5 0 001.55 6.67A5 5 0 012 9.1v0.06a5 5 0 004.01 4.9 5.05 5.05 0 01-2.24.08 5 5 0 004.67 3.47A10.06 10.06 0 012 19.54 14.19 14.19 0 009.29 21c8.84 0 13.68-7.33 13.68-13.68 0-0.21 0-0.42-0.01-0.63A9.8 9.8 0 0024 4.56z" />
      </svg>
    </a>,
    <a
      href="https://github.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-neutral-200"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387 0.6 0.11 0.793-0.26 0.793-0.577v-2.165c-3.338 0.726-4.033-1.415-4.033-1.415-0.546-1.387-1.333-1.756-1.333-1.756-1.09-0.745 0.082-0.729 0.082-0.729 1.205 0.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495 0.997 0.108-0.776 0.418-1.304 0.76-1.604-2.665-0.3-5.467-1.332-5.467-5.931 0-1.31 0.469-2.381 1.236-3.221-0.123-0.303-0.536-1.523 0.118-3.176 0 0 1.008-0.322 3.301 1.23a11.5 11.5 0 013.003-0.403c1.02 0.005 2.048 0.138 3.003 0.403 2.291-1.553 3.297-1.23 3.297-1.23 0.656 1.653 0.243 2.873 0.12 3.176 0.77 0.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.628-5.48 5.921 0.43 0.372 0.815 1.103 0.815 2.222v3.293c0 0.32 0.192 0.694 0.8 0.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z"
        />
      </svg>
    </a>,
    <a
      href="https://linkedin.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-neutral-200"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.452 20.452h-3.554v-5.569c0-1.327-0.027-3.038-1.852-3.038-1.854 0-2.138 1.447-2.138 2.942v5.665H9.354V9h3.414v1.561h0.049c0.476-0.899 1.637-1.848 3.368-1.848 3.6 0 4.266 2.368 4.266 5.448v6.291zM5.337 7.433c-1.144 0-2.07-0.928-2.07-2.07s0.926-2.07 2.07-2.07c1.142 0 2.07 0.928 2.07 2.07s-0.928 2.07-2.07 2.07zM6.96 20.452H3.713V9h3.247v11.452zM22.225 0H1.771C0.792 0 0 0.771 0 1.729v20.542C0 23.229 0.792 24 1.771 24h20.451C23.208 24 24 23.229 24 22.271V1.729C24 0.771 23.208 0 22.225 0z" />
      </svg>
    </a>,
  ];
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <footer
      ref={ref}
      className="w-full  flex flex-col items-center justify-center "
    >
      {isDesktop && (
        <>
          <motion.div
            style={{
              rotate: 10,
            }}
            animate={
              !inView
                ? {
                    y: 10,
                    x: 800,
                  }
                : {
                    y: -300,
                    x: 700,
                  }
            }
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.5,
            }}
            className="absolute size-56 bg-white p-2 rounded-xl"
          >
            <img
              className="rounded-xl"
              src="https://i.pinimg.com/736x/a9/44/e5/a944e5a03bb1db053832d1ca216d8430.jpg"
              alt=""
            />
          </motion.div>
          <motion.div
            animate={
              !inView
                ? {
                    y: 300,
                    x: 200,
                    rotate: 4,
                  }
                : {
                    y: 0,
                    x: 100,
                    rotate: -6,
                  }
            }
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.5,
            }}
            className="max-w-md w-full h-[400px] rounded-3xl absolute  border bg-white -bottom-10 -right-24"
          >
            <img src="/window.png" alt="" />
          </motion.div>
          <motion.div
            style={{
              zIndex: 20,
            }}
            animate={
              !inView
                ? {
                    y: 300,
                    x: 200,
                    rotate: 2,
                  }
                : {
                    y: -60,
                    x: 100,
                    rotate: -8,
                  }
            }
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.5,
            }}
            className="max-w-md w-full h-[400px] rounded-3xl absolute  border bg-white -bottom-60 -right-6"
          >
            <img src="/window1.png" alt="" />
          </motion.div>
          <motion.div
            style={{
              rotate: -10,
            }}
            animate={
              !inView
                ? {
                    y: 10,
                    x: -800,
                  }
                : {
                    y: -260,
                    x: -700,
                  }
            }
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.5,
            }}
            className="absolute size-56 bg-white p-2 rounded-xl"
          >
            <img
              className="rounded-xl"
              src="https://i.pinimg.com/736x/a9/44/e5/a944e5a03bb1db053832d1ca216d8430.jpg"
              alt=""
            />
          </motion.div>
          <motion.div
            animate={
              !inView
                ? {
                    y: 300,
                    x: -200,
                    rotate: 4,
                  }
                : {
                    y: 100,
                    x: 0,
                    rotate: 6,
                  }
            }
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.5,
            }}
            className="max-w-xs w-full h-[400px] rounded-3xl absolute -bottom-10 -left-24"
          >
            <img src="/preview.png" alt="" />
          </motion.div>
        </>
      )}
      {/* <Separator className="w-full h-2 bg-transparent dark:bg-transparent mb-6 border-b border-neutral-600 mt-8" /> */}
      <div className="w-full border-t border-neutral-400/80 z-50 flex items-center justify-center bg-[#3A0CA3] py-6">
        <div className="max-w-7xl w-full flex   flex-col md:flex-row items-center justify-center md:justify-between  rounded-3xl px-6">
          <span className="text-neutral-300  text-sm md:text-base text-left font-medium ">
            &copy; {new Date().getFullYear()} Rize. All rights reserved.
          </span>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {logos.map((logo, i) => (
              <div
                key={i}
                className="flex items-center justify-center border border-neutral-300 dark:bg-neutral-950 rounded-full p-3 bg-white dark:border-dark-border"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// <footer className="w-full  py-6 mt-auto">
//   <div className=" mx-auto max-w-6xl px-4">
//     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//       <div className="flex items-center">
//         <Logo className="size-8 rounded-md" />
//         <span className="text-xl ml-4 tracking-tight font-medium ">
//           Rize.so
//         </span>
//       </div>

//       <div className="flex items-center text-sm opacity-80">
//         <Copyright size={12} className="mr-1" />
//         <span>{currentYear} Rize</span>
//       </div>
//     </div>
//   </div>
// </footer>
//   );
// };

export default Footer;
