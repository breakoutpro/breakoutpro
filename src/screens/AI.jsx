import { useState, useEffect, useRef } from "react";
import { G, nowT, localAI } from "../utils/helpers";
import { AI_KB, CANDLE_PATTERNS } from "../data/globals";

import { useTheme } from "../theme/ThemeProvider";
export default function AIScreen() {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system

  var [msgs, setMsgs] = useState([]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var endRef = useRef(null);
  var chips = [
    "Explain OI", "What is PCR", "What is RSI", "Explain VWAP", "What is Doji", "What is Theta",
    "Give AI Target & SL for RELIANCE", "AI Risk Score for NIFTY",
    "AI Intraday Setup for BANKNIFTY", "AI Swing Setup for TCS",
    "AI Market Summary today", "AI Breakout Probability for ICICIBANK"
  ];

  useEffect(function() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send(q) {
    if (!q.trim() || loading) return;
    var nm = msgs.concat([{ role: "user", text: q, time: nowT() }]);
    setMsgs(nm); setInput(""); setLoading(true);
    var loc = localAI(q, AI_KB, CANDLE_PATTERNS);
    if (loc) { setMsgs(nm.concat([{ role: "ai", text: loc, time: nowT() }]).slice(-20)); setLoading(false); return; }
    function finish(txt) { setMsgs(nm.concat([{ role: "ai", text: txt, time: nowT() }]).slice(-20)); setLoading(false); }
    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful Indian stock market assistant for Breakout Pro app. Give clear, educational answers about trading, charts, indicators, and market concepts. Keep answers concise and in simple English. Do not give direct buy/sell advice. Educational only." },
          { role: "user", content: q }
        ],
        max_tokens: 800
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d && d.ok && d.text) { finish(d.text); }
      else { finish("AI is temporarily unavailable. Please try again later."); }
    })
    .catch(function() { finish("Connection error. Please check your internet."); })
  }

  return (
    <div style={{ background: "#0B0B0B", minHeight: "100%", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "11px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Breakout Pro AI</div>
        <div style={{ fontSize: 8, color: loading ? "#F59E0B" : G }}>{loading ? "Thinking..." : "Groq Llama 3.3 - Ready"}</div>
      </div>
      <div style={{ background: "#0F0A00", borderBottom: "1px solid #2A1E00", padding: "5px 14px" }}>
        <span style={{ fontSize: 7.5, color: "#92694A", fontWeight: 600 }}>! Educational Only | Not SEBI Registered Investment Advice</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {msgs.length == 0
          ? <div style={{ textAlign: "center", paddingTop: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: G, marginBottom: 10 }}>BP AI</div>
              <div style={{ fontSize: 11, color: "#fff", marginBottom: 4 }}>Ask me about stock market education</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
                {chips.map(function(q) { return <button key={q} onClick={function() { send(q); }} style={{ background: "#161616", border: "1px solid #222", borderRadius: 10, padding: "9px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 8, color: "#ccc" }}>{q}</button>; })}
              </div>
            </div>
          : null
        }
        {msgs.map(function(m, i) {
          var isu = m.role == "user";
          return (
            <div key={i} style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: isu ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "88%", background: isu ? "#1E3A5F" : "#161616", border: isu ? "1px solid #1E4080" : "1px solid #222", borderRadius: isu ? "14px 14px 4px 14px" : "4px 14px 14px 14px", padding: "10px 13px" }}>
                <div style={{ fontSize: 11, color: "#e8e8e8", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{m.text}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginTop: 3, textAlign: "right" }}>{m.time}</div>
              </div>
            </div>
          );
        })}
        {loading ? <div style={{ display: "flex", marginBottom: 12 }}><div style={{ background: "#161616", border: "1px solid #222", borderRadius: "4px 14px 14px 14px", padding: "12px 16px" }}><div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(function(i) { return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: theme.c.blue, opacity: 0.8 }}></div>; })}</div></div></div> : null}
        <div ref={endRef}></div>
      </div>
      <div style={{ borderTop: "1px solid #1A1A1A", padding: "8px 12px 12px", background: "#0F0F0F" }}>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 8, paddingBottom: 2 }}>
          {chips.map(function(q) { return <button key={q} disabled={loading} onClick={function() { send(q); }} style={{ background: "#161616", border: "1px solid #222", borderRadius: 20, padding: "4px 10px", color: loading ? "#333" : theme.c.blue, fontSize: 8, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit", fontWeight: 600 }}>{q}</button>; })}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={function(e) { if (e.key == "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ask about any market concept..." rows={1} disabled={loading} style={{ flex: 1, background: "#161616", border: "1px solid #222", borderRadius: 11, padding: "10px 12px", color: "#fff", fontSize: 11, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 80, overflowY: "auto", opacity: loading ? 0.6 : 1 }} />
          <button onClick={function() { send(input); }} disabled={!input.trim() || loading} style={{ background: (!input.trim() || loading) ? "#1A1A1A" : "linear-gradient(135deg,#3B82F6,#1D4ED8)", border: "none", borderRadius: 11, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: (!input.trim() || loading) ? "not-allowed" : "pointer", fontSize: 14, color: "#fff", flexShrink: 0 }}>&#10148;</button>
        </div>
      </div>
    </div>
  );
}

