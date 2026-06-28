import { alertType, getAlertEdu, getAlertFeed, loadObservation } from "./GuardianData";

// BreakoutPro - HomeGuardianCard.jsx
// Compact AI Market Guardian preview for Home. Shows latest alerts + View All.
// Educational only. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function HomeGuardianCard(props){
  var setTab=props.setTab||function(){};
  var watch=loadObservation();
  // sample assets if user has none yet, so the preview is never empty
  var sample=watch.length?watch:[{sym:"NIFTY 50",type:"Index"},{sym:"RELIANCE",type:"Stock"},{sym:"SBIN",type:"Stock"}];
  var feed=getAlertFeed(sample).slice(0,3);

  return (
    <div style={{padding:"0 14px",marginTop:22}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
          <span style={{fontSize:15,fontWeight:900,color:T1}}>AI Market Guardian</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:7,fontWeight:800,color:UP,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",padding:"2px 6px",borderRadius:4}}><span style={{width:4,height:4,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE</span>
        </div>
        <button onClick={function(){setTab("guardian");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
      </div>

      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,overflow:"hidden"}}>
        {feed.map(function(f,i){
          var t=alertType(f.type);
          return (
            <div key={i} onClick={function(){setTab("guardian");}} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 13px",borderBottom:i<feed.length-1?"1px solid "+BD2:"none",cursor:"pointer"}}>
              <div style={{width:34,height:34,background:CARD2,border:"1px solid "+BD2,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:15}} dangerouslySetInnerHTML={{__html:t.ic}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11.5,fontWeight:800,color:T1}}>{f.sym}</span>
                  <span style={{fontSize:8.5,color:CYAN,fontWeight:700}}>{t.name}</span>
                </div>
                <div style={{fontSize:8.5,color:T2,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{getAlertEdu(f.type).what}</div>
              </div>
              <span style={{fontSize:7.5,color:T3,flexShrink:0}}>{f.time}</span>
            </div>
          );
        })}
        <button onClick={function(){setTab("guardian");}} style={{width:"100%",background:CARD2,border:"none",borderTop:"1px solid "+BD2,padding:"11px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Open AI Market Guardian &#8594;</button>
      </div>
    </div>
  );
}
