import { cn } from "@/lib/utils";
import { useClickOutside } from "@mantine/hooks";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  Bell,
  Compass,
  LogOut,
  MenuIcon,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useProfileDialog, useSearchDialog } from "./dialog-provider";
import { Button } from "./ui/button";

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
  const options = [
    {
      id: 1,
      name: "Explore",
      href: "/",
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
        className="rounded-2xl z-50 size-10 p-2"
        onClick={() => setOpen(!open)}
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
              "absolute top-14 bg-white shadow-2xl backdrop-blur-2xl dark:bg-dark-bg rounded-3xl border border-neutral-300/60 flex flex-col w-[210px] space-y-1.5 overflow-hidden py-4 dark:border-dark-border/80 z-50",
              isMine ? "right-8" : "right-0"
            )}
          >
            {options.map((option, i) => (
              <motion.div
                key={i}
                className="flex w-full items-center border-t first:border-none pt-1 border-neutral-300/60 dark:border-dark-border/80 justify-start gap-x-4 cursor-pointer px-4"
                onClick={option.onClick}
              >
                {option.icon}
                <span className="tracking-tight opacity-80">{option.name}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Menu;
