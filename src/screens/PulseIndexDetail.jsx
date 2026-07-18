import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PulseIndexDetail.jsx
// Full detail page for an index, opened from the AI Briefing indices line.
// Rules: no backticks, no triple-equals, ASCII only.

var DB="#050816",CB="#0B1224",BD="#1B2A4D";
var G2="#00E676",R="#EF4444";
var GOLD="#F59E0B",BLUE="#3B82F6";
var T1="#FFFFFF",T2="#8FA2C9",T3="#5B6472";

function genSpark(base){
  var a=[];var p=base;
  for(var i=0;i<24;i++){p=p+(Math.random()-0.46)*base*0.003;a.push(p);}
  return a;
}

function Spark(props){
  var d=props.d,col=props.col,w=props.w||330,h=props.h||90;
  if(!d||d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rg=mx-mn||1;
  var pts=d.map(function(v,i){return (i/(d.length-1))*w+","+(h-((v-mn)/rg)*(h-6)+3);}).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block",width:"100%"}} viewBox={"0 0 "+w+" "+h} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function PulseIndexDetail(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system

  var idx=props.idx;
  var onBack=props.onBack||function(){};
  if(!idx)return null;
  var col=idx.up?G2:R;
  var chgPts=(idx.ltp-idx.prevClose).toFixed(2);
  var spark=genSpark(idx.ltp);

  var stats=[
    ["Open",idx.prevClose.toLocaleString("en-IN",{maximumFractionDigits:2})],
    ["Prev Close",idx.prevClose.toLocaleString("en-IN",{maximumFractionDigits:2})],
    ["Day High",idx.dayHigh.toLocaleString("en-IN",{maximumFractionDigits:2})],
    ["Day Low",idx.dayLow.toLocaleString("en-IN",{maximumFractionDigits:2})],
    ["P/E Ratio",idx.pe],
    ["Change",(idx.up?"+":"")+chgPts+" pts"],
  ];

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40,color:T1}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#050816,#0A1020)",padding:"14px 16px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+BD,borderRadius:10,width:34,height:34,color:T1,fontSize:15,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:900,color:T1}}>{idx.label}</div>
            <div style={{fontSize:8.5,color:T2,marginTop:1}}>{idx.desc}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:12}}>
          <div style={{fontSize:32,fontWeight:900,color:col,fontFamily:"monospace",lineHeight:1}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
          <div style={{paddingBottom:3}}>
            <span style={{fontSize:13,fontWeight:800,color:col}}>{idx.up?"+":""}{chgPts}</span>
            <span style={{fontSize:13,fontWeight:800,color:col,marginLeft:6}}>({idx.up?"+":""}{idx.pct}%)</span>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px 0"}}>

        {/* CHART */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:10,color:T2,fontWeight:600,marginBottom:10}}>Intraday Trend</div>
          <Spark d={spark} col={col} w={330} h={90}/>
        </div>

        {/* STATS GRID */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {stats.map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"11px 8px",textAlign:"center"}}>
                <div style={{fontSize:8,color:T2,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:12,fontWeight:800,color:T1,fontFamily:"monospace"}}>{r[1]}</div>
              </div>
            );
          })}
        </div>

        {/* SUPPORT / RESISTANCE */}
        <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Key Levels</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          <div style={{background:"#450A0A",border:"1px solid "+R,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:8,color:"#FCA5A5",marginBottom:5}}>Resistance</div>
            <div style={{fontSize:15,fontWeight:800,color:"#FCA5A5",fontFamily:"monospace"}}>{idx.res}</div>
          </div>
          <div style={{background:"#052E16",border:"1px solid "+G2,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:8,color:"#86EFAC",marginBottom:5}}>Support</div>
            <div style={{fontSize:15,fontWeight:800,color:"#86EFAC",fontFamily:"monospace"}}>{idx.sup}</div>
          </div>
        </div>

        {/* AI NOTE */}
        <div style={{background:"linear-gradient(135deg,#071019,#101827)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
            <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:"&#129504;"}}/>
            <span style={{fontSize:12,fontWeight:800,color:T1}}>AI View</span>
          </div>
          <div style={{fontSize:11.5,color:"#D4D8E0",lineHeight:1.75}}>{idx.note}</div>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:theme.c.warn,lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice. Index data indicative.</div>
        </div>
      </div>
    </div>
  );
}
