import { G, getMkt } from "../utils/helpers";

export default function TopBar(props) {
  var isPrem = props.isPrem;
  var trialDays = props.trialDays;
  var onMenu = props.onMenu;
  var onSub = props.onSub;
  var mkt = getMkt();

  return (
    <div style={{background:"#0F1629",borderBottom:"1px solid #1E2D4A",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,200,83,0.4)"}}>
          <span style={{fontFamily:"Arial",fontSize:12,fontWeight:900,color:"#fff"}}>BP</span>
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:900,color:"#FFFFFF",letterSpacing:-0.5}}>Breakout<span style={{color:"#00C853"}}> Pro</span></div>
          <div style={{fontSize:6,color:"#F97316",fontWeight:800,letterSpacing:1.5}}>CATCH EVERY BREAKOUT</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <div style={{background:mkt.open?"rgba(0,200,83,0.15)":"rgba(30,144,255,0.1)",border:"1px solid "+(mkt.open?"rgba(0,200,83,0.3)":"rgba(30,144,255,0.2)"),borderRadius:20,padding:"3px 8px",display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:mkt.open?"#00E676":"#1E90FF"}}></div>
          <span style={{fontSize:7,fontWeight:700,color:mkt.open?"#00E676":"#8899BB"}}>{mkt.label}</span>
        </div>
        {isPrem
          ? <span style={{background:"rgba(245,158,11,0.15)",color:"#F59E0B",border:"1px solid rgba(245,158,11,0.3)",borderRadius:20,padding:"3px 8px",fontSize:8,fontWeight:700}}>PRO</span>
          : <button onClick={onSub} style={{background:"rgba(249,115,22,0.1)",color:"#F97316",border:"1px solid rgba(249,115,22,0.2)",borderRadius:20,padding:"3px 8px",fontSize:7,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{trialDays}d Free</button>
        }
        <button onClick={onMenu} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #1E2D4A",borderRadius:9,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"#FFFFFF"}}>&#9776;</button>
      </div>
    </div>
  );
}
