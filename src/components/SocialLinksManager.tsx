import {
  addSocialLink,
  getSocialLinks,
  removeSocialLink,
} from '@/actions/social-links-actions'
import { SocialPlatform } from '@/lib/types'
import { Edit2, Loader, Plus, Trash2 } from 'lucide-react'
import NextLink from 'next/link'

import { queryClient } from '@/lib/providers'
import { capitalizeFirstLetter, cleanUrl, cn, getIcon } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Share2 } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React from 'react'
import toast from 'react-hot-toast'
import { useSocialLinksDialog } from './dialog-provider'
import SocialLinksDialog from './dialogs/AddSocialLinksDialog'
import EditSocialLink from './dialogs/EditSocialLinkDialog'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

const SocialLinksManager = () => {
  const params = useParams<{ username: string }>()
  const setSocialLinksDialogOpen = useSocialLinksDialog()[1]

  const [linkToEdit, setLinkToEdit] = React.useState<{
    id: string;
    url: string;
    platform: SocialPlatform;
  } | null>(null)

  const [editLinkDialogOpen, setEditLinkDialogOpen] = React.useState(false)
  const { data: links = [] } = useQuery({
    enabled: !!params?.username,
    queryKey: ['get-social-links', params?.username],
    queryFn: () => getSocialLinks(params?.username),
  })

  const existingPlatforms = links!.map(
    (link) => link.platform
  ) as SocialPlatform[]

  const { mutate: addSocialLinkMutation } = useMutation({
    mutationFn: ({
      url,
      platform,
    }: {
      url: string;
      platform: SocialPlatform;
    }) => addSocialLink(url, platform),
    onSuccess: () => {
      toast.success('Social link added')
      queryClient.invalidateQueries({ queryKey: ['get-social-links'] })
      setSocialLinksDialogOpen(false)
    },
    onError: (error) => {
      toast.error(error?.message)
    },
  })
  const handleEditLink = ({
    id,
    platform,
    url,
  }: {
    id: string;
    url: string;
    platform: SocialPlatform;
  }) => {
    setLinkToEdit({ id, url, platform })
    setEditLinkDialogOpen(true)
  }
  return (
    <div className="w-full max-w-sm px-2 flex flex-col items-center justify-center mb-6">
      <Card className="bg-white social-links-manager w-full mt-4 shadow-xl dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium dark:text-white">
            Social Link Manager
          </CardTitle>
          <CardDescription className="text-left leading-snug">
            Add and manage your social media <br /> links in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-3">
          {links.length > 0 ? (
            <div className="">
              {links.map((link) => (
                <SocialLink
                  key={link.id}
                  id={link.id}
                  platform={link.platform as SocialPlatform}
                  url={link.url}
                  // onDelete={() => handleDeleteLink(link.id)}
                  onEdit={handleEditLink}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground animate-fade-in">
              <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <h2 className="tracking-tighter text-lg font-medium leading-tight">
                No social links added yet.
              </h2>
              <p className="text-sm mt-2 opacity-80">
                Add your first social media link below.
              </p>
            </div>
          )}
          <CardFooter className="px-3">
            <Button
              className="w-full"
              variant={'outline'}
              onClick={() => setSocialLinksDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Social Link
            </Button>
          </CardFooter>
        </CardContent>
      </Card>{' '}
      <SocialLinksDialog
        onAdd={(platform, url) => addSocialLinkMutation({ platform, url })}
        existingPlatforms={existingPlatforms}
      />
      {linkToEdit && (
        <EditSocialLink
          open={editLinkDialogOpen}
          onOpenChange={setEditLinkDialogOpen}
          url={linkToEdit.url}
          platform={linkToEdit.platform}
          id={linkToEdit.id}
        />
      )}
    </div>
  )
}

export default SocialLinksManager

interface SocialLinkProps {
  id: string;
  platform: string;
  url: string;
  onEdit: (link: { id: string; url: string; platform: SocialPlatform }) => void;
}

const SocialLink: React.FC<SocialLinkProps> = ({
  platform,
  url,
  id,
  onEdit,
}) => {
  const { mutate: deleteSocialLinkMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: ({ id }: { id: string }) => removeSocialLink(id),
      onSuccess: () => {
        toast.success('Social link Deleted')
        queryClient.invalidateQueries({ queryKey: ['get-social-links'] })
      },
      onError: (error) => {
        toast.error(error?.message)
      },
    })

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 rounded-lg mb-2'
        // getBgColor()
      )}
    >
      <div className="flex items-center justify-start space-x-2">
        {/* <div className={cn("opacity-80 mr-3")}> */}
        <Image
          src={`/${getIcon(platform as SocialPlatform)}`}
          className="aspect-square size-6 mr-3"
          alt={platform}
          width={20}
          height={20}
        />{' '}
        {/* </div> */}
        <div className="flex flex-col w-full">
          <h3 className={cn('font-medium leading-none tracking-tight')}>
            {capitalizeFirstLetter(platform)}
          </h3>
          <NextLink
            href={url}
            target="_blank"
            className="text-sm opacity-70 truncate w-full leading-tight hover:underline"
          >
            {cleanUrl(url?.substring(0, 30))}
          </NextLink>
        </div>
      </div>
      <div className="flex ml-2 space-x-2">
        <Button
          size="icon"
          variant={'ghost'}
          className=""
          onClick={() => onEdit({ id, url, platform: platform as any })}
        >
          <Edit2 className="size-4 opacity-80" />
        </Button>
        <Button
          size="icon"
          variant={'ghost'}
          className=""
          onClick={() => deleteSocialLinkMutation({ id: id })}
        >
          {isDeleting ? (
            <Loader className="opacity-80 size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4 opacity-80" />
          )}
        </Button>
      </div>
    </div>
  )
}

// export default SocialLink;
