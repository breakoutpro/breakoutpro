export default function NewsScreen({ news }) {
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80, padding: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 14 }}>Market News</div>
      {(news || []).map(function(n, i) {
        return (
          <div key={i} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "14px", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ background: n.up ? "#DCFCE7" : "#FEE2E2", display: "inline-block", borderRadius: 6, padding: "2px 8px", fontSize: 8, fontWeight: 700, color: n.up ? "#166534" : "#991B1B", marginBottom: 8 }}>{n.cat}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", lineHeight: 1.5, marginBottom: 6 }}>{n.title}</div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{n.time}</div>
          </div>
        );
      })}
    </div>
  );
}
