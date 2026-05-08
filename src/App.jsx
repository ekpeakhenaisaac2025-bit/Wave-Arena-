import Dashboard from "./Dashboard"
import MatchResult from "./MatchResult"
import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Auth from "./Auth"
import ProfileSetup from "./ProfileSetup"
import Tournaments from "./Tournaments"

export default function App() {
  const [session, setSession] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const { data } = await supabase
          .from('players')
          .select('id')
          .eq('id', session.user.id)
          .single()
        setHasProfile(!!data)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          const { data } = await supabase
            .from('players')
            .select('id')
            .eq('id', session.user.id)
            .single()
          setHasProfile(!!data)
        } else {
          setHasProfile(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#050810", display:"flex", alignItems:"center", justifyContent:"center", color:"#00E5FF", fontSize:18, fontWeight:700 }}>
      LOADING...
    </div>
  )

  if (!session) return <Auth />

  if (!hasProfile) return (
    <ProfileSetup
      user={session.user}
      onComplete={() => setHasProfile(true)}
    />
  )

  return (
    <Dashboard
      user={session.user}
      profile={session.user}
      onSignOut={() => supabase.auth.signOut()}
    />
  )
}