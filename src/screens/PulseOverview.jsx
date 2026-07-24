import { INDICES, GAINERS, LOSERS, ACTIVE, SECTORS, LEVELS, OPTIONS, FIIDII, AI_CONCLUSION } from "./PulseData";

import { useTheme } from "../theme/ThemeProvider";
var CB="#0B1224",BD="#1B2A4D";
var G2="#00E676",R="#EF4444";
var BLUE="#3B82F6";
var T1="#FFFFFF",T2="#8FA2C9";

function SecTitle(props){
  return <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:12,marginTop:props.first?0:4}}>{props.children}</div>;
}

export default function PulseOverview(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; CB=theme.c.card; G2=theme.c.up; R=theme.c.down; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue; T1=theme.c.text1;

  var ai=AI_CONCLUSION;
  return (
    <div>

      {/* LIVE INDICES */}
      <SecTitle first={true}>Live Indices</SecTitle>
      <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:16,WebkitOverflowScrolling:"touch"}}>
        {INDICES.map(function(x){
          return (
            <div key={x.label} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 16px",minWidth:120,flexShrink:0}}>
              <div style={{fontSize:12,color:T2,marginBottom:4,fontWeight:600}}>{x.label}</div>
              <div style={{fontSize:18,fontWeight:800,color:T1,fontFamily:"monospace",marginBottom:4}}>{x.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
              <span style={{fontSize:12,fontWeight:700,color:x.up?G2:R}}>{x.up?"+":""}{x.pct}%</span>
            </div>
          );
        })}
      </div>

      {/* AI CONCLUSION */}
      <div style={{background:CB,border:"1px solid rgba(37,99,235,0.15)",borderRadius:18,padding:16,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:"&#129504;"}}/>
          <span style={{fontSize:14,fontWeight:800,color:T1}}>AI Conclusion</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px",textAlign:"center"}}>
            <div style={{fontSize:12,color:T2,marginBottom:4}}>Today Bias</div>
            <div style={{fontSize:14,fontWeight:800,color:ai.biasUp?G2:R}}>{ai.bias}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px",textAlign:"center"}}>
            <div style={{fontSize:12,color:T2,marginBottom:4}}>Probability</div>
            <div style={{fontSize:14,fontWeight:800,color:BLUE}}>{ai.probability}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px",textAlign:"center"}}>
            <div style={{fontSize:12,color:T2,marginBottom:4}}>Risk</div>
            <div style={{fontSize:14,fontWeight:800,color:BLUE}}>{ai.risk}</div>
          </div>
        </div>
        <div style={{fontSize:12,color:T1,lineHeight:1.75}}>{ai.message}</div>
      </div>

      {/* SUPPORT / RESISTANCE */}
      <SecTitle>Support and Resistance</SecTitle>
      <div style={{marginBottom:16}}>
        {LEVELS.map(function(l){
          return (
            <div key={l.name} style={{marginBottom:12}}>
              <div style={{fontSize:12,color:T2,fontWeight:700,marginBottom:8}}>{l.name}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background:"#450A0A",border:"1px solid "+R,borderRadius:12,padding:"12px 12px"}}>
                  <div style={{fontSize:12,color:"#FCA5A5",marginBottom:4}}>Resistance</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#FCA5A5",fontFamily:"monospace"}}>{l.res}</div>
                </div>
                <div style={{background:"rgba(0,143,57,0.1)",border:"1px solid "+G2,borderRadius:12,padding:"12px 12px"}}>
                  <div style={{fontSize:12,color:"#86EFAC",marginBottom:4}}>Support</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#86EFAC",fontFamily:"monospace"}}>{l.sup}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOP MOVERS */}
      <SecTitle>Top Movers</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"4px 12px"}}>
          <div style={{fontSize:12,color:G2,fontWeight:700,padding:"8px 0 4px"}}>Gainers</div>
          {GAINERS.map(function(s){
            return <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+BD}}><span style={{fontSize:12,fontWeight:600,color:T1}}>{s.sym}</span><span style={{fontSize:12,fontWeight:700,color:G2}}>+{s.pct}%</span></div>;
          })}
        </div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"4px 12px"}}>
          <div style={{fontSize:12,color:R,fontWeight:700,padding:"8px 0 4px"}}>Losers</div>
          {LOSERS.map(function(s){
            return <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+BD}}><span style={{fontSize:12,fontWeight:600,color:T1}}>{s.sym}</span><span style={{fontSize:12,fontWeight:700,color:R}}>{s.pct}%</span></div>;
          })}
        </div>
      </div>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"4px 12px",marginBottom:16}}>
        <div style={{fontSize:12,color:BLUE,fontWeight:700,padding:"8px 0 4px"}}>Most Active</div>
        {ACTIVE.map(function(s){
          return <div key={s.sym} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+BD}}><span style={{fontSize:12,fontWeight:600,color:T1}}>{s.sym}</span><span style={{fontSize:12,color:T2}}>{s.val}</span></div>;
        })}
      </div>

      {/* SECTOR HEATMAP */}
      <SecTitle>Sector Heatmap</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {SECTORS.map(function(s){
          var bar=Math.min(100,Math.abs(s.pct)*30);
          return (
            <div key={s.name} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,color:T1,fontWeight:600}}>{s.name}</span>
                <span style={{fontSize:12,fontWeight:700,color:s.up?G2:R}}>{s.up?"+":""}{s.pct}%</span>
              </div>
              <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                <div style={{height:3,background:s.up?G2:R,borderRadius:2,width:bar+"%"}}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FII/DII + OPTIONS */}
      <SecTitle>FII / DII and Options</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {FIIDII.map(function(f){
          return (
            <div key={f.label} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:12,color:T2,marginBottom:4}}>{f.label}</div>
              <div style={{fontSize:16,fontWeight:800,color:f.up?G2:R}}>{f.val}</div>
            </div>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {OPTIONS.map(function(o){
          return (
            <div key={o.label} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:T2}}>{o.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:o.col,background:o.col+"22",borderRadius:4,padding:"4px 8px"}}>{o.tag}</span>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:T1,fontFamily:"monospace",marginTop:4}}>{o.val}</div>
            </div>
          );
        })}
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice. Do your own research before trading.</div>
      </div>
    </div>
  );
      }
