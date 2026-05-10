import { useState } from "react"
import { supabase } from "./supabase"

const C = {
  bg: "#050810", card: "#0A1020", blue: "#00A8FF",
  cyan: "#00E5FF", text: "#E8F0FF", muted: "#5A7099",
  border: "#1A2540", red: "#FF3B5C"
}

const GAMES = ["FIFA", "PUBG Mobile", "Call of Duty", "Valorant", "Tekken 8", "eFootball"]
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Ethiopia", "Tanzania", "Senegal", "Other"]

export default function ProfileSetup({ user, onComplete }) {
  const [username, setUsername] = useState("")
  const [game, setGame] = useState("FIFA")
  const [country, setCountry] = useState("Nigeria")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!username.trim()) { setError("Username is required"); return }
    setLoading(true)
    setError("")

    const { error } = await supabase.from("players").upsert({
      id: user.id,
      username: username.trim(),
      game,
      country,
      wins: 0,
      losses: 0,
      rating: 1000,
    }, { onConflict: "id" })

    if (error) {
      setError(error.message)
    } else {
      onComplete()
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: "100%", maxWidth: 340 }}>
        
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: 3 }}>
            WAVE<span style={{ color: C.cyan }}>ARENA</span>
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Set up your player profile</div>
        </div>

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>USERNAME</div>
        <input
          placeholder="e.g. WaveRider07" value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 16, outline: "none", boxSizing: "border-box" }}
        />

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>YOUR GAME</div>
        <select value={game} onChange={e => setGame(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 16, outline: "none", boxSizing: "border-box" }}>
          {GAMES.map(g => <option key={g}>{g}</option>)}
        </select>

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>COUNTRY</div>
        <select value={country} onChange={e => setCountry(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 20, outline: "none", boxSizing: "border-box" }}>
          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select>

        {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</div>}

        <button onClick={handleSave} disabled={loading} style={{
          width: "100%", padding: "13px 0", background: C.blue, border: "none",
          borderRadius: 8, color: "#050810", fontWeight: 900, fontSize: 14,
          cursor: loading ? "not-allowed" : "pointer", letterSpacing: 1
        }}>
          {loading ? "Saving..." : "ENTER THE ARENA →"}
        </button>
      </div>
    </div>
  )
}