'use client'

import PostForm from '../explore/post-form'
// import ExperienceDialog from './ExperienceDialog'
// import PostDialog from './PostDialog'
import SearchDialog from './SearchDialog'
import AuthDialog from './SignInDialog'
import { ProfileUpdateDialog } from './UpdateProfileDialog'
import { AIDialogPrompt } from './AIDialogPrompt'

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      <SearchDialog />
      <PostForm />
      <AuthDialog />
      <AIDialogPrompt />
      {/* <ExperienceDialog /> */}
      {/* <PostDialog /> */}
    </>
  )
}

export default Dialogs
