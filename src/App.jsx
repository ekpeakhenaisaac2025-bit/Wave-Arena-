import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Auth from "./Auth"
import ProfileSetup from "./ProfileSetup"
import Tournaments from "./Tournaments"

const C = {
  bg: "#050810", card: "#0A1020", blue: "#00A8FF",
  cyan: "#00E5FF", gold: "#FFD700", red: "#FF3B5C",
  text: "#E8F0FF", muted: "#5A7099", border: "#1A2540",
  green: "#00FF88",
}

const NAV = ["HOME", "TOURNAMENTS", "LEADERBOARD", "PROFILE"]

const PLAYERS = [
  { rank:1, name:"WaveRider07", country:"🇳🇬", rating:2450, tier:"DIAMOND II" },
  { rank:2, name:"ProStriker", country:"🇪🇬", rating:2310, tier:"DIAMOND II" },
  { rank:3, name:"KingOfPitch", country:"🇬🇭", rating:2190, tier:"PLATINUM I" },
  { rank:4, name:"ShadowX", country:"🇰🇪", rating:2050, tier:"PLATINUM I" },
  { rank:5, name:"DribbleGod", country:"🇿🇦", rating:1980, tier:"GOLD III" },
]

function Home({ setNav }) {
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg, #051020, #0A1628)", border:"1px solid #1A2540", borderRadius:16, padding:"40px 24px", textAlign:"center", marginBottom:20 }}>
        <div style={{ fontSize:11, color:"#00A8FF", letterSpacing:3, marginBottom:12 }}>AFRICA'S #1 ESPORTS ECOSYSTEM</div>
        <div style={{ fontSize:52, fontWeight:900, color:"#E8F0FF", letterSpacing:4, lineHeight:1 }}>WAVE</div>
        <div style={{ fontSize:52, fontWeight:900, color:"#00E5FF", letterSpacing:4, lineHeight:1, marginBottom:12 }}>ARENA</div>
        <div style={{ color:"#5A7099", fontSize:14, marginBottom:24 }}>Where Legends Rise</div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={()=>setNav("TOURNAMENTS")} style={{ padding:"12px 24px", background:"#00A8FF", border:"none", borderRadius:8, color:"#050810", fontWeight:700, fontSize:13, cursor:"pointer" }}>FIND TOURNAMENTS</button>
          <button onClick={()=>setNav("LEADERBOARD")} style={{ padding:"12px 24px", background:"transparent", border:"1px solid #1A2540", borderRadius:8, color:"#E8F0FF", fontWeight:700, fontSize:13, cursor:"pointer" }}>LEADERBOARD</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:20 }}>
        {[["👾","18,400+","Players"],["🛡️","1,200+","Teams"],["🏆","340+","Tournaments"],["💰","$280K+","Prize Pool"]].map(([icon,val,label])=>(
          <div key={label} style={{ background:"#0A1020", border:"1px solid #1A2540", borderRadius:10, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:22 }}>{icon}</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#00A8FF", marginTop:4 }}>{val}</div>
            <div style={{ fontSize:11, color:"#5A7099" }}>{label}</div>
          </div>
        ))}
      </div>
      <div onClick={()=>setNav("TOURNAMENTS")} style={{ background:"rgba(255,59,92,0.1)", border:"1px solid rgba(255,59,92,0.4)", borderRadius:10, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"#FF3B5C" }} />
        <div>
          <div style={{ fontWeight:700, color:"#E8F0FF", fontSize:14 }}>LIVE: East Africa PUBG Open</div>
          <div style={{ fontSize:12, color:"#5A7099" }}>🇰🇪 Kenya · $2,500 Prize · 16 Teams</div>
        </div>
        <span style={{ marginLeft:"auto", color:"#FF3B5C", fontSize:12, fontWeight:700 }}>WATCH →</span>
      </div>
    </div>
  )
}

function Leaderboard() {
  return (
    <div>
      <div style={{ fontWeight:900, fontSize:28, color:"#E8F0FF", letterSpacing:2, marginBottom:4 }}>LEADERBOARD</div>
      <div style={{ color:"#5A7099", fontSize:13, marginBottom:20 }}>Africa's top ranked players</div>
      <div style={{ background:"#0A1020", border:"1px solid #1A2540", borderRadius:12, overflow:"hidden" }}>
        {PLAYERS.map((p,i)=>(
          <div key={p.rank} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderBottom: i<4 ? "1px solid #1A2540" : "none" }}>
            <div style={{ fontWeight:900, fontSize:18, color: i<3 ? "#FFD700" : "#5A7099", width:24 }}>#{p.rank}</div>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(0,168,255,0.2)", border:"2px solid rgba(0,168,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎮</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:"#E8F0FF", fontSize:14 }}>{p.country} {p.name}</div>
              <div style={{ fontSize:11, color:"#5A7099" }}>{p.tier}</div>
            </div>
            <div style={{ fontWeight:700, fontSize:16, color: i===0 ? "#FFD700" : "#E8F0FF" }}>{p.rating} {i===0 && "👑"}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Profile({ user }) {
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg, rgba(0,168,255,0.15), #0A1020)", border:"1px solid rgba(0,168,255,0.4)", borderRadius:16, padding:24, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(0,168,255,0.25)", border:"3px solid #00A8FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🎮</div>
          <div>
            <div style={{ fontWeight:900, fontSize:22, color:"#E8F0FF" }}>{user?.email}</div>
            <div style={{ color:"#00A8FF", fontSize:12 }}>Wave Arena Player</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:24, marginTop:16 }}>
          {[["0","Wins"],["0","Losses"],["1000","Rating"],["0%","Win Rate"]].map(([v,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontWeight:900, fontSize:20, color:"#00E5FF" }}>{v}</div>
              <div style={{ fontSize:11, color:"#5A7099" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [nav, setNav] = useState("HOME")
  const [session, setSession] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session) return <Auth />
  if (!hasProfile) return <ProfileSetup user={session.user} onComplete={() => setHasProfile(true)} />

  const pages = {
    HOME: <Home setNav={setNav} />,
    TOURNAMENTS: <Tournaments user={session.user} />,
    LEADERBOARD: <Leaderboard />,
    PROFILE: <Profile user={session.user} />
  }

  return (
    <div style={{ minHeight:"100vh", background:"#050810", color:"#E8F0FF", fontFamily:"'Segoe UI', sans-serif" }}>
      <nav style={{ background:"#080D1A", borderBottom:"1px solid #1A2540", padding:"0 20px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", height:56 }}>
          <div style={{ fontWeight:900, fontSize:20, letterSpacing:3, marginRight:32 }}>
            WAVE<span style={{ color:"#00E5FF" }}>ARENA</span>
          </div>
          <div style={{ display:"flex", gap:4, flex:1 }}>
            {NAV.map(item=>(
              <button key={item} onClick={()=>setNav(item)} style={{ padding:"6px 14px", background:"none", border:"none", borderBottom: nav===item ? "2px solid #00A8FF" : "2px solid transparent", color: nav===item ? "#00A8FF" : "#5A7099", fontWeight: nav===item ? 700 : 400, fontSize:12, cursor:"pointer", letterSpacing:1 }}>
                {item}
              </button>
            ))}
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ padding:"7px 16px", background:"transparent", border:"1px solid #1A2540", borderRadius:6, color:"#5A7099", fontWeight:700, fontSize:12, cursor:"pointer" }}>
            LOGOUT
          </button>
        </div>
      </nav>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 60px" }}>
        {pages[nav]}
      </div>
      <div style={{ borderTop:"1px solid #1A2540", padding:"16px 24px", textAlign:"center" }}>
        <span style={{ fontWeight:900, letterSpacing:3 }}>WAVE<span style={{ color:"#00E5FF" }}>ARENA</span></span>
        <span style={{ color:"#5A7099", fontSize:11, marginLeft:16 }}>AFRICA'S ESPORTS ECOSYSTEM · 2025</span>
      </div>
    </div>
  )
}