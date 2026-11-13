/**
 * The profile page is server-rendered and seeds React Query with what it
 * loaded, so section queries don't need to refetch the moment they mount.
 * Mutations still invalidate their keys, which refetches straight away.
 */
export const PROFILE_STALE_TIME = 60_000;
