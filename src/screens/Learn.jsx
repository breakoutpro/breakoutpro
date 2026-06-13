import { useState } from "react";
import { G, DISCLAIMER } from "../utils/helpers";
import { CANDLE_PATTERNS, LESSONS } from "../data/globals";

export default function LearnScreen() {
  var [sec, setSec] = useState("home");
  var pg = { background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 };

  if (sec == "candles") return (
    <div style={pg}>
      <div style={{ background: "#fff", padding: "12px 14px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={function() { setSec("home"); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#374151" }}>&#8592;</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Candlestick Patterns</div>
      </div>
      <div style={{ padding: 14 }}>
        {CANDLE_PATTERNS.map(function(p) {
          var up = p.type == "Bullish"; var neu = p.type == "Neutral";
          return (
            <div key={p.name} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
              <div style={{ background: up ? "#DCFCE7" : neu ? "#FEF3C7" : "#FEE2E2", color: up ? "#166534" : neu ? "#D97706" : "#991B1B", borderRadius: 6, padding: "2px 8px", fontSize: 8, fontWeight: 700, display: "inline-block", marginBottom: 6 }}>{p.type}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: "#6B7280", lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  var topics = [
    { id: "candles", title: "Candlestick Patterns", sub: "50+ patterns", bg: "#FFF7ED", bd: "#FED7AA" },
    { id: "oi", title: "OI and Options", sub: "PCR, Max Pain, Greeks", bg: "#F0FDF4", bd: "#BBF7D0" },
    { id: "strategy", title: "Trading Strategies", sub: "EMA, VWAP, Breakout", bg: "#EFF6FF", bd: "#BFDBFE" },
    { id: "risk", title: "Risk Management", sub: "Position size, Stop loss", bg: "#FFF1F2", bd: "#FECDD3" },
  ];
  return (
    <div style={pg}>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Learn Trading</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {topics.map(function(t) {
            return <div key={t.id} style={{ background: t.bg, border: "1px solid " + t.bd, borderRadius: 14, padding: "14px", cursor: "pointer" }} onClick={function() { setSec(t.id); }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 3 }}>{t.title}</div>
              <div style={{ fontSize: 8, color: "#6B7280" }}>{t.sub}</div>
            </div>;
          })}
        </div>
        <div style={{ background: "linear-gradient(135deg,#111827,#1F2937)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 10, color: G, fontWeight: 700, marginBottom: 6 }}>Today's Lesson</div>
          <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.7 }}>{LESSONS[new Date().getDay() % LESSONS.length]}</div>
        </div>
      </div>
    </div>
  );
}

