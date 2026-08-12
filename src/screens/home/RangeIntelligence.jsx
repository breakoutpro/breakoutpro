// BreakoutPro - RangeIntelligence.jsx
// Full-screen Range Intelligence feature with quick feature-switch
// navigation. HONESTY NOTE: no real multi-timeframe OHLC candle provider
// exists anywhere in this codebase (confirmed - only current-price
// snapshots via the Yahoo-backed /api/market-snapshot exist, no historical
// per-timeframe candles). Every range/breakout/volume value below is
// therefore "Data unavailable right now." - this is the correct, honest
// state per the explicit no-fabrication rule, not a bug.

import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";

var SYMBOLS = ["NIFTY 50", "BANK NIFTY", "SENSEX", "FINNIFTY", "RELIANCE", "TCS", "HDFCBANK", "ICICIBANK"];
var TIMEFRAMES = ["1m", "3m", "5m", "10m", "15m", "30m", "1H", "4H", "1D"];
var MAX_TIMEFRAMES = 4;

var FEATURES = [
  {id: "rangeintel", label: "Range Intelligence", icon: "\uD83D\uDE80", tabLabel: "Range"},
  {id: "scan", label: "Breakout Scanner", icon: "\uD83D\uDCCA", tabLabel: "Breakout"},
  {id: "pazones", label: "Key Levels", icon: "\uD83D\uDCC8", tabLabel: "Key Levels"},
  {id: "optionsintelpro", label: "Options Intelligence", icon: "\uD83D\uDCCB", tabLabel: "Options"},
  {id: "guardian", label: "AI Market Mood", icon: "\uD83E\uDDE0", tabLabel: "AI"},
  {id: "news", label: "Market News", icon: "\uD83D\uDCF0", tabLabel: "News"}
];

export default function RangeIntelligence(props){
  var theme = useTheme();
  var responsive = useResponsive();
  var isMobile = responsive.isMobile;
  var BG=theme.c.bg, CARD=theme.c.card, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3, BLUE=theme.c.blue;

  var [switcherOpen, setSwitcherOpen] = useState(false);
  var [symbol, setSymbol] = useState("NIFTY 50");
  var [selectedTfs, setSelectedTfs] = useState(["5m","15m","1H","1D"]);

  function toggleTf(tf){
    setSelectedTfs(function(prev){
      if(prev.indexOf(tf)>=0) return prev.filter(function(t){ return t!==tf; });
      if(prev.length>=MAX_TIMEFRAMES) return prev; // hard cap at 4, per spec
      return prev.concat([tf]);
    });
  }

  return (
    <div style={{background:BG,minHeight:"100vh",width:"100%",boxSizing:"border-box",fontFamily:"'Inter',Arial,sans-serif",color:T1}}>

      {/* 1. STICKY FULL-SCREEN HEADER */}
      <div style={{position:"sticky",top:0,zIndex:20,background:CARD,borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px"}}>
        <button onClick={function(){props.setTab("home");}} style={{background:"none",border:"none",color:T2,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>&#8592; Home</button>
        <span style={{fontSize:15,fontWeight:800,color:T1}}>Range Intelligence</span>
        <div style={{position:"relative"}}>
          <button onClick={function(){setSwitcherOpen(function(p){return !p;});}} onBlur={function(){setTimeout(function(){setSwitcherOpen(false);},150);}} style={{background:"none",border:"none",color:T2,fontSize:18,cursor:"pointer",padding:"2px 6px"}}>&#8942;</button>
          {switcherOpen ? (
            <div style={{position:"absolute",top:"130%",right:0,minWidth:220,background:CARD,border:"1px solid "+BD,borderRadius:10,overflow:"hidden",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,0.35)",padding:"6px 0"}}>
              {FEATURES.map(function(f){
                var active = f.id==="rangeintel";
                return (
                  <button key={f.id} onMouseDown={function(){ if(!active) props.setTab(f.id); }} style={{width:"100%",background:"none",border:"none",textAlign:"left",padding:"9px 14px",color:T1,fontSize:13,fontWeight:active?800:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
                    <span>{f.icon}</span><span style={{flex:1}}>{f.label}</span>{active?<span style={{color:UP_COLOR(theme)}}>&#10003;</span>:null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. HORIZONTAL FEATURE TABS */}
      <div style={{position:"sticky",top:45,zIndex:19,background:BG,borderBottom:"1px solid "+BD,display:"flex",gap:4,overflowX:"auto",WebkitOverflowScrolling:"touch",padding:"8px 12px",whiteSpace:"nowrap"}}>
        {FEATURES.map(function(f){
          var active = f.id==="rangeintel";
          return (
            <button key={f.id} onClick={function(){ if(!active) props.setTab(f.id); }} style={{flexShrink:0,background:active?theme.c.blueSoft:"none",border:"none",borderRadius:8,padding:"6px 12px",color:active?BLUE:T2,fontSize:12,fontWeight:active?800:600,cursor:"pointer",fontFamily:"inherit"}}>{f.tabLabel}</button>
          );
        })}
      </div>

      <div style={{padding:isMobile?"12px":"16px 20px"}}>

        {/* 3. SYMBOL SELECTOR */}
        <div style={{display:"flex",gap:6,overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:14,paddingBottom:2}}>
          {SYMBOLS.map(function(s){
            var active = s===symbol;
            return <button key={s} onClick={function(){setSymbol(s);}} style={{flexShrink:0,background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:8,padding:"6px 12px",color:active?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>;
          })}
        </div>

        {/* 4. TIMEFRAME SELECTOR - max 4 */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:T3,fontWeight:700,marginBottom:6}}>TIMEFRAMES ({selectedTfs.length}/{MAX_TIMEFRAMES} selected)</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
            {TIMEFRAMES.map(function(tf){
              var active = selectedTfs.indexOf(tf)>=0;
              var disabled = !active && selectedTfs.length>=MAX_TIMEFRAMES;
              return <button key={tf} onClick={function(){toggleTf(tf);}} disabled={disabled} style={{flexShrink:0,background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:8,padding:"6px 12px",color:active?"#fff":(disabled?T3:T2),fontSize:12,fontWeight:700,cursor:disabled?"default":"pointer",fontFamily:"inherit",opacity:disabled?0.5:1}}>{tf}</button>;
            })}
          </div>
        </div>

        {/* 5. TIMEFRAME PANELS */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat("+Math.min(selectedTfs.length,4)+", minmax(0, 1fr))",gap:12,marginBottom:16}}>
          {selectedTfs.map(function(tf){
            return (
              <div key={tf} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:14,boxSizing:"border-box"}}>
                <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>{symbol} &middot; {tf}</div>
                <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",background:CARD2,borderRadius:8,marginBottom:10,fontSize:11,color:T3}}>Data unavailable right now.</div>
                {["High","Low","Range","Range %","Range Status","Breakout Level","Breakdown Level","Volume","Trend"].map(function(label){
                  return (
                    <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid "+BD2}}>
                      <span style={{fontSize:11,color:T3}}>{label}</span>
                      <span style={{fontSize:11,color:T2,fontWeight:700}}>Data unavailable right now.</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 6. RANGE INSIGHT */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:8}}>Range Insight</div>
          <div style={{fontSize:12,color:T3}}>Data unavailable right now.</div>
        </div>

        {/* 7. COMPARISON TABLE - only when 4 timeframes selected */}
        {selectedTfs.length===MAX_TIMEFRAMES ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:14,overflowX:"auto"}}>
            <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Timeframe Comparison</div>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
              <thead>
                <tr style={{borderBottom:"1px solid "+BD2}}>
                  {["TIMEFRAME","RANGE","RANGE %","STATUS","BREAKOUT","BREAKDOWN"].map(function(h){
                    return <th key={h} style={{textAlign:"left",fontSize:10,color:T3,fontWeight:700,padding:"4px 8px",whiteSpace:"nowrap"}}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {selectedTfs.map(function(tf){
                  return (
                    <tr key={tf} style={{borderBottom:"1px solid "+BD2}}>
                      <td style={{fontSize:11,fontWeight:700,color:T1,padding:"6px 8px"}}>{tf}</td>
                      <td style={{fontSize:11,color:T3,padding:"6px 8px"}}>Data unavailable right now.</td>
                      <td style={{fontSize:11,color:T3,padding:"6px 8px"}}>--</td>
                      <td style={{fontSize:11,color:T3,padding:"6px 8px"}}>--</td>
                      <td style={{fontSize:11,color:T3,padding:"6px 8px"}}>--</td>
                      <td style={{fontSize:11,color:T3,padding:"6px 8px"}}>--</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <div style={{fontSize:10,color:T3,textAlign:"center",marginTop:16}}>Educational market structure analysis only. Not investment advice.</div>
      </div>
    </div>
  );
}

function UP_COLOR(theme){ return theme.c.up; }
