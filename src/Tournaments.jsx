import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const C = {
  bg:"#050810", card:"#0A1020", blue:"#00A8FF",
  cyan:"#00E5FF", gold:"#FFD700", red:"#FF3B5C",
  green:"#00FF88", text:"#E8F0FF", muted:"#5A7099",
  border:"#1A2540"
}

const GAMES = ["FIFA","PUBG Mobile","Call of Duty","Valorant","Tekken 8"]
const COUNTRIES = ["Nigeria","Ghana","Kenya","South Africa","Egypt","All Africa"]

export default function Tournaments({ user }) {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name:"", game:"FIFA", country:"Nigeria",
    prize:"", max_teams:16, entry_fee:0
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => { fetchTournaments() }, [])

  const fetchTournaments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false })
    setTournaments(data || [])
    setLoading(false)
  }

  const createTournament = async () => {
    if (!form.name.trim()) { setMessage("Tournament name is required"); return }
    if (!form.prize.trim()) { setMessage("Prize is required"); return }
    setSaving(true)
    const { error } = await supabase.from("tournaments").insert({
      ...form,
      created_by: user.id,
      status: "open"
    })
    if (error) setMessage(error.message)
    else {
      setMessage("Tournament created!")
      setShowCreate(false)
      setForm({ name:"", game:"FIFA", country:"Nigeria", prize:"", max_teams:16, entry_fee:0 })
      fetchTournaments()
    }
    setSaving(false)
  }

  const registerTeam = async (tournament) => {
    const { error } = await supabase
      .from("tournaments")
      .update({ registered_teams: tournament.registered_teams + 1 })
      .eq("id", tournament.id)
    if (!error) fetchTournaments()
  }

  const inputStyle = {
    width:"100%", padding:"10px 14px",
    background:"#0D1628", border:`1px solid ${C.border}`,
    borderRadius:8, color:C.text, fontSize:13,
    marginBottom:12, outline:"none", boxSizing:"border-box"
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontWeight:900, fontSize:28, color:C.text, letterSpacing:2 }}>TOURNAMENTS</div>
          <div style={{ color:C.muted, fontSize:13 }}>Compete and win prizes across Africa</div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{ padding:"10px 20px", background:C.blue, border:"none", borderRadius:8, color:"#050810", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          + HOST
        </button>
      </div>

      {showCreate && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:24 }}>
          <div style={{ fontWeight:700, color:C.text, fontSize:16, marginBottom:16 }}>CREATE TOURNAMENT</div>
          <input placeholder="Tournament Name" value={form.name}
            onChange={e => setForm({...form, name:e.target.value})} style={inputStyle} />
          <select value={form.game} onChange={e => setForm({...form, game:e.target.value})} style={inputStyle}>
            {GAMES.map(g => <option key={g}>{g}</option>)}
          </select>
          <select value={form.country} onChange={e => setForm({...form, country:e.target.value})} style={inputStyle}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Prize (e.g. $500)" value={form.prize}
            onChange={e => setForm({...form, prize:e.target.value})} style={inputStyle} />
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>MAX TEAMS</div>
              <input type="number" value={form.max_teams}
                onChange={e => setForm({...form, max_teams:parseInt(e.target.value)})} style={inputStyle} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>ENTRY FEE ($)</div>
              <input type="number" value={form.entry_fee}
                onChange={e => setForm({...form, entry_fee:parseInt(e.target.value)})} style={inputStyle} />
            </div>
          </div>
          {message && (
            <div style={{ color: message.includes("created") ? C.green : C.red, fontSize:12, marginBottom:12 }}>
              {message}
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={createTournament} disabled={saving}
              style={{ flex:1, padding:"11px 0", background:C.blue, border:"none", borderRadius:8, color:"#050810", fontWeight:700, cursor:"pointer" }}>
              {saving ? "Creating..." : "CREATE TOURNAMENT"}
            </button>
            <button onClick={() => setShowCreate(false)}
              style={{ flex:1, padding:"11px 0", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, cursor:"pointer" }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:"center", color:C.muted, padding:40 }}>Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <div style={{ textAlign:"center", color:C.muted, padding:40 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🏆</div>
          <div>No tournaments yet — be the first to host one!</div>
        </div>
      ) : (
        tournaments.map(t => (
          <div key={t.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:16, color:C.text }}>{t.name}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{t.country} · {t.game}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color: t.status === "live" ? C.red : C.green }}>
                {t.status === "live" ? "● LIVE" : "OPEN"}
              </span>
            </div>
            <div style={{ display:"flex", gap:20, marginBottom:12 }}>
              <div><div style={{ fontSize:10, color:C.muted }}>PRIZE</div><div style={{ fontSize:16, color:C.gold, fontWeight:700 }}>{t.prize}</div></div>
              <div><div style={{ fontSize:10, color:C.muted }}>TEAMS</div><div style={{ fontSize:14, color:C.text }}>{t.registered_teams}/{t.max_teams}</div></div>
              <div><div style={{ fontSize:10, color:C.muted }}>ENTRY</div><div style={{ fontSize:14, color:C.text }}>{t.entry_fee === 0 ? "FREE" : `$${t.entry_fee}`}</div></div>
            </div>
            <div style={{ height:4, background:C.border, borderRadius:2, marginBottom:12 }}>
              <div style={{ height:"100%", width:`${Math.round((t.registered_teams/t.max_teams)*100)}%`, background:C.blue, borderRadius:2 }} />
            </div>
            {t.registered_teams < t.max_teams && t.status === "open" && (
              <button onClick={() => registerTeam(t)}
                style={{ width:"100%", padding:"9px 0", background:`${C.blue}20`, border:`1px solid ${C.blue}50`, borderRadius:8, color:C.blue, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                REGISTER TEAM →
              </button>
            )}
            {t.registered_teams >= t.max_teams && (
              <div style={{ textAlign:"center", color:C.red, fontSize:12, fontWeight:700 }}>FULL</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}