import { useProfileStore } from '@/store/profileStore'

/** Perfil vinculado ao login atual (ou undefined se o login ainda não foi vinculado) e se ele é admin. */
export function useMyProfile() {
  const profiles = useProfileStore((state) => state.profiles)
  const myProfileId = useProfileStore((state) => state.myProfileId)
  const isAdmin = useProfileStore((state) => state.isAdmin)

  return {
    myProfile: profiles.find((profile) => profile.id === myProfileId),
    myProfileId,
    isAdmin,
  }
}
