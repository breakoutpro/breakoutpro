import { useState } from "react";
import { G } from "../utils/helpers";
import StockRow from "../components/StockRow";

export default function MarketsScreen({ stocks }) {
  var [search, setSearch] = useState("");
  var [sort, setSort] = useState("pct");
  var filtered = (stocks || []).filter(function(s) {
    return !search || s.sym.toLowerCase().indexOf(search.toLowerCase()) !== -1;
  }).sort(function(a, b) {
    return sort === "pct" ? b.chgPct - a.chgPct : b.ltp - a.ltp;
  });
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "12px 14px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
          <span>&#128269;</span>
          <input style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 12, color: "#111827", fontFamily: "inherit" }} placeholder="Search stocks..." value={search} onChange={function(e) { setSearch(e.target.value); }} />
          {search ? <button onClick={function() { setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>X</button> : null}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["pct", "ltp"].map(function(s) {
            var act = sort === s;
            return <button key={s} style={{ background: act ? G : "#F3F4F6", border: "none", borderRadius: 20, padding: "4px 12px", color: act ? "#fff" : "#374151", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setSort(s); }}>{s === "pct" ? "% Change" : "Price"}</button>;
          })}
        </div>
      </div>
      <div style={{ background: "#fff", margin: "10px 14px", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
        {filtered.map(function(s) { return <StockRow key={s.sym} s={s} onClick={function() {}} />; })}
      </div>
    </div>
  );
}
