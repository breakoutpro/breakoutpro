import { useState } from "react";

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",T1="#FFFFFF",T2="#8899BB",T3="#475569";

var CANDLES=[
  {name:"Hammer",type:"bullish",desc:"Small body, long lower wick. Forms after downtrend, signals reversal.",reliability:"High"},
  {name:"Inverted Hammer",type:"bullish",desc:"Small body, long upper wick. Early reversal signal at support.",reliability:"Medium"},
  {name:"Bullish Engulfing",type:"bullish",desc:"Large green candle fully engulfs prior red candle. Strong reversal signal.",reliability:"High"},
  {name:"Morning Star",type:"bullish",desc:"Three-candle pattern: down, small body, strong up. Major bottom reversal.",reliability:"High"},
  {name:"Piercing Line",type:"bullish",desc:"Green candle opens below prior low, closes above midpoint of red candle.",reliability:"Medium"},
  {name:"Three White Soldiers",type:"bullish",desc:"Three consecutive long green candles. Strong continuation/reversal.",reliability:"High"},
  {name:"Bullish Marubozu",type:"bullish",desc:"No wicks, full green body. Strong buying pressure throughout session.",reliability:"Medium"},
  {name:"Tweezer Bottom",type:"bullish",desc:"Two candles with matching lows. Support rejection signal.",reliability:"Medium"},
  {name:"Shooting Star",type:"bearish",desc:"Small body, long upper wick. Forms after uptrend, signals reversal.",reliability:"High"},
  {name:"Hanging Man",type:"bearish",desc:"Small body, long lower wick at top of uptrend. Warning sign.",reliability:"Medium"},
  {name:"Bearish Engulfing",type:"bearish",desc:"Large red candle fully engulfs prior green candle. Strong reversal signal.",reliability:"High"},
  {name:"Evening Star",type:"bearish",desc:"Three-candle pattern: up, small body, strong down. Major top reversal.",reliability:"High"},
  {name:"Dark Cloud Cover",type:"bearish",desc:"Red candle opens above prior high, closes below midpoint of green candle.",reliability:"Medium"},
  {name:"Three Black Crows",type:"bearish",desc:"Three consecutive long red candles. Strong continuation/reversal.",reliability:"High"},
  {name:"Bearish Marubozu",type:"bearish",desc:"No wicks, full red body. Strong selling pressure throughout session.",reliability:"Medium"},
  {name:"Tweezer Top",type:"bearish",desc:"Two candles with matching highs. Resistance rejection signal.",reliability:"Medium"},
  {name:"Doji",type:"neutral",desc:"Open and close nearly equal. Indecision, often precedes reversal.",reliability:"Medium"},
  {name:"Spinning Top",type:"neutral",desc:"Small body, wicks on both sides. Market indecision.",reliability:"Low"},
  {name:"Long-Legged Doji",type:"neutral",desc:"Very long wicks both sides, tiny body. Extreme indecision.",reliability:"Low"},
  {name:"Inside Bar",type:"neutral",desc:"Current candle range fully within prior candle. Consolidation signal.",reliability:"Low"},
  {name:"Outside Bar",type:"neutral",desc:"Current candle range fully engulfs prior candle. Volatility expansion.",reliability:"Medium"},
  {name:"Dragonfly Doji",type:"bullish",desc:"Long lower wick, open=close=high. Strong reversal at support.",reliability:"Medium"},
  {name:"Gravestone Doji",type:"bearish",desc:"Long upper wick, open=close=low. Strong reversal at resistance.",reliability:"Medium"},
];

function CandleSVG(props){
  var type=props.type;
  var col=type=="bullish"?G2:type=="bearish"?R:GOLD;
  var shapes={
    "Hammer":{bodyTop:35,bodyH:15,wickTop:5,wickBot:75},
    "Inverted Hammer":{bodyTop:25,bodyH:15,wickTop:5,wickBot:50},
    "Bullish Engulfing":{bodyTop:20,bodyH:40,wickTop:15,wickBot:65},
    "Morning Star":{bodyTop:30,bodyH:20,wickTop:20,wickBot:55},
    "Shooting Star":{bodyTop:25,bodyH:15,wickTop:5,wickBot:45},
    "Hanging Man":{bodyTop:25,bodyH:15,wickTop:15,wickBot:75},
    "Bearish Engulfing":{bodyTop:15,bodyH:40,wickTop:10,wickBot:60},
    "Doji":{bodyTop:38,bodyH:4,wickTop:10,wickBot:70},
    "Spinning Top":{bodyTop:35,bodyH:10,wickTop:10,wickBot:70},
  };
  var sh=shapes[props.name]||{bodyTop:30,bodyH:20,wickTop:15,wickBot:65};
  return (
    <svg width="50" height="90" viewBox="0 0 50 90">
      <line x1="25" y1={sh.wickTop} x2="25" y2={sh.wickBot} stroke={col} strokeWidth="2"/>
      <rect x="14" y={sh.bodyTop} width="22" height={sh.bodyH} fill={col} rx="2"/>
    </svg>
  );
}

export default function CandleLibrary(props){
  var setTab = props.setTab || function(){};
  var [filter,setFilter]=useState("all");
  var [selected,setSelected]=useState(null);

  var filtered = filter=="all" ? CANDLES : CANDLES.filter(function(c){return c.type==filter;});

  if(selected){
    return (
      <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:30}}>
        <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setSelected(null);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
          <div style={{fontSize:14,fontWeight:800,color:T1}}>{selected.name}</div>
        </div>
        <div style={{padding:20,textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <CandleSVG name={selected.name} type={selected.type}/>
          </div>
          <div style={{background:(selected.type=="bullish"?"rgba(0,200,83,0.1)":selected.type=="bearish"?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)"),borderRadius:20,padding:"4px 14px",display:"inline-block",marginBottom:16}}>
            <span style={{fontSize:10,fontWeight:700,color:selected.type=="bullish"?G2:selected.type=="bearish"?R:GOLD,textTransform:"capitalize"}}>{selected.type} Signal</span>
          </div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:16,textAlign:"left"}}>
            <div style={{fontSize:11,color:T2,lineHeight:1.8,marginBottom:14}}>{selected.desc}</div>
            <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid "+BD,paddingTop:12}}>
              <span style={{fontSize:9,color:T3}}>Reliability</span>
              <span style={{fontSize:10,fontWeight:700,color:selected.reliability=="High"?G2:selected.reliability=="Medium"?GOLD:T2}}>{selected.reliability}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:30}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:15,fontWeight:900,color:T1,marginBottom:2}}>Candle <span style={{color:BLUE}}>Library</span></div>
        <div style={{fontSize:9,color:T2}}>{CANDLES.length} candlestick patterns - quick reference</div>
      </div>

      <div style={{padding:"12px 16px"}}>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["all","All"],["bullish","Bullish"],["bearish","Bearish"],["neutral","Neutral"]].map(function(f){
            var act=filter==f[0];
            var col=f[0]=="bullish"?G2:f[0]=="bearish"?R:f[0]=="neutral"?GOLD:BLUE;
            return <button key={f[0]} onClick={function(){setFilter(f[0]);}} style={{flex:1,background:act?col+"18":"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:BD),borderRadius:8,padding:"7px 4px",color:act?col:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>;
          })}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {filtered.map(function(c){
            var col=c.type=="bullish"?G2:c.type=="bearish"?R:GOLD;
            return (
              <div key={c.name} onClick={function(){setSelected(c);}} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 10px",cursor:"pointer",textAlign:"center"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                  <CandleSVG name={c.name} type={c.type}/>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T1,marginBottom:4}}>{c.name}</div>
                <span style={{fontSize:7,fontWeight:700,color:col,background:col+"15",borderRadius:6,padding:"2px 6px"}}>{c.type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
