import { useState } from "react"
import { supabase } from "./supabase"

const C = {
  bg: "#050810", card: "#0A1020", blue: "#00A8FF",
  cyan: "#00E5FF", text: "#E8F0FF", muted: "#5A7099",
  border: "#1A2540", red: "#FF3B5C", green: "#00FF94"
}

const GAMES = ["FIFA", "PUBG Mobile", "Call of Duty", "Valorant", "Tekken 8", "eFootball"]
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Ethiopia", "Tanzania", "Senegal", "Other"]

export default function Auth() {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [game, setGame] = useState("FIFA")
  const [country, setCountry] = useState("Nigeria")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email || !password) { setError("Email and password required"); return }
    setLoading(true); setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleSignup = async () => {
    if (!email || !password || !username.trim()) {
      setError("All fields are required"); return
    }
    setLoading(true); setError("")

    // Step 1: Create auth account
    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }

    const userId = data?.user?.id
    if (!userId) { setError("Signup failed — try again."); setLoading(false); return }

    // Step 2: Save profile immediately using the user id
    const { error: profileError } = await supabase.from("players").upsert({
      id: userId,
      username: username.trim(),
      game,
      country,
      wins: 0,
      losses: 0,
      rating: 1000,
    }, { onConflict: "id" })

    if (profileError) {
      setError("Profile error: " + profileError.message)
      setLoading(false); return
    }

    // Step 3: Auto login
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError("Account + profile created! Please login.")
      setLoading(false)
    }
    // App.jsx onAuthStateChange handles navigation to Dashboard
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 360 }}>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.text, letterSpacing: 4 }}>
            WAVE<span style={{ color: C.cyan }}>ARENA</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: 1 }}>AFRICA'S #1 ESPORTS PLATFORM</div>
        </div>

        <div style={{ display: "flex", background: "#0D1628", borderRadius: 8, padding: 4, marginBottom: 20 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError("") }} style={{
              flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
              background: mode === m ? C.blue : "transparent",
              color: mode === m ? "#050810" : C.muted,
              fontWeight: mode === m ? 700 : 400,
              fontSize: 12, letterSpacing: 1, textTransform: "uppercase"
            }}>{m === "login" ? "Login" : "Sign Up"}</button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, letterSpacing: 1 }}>EMAIL</div>
        <input type="email" placeholder="your@email.com" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, letterSpacing: 1 }}>PASSWORD</div>
        <input type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />

        {mode === "signup" && (
          <>
            <div style={{ height: 1, background: C.border, margin: "4px 0 14px" }} />

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, letterSpacing: 1 }}>USERNAME</div>
            <input placeholder="e.g. WaveRider07" value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, letterSpacing: 1 }}>YOUR GAME</div>
            <select value={game} onChange={e => setGame(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 12, outline: "none", boxSizing: "border-box" }}>
              {GAMES.map(g => <option key={g}>{g}</option>)}
            </select>

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, letterSpacing: 1 }}>COUNTRY</div>
            <select value={country} onChange={e => setCountry(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 12, outline: "none", boxSizing: "border-box" }}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </>
        )}

        {error && (
          <div style={{ color: C.red, fontSize: 12, marginBottom: 12, textAlign: "center", padding: 8, background: `${C.red}11`, borderRadius: 6 }}>
            {error}
          </div>
        )}

        <button onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}
          style={{
            width: "100%", padding: "13px 0",
            background: loading ? C.muted : C.blue,
            border: "none", borderRadius: 8, color: "#050810",
            fontWeight: 900, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer", letterSpacing: 1
          }}>
          {loading ? "Please wait..." : mode === "login" ? "LOGIN →" : "JOIN THE ARENA →"}
        </button>
      </div>
    </div>
  )
}