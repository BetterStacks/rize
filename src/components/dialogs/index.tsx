'use client'

import PostDrawer from '../posts/PostDrawer'
// import ExperienceDialog from './ExperienceDialog'
// import PostDialog from './PostDialog'
import SearchDialog from './SearchDialog'
import AuthDialog from './SignInDialog'
import { ProfileUpdateDialog } from './UpdateProfileDialog'

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      <SearchDialog />
      <PostDrawer />
      <AuthDialog />
    </>
  )
}

export default Dialogs
