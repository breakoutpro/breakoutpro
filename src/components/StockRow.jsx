import { G, R, fN, getSpark } from "../utils/helpers";
import Spark from "./Spark";

export default function StockRow({ s, onClick }) {
  var spark = getSpark(s.ltp);
  var up = s.up;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #F5F5F5", cursor: "pointer" }} onClick={onClick}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{s.sym}</div>
        <div style={{ fontSize: 8, color: "#9CA3AF", marginTop: 2 }}>{s.sect}</div>
      </div>
      <Spark data={spark} color={up ? G : R} w={50} h={22} />
      <div style={{ textAlign: "right", minWidth: 80 }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#111827" }}>Rs{fN(s.ltp)}</div>
        <div style={{ background: up ? "#DCFCE7" : "#FEE2E2", borderRadius: 6, padding: "2px 6px", fontSize: 8, fontWeight: 700, color: up ? "#166534" : "#991B1B" }}>
          {up ? "+" : ""}{s.chgPct.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
