import { useState } from "react";

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#8B5CF6",PURPLE2="#A78BFA";
var GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#8899BB",T3="#475569";

var SECTORS_MAP={
  "RELIANCE":"Energy","TCS":"IT","HDFCBANK":"Banking","ICICIBANK":"Banking",
  "INFY":"IT","SBIN":"Banking","WIPRO":"IT","HCLTECH":"IT","TATAMOTORS":"Auto",
  "MARUTI":"Auto","SUNPHARMA":"Pharma","DRREDDY":"Pharma","TATASTEEL":"Metal",
  "JSWSTEEL":"Metal","ADANIENT":"Infra","LT":"Infra","ITC":"FMCG",
  "HINDUNILVR":"FMCG","KOTAKBANK":"Banking","AXISBANK":"Banking",
  "BAJFINANCE":"Finance","M&M":"Auto","NTPC":"Energy","POWERGRID":"Energy",
  "BHARTIARTL":"Telecom","TITAN":"Consumer","ASIANPAINT":"Consumer",
};

function getSector(sym){return SECTORS_MAP[sym.toUpperCase()]||"Others";}

function calcScore(holdings){
  if(!holdings.length)return 0;
  var sectors={};
  var total=holdings.reduce(function(s,h){return s+h.value;},0);
  holdings.forEach(function(h){
    var sec=getSector(h.sym);
    sectors[sec]=(sectors[sec]||0)+h.value;
  });
  var maxConc=Math.max.apply(null,Object.values(sectors))/total;
  var diversityScore=Math.max(0,100-maxConc*100);
  var avgPnlPct=holdings.reduce(function(s,h){return s+h.pnlPct;},0)/holdings.length;
  var perfScore=Math.min(100,Math.max(0,50+avgPnlPct*5));
  var countScore=Math.min(100,holdings.length*10);
  return Math.round((diversityScore*0.4)+(perfScore*0.4)+(countScore*0.2));
}

export default function PortfolioReview(props){
  var setTab=props.setTab||function(){};
  var onBack=props.onBack||function(){};
  var [holdings,setHoldings]=useState([
    {sym:"RELIANCE",qty:10,avgPrice:2650,ltp:2845,value:28450,pnlPct:7.36,up:true},
    {sym:"TCS",qty:5,avgPrice:3800,ltp:3654,value:18270,pnlPct:-3.84,up:false},
    {sym:"HDFCBANK",qty:20,avgPrice:1680,ltp:1742,value:34840,pnlPct:3.69,up:true},
    {sym:"ICICIBANK",qty:30,avgPrice:1200,ltp:1289,value:38670,pnlPct:7.42,up:true},
    {sym:"TATAMOTORS",qty:50,avgPrice:950,ltp:876,value:43800,pnlPct:-7.79,up:false},
  ]);
  var [editMode,setEditMode]=useState(false);
  var [newSym,setNewSym]=useState("");
  var [newQty,setNewQty]=useState("");
  var [newAvg,setNewAvg]=useState("");
  var [newLtp,setNewLtp]=useState("");
  var [aiLoading,setAiLoading]=useState(false);
  var [aiReview,setAiReview]=useState(null);

  var totalValue=holdings.reduce(function(s,h){return s+h.value;},0);
  var totalInvested=holdings.reduce(function(s,h){return s+h.qty*h.avgPrice;},0);
  var totalPnl=totalValue-totalInvested;
  var totalPnlPct=totalInvested>0?(totalPnl/totalInvested)*100:0;
  var score=calcScore(holdings);

  var sectors={};
  holdings.forEach(function(h){
    var sec=getSector(h.sym);
    sectors[sec]=(sectors[sec]||0)+h.value;
  });

  var scoreCol=score>=70?UP:score>=40?GOLD:DOWN;

  function addHolding(){
    if(!newSym||!newQty||!newAvg||!newLtp)return;
    var qty=parseInt(newQty),avg=parseFloat(newAvg),ltp=parseFloat(newLtp);
    var value=qty*ltp,pnlPct=((ltp-avg)/avg)*100;
    setHoldings(function(prev){return prev.concat([{sym:newSym.toUpperCase(),qty:qty,avgPrice:avg,ltp:ltp,value:value,pnlPct:parseFloat(pnlPct.toFixed(2)),up:ltp>=avg}]);});
    setNewSym("");setNewQty("");setNewAvg("");setNewLtp("");
  }

  function removeHolding(sym){
    setHoldings(function(prev){return prev.filter(function(h){return h.sym!=sym;});});
  }

  function getAIReview(){
    setAiLoading(true);
    var prompt="Analyze this portfolio (educational, not advice):\n"+
      holdings.map(function(h){return h.sym+" qty:"+h.qty+" avg:"+h.avgPrice+" ltp:"+h.ltp+" P&L:"+h.pnlPct+"%";}).join("\n")+
      "\nTotal value: Rs"+Math.round(totalValue)+" P&L: "+totalPnlPct.toFixed(2)+"%"+
      "\nSectors: "+Object.entries(sectors).map(function(e){return e[0]+":Rs"+Math.round(e[1]);}).join(", ")+
      "\n\nGive concise educational analysis in 5 bullet points: 1) Portfolio health 2) Sector concentration risk 3) Best performer action 4) Worst performer suggestion 5) One improvement tip. Keep it under 150 words. Start each bullet with emoji.";

    fetch("/api/ai",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        messages:[{role:"user",content:prompt}],
        max_tokens:1000
      })
    })
    .then(function(r){return r.json();})
    .then(function(d){
      if(d&&d.ok&&d.text){ setAiReview(d.text); }
      else { setAiReview("AI review is temporarily unavailable. Please try again later."); }
      setAiLoading(false);
    })
    .catch(function(){
      setAiReview("AI review failed. Check internet connection and try again.");
      setAiLoading(false);
    });
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>AI Portfolio Review</div>
          <div style={{fontSize:10,color:T2}}>Educational analysis only  Not investment advice</div>
        </div>
        <button onClick={function(){setEditMode(function(p){return !p;});}} style={{background:editMode?"rgba(239,68,68,0.15)":"rgba(59,130,246,0.15)",border:"1px solid "+(editMode?DOWN:BLUE),borderRadius:10,padding:"6px 12px",color:editMode?DOWN:BLUE2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          {editMode?"Done":"Edit"}
        </button>
      </div>

      <div style={{padding:"12px 14px"}}>

        {/* Score Card */}
        <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(124,58,237,0.08))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:18,padding:"16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T2,marginBottom:4}}>Portfolio Score</div>
            <div style={{fontSize:44,fontWeight:900,color:scoreCol,fontFamily:"monospace",lineHeight:1}}>{score}</div>
            <div style={{fontSize:10,color:scoreCol,marginTop:4,fontWeight:600}}>{score>=70?"Healthy ":score>=40?"Moderate ":"Needs Attention "}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:T3,marginBottom:4}}>Total Value</div>
            <div style={{fontSize:18,fontWeight:900,color:T1,fontFamily:"monospace"}}>Rs{Math.round(totalValue/1000)}K</div>
            <div style={{fontSize:11,fontWeight:700,color:totalPnl>=0?UP:DOWN,marginTop:2}}>
              {totalPnl>=0?"+":""}Rs{Math.round(Math.abs(totalPnl))} ({totalPnlPct>=0?"+":""}{totalPnlPct.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Sector Allocation</div>
          {Object.entries(sectors).sort(function(a,b){return b[1]-a[1];}).map(function(entry){
            var pct=(entry[1]/totalValue*100).toFixed(1);
            var isConcentrated=parseFloat(pct)>40;
            return (
              <div key={entry[0]} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,fontWeight:600,color:isConcentrated?GOLD:T1}}>{entry[0]}{isConcentrated?" &#9888;":""}</span>
                  <span style={{fontSize:10,fontWeight:700,color:isConcentrated?GOLD:T2}}>{pct}%</span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2}}>
                  <div style={{height:4,background:isConcentrated?GOLD:BLUE,borderRadius:2,width:pct+"%",opacity:0.8}}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Holdings List */}
        <div style={{fontSize:11,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:8}}>YOUR HOLDINGS</div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:12}}>
          {holdings.map(function(h,i){
            return (
              <div key={h.sym} style={{padding:"10px 14px",borderBottom:i<holdings.length-1?"1px solid rgba(30,42,77,0.5)":"none",display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:T1}}>{h.sym}</span>
                    <span style={{fontSize:8,color:T3,background:"rgba(255,255,255,0.05)",borderRadius:4,padding:"1px 5px"}}>{getSector(h.sym)}</span>
                  </div>
                  <div style={{fontSize:9,color:T2,marginTop:2}}>{h.qty} shares  Avg: Rs{h.avgPrice}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>Rs{h.ltp}</div>
                  <div style={{fontSize:10,fontWeight:700,color:h.up?UP:DOWN}}>{h.up?"+":""}{h.pnlPct}%</div>
                </div>
                {editMode&&(
                  <button onClick={function(){removeHolding(h.sym);}} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,width:24,height:24,color:DOWN,fontSize:12,cursor:"pointer",flexShrink:0}}>&#10005;</button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Holding */}
        {editMode&&(
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Add Holding</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
              {[["Symbol",newSym,setNewSym,"RELIANCE"],["Qty",newQty,setNewQty,"10"],["Avg Price",newAvg,setNewAvg,"2650"],["LTP",newLtp,setNewLtp,"2845"]].map(function(f){
                return (
                  <div key={f[0]}>
                    <div style={{fontSize:8,color:T3,marginBottom:3}}>{f[0]}</div>
                    <input value={f[1]} onChange={function(e){f[2](e.target.value);}} placeholder={f[3]} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:8,padding:"7px 8px",color:T1,fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                );
              })}
            </div>
            <button onClick={addHolding} style={{width:"100%",background:BLUE,border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Stock</button>
          </div>
        )}

        {/* AI Review */}
        {aiReview?(
          <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.08))",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"14px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:8,fontWeight:900,color:"#fff"}}>AI</span>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:PURPLE2}}>AI Portfolio Analysis</span>
            </div>
            <div style={{fontSize:11,color:T1,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiReview}</div>
            <div style={{marginTop:10,fontSize:8,color:T3}}>Educational only. Not SEBI registered. Not investment advice.</div>
          </div>
        ):null}

        <button onClick={getAIReview} disabled={aiLoading} style={{width:"100%",background:aiLoading?"rgba(124,58,237,0.3)":"linear-gradient(135deg,"+PURPLE+","+BLUE+")",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:13,fontWeight:700,cursor:aiLoading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {aiLoading?(
            <>
              <div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"pr-spin 0.8s linear infinite"}}></div>
              <span>Analyzing Portfolio...</span>
            </>
          ):(
            <>
              <span>&#129504;</span>
              <span>{aiReview?"Refresh AI Review":"Get AI Portfolio Review"}</span>
            </>
          )}
        </button>

      </div>
      <style>{"@keyframes pr-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
                         }
