import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PulseIndexDetail.jsx
// Full detail page for an index, opened from the AI Briefing indices line.
// Rules: no backticks, no triple-equals, ASCII only.

var DB="#050816",CB="#0B1224",BD="#1B2A4D";
var G2="#00E676",R="#EF4444";
var BLUE="#3B82F6";
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
  T1=theme.c.text1; DB=theme.c.bg; CB=theme.c.card; BD=theme.c.border; G2=theme.c.up; R=theme.c.down; BLUE=theme.c.blue; BLUE=theme.c.blue; T2=theme.c.text2; T3=theme.c.text3;

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
      <div style={{background:DB,padding:"16px 16px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+BD,borderRadius:10,width:44,height:44,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>{idx.label}</div>
            <div style={{fontSize:12,color:T2,marginTop:4}}>{idx.desc}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:12}}>
          <div style={{fontSize:32,fontWeight:900,color:col,fontFamily:"monospace",lineHeight:1}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
          <div style={{paddingBottom:4}}>
            <span style={{fontSize:14,fontWeight:800,color:col}}>{idx.up?"+":""}{chgPts}</span>
            <span style={{fontSize:14,fontWeight:800,color:col,marginLeft:8}}>({idx.up?"+":""}{idx.pct}%)</span>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* CHART */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,color:T2,fontWeight:600,marginBottom:12}}>Intraday Trend</div>
          <Spark d={spark} col={col} w={330} h={90}/>
        </div>

        {/* STATS GRID */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {stats.map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:12,fontWeight:800,color:T1,fontFamily:"monospace"}}>{r[1]}</div>
              </div>
            );
          })}
        </div>

        {/* SUPPORT / RESISTANCE */}
        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:12}}>Key Levels</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          <div style={{background:"rgba(220,38,38,0.08)",border:"1px solid "+R,borderRadius:12,padding:"12px 16px"}}>
            <div style={{fontSize:12,color:R,marginBottom:4}}>Resistance</div>
            <div style={{fontSize:16,fontWeight:800,color:R,fontFamily:"monospace"}}>{idx.res}</div>
          </div>
          <div style={{background:"rgba(0,143,57,0.08)",border:"1px solid "+G2,borderRadius:12,padding:"12px 16px"}}>
            <div style={{fontSize:12,color:G2,marginBottom:4}}>Support</div>
            <div style={{fontSize:16,fontWeight:800,color:G2,fontFamily:"monospace"}}>{idx.sup}</div>
          </div>
        </div>

        {/* AI NOTE */}
        <div style={{background:CB,border:"1px solid rgba(37,99,235,0.15)",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:"&#129504;"}}/>
            <span style={{fontSize:12,fontWeight:800,color:T1}}>AI View</span>
          </div>
          <div style={{fontSize:12,color:T2,lineHeight:1.75}}>{idx.note}</div>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice. Index data indicative.</div>
        </div>
      </div>
    </div>
  );
}
