import { INDEX_DETAIL, VIX_DETAIL, FLOW_DETAIL } from "./MarketsTopData";

// BreakoutPro - MarketsTopDetail.jsx
// Detail pages for index constituents, India VIX, FII/DII flow.
// Pure black, green/red only for direction. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function Shell(props){
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{props.title}</div>
          {props.sub?<div style={{fontSize:9,color:T2}}>{props.sub}</div>:null}
        </div>
        {props.val?(
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:16,fontWeight:900,fontFamily:"monospace",color:props.up?UP:DOWN}}>{props.val}</div>
            <div style={{fontSize:10,fontWeight:700,color:props.up?UP:DOWN}}>{props.chg}</div>
          </div>
        ):null}
      </div>
      <div style={{padding:"14px"}}>{props.children}</div>
    </div>
  );
}
function H(props){return <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,margin:"16px 0 9px"}}>{props.children}</div>;}

export function IndexDetailPage(props){
  var d=INDEX_DETAIL[props.idxKey];
  if(!d) return <Shell title="Index" onBack={props.onBack}><div style={{color:T2,fontSize:12}}>No data.</div></Shell>;
  return (
    <Shell title={d.title} sub="Index" val={d.val} chg={d.chg} up={d.up} onBack={props.onBack}>
      <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:9}}>WHAT IS THIS INDEX</div>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>
        <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{d.about}</div>
      </div>
      {d.stocks.length>0?(
        <div>
          <H>TOP STOCKS IN THIS INDEX</H>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            <div style={{display:"flex",fontSize:8.5,color:T3,fontWeight:700,padding:"8px 13px",borderBottom:"1px solid "+BD}}>
              <span style={{flex:1}}>STOCK</span><span style={{width:60,textAlign:"right"}}>WEIGHT</span><span style={{width:64,textAlign:"right"}}>CHANGE</span>
            </div>
            {d.stocks.map(function(s,i){
              return (
                <div key={i} onClick={function(){if(props.onStock)props.onStock(s);}} style={{display:"flex",alignItems:"center",padding:"11px 13px",borderBottom:i<d.stocks.length-1?"1px solid "+BD:"none",cursor:"pointer"}}>
                  <span style={{flex:1,fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                  <span style={{width:60,textAlign:"right",fontSize:11,color:T2,fontFamily:"monospace"}}>{s.w}</span>
                  <span style={{width:64,textAlign:"right",fontSize:11,fontWeight:700,color:s.up?UP:DOWN}}>{s.chg}</span>
                </div>
              );
            })}
          </div>
        </div>
      ):null}
      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:16}}>
        <div style={{fontSize:9,color:"#F97316"}}>Educational only. Weights are indicative. Not investment advice.</div>
      </div>
    </Shell>
  );
}

export function VIXDetailPage(props){
  var d=VIX_DETAIL;
  function toneColor(t){return t=="calm"?CYAN:t=="normal"?UP:t=="warn"?GOLD:DOWN;}
  return (
    <Shell title="India VIX" sub="Volatility Index" val={d.val} chg={d.chg} up={d.up} onBack={props.onBack}>
      <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:9}}>WHAT IS INDIA VIX</div>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>
        <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{d.what}</div>
      </div>

      <H>HOW TO READ VIX</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
        {d.reading.map(function(r,i){
          return (
            <div key={i} style={{padding:"11px 13px",borderBottom:i<d.reading.length-1?"1px solid "+BD:"none"}}>
              <div style={{fontSize:12,fontWeight:800,color:toneColor(r.tone),marginBottom:2}}>{r.range}</div>
              <div style={{fontSize:10.5,color:T2,lineHeight:1.5}}>{r.mean}</div>
            </div>
          );
        })}
      </div>

      <H>HOW TRADERS USE IT DAILY</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>
        {d.howto.map(function(h,i){
          return <div key={i} style={{fontSize:11.5,color:T1,lineHeight:1.5,padding:"5px 0",borderBottom:i<d.howto.length-1?"1px solid "+BD:"none"}}>&#8226;  {h}</div>;
        })}
      </div>

      <H>VIX HISTORY (FEAR SPIKES)</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
        {d.history.map(function(h,i){
          return (
            <div key={i} style={{display:"flex",alignItems:"center",padding:"11px 13px",borderBottom:i<d.history.length-1?"1px solid "+BD:"none"}}>
              <span style={{width:70,fontSize:11,color:T2}}>{h.date}</span>
              <span style={{width:54,fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace"}}>{h.val}</span>
              <span style={{flex:1,fontSize:10,color:T3,textAlign:"right"}}>{h.note}</span>
            </div>
          );
        })}
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:16}}>
        <div style={{fontSize:9,color:"#F97316"}}>Educational only. Not investment advice.</div>
      </div>
    </Shell>
  );
}

export function FlowDetailPage(props){
  var f=FLOW_DETAIL;
  function Block(props2){
    var grp=props2.grp;
    return (
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 13px",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:800,color:T1}}>{props2.label}</div>
          <div style={{fontSize:15,fontWeight:900,color:grp.up?UP:DOWN,fontFamily:"monospace"}}>{grp.net} Cr</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:11}}>
            <div style={{fontSize:9,color:UP,fontWeight:800,marginBottom:7}}>MOST BOUGHT</div>
            {grp.bought.map(function(x,i){
              return (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                  <span style={{fontSize:10.5,color:T1}}>{x.sym}</span>
                  <span style={{fontSize:10.5,color:UP,fontWeight:700}}>{x.val}</span>
                </div>
              );
            })}
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:11}}>
            <div style={{fontSize:9,color:DOWN,fontWeight:800,marginBottom:7}}>MOST SOLD</div>
            {grp.sold.map(function(x,i){
              return (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                  <span style={{fontSize:10.5,color:T1}}>{x.sym}</span>
                  <span style={{fontSize:10.5,color:DOWN,fontWeight:700}}>{x.val}</span>
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
      <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:9}}>FII (FOREIGN INSTITUTIONS)</div>
      <Block label="FII Net" grp={f.fii}/>
      <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,margin:"16px 0 9px"}}>DII (DOMESTIC INSTITUTIONS)</div>
      <Block label="DII Net" grp={f.dii}/>

      <H>SECTOR ROTATION</H>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
        {f.sectorRotation.map(function(s,i){
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 13px",borderBottom:i<f.sectorRotation.length-1?"1px solid "+BD:"none"}}>
              <span style={{fontSize:12,color:T1,fontWeight:600}}>{s.sector}</span>
              <span style={{fontSize:11,fontWeight:700,color:s.up?UP:DOWN}}>{s.flow}</span>
            </div>
          );
        })}
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:16}}>
        <div style={{fontSize:9,color:"#F97316"}}>Educational only. Figures are indicative. Not investment advice.</div>
      </div>
    </Shell>
  );
}
