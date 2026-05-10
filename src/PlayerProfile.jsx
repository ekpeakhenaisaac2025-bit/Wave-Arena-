import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const C = {
  bg:"#050810", card:"#0A1020", card2:"#0D1628",
  blue:"#00A8FF", cyan:"#00E5FF", green:"#00FF94",
  red:"#FF3B5C", yellow:"#FFD700",
  text:"#E8F0FF", muted:"#5A7099", border:"#1A2540",
}

function getTier(r){
  if(r<1200) return {name:"BRONZE",color:"#CD7F32",icon:"🥉"}
  if(r<1400) return {name:"SILVER",color:"#C0C0C0",icon:"🥈"}
  if(r<1600) return {name:"GOLD",color:"#FFD700",icon:"🥇"}
  if(r<1800) return {name:"PLATINUM",color:"#00E5FF",icon:"💎"}
  if(r<2000) return {name:"DIAMOND",color:"#9B59B6",icon:"👑"}
  return {name:"LEGEND",color:"#FF3B5C",icon:"⚡"}
}

export default function PlayerProfile({user}){
  const [profile, setProfile] = useState(null)
  const [players, setPlayers] = useState([])
  const [tab, setTab] = useState("my")
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState("")
  const [game, setGame] = useState("FIFA")
  const [country, setCountry] = useState("Nigeria")

  const GAMES = ["FIFA","PUBG Mobile","Call of Duty","Valorant","Tekken 8","eFootball"]
  const COUNTRIES = ["Nigeria","Ghana","Kenya","South Africa","Egypt","Ethiopia","Tanzania","Senegal","Other"]

  useEffect(()=>{
    loadProfile()
    loadPlayers()
  },[])

  const loadProfile = async()=>{
    const {data} = await supabase.from("players").select("*").eq("id", user.id).maybeSingle()
    if(data){
      setProfile(data)
      setUsername(data.username||"")
      setGame(data.game||"FIFA")
      setCountry(data.country||"Nigeria")
    }
    setLoading(false)
  }

  const loadPlayers = async()=>{
    const {data} = await supabase.from("players").select("*").order("rating",{ascending:false})
    if(data) setPlayers(data)
  }

  const saveProfile = async()=>{
    const {error} = await supabase.from("players").update({username,game,country}).eq("id",user.id)
    if(!error){
      setProfile(p=>({...p,username,game,country}))
      setEditing(false)
    }
  }

  const filtered = players.filter(p=>
    p.username?.toLowerCase().includes(search.toLowerCase())||
    p.game?.toLowerCase().includes(search.toLowerCase())||
    p.country?.toLowerCase().includes(search.toLowerCase())
  )

  if(loading) return(
    <div style={{padding:40,textAlign:"center",color:C.muted}}>Loading profile...</div>
  )

  const showPlayer = selected || profile
  const tier = getTier(showPlayer?.rating||1000)

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"monospace",paddingBottom:80}}>

      {/* HEADER */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"16px 20px"}}>
        <div style={{fontSize:10,color:C.muted,letterSpacing:3}}>WAVE ARENA</div>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:2}}>PLAYER <span style={{color:C.cyan}}>PROFILES</span></div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:C.card,borderBottom:`1px solid ${C.border}`}}>
        {[["my","MY PROFILE"],["find","FIND PLAYERS"]].map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);setSelected(null)}} style={{
            flex:1,padding:"12px 0",background:"transparent",border:"none",
            borderBottom:tab===id?`2px solid ${C.cyan}`:"2px solid transparent",
            color:tab===id?C.text:C.muted,fontWeight:tab===id?700:400,
            fontSize:11,cursor:"pointer",letterSpacing:1
          }}>{label}</button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:480,margin:"0 auto"}}>

        {/* MY PROFILE */}
        {tab==="my" && profile && (
          <div>
            {/* Profile Card */}
            <div style={{background:`linear-gradient(135deg,${tier.color}22,#050810)`,border:`1px solid ${tier.color}44`,borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:60,height:60,borderRadius:14,background:`${tier.color}33`,border:`3px solid ${tier.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🎮</div>
                  <div>
                    <div style={{fontSize:18,fontWeight:900}}>{profile.username}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{profile.game} · {profile.country}</div>
                    <div style={{fontSize:11,fontWeight:700,color:tier.color,marginTop:4}}>{tier.icon} {tier.name}</div>
                  </div>
                </div>
                <button onClick={()=>setEditing(true)} style={{background:`${C.blue}22`,border:`1px solid ${C.blue}44`,borderRadius:8,padding:"5px 12px",color:C.blue,fontSize:11,fontWeight:700,cursor:"pointer"}}>EDIT</button>
              </div>

              {/* Stats */}
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[["ELO",profile.rating||1000,tier.color],["WINS",profile.wins||0,C.green],["LOSSES",profile.losses||0,C.red],["WIN%",`${profile.wins&&profile.losses?Math.round(((profile.wins||0)/((profile.wins||0)+(profile.losses||0)))*100):0}%`,C.cyan]].map(([l,v,c])=>(
                  <div key={l} style={{flex:1,textAlign:"center",background:C.card2,borderRadius:8,padding:"10px 4px"}}>
                    <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Win bar */}
              <div style={{background:C.border,borderRadius:4,height:6,overflow:"hidden"}}>
                <div style={{width:`${profile.wins&&profile.losses?Math.round(((profile.wins||0)/((profile.wins||0)+(profile.losses||0)))*100):0}%`,height:"100%",background:`linear-gradient(90deg,${C.green},${C.cyan})`,borderRadius:4}}/>
              </div>
            </div>

            {/* Edit Form */}
            {editing && (
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:12,color:C.cyan}}>EDIT PROFILE</div>
                <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"
                  style={{width:"100%",padding:"10px 14px",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,marginBottom:10,outline:"none",boxSizing:"border-box"}}/>
                <select value={game} onChange={e=>setGame(e.target.value)}
                  style={{width:"100%",padding:"10px 14px",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,marginBottom:10,outline:"none",boxSizing:"border-box"}}>
                  {GAMES.map(g=><option key={g}>{g}</option>)}
                </select>
                <select value={country} onChange={e=>setCountry(e.target.value)}
                  style={{width:"100%",padding:"10px 14px",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,marginBottom:14,outline:"none",boxSizing:"border-box"}}>
                  {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setEditing(false)} style={{flex:1,padding:"10px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>CANCEL</button>
                  <button onClick={saveProfile} style={{flex:2,padding:"10px 0",background:C.blue,border:"none",borderRadius:8,color:"#050810",fontWeight:900,fontSize:12,cursor:"pointer"}}>SAVE CHANGES</button>
                </div>
              </div>
            )}

            {/* Achievements */}
            <div style={{fontSize:11,color:C.muted,letterSpacing:2,marginBottom:10}}>ACHIEVEMENTS</div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
              {[
                {icon:"🏆",title:"First Win",desc:"Win your first match",done:(profile.wins||0)>=1},
                {icon:"⚡",title:"5 Win Streak",desc:"Win 5 matches",done:(profile.wins||0)>=5},
                {icon:"💎",title:"Diamond Rank",desc:"Reach 1800 ELO",done:(profile.rating||0)>=1800},
                {icon:"👑",title:"Top 10",desc:"Reach top 10 leaderboard",done:(profile.rating||0)>=2000},
                {icon:"🔥",title:"100 Matches",desc:"Play 100 matches",done:((profile.wins||0)+(profile.losses||0))>=100},
              ].map((a,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderBottom:i<4?`1px solid ${C.border}`:"none",opacity:a.done?1:0.4}}>
                  <div style={{width:34,height:34,borderRadius:8,background:a.done?`${C.yellow}22`:C.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{a.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700}}>{a.title}</div>
                    <div style={{fontSize:11,color:C.muted}}>{a.desc}</div>
                  </div>
                  {a.done&&<span style={{color:C.green,fontWeight:700,fontSize:12}}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="my" && !profile && (
          <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
            <div style={{fontSize:32,marginBottom:12}}>👤</div>
            <div>Profile not found</div>
          </div>
        )}

        {/* FIND PLAYERS */}
        {tab==="find" && !selected && (
          <div>
            <input placeholder="Search username, game, country..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{width:"100%",padding:"11px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,marginBottom:14,outline:"none",boxSizing:"border-box"}}/>
            <div style={{fontSize:11,color:C.muted,letterSpacing:2,marginBottom:10}}>{filtered.length} PLAYERS</div>
            {filtered.map(p=>{
              const t=getTier(p.rating||1000)
              return(
                <div key={p.id} onClick={()=>setSelected(p)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${t.color}22`,border:`2px solid ${t.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎮</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700}}>{p.username}</div>
                    <div style={{fontSize:11,color:C.muted}}>{p.game} · {p.country}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:700,color:t.color}}>{p.rating}</div>
                    <div style={{fontSize:10,color:t.color,fontWeight:700}}>{t.name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* SELECTED PLAYER */}
        {tab==="find" && selected && (
          <div>
            <button onClick={()=>setSelected(null)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 14px",color:C.muted,fontSize:12,cursor:"pointer",marginBottom:16}}>← BACK</button>
            {(()=>{
              const t=getTier(selected.rating||1000)
              return(
                <div style={{background:`linear-gradient(135deg,${t.color}22,#050810)`,border:`1px solid ${t.color}44`,borderRadius:16,padding:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                    <div style={{width:60,height:60,borderRadius:14,background:`${t.color}33`,border:`3px solid ${t.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🎮</div>
                    <div>
                      <div style={{fontSize:18,fontWeight:900}}>{selected.username}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{selected.game} · {selected.country}</div>
                      <div style={{fontSize:11,fontWeight:700,color:t.color,marginTop:4}}>{t.icon} {t.name}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    {[["ELO",selected.rating||1000,t.color],["WINS",selected.wins||0,C.green],["LOSSES",selected.losses||0,C.red]].map(([l,v,c])=>(
                      <div key={l} style={{flex:1,textAlign:"center",background:C.card2,borderRadius:8,padding:"10px 4px"}}>
                        <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
                        <div style={{fontSize:9,color:C.muted,marginTop:2}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}