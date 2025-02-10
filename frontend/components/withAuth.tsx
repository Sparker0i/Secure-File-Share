// components/withAuth.tsx
import { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { useRouter } from "next/router"

const withAuth = (WrappedComponent: any) => {
  return (props: any) => {
    const user = useSelector((state: RootState) => state.auth.user)
    const router = useRouter()

    useEffect(() => {
      if (!user) {
        router.replace("/login")
      }
    }, [user, router])

    if (!user) {
      return null // Or a loading spinner
    }
    return <WrappedComponent {...props} />
  }
}

export default withAuth

