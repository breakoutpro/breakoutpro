import { TAGLINE, INDEX_CARDS, MOOD, FIIDII, GLOBAL } from "./MarketsTopData";

// BreakoutPro - MarketsTop.jsx
// Premium market intelligence header. Pure black, green/red only for direction.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function Head(props){
  return <div style={{fontSize:10.5,color:T2,fontWeight:800,letterSpacing:0.6,margin:"0 0 9px"}}>{props.children}</div>;
}

export default function MarketsTop(props){
  var setTab=props.setTab||function(){};
  return (
    <div style={{padding:"4px 14px 0"}}>

      {/* TAGLINE */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:900,color:T1}} dangerouslySetInnerHTML={{__html:TAGLINE.main}}/>
        <div style={{fontSize:9.5,color:T3,fontWeight:600,marginTop:2}} dangerouslySetInnerHTML={{__html:TAGLINE.sub}}/>
      </div>

      {/* INDEX CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {INDEX_CARDS.map(function(x){
          return (
            <div key={x.name} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"11px 12px"}}>
              <div style={{fontSize:9,color:T2,fontWeight:600,marginBottom:4}}>{x.name}</div>
              <div style={{fontSize:16,fontWeight:800,color:T1,fontFamily:"monospace"}}>{x.val}</div>
              <div style={{fontSize:10,fontWeight:700,color:x.up?UP:DOWN,marginTop:2}}>{x.chg}</div>
            </div>
          );
        })}
      </div>

      {/* MARKET MOOD + FEAR GREED */}
      <Head>MARKET SENTIMENT</Head>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,textAlign:"center"}}>
          <div style={{fontSize:9,color:T2,marginBottom:5}}>Market Mood</div>
          <div style={{fontSize:17,fontWeight:900,color:MOOD.label=="Bullish"?UP:MOOD.label=="Bearish"?DOWN:GOLD}}>{MOOD.label}</div>
          <div style={{fontSize:9,color:T3,marginTop:3}}>Score {MOOD.score}/100</div>
        </div>
        <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,textAlign:"center"}}>
          <div style={{fontSize:9,color:T2,marginBottom:5}}>Fear &amp; Greed</div>
          <div style={{fontSize:17,fontWeight:900,color:MOOD.fg>=55?UP:MOOD.fg<=45?DOWN:GOLD}}>{MOOD.fg}</div>
          <div style={{fontSize:9,color:T3,marginTop:3}}>{MOOD.fgLabel}</div>
        </div>
      </div>

      {/* FII / DII */}
      <Head>INSTITUTIONAL FLOW  &#8226;  FII / DII</Head>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:16}}>
        {FIIDII.map(function(x,i){
          return (
            <div key={x.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",borderBottom:i<FIIDII.length-1?"1px solid "+BD:"none"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:T1}}>{x.name}</div>
                <div style={{fontSize:8.5,color:T3,marginTop:1}}>{x.note}</div>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:x.up?UP:DOWN,fontFamily:"monospace"}}>{x.val}</div>
            </div>
          );
        })}
      </div>

      {/* GLOBAL MARKETS */}
      <Head>GLOBAL MARKETS</Head>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:8}}>
        {GLOBAL.map(function(x){
          return (
            <div key={x.name} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:"9px 11px",minWidth:96,flexShrink:0}}>
              <div style={{fontSize:9,color:T2,marginBottom:3}}>{x.name}</div>
              <div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace"}}>{x.val}</div>
              <div style={{fontSize:9.5,fontWeight:700,color:x.up?UP:DOWN,marginTop:1}}>{x.chg}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
