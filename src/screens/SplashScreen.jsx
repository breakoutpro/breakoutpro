import { useEffect, useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - SplashScreen.jsx
// Fast CSS-only premium splash. No image load. Skyline glow + candles + feature cards.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#04060D",T1="#FFFFFF",T2="#9CA3AF",BLUE="#3B82F6",CYAN="#60A5FA";
var GREEN="#22C55E",RED="#EF4444",PURPLE="#8B5CF6",GOLD="#F59E0B",ORANGE="#F97316";

var FEATURES=[
  {ic:"&#128200;",c:GREEN, name:"Stocks"},
  {ic:"&#128202;",c:PURPLE,name:"Mutual Funds"},
  {ic:"&#128240;",c:CYAN,  name:"News"},
  {ic:"&#128640;",c:ORANGE,name:"Startups"},
  {ic:"&#127758;",c:BLUE,  name:"Global"},
  {ic:"&#128167;",c:GOLD,  name:"Commodities"},
  {ic:"&#8377;",  c:GREEN, name:"Currencies"},
  {ic:"&#128269;",c:PURPLE,name:"Research"},
  {ic:"&#128188;",c:CYAN,  name:"Portfolio"},
  {ic:"&#9889;",  c:GOLD,  name:"Smart Alerts"},
];

export default function SplashScreen(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue;

  var [prog,setProg]=useState(0);
  useEffect(function(){
    var t=setInterval(function(){
      setProg(function(p){ return p>=100?100:p+7; });
    },45);
    return function(){clearInterval(t);};
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:BG,zIndex:9999,overflow:"hidden",fontFamily:"'Inter',Arial,sans-serif",display:"flex",flexDirection:"column"}}>

      {/* SKYLINE GLOW BACKDROP */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"42%",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:340,height:200,background:"radial-gradient(ellipse at center bottom,rgba(59,130,246,0.35),transparent 70%)"}}></div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:84,display:"flex",alignItems:"flex-end",justifyContent:"center",gap:3,opacity:0.5}}>
          {[40,65,50,80,55,95,60,75,45,85,58,70,48].map(function(h,i){
            return <div key={i} style={{width:16,height:h,background:"linear-gradient(180deg,rgba(59,130,246,0.4),rgba(4,6,13,0.9))",borderRadius:"2px 2px 0 0"}}></div>;
          })}
        </div>
        <div style={{position:"absolute",top:28,right:22,display:"flex",alignItems:"flex-end",gap:3,opacity:0.7}}>
          {[["#22C55E",28],["#EF4444",20],["#22C55E",34],["#22C55E",26]].map(function(c,i){
            return (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:1,height:6,background:c[0]}}></div>
                <div style={{width:7,height:c[1],background:c[0],borderRadius:1}}></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HERO */}
      <div style={{position:"relative",paddingTop:"16%",textAlign:"center",flexShrink:0}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:11,marginBottom:8}}>
          <div style={{width:54,height:54,borderRadius:15,background:"linear-gradient(135deg,#3B82F6,#1D4ED8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 24px rgba(59,130,246,0.5)"}}>
            <span style={{fontSize:22,fontWeight:900,color:"#fff"}} dangerouslySetInnerHTML={{__html:"&#128200;"}}/>
          </div>
          <div style={{fontSize:34,fontWeight:900,color:T1,letterSpacing:-0.5}}>Breakout<span style={{color:BLUE}}> Pro</span></div>
        </div>
        <div style={{fontSize:10,color:T2,fontWeight:700,letterSpacing:3,marginBottom:14}}>CATCH EVERY BREAKOUT</div>
        <div style={{fontSize:13,color:CYAN,fontWeight:600}}>India's Next Generation</div>
        <div style={{fontSize:17,color:BLUE,fontWeight:800,marginTop:2}}>Market Intelligence Platform</div>
      </div>

      {/* FEATURE GRID */}
      <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 16px"}}>
        <div style={{textAlign:"center",fontSize:9.5,color:T2,fontWeight:800,letterSpacing:1.5,marginBottom:13}}>EVERYTHING YOU NEED TO TRADE SMARTER</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:7}}>
          {FEATURES.map(function(f,i){
            return (
              <div key={f.name} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:11,padding:"11px 3px",textAlign:"center",animation:"sp-pop 0.35s ease both",animationDelay:(i*0.04)+"s"}}>
                <span style={{fontSize:16,color:f.c}} dangerouslySetInnerHTML={{__html:f.ic}}/>
                <div style={{fontSize:7.5,fontWeight:700,color:T1,marginTop:5,lineHeight:1.15}}>{f.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TAGLINE + LOADER */}
      <div style={{position:"relative",padding:"0 24px 38px",flexShrink:0}}>
        <div style={{textAlign:"center",marginBottom:15}}>
          <div style={{fontSize:13,color:T1,fontWeight:700}}>One Platform. Complete Market Intelligence.</div>
          <div style={{fontSize:11.5,color:BLUE,fontWeight:700,marginTop:3}}>For Traders. For Investors. For Tomorrow.</div>
        </div>
        <div style={{fontSize:10,color:T2,textAlign:"center",marginBottom:9}}>Loading Breakout Opportunities...</div>
        <div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:prog+"%",background:"linear-gradient(90deg,#3B82F6,#60A5FA)",borderRadius:3,transition:"width 0.1s",boxShadow:"0 0 12px rgba(59,130,246,0.7)"}}></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:"@keyframes sp-pop{from{opacity:0;transform:translateY(8px) scale(0.92);}to{opacity:1;transform:translateY(0) scale(1);}}"}}/>
    </div>
  );
}
