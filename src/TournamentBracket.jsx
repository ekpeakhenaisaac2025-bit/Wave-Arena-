import { useState } from "react"

const C = {
  bg: "#050810", card: "#0A1020", card2: "#0D1628",
  blue: "#00A8FF", cyan: "#00E5FF", green: "#00FF94",
  red: "#FF3B5C", yellow: "#FFD700",
  text: "#E8F0FF", muted: "#5A7099", border: "#1A2540",
}

const GAMES = ["FIFA","PUBG Mobile","Call of Duty","Valorant","Tekken 8","eFootball"]
const FLAGS = ["🇳🇬","🇬🇭","🇰🇪","🇿🇦","🇪🇬","🇸🇳","🇪🇹","🇹🇿"]
const NAMES = ["DragonSlayer","WaveKing","ProGamer_NG","AfricaElite","TekkenMaster","CodLegend","WaveRider07","ShadowX","KingPitch","DribbleGod","Striker99","EliteFC","NaijaGoat","GhanaKing","SouthernFC","EgyptPro","LagosLion","AccraAce","NairobiFC","CairoKing","DurbanDon","TunisPro","AbujaStar","KumasiFC","MombasaKid","AlexPro","JoziElite","AddisAce","DakarDon","KinshasaFC","LusakaLion","HararePro"]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: NAMES[i] || `Player${i + 1}`,
    rating: Math.floor(Math.random() * 800) + 1200,
    country: FLAGS[i % FLAGS.length],
  }))
}

function generateBracket(players) {
  const rounds = []
  let current = []
  for (let i = 0; i < players.length; i += 2) {
    current.push({
      id: `r1m${i / 2}`,
      player1: players[i],
      player2: players[i + 1] || null,
      winner: null, score1: null, score2: null,
    })
  }
  rounds.push(current)
  let mid = 0
  while (current.length > 1) {
    const next = []
    for (let i = 0; i < current.length; i += 2) {
      next.push({ id: `r${rounds.length + 1}m${mid++}`, player1: null, player2: null, winner: null, score1: null, score2: null })
    }
    rounds.push(next)
    current = next
  }
  return rounds
}

function generateLeague(players) {
  const matches = []
  for (let i = 0; i < players.length; i++)
    for (let j = i + 1; j < players.length; j++)
      matches.push({ id: `${i}-${j}`, home: players[i], away: players[j], homeScore: null, awayScore: null, played: false })
  return matches
}

function calcTable(players, matches) {
  const table = players.map(p => ({ ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }))
  matches.filter(m => m.played).forEach(m => {
    const h = table.find(p => p.id === m.home.id)
    const a = table.find(p => p.id === m.away.id)
    if (!h || !a) return
    h.played++; a.played++
    h.gf += m.homeScore; h.ga += m.awayScore
    a.gf += m.awayScore; a.ga += m.homeScore
    if (m.homeScore > m.awayScore) { h.won++; h.points += 3; a.lost++ }
    else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++ }
    else { h.drawn++; a.drawn++; h.points++; a.points++ }
  })
  return table.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga))
}

function getRoundName(ri, total) {
  const f = total - 1 - ri
  if (f === 0) return "FINAL"
  if (f === 1) return "SEMI-FINAL"
  if (f === 2) return "QUARTER-FINAL"
  if (f === 3) return "ROUND OF 16"
  return `ROUND ${ri + 1}`
}

// ─── MATCH CARD (Elimination) ─────────────────────────────────────────────────

function MatchCard({ match, onSetWinner, compact }) {
  const [editing, setEditing] = useState(false)
  const [s1, setS1] = useState("")
  const [s2, setS2] = useState("")

  const submit = () => {
    const a = parseInt(s1), b = parseInt(s2)
    if (isNaN(a) || isNaN(b) || a === b) return
    onSetWinner(match.id, a > b ? match.player1 : match.player2, a, b)
    setEditing(false); setS1(""); setS2("")
  }

  const p1 = match.player1, p2 = match.player2, hw = !!match.winner

  return (
    <div style={{
      background: hw ? C.card2 : C.card,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${hw ? C.green : C.border}`,
      borderRadius: compact ? 8 : 12,
      padding: compact ? "8px 10px" : "12px 14px",
      minWidth: compact ? 150 : 185,
    }}>
      {[p1, p2].map((p, i) => (
        <div key={i}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "4px 0",
            opacity: hw && match.winner?.id !== p?.id ? 0.35 : 1,
            fontWeight: match.winner?.id === p?.id ? 900 : 400,
          }}>
            <span style={{ fontSize: compact ? 10 : 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
              {p ? `${p.country} ${p.name}` : <span style={{ color: C.muted, fontStyle: "italic" }}>TBD</span>}
            </span>
            {hw && <span style={{ fontSize: 13, fontWeight: 700, color: match.winner?.id === p?.id ? C.green : C.muted, marginLeft: 6 }}>
              {i === 0 ? match.score1 : match.score2}
            </span>}
          </div>
          {i === 0 && <div style={{ height: 1, background: C.border, margin: "2px 0" }} />}
        </div>
      ))}

      {!hw && p1 && p2 && !editing && (
        <button onClick={() => setEditing(true)} style={{
          width: "100%", marginTop: 6, padding: "4px 0",
          background: `${C.blue}20`, border: `1px solid ${C.blue}40`,
          borderRadius: 6, color: C.blue, fontSize: 10, fontWeight: 700, cursor: "pointer"
        }}>ENTER SCORE</button>
      )}

      {editing && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input value={s1} onChange={e => setS1(e.target.value)} placeholder="0"
              style={{ width: 36, padding: "4px 6px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, textAlign: "center", outline: "none" }} />
            <span style={{ color: C.muted, fontSize: 11 }}>–</span>
            <input value={s2} onChange={e => setS2(e.target.value)} placeholder="0"
              style={{ width: 36, padding: "4px 6px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, textAlign: "center", outline: "none" }} />
            <button onClick={submit} style={{ flex: 1, padding: "4px 0", background: C.green, border: "none", borderRadius: 6, color: "#050810", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>✓</button>
            <button onClick={() => setEditing(false)} style={{ padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 10, cursor: "pointer" }}>✗</button>
          </div>
          <div style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>⚠ No draws allowed</div>
        </div>
      )}
    </div>
  )
}

// ─── BRACKET VIEW ─────────────────────────────────────────────────────────────

function BracketView({ rounds, onSetWinner, playerCount }) {
  const champion = rounds[rounds.length - 1]?.[0]?.winner
  return (
    <div>
      {champion && (
        <div style={{
          background: `linear-gradient(135deg, ${C.yellow}20, ${C.yellow}08)`,
          border: `1px solid ${C.yellow}40`, borderRadius: 14,
          padding: "18px 20px", marginBottom: 20, textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🏆</div>
          <div style={{ fontSize: 10, color: C.yellow, letterSpacing: 3, fontWeight: 700 }}>TOURNAMENT CHAMPION</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginTop: 6 }}>{champion.country} {champion.name}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{champion.rating} ELO</div>
        </div>
      )}
      <div style={{ overflowX: "auto", paddingBottom: 16 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", minWidth: "max-content", padding: "4px 2px" }}>
          {rounds.map((round, ri) => (
            <div key={ri} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 9, color: C.cyan, letterSpacing: 2, marginBottom: 12, textAlign: "center", fontWeight: 700 }}>
                {getRoundName(ri, rounds.length)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: Math.pow(2, ri) * 10 + 6 }}>
                {round.map(match => (
                  <MatchCard key={match.id} match={match} onSetWinner={onSetWinner} compact={playerCount > 16} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── LEAGUE VIEW ──────────────────────────────────────────────────────────────

function LeagueView({ players, matches, onSetResult }) {
  const table = calcTable(players, matches)
  const [showMatches, setShowMatches] = useState(false)
  const [editing, setEditing] = useState(null)
  const [s1, setS1] = useState("")
  const [s2, setS2] = useState("")

  const submit = (id) => {
    const a = parseInt(s1), b = parseInt(s2)
    if (isNaN(a) || isNaN(b)) return
    onSetResult(id, a, b); setEditing(null); setS1(""); setS2("")
  }

  const played = matches.filter(m => m.played).length
  const total = matches.length

  return (
    <div>
      {/* Progress */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.muted }}>FIXTURES PLAYED</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.cyan }}>{played} / {total}</span>
        </div>
        <div style={{ background: C.border, borderRadius: 4, height: 6 }}>
          <div style={{ width: `${total ? (played / total) * 100 : 0}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`, borderRadius: 4, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Standings Table */}
      <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>STANDINGS</div>
      <div style={{ background: C.card, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 26px 26px 26px 26px 36px", gap: 4, padding: "8px 12px", background: C.card2, fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>
          <span>#</span><span>PLAYER</span>
          <span style={{ textAlign: "center" }}>P</span>
          <span style={{ textAlign: "center" }}>W</span>
          <span style={{ textAlign: "center" }}>D</span>
          <span style={{ textAlign: "center" }}>L</span>
          <span style={{ textAlign: "center" }}>PTS</span>
        </div>
        {table.map((p, i) => (
          <div key={p.id} style={{
            display: "grid", gridTemplateColumns: "30px 1fr 26px 26px 26px 26px 36px",
            gap: 4, padding: "10px 12px", borderTop: `1px solid ${C.border}`,
            background: i === 0 ? `${C.yellow}12` : i <= 2 ? `${C.green}08` : "transparent"
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? C.yellow : i <= 2 ? C.green : C.muted }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
            </span>
            <span style={{ fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.country} {p.name}
            </span>
            <span style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>{p.played}</span>
            <span style={{ fontSize: 12, color: C.green, textAlign: "center" }}>{p.won}</span>
            <span style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>{p.drawn}</span>
            <span style={{ fontSize: 12, color: C.red, textAlign: "center" }}>{p.lost}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: C.text, textAlign: "center" }}>{p.points}</span>
          </div>
        ))}
      </div>

      {/* Fixtures Toggle */}
      <button onClick={() => setShowMatches(!showMatches)} style={{
        width: "100%", padding: "10px 0", background: C.card,
        border: `1px solid ${C.border}`, borderRadius: 10,
        color: C.text, fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 12
      }}>
        {showMatches ? "▲ HIDE FIXTURES" : "▼ SHOW FIXTURES"} ({total - played} remaining)
      </button>

      {showMatches && (
        <div>
          {matches.map(match => (
            <div key={match.id} style={{
              background: C.card, border: `1px solid ${match.played ? C.green + "30" : C.border}`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 8
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{match.home.country} {match.home.name}</span>
                {match.played
                  ? <span style={{ fontSize: 15, fontWeight: 900, color: C.cyan, margin: "0 12px" }}>{match.homeScore} – {match.awayScore}</span>
                  : <span style={{ fontSize: 11, color: C.muted, margin: "0 12px" }}>vs</span>}
                <span style={{ fontSize: 12, color: C.text, flex: 1, textAlign: "right" }}>{match.away.country} {match.away.name}</span>
              </div>
              {!match.played && editing !== match.id && (
                <button onClick={() => setEditing(match.id)} style={{
                  width: "100%", marginTop: 8, padding: "5px 0",
                  background: `${C.blue}20`, border: `1px solid ${C.blue}40`,
                  borderRadius: 6, color: C.blue, fontSize: 10, fontWeight: 700, cursor: "pointer"
                }}>ENTER RESULT</button>
              )}
              {editing === match.id && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                  <input value={s1} onChange={e => setS1(e.target.value)} placeholder="0"
                    style={{ width: 42, padding: "6px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 14, textAlign: "center", outline: "none" }} />
                  <span style={{ color: C.muted }}>–</span>
                  <input value={s2} onChange={e => setS2(e.target.value)} placeholder="0"
                    style={{ width: 42, padding: "6px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 14, textAlign: "center", outline: "none" }} />
                  <button onClick={() => submit(match.id)} style={{ flex: 1, padding: "6px 0", background: C.green, border: "none", borderRadius: 6, color: "#050810", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>✓ SAVE</button>
                  <button onClick={() => setEditing(null)} style={{ padding: "6px 10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 10, cursor: "pointer" }}>✗</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CREATE MODAL ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }) {
  const [name, setName] = useState("")
  const [type, setType] = useState("elimination")
  const [size, setSize] = useState(8)
  const [leagueSize, setLeagueSize] = useState(4)
  const [game, setGame] = useState("FIFA")

  const handleCreate = () => {
    const finalSize = type === "elimination" ? size : Math.max(2, leagueSize)
    onCreate({ name: name.trim() || `${game} Tournament`, type, size: finalSize, game })
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,16,0.96)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, letterSpacing: 2 }}>
          CREATE <span style={{ color: C.cyan }}>TOURNAMENT</span>
        </div>

        {/* Name */}
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>TOURNAMENT NAME</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lagos FIFA Cup"
          style={{ width: "100%", padding: "10px 14px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />

        {/* Format */}
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>FORMAT</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["elimination", "⚔️ Single Elim"], ["league", "🏅 League"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
              background: type === v ? C.blue : C.card2,
              border: `1px solid ${type === v ? C.blue : C.border}`,
              color: type === v ? "#050810" : C.muted,
              fontWeight: type === v ? 700 : 400, fontSize: 12
            }}>{l}</button>
          ))}
        </div>

        {/* Players */}
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>
          {type === "elimination" ? "PLAYERS" : "NUMBER OF PLAYERS"}
        </div>

        {type === "elimination" ? (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[4, 8, 16, 32].map(s => (
              <button key={s} onClick={() => setSize(s)} style={{
                padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                background: size === s ? C.cyan : C.card2,
                border: `1px solid ${size === s ? C.cyan : C.border}`,
                color: size === s ? "#050810" : C.muted,
                fontWeight: size === s ? 700 : 400, fontSize: 13
              }}>{s}</button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <input
              type="number" min={2} value={leagueSize}
              onChange={e => setLeagueSize(Math.max(2, parseInt(e.target.value) || 2))}
              placeholder="e.g. 6"
              style={{ width: "100%", padding: "10px 14px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>
              Any number · {leagueSize >= 2 ? `${(leagueSize * (leagueSize - 1)) / 2} total fixtures` : "min 2 players"}
            </div>
          </div>
        )}

        {/* Game */}
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>GAME</div>
        <select value={game} onChange={e => setGame(e.target.value)} style={{
          width: "100%", padding: "10px 14px", background: C.card2,
          border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
          fontSize: 13, marginBottom: 20, outline: "none", boxSizing: "border-box"
        }}>
          {GAMES.map(g => <option key={g}>{g}</option>)}
        </select>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            CANCEL
          </button>
          <button onClick={handleCreate} style={{ flex: 2, padding: "12px 0", background: C.blue, border: "none", borderRadius: 8, color: "#050810", fontWeight: 900, fontSize: 13, cursor: "pointer" }}>
            CREATE →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TournamentBracket() {
  const [tournaments, setTournaments] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const handleCreate = ({ name, type, size, game }) => {
    const players = makePlayers(size)
    const t = {
      id: Date.now(), name, type, size, game, status: "active", players,
      ...(type === "elimination" ? { rounds: generateBracket(players) } : { matches: generateLeague(players) })
    }
    setTournaments(prev => [t, ...prev])
    setActiveId(t.id)
    setShowCreate(false)
  }

  const handleSetWinner = (tid, matchId, winner, s1, s2) => {
    setTournaments(prev => prev.map(t => {
      if (t.id !== tid) return t
      const rounds = t.rounds.map(r => r.map(m => m.id === matchId ? { ...m, winner, score1: s1, score2: s2 } : m))
      // Propagate winners forward
      rounds.forEach((round, ri) => {
        if (ri === rounds.length - 1) return
        round.forEach((match, mi) => {
          if (match.winner) {
            const ni = Math.floor(mi / 2), isFirst = mi % 2 === 0
            const nm = rounds[ri + 1][ni]
            if (nm) { if (isFirst) nm.player1 = match.winner; else nm.player2 = match.winner }
          }
        })
      })
      return { ...t, rounds }
    }))
  }

  const handleLeagueResult = (tid, matchId, hs, as) => {
    setTournaments(prev => prev.map(t =>
      t.id !== tid ? t : { ...t, matches: t.matches.map(m => m.id === matchId ? { ...m, homeScore: hs, awayScore: as, played: true } : m) }
    ))
  }

  const active = tournaments.find(t => t.id === activeId)

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "monospace" }}>

      {/* HEADER */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 3 }}>WAVE ARENA</div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>
            TOUR<span style={{ color: C.yellow }}>NAMENTS</span>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          padding: "10px 18px", background: C.blue, border: "none",
          borderRadius: 10, color: "#050810", fontWeight: 900, fontSize: 12, cursor: "pointer", letterSpacing: 1
        }}>+ CREATE</button>
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto", paddingBottom: 40 }}>

        {/* LIST VIEW */}
        {!active && (
          <div>
            {tournaments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "70px 20px" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🏆</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>No Tournaments Yet</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Create your first tournament and start competing</div>
                <button onClick={() => setShowCreate(true)} style={{
                  padding: "13px 30px", background: C.blue, border: "none",
                  borderRadius: 10, color: "#050810", fontWeight: 900, fontSize: 14, cursor: "pointer"
                }}>CREATE TOURNAMENT</button>
              </div>
            ) : tournaments.map(t => (
              <div key={t.id} onClick={() => setActiveId(t.id)} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 16, marginBottom: 12, cursor: "pointer",
                borderLeft: `3px solid ${C.yellow}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      {t.game} · {t.size} Players · {t.type === "elimination" ? "Single Elimination" : "League"}
                    </div>
                  </div>
                  <div style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${C.green}20`, color: C.green, border: `1px solid ${C.green}40` }}>
                    ACTIVE
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: C.cyan, fontWeight: 700 }}>TAP TO VIEW →</div>
              </div>
            ))}
          </div>
        )}

        {/* BRACKET / LEAGUE VIEW */}
        {active && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => setActiveId(null)} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "6px 14px", color: C.muted, fontSize: 12, cursor: "pointer"
              }}>← BACK</button>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{active.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  {active.game} · {active.size} Players · {active.type === "elimination" ? "Single Elimination" : "League"}
                </div>
              </div>
            </div>

            {active.type === "elimination" ? (
              <BracketView
                rounds={active.rounds}
                playerCount={active.size}
                onSetWinner={(mid, w, s1, s2) => handleSetWinner(active.id, mid, w, s1, s2)}
              />
            ) : (
              <LeagueView
                players={active.players}
                matches={active.matches}
                onSetResult={(mid, s1, s2) => handleLeagueResult(active.id, mid, s1, s2)}
              />
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  )
}
