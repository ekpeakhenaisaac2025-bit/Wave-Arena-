import ChatSystem from "./ChatSystem"
import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import TournamentBracket from "./TournamentBracket"
import PlayerProfile from "./PlayerProfile"

const C = {
  bg: "#050810", card: "#0A1020", card2: "#0D1628",
  blue: "#00A8FF", cyan: "#00E5FF", green: "#00FF94",
  red: "#FF3B5C", yellow: "#FFD700",
  text: "#E8F0FF", muted: "#5A7099", border: "#1A2540",
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "⚡" },
  { id: "tournaments", label: "Tournaments", icon: "🏆" },
  { id: "matches", label: "Matches", icon: "⚔️" },
  { id: "chat", label: "Chat", icon: "💬" },
]

const MOCK_MATCHES = [
  { id: 1, opponent: "DragonSlayer", result: "win", score: "3-1", game: "FIFA", rating: "+25", date: "2h ago" },
  { id: 2, opponent: "ProGamer_NG", result: "loss", score: "1-3", game: "FIFA", rating: "-18", date: "5h ago" },
  { id: 3, opponent: "AfricaElite", result: "win", score: "2-0", game: "FIFA", rating: "+22", date: "1d ago" },
  { id: 4, opponent: "WaveKing", result: "loss", score: "0-2", game: "FIFA", rating: "-20", date: "2d ago" },
]

export default function Dashboard({ user, onSignOut }) {
  const [activeTab, setActiveTab] = useState("home")
  const [leaderboard, setLeaderboard] = useState([])
  const [matches] = useState(MOCK_MATCHES)
  const [playerData, setPlayerData] = useState(null)

  const wins = playerData?.wins || 0
  const losses = playerData?.losses || 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const rating = playerData?.rating || 1000

  useEffect(() => {
    fetchPlayerData()
    fetchLeaderboard()
  }, [])

  const fetchPlayerData = async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
    if (data) setPlayerData(data)
  }

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("players")
      .select("username, game, country, wins, losses, rating")
      .order("rating", { ascending: false })
      .limit(10)
    if (data && data.length > 0) {
      setLeaderboard(data.map((p, i) => ({ ...p, rank: i + 1 })))
    }
  }

  const getRankColor = (rank) => {
    if (rank === 1) return C.yellow
    if (rank === 2) return "#C0C0C0"
    if (rank === 3) return "#CD7F32"
    return C.muted
  }

  const getRatingColor = (change) => change?.startsWith("+") ? C.green : C.red

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "monospace" }}>

      {/* TOP NAV */}
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2 }}>
          WAVE<span style={{ color: C.cyan }}>ARENA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div onClick={() => setActiveTab("profile")} style={{ textAlign: "right", cursor: "pointer" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{playerData?.username || "Player"}</div>
          <div style={{ fontSize: 11, color: C.cyan }}>⚡ {rating} ELO</div>
        </div>
          <button onClick={onSignOut} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.muted, padding: "6px 12px", fontSize: 11, cursor: "pointer"
          }}>Sign Out</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>

        {/* ── HOME TAB ── */}
        {activeTab === "home" && (
          <div>
            {/* Hero */}
            <div style={{ background: "linear-gradient(135deg, #051020, #0A1628)", border: "1px solid #1A2540", borderRadius: 16, padding: "32px 20px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#00A8FF", letterSpacing: 3, marginBottom: 10 }}>AFRICA'S #1 ESPORTS ECOSYSTEM</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#E8F0FF", letterSpacing: 4, lineHeight: 1 }}>WAVE</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#00E5FF", letterSpacing: 4, lineHeight: 1, marginBottom: 10 }}>ARENA</div>
              <div style={{ color: "#5A7099", fontSize: 13, marginBottom: 20 }}>Where Legends Rise</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setActiveTab("tournaments")} style={{ padding: "12px 20px", background: "#00A8FF", border: "none", borderRadius: 8, color: "#050810", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>FIND TOURNAMENTS</button>
                <button onClick={() => setActiveTab("leaderboard")} style={{ padding: "12px 20px", background: "transparent", border: "1px solid #1A2540", borderRadius: 8, color: "#E8F0FF", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>LEADERBOARD</button>
              </div>
            </div>

            {/* Live Banner */}
            <div style={{ background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.4)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF3B5C", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#E8F0FF", fontSize: 13 }}>LIVE: East Africa PUBG Open</div>
                <div style={{ fontSize: 11, color: "#5A7099" }}>🇰🇪 Kenya · $2,500 Prize · 16 Teams</div>
              </div>
              <span style={{ color: "#FF3B5C", fontSize: 12, fontWeight: 700 }}>LIVE →</span>
            </div>

            {/* Platform Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
              {[["👾","18,400+","Players"],["🛡️","1,200+","Teams"],["🏆","340+","Tournaments"],["💰","$280K+","Prize Pool"]].map(([icon,val,label]) => (
                <div key={label} style={{ background: "#0A1020", border: "1px solid #1A2540", borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#00A8FF", marginTop: 4 }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#5A7099" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Player Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Rating", value: rating, color: C.cyan, icon: "⚡" },
                { label: "Win Rate", value: `${winRate}%`, color: C.green, icon: "🎯" },
                { label: "Matches", value: total, color: C.blue, icon: "⚔️" },
              ].map(stat => (
                <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>{stat.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, marginTop: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* W/L Bar */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.green }}>W {wins}</span>
                <span style={{ fontSize: 12, color: C.muted }}>Win / Loss</span>
                <span style={{ fontSize: 12, color: C.red }}>L {losses}</span>
              </div>
              <div style={{ background: C.border, borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${winRate}%`, height: "100%", background: `linear-gradient(90deg, ${C.green}, ${C.cyan})`, borderRadius: 4 }} />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>QUICK ACTIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => setActiveTab("tournaments")} style={{ background: `linear-gradient(135deg, ${C.blue}22, ${C.cyan}11)`, border: `1px solid ${C.blue}44`, borderRadius: 12, padding: 16, color: C.text, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🏆</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Join Tournament</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>3 open now</div>
                </button>
                <button onClick={() => setActiveTab("profile")} style={{ background: `linear-gradient(135deg, ${C.green}22, ${C.cyan}11)`, border: `1px solid ${C.green}44`, borderRadius: 12, padding: 16, color: C.text, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>👤</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>My Profile</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>View stats</div>
                </button>
              </div>
            </div>

            {/* Recent Matches */}
            <div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>RECENT MATCHES</div>
              {matches.slice(0, 3).map(match => (
                <div key={match.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: match.result === "win" ? `${C.green}22` : `${C.red}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                      {match.result === "win" ? "✓" : "✗"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>vs {match.opponent}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{match.game} · {match.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{match.score}</div>
                    <div style={{ fontSize: 11, color: getRatingColor(match.rating) }}>{match.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TOURNAMENTS TAB ── */}
        {activeTab === "tournaments" && <TournamentBracket user={user} />}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === "leaderboard" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>TOP PLAYERS</div>
            {leaderboard.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>No players yet</div>
            )}
            {leaderboard.map((player, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${player.rank <= 3 ? getRankColor(player.rank) + "44" : C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${getRankColor(player.rank)}22`, color: getRankColor(player.rank), fontWeight: 900, fontSize: 14 }}>
                  {player.rank <= 3 ? ["🥇","🥈","🥉"][player.rank-1] : player.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{player.username}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{player.game} · {player.country}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cyan }}>{player.rating}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{player.wins}W</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MATCHES TAB ── */}
        {activeTab === "matches" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>MATCH HISTORY</div>
            {matches.map(match => (
              <div key={match.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: match.result === "win" ? `${C.green}22` : `${C.red}22`, border: `1px solid ${match.result === "win" ? C.green : C.red}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {match.result === "win" ? "✓" : "✗"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>vs {match.opponent}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{match.game}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{match.score}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: getRatingColor(match.rating) }}>{match.rating} ELO</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{match.date}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: match.result === "win" ? C.green : C.red }}>{match.result.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && <PlayerProfile user={user} />}
        {activeTab === "chat" && <ChatSystem user={user} />}

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "6px 0 10px", zIndex: 100 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 6px", minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: activeTab === item.id ? C.cyan : C.muted, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
              {item.label.toUpperCase()}
            </span>
            {activeTab === item.id && <div style={{ width: 3, height: 3, borderRadius: "50%", background: C.cyan }} />}
          </button>
        ))}
      </div>

    </div>
  )
}