import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const C = {
  bg: "#050810", card: "#0A1020", card2: "#0D1628",
  blue: "#00A8FF", cyan: "#00E5FF", green: "#00FF94",
  red: "#FF3B5C", yellow: "#FFD700", purple: "#9B59B6",
  text: "#E8F0FF", muted: "#5A7099", border: "#1A2540",
}

const TIER_COLORS = {
  "BRONZE": "#CD7F32",
  "SILVER": "#C0C0C0",
  "GOLD": C.yellow,
  "PLATINUM": "#00E5FF",
  "DIAMOND": "#9B59B6",
  "LEGEND": "#FF3B5C",
}

function getTier(rating) {
  if (rating < 1200) return "BRONZE"
  if (rating < 1400) return "SILVER"
  if (rating < 1600) return "GOLD"
  if (rating < 1800) return "PLATINUM"
  if (rating < 2000) return "DIAMOND"
  return "LEGEND"
}

function getTierIcon(tier) {
  const icons = { BRONZE: "🥉", SILVER: "🥈", GOLD: "🥇", PLATINUM: "💎", DIAMOND: "👑", LEGEND: "⚡" }
  return icons[tier] || "🎮"
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ textAlign: "center", background: C.card2, borderRadius: 10, padding: "12px 8px", flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: color || C.cyan }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 3, letterSpacing: 1 }}>{label}</div>
    </div>
  )
}

function ProfileCard({ player, isOwn, onEdit }) {
  const tier = getTier(player.rating || 1000)
  const tierColor = TIER_COLORS[tier]
  const wins = player.wins || 0
  const losses = player.losses || 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  return (
    <div>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${tierColor}22, #050810)`,
        border: `1px solid ${tierColor}44`,
        borderRadius: 16, padding: 20, marginBottom: 16, position: "relative"
      }}>
        {isOwn && (
          <button onClick={onEdit} style={{
            position: "absolute", top: 12, right: 12,
            background: `${C.blue}22`, border: `1px solid ${C.blue}44`,
            borderRadius: 8, padding: "5px 12px", color: C.blue,
            fontSize: 11, fontWeight: 700, cursor: "pointer"
          }}>EDIT</button>
        )}

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `${tierColor}33`,
            border: `3px solid ${tierColor}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, flexShrink: 0
          }}>
            🎮
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{player.username || "Player"}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{player.game} · {player.country}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 14 }}>{getTierIcon(tier)}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: tierColor, letterSpacing: 1 }}>{tier}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: 8 }}>
          <StatBox label="ELO" value={player.rating || 1000} color={tierColor} />
          <StatBox label="WINS" value={wins} color={C.green} />
          <StatBox label="LOSSES" value={losses} color={C.red} />
          <StatBox label="WIN %" value={`${winRate}%`} color={C.cyan} />
        </div>

        {/* Win Rate Bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: C.green }}>W {wins}</span>
            <span style={{ fontSize: 10, color: C.muted }}>WIN / LOSS</span>
            <span style={{ fontSize: 10, color: C.red }}>L {losses}</span>
          </div>
          <div style={{ background: C.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{
              width: `${winRate}%`, height: "100%",
              background: `linear-gradient(90deg, ${C.green}, ${C.cyan})`,
              borderRadius: 4
            }} />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>ACHIEVEMENTS</div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        {[
          { icon: "🏆", title: "Tournament Winner", desc: "Win your first tournament", unlocked: wins > 0 },
          { icon: "⚡", title: "5 Win Streak", desc: "Win 5 matches in a row", unlocked: wins >= 5 },
          { icon: "👑", title: "Top 10 Africa", desc: "Reach top 10 leaderboard", unlocked: (player.rating || 0) >= 2000 },
          { icon: "💎", title: "Diamond Rank", desc: "Reach Diamond tier", unlocked: (player.rating || 0) >= 1800 },
          { icon: "🔥", title: "100 Matches", desc: "Play 100 matches", unlocked: total >= 100 },
        ].map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
            opacity: a.unlocked ? 1 : 0.4
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: a.unlocked ? `${C.yellow}22` : C.card2,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
            }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.title}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{a.desc}</div>
            </div>
            {a.unlocked && <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function EditModal({ player, onSave, onClose }) {
  const [username, setUsername] = useState(player.username || "")
  const [game, setGame] = useState(player.game || "FIFA")
  const [country, setCountry] = useState(player.country || "Nigeria")
  const [saving, setSaving] = useState(false)

  const GAMES = ["FIFA", "PUBG Mobile", "Call of Duty", "Valorant", "Tekken 8", "eFootball"]
  const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Ethiopia", "Tanzania", "Senegal", "Other"]

  const handleSave = async () => {
    if (!username.trim()) return
    setSaving(true)
    const { error } = await supabase.from("players")
      .update({ username: username.trim(), game, country })
      .eq("id", player.id)
    if (!error) onSave({ ...player, username: username.trim(), game, country })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,16,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 340 }}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, letterSpacing: 2 }}>
          EDIT <span style={{ color: C.cyan }}>PROFILE</span>
        </div>

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>USERNAME</div>
        <input value={username} onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>GAME</div>
        <select value={game} onChange={e => setGame(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 14, outline: "none", boxSizing: "border-box" }}>
          {GAMES.map(g => <option key={g}>{g}</option>)}
        </select>

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>COUNTRY</div>
        <select value={country} onChange={e => setCountry(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 20, outline: "none", boxSizing: "border-box" }}>
          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "11px 0", background: C.blue, border: "none", borderRadius: 8, color: "#050810", fontWeight: 900, fontSize: 13, cursor: "pointer" }}>
            {saving ? "Saving..." : "SAVE CHANGES"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlayerProfile({ user }) {
  const [myProfile, setMyProfile] = useState(null)
  const [allPlayers, setAllPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [tab, setTab] = useState("my") // my | search
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    fetchMyProfile()
    fetchAllPlayers()
  }, [])

  const fetchMyProfile = async () => {
    const { data } = await supabase.from("players").select("*").eq("id", user.id).single()
    if (data) setMyProfile(data)
    setLoading(false)
  }

  const fetchAllPlayers = async () => {
    const { data } = await supabase.from("players").select("*").order("rating", { ascending: false })
    if (data) setAllPlayers(data)
  }

  const filtered = allPlayers.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.game?.toLowerCase().includes(search.toLowerCase()) ||
    p.country?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
      Loading profile...
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "monospace" }}>

      {/* HEADER */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 3 }}>WAVE ARENA</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>
          PLAYER <span style={{ color: C.cyan }}>PROFILES</span>
        </div>
      </div>

      {/* TAB NAV */}
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        {[["my", "MY PROFILE"], ["search", "FIND PLAYERS"]].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setSelectedPlayer(null) }} style={{
            flex: 1, padding: "12px 0", background: "transparent", border: "none",
            borderBottom: tab === id ? `2px solid ${C.cyan}` : "2px solid transparent",
            color: tab === id ? C.text : C.muted,
            fontWeight: tab === id ? 700 : 400,
            fontSize: 11, cursor: "pointer", letterSpacing: 1
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>

        {/* MY PROFILE */}
        {tab === "my" && (
          <div>
            {myProfile ? (
              <ProfileCard
                player={myProfile}
                isOwn={true}
                onEdit={() => setShowEdit(true)}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
                Profile not found
              </div>
            )}
          </div>
        )}

        {/* FIND PLAYERS */}
        {tab === "search" && !selectedPlayer && (
          <div>
            <input
              placeholder="Search by username, game, country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, marginBottom: 14, outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>
              {filtered.length} PLAYERS
            </div>
            {filtered.map((player, i) => {
              const tier = getTier(player.rating || 1000)
              const tierColor = TIER_COLORS[tier]
              return (
                <div key={player.id} onClick={() => setSelectedPlayer(player)} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 12
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: `${tierColor}22`, border: `2px solid ${tierColor}44`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                  }}>🎮</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{player.username}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{player.game} · {player.country}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: tierColor }}>{player.rating}</div>
                    <div style={{ fontSize: 10, color: tierColor, fontWeight: 700 }}>{tier}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* SELECTED PLAYER PROFILE */}
        {tab === "search" && selectedPlayer && (
          <div>
            <button onClick={() => setSelectedPlayer(null)} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "6px 14px", color: C.muted,
              fontSize: 12, cursor: "pointer", marginBottom: 16
            }}>← BACK</button>
            <ProfileCard
              player={selectedPlayer}
              isOwn={selectedPlayer.id === user.id}
              onEdit={() => setShowEdit(true)}
            />
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEdit && myProfile && (
        <EditModal
          player={myProfile}
          onSave={(updated) => setMyProfile(updated)}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}