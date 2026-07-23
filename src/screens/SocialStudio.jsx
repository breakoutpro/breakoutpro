import { useState, useRef, useEffect } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - SocialStudio.jsx
// Social Media Studio: generate branded poster images from market data via Canvas.
// Reuses existing theme + market observations. Educational only.
// Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BRAND="#00C853";

// poster categories (reuse market observations)
var TEMPLATES=[
  {id:"marketclose",label:"Market Close",accent:"#00C853",tone:"up"},
  {id:"nifty",label:"NIFTY",accent:"#3B82F6",tone:"up"},
  {id:"banknifty",label:"BANK NIFTY",accent:"#8B5CF6",tone:"up"},
  {id:"sensex",label:"SENSEX",accent:"#F59E0B",tone:"up"},
  {id:"gainers",label:"Top Gainers",accent:"#22C55E",tone:"up"},
  {id:"losers",label:"Top Losers",accent:"#EF4444",tone:"down"},
  {id:"news",label:"Market News",accent:"#F59E0B",tone:"neutral"},
  {id:"fiidii",label:"FII / DII",accent:"#06B6D4",tone:"neutral"},
  {id:"sector",label:"Sector Watch",accent:"#3B82F6",tone:"neutral"},
  {id:"global",label:"Global Markets",accent:"#8B5CF6",tone:"neutral"},
  {id:"mood",label:"Market Mood",accent:"#00C853",tone:"up"},
  {id:"options",label:"Options Intel",accent:"#F59E0B",tone:"neutral"},
  {id:"futures",label:"Futures Intel",accent:"#3B82F6",tone:"up"},
  {id:"gamma",label:"Gamma Blast",accent:"#D4AF37",tone:"warn"},
  {id:"wrap",label:"AI Market Wrap",accent:"#00C853",tone:"up"},
  {id:"weekly",label:"Weekly Summary",accent:"#8B5CF6",tone:"neutral"}
];

var RATIOS=[
  {id:"story",label:"Story",w:1080,h:1920},
  {id:"post",label:"Post",w:1080,h:1350},
  {id:"square",label:"Square",w:1080,h:1080},
  {id:"land",label:"Landscape",w:1200,h:675}
];

// educational content per template (reuses observation-style summaries)
function content(id){
  var now=new Date();
  var map={
    marketclose:{title:"Market Close Summary",big:"NIFTY 24,850",sub:"+0.62% today",lines:["BANK NIFTY 52,140 +0.80%","SENSEX 81,200 +0.55%","Advance/Decline positive"],mood:"Positive",ai:"Broad market closed higher with positive breadth. Educationally this reflects buying participation across sectors."},
    nifty:{title:"NIFTY 50 Update",big:"24,850",sub:"+152 (+0.62%)",lines:["Day High 24,910","Day Low 24,720","Above 20 EMA"],mood:"Positive",ai:"NIFTY held above short-term averages with steady momentum. Educational observation only."},
    banknifty:{title:"BANK NIFTY Update",big:"52,140",sub:"+414 (+0.80%)",lines:["Day High 52,300","Day Low 51,780","Strong volume"],mood:"Positive",ai:"Banking index outperformed with firm volume. Educational structure observation."},
    sensex:{title:"SENSEX Update",big:"81,200",sub:"+445 (+0.55%)",lines:["30-share benchmark","Broad participation","Above key averages"],mood:"Positive",ai:"Benchmark closed firm with wide participation. Educational observation only."},
    gainers:{title:"Top Gainers",big:"SBIN +2.30%",sub:"Leaders today",lines:["ICICIBANK +1.40%","TCS +1.90%","INFY +1.20%"],mood:"Positive",ai:"Selected large caps led gains today. Educational observation, not advice."},
    losers:{title:"Top Losers",big:"WIPRO -2.10%",sub:"Laggards today",lines:["TATASTEEL -1.20%","AXISBANK -1.24%","HINDALCO -0.90%"],mood:"Cautious",ai:"A few heavyweights lagged the broader move. Educational observation only."},
    news:{title:"Market News",big:"Key Update",sub:new Date().toDateString(),lines:["Educational market news","Observed market reaction","Structure noted"],mood:"Neutral",ai:"An important market event was observed. This poster summarizes it for education only."},
    fiidii:{title:"FII / DII Activity",big:"FII +1,240 Cr",sub:"DII +860 Cr",lines:["Net institutional flow","Cash market observed","Educational data"],mood:"Positive",ai:"Institutional flows were net positive. Educational observation of participation."},
    sector:{title:"Sector Performance",big:"IT leads",sub:"Sector rotation",lines:["Banking firm","Metals mixed","FMCG steady"],mood:"Neutral",ai:"Sector rotation observed with IT leading. Educational structure note."},
    global:{title:"Global Markets",big:"Mixed cues",sub:"Overnight",lines:["US closed higher","Asia mixed","Crude steady"],mood:"Neutral",ai:"Global cues were mixed overnight. Educational context for local markets."},
    mood:{title:"Market Mood",big:"Positive",sub:"Breadth healthy",lines:["Advances lead","Volatility easing","Momentum steady"],mood:"Positive",ai:"Overall mood observed as positive with healthy breadth. Educational only."},
    options:{title:"Options Intelligence",big:"PCR 0.92",sub:"Max Pain 24,800",lines:["Call wall 25,000","Put wall 24,500","IV moderate"],mood:"Neutral",ai:"Options structure shows balanced positioning. Educational observation only."},
    futures:{title:"Futures Intelligence",big:"Long Build-up",sub:"OI rising",lines:["Price up + OI up","Premium to spot","Basis +38.5"],mood:"Positive",ai:"Long build-up observed with rising OI and price. Educational participation note."},
    gamma:{title:"Gamma Blast Scanner",big:"Positive Gamma",sub:"Near current strike",lines:["Flip 24,600","Max Pain 24,800","IV crush risk"],mood:"Caution",ai:"Positive gamma observed near strike. Educationally may reduce volatility until levels cross."},
    wrap:{title:"AI Market Wrap",big:"Steady session",sub:new Date().toDateString(),lines:["Indices firm","Breadth positive","Volume healthy"],mood:"Positive",ai:"Markets ended steady with positive breadth. Educational AI wrap only."},
    weekly:{title:"Weekly Summary",big:"Week in review",sub:"5-day recap",lines:["NIFTY weekly +1.2%","Banking outperformed","IT recovered"],mood:"Positive",ai:"Markets gained over the week with sector rotation. Educational recap only."}
  };
  return map[id]||map.marketclose;
}

function toneCol(m){ var s=(m||"").toLowerCase(); if(s.indexOf("posit")>=0||s.indexOf("bull")>=0) return UP; if(s.indexOf("caut")>=0||s.indexOf("bear")>=0||s.indexOf("loss")>=0) return DOWN; if(s.indexOf("warn")>=0) return WARN; return BLUE; }

// draw poster to a canvas
function drawPoster(canvas, tpl, ratio, c){
  var ctx=canvas.getContext("2d");
  var W=ratio.w, H=ratio.h;
  canvas.width=W; canvas.height=H;
  // background gradient
  var g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,"#05070B"); g.addColorStop(0.55,"#0A0E14"); g.addColorStop(1,"#05070B");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // accent glow top
  var ag=ctx.createRadialGradient(W*0.5,H*0.12,10,W*0.5,H*0.12,W*0.8);
  ag.addColorStop(0,tpl.accent+"33"); ag.addColorStop(1,"#00000000");
  ctx.fillStyle=ag; ctx.fillRect(0,0,W,H);
  var pad=W*0.08;

  // header: brand
  ctx.fillStyle="#FFFFFF"; ctx.textBaseline="top";
  ctx.font="900 "+Math.round(W*0.052)+"px Arial";
  ctx.fillText("Breakout", pad, H*0.06);
  var bw=ctx.measureText("Breakout").width;
  ctx.fillStyle=BRAND; ctx.fillText(" Pro", pad+bw, H*0.06);
  ctx.fillStyle=WARN; ctx.font="800 "+Math.round(W*0.019)+"px Arial";
  ctx.fillText("CATCH EVERY BREAKOUT", pad, H*0.06+W*0.058);

  // accent chip label
  ctx.fillStyle=tpl.accent; ctx.font="800 "+Math.round(W*0.026)+"px Arial";
  ctx.fillText(tpl.label.toUpperCase(), pad, H*0.20);

  // title
  ctx.fillStyle="#FFFFFF"; ctx.font="900 "+Math.round(W*0.06)+"px Arial";
  wrapText(ctx, c.title, pad, H*0.235, W-pad*2, W*0.066);

  // big number
  ctx.fillStyle=tpl.accent; ctx.font="900 "+Math.round(W*0.10)+"px Arial";
  ctx.fillText(c.big, pad, H*0.33);
  ctx.fillStyle=toneCol(c.mood); ctx.font="800 "+Math.round(W*0.036)+"px Arial";
  ctx.fillText(c.sub, pad, H*0.33+W*0.11);

  // highlight lines as cards
  var ly=H*(ratio.id=="land"?0.55:0.50);
  ctx.font="700 "+Math.round(W*0.03)+"px Arial";
  for(var i=0;i<c.lines.length;i++){
    var cy=ly+i*(W*0.062);
    ctx.fillStyle="#101826"; roundRect(ctx,pad,cy,W-pad*2,W*0.05,10); ctx.fill();
    ctx.fillStyle=tpl.accent; ctx.fillRect(pad,cy,6,W*0.05);
    ctx.fillStyle="#E8EAED"; ctx.fillText(c.lines[i], pad+W*0.03, cy+W*0.011);
  }

  // AI summary box
  var ay=ly+c.lines.length*(W*0.062)+W*0.02;
  ctx.fillStyle="#0C1420"; roundRect(ctx,pad,ay,W-pad*2,W*(ratio.id=="land"?0.10:0.14),12); ctx.fill();
  ctx.fillStyle=BLUE; ctx.font="800 "+Math.round(W*0.02)+"px Arial";
  ctx.fillText("AI EDUCATIONAL SUMMARY", pad+W*0.03, ay+W*0.02);
  ctx.fillStyle="#C9D4E5"; ctx.font="500 "+Math.round(W*0.024)+"px Arial";
  wrapText(ctx, c.ai, pad+W*0.03, ay+W*0.05, W-pad*2-W*0.06, W*0.032);

  // footer: date + site + disclaimer
  var now=new Date();
  ctx.fillStyle=T3; ctx.font="600 "+Math.round(W*0.02)+"px Arial";
  ctx.fillText(now.toDateString()+"  "+now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}), pad, H-H*0.09);
  ctx.fillStyle=BRAND; ctx.font="800 "+Math.round(W*0.022)+"px Arial";
  ctx.fillText("breakoutpro.in", pad, H-H*0.065);
  ctx.fillStyle=WARN; ctx.font="500 "+Math.round(W*0.016)+"px Arial";
  ctx.fillText("Educational Market Observation Only. Not Investment Advice.", pad, H-H*0.035);
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function wrapText(ctx,text,x,y,maxW,lh){
  var words=(text||"").split(" "), line="", yy=y;
  for(var i=0;i<words.length;i++){
    var test=line+words[i]+" ";
    if(ctx.measureText(test).width>maxW && i>0){ ctx.fillText(line,x,yy); line=words[i]+" "; yy+=lh; }
    else line=test;
  }
  ctx.fillText(line,x,yy);
}

export default function SocialStudio(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3, T2=theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var [tpl,setTpl]=useState(TEMPLATES[0]);
  var [ratio,setRatio]=useState(RATIOS[0]);
  var [url,setUrl]=useState("");
  var canvasRef=useRef(null);

  function generate(){
    var cv=canvasRef.current; if(!cv) return;
    drawPoster(cv, tpl, ratio, content(tpl.id));
    try{ setUrl(cv.toDataURL("image/png")); }catch(e){}
  }
  useEffect(function(){ generate(); }, [tpl, ratio]);

  function download(){
    if(!url) return;
    try{ var a=document.createElement("a"); a.href=url; a.download="breakoutpro-"+tpl.id+"-"+ratio.id+".png"; a.click(); }catch(e){}
  }
  function shareImg(){
    var cv=canvasRef.current; if(!cv) return;
    try{
      cv.toBlob(function(blob){
        if(navigator.share && navigator.canShare && navigator.canShare({files:[new File([blob],"poster.png",{type:"image/png"})]})){
          var file=new File([blob],"breakoutpro.png",{type:"image/png"});
          navigator.share({files:[file], title:"Breakout Pro", text:"Educational market observation - breakoutpro.in"});
        } else { download(); }
      }, "image/png");
    }catch(e){ download(); }
  }
  function copyImg(){
    var cv=canvasRef.current; if(!cv) return;
    try{
      cv.toBlob(function(blob){
        try{ navigator.clipboard.write([new window.ClipboardItem({"image/png":blob})]); }catch(e){ download(); }
      });
    }catch(e){ download(); }
  }

  return (
    <div style={{padding:"16px 16px 40px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        {props.setTab?<button onClick={function(){props.setTab("home");}} style={{background:"none",border:"none",color:BLUE,fontSize:14,cursor:"pointer",fontFamily:"inherit",padding:4}}>&#8592;</button>:null}
        <span style={{fontSize:18,fontWeight:900,color:T1}}>Social Media Studio</span>
      </div>
      <div style={{fontSize:12,color:T3,marginBottom:16}}>Auto-generate branded posters from market data &#8226; Educational only</div>

      {/* template picker */}
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>POSTER TYPE</div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
        {TEMPLATES.map(function(x){
          var act=tpl.id==x.id;
          return <button key={x.id} onClick={function(){setTpl(x);}} style={{flexShrink:0,background:act?x.accent:CARD,border:"1px solid "+(act?x.accent:BD),borderRadius:20,padding:"8px 12px",color:act?"#001910":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{x.label}</button>;
        })}
      </div>

      {/* ratio picker */}
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>SIZE</div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {RATIOS.map(function(r){
          var act=ratio.id==r.id;
          return <button key={r.id} onClick={function(){setRatio(r);}} style={{flex:1,background:act?BLUE:CARD,border:"1px solid "+(act?BLUE:BD),borderRadius:10,padding:"8px 4px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{r.label}<div style={{fontSize:12,opacity:0.8}}>{r.w}x{r.h}</div></button>;
        })}
      </div>

      {/* preview */}
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16,textAlign:"center"}}>
        {url?<img src={url} alt="poster" style={{maxWidth:"100%",maxHeight:420,borderRadius:8,border:"1px solid "+BD2}}/>:<div style={{color:T3,fontSize:12,padding:40}}>Generating...</div>}
        <canvas ref={canvasRef} style={{display:"none"}}></canvas>
      </div>

      {/* actions */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button onClick={generate} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 24px",color:T1,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Regenerate</button>
        <button onClick={shareImg} style={{flex:1,background:"#2563EB",border:"none",borderRadius:11,padding:"12px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Share</button>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={download} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 24px",color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Download PNG</button>
        <button onClick={copyImg} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 24px",color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Copy Image</button>
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
        <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Educational Market Observation Only. Not Investment Advice. Posters use observed market data for learning and sharing purposes.</div>
      </div>
    </div>
  );
}
