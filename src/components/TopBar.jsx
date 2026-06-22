export default function TopBar(props){
  return (
    <div style={{
      background:"#050505",
      borderBottom:"1px solid rgba(255,255,255,0.07)",
      padding:"14px 18px",
      display:"flex",alignItems:"center",gap:10,
    }}>
      <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#1E3A8A,#1D4ED8)",border:"1px solid rgba(77,166,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:12,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>BP</span>
      </div>
      <div style={{fontSize:16,fontWeight:800,letterSpacing:-0.2}}>
        <span style={{color:"#FFFFFF"}}>Breakout</span><span style={{color:"#4DA6FF"}}>Pro</span>
      </div>
    </div>
  );
}
