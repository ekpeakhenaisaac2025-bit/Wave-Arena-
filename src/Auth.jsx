import { useState } from "react"
import { supabase } from "./supabase"

const C = {
  bg: "#050810", card: "#0A1020",
  blue: "#00A8FF", cyan: "#00E5FF",
  text: "#E8F0FF", muted: "#5A7099",
  border: "#1A2540", red: "#FF3B5C"
}

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleAuth = async () => {
    setLoading(true)
    setMessage("")

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email, password
      })
      if (error) setMessage(error.message)
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username } }
      })
      if (error) setMessage(error.message)
      else setMessage("Check your email to confirm!")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32, width:320 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:3 }}>
            WAVE<span style={{ color:C.cyan }}>ARENA</span>
          </div>
          <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>
            {isLogin ? "Welcome back" : "Join the arena"}
          </div>
        </div>

        {!isLogin && (
          <input
            placeholder="Prayer ID"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width:"100%", padding:"10px 14px", background:"#0D1628", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, marginBottom:12, outline:"none", boxSizing:"border-box" }}
          />
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", padding:"10px 14px", background:"#0D1628", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, marginBottom:12, outline:"none", boxSizing:"border-box" }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width:"100%", padding:"10px 14px", background:"#0D1628", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, marginBottom:16, outline:"none", boxSizing:"border-box" }}
        />

        {message && (
          <div style={{ color: message.includes("Check") ? C.blue : C.red, fontSize:12, marginBottom:12, textAlign:"center" }}>
            {message}
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{ width:"100%", padding:"12px 0", background:C.blue, border:"none", borderRadius:8, color:"#050810", fontWeight:700, fontSize:14, cursor:"pointer", marginBottom:12 }}
        >
          {loading ? "Loading..." : isLogin ? "LOGIN" : "CREATE ACCOUNT"}
        </button>

        <div style={{ textAlign:"center", color:C.muted, fontSize:12 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color:C.blue, cursor:"pointer", fontWeight:700 }}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </div>
      </div>
    </div>
  )
}