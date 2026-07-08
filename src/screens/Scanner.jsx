import { useState, useEffect } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
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
  var s = props.stock;
  var d = STOCK_DETAILS[s.sym] || {name:s.sym,sector:s.sect,pe:"N/A",pb:"N/A",mcap:"N/A",high52:"N/A",low52:"N/A"};
  var spark = genSpark(s.ltp, s.up);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:9,color:T2}}>{d.name}</div>
        </div>
      </div>

      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:32,fontWeight:900,fontFamily:"monospace",color:s.up?G2:R}}>
                Rs{s.ltp>=1000?(s.ltp/1000).toFixed(2)+"K":s.ltp.toFixed(2)}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                <span style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:s.up?G2:R,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700}}>
                  {s.up?"+":""}{s.chgPct.toFixed(2)}%
                </span>
                <span style={{fontSize:9,color:T2}}>{d.sector}</span>
              </div>
            </div>
            <SparkLine data={spark} color={s.up?G:R} w={90} h={50}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["52W High","Rs"+d.high52],["52W Low","Rs"+d.low52],["P/E Ratio",d.pe],["P/B Ratio",d.pb],["Market Cap",d.mcap],["Sector",d.sector]].map(function(r){
              return (
                <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div>
                  <div style={{fontSize:11,fontWeight:700,color:T1}}>{r[1]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Scanner Signal</div>
          <div style={{background:s.up?"rgba(0,200,83,0.1)":"rgba(239,68,68,0.1)",border:"1px solid "+(s.up?"rgba(0,200,83,0.3)":"rgba(239,68,68,0.3)"),borderRadius:10,padding:12}}>
            <div style={{fontSize:12,fontWeight:700,color:s.up?G2:R,marginBottom:4}}>{s.up?"Bullish Signal":"Bearish Signal"}</div>
            <div style={{fontSize:10,color:T2,lineHeight:1.7}}>
              {s.up
                ?"Price showing strength with above-average volume. Momentum is bullish. Watch for continuation above current levels."
                :"Price showing weakness with above-average volume. Momentum is bearish. Watch for continuation below current levels."}
            </div>
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice. Do your own research before trading.</div>
        </div>
      </div>
    </div>
  );
}

export default function ScannerScreen(props) {
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
      <div style={{display:"flex",gap:6,overflowX:"auto",padding:"12px 14px",background:CB,borderBottom:"1px solid "+BD}}>
        {SCANS.map(function(sc){
          var act = active==sc.id;
          return (
            <button key={sc.id} style={{background:act?G:"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"7px 16px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit",flexShrink:0}} onClick={function(){runScan(sc.id);}}>
              {sc.label}
            </button>
          );
        })}
      </div>

      {/* Scan description */}
      <div style={{background:"rgba(0,200,83,0.05)",borderBottom:"1px solid rgba(0,200,83,0.1)",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,color:T2}}>{activeScan.desc}</span>
        <span style={{fontSize:10,fontWeight:700,color:G}}>{results.length} found</span>
      </div>

      <div style={{padding:"10px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <span style={{fontSize:7.5,fontWeight:800,color:"#F59E0B",background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"2px 7px",borderRadius:5,letterSpacing:0.5}}>DEMO DATA</span>
          <span style={{fontSize:8,color:"#4A5A7A"}}>Simulated scan results for preview. Not live market values.</span>
        </div>
        {results.length==0?(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:14,color:T2,marginBottom:6}}>No stocks match this scanner</div>
            <div style={{fontSize:10,color:"#4A5A7A"}}>Try a different scan type</div>
          </div>
        ):(
          <div style={{background:CB,borderRadius:12,border:"1px solid "+BD,overflow:"hidden"}}>
            {results.map(function(s){
              var spark = genSpark(s.ltp, s.up);
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:"1px solid "+BD,cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{width:38,height:38,borderRadius:10,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:8,fontWeight:800,color:"#1E90FF"}}>{s.sym.slice(0,3)}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:8,color:T2,marginTop:1}}>{s.sect}</div>
                  </div>
                  <SparkLine data={spark} color={s.up?G:R} w={44} h={20}/>
                  <div style={{textAlign:"right",minWidth:80}}>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:T1}}>
                      Rs{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}
                    </div>
                    <div style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:5,padding:"1px 6px",fontSize:8,fontWeight:700,color:s.up?G2:R,marginTop:2}}>
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
