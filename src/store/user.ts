import { createSignal } from "solid-js"
import {
  User,
  UserMethods,
  getUserPermissionIndex,
  UserPermission,
} from "~/types"

export type Me = User & { otp: boolean }
const [me, setMe] = createSignal<Me>({} as Me)

export const userCan = (p: UserPermission) => {
  const u = me()
  if (UserMethods.is_guest(u)) return false
  return UserMethods.can(u, getUserPermissionIndex(p))
}

export { me, setMe }
