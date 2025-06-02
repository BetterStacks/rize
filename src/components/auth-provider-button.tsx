import React, { FC } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

type AuthProviderButtonProps = {
  provider: "github" | "google";
  icon: string | React.ReactNode;
  className?: string;
  handleClick: () => void;
  children?: React.ReactNode;
  isLoading: boolean;
};

const AuthProviderButton: FC<AuthProviderButtonProps> = ({
  handleClick,
  icon,
  provider,
  className,
  children,
  isLoading,
}) => {
  return (
    <Button
      onClick={handleClick}
      variant={"outline"}
      disabled={isLoading}
      className={cn("rounded-lg px-6 ", className)}
    >
      {isLoading ? (
        <Loader className="animate-spin size-4 opacity-80 mr-2" />
      ) : (
        <Image
          width={25}
          height={25}
          className="aspect-square size-6 mr-2"
          src={icon as string}
          alt={`${provider} Logo`}
        />
      )}
      {children}
    </Button>
  );
};

export default AuthProviderButton;
