import { loadObservation, getAssetCard, getMarketStatus } from "./GuardianData";

// BreakoutPro - HomeGuardianCard.jsx
// Compact AI Market Guardian hero for Home. Watching / Uptrend / Downtrend / Mood.
// Educational only. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#4F8CFF",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function HomeGuardianCard(props){
  var setTab=props.setTab||function(){};
  var watch=loadObservation();
  var sample=watch.length?watch:[{sym:"NIFTY 50",type:"Index"},{sym:"RELIANCE",type:"Stock"},{sym:"SBIN",type:"Stock"},{sym:"TATASTEEL",type:"Stock"}];
  var upN=0,downN=0;
  sample.forEach(function(a){ if(getAssetCard(a).up)upN++; else downN++; });
  var MKT=getMarketStatus();

  return (
    <div style={{padding:"0 14px",marginTop:22}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
          <span style={{fontSize:15,fontWeight:900,color:T1}}>AI Market Guardian</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:7,fontWeight:800,color:UP,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",padding:"2px 6px",borderRadius:4}}><span style={{width:4,height:4,borderRadius:"50%",background:UP,display:"inline-block"}}></span>LIVE</span>
        </div>
        <button onClick={function(){setTab("guardian");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Open &#8594;</button>
      </div>

      <div onClick={function(){setTab("guardian");}} style={{background:"linear-gradient(135deg,rgba(79,140,255,0.08),rgba(96,165,250,0.02))",border:"1px solid rgba(79,140,255,0.22)",borderRadius:14,padding:14,cursor:"pointer"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:9,marginBottom:12}}>
          <Tile k="Watching" v={sample.length} sub="assets"/>
          <Tile k="Uptrend" v={upN} sub="assets" tone="up"/>
          <Tile k="Downtrend" v={downN} sub="assets" tone="down"/>
          <Tile k="Mood" v={MKT.mood} sub="market" tone="up" small={true}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:11,borderTop:"1px solid "+BD2}}>
          <span style={{fontSize:9.5,color:T2}}>Organizing your watchlist by observed structure</span>
          <span style={{fontSize:11,fontWeight:800,color:BLUE}}>Open Dashboard &#8594;</span>
        </div>
      </div>
    </div>
  );
}

function Tile(props){
  var col=props.tone=="up"?UP:props.tone=="down"?DOWN:T1;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"9px 4px",textAlign:"center"}}>
      <div style={{fontSize:props.small?11:16,fontWeight:900,color:col}}>{props.v}</div>
      <div style={{fontSize:7,color:T2,marginTop:1}}>{props.k}</div>
      <div style={{fontSize:6.5,color:T3}}>{props.sub}</div>
    </div>
  );
}
