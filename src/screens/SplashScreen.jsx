import { useEffect, useState } from "react";

// BreakoutPro - SplashScreen.jsx
// Premium splash. Hero bull image on top, animated feature cards below, loader.
// Place the hero image at public/splash.png in the repo.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#04060D",T1="#FFFFFF",T2="#9CA3AF",BLUE="#3B82F6",CYAN="#60A5FA";
var GREEN="#22C55E",PURPLE="#8B5CF6",GOLD="#F59E0B",ORANGE="#F97316";

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
  var [prog,setProg]=useState(0);
  useEffect(function(){
    // App controls when splash closes. We only animate the loader bar here.
    var t=setInterval(function(){
      setProg(function(p){ return p>=100?100:p+3; });
    },45);
    return function(){clearInterval(t);};
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:BG,zIndex:9999,overflow:"hidden",fontFamily:"'Inter',Arial,sans-serif",display:"flex",flexDirection:"column"}}>

      {/* HERO IMAGE (bull + skyline + logo + tagline) */}
      <div style={{position:"relative",flexShrink:0,height:"58%",overflow:"hidden"}}>
        <img src="/splash.png" alt="Breakout Pro" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
        {/* fade into the dark bottom so cards blend in */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:90,background:"linear-gradient(180deg,transparent,"+BG+")"}}></div>
      </div>

      {/* FEATURE GRID */}
      <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 16px",marginTop:-10}}>
        <div style={{textAlign:"center",fontSize:9.5,color:T2,fontWeight:800,letterSpacing:1.5,marginBottom:13}}>EVERYTHING YOU NEED TO TRADE SMARTER</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:7}}>
          {FEATURES.map(function(f,i){
            return (
              <div key={f.name} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:11,padding:"11px 3px",textAlign:"center",animation:"sp-pop 0.4s ease both",animationDelay:(i*0.06)+"s"}}>
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

      <style dangerouslySetInnerHTML={{__html:"@keyframes sp-pop{from{opacity:0;transform:translateY(10px) scale(0.9);}to{opacity:1;transform:translateY(0) scale(1);}}"}}/>
    </div>
  );
}
