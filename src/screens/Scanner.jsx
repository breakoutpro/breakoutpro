import { useState, useEffect } from "react";
import { G } from "../utils/helpers";
import StockRow from "../components/StockRow";

export default function ScannerScreen({ stocks }) {
  var [active, setActive] = useState("breakout");
  var [results, setResults] = useState([]);
  var scans = [
    { id: "breakout", label: "Breakout" }, { id: "breakdown", label: "Breakdown" },
    { id: "volume", label: "Volume" }, { id: "gapup", label: "Gap Up" }, { id: "gapdown", label: "Gap Down" },
  ];
  function runScan(type) {
    setActive(type);
    setResults((stocks || []).filter(function(s) {
      if (type === "breakout") return s.up && s.chgPct > 1.5;
      if (type === "breakdown") return !s.up && s.chgPct < -1.5;
      if (type === "volume") return true;
      if (type === "gapup") return s.up && s.chgPct > 1;
      if (type === "gapdown") return !s.up && s.chgPct < -1;
      return s.up;
    }));
  }
  useEffect(function() { runScan("breakout"); }, []);
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 14px", background: "#fff", borderBottom: "1px solid #F0F0F0" }}>
        {scans.map(function(sc) {
          var act = active === sc.id;
          return <button key={sc.id} style={{ background: act ? G : "#F3F4F6", border: "none", borderRadius: 20, padding: "6px 14px", color: act ? "#fff" : "#374151", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={function() { runScan(sc.id); }}>{sc.label}</button>;
        })}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 8 }}>{results.length} stocks found</div>
        {results.length === 0
          ? <div style={{ textAlign: "center", padding: "30px 0", color: "#9CA3AF", fontSize: 12 }}>No results</div>
          : <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
              {results.map(function(s) { return <StockRow key={s.sym} s={s} onClick={function() {}} />; })}
            </div>
        }
      </div>
    </div>
  );
}
