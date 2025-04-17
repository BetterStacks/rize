import { Copyright } from "lucide-react";
import Logo from "./logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full  border-t border-gray-300/60 dark:border-dark-border py-6 mt-auto">
      <div className=" mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Logo className="size-8 rounded-md" />
            <span className="text-xl ml-4 tracking-tight font-medium ">
              Rize.so
            </span>
          </div>

          <div className="flex items-center text-sm opacity-80">
            <Copyright size={12} className="mr-1" />
            <span>{currentYear} Rize</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
