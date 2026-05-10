import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"

const C = {
  bg: "#050810", card: "#0A1020", card2: "#0D1628",
  blue: "#00A8FF", cyan: "#00E5FF", green: "#00FF94",
  red: "#FF3B5C", yellow: "#FFD700", purple: "#9B59B6",
  text: "#E8F0FF", muted: "#5A7099", border: "#1A2540",
}

const DAILY_API_KEY = "97610f022eee5d5f60c46c738a19c2ab95172bec22376b123cc8fe5cfa53abb9"

const DEFAULT_ROOMS = [
  { id: "global", name: "🌍 Global Chat", type: "global", desc: "Everyone on Wave Arena" },
  { id: "fifa", name: "⚽ FIFA Lounge", type: "group", desc: "FIFA players only" },
  { id: "pubg", name: "🔫 PUBG Squad", type: "group", desc: "PUBG Mobile players" },
  { id: "valorant", name: "🎯 Valorant Hub", type: "group", desc: "Valorant players" },
  { id: "general", name: "💬 General", type: "group", desc: "General discussion" },
]

const EMOJIS = ["😂","🔥","👑","💪","⚡","🎮","🏆","😎","❤️","🙏","💀","😤","🫡","🤝","👏"]

// ─── VIDEO CALL ───────────────────────────────────────────────────────────────
function VideoCall({ roomName, username, onEnd }) {
  const frameRef = useRef(null)
  const callRef = useRef(null)

  useEffect(() => {
    const createRoom = async () => {
      try {
        const res = await fetch("https://api.daily.co/v1/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DAILY_API_KEY}`,
          },
          body: JSON.stringify({
            name: roomName,
            properties: { exp: Math.floor(Date.now() / 1000) + 3600 },
          }),
        })
        const room = await res.json()
        const url = room.url || `https://wavearena.daily.co/${roomName}`

        if (window.DailyIframe && frameRef.current) {
          callRef.current = window.DailyIframe.createFrame(frameRef.current, {
            showLeaveButton: true,
            showFullscreenButton: true,
            iframeStyle: { width: "100%", height: "100%", border: "none", borderRadius: 12 },
          })
          await callRef.current.join({ url, userName: username })
          callRef.current.on("left-meeting", onEnd)
        }
      } catch (e) {
        console.error("Video call error:", e)
      }
    }
    createRoom()
    return () => { if (callRef.current) callRef.current.destroy() }
  }, [])

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.card, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.cyan }}>📹 Video Call</div>
        <button onClick={onEnd} style={{ background: C.red, border: "none", borderRadius: 8, padding: "6px 14px", color: "white", fontWeight: 700, cursor: "pointer" }}>END CALL</button>
      </div>
      <div ref={frameRef} style={{ flex: 1 }} />
      <script src="https://unpkg.com/@daily-co/daily-js" />
    </div>
  )
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isMe }) {
  return (
    <div style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
      {!isMe && (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.blue}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🎮</div>
      )}
      <div style={{ maxWidth: "75%" }}>
        {!isMe && <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, marginLeft: 4 }}>{msg.username}</div>}
        <div style={{
          background: isMe ? C.blue : C.card2,
          borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          padding: msg.type === "image" ? 4 : "8px 12px",
          border: `1px solid ${isMe ? C.blue : C.border}`,
        }}>
          {msg.type === "image" && msg.image_url ? (
            <img src={msg.image_url} alt="sent" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block" }} />
          ) : (
            <div style={{ fontSize: 13, color: isMe ? "#050810" : C.text, lineHeight: 1.4 }}>{msg.content}</div>
          )}
        </div>
        <div style={{ fontSize: 9, color: C.muted, marginTop: 3, textAlign: isMe ? "right" : "left", marginLeft: 4, marginRight: 4 }}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  )
}

// ─── CHAT ROOM ────────────────────────────────────────────────────────────────
function ChatRoom({ room, user, username, onBack, allPlayers }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [callType, setCallType] = useState(null)
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    const sub = supabase
      .channel(`room:${room.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${room.id}` },
        payload => setMessages(prev => [...prev, payload.new])
      )
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [room.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true })
      .limit(50)
    if (data) setMessages(data)
  }

  const sendMessage = async (content, type = "text", image_url = null) => {
    if (!content?.trim() && !image_url) return
    await supabase.from("messages").insert({
      room_id: room.id,
      user_id: user.id,
      username: username || "Player",
      content: content?.trim() || null,
      image_url,
      type,
    })
    setText("")
    setShowEmoji(false)
  }

  const handleImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `chat/${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("chat-images").upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from("chat-images").getPublicUrl(path)
      await sendMessage(null, "image", data.publicUrl)
    }
    setUploading(false)
  }

  const startCall = (type) => {
    setCallType(type)
    setInCall(true)
    sendMessage(`📹 ${username} started a ${type} call`, "text")
  }

  if (inCall) {
    return <VideoCall roomName={`wavearena-${room.id}`} username={username} onEnd={() => setInCall(false)} />
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{room.name}</div>
          <div style={{ fontSize: 10, color: C.muted }}>{room.desc || room.type}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => startCall("voice")} style={{ background: `${C.green}22`, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "6px 10px", color: C.green, fontSize: 14, cursor: "pointer" }}>📞</button>
          <button onClick={() => startCall("video")} style={{ background: `${C.blue}22`, border: `1px solid ${C.blue}44`, borderRadius: 8, padding: "6px 10px", color: C.blue, fontSize: 14, cursor: "pointer" }}>📹</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div>No messages yet. Say hello!</div>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} isMe={msg.user_id === user.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setText(t => t + e)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", padding: 2 }}>{e}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => fileRef.current?.click()} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", padding: 4 }}>📎</button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
        <button onClick={() => setShowEmoji(s => !s)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", padding: 4 }}>😊</button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(text)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "9px 12px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 20, color: C.text, fontSize: 13, outline: "none" }}
        />
        <button onClick={() => sendMessage(text)} disabled={!text.trim() && !uploading} style={{
          background: text.trim() ? C.blue : C.border, border: "none", borderRadius: 20,
          padding: "9px 16px", color: text.trim() ? "#050810" : C.muted,
          fontWeight: 700, fontSize: 13, cursor: "pointer"
        }}>
          {uploading ? "⏳" : "→"}
        </button>
      </div>
    </div>
  )
}

// ─── PRIVATE MESSAGE ──────────────────────────────────────────────────────────
function PrivateMessages({ user, username, onBack, allPlayers }) {
  const [selected, setSelected] = useState(null)

  const getPrivateRoom = (otherId) => {
    const ids = [user.id, otherId].sort()
    return `dm_${ids[0]}_${ids[1]}`
  }

  if (selected) {
    return (
      <ChatRoom
        room={{ id: getPrivateRoom(selected.id), name: `💬 ${selected.username}`, desc: "Private message", type: "private" }}
        user={user}
        username={username}
        onBack={() => setSelected(null)}
        allPlayers={allPlayers}
      />
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "monospace" }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 18, cursor: "pointer" }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 900 }}>DIRECT <span style={{ color: C.cyan }}>MESSAGES</span></div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>SELECT A PLAYER</div>
        {allPlayers.filter(p => p.id !== user.id).map(player => (
          <div key={player.id} onClick={() => setSelected(player)} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "12px 14px", marginBottom: 8, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.blue}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{player.username}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{player.game} · {player.country}</div>
            </div>
            <div style={{ fontSize: 12, color: C.cyan }}>💬</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN CHAT COMPONENT ──────────────────────────────────────────────────────
export default function ChatSystem({ user }) {
  const [view, setView] = useState("rooms") // rooms | room | dm
  const [activeRoom, setActiveRoom] = useState(null)
  const [allPlayers, setAllPlayers] = useState([])
  const [username, setUsername] = useState("Player")
  const [tab, setTab] = useState("groups") // groups | dm

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    const { data } = await supabase.from("players").select("id, username, game, country, rating").order("rating", { ascending: false })
    if (data) {
      setAllPlayers(data)
      const me = data.find(p => p.id === user.id)
      if (me) setUsername(me.username || "Player")
    }
  }

  if (view === "room" && activeRoom) {
    return <ChatRoom room={activeRoom} user={user} username={username} onBack={() => setView("rooms")} allPlayers={allPlayers} />
  }

  if (view === "dm") {
    return <PrivateMessages user={user} username={username} onBack={() => setView("rooms")} allPlayers={allPlayers} />
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "monospace", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 3 }}>WAVE ARENA</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>
          CHAT <span style={{ color: C.cyan }}>ROOMS</span>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        {[["groups", "💬 ROOMS"], ["dm", "📩 MESSAGES"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: "12px 0", background: "transparent", border: "none",
            borderBottom: tab === id ? `2px solid ${C.cyan}` : "2px solid transparent",
            color: tab === id ? C.text : C.muted,
            fontWeight: tab === id ? 700 : 400, fontSize: 12, cursor: "pointer"
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* ROOMS */}
        {tab === "groups" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>CHAT ROOMS</div>
            {DEFAULT_ROOMS.map(room => (
              <div key={room.id} onClick={() => { setActiveRoom(room); setView("room") }} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "14px 16px", marginBottom: 10,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                borderLeft: `3px solid ${room.type === "global" ? C.cyan : C.blue}`
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{room.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{room.desc}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: room.type === "global" ? C.cyan : C.blue, fontWeight: 700, background: `${room.type === "global" ? C.cyan : C.blue}22`, padding: "2px 8px", borderRadius: 10 }}>
                    {room.type === "global" ? "GLOBAL" : "GROUP"}
                  </span>
                  <span style={{ color: C.muted, fontSize: 16 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIRECT MESSAGES */}
        {tab === "dm" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>PLAYERS</div>
            {allPlayers.filter(p => p.id !== user.id).map(player => (
              <div key={player.id} onClick={() => {
                setActiveRoom({
                  id: [user.id, player.id].sort().join("_dm_"),
                  name: `💬 ${player.username}`,
                  desc: "Private message",
                  type: "private"
                })
                setView("room")
              }} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${C.purple}22`, border: `2px solid ${C.purple}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎮</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{player.username}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{player.game} · {player.country}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: C.cyan, fontWeight: 700 }}>{player.rating} ELO</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Message →</div>
                </div>
              </div>
            ))}
            {allPlayers.filter(p => p.id !== user.id).length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div>No other players yet</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}