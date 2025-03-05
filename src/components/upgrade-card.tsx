import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";

const UpgradeCard = () => {
  return (
    <Card className="rounded-2xl bg-neutral-100 dark:bg-[#222222] shadow-md shadow-black/20">
      <CardContent className="py-4 ">
        <h2 className=" font-instrument tracking-wider text-xl leading-tight font-bold mb-2">
          Try Pro for free 🤩
        </h2>
        <p className=" mb-2 opacity-70 leading-none">
          It's the most popular plan for content creators and businesses.
        </p>
        <Button className="bg-indigo-700 w-full rounded-3xl  mt-3 text-white">
          <Zap className="size-4 fill-black" /> <span>Upgrade</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradeCard;
