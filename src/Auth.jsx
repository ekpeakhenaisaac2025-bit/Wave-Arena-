import { useState } from "react"


const C = {
  bg: "#050810", card: "#0A1020", blue: "#00A8FF",
  cyan: "#00E5FF", text: "#E8F0FF", muted: "#5A7099",
  border: "#1A2540", red: "#FF3B5C"
}

export default function Auth() {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async () => {
    if (!email || !password) { setError("Email and password required"); return }
    setLoading(true); setError(""); setSuccess("")

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setSuccess("Account created! Check your email to verify, or login now.")
      }
    } catch (e) {
      setError("Connection failed. Check your internet.")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: "100%", maxWidth: 340 }}>
        
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.text, letterSpacing: 4 }}>
            WAVE<span style={{ color: C.cyan }}>ARENA</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Africa's #1 Esports Platform</div>
        </div>

        <div style={{ display: "flex", background: "#0D1628", borderRadius: 8, padding: 4, marginBottom: 20 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess("") }} style={{
              flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
              background: mode === m ? C.blue : "transparent",
              color: mode === m ? "#050810" : C.muted,
              fontWeight: mode === m ? 700 : 400, fontSize: 12,
              textTransform: "uppercase", letterSpacing: 1
            }}>{m === "login" ? "Login" : "Sign Up"}</button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>EMAIL</div>
        <input
          type="email" placeholder="your@email.com" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 14, outline: "none", boxSizing: "border-box" }}
        />

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>PASSWORD</div>
        <input
          type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", padding: "10px 14px", background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 20, outline: "none", boxSizing: "border-box" }}
        />

        {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</div>}
        {success && <div style={{ color: "#00FF94", fontSize: 12, marginBottom: 12, textAlign: "center" }}>{success}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "13px 0", background: C.blue, border: "none",
          borderRadius: 8, color: "#050810", fontWeight: 900, fontSize: 14,
          cursor: loading ? "not-allowed" : "pointer", letterSpacing: 1
        }}>
          {loading ? "Please wait..." : mode === "login" ? "LOGIN →" : "CREATE ACCOUNT →"}
        </button>
      </div>
    </div>
  )
}