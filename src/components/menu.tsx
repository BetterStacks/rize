import { cn } from "@/lib/utils";
import { useClickOutside } from "@mantine/hooks";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  Bell,
  Compass,
  LogOut,
  MenuIcon,
  Moon,
  Search,
  Settings,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useProfileDialog, useSearchDialog } from "./dialog-provider";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useTheme } from "next-themes";

const Menu = () => {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const params = useParams();
  const isMine = session?.data?.user?.username === params?.username;
  const setProfileDialogOpen = useProfileDialog()[1];
  const setOpenSearch = useSearchDialog()[1];
  const ref = useClickOutside(() => {
    setOpen(false);
  });
  const { theme, setTheme } = useTheme();
  const loggedInOptions = [
    {
      id: 4,
      name: "Notifications",
      href: null,
      onClick: () => {},
      icon: <Bell className="opacity-80 size-5" strokeWidth={1.5} />,
    },
    {
      id: 2,
      name: "Account",
      href: `/${session?.data?.user?.username}`,
      onClick: () => {},
      icon: <UserRound className="opacity-80 size-5" strokeWidth={1.5} />,
    },
    {
      id: 5,
      name: "Settings",
      href: `/${session?.data?.user?.username}?tab=settings`,
      onClick: () => {
        setProfileDialogOpen(true);
      },
      icon: <Settings className="opacity-80 size-5" strokeWidth={1.5} />,
    },
    {
      id: 6,
      name: "Logout",
      href: null,
      onClick: () => {
        signOut();
      },
      icon: <LogOut className="opacity-80 size-5" strokeWidth={1.5} />,
    },
  ];
  const options = [
    {
      id: 1,
      name: "Explore",
      href: "/explore",
      onClick: () => {},
      icon: <Compass className="opacity-80 size-5" strokeWidth={1.5} />,
    },
    {
      id: 3,
      name: "Search",
      href: null,
      onClick: () => {
        setOpenSearch(true);
      },
      icon: <Search className="opacity-80 size-5" strokeWidth={1.5} />,
    },
  ];
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
  ];
  const menuVariants: Variants = {
    hide: {
      y: -20,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -20,
      opacity: 0,
    },
  };
  return (
    <>
      <Button
        variant={"outline"}
        size={"icon"}
        className="rounded-2xl size-10 p-2"
        onClick={() => setOpen(true)}
      >
        {open ? (
          <X strokeWidth={1.5} className="size-5 opacity-70" />
        ) : (
          <MenuIcon strokeWidth={1.5} className="size-5 opacity-70" />
        )}
      </Button>
      <AnimatePresence custom={open}>
        {open && (
          <motion.div
            ref={ref}
            variants={menuVariants}
            transition={{ duration: 0.3 }}
            initial="hide"
            animate="show"
            exit={"exit"}
            className={cn(
              "absolute top-14 bg-white  shadow-2xl backdrop-blur-2xl dark:bg-dark-bg rounded-3xl border border-neutral-300/60 flex flex-col w-[210px]  overflow-hidden  dark:border-dark-border/80 z-50",
              isMine ? "right-4" : "right-4"
            )}
          >
            <motion.div
              layout
              className="flex items-center p-2 justify-center pt-2"
            >
              {themeOptions.map((option, i) => (
                <div
                  key={i}
                  onClick={() => setTheme(option?.theme)}
                  className="w-full  cursor-pointer relative flex flex-col items-center justify-center p-2 pt-4 gap-2"
                >
                  {option.icon}
                  <span className="tracking-tight text-sm font-medium opacity-80">
                    {option.name}
                  </span>
                  {theme === option?.theme && (
                    <motion.div
                      layoutId="bubble"
                      className="absolute inset-0 -z-10 bg-neutral-100 dark:bg-dark-border/80 rounded-2xl"
                    />
                  )}
                </div>
              ))}
            </motion.div>
            <Separator />
            {[...options, ...(session?.data ? loggedInOptions : [])].map(
              (option, i) => (
                <motion.div
                  key={i}
                  className="flex w-full items-center border-none pt-1 border-neutral-300/60 dark:border-dark-border/80 justify-start gap-x-4 cursor-pointer mt-1 px-4 last:mb-4"
                  onClick={option.onClick}
                >
                  {option.icon}
                  <span className="tracking-tight opacity-80">
                    {option.name}
                  </span>
                </motion.div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Menu;
