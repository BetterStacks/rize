import { useRightSidebar } from "@/lib/context";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import {
  Compass,
  Edit3,
  Home,
  Inbox,
  Search,
  Settings,
  Sidebar,
} from "lucide-react";
import { useTheme } from "next-themes";
import { FC } from "react";
import { useProfileDialog } from "./dialog-provider";
import Menu from "./menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Logo from "./logo";

type NavbarProps = {
  isMine: boolean;
};

const Navbar: FC<NavbarProps> = ({ isMine }) => {
  const setOpen = useProfileDialog()[1];
  const setSidebarOpen = useRightSidebar()[1];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return (
    // <nav className="absolute  top-0 w-full flex items-center justify-center z-50 py-3 px-2 md:px-0">
    //   <div className="max-w-3xl w-full flex items-center justify-center">
    //     <div className="flex items-center space-x-2">
    //       <Logo className="size-8" />
    //       <Button
    //         variant={"ghost"}
    //         size={"sm"}
    //         className="rounded-lg"
    //         onClick={() => setSidebarOpen(true)}
    //       >
    //         <Home strokeWidth={1.5} className="size-5 opacity-80" />
    //         <span className="ml-2 opacity-80">Home</span>
    //       </Button>
    //       <Button
    //         variant={"ghost"}
    //         size={"sm"}
    //         className="rounded-lg"
    //         onClick={() => setSidebarOpen(true)}
    //       >
    //         <Compass strokeWidth={1.5} className="size-5 opacity-80" />
    //         <span className="ml-2 opacity-80">Explore</span>
    //       </Button>
    //     </div>
    //     <div className="flex-1 flex items-center justify-center">
    //       <div className="max-w-md bg-neutral-200 dark:bg-dark-border w-full px-2  py-2 rounded-lg flex items-center justify-start">
    //         <Search strokeWidth={1.5} className="size-5 opacity-80" />
    //         <input
    //           className="ml-2 bg-transparent w-full h-full focus-visible:outline-none"
    //           placeholder="Search"
    //         />
    //       </div>
    //     </div>
    //   </div>
    //   <div className="space-x-2">
    //     <Button
    //       size={"icon"}
    //       variant={"ghost"}
    //       className="rounded-lg"
    //       onClick={() => setOpen(true)}
    //     >
    //       <Inbox strokeWidth={1.5} className="size-5 opacity-80" />
    //     </Button>
    //     <Button
    //       size={"icon"}
    //       variant={"ghost"}
    //       className="rounded-lg"
    //       onClick={() => setOpen(true)}
    //     >
    //       <Settings strokeWidth={1.5} className="size-5 opacity-80" />
    //     </Button>
    //   </div>
    // </nav>
    <nav className="absolute top-0 w-full flex items-center justify-center z-50 py-3 px-2 md:px-0 ">
      <div
        className={cn(
          "w-full flex items-center  relative justify-end px-2 md:px-4  ",
          isMine && !isDesktop && "justify-between"
        )}
      >
        {isMine && !isDesktop && (
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-2xl p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Sidebar strokeWidth={1.5} className="size-5 opacity-70" />
          </Button>
        )}
        {/* <Logo /> */}

        <div className="gap-x-2 flex items-center justify-center ">
          {/* <Button
            variant={"outline"}
            size={"icon"}
            className={cn(
              "p-2 rounded-2xl border-none focus-visible:outline-none text-sm ",
              theme === "dark"
                ? "dark:bg-orange-300 dark:hover:bg-orange-400"
                : "bg-purple-600 hover:bg-purple-700"
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun strokeWidth={1.5} className="text-sm stroke-orange-950" />
            ) : (
              <Moon strokeWidth={1.5} className="text-sm stroke-purple-100" />
            )}
          </Button> */}

          {isMine && (
            <>
              <Button
                variant={"outline"}
                size={"icon"}
                className=" rounded-2xl size-10 p-2"
                onClick={() => setOpen(true)}
              >
                <Edit3 strokeWidth={1.5} className="size-5 opacity-70" />
              </Button>
            </>
          )}
          <Menu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
