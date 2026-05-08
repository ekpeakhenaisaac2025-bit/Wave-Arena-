import MatchResult from "./MatchResult"
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

const NAV = ["HOME", "TOURNAMENTS", "MATCHES", "LEADERBOARD", "PROFILE"]

const PLAYERS = [
  { rank:1, name:"WaveRider07", country:"🇳🇬", rating:2450, tier:"DIAMOND II" },
  { rank:2, name:"ProStriker", country:"🇪🇬", rating:2310, tier:"DIAMOND II" },
  { rank:3, name:"KingOfPitch", country:"🇬🇭", rating:2190, tier:"PLATINUM I" },
  { rank:4, name:"ShadowX", country:"🇰🇪", rating:2050, tier:"PLATINUM I" },
  { rank:5, name:"DribbleGod", country:"🇿🇦", rating:1980, tier:"GOLD III" },
]

function Home({ setNav }) {
  return (
    <div style={{ padding:"0 4px" }}>
      <div style={{ background:"linear-gradient(135deg, #051020, #0A1628)", border:"1px solid #1A2540", borderRadius:16, padding:"32px 20px", textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:10, color:"#00A8FF", letterSpacing:3, marginBottom:10 }}>AFRICA'S #1 ESPORTS ECOSYSTEM</div>
        <div style={{ fontSize:48, fontWeight:900, color:"#E8F0FF", letterSpacing:4, lineHeight:1 }}>WAVE</div>
        <div style={{ fontSize:48, fontWeight:900, color:"#00E5FF", letterSpacing:4, lineHeight:1, marginBottom:10 }}>ARENA</div>
        <div style={{ color:"#5A7099", fontSize:13, marginBottom:20 }}>Where Legends Rise</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={()=>setNav("TOURNAMENTS")} style={{ padding:"12px 20px", background:"#00A8FF", border:"none", borderRadius:8, color:"#050810", fontWeight:700, fontSize:13, cursor:"pointer" }}>FIND TOURNAMENTS</button>
          <button onClick={()=>setNav("LEADERBOARD")} style={{ padding:"12px 20px", background:"transparent", border:"1px solid #1A2540", borderRadius:8, color:"#E8F0FF", fontWeight:700, fontSize:13, cursor:"pointer" }}>LEADERBOARD</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
        {[["👾","18,400+","Players"],["🛡️","1,200+","Teams"],["🏆","340+","Tournaments"],["💰","$280K+","Prize Pool"]].map(([icon,val,label])=>(
          <div key={label} style={{ background:"#0A1020", border:"1px solid #1A2540", borderRadius:10, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:20 }}>{icon}</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#00A8FF", marginTop:4 }}>{val}</div>
            <div style={{ fontSize:11, color:"#5A7099" }}>{label}</div>
          </div>
        ))}
      </div>

      <div onClick={()=>setNav("TOURNAMENTS")} style={{ background:"rgba(255,59,92,0.1)", border:"1px solid rgba(255,59,92,0.4)", borderRadius:10, padding:"14px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"#FF3B5C", flexShrink:0 }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, color:"#E8F0FF", fontSize:13 }}>LIVE: East Africa PUBG Open</div>
          <div style={{ fontSize:11, color:"#5A7099" }}>🇰🇪 Kenya · $2,500 Prize · 16 Teams</div>
        </div>
        <span style={{ color:"#FF3B5C", fontSize:12, fontWeight:700, flexShrink:0 }}>WATCH →</span>
      </div>
    </div>
  )
}

function Leaderboard() {
  return (
    <div style={{ padding:"0 4px" }}>
      <div style={{ fontWeight:900, fontSize:24, color:"#E8F0FF", letterSpacing:2, marginBottom:4 }}>LEADERBOARD</div>
      <div style={{ color:"#5A7099", fontSize:13, marginBottom:16 }}>Africa's top ranked players</div>
      <div style={{ background:"#0A1020", border:"1px solid #1A2540", borderRadius:12, overflow:"hidden" }}>
        {PLAYERS.map((p,i)=>(
          <div key={p.rank} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderBottom: i<4 ? "1px solid #1A2540" : "none" }}>
            <div style={{ fontWeight:900, fontSize:16, color: i<3 ? "#FFD700" : "#5A7099", width:22, flexShrink:0 }}>#{p.rank}</div>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(0,168,255,0.2)", border:"2px solid rgba(0,168,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🎮</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, color:"#E8F0FF", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.country} {p.name}</div>
              <div style={{ fontSize:11, color:"#5A7099" }}>{p.tier}</div>
            </div>
            <div style={{ fontWeight:700, fontSize:14, color: i===0 ? "#FFD700" : "#E8F0FF", flexShrink:0 }}>{p.rating} {i===0 && "👑"}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Profile({ user }) {
  return (
    <div style={{ padding:"0 4px" }}>
      <div style={{ background:"linear-gradient(135deg, rgba(0,168,255,0.15), #0A1020)", border:"1px solid rgba(0,168,255,0.4)", borderRadius:16, padding:20, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(0,168,255,0.25)", border:"3px solid #00A8FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🎮</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:900, fontSize:16, color:"#E8F0FF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</div>
            <div style={{ color:"#00A8FF", fontSize:12 }}>Wave Arena Player</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[["0","Wins"],["0","Losses"],["1000","Rating"],["0%","Win Rate"]].map(([v,l])=>(
            <div key={l} style={{ textAlign:"center", background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"8px 4px" }}>
              <div style={{ fontWeight:900, fontSize:18, color:"#00E5FF" }}>{v}</div>
              <div style={{ fontSize:10, color:"#5A7099" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:"#0A1020", border:"1px solid #1A2540", borderRadius:12, padding:16 }}>
        <div style={{ fontWeight:700, color:"#E8F0FF", marginBottom:14, fontSize:14 }}>ACHIEVEMENTS</div>
        {[["🏆","Tournament Winner","Win your first tournament"],["⚡","5 Win Streak","Win 5 matches in a row"],["👑","Top 10 Africa","Reach top 10 leaderboard"]].map(([icon,title,desc])=>(
          <div key={title} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:"1px solid #1A2540", opacity:0.5 }}>
            <div style={{ width:34, height:34, borderRadius:8, background:"rgba(255,215,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{icon}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, color:"#E8F0FF", fontSize:13 }}>{title}</div>
              <div style={{ fontSize:11, color:"#5A7099" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [nav, setNav] = useState("HOME")
  const [session, setSession] = useState(null)
const [hasProfile, setHasProfile] = useState(false)
const [checkingProfile, setCheckingProfile] = useState(true)

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
    if (session) {
      supabase.from("players")
        .select("*")
        .eq("user_id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data) setHasProfile(true)
          setCheckingProfile(false)
        })
    } else {
      setCheckingProfile(false)
    }
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session)
  })
}, [])

if (checkingProfile) return (
  <div style={{ minHeight:"100vh", background:"#050810", display:"flex", alignItems:"center", justifyContent:"center", color:"#00A8FF", fontFamily:"sans-serif", fontSize:18 }}>
    Loading Wave Arena...
  </div>
)

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
  MATCHES: <MatchResult user={session.user} />,
  LEADERBOARD: <Leaderboard />,
  PROFILE: <Profile user={session.user} />
}

  return (
    <div style={{ minHeight:"100vh", background:"#050810", color:"#E8F0FF", fontFamily:"'Segoe UI', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ background:"#080D1A", borderBottom:"1px solid #1A2540", padding:"0 12px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", height:52 }}>
          <div style={{ fontWeight:900, fontSize:16, letterSpacing:2, marginRight:12, flexShrink:0 }}>
            WAVE<span style={{ color:"#00E5FF" }}>ARENA</span>
          </div>
          <div style={{ display:"flex", gap:0, flex:1, overflowX:"auto", scrollbarWidth:"none" }}>
            {NAV.map(item=>(
              <button key={item} onClick={()=>setNav(item)} style={{ padding:"6px 10px", background:"none", border:"none", borderBottom: nav===item ? "2px solid #00A8FF" : "2px solid transparent", color: nav===item ? "#00A8FF" : "#5A7099", fontWeight: nav===item ? 700 : 400, fontSize:11, cursor:"pointer", letterSpacing:0.5, whiteSpace:"nowrap", flexShrink:0 }}>
                {item}
              </button>
            ))}
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ padding:"5px 10px", background:"transparent", border:"1px solid #1A2540", borderRadius:6, color:"#5A7099", fontWeight:700, fontSize:11, cursor:"pointer", flexShrink:0, marginLeft:8 }}>
            OUT
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{ maxWidth:600, margin:"0 auto", padding:"16px 12px 80px" }}>
        {pages[nav]}
      </div>

      {/* Bottom Nav for Mobile */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#080D1A", borderTop:"1px solid #1A2540", display:"flex", justifyContent:"space-around", padding:"8px 0", zIndex:100 }}>
        {[["🏠","HOME"],["🏆","TOURNAMENTS"],["⚔️","MATCHES"],["📊","LEADERBOARD"],["👤","PROFILE"]].map(([icon,item])=>(
          <button key={item} onClick={()=>setNav(item)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", color: nav===item ? "#00A8FF" : "#5A7099", cursor:"pointer", padding:"4px 12px" }}>
            <span style={{ fontSize:18 }}>{icon}</span>
            <span style={{ fontSize:9, letterSpacing:0.5, fontWeight: nav===item ? 700 : 400 }}>{item}</span>
          </button>
        ))}
      </div>
    </div>
  )
}