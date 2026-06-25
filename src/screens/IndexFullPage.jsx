import { getIndexFull } from "./IndexFullData";

// BreakoutPro - IndexFullPage.jsx
// Complete index intelligence page. Used by both Home and Markets.
// Pure black, green/red only for direction. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function H(props){return <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,margin:"16px 0 9px"}}>{props.children}</div>;}
function Box(props){return <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:props.p||13}}>{props.children}</div>;}

export default function IndexFullPage(props){
  var ix=props.idx||{};
  var key=ix.key||ix.label||"NIFTY";
  var nkey=key.replace(/ /g,"").replace("50","").toUpperCase();
  if(nkey.indexOf("BANK")!=-1)nkey="BANKNIFTY";
  else if(nkey.indexOf("SENSEX")!=-1)nkey="SENSEX";
  else nkey="NIFTY";
  var ltp=ix.ltp||ix.val||23961;
  var up=ix.up!=undefined?ix.up:true;
  var pct=ix.pct!=undefined?ix.pct:1.47;
  var d=getIndexFull(nkey,ix.label,ltp,up,pct);
  var L=d.levels;
  var levelRows=[["R3",L.r3,DOWN],["R2",L.r2,DOWN],["R1",L.r1,DOWN],["Pivot",L.pivot,T2],["S1",L.s1,UP],["S2",L.s2,UP],["S3",L.s3,UP]];

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>

      {/* HEADER */}
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{d.label}</div>
          <div style={{fontSize:9,color:T2}}>Index Intelligence</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:17,fontWeight:900,fontFamily:"monospace",color:up?UP:DOWN}}>{d.ltp.toLocaleString("en-IN")}</div>
          <div style={{fontSize:10,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{d.pct}%</div>
        </div>
      </div>

      <div style={{padding:"14px"}}>

        {/* ABOUT */}
        <Box><div style={{fontSize:12,color:T1,lineHeight:1.6}}>{d.about}</div></Box>

        {/* TODAY SUMMARY */}
        <H>TODAY'S SUMMARY</H>
        <Box><div style={{fontSize:11.5,color:T1,lineHeight:1.6}}>{d.summary}</div></Box>

        {/* SUPPORT / RESISTANCE */}
        <H>SUPPORT AND RESISTANCE</H>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {levelRows.map(function(r,i){
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 13px",borderBottom:i<levelRows.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:11,color:r[2],fontWeight:700}}>{r[0]}</span>
                <span style={{fontSize:12,fontWeight:800,color:T1,fontFamily:"monospace"}}>{r[1].toLocaleString("en-IN")}</span>
              </div>
            );
          })}
        </div>

        {/* OI / PCR / MAX PAIN */}
        <H>OPTIONS  &#8226;  OI ANALYSIS</H>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          {[["PCR",d.oi.pcr],["Max Pain",d.oi.maxPain],["Call Wall",d.oi.callWall],["Put Wall",d.oi.putWall]].map(function(r,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 11px"}}>
                <div style={{fontSize:9,color:T2}}>{r[0]}</div>
                <div style={{fontSize:13,fontWeight:800,color:T1,marginTop:3,fontFamily:"monospace"}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <Box><div style={{fontSize:10.5,color:T2,lineHeight:1.5}}>{d.oi.note}</div></Box>

        {/* MARKET BREADTH */}
        <H>MARKET BREADTH</H>
        <Box>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:UP}}>{d.breadth.adv}</div><div style={{fontSize:8.5,color:T2}}>Advances</div></div>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:DOWN}}>{d.breadth.dec}</div><div style={{fontSize:8.5,color:T2}}>Declines</div></div>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:T2}}>{d.breadth.unch}</div><div style={{fontSize:8.5,color:T2}}>Unchanged</div></div>
          </div>
          <div style={{fontSize:10,color:T3,textAlign:"center"}}>{d.breadth.note}</div>
        </Box>

        {/* VIX IMPACT */}
        <H>INDIA VIX IMPACT</H>
        <Box><div style={{fontSize:11,color:T1,lineHeight:1.6}}>{d.vixImpact}</div></Box>

        {/* ATH / ATL */}
        <H>HISTORICAL ALL TIME HIGH / LOW</H>
        <Box p={0}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:13,borderBottom:"1px solid "+BD}}>
            <div><div style={{fontSize:9,color:T2}}>All Time High</div><div style={{fontSize:16,fontWeight:800,color:UP,fontFamily:"monospace"}}>{d.ath.val.toLocaleString("en-IN")}</div></div>
            <div style={{fontSize:9,color:T3,textAlign:"right",maxWidth:150}}>{d.ath.date}<br/>{d.ath.why}</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:13}}>
            <div><div style={{fontSize:9,color:T2}}>All Time Low</div><div style={{fontSize:16,fontWeight:800,color:DOWN,fontFamily:"monospace"}}>{d.atl.val.toLocaleString("en-IN")}</div></div>
            <div style={{fontSize:9,color:T3,textAlign:"right",maxWidth:150}}>{d.atl.date}<br/>{d.atl.why}</div>
          </div>
        </Box>

        {/* CRASHES */}
        <H>BIGGEST CRASHES AND RECOVERY</H>
        <Box>
          {d.crashes.map(function(c,i){
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<d.crashes.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:11,color:T1,fontWeight:600}}>{c.event}</span>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:11,fontWeight:700,color:DOWN}}>{c.fall}</span>
                  <span style={{fontSize:9,color:T3,marginLeft:8}}>Rec: {c.recovery}</span>
                </div>
              </div>
            );
          })}
        </Box>

        {/* RETURNS */}
        <H>MONTHLY AND YEARLY RETURNS</H>
        <Box>
          {d.returns.map(function(r,i){
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<d.returns.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:11.5,color:T2}}>{r.period}</span>
                <span style={{fontSize:12,fontWeight:800,color:r.up?UP:DOWN,fontFamily:"monospace"}}>{r.val}</span>
              </div>
            );
          })}
        </Box>

        {/* SECTOR PERFORMANCE */}
        <H>SECTOR PERFORMANCE</H>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {d.sectors.map(function(s,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:T1,fontWeight:600}}>{s.name}</span>
                <span style={{fontSize:11,fontWeight:700,color:s.up?UP:DOWN}}>{s.chg}</span>
              </div>
            );
          })}
        </div>

        {/* FII / DII IMPACT */}
        <H>FII / DII IMPACT</H>
        <Box>
          <div style={{display:"flex",gap:8,marginBottom:9}}>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,color:T2}}>FII</div><div style={{fontSize:15,fontWeight:800,color:d.flowImpact.fiiUp?UP:DOWN,fontFamily:"monospace"}}>{d.flowImpact.fii}</div></div>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,color:T2}}>DII</div><div style={{fontSize:15,fontWeight:800,color:d.flowImpact.diiUp?UP:DOWN,fontFamily:"monospace"}}>{d.flowImpact.dii}</div></div>
          </div>
          <div style={{fontSize:10.5,color:T2,lineHeight:1.5}}>{d.flowImpact.note}</div>
        </Box>

        {/* AI PREDICTION */}
        <H>AI PREDICTION</H>
        <Box>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:14,fontWeight:900,color:d.ai.bias=="Bullish"?UP:d.ai.bias=="Bearish"?DOWN:GOLD}}>{d.ai.bias}</span>
            <span style={{fontSize:10,color:T2}}>Confidence {d.ai.conf}%</span>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,marginBottom:9}}>
            <div style={{height:6,width:d.ai.conf+"%",background:CYAN,borderRadius:3}}></div>
          </div>
          <div style={{fontSize:10.5,color:T2,lineHeight:1.5}}>{d.ai.view}</div>
        </Box>

        {/* NEWS TIMELINE */}
        <H>NEWS TIMELINE</H>
        <Box p={0}>
          {d.news.map(function(n,i){
            return (
              <div key={i} style={{display:"flex",gap:10,padding:"11px 13px",borderBottom:i<d.news.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:9,color:CYAN,fontWeight:700,minWidth:64}}>{n.time}</span>
                <span style={{fontSize:11,color:T1,lineHeight:1.4}}>{n.text}</span>
              </div>
            );
          })}
        </Box>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:16}}>
          <div style={{fontSize:9,color:"#F97316"}}>Educational only. Data indicative. Not SEBI registered. Not investment advice.</div>
        </div>

      </div>
    </div>
  );
}
