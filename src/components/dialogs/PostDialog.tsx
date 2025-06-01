import { useQueryState } from "nuqs";
import { usePostDialog } from "../dialog-provider";
import { Dialog, DialogContent } from "../ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/actions/post-actions";

const PostDialog = () => {
  const [open, setOpen] = usePostDialog();
  const [query, setQuery] = useQueryState("post");

  const { data, isLoading } = useQuery({
    enabled: !!query,
    queryKey: ["get-post-by-id", query],
    queryFn: async () => getPostById(query as string),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:w-full p-0 dark:bg-black/20 backdrop-blur-md max-w-[100vw] sm:h-screen ">
        <div className="dark:bg-dark-bg justify-self-end max-w-xs w-full h-screen">
          {data?.content}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDialog;
