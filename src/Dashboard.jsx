import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const C = {
  bg: "#050810",
  card: "#0A1020",
  card2: "#0D1628",
  blue: "#00A8FF",
  cyan: "#00E5FF",
  green: "#00FF94",
  red: "#FF3B5C",
  yellow: "#FFD700",
  text: "#E8F0FF",
  muted: "#5A7099",
  border: "#1A2540",
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "⚡" },
  { id: "tournaments", label: "Tournaments", icon: "🏆" },
  { id: "leaderboard", label: "Leaderboard", icon: "📊" },
  { id: "matches", label: "Matches", icon: "⚔️" },
]

const MOCK_LEADERBOARD = [
  { rank: 1, username: "DragonSlayer", game: "FIFA", rating: 2100, wins: 45, country: "Nigeria" },
  { rank: 2, username: "WaveKing", game: "PUBG Mobile", rating: 1980, wins: 38, country: "Ghana" },
  { rank: 3, username: "ProGamer_NG", game: "Valorant", rating: 1850, wins: 32, country: "Nigeria" },
  { rank: 4, username: "AfricaElite", game: "FIFA", rating: 1720, wins: 28, country: "Kenya" },
  { rank: 5, username: "TekkenMaster", game: "Tekken 8", rating: 1650, wins: 24, country: "South Africa" },
  { rank: 6, username: "CodLegend", game: "Call of Duty", rating: 1580, wins: 20, country: "Egypt" },
  { rank: 7, username: "WaveRider07", game: "FIFA", rating: 1500, wins: 15, country: "Nigeria" },
]

const MOCK_TOURNAMENTS = [
  { id: 1, name: "West Africa FIFA Cup", game: "FIFA", prize: "₦50,000", players: "16/32", status: "open", date: "May 15" },
  { id: 2, name: "Pan-Africa PUBG Clash", game: "PUBG Mobile", prize: "₦30,000", players: "8/16", status: "open", date: "May 18" },
  { id: 3, name: "Lagos Valorant Open", game: "Valorant", prize: "₦20,000", players: "12/16", status: "open", date: "May 20" },
  { id: 4, name: "Nairobi Tekken League", game: "Tekken 8", prize: "₦15,000", players: "16/16", status: "full", date: "May 12" },
]

const MOCK_MATCHES = [
  { id: 1, opponent: "DragonSlayer", result: "win", score: "3-1", game: "FIFA", rating: "+25", date: "2h ago" },
  { id: 2, opponent: "ProGamer_NG", result: "loss", score: "1-3", game: "FIFA", rating: "-18", date: "5h ago" },
  { id: 3, opponent: "AfricaElite", result: "win", score: "2-0", game: "FIFA", rating: "+22", date: "1d ago" },
  { id: 4, opponent: "WaveKing", result: "loss", score: "0-2", game: "FIFA", rating: "-20", date: "2d ago" },
]

export default function Dashboard({ user, profile, onSignOut }) {
  const [activeTab, setActiveTab] = useState("home")
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD)
  const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS)
  const [matches, setMatches] = useState(MOCK_MATCHES)
  const [playerData, setPlayerData] = useState(profile)

  // Calculate win rate
  const wins = playerData?.wins || 0
  const losses = playerData?.losses || 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const rating = playerData?.rating || 1000

  useEffect(() => {
    fetchLeaderboard()
  }, [])

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

  const getRatingColor = (change) => {
    return change?.startsWith("+") ? C.green : C.red
  }

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
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{playerData?.username || "Player"}</div>
            <div style={{ fontSize: 11, color: C.cyan }}>⚡ {rating} ELO</div>
          </div>
          <button onClick={onSignOut} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.muted, padding: "6px 12px", fontSize: 11, cursor: "pointer"
          }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Rating", value: rating, color: C.cyan, icon: "⚡" },
                { label: "Win Rate", value: `${winRate}%`, color: C.green, icon: "🎯" },
                { label: "Matches", value: total, color: C.blue, icon: "⚔️" },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "14px 10px", textAlign: "center"
                }}>
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
                <div style={{
                  width: `${winRate}%`, height: "100%",
                  background: `linear-gradient(90deg, ${C.green}, ${C.cyan})`,
                  borderRadius: 4, transition: "width 0.5s"
                }} />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>QUICK ACTIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => setActiveTab("tournaments")} style={{
                  background: `linear-gradient(135deg, ${C.blue}22, ${C.cyan}11)`,
                  border: `1px solid ${C.blue}44`, borderRadius: 12, padding: 16,
                  color: C.text, cursor: "pointer", textAlign: "left"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🏆</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Join Tournament</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>3 open now</div>
                </button>
                <button onClick={() => setActiveTab("matches")} style={{
                  background: `linear-gradient(135deg, ${C.green}22, ${C.cyan}11)`,
                  border: `1px solid ${C.green}44`, borderRadius: 12, padding: 16,
                  color: C.text, cursor: "pointer", textAlign: "left"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>⚔️</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>View Matches</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Recent history</div>
                </button>
              </div>
            </div>

            {/* Recent Matches Preview */}
            <div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>RECENT MATCHES</div>
              {matches.slice(0, 3).map(match => (
                <div key={match.id} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: match.result === "win" ? `${C.green}22` : `${C.red}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14
                    }}>
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

        {/* TOURNAMENTS TAB */}
        {activeTab === "tournaments" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>ACTIVE TOURNAMENTS</div>
            {tournaments.map(t => (
              <div key={t.id} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 16, marginBottom: 12
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{t.game} · {t.date}</div>
                  </div>
                  <div style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: t.status === "open" ? `${C.green}22` : `${C.red}22`,
                    color: t.status === "open" ? C.green : C.red,
                    border: `1px solid ${t.status === "open" ? C.green : C.red}44`
                  }}>
                    {t.status === "open" ? "OPEN" : "FULL"}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted }}>Prize</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.yellow }}>{t.prize}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted }}>Players</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.players}</div>
                    </div>
                  </div>
                  <button disabled={t.status === "full"} style={{
                    background: t.status === "open" ? C.blue : C.border,
                    border: "none", borderRadius: 8, padding: "8px 16px",
                    color: t.status === "open" ? "#050810" : C.muted,
                    fontWeight: 700, fontSize: 12, cursor: t.status === "open" ? "pointer" : "not-allowed"
                  }}>
                    {t.status === "open" ? "JOIN →" : "FULL"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>TOP PLAYERS</div>
            {leaderboard.map((player, i) => (
              <div key={i} style={{
                background: player.rank <= 3 ? `${C.card}` : C.card,
                border: `1px solid ${player.rank <= 3 ? getRankColor(player.rank) + "44" : C.border}`,
                borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: `${getRankColor(player.rank)}22`,
                  color: getRankColor(player.rank), fontWeight: 900, fontSize: 14
                }}>
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

        {/* MATCHES TAB */}
        {activeTab === "matches" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>MATCH HISTORY</div>
            {matches.map(match => (
              <div key={match.id} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 16, marginBottom: 10
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: match.result === "win" ? `${C.green}22` : `${C.red}22`,
                      border: `1px solid ${match.result === "win" ? C.green : C.red}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18
                    }}>
                      {match.result === "win" ? "✓" : "✗"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>vs {match.opponent}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{match.game}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{match.score}</div>
                    <div style={{
                      fontSize: 12, fontWeight: 700,
                      color: getRatingColor(match.rating)
                    }}>{match.rating} ELO</div>
                  </div>
                </div>
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between"
                }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{match.date}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: match.result === "win" ? C.green : C.red
                  }}>
                    {match.result.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.card, borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-around", padding: "8px 0 12px"
      }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "4px 12px"
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: activeTab === item.id ? C.cyan : C.muted,
              letterSpacing: 1
            }}>
              {item.label.toUpperCase()}
            </span>
            {activeTab === item.id && (
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.cyan }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}