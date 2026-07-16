import { MiniChart } from "./HomeData";

var BG="#050505",CARD="#101318",T1="#FFFFFF",T3="#5B6472";
var UP="#22C55E",DOWN="#EF4444";

var ANALYSIS={
  "GOLD":"Gold bullish above Rs 71,500. Watch US Fed for direction.",
  "SILVER":"Silver consolidating. Breakout above Rs 88,000 targets Rs 92,000.",
  "CRUDE":"Crude weak below Rs 6,850. Support at Rs 6,650.",
  "CRUDEOIL":"Crude weak below Rs 6,850. Support at Rs 6,650.",
  "NATURALGAS":"Natural Gas sideways. Breakout above Rs 260 for bullish move.",
};

export default function CommodityDetail(props){
  var c=props.comm||{};
  var onBack=props.onBack||function(){};
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80,color:T1}}>
      <div style={{background:CARD,padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>{c.sym}</div>
          <div style={{fontSize:9,color:"#F59E0B"}}>{c.unit||"MCX"}</div>
        </div>
      </div>
      <div style={{padding:"16px"}}>
        <div style={{background:CARD,border:"1px solid rgba(245,158,11,0.2)",borderRadius:18,padding:"18px",marginBottom:14}}>
          <div style={{fontFamily:"monospace",fontSize:28,fontWeight:900,color:T1,marginBottom:6}}>Rs {c.ltp&&c.ltp.toLocaleString("en-IN")}</div>
          <div style={{fontSize:13,fontWeight:700,color:c.up?UP:DOWN,marginBottom:16}}>{c.up?"+":""}{c.pct&&c.pct.toFixed(2)}%</div>
          {c.spark&&<MiniChart d={c.spark} col={c.color||"#F59E0B"} w={300} h={70}/>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[["Day High","Rs "+(c.ltp?(c.ltp*1.012).toFixed(0):"--")],["Day Low","Rs "+(c.ltp?(c.ltp*0.988).toFixed(0):"--")],["Volume","1.2L lots"],["Open Int.","87,420 lots"]].map(function(r){
            return(
              <div key={r[0]} style={{background:CARD,border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px"}}>
                <div style={{fontSize:9,color:T3,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:13,fontWeight:700,color:T1}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:14,padding:"14px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#F59E0B",marginBottom:6}}>AI Analysis</div>
          <div style={{fontSize:11,color:T1,lineHeight:1.6}}>{ANALYSIS[c.sym]||"Monitoring "+c.sym+" for key signals."}</div>
        </div>
      </div>
    </div>
  );
}
