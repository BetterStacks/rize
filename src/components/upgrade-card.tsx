import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const UpgradeCard = () => {
  return (
    <Card className="rounded-2xl  dark:bg-[#222222] shadow-md shadow-black/20">
      <CardContent className="py-4 ">
        <h2 className=" text-lg tracking-tight leading-tight mb-2">
          Try Pro for free 🤩
        </h2>
        <p className=" mb-2 opacity-70 leading-tight">
          It's the most popular plan for content creators and businesses.
        </p>
        <Button className="bg-indigo-700 w-full rounded-3xl  mt-3 text-white">
          <Zap className="size-4 fill-white" /> <span>Upgrade</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradeCard;
