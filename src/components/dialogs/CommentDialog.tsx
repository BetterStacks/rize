'use client'
import React from 'react'
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog'
import { useSearchDialog } from '../dialog-provider'
import { Input } from '../ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import axios from 'axios'
import { TProfile } from '@/lib/types'
import { Loader } from 'lucide-react'

type ProfileItemProps = Pick<
  TProfile,
  'username' | 'displayName' | 'profileImage'
> & { image?: string; name?: string };

const CommentDialog = () => {
  const [open, setOpen] = useSearchDialog()
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<ProfileItemProps[]>([])
  const [loading, setLoading] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const handleSearch = useDebouncedCallback(async (query: string) => {
    if (query.trim() === '') {
      // setResults([]);
      setLoading(false)
      setHasSearched(false)
      return
    }
    setLoading(true)
    setHasSearched(true)
    const res = await axios.get('/api/search', {
      params: { query },
    })
    setLoading(false)
    setResults([...(res?.data as ProfileItemProps[])])
  }, 300)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:rounded-2xl dark:bg-dark-bg bg-white  max-w-xl w-full">
        <DialogHeader>
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              handleSearch(e.target.value)
            }}
          />
        </DialogHeader>
        <div className="flex flex-col gap-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin h-4 w-4" />
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="text-center py-4">No results found</div>
          ) : (
            results.map((profile) => (
              <div
                key={profile.username}
                className="flex items-center gap-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {profile.profileImage && (
                  <img
                    src={profile.profileImage}
                    alt={`${profile.displayName}`}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{profile.displayName}</h3>
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog
