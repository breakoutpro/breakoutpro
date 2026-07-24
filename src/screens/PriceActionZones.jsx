import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { DEMO_STOCKS } from "../data/marketsStocks";
import { generateDemoCandles, analyzeZones } from "../utils/priceActionZones";
import PatternChartEngine from "./PatternChartEngine";

// BreakoutPro - PriceActionZones.jsx
// "Smart Price Action Zones" - flagship educational feature. Shows historical
// support/resistance zones computed from (demo) candle history, overlaid on
// a chart. This is historical market analysis, not a prediction or a trade
// call - there is no BUY/SELL button, no probability, no guarantee anywhere
// on this screen, by design. Rules: no backtick, no triple-equals, ASCII.

export default function PriceActionZones(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, BD = theme.c.border, BD2 = theme.c.border2;
  var T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3, BLUE = theme.c.blue, UP = theme.c.up, DOWN = theme.c.down, WARN = theme.c.warn;

  var onBack = props.onBack || function(){};
  var [symIdx, setSymIdx] = useState(0);
  var sym = DEMO_STOCKS[symIdx];

  var candles = generateDemoCandles(sym.ltp, 90, sym.sym);
  var z = analyzeZones(candles);

  var lines = [];
  if(z.support) lines.push({y1:z.support.price, color:UP, label:"Support "+z.support.price, showAt:0});
  if(z.resistance) lines.push({y1:z.resistance.price, color:DOWN, label:"Resistance "+z.resistance.price, showAt:0});
  lines.push({y1:z.currentPrice, color:"#EAB308", dash:"2 3", label:"Current "+z.currentPrice, showAt:0});

  function ZoneCard(props2){
    var zone = props2.zone, label = props2.label, color = props2.color;
    if(!zone) return (
      <div style={{background:CARD2,border:"1px solid "+BD2,borderRadius:14,padding:14,flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:T2,marginBottom:6}}>{label}</div>
        <div style={{fontSize:12,color:T3}}>No qualifying zone found in this price history yet.</div>
      </div>
    );
    return (
      <div style={{background:CARD2,border:"1px solid "+color+"40",borderRadius:14,padding:14,flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:color,marginBottom:6}}>{label}</div>
        <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:8}}>Rs {zone.price}</div>
        <div style={{fontSize:12,color:T2,marginBottom:3}}>Zone Strength: <span style={{fontWeight:700,color:T1}}>{zone.strength}</span></div>
        <div style={{fontSize:12,color:T2,marginBottom:3}}>Price Touches: <span style={{fontWeight:700,color:T1}}>{zone.touches}</span></div>
        <div style={{fontSize:12,color:T2,marginBottom:3}}>Volume Confirmation: <span style={{fontWeight:700,color:zone.volumeConfirmed?UP:T3}}>{zone.volumeConfirmed?"Yes":"Not clear"}</span></div>
        <div style={{fontSize:12,color:T2}}>Last Tested: <span style={{fontWeight:700,color:T1}}>{zone.lastTested}</span></div>
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10,background:BG}}>
        <button onClick={onBack} style={{background:CARD2,border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>Smart Price Action Zones</div>
          <div style={{fontSize:12,color:T2}}>Historical Market Analysis &#8226; Educational Only</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:12,marginBottom:16}}>
          <div style={{fontSize:12,color:BLUE,lineHeight:1.6}}>This shows where price has historically reacted in the past. It is a study of past behaviour, not a prediction, not a signal, and not a guarantee of any future breakout or reversal.</div>
        </div>

        <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
          {DEMO_STOCKS.slice(0,12).map(function(s,i){
            var active = i==symIdx;
            return (
              <button key={s.sym} onClick={function(){setSymIdx(i);}} style={{background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:20,padding:"6px 14px",color:active?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>{s.sym}</button>
            );
          })}
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16}}>
          <PatternChartEngine spec={{candles:candles, lines:lines}} autoplay={false}/>
        </div>

        <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <ZoneCard zone={z.support} label="Strong Support Zone" color={UP}/>
          <ZoneCard zone={z.resistance} label="Strong Resistance Zone" color={DOWN}/>
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:12}}>Zone Summary</div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BD2}}>
            <span style={{fontSize:12,color:T2}}>Trend Direction</span>
            <span style={{fontSize:12,fontWeight:700,color:z.trend=="Uptrend"?UP:(z.trend=="Downtrend"?DOWN:T2)}}>{z.trend}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BD2}}>
            <span style={{fontSize:12,color:T2}}>Next Key Level</span>
            <span style={{fontSize:12,fontWeight:700,color:T1}}>{z.nextKeyLevel!=null?("Rs "+z.nextKeyLevel):"Not enough data"}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
            <span style={{fontSize:12,color:T2}}>Support-to-Resistance Ratio</span>
            <span style={{fontSize:12,fontWeight:700,color:T1}}>{z.riskReward!=null?(z.riskReward+" : 1"):"Not enough data"}</span>
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:WARN,lineHeight:1.6}}>Educational Analysis only. Not SEBI registered. Not investment advice. This is a historical price-action study using demo data - it is not a buy or sell recommendation, does not guarantee any breakout, and does not predict future price. Please consult a SEBI-registered investment adviser before making investment decisions.</div>
        </div>
      </div>
    </div>
  );
}
