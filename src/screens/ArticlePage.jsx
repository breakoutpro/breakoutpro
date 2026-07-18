import { useState } from "react";
import { JUSTIN } from "./JustInData";

import { useTheme } from "../theme/ThemeProvider";
var BG="#050505",CARD="#101318",BD="#1B2330";
var BLUE="#3B82F6",CYAN="#60A5FA";
var UP="#22C55E",DOWN="#EF4444",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function impactColor(imp){
  if(imp=="Bullish") return UP;
  if(imp=="Bearish") return DOWN;
  return GOLD;
}

function ActionBtn(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3;

  return (
    <button onClick={props.onClick} style={{flex:1,background:props.active?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(props.active?BLUE:BD),borderRadius:10,padding:"9px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",fontFamily:"inherit"}}>
      <span style={{fontSize:15,color:props.active?CYAN:T2}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      <span style={{fontSize:8,color:props.active?CYAN:T3,fontWeight:600}}>{props.label}</span>
    </button>
  );
}

export default function ArticlePage(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BG = theme.c.bg, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var art=props.article||JUSTIN[0];
  var onBack=props.onBack||function(){};
  var onOpen=props.onOpen||function(){};
  var setTab=props.setTab||function(){};

  var [saved,setSaved]=useState(false);
  var [marked,setMarked]=useState(false);
  var [speaking,setSpeaking]=useState(false);

  var ic=impactColor(art.impact);
  var related=JUSTIN.filter(function(n){return n.id!=art.id;}).slice(0,3);

  function speak(){
    try{
      if(speaking){window.speechSynthesis.cancel();setSpeaking(false);return;}
      var text=art.headline+". "+art.body.join(" ");
      var u=new SpeechSynthesisUtterance(text);
      u.rate=1;u.onend=function(){setSpeaking(false);};
      window.speechSynthesis.speak(u);setSpeaking(true);
    }catch(e){}
  }

  function share(){
    try{
      if(navigator.share){navigator.share({title:art.headline,text:art.headline});}
    }catch(e){}
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:40,color:T1}}>

      {/* TOP BAR */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",position:"sticky",top:0,background:BG,zIndex:10,borderBottom:"1px solid "+BD}}>
        <button onClick={function(){if(speaking){try{window.speechSynthesis.cancel();}catch(e){}}onBack();}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,width:34,height:34,color:T1,fontSize:15,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <span style={{fontSize:13,fontWeight:700,color:T2}}>Article</span>
      </div>

      <div style={{padding:"18px 18px 0"}}>

        {/* IMPACT BADGE + SOURCE */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{background:ic+"22",color:ic,border:"1px solid "+ic+"44",borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,letterSpacing:0.3}}>{art.impact}</span>
          <span style={{fontSize:11,color:CYAN,fontWeight:700}}>{art.source}</span>
        </div>

        {/* HEADLINE */}
        <h1 style={{fontSize:24,fontWeight:900,color:T1,lineHeight:1.32,margin:"0 0 14px",letterSpacing:-0.4}}>{art.headline}</h1>

        {/* META */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,paddingBottom:16,borderBottom:"1px solid "+BD}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,"+BLUE+","+CYAN+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0}}>{art.author.charAt(0)}</div>
          <div>
            <div style={{fontSize:11.5,color:T1,fontWeight:700}}>{art.author}</div>
            <div style={{fontSize:9.5,color:T3,marginTop:1}}>{art.date}  &#8226;  {art.time}</div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <ActionBtn icon={saved?"&#128190;":"&#128190;"} label={saved?"Saved":"Save"} active={saved} onClick={function(){setSaved(!saved);}}/>
          <ActionBtn icon="&#128279;" label="Share" onClick={share}/>
          <ActionBtn icon={speaking?"&#9209;":"&#128266;"} label={speaking?"Stop":"Listen"} active={speaking} onClick={speak}/>
          <ActionBtn icon={marked?"&#11088;":"&#9734;"} label="Bookmark" active={marked} onClick={function(){setMarked(!marked);}}/>
        </div>

        {/* BODY */}
        <div>
          {art.body.map(function(para,i){
            return <p key={i} style={{fontSize:14.5,color:"#D4D8E0",lineHeight:1.85,margin:"0 0 18px",fontWeight:400}}>{para}</p>;
          })}
        </div>

        {/* RELATED STOCKS */}
        <div style={{marginTop:8,marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:10}}>Related Stocks</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {art.stocks.map(function(s){
              return (
                <div key={s} onClick={function(){setTab("markets");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"7px 13px",fontSize:12,fontWeight:700,color:CYAN,cursor:"pointer"}}>{s}</div>
              );
            })}
          </div>
        </div>

        {/* RELATED NEWS */}
        <div style={{borderTop:"1px solid "+BD,paddingTop:18}}>
          <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:12}}>Related News</div>
          {related.map(function(n){
            var nc=impactColor(n.impact);
            return (
              <div key={n.id} onClick={function(){onOpen(n);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"13px",marginBottom:9,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                  <span style={{background:nc+"22",color:nc,borderRadius:4,padding:"1px 7px",fontSize:8,fontWeight:800}}>{n.impact}</span>
                  <span style={{fontSize:9.5,color:CYAN,fontWeight:700}}>{n.source}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:T1,lineHeight:1.45,marginBottom:5}}>{n.headline}</div>
                <div style={{fontSize:9,color:T3}}>{n.time}</div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
