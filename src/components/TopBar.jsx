import { G, getMkt } from "../utils/helpers";

export default function TopBar({ isPrem, trialDays, onMenu, onSub }) {
  var mkt = getMkt();
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,200,83,0.3)" }}>
          <span style={{ fontFamily: "Arial", fontSize: 12, fontWeight: 900, color: "#fff" }}>BP</span>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827", letterSpacing: -0.5 }}>Breakout<span style={{ color: G }}> Pro</span></div>
          <div style={{ fontSize: 6, color: "#F97316", fontWeight: 800, letterSpacing: 1.5 }}>CATCH EVERY BREAKOUT</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ background: mkt.open ? "#DCFCE7" : "#F3F4F6", border: "1px solid " + (mkt.open ? "#BBF7D0" : "#E5E7EB"), borderRadius: 20, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: mkt.open ? G : "#9CA3AF" }}></div>
          <span style={{ fontSize: 7, fontWeight: 700, color: mkt.open ? "#166534" : "#6B7280" }}>{mkt.label}</span>
        </div>
        {isPrem
          ? <span style={{ background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A", borderRadius: 20, padding: "3px 8px", fontSize: 8, fontWeight: 700 }}>PRO</span>
          : <button onClick={onSub} style={{ background: "#FFF7ED", color: "#F97316", border: "1px solid #FED7AA", borderRadius: 20, padding: "3px 8px", fontSize: 7, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{trialDays}d Free</button>
        }
        <button onClick={onMenu} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#374151" }}>&#9776;</button>
      </div>
    </div>
  );
}
