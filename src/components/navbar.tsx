import { useRightSidebar } from "@/lib/context";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { Edit3, Sidebar } from "lucide-react";
import { useTheme } from "next-themes";
import { FC } from "react";
import { useProfileDialog } from "./dialog-provider";
import Menu from "./menu";
import { Button } from "./ui/button";

type NavbarProps = {
  isMine: boolean;
};

const Navbar: FC<NavbarProps> = ({ isMine }) => {
  // const { theme, setTheme } = useTheme();
  const setOpen = useProfileDialog()[1];
  const setSidebarOpen = useRightSidebar()[1];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return (
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
