import React, { FC } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AuthProviderButtonProps = {
  provider: "github" | "google";
  icon: string | React.ReactNode;
  className?: string;
  handleClick: () => void;
  children?: React.ReactNode;
};

const AuthProviderButton: FC<AuthProviderButtonProps> = ({
  handleClick,
  icon,
  provider,
  className,
  children,
}) => {
  return (
    <Button onClick={handleClick} className={cn("rounded-lg px-6 ", className)}>
      <Image
        width={25}
        height={25}
        className="aspect-square size-6 mr-1"
        src={icon as string}
        alt={`${provider} Logo`}
      />{" "}
      {children}
    </Button>
  );
};

export default AuthProviderButton;
