import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeProvider";

var DB = "#050505";
var CB = "#101318";
var BD = "#20242D";
var G = "#1B5E20";
var G2 = "#1B5E20";
var R = "#EF4444";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var SCANS = [
  {id:"breakout",  label:"Breakout",   desc:"Price breaking above resistance with volume"},
  {id:"breakdown", label:"Breakdown",  desc:"Price breaking below support with volume"},
  {id:"volume",    label:"Volume",     desc:"Volume spike above 1.5x average"},
  {id:"gapup",     label:"Gap Up",     desc:"Price gapped up at market open"},
  {id:"gapdown",   label:"Gap Down",   desc:"Price gapped down at market open"},
];

var STOCK_DETAILS = {
  RELIANCE:  {name:"Reliance Industries", sector:"Energy",    pe:28.4, pb:2.1, mcap:"19.2L Cr", high52:"3024", low52:"2220"},
  TCS:       {name:"Tata Consultancy",    sector:"IT",        pe:31.2, pb:13.4,mcap:"13.2L Cr", high52:"4592", low52:"3056"},
  HDFCBANK:  {name:"HDFC Bank",           sector:"Bank",      pe:19.8, pb:2.8, mcap:"13.1L Cr", high52:"1880", low52:"1363"},
  ICICIBANK: {name:"ICICI Bank",          sector:"Bank",      pe:18.4, pb:3.2, mcap:"9.1L Cr",  high52:"1362", low52:"972"},
  INFY:      {name:"Infosys",             sector:"IT",        pe:24.6, pb:7.8, mcap:"6.5L Cr",  high52:"1974", low52:"1307"},
  WIPRO:     {name:"Wipro",               sector:"IT",        pe:22.1, pb:4.2, mcap:"2.5L Cr",  high52:"571",  low52:"378"},
  TATAMOTORS:{name:"Tata Motors",         sector:"Auto",      pe:8.2,  pb:3.1, mcap:"3.5L Cr",  high52:"1179", low52:"724"},
  SBIN:      {name:"State Bank of India", sector:"Bank",      pe:11.2, pb:1.8, mcap:"7.2L Cr",  high52:"912",  low52:"543"},
  AXISBANK:  {name:"Axis Bank",           sector:"Bank",      pe:14.8, pb:2.4, mcap:"3.6L Cr",  high52:"1340", low52:"882"},
  BAJFINANCE:{name:"Bajaj Finance",       sector:"NBFC",      pe:32.4, pb:6.8, mcap:"4.5L Cr",  high52:"7830", low52:"5924"},
};

function genSpark(base, up) {
  var a = []; var p = base;
  for(var i=0;i<14;i++){p=p+(Math.random()-(up?0.4:0.6))*base*0.004;a.push(p);}
  return a;
}

function SparkLine(props) {
  var data=props.data; var color=props.color; var w=props.w||50; var h=props.h||22;
  if(!data||data.length<2) return null;
  var min=Math.min.apply(null,data),max=Math.max.apply(null,data),range=max-min||1;
  var pts=data.map(function(v,i){return (i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);}).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function StockDetail(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  G=theme.c.up; G2=theme.c.up; R=theme.c.down; T1=theme.c.text1; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CB = theme.c.card, DB = theme.c.bg;

  var s = props.stock;
  var d = STOCK_DETAILS[s.sym] || {name:s.sym,sector:s.sect,pe:"N/A",pb:"N/A",mcap:"N/A",high52:"N/A",low52:"N/A"};
  var spark = genSpark(s.ltp, s.up);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:24}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:12,color:T2}}>{d.name}</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:32,fontWeight:900,fontFamily:"monospace",color:s.up?G2:R}}>
                Rs{s.ltp>=1000?(s.ltp/1000).toFixed(2)+"K":s.ltp.toFixed(2)}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                <span style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:s.up?G2:R,borderRadius:6,padding:"4px 8px",fontSize:12,fontWeight:700}}>
                  {s.up?"+":""}{s.chgPct.toFixed(2)}%
                </span>
                <span style={{fontSize:12,color:T2}}>{d.sector}</span>
              </div>
            </div>
            <SparkLine data={spark} color={s.up?G:R} w={90} h={50}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["52W High","Rs"+d.high52],["52W Low","Rs"+d.low52],["P/E Ratio",d.pe],["P/B Ratio",d.pb],["Market Cap",d.mcap],["Sector",d.sector]].map(function(r){
              return (
                <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 12px"}}>
                  <div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{r[1]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>Scanner Signal</div>
          <div style={{background:s.up?"rgba(0,200,83,0.1)":"rgba(239,68,68,0.1)",border:"1px solid "+(s.up?"rgba(0,200,83,0.3)":"rgba(239,68,68,0.3)"),borderRadius:10,padding:12}}>
            <div style={{fontSize:12,fontWeight:700,color:s.up?G2:R,marginBottom:4}}>{s.up?"Bullish Signal":"Bearish Signal"}</div>
            <div style={{fontSize:12,color:T2,lineHeight:1.7}}>
              {s.up
                ?"Price showing strength with above-average volume. Momentum is bullish. Watch for continuation above current levels."
                :"Price showing weakness with above-average volume. Momentum is bearish. Watch for continuation below current levels."}
            </div>
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice. Do your own research before trading.</div>
        </div>
      </div>
    </div>
  );
}

export default function ScannerScreen(props) {

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var DB=theme.c.bg, CB=theme.c.card, BD=theme.c.border;
  var G=theme.c.up, G2=theme.c.up, R=theme.c.down, BLUE=theme.c.blue, BLUE=theme.c.blue;
  var T1=theme.c.text1, T2=theme.c.text2;
  var stocks = props.stocks || [];
  var [active, setActive] = useState("breakout");
  var [results, setResults] = useState([]);
  var [selStock, setSelStock] = useState(null);

  var DEMO = [
    {sym:"RELIANCE", name:"Reliance",   ltp:2845.60, chgPct:1.71,  up:true,  sect:"Energy"},
    {sym:"TCS",      name:"TCS",        ltp:3654.20, chgPct:0.97,  up:false, sect:"IT"},
    {sym:"HDFCBANK", name:"HDFC Bank",  ltp:1742.50, chgPct:1.90,  up:true,  sect:"Bank"},
    {sym:"ICICIBANK",name:"ICICI Bank", ltp:1289.30, chgPct:2.33,  up:true,  sect:"Bank"},
    {sym:"INFY",     name:"Infosys",    ltp:1567.80, chgPct:1.40,  up:false, sect:"IT"},
    {sym:"WIPRO",    name:"Wipro",      ltp:478.90,  chgPct:2.99,  up:true,  sect:"IT"},
    {sym:"TATAMOTORS",name:"Tata Motors",ltp:945.60, chgPct:2.23,  up:true,  sect:"Auto"},
    {sym:"SBIN",     name:"SBI",        ltp:812.30,  chgPct:2.18,  up:true,  sect:"Bank"},
    {sym:"AXISBANK", name:"Axis Bank",  ltp:1156.70, chgPct:1.47,  up:true,  sect:"Bank"},
    {sym:"BAJFINANCE",name:"Bajaj Fin", ltp:7234.50, chgPct:1.90,  up:true,  sect:"NBFC"},
    {sym:"MARUTI",   name:"Maruti",     ltp:13240,   chgPct:1.07,  up:true,  sect:"Auto"},
    {sym:"SUNPHARMA",name:"Sun Pharma", ltp:1678.40, chgPct:0.98,  up:false, sect:"Pharma"},
  ];

  function runScan(type) {
    setActive(type);
    var src = (stocks && stocks.length > 0) ? stocks : DEMO;
    var res = [];
    if(type=="breakout")  res = src.filter(function(s){return s.up && s.chgPct >= 1.5;});
    if(type=="breakdown") res = src.filter(function(s){return !s.up;});
    if(type=="volume")    res = src.slice().sort(function(a,b){return b.chgPct-a.chgPct;});
    if(type=="gapup")     res = src.filter(function(s){return s.up && s.chgPct >= 1.0;});
    if(type=="gapdown")   res = src.filter(function(s){return !s.up && s.chgPct >= 0.5;});
    if(res.length == 0)   res = src.filter(function(s){return s.up;});
    setResults(res);
  }

  useEffect(function(){runScan("breakout");},[]);

  if(selStock) return <StockDetail stock={selStock} onBack={function(){setSelStock(null);}}/>;

  var activeScan = SCANS.find(function(s){return s.id==active;}) || SCANS[0];

  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>

      {/* Scan Tabs */}
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"12px 16px",background:CB,borderBottom:"1px solid "+BD}}>
        {SCANS.map(function(sc){
          var act = active==sc.id;
          return (
            <button key={sc.id} style={{background:act?BLUE:"rgba(255,255,255,0.06)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"8px 16px",color:act?"#fff":T2,fontSize:12,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit",flexShrink:0}} onClick={function(){runScan(sc.id);}}>
              {sc.label}
            </button>
          );
        })}
      </div>

      {/* Scan description */}
      <div style={{background:"rgba(37,99,235,0.05)",borderBottom:"1px solid rgba(37,99,235,0.1)",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:T2}}>{activeScan.desc}</span>
        <span style={{fontSize:12,fontWeight:700,color:BLUE}}>{results.length} found</span>
      </div>

      <div style={{padding:"12px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:800,color:"#F59E0B",background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
          <span style={{fontSize:12,color:"#4A5A7A"}}>Simulated scan results for preview. Not live market values.</span>
        </div>
        {results.length==0?(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:14,color:T2,marginBottom:8}}>No stocks match this scanner</div>
            <div style={{fontSize:12,color:"#4A5A7A"}}>Try a different scan type</div>
          </div>
        ):(
          <div style={{background:CB,borderRadius:16,border:"1px solid "+BD,overflow:"hidden"}}>
            {results.map(function(s){
              var spark = genSpark(s.ltp, s.up);
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+BD,cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{width:38,height:38,borderRadius:10,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:800,color:"#1E90FF"}}>{s.sym.slice(0,3)}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:12,color:T2,marginTop:4}}>{s.sect}</div>
                  </div>
                  <SparkLine data={spark} color={s.up?G:R} w={44} h={20}/>
                  <div style={{textAlign:"right",minWidth:80}}>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:T1}}>
                      Rs{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}
                    </div>
                    <div style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:5,padding:"4px 8px",fontSize:12,fontWeight:700,color:s.up?G2:R,marginTop:4}}>
                      {s.up?"+":""}{s.chgPct.toFixed(2)}%
                    </div>
                  </div>
                  <span style={{color:"#4A5A7A",fontSize:14}}>&#8250;</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
      }
