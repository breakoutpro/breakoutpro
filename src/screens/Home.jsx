import { useState } from "react";
import { G, R, DISCLAIMER } from "../utils/helpers";
import { SECTORS } from "../data/stocks";
import IndexCard from "../components/IndexCard";
import StockRow from "../components/StockRow";

export default function HomeScreen({ nifty, sensex, bankNifty, midcap, stocks, news, briefing, briefingLoading, onBriefing, user, setTab, glTab, setGlTab }) {
  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  var uname = user ? user.name.split(" ")[0] : "Trader";
  var indices = [
    { label: "NIFTY 50", ltp: nifty.ltp, pct: nifty.pct, up: nifty.up },
    { label: "SENSEX", ltp: sensex.ltp, pct: sensex.pct, up: sensex.up },
    { label: "BANK NIFTY", ltp: bankNifty.ltp, pct: bankNifty.pct, up: bankNifty.up },
    { label: "MIDCAP", ltp: midcap.ltp, pct: midcap.pct, up: midcap.up },
  ];
  var quick = [
    { label: "OI Chain", tab: "oi" }, { label: "Scanner", tab: "scanner" },
    { label: "FII/DII", tab: "fiidii" }, { label: "News", tab: "news" },
    { label: "Learn", tab: "learn" }, { label: "AI Chat", tab: "ai" },
    { label: "Tools", tab: "tools" }, { label: "Watchlist", tab: "watchlist" },
  ];
  var sorted = (stocks || []).slice().sort(function(a, b) {
    return glTab === "gainers" ? b.chgPct - a.chgPct : a.chgPct - b.chgPct;
  }).slice(0, 4);

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "12px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff" }}>{uname[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{greeting}</div>
            <div style={{ fontSize: 16, color: "#111827", fontWeight: 800 }}>{uname}</div>
          </div>
        </div>
        <button style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }} onClick={function() { setTab("news"); }}>&#128276;</button>
      </div>

      <div style={{ padding: "14px 14px 0" }}>
        {/* AI Briefing */}
        <div style={{ background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", border: "1px solid #BBF7D0", borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900 }}>AI</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>AI Market Briefing</div>
                <div style={{ fontSize: 8, color: "#6B7280" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</div>
              </div>
            </div>
            <button onClick={onBriefing} style={{ background: briefing ? "transparent" : G, border: briefing ? "1px solid #BBF7D0" : "none", borderRadius: 20, padding: "6px 14px", color: briefing ? "#166534" : "#fff", fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {briefingLoading ? "Loading..." : briefing ? "Refresh" : "Get Briefing"}
            </button>
          </div>
          {briefingLoading
            ? <div style={{ padding: "12px 0", textAlign: "center", fontSize: 10, color: "#374151" }}>AI analyzing markets...</div>
            : briefing
              ? <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 10, padding: 10, fontSize: 10, color: "#374151", lineHeight: 1.7 }}>{briefing}</div>
              : <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>Your Daily Market Briefing</div>
                  <div style={{ fontSize: 9, color: "#6B7280", marginTop: 3 }}>Tap Get Briefing for AI analysis</div>
                </div>
          }
        </div>

        {/* Index Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {indices.map(function(d) { return <IndexCard key={d.label} d={d} onClick={function() { setTab("markets"); }} />; })}
        </div>

        {/* Quick Access */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {quick.map(function(q) {
              return (
                <button key={q.label} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setTab(q.tab); }}>
                  <span style={{ fontSize: 8, color: "#374151", fontWeight: 600, textAlign: "center" }}>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gainers/Losers */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 20, padding: 3 }}>
              {["gainers", "losers"].map(function(t) {
                var act = glTab === t;
                return <button key={t} style={{ background: act ? "#fff" : "transparent", border: "none", borderRadius: 17, padding: "5px 12px", color: act ? "#111827" : "#6B7280", fontSize: 9, fontWeight: act ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setGlTab(t); }}>{t === "gainers" ? "Gainers" : "Losers"}</button>;
              })}
            </div>
            <button style={{ background: "none", border: "none", color: G, fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setTab("markets"); }}>View All</button>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
            {sorted.map(function(s) { return <StockRow key={s.sym} s={s} onClick={function() { setTab("markets"); }} />; })}
          </div>
        </div>

        {/* Sectors */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Sectors</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {SECTORS.map(function(s) {
              var up = s.chg >= 0;
              return (
                <div key={s.name} style={{ background: up ? "#F0FDF4" : "#FFF1F2", border: "1px solid " + (up ? "#BBF7D0" : "#FECDD3"), borderRadius: 10, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{s.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: up ? G : R, marginTop: 2 }}>{up ? "+" : ""}{s.chg.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* News */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>News</span>
            <button style={{ background: "none", border: "none", color: G, fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setTab("news"); }}>View All</button>
          </div>
          {(news || []).slice(0, 3).map(function(n, i) {
            return (
              <div key={i} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "11px 13px", marginBottom: 6, display: "flex", gap: 10 }}>
                <div style={{ background: n.up ? "#DCFCE7" : "#F3F4F6", borderRadius: 7, padding: "3px 7px", height: "fit-content", flexShrink: 0 }}>
                  <span style={{ fontSize: 7, fontWeight: 700, color: n.up ? "#166534" : "#6B7280" }}>{n.cat.slice(0, 4)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#111827", lineHeight: 1.4, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 8, color: "#9CA3AF" }}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "9px 12px", marginBottom: 6 }}>
          <div style={{ fontSize: 7.5, color: "#92400E" }}>! {DISCLAIMER}</div>
        </div>
      </div>
    </div>
  );
}
