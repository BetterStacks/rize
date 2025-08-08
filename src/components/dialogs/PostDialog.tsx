import { useQueryState } from 'nuqs'
import { usePostDialog } from '../dialog-provider'
import { Dialog, DialogContent } from '../ui/dialog'

const PostDialog = () => {
  const [open, setOpen] = usePostDialog()
  const [query, setQuery] = useQueryState('post')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:w-full p-0 dark:bg-black/20 backdrop-blur-md max-w-[100vw] sm:h-screen "></DialogContent>
    </Dialog>
  )
}

export default PostDialog
