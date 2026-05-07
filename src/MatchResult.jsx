import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const C = {
  bg:"#050810", card:"#0A1020", blue:"#00A8FF",
  cyan:"#00E5FF", gold:"#FFD700", red:"#FF3B5C",
  green:"#00FF88", text:"#E8F0FF", muted:"#5A7099",
  border:"#1A2540"
}

function calculateELO(winnerRating, loserRating) {
  const K = 32
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
  const expectedLoser = 1 - expectedWinner
  return {
    newWinnerRating: Math.round(winnerRating + K * (1 - expectedWinner)),
    newLoserRating: Math.round(loserRating + K * (0 - expectedLoser))
  }
}

export default function MatchResult({ user }) {
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [opponent, setOpponent] = useState("")
  const [myScore, setMyScore] = useState(0)
  const [oppScore, setOppScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [myProfile, setMyProfile] = useState(null)

  useEffect(() => {
    fetchPlayers()
    fetchMatches()
  }, [])

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .neq("user_id", user.id)
    setPlayers(data || [])

    const { data: me } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.id)
      .single()
    setMyProfile(me)
  }

  const fetchMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
    setMatches(data || [])
  }

  const submitResult = async () => {
    if (!opponent) { setMessage("Select an opponent"); return }
    setLoading(true)
    setMessage("")

    const oppProfile = players.find(p => p.user_id === opponent)
    if (!oppProfile || !myProfile) { setMessage("Player profiles not found"); setLoading(false); return }

    const iWon = myScore > oppScore
    const winnerId = iWon ? user.id : opponent
    const loserId = iWon ? opponent : user.id
    const winnerRating = iWon ? (myProfile.rating || 1000) : (oppProfile.rating || 1000)
    const loserRating = iWon ? (oppProfile.rating || 1000) : (myProfile.rating || 1000)

    const { newWinnerRating, newLoserRating } = calculateELO(winnerRating, loserRating)

    await supabase.from("matches").insert({
      player1_id: user.id,
      player2_id: opponent,
      player1_score: myScore,
      player2_score: oppScore,
      winner_id: winnerId,
      status: "completed"
    })

    await supabase.from("players")
      .update({
        rating: newWinnerRating,
        wins: iWon ? (myProfile.wins || 0) + 1 : (oppProfile.wins || 0) + 1
      })
      .eq("user_id", winnerId)

    await supabase.from("players")
      .update({
        rating: newLoserRating,
        losses: iWon ? (oppProfile.losses || 0) + 1 : (myProfile.losses || 0) + 1
      })
      .eq("user_id", loserId)

    setMessage(iWon ? "✅ Win recorded! Your rating went up!" : "Match recorded. Keep grinding!")
    fetchPlayers()
    fetchMatches()
    setLoading(false)
  }

  const inputStyle = {
    width:"100%", padding:"10px 14px",
    background:"#0D1628", border:`1px solid ${C.border}`,
    borderRadius:8, color:C.text, fontSize:13,
    marginBottom:12, outline:"none", boxSizing:"border-box"
  }

  return (
    <div style={{ padding:"0 4px" }}>
      <div style={{ fontWeight:900, fontSize:24, color:C.text, letterSpacing:2, marginBottom:4 }}>MATCH RESULTS</div>
      <div style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Submit results and update your ELO rating</div>

      {myProfile && (
        <div style={{ background:`linear-gradient(135deg, ${C.blue}15, ${C.card})`, border:`1px solid ${C.blue}40`, borderRadius:12, padding:16, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{myProfile.username}</div>
            <div style={{ fontSize:12, color:C.muted }}>{myProfile.game} · {myProfile.country}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:900, fontSize:24, color:C.gold }}>{myProfile.rating || 1000}</div>
            <div style={{ fontSize:11, color:C.muted }}>ELO RATING</div>
          </div>
        </div>
      )}

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
        <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:16 }}>SUBMIT MATCH RESULT</div>

        <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>SELECT OPPONENT</div>
        <select value={opponent} onChange={e => setOpponent(e.target.value)} style={inputStyle}>
          <option value="">-- Choose opponent --</option>
          {players.map(p => (
            <option key={p.user_id} value={p.user_id}>
              {p.username} (Rating: {p.rating || 1000})
            </option>
          ))}
        </select>

        <div style={{ display:"flex", gap:12, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>MY SCORE</div>
            <input type="number" min="0" max="20" value={myScore}
              onChange={e => setMyScore(parseInt(e.target.value) || 0)}
              style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>OPPONENT SCORE</div>
            <input type="number" min="0" max="20" value={oppScore}
              onChange={e => setOppScore(parseInt(e.target.value) || 0)}
              style={inputStyle} />
          </div>
        </div>

        {myScore > 0 || oppScore > 0 ? (
          <div style={{ background: myScore > oppScore ? `${C.green}15` : `${C.red}15`, border:`1px solid ${myScore > oppScore ? C.green : C.red}40`, borderRadius:8, padding:"10px 14px", marginBottom:12, textAlign:"center" }}>
            <span style={{ fontWeight:700, color: myScore > oppScore ? C.green : C.red, fontSize:14 }}>
              {myScore > oppScore ? "🏆 YOU WIN" : myScore < oppScore ? "💀 YOU LOSE" : "🤝 DRAW"}
            </span>
          </div>
        ) : null}

        {message && (
          <div style={{ color: message.includes("✅") ? C.green : C.red, fontSize:12, marginBottom:12, textAlign:"center" }}>
            {message}
          </div>
        )}

        <button onClick={submitResult} disabled={loading}
          style={{ width:"100%", padding:"12px 0", background:C.blue, border:"none", borderRadius:8, color:"#050810", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {loading ? "Submitting..." : "SUBMIT RESULT →"}
        </button>
      </div>

      {matches.length > 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, fontWeight:700, color:C.text, fontSize:13 }}>RECENT MATCHES</div>
          {matches.map((m, i) => (
            <div key={m.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom: i < matches.length-1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize:12, color:C.muted }}>Match #{i+1}</div>
              <div style={{ fontFamily:"monospace", fontSize:13, color:C.text }}>{m.player1_score} - {m.player2_score}</div>
              <div style={{ fontSize:11, color: m.winner_id === user.id ? C.green : C.red, fontWeight:700 }}>
                {m.winner_id === user.id ? "WIN" : "LOSS"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}