import { useState, useRef, useEffect } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB = "#07111F";
var CB = "#12233D";
var BD = "#203A5A";
var BLUE = "#3B82F6";
var PURPLE = "#8B5CF6";
var G = "#00C853";
var G2 = "#22C55E";
var R = "#EF4444";
var GOLD = "#F5B942";
var T1 = "#FFFFFF";
var T2 = "#C9D4E5";

var TEMPLATES = [
  {id:"breakout", label:"Breakout Alert",   color:G2,   bg:"#001A0A", accent:"#00C853"},
  {id:"breakdown",label:"Breakdown Alert",  color:R,    bg:"#1A0000", accent:"#EF4444"},
  {id:"news",     label:"Market News",      color:GOLD, bg:"#1A1200", accent:"#F59E0B"},
  {id:"nifty",    label:"NIFTY Update",     color:"#3B82F6", bg:"#00091A", accent:"#3B82F6"},
  {id:"tip",      label:"Learning Tip",     color:"#8B5CF6", bg:"#0A0015", accent:"#8B5CF6"},
];

function PosterPreview(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var G = theme.c.brand; T1=theme.c.text1;

  var t = props.tmpl;
  var d = props.data;
  var ref = props.posterRef;

  return (
    <div ref={ref} style={{
      width:360, background:t.bg,
      borderRadius:16, overflow:"hidden",
      fontFamily:"Inter,Arial,sans-serif",
      border:"1px solid "+t.accent+"44",
      position:"relative",
    }}>
      {/* Top gradient bar */}
      <div style={{height:4, background:"linear-gradient(90deg,"+t.accent+",transparent)"}}></div>

      {/* Header */}
      <div style={{padding:"14px 16px 10px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid "+t.accent+"22"}}>
        <div style={{width:38,height:38,borderRadius:10,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>BP</span>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:T1}}>BreakoutPro</div>
          <div style={{fontSize:9,color:t.accent}}>breakoutpro.in</div>
        </div>
        <div style={{marginLeft:"auto",background:t.accent+"22",border:"1px solid "+t.accent+"44",borderRadius:20,padding:"3px 10px"}}>
          <span style={{fontSize:8,fontWeight:700,color:t.accent}}>{t.label.toUpperCase()}</span>
        </div>
      </div>

      {/* Chart background decoration */}
      <div style={{padding:"18px 16px 14px",position:"relative"}}>
        {/* Background chart lines */}
        <svg style={{position:"absolute",top:0,left:0,right:0,bottom:0,width:"100%",height:"100%",opacity:0.06}}>
          <polyline points="0,80 30,65 60,70 90,45 120,50 150,30 180,35 210,20 240,25 270,15 300,20 330,10 360,15" fill="none" stroke={t.accent} strokeWidth="2"/>
          <polyline points="0,100 30,90 60,95 90,70 120,75 150,55 180,60 210,45 240,50 270,40 300,45 330,35 360,40" fill="none" stroke={t.accent} strokeWidth="1"/>
        </svg>

        {/* Main content */}
        {(t.id=="breakout"||t.id=="breakdown")?(
          <div>
            <div style={{fontSize:11,color:T2,marginBottom:4}}>
              {t.id=="breakout"?"BREAKOUT DETECTED":"BREAKDOWN DETECTED"}
            </div>
            <div style={{fontSize:26,fontWeight:900,color:t.color,marginBottom:4}}>{d.stock||"STOCK"}</div>
            <div style={{display:"flex",gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:8,color:T2}}>CMP</div>
                <div style={{fontSize:18,fontWeight:800,color:T1}}>Rs{d.price||"--"}</div>
              </div>
              <div style={{width:1,background:t.accent+"33"}}></div>
              <div>
                <div style={{fontSize:8,color:T2}}>{t.id=="breakout"?"BREAKOUT ABOVE":"BREAKDOWN BELOW"}</div>
                <div style={{fontSize:18,fontWeight:800,color:t.color}}>Rs{d.level||"--"}</div>
              </div>
            </div>
            {d.note?(
              <div style={{background:t.accent+"11",border:"1px solid "+t.accent+"22",borderRadius:8,padding:"8px 10px",marginBottom:10}}>
                <div style={{fontSize:11,color:T1,lineHeight:1.6}}>{d.note}</div>
              </div>
            ):null}
          </div>
        ):null}

        {t.id=="news"?(
          <div>
            <div style={{fontSize:10,color:T2,marginBottom:6}}>MARKET UPDATE</div>
            <div style={{fontSize:16,fontWeight:800,color:GOLD,lineHeight:1.4,marginBottom:10}}>{d.headline||"Market headline here"}</div>
            {d.note?<div style={{fontSize:11,color:T1,lineHeight:1.7,marginBottom:10}}>{d.note}</div>:null}
            <div style={{display:"inline-block",background:d.impact=="Bullish"?"rgba(37,99,235,0.15)":d.impact=="Bearish"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",border:"1px solid "+(d.impact=="Bullish"?BLUE:d.impact=="Bearish"?R:GOLD)+"44",borderRadius:20,padding:"3px 10px"}}>
              <span style={{fontSize:9,fontWeight:700,color:d.impact=="Bullish"?BLUE:d.impact=="Bearish"?R:GOLD}}>{d.impact||"Neutral"} Impact</span>
            </div>
          </div>
        ):null}

        {t.id=="nifty"?(
          <div>
            <div style={{fontSize:10,color:T2,marginBottom:4}}>NIFTY 50 UPDATE</div>
            <div style={{fontSize:28,fontWeight:900,color:T1,marginBottom:2}}>{d.price||"23,969"}</div>
            <div style={{fontSize:14,fontWeight:700,color:d.change&&d.change.startsWith("-")?R:G2,marginBottom:12}}>{d.change||"+346 (+1.47%)"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"8px"}}>
                <div style={{fontSize:7,color:R,marginBottom:2}}>RESISTANCE</div>
                <div style={{fontSize:13,fontWeight:700,color:T1}}>Rs{d.level||"24,000"}</div>
              </div>
              <div style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:8,padding:"8px"}}>
                <div style={{fontSize:7,color:G2,marginBottom:2}}>SUPPORT</div>
                <div style={{fontSize:13,fontWeight:700,color:T1}}>Rs{d.note||"23,800"}</div>
              </div>
            </div>
          </div>
        ):null}

        {t.id=="tip"?(
          <div>
            <div style={{fontSize:10,color:"#8B5CF6",marginBottom:6}}>TRADING TIP</div>
            <div style={{fontSize:15,fontWeight:800,color:T1,lineHeight:1.4,marginBottom:10}}>{d.headline||"Trading tip here"}</div>
            {d.note?<div style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:8,padding:"10px",fontSize:11,color:T1,lineHeight:1.7}}>{d.note}</div>:null}
          </div>
        ):null}
      </div>

      {/* Social bar */}
      <div style={{background:"rgba(255,255,255,0.03)",borderTop:"1px solid "+t.accent+"22",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:8,color:T2}}>Follow us for daily alerts</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {[["W","#25D366"],["TG","#229ED9"],["X","#1DA1F2"],["YT","#FF0000"],["IG","#E1306C"]].map(function(s){
            return <div key={s[0]} style={{width:20,height:20,borderRadius:5,background:s[1],display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,fontWeight:900,color:"#fff"}}>{s[0]}</span></div>;
          })}
        </div>
      </div>

      {/* Bottom tag */}
      <div style={{padding:"8px 16px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:8,color:T2}}>
          {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
        </div>
        <div style={{fontSize:8,color:t.accent,fontWeight:700}}>breakoutpro.in</div>
      </div>
    </div>
  );
}

export default function AdminShare(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, G = theme.c.brand; T1=theme.c.text1;

  var isAdmin = props.isAdmin || false;
  var setTab = props.setTab || function(){};
  var [step, setStep] = useState(1);
  var [tmpl, setTmpl] = useState(TEMPLATES[0]);
  var [fields, setFields] = useState({stock:"",price:"",level:"",note:"",headline:"",impact:"Bullish",change:""});
  var [shared, setShared] = useState("");
  var [msg, setMsg] = useState(null);
  var [history, setHistory] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_share_hist")||"[]");}catch(e){return [];}});
  var posterRef = useRef(null);

  if(!isAdmin) {
    return (
      <div style={{background:DB,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",padding:20}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:16}}>&#128274;</div>
          <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>Admin Only</div>
          <div style={{fontSize:11,color:T2,marginBottom:20}}>Only for Breakout Pro admin</div>
          <button onClick={function(){setTab("home");}} style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+BD,borderRadius:10,padding:"10px 20px",color:T1,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Go Back</button>
        </div>
      </div>
    );
  }

  function shareText() {
    var t = tmpl;
    var d = fields;
    var text = "";
    if(t.id=="breakout") text = "BREAKOUT ALERT\n\n" + d.stock + "\nCMP: Rs" + d.price + "\n" + t.label + " Level: Rs" + d.level + "\n\n" + d.note + "\n\nTrade on BreakoutPro: https://breakoutpro.in\n\n#Breakout #" + d.stock + " #NSE #StockMarket";
    else if(t.id=="breakdown") text = "BREAKDOWN ALERT\n\n" + d.stock + "\nCMP: Rs" + d.price + "\nBreakdown Below: Rs" + d.level + "\n\n" + d.note + "\n\nTrade on BreakoutPro: https://breakoutpro.in\n\n#Breakdown #" + d.stock + " #NSE #StockMarket";
    else if(t.id=="news") text = "MARKET UPDATE\n\n" + d.headline + "\n\n" + d.note + "\n\nImpact: " + d.impact + "\n\nBreakoutPro: https://breakoutpro.in\n\n#MarketNews #NSE #BSE #IndianMarkets";
    else if(t.id=="nifty") text = "NIFTY UPDATE\n\nNIFTY 50: " + d.price + " " + d.change + "\n\nResistance: Rs" + d.level + "\nSupport: Rs" + d.note + "\n\nBreakoutPro: https://breakoutpro.in\n\n#NIFTY #NSE #MarketUpdate";
    else text = "TRADING TIP\n\n" + d.headline + "\n\n" + d.note + "\n\nLearn more: https://breakoutpro.in\n\n#TradingTips #StockMarket #LearnTrading";
    return text;
  }

  function doShare(platform) {
    var text = shareText();
    if(platform=="whatsapp") window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(text));
    else if(platform=="telegram") window.open("https://t.me/share/url?url=https://breakoutpro.in&text="+encodeURIComponent(text));
    else if(platform=="twitter") window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text.slice(0,240)));
    else if(platform=="copy") {
      try{navigator.clipboard.writeText(text);}catch(e){var el=document.createElement("textarea");el.value=text;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);}
      setMsg("Copied to clipboard!");
      setTimeout(function(){setMsg(null);},2000);
      return;
    }
    var hist = [{id:Date.now(),tmpl:tmpl.label,platform:platform,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),date:new Date().toLocaleDateString("en-IN")}].concat(history).slice(0,20);
    setHistory(hist);
    try{localStorage.setItem("bp_share_hist",JSON.stringify(hist));}catch(e){}
    setShared(platform);
    setTimeout(function(){setShared("");},2000);
  }

  function upd(k,v){setFields(function(p){var n=Object.assign({},p);n[k]=v;return n;});}
  var inp = {background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"};

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={function(){setTab("home");}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:30,height:30,color:T1,fontSize:13,cursor:"pointer",flexShrink:0}}>&#8592;</button>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:T1}}>Admin <span style={{color:BLUE}}>Share</span></div>
              <div style={{fontSize:8,color:T2}}>Create + Share market alerts to social media</div>
            </div>
          </div>
          <div style={{background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:20,padding:"3px 12px"}}>
            <span style={{fontSize:9,fontWeight:700,color:GOLD}}>ADMIN ONLY</span>
          </div>
        </div>
        {/* Steps indicator */}
        <div style={{display:"flex",gap:4}}>
          {["Template","Details","Preview & Share"].map(function(s,i){
            var act=step==i+1,done=step>i+1;
            return <div key={s} style={{flex:1,height:3,background:done?BLUE:act?"rgba(59,130,246,0.5)":BD,borderRadius:2}}></div>;
          })}
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>

        {msg?<div style={{background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:10}}><div style={{fontSize:11,color:BLUE,fontWeight:700}}>{msg}</div></div>:null}

        {/* STEP 1: Template */}
        {step==1?(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Choose Post Type</div>
            {TEMPLATES.map(function(t){
              var act=tmpl.id==t.id;
              return (
                <div key={t.id} onClick={function(){setTmpl(t);}} style={{background:act?"rgba(255,255,255,0.06)":CB,border:"2px solid "+(act?t.accent:BD),borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:9,background:t.accent+"22",border:"1px solid "+t.accent+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <div style={{width:12,height:12,borderRadius:"50%",background:act?t.accent:"transparent",border:"2px solid "+t.accent}}></div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:act?t.accent:T1}}>{t.label}</div>
                    <div style={{fontSize:9,color:T2}}>
                      {t.id=="breakout"?"Stock breakout with price alert + auto poster":
                       t.id=="breakdown"?"Stock breakdown alert + auto poster":
                       t.id=="news"?"Market news with impact analysis":
                       t.id=="nifty"?"NIFTY levels + support/resistance":
                       "Educational trading tip post"}
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={function(){setStep(2);}} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:13,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>Next</button>
          </div>
        ):null}

        {/* STEP 2: Details */}
        {step==2?(
          <div>
            <button onClick={function(){setStep(1);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:"5px 10px",color:T2,fontSize:11,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}> Back</button>
            <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>{tmpl.label} Details</div>

            {(tmpl.id=="breakout"||tmpl.id=="breakdown")?(
              <div>
                <div style={{marginBottom:10}}><div style={{fontSize:9,color:T2,marginBottom:3}}>Stock Symbol</div><input style={inp} placeholder="RELIANCE, TCS, NIFTY..." value={fields.stock} onChange={function(e){upd("stock",e.target.value.toUpperCase());}}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div><div style={{fontSize:9,color:T2,marginBottom:3}}>Current Price (Rs)</div><input style={inp} type="number" placeholder="2845" value={fields.price} onChange={function(e){upd("price",e.target.value);}}/></div>
                  <div><div style={{fontSize:9,color:T2,marginBottom:3}}>{tmpl.id=="breakout"?"Breakout Level":"Breakdown Level"}</div><input style={inp} type="number" placeholder="2900" value={fields.level} onChange={function(e){upd("level",e.target.value);}}/></div>
                </div>
                <div style={{marginBottom:10}}><div style={{fontSize:9,color:T2,marginBottom:3}}>Note (Optional)</div><textarea style={Object.assign({},inp,{height:60,resize:"none"})} placeholder="Volume surge, strong momentum..." value={fields.note} onChange={function(e){upd("note",e.target.value);}}></textarea></div>
              </div>
            ):null}

            {(tmpl.id=="news"||tmpl.id=="tip")?(
              <div>
                <div style={{marginBottom:10}}><div style={{fontSize:9,color:T2,marginBottom:3}}>{tmpl.id=="news"?"News Headline":"Tip Title"}</div><input style={inp} placeholder={tmpl.id=="news"?"RBI keeps repo rate unchanged...":"How to identify breakout stocks"} value={fields.headline} onChange={function(e){upd("headline",e.target.value);}}/></div>
                <div style={{marginBottom:10}}><div style={{fontSize:9,color:T2,marginBottom:3}}>Details</div><textarea style={Object.assign({},inp,{height:70,resize:"none"})} placeholder="More context..." value={fields.note} onChange={function(e){upd("note",e.target.value);}}></textarea></div>
                {tmpl.id=="news"?(<div style={{marginBottom:10}}><div style={{fontSize:9,color:T2,marginBottom:5}}>Impact</div><div style={{display:"flex",gap:6}}>{["Bullish","Bearish","Neutral"].map(function(imp){var act=fields.impact==imp,col=imp=="Bullish"?G2:imp=="Bearish"?R:GOLD;return <button key={imp} onClick={function(){upd("impact",imp);}} style={{flex:1,background:act?col+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:BD),borderRadius:8,padding:"7px",color:act?col:T2,fontSize:10,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{imp}</button>;})}</div></div>):null}
              </div>
            ):null}

            {tmpl.id=="nifty"?(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div><div style={{fontSize:9,color:T2,marginBottom:3}}>NIFTY Price</div><input style={inp} placeholder="23969" value={fields.price} onChange={function(e){upd("price",e.target.value);}}/></div>
                  <div><div style={{fontSize:9,color:T2,marginBottom:3}}>Change</div><input style={inp} placeholder="+346 (+1.47%)" value={fields.change} onChange={function(e){upd("change",e.target.value);}}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div><div style={{fontSize:9,color:T2,marginBottom:3}}>Resistance</div><input style={inp} placeholder="24000" value={fields.level} onChange={function(e){upd("level",e.target.value);}}/></div>
                  <div><div style={{fontSize:9,color:T2,marginBottom:3}}>Support</div><input style={inp} placeholder="23800" value={fields.note} onChange={function(e){upd("note",e.target.value);}}/></div>
                </div>
              </div>
            ):null}

            <button onClick={function(){setStep(3);}} style={{width:"100%",background:tmpl.accent,border:"none",borderRadius:12,padding:13,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Preview Poster</button>
          </div>
        ):null}

        {/* STEP 3: Preview + Share */}
        {step==3?(
          <div>
            <button onClick={function(){setStep(2);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:"5px 10px",color:T2,fontSize:11,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}> Edit</button>
            <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:10}}>Poster Preview</div>

            {/* Poster */}
            <div style={{marginBottom:14,borderRadius:16,overflow:"hidden"}}>
              <PosterPreview tmpl={tmpl} data={fields} posterRef={posterRef}/>
            </div>

            {/* Screenshot tip */}
            <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:10,marginBottom:12}}>
              <div style={{fontSize:9,fontWeight:700,color:theme.c.blue,marginBottom:2}}>Screenshot for Instagram/YouTube</div>
              <div style={{fontSize:9,color:T2}}>Poster screenshot   Instagram/YouTube lo post !</div>
            </div>

            {/* Share buttons */}
            <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>Share Now</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[["whatsapp","WhatsApp","#25D366","W"],["telegram","Telegram","#229ED9","TG"],["twitter","Twitter/X","#1DA1F2","X"],["copy","Copy Text",GOLD,"CP"]].map(function(p){
                var done=shared==p[0];
                return (
                  <button key={p[0]} onClick={function(){doShare(p[0]);}} style={{background:p[2]+"18",border:"1px solid "+p[2]+"44",borderRadius:12,padding:"12px 8px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:30,height:30,borderRadius:8,background:p[2],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:9,fontWeight:900,color:"#fff"}}>{p[3]}</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:done?"#fff":p[2]}}>{done?"Shared!":p[1]}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={function(){setStep(1);setFields({stock:"",price:"",level:"",note:"",headline:"",impact:"Bullish",change:""});setShared("");}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:12,padding:11,color:T2,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>New Post</button>

            {/* History */}
            {history.length>0?(
              <div style={{marginTop:16}}>
                <div style={{fontSize:10,fontWeight:700,color:T2,marginBottom:8}}>SHARE HISTORY</div>
                {history.slice(0,5).map(function(h){
                  return <div key={h.id} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"9px 12px",marginBottom:6,display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:10,fontWeight:600,color:T1}}>{h.tmpl}</div><div style={{fontSize:8,color:T2}}>{h.platform}  {h.date}</div></div><span style={{fontSize:8,color:G2,fontWeight:700}}>Shared</span></div>;
                })}
              </div>
            ):null}
          </div>
        ):null}

      </div>
    </div>
  );
}
