import { useState } from "react";
import { TAGLINE, INDEX_STRIP, MOOD, FIIDII, GLOBAL } from "./MarketsTopData";
import { IndexDetailPage, VIXDetailPage, FlowDetailPage } from "./MarketsTopDetail";
import IndexFullPage from "./IndexFullPage";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - MarketsTop.jsx
// Premium intelligence header. Compact horizontal indices, clickable detail pages.
// Pure black, green/red only for direction. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function Head(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2;

  return <div style={{fontSize:10.5,color:T2,fontWeight:800,letterSpacing:0.6,margin:"0 0 9px"}}>{props.children}</div>;
}

export default function MarketsTop(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, CARD2 = theme.c.card2, GOLD = theme.c.gold, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var setTab=props.setTab||function(){};
  var [view,setView]=useState(null);

  if(view&&view.type=="index") return <IndexFullPage idx={{key:view.key,label:view.label,ltp:view.val,up:view.up,pct:view.pct}} onBack={function(){setView(null);}}/>;
  if(view&&view.type=="gift")  return <IndexDetailPage idxKey="GIFT" onBack={function(){setView(null);}} onStock={props.onStock}/>;
  if(view&&view.type=="vix")   return <VIXDetailPage onBack={function(){setView(null);}}/>;
  if(view&&view.type=="flow")  return <FlowDetailPage onBack={function(){setView(null);}}/>;

  function openIdx(k){
    if(k=="VIX"){ setView({type:"vix"}); return; }
    if(k=="GIFT"){ setView({type:"gift"}); return; }
    var item=INDEX_STRIP.filter(function(x){return x.key==k;})[0]||{};
    setView({type:"index",key:k,label:item.name,val:item.val,up:item.up,pct:parseFloat(item.chg)});
  }

  return (
    <div style={{padding:"4px 14px 0"}}>

      {/* TAGLINE */}
      <div style={{marginBottom:13}}>
        <div style={{fontSize:15,fontWeight:900,color:T1}} dangerouslySetInnerHTML={{__html:TAGLINE.main}}/>
        <div style={{fontSize:9.5,color:T3,fontWeight:600,marginTop:2}} dangerouslySetInnerHTML={{__html:TAGLINE.sub}}/>
      </div>

      {/* INDEX STRIP - compact horizontal scroll */}
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,marginBottom:14}}>
        {INDEX_STRIP.map(function(x){
          return (
            <div key={x.key} onClick={function(){openIdx(x.key);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"9px 12px",minWidth:108,flexShrink:0,cursor:"pointer"}}>
              <div style={{fontSize:8.5,color:T2,fontWeight:600,marginBottom:3}}>{x.name}</div>
              <div style={{fontSize:13.5,fontWeight:800,color:T1,fontFamily:"monospace"}}>{x.val}</div>
              <div style={{fontSize:9.5,fontWeight:700,color:x.up?UP:DOWN,marginTop:1}}>{x.chg}</div>
            </div>
          );
        })}
      </div>

      {/* MARKET SENTIMENT */}
      <Head>MARKET SENTIMENT</Head>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,textAlign:"center"}}>
          <div style={{fontSize:9,color:T2,marginBottom:5}}>Market Mood</div>
          <div style={{fontSize:17,fontWeight:900,color:MOOD.label=="Bullish"?UP:MOOD.label=="Bearish"?DOWN:GOLD}}>{MOOD.label}</div>
          <div style={{fontSize:9,color:T3,marginTop:3}}>Score {MOOD.score}/100</div>
        </div>
        <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,textAlign:"center"}}>
          <div style={{fontSize:9,color:T2,marginBottom:5}}>Fear &amp; Greed</div>
          <div style={{fontSize:17,fontWeight:900,color:MOOD.fg>=55?UP:MOOD.fg<=45?DOWN:GOLD}}>{MOOD.fg}</div>
          <div style={{fontSize:9,color:T3,marginTop:3}}>{MOOD.fgLabel}</div>
        </div>
      </div>

      {/* FII / DII - clickable to full details */}
      <div onClick={function(){setView({type:"flow"});}} style={{cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"0 0 9px"}}>
          <span style={{fontSize:10.5,color:T2,fontWeight:800,letterSpacing:0.6}}>INSTITUTIONAL FLOW  &#8226;  FII / DII</span>
          <span style={{fontSize:9,color:BLUE,fontWeight:700}}>View details &#8250;</span>
        </div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:16}}>
          {FIIDII.map(function(x,i){
            return (
              <div key={x.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",borderBottom:i<FIIDII.length-1?"1px solid "+BD:"none"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{x.name}</div>
                  <div style={{fontSize:8.5,color:T3,marginTop:1}}>{x.note}</div>
                </div>
                <div style={{fontSize:14,fontWeight:800,color:x.up?UP:DOWN,fontFamily:"monospace"}}>{x.val}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GLOBAL MARKETS */}
      <Head>GLOBAL MARKETS</Head>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:8}}>
        {GLOBAL.map(function(x){
          return (
            <div key={x.name} style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:"9px 11px",minWidth:96,flexShrink:0}}>
              <div style={{fontSize:9,color:T2,marginBottom:3}}>{x.name}</div>
              <div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace"}}>{x.val}</div>
              <div style={{fontSize:9.5,fontWeight:700,color:x.up?UP:DOWN,marginTop:1}}>{x.chg}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
