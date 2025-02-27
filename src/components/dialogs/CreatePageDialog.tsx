import { getPageById } from "@/lib/server-actions";
import { TPage } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePageDialog } from "../dialog-provider";
import Editor from "../editor/editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import toast from "react-hot-toast";
import { ScrollArea } from "../ui/scroll-area";

const CreatePageDialog = () => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = usePageDialog();
  const [page, setPage] = useState<typeof TPage | null>(null);
  useEffect(() => {
    (async () => {
      const data = await getPageById("e5a844cc-1ea3-4471-a63d-87ed03a25146");
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setPage(data?.data);
    })();
  }, []);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl h-[80vh] md:rounded-3xl px-0 ">
        <div>
          <ScrollArea className="h-[75vh] overflow-y-auto w-full ">
            <Editor data={page!} />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePageDialog;
