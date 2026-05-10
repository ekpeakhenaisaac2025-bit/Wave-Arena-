import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Auth from "./Auth"
import Dashboard from "./Dashboard"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#050810",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#00E5FF", letterSpacing: 3 }}>
        WAVE<span style={{ color: "#E8F0FF" }}>ARENA</span>
      </div>
      <div style={{ fontSize: 12, color: "#5A7099", marginTop: 12 }}>Loading...</div>
    </div>
  )

  if (!user) return <Auth />

 return (
  <Dashboard
    user={user}
    onSignOut={() => supabase.auth.signOut()}
  />
)
}