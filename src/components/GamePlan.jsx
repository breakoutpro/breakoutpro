import { useState } from "react";

var CARD="#101B2E",BD="#1E3A5F";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var PURPLE="#7C3AED",PURPLE2="#A855F7";
var GOLD="#F59E0B";
var UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

function getSignal(bullPct){
  if(bullPct>=65) return {label:"GO",sub:"Strong Bullish",color:UP,bg:"rgba(34,197,94,0.12)",border:"rgba(34,197,94,0.35)"};
  if(bullPct>=45) return {label:"WAIT",sub:"Range Bound",color:GOLD,bg:"rgba(245,158,11,0.12)",border:"rgba(245,158,11,0.35)"};
  return {label:"CAUTION",sub:"High Risk / High Volatility",color:DOWN,bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.35)"};
}

export default function GamePlan(props){
  var mood = props.mood || {bull:68,fg:"Greed",conf:84};
  var session = props.session || "live";

  var isComm = session=="mcx";
  var isGlobal = session=="global";
  var isMorning = session=="premarket";
  var isClosing = session=="closing";

  var signal = getSignal(mood.bull);
  var moodLabel = mood.bull>=55?"Bullish":mood.bull<=45?"Bearish":"Sideways";
  var moodColor = mood.bull>=55?UP:mood.bull<=45?DOWN:GOLD;

  var bestSector = isComm?"Bullion (Gold/Silver)":"Banking";
  var topStock = isComm?"GOLD":"ICICIBANK";
  var supLevel = isComm?"Rs 71,100 (Gold)":"23,850";
  var resLevel = isComm?"Rs 71,650 (Gold)":"24,050";
  var risk = isComm?"US CPI data tonight may cause volatility":"Auto sector showing weakness, avoid till trend improves";
  var event = isComm?"US Crude Inventory at 8:30 PM":"NIFTY Weekly Expiry today";
  var aiDecision = isComm
    ? "Gold holding above support, bullish bias continues. Crude weak, avoid till 6,850 reclaim."
    : "Banking remains strong. Watch ICICI Bank and HDFC Bank. Avoid weak Auto stocks until trend improves.";

  var title = isComm?"Today's Commodity Game Plan":isGlobal?"Tonight's Global Outlook":isClosing?"Today's Closing Summary":"Today's Game Plan";

  return (
    <div style={{background:"linear-gradient(135deg,#0B1224,#101B2E)",border:"1px solid "+BD,borderRadius:18,overflow:"hidden",marginBottom:12,boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>

      {/* Header with signal */}
      <div style={{padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:BLUE2,boxShadow:"0 0 6px "+BLUE2}}></div>
          <span style={{fontSize:11,fontWeight:800,color:T1}}>{title}</span>
        </div>
        <div style={{background:signal.bg,border:"1px solid "+signal.border,borderRadius:20,padding:"4px 12px",display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:10,fontWeight:900,color:signal.color}}>{signal.label}</span>
        </div>
      </div>

      <div style={{padding:"12px 14px"}}>

        {/* Mood + Confidence row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"9px 10px"}}>
            <div style={{fontSize:7,color:T3,marginBottom:3}}>MARKET MOOD</div>
            <div style={{fontSize:12,fontWeight:800,color:moodColor}}>{moodLabel} {Math.round(mood.bull)}%</div>
          </div>
          <div style={{background:"rgba(124,58,237,0.08)",borderRadius:10,padding:"9px 10px"}}>
            <div style={{fontSize:7,color:T3,marginBottom:3}}>AI CONFIDENCE</div>
            <div style={{fontSize:12,fontWeight:800,color:PURPLE2}}>{mood.conf}%</div>
          </div>
        </div>

        {/* Key data grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"9px 10px"}}>
            <div style={{fontSize:7,color:T3,marginBottom:3}}>BEST SECTOR TODAY</div>
            <div style={{fontSize:11,fontWeight:700,color:UP}}>{bestSector}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"9px 10px"}}>
            <div style={{fontSize:7,color:T3,marginBottom:3}}>TOP STOCK TO WATCH</div>
            <div style={{fontSize:11,fontWeight:700,color:BLUE2}}>{topStock}</div>
          </div>
          <div style={{background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:10,padding:"9px 10px"}}>
            <div style={{fontSize:7,color:T3,marginBottom:3}}>SUPPORT LEVEL</div>
            <div style={{fontSize:11,fontWeight:700,color:UP}}>{supLevel}</div>
          </div>
          <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"9px 10px"}}>
            <div style={{fontSize:7,color:T3,marginBottom:3}}>RESISTANCE LEVEL</div>
            <div style={{fontSize:11,fontWeight:700,color:DOWN}}>{resLevel}</div>
          </div>
        </div>

        {/* FII/DII */}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"9px 10px",marginBottom:8}}>
          <div style={{fontSize:7,color:T3,marginBottom:3}}>FII / DII ACTIVITY</div>
          <div style={{fontSize:11,fontWeight:700,color:UP}}>FII Rs 2,847 Cr Buy &#8226; DII Rs 1,234 Cr Buy</div>
        </div>

        {/* Risk + Event */}
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-start"}}>
          <span style={{fontSize:9,flexShrink:0}}>&#9888;</span>
          <div>
            <div style={{fontSize:7,color:T3,marginBottom:2}}>BIGGEST RISK TODAY</div>
            <div style={{fontSize:10,color:T1,lineHeight:1.5}}>{risk}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"flex-start"}}>
          <span style={{fontSize:9,flexShrink:0}}>&#128197;</span>
          <div>
            <div style={{fontSize:7,color:T3,marginBottom:2}}>TODAY IMPORTANT EVENT</div>
            <div style={{fontSize:10,color:T1,lineHeight:1.5}}>{event}</div>
          </div>
        </div>

        {/* AI Decision */}
        <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.06))",border:"1px solid rgba(124,58,237,0.25)",borderRadius:12,padding:"10px 12px"}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:8,fontWeight:900,color:"#fff"}}>AI</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:7,fontWeight:700,color:PURPLE2,marginBottom:3,letterSpacing:0.5}}>AI DECISION</div>
              <div style={{fontSize:10,color:T1,lineHeight:1.6}}>{aiDecision}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
      }
