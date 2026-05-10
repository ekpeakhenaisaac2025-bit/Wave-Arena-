import Dashboard from "./Dashboard"
import { useState, useEffect } from "react"
import Auth from "./Auth"
import ProfileSetup from "./ProfileSetup"

export default function App() {
  const [session, setSession] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      setSession(session)
      if (session?.user) {
        const { dgiyata } = await supabase
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
    <div style={{ minHeight:"100vh", background:"#050810", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#00E5FF", fontSize:18, fontWeight:700 }}>
      <div>LOADING...</div>
      <div style={{ fontSize:12, color:"#5A7099", marginTop:12 }}>Connecting to server...</div>
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