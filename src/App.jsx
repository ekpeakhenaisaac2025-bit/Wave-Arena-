import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Auth from "./Auth"
import ProfileSetup from "./ProfileSetup"
import Dashboard from "./Dashboard"

export default function App() {
  const [session, setSession] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from("players")
        .select("id")
        .eq("id", userId)
        .maybeSingle()
      setHasProfile(!!data)
    } catch (e) {
      setHasProfile(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 10000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      setSession(session)
      if (session?.user) await checkProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) await checkProfile(session.user.id)
        else setHasProfile(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#00E5FF", letterSpacing: 3 }}>WAVE<span style={{ color: "#E8F0FF" }}>ARENA</span></div>
      <div style={{ fontSize: 12, color: "#5A7099", marginTop: 12 }}>Loading...</div>
    </div>
  )

  if (!session) return <Auth />

  if (!hasProfile) return (
    <ProfileSetup user={session.user} onComplete={() => setHasProfile(true)} />
  )

  return (
    <Dashboard
      user={session.user}
      profile={session.user}
      onSignOut={() => supabase.auth.signOut()}
    />
  )
}