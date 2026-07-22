import { INDEX_DETAIL, VIX_DETAIL, FLOW_DETAIL } from "./MarketsTopData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - MarketsTopDetail.jsx
// Detail pages for index constituents, India VIX, FII/DII flow.
// Pure black, green/red only for direction. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function Shell(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BG = theme.c.bg, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>{props.title}</div>
          {props.sub?<div style={{fontSize:12,color:T2}}>{props.sub}</div>:null}
        </div>
        {props.val?(
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:16,fontWeight:900,fontFamily:"monospace",color:props.up?UP:DOWN}}>{props.val}</div>
            <div style={{fontSize:12,fontWeight:700,color:props.up?UP:DOWN}}>{props.chg}</div>
          </div>
        ):null}
      </div>
      <div style={{padding:"16px"}}>{props.children}</div>
    </div>
  );
}
function H(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2;
return <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.6,margin:"16px 0 9px"}}>{props.children}</div>;}

export function IndexDetailPage(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var d=INDEX_DETAIL[props.idxKey];
  if(!d) return <Shell title="Index" onBack={props.onBack}><div style={{color:T2,fontSize:12}}>No data.</div></Shell>;
  return (
    <Shell title={d.title} sub="Index" val={d.val} chg={d.chg} up={d.up} onBack={props.onBack}>
      <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:8}}>WHAT IS THIS INDEX</div>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
        <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{d.about}</div>
      </div>
      {d.stocks.length>0?(
        <div>
          <H>TOP STOCKS IN THIS INDEX</H>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
            <div style={{display:"flex",fontSize:12,color:T3,fontWeight:700,padding:"8px 12px",borderBottom:"1px solid "+BD}}>
              <span style={{flex:1}}>STOCK</span><span style={{width:60,textAlign:"right"}}>WEIGHT</span><span style={{width:64,textAlign:"right"}}>CHANGE</span>
            </div>
            {d.stocks.map(function(s,i){
              return (
                <div key={i} onClick={function(){if(props.onStock)props.onStock(s);}} style={{display:"flex",alignItems:"center",padding:"12px 12px",borderBottom:i<d.stocks.length-1?"1px solid "+BD:"none",cursor:"pointer"}}>
                  <span style={{flex:1,fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                  <span style={{width:60,textAlign:"right",fontSize:12,color:T2,fontFamily:"monospace"}}>{s.w}</span>
                  <span style={{width:64,textAlign:"right",fontSize:12,fontWeight:700,color:s.up?UP:DOWN}}>{s.chg}</span>
                </div>
              );
            })}
          </div>
        </div>
      ):null}
      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
        <div style={{fontSize:12,color:theme.c.warn}}>Educational only. Weights are indicative. Not investment advice.</div>
      </div>
    </Shell>
  );
}

export function VIXDetailPage(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, BLUE = theme.c.gold, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var d=VIX_DETAIL;
  function toneColor(t){return t=="calm"?BLUE:t=="normal"?UP:t=="warn"?BLUE:DOWN;}
  return (
    <Shell title="India VIX" sub="Volatility Index" val={d.val} chg={d.chg} up={d.up} onBack={props.onBack}>
      <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:8}}>WHAT IS INDIA VIX</div>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
        <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{d.what}</div>
      </div>

      <H>HOW TO READ VIX</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
        {d.reading.map(function(r,i){
          return (
            <div key={i} style={{padding:"12px 12px",borderBottom:i<d.reading.length-1?"1px solid "+BD:"none"}}>
              <div style={{fontSize:12,fontWeight:800,color:toneColor(r.tone),marginBottom:4}}>{r.range}</div>
              <div style={{fontSize:12,color:T2,lineHeight:1.5}}>{r.mean}</div>
            </div>
          );
        })}
      </div>

      <H>HOW TRADERS USE IT DAILY</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
        {d.howto.map(function(h,i){
          return <div key={i} style={{fontSize:12,color:T1,lineHeight:1.5,padding:"4px 0",borderBottom:i<d.howto.length-1?"1px solid "+BD:"none"}}>&#8226;  {h}</div>;
        })}
      </div>

      <H>VIX HISTORY (FEAR SPIKES)</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
        {d.history.map(function(h,i){
          return (
            <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 12px",borderBottom:i<d.history.length-1?"1px solid "+BD:"none"}}>
              <span style={{width:70,fontSize:12,color:T2}}>{h.date}</span>
              <span style={{width:54,fontSize:14,fontWeight:800,color:T1,fontFamily:"monospace"}}>{h.val}</span>
              <span style={{flex:1,fontSize:12,color:T3,textAlign:"right"}}>{h.note}</span>
            </div>
          );
        })}
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
        <div style={{fontSize:12,color:theme.c.warn}}>Educational only. Not investment advice.</div>
      </div>
    </Shell>
  );
}

export function FlowDetailPage(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var f=FLOW_DETAIL;
  function Block(props2){
    var grp=props2.grp;
    return (
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:800,color:T1}}>{props2.label}</div>
          <div style={{fontSize:16,fontWeight:900,color:grp.up?UP:DOWN,fontFamily:"monospace"}}>{grp.net} Cr</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
            <div style={{fontSize:12,color:UP,fontWeight:800,marginBottom:8}}>MOST BOUGHT</div>
            {grp.bought.map(function(x,i){
              return (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                  <span style={{fontSize:12,color:T1}}>{x.sym}</span>
                  <span style={{fontSize:12,color:UP,fontWeight:700}}>{x.val}</span>
                </div>
              );
            })}
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
            <div style={{fontSize:12,color:DOWN,fontWeight:800,marginBottom:8}}>MOST SOLD</div>
            {grp.sold.map(function(x,i){
              return (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                  <span style={{fontSize:12,color:T1}}>{x.sym}</span>
                  <span style={{fontSize:12,color:DOWN,fontWeight:700}}>{x.val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <Shell title="FII / DII Activity" sub="Institutional Flow" onBack={props.onBack}>
      <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:8}}>FII (FOREIGN INSTITUTIONS)</div>
      <Block label="FII Net" grp={f.fii}/>
      <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.6,margin:"16px 0 9px"}}>DII (DOMESTIC INSTITUTIONS)</div>
      <Block label="DII Net" grp={f.dii}/>

      <H>SECTOR ROTATION</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
        {f.sectorRotation.map(function(s,i){
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 12px",borderBottom:i<f.sectorRotation.length-1?"1px solid "+BD:"none"}}>
              <span style={{fontSize:12,color:T1,fontWeight:600}}>{s.sector}</span>
              <span style={{fontSize:12,fontWeight:700,color:s.up?UP:DOWN}}>{s.flow}</span>
            </div>
          );
        })}
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
        <div style={{fontSize:12,color:theme.c.warn}}>Educational only. Figures are indicative. Not investment advice.</div>
      </div>
    </Shell>
  );
}
