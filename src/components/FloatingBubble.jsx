import { useState, useRef, useEffect } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - FloatingBubble.jsx
// Optional draggable educational observation bubble (chat-head style).
// OFF by default. Tap -> compact panel. Long-press -> close. Reuses voice.recent data.
// Web/PWA in-app overlay. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",GOLD="#D4AF37",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BRAND="#00C853";

export default function FloatingBubble(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BLUE = theme.c.blue, BRAND = theme.c.brand, CARD = theme.c.card, CARD2 = theme.c.card2, T3 = theme.c.text3; T1=theme.c.text1;

  // props: enabled, latest (observation obj), onReplay, onOpenFull, onClose
  var [pos,setPos]=useState({x:14,y:200});
  var [open,setOpen]=useState(false);
  var dragRef=useRef({on:false,sx:0,sy:0,ox:0,oy:0,moved:false});
  var pressRef=useRef(null);

  if(!props.enabled) return null;
  // Master Smart Alerts switch: bubble hidden when alerts are off.
  var master=true;
  try{ master=localStorage.getItem("bp_smart_alerts")!="0"; }catch(e){}
  if(!master) return null;

  function down(e){
    var pt=e.touches?e.touches[0]:e;
    dragRef.current={on:true,sx:pt.clientX,sy:pt.clientY,ox:pos.x,oy:pos.y,moved:false};
    pressRef.current=setTimeout(function(){ if(!dragRef.current.moved){ props.onClose&&props.onClose(); } },650);
  }
  function move(e){
    if(!dragRef.current.on) return;
    var pt=e.touches?e.touches[0]:e;
    var dx=pt.clientX-dragRef.current.sx, dy=pt.clientY-dragRef.current.sy;
    if(Math.abs(dx)>4||Math.abs(dy)>4){ dragRef.current.moved=true; if(pressRef.current){clearTimeout(pressRef.current);pressRef.current=null;} }
    setPos({x:Math.max(4,dragRef.current.ox+dx),y:Math.max(60,dragRef.current.oy+dy)});
  }
  function up(){
    if(pressRef.current){clearTimeout(pressRef.current);pressRef.current=null;}
    var wasDrag=dragRef.current.moved;
    dragRef.current.on=false;
    if(!wasDrag) setOpen(function(p){return !p;});
  }

  var L=props.latest||null;

  return (
    <div style={{position:"fixed",left:pos.x,top:pos.y,zIndex:9999,userSelect:"none",touchAction:"none"}}>
      {open&&L?(
        <div style={{position:"absolute",left:0,top:56,width:230,background:CARD,border:"1px solid "+BD,borderRadius:14,padding:12,boxShadow:"0 8px 40px rgba(0,0,0,0.6)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:9,fontWeight:800,color:BLUE}}>LIVE OBSERVATION</span>
            <span onClick={function(){setOpen(false);}} style={{fontSize:12,color:T3,cursor:"pointer"}}>X</span>
          </div>
          <div style={{fontSize:13,fontWeight:900,color:T1}}>{L.sym||"Market"}</div>
          <div style={{fontSize:10,color:BLUE,fontWeight:700,marginTop:2}}>{L.info||L.kind||"Observation"}</div>
          <div style={{fontSize:8.5,color:T3,marginTop:3}}>{L.tf?L.tf+" timeframe":""}{L.time?" &#8226; "+L.time:""}</div>
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <button onClick={function(){props.onReplay&&props.onReplay(L.phrase);}} style={{flex:1,background:CARD2,border:"1px solid "+BD2,borderRadius:9,padding:"7px",color:T1,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Replay Voice</button>
            <button onClick={function(){props.onOpenFull&&props.onOpenFull();setOpen(false);}} style={{flex:1,background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"7px",color:BLUE,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Full Analysis</button>
          </div>
          <div style={{fontSize:7,color:T3,marginTop:8,lineHeight:1.4}}>Educational Market Observation Only. Not Investment Advice.</div>
        </div>
      ):null}
      <div onMouseDown={down} onMouseMove={move} onMouseUp={up} onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,"+BLUE+",#1D4ED8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(37,99,235,0.4)",cursor:"grab"}}>
        <span style={{fontSize:20}} dangerouslySetInnerHTML={{__html:"&#128737;"}}/>
      </div>
    </div>
  );
}
