import { G, R } from "../utils/helpers";

export default function IndexCard({ d, onClick }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: "12px 14px", cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }} onClick={onClick}>
      <div style={{ fontSize: 8, color: "#6B7280", fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
      <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 3 }}>
        {d.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: 9, color: d.up ? G : R }}>{d.up ? "^" : "v"}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: d.up ? G : R }}>{d.up ? "+" : ""}{d.pct.toFixed(2)}%</span>
      </div>
    </div>
  );
}
