import { useState } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var TEMPLATES = [
  {id:"breakout", label:"Breakout Alert", icon:"UP", color:G2, bg:"rgba(0,200,83,0.1)",
   format:function(d){return "BREAKOUT ALERT\n\n" + d.stock + " \nCMP: Rs" + d.price + "\nBreakout Above: Rs" + d.level + "\n\n" + d.note + "\n\n#Breakout #" + d.stock + " #NSE #Trading";},
  },
  {id:"breakdown", label:"Breakdown Alert", icon:"DN", color:R, bg:"rgba(239,68,68,0.1)",
   format:function(d){return "BREAKDOWN ALERT\n\n" + d.stock + "\nCMP: Rs" + d.price + "\nBreakdown Below: Rs" + d.level + "\n\n" + d.note + "\n\n#Breakdown #" + d.stock + " #NSE #Trading";},
  },
  {id:"news", label:"Market News", icon:"NW", color:GOLD, bg:"rgba(245,158,11,0.1)",
   format:function(d){return "MARKET UPDATE\n\n" + d.headline + "\n\n" + d.note + "\n\nImpact: " + d.impact + "\n\n#MarketNews #NSE #BSE #IndianMarkets";},
  },
  {id:"tip", label:"Learning Tip", icon:"TI", color:"#8B5CF6", bg:"rgba(139,92,246,0.1)",
   format:function(d){return "TRADING TIP\n\n" + d.headline + "\n\n" + d.note + "\n\n Follow BreakoutPro for daily trading education!\n\n#TradingTips #StockMarket #LearnTrading";},
  },
  {id:"nifty", label:"NIFTY Update", icon:"NF", color:"#3B82F6", bg:"rgba(59,130,246,0.1)",
   format:function(d){return "NIFTY UPDATE\n\nNIFTY 50: " + d.price + " (" + d.change + ")\n\nKey Levels:\nResistance: " + d.level + "\nSupport: " + d.note + "\n\n#NIFTY #NSE #MarketUpdate #StockMarket";},
  },
];

var PLATFORMS = [
  {id:"whatsapp", label:"WhatsApp", color:"#25D366", icon:"W",
   share:function(text){window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(text+"\n\nJoin BreakoutPro: https://breakoutpro.in"));},
  },
  {id:"telegram", label:"Telegram", color:"#229ED9", icon:"TG",
   share:function(text){window.open("https://t.me/share/url?url=https://breakoutpro.in&text="+encodeURIComponent(text));},
  },
  {id:"twitter", label:"Twitter/X", color:"#1DA1F2", icon:"X",
   share:function(text){window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text.slice(0,240)+"\n\nhttps://breakoutpro.in"));},
  },
  {id:"copy", label:"Copy Text", color:GOLD, icon:"CP",
   share:function(text){
     try{navigator.clipboard.writeText(text+"\n\nBreakoutPro: https://breakoutpro.in");}
     catch(e){var el=document.createElement("textarea");el.value=text;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);}
   },
  },
];

export default function AdminShare(props) {
  var isAdmin = props.isAdmin || false;
  var [step, setStep] = useState(1);
  var [tmpl, setTmpl] = useState(TEMPLATES[0]);
  var [fields, setFields] = useState({stock:"",price:"",level:"",note:"",headline:"",impact:"Bullish",change:""});
  var [preview, setPreview] = useState("");
  var [shared, setShared] = useState("");
  var [history, setHistory] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_share_hist")||"[]");}catch(e){return [];}});

  if(!isAdmin) {
    return (
      <div style={{background:DB,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",padding:20}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:16}}>&#128274;</div>
          <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>Admin Only</div>
          <div style={{fontSize:11,color:T2}}>This feature is only available for admins</div>
        </div>
      </div>
    );
  }

  function genPreview() {
    var text = tmpl.format(fields);
    setPreview(text);
    setStep(3);
  }

  function doShare(platform) {
    platform.share(preview);
    var hist = [{id:Date.now(),tmpl:tmpl.label,platform:platform.label,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),date:new Date().toLocaleDateString("en-IN"),preview:preview.slice(0,80)+"..."}].concat(history).slice(0,20);
    setHistory(hist);
    try{localStorage.setItem("bp_share_hist",JSON.stringify(hist));}catch(e){}
    setShared(platform.label);
    setTimeout(function(){setShared("");},2000);
  }

  function upd(key,val){setFields(function(prev){return Object.assign({},prev,{[key]:val});});}

  var inp = {background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"};

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"14px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>Admin <span style={{color:G}}>Share</span></div>
            <div style={{fontSize:8,color:T2}}>Share to WhatsApp, Telegram, Twitter, Instagram</div>
          </div>
          <div style={{background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:20,padding:"3px 12px"}}>
            <span style={{fontSize:9,fontWeight:700,color:GOLD}}>ADMIN</span>
          </div>
        </div>

        {/* Steps */}
        <div style={{display:"flex",gap:0,marginTop:12}}>
          {["Template","Details","Share"].map(function(s,i){
            var act=step==i+1;
            var done=step>i+1;
            return (
              <div key={s} style={{flex:1,textAlign:"center"}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <div style={{flex:1,height:2,background:i==0?"transparent":done||act?"rgba(0,200,83,0.4)":BD}}></div>
                  <div style={{width:24,height:24,borderRadius:"50%",background:done?G:act?"rgba(0,200,83,0.2)":"rgba(255,255,255,0.06)",border:"1px solid "+(done||act?G:BD),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:9,fontWeight:700,color:done||act?done?"#000":G2:T2}}>{done?"":i+1}</span>
                  </div>
                  <div style={{flex:1,height:2,background:i==2?"transparent":done?"rgba(0,200,83,0.4)":BD}}></div>
                </div>
                <div style={{fontSize:8,color:act?G2:T2,marginTop:3,fontWeight:act?700:400}}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"14px 14px 0"}}>

        {/* STEP 1: Template */}
        {step==1?(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Choose Post Type</div>
            {TEMPLATES.map(function(t){
              var act=tmpl.id==t.id;
              return (
                <div key={t.id} onClick={function(){setTmpl(t);}} style={{background:act?t.bg:CB,border:"1px solid "+(act?t.color:BD),borderRadius:14,padding:14,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:t.bg,border:"1px solid "+t.color+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:900,color:t.color}}>{t.icon}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:act?t.color:T1}}>{t.label}</div>
                    <div style={{fontSize:9,color:T2,marginTop:2}}>
                      {t.id=="breakout"?"Stock breakout with price and level alert":
                       t.id=="breakdown"?"Stock breakdown with price and level alert":
                       t.id=="news"?"Important market news update":
                       t.id=="tip"?"Educational trading tip":
                       "NIFTY market update with levels"}
                    </div>
                  </div>
                  {act?<div style={{width:16,height:16,borderRadius:"50%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#000",fontWeight:900}}></span></div>:null}
                </div>
              );
            })}
            <button onClick={function(){setStep(2);}} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:13,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>Next  Fill Details</button>
          </div>
        ):null}

        {/* STEP 2: Details */}
        {step==2?(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <button onClick={function(){setStep(1);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T1,fontSize:14}}></button>
              <div style={{fontSize:13,fontWeight:700,color:T1}}>{tmpl.label} Details</div>
            </div>

            {(tmpl.id=="breakout"||tmpl.id=="breakdown")?(
              <div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,color:T2,marginBottom:3}}>Stock Symbol</div>
                  <input style={inp} placeholder="e.g. RELIANCE, TCS, NIFTY" value={fields.stock} onChange={function(e){upd("stock",e.target.value.toUpperCase());}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div>
                    <div style={{fontSize:9,color:T2,marginBottom:3}}>Current Price (Rs)</div>
                    <input style={inp} type="number" placeholder="2845" value={fields.price} onChange={function(e){upd("price",e.target.value);}}/>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:T2,marginBottom:3}}>{tmpl.id=="breakout"?"Breakout Level":"Breakdown Level"} (Rs)</div>
                    <input style={inp} type="number" placeholder="2900" value={fields.level} onChange={function(e){upd("level",e.target.value);}}/>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,color:T2,marginBottom:3}}>Additional Note</div>
                  <textarea style={Object.assign({},inp,{height:70,resize:"none"})} placeholder="Volume surge detected, strong momentum..." value={fields.note} onChange={function(e){upd("note",e.target.value);}}></textarea>
                </div>
              </div>
            ):null}

            {(tmpl.id=="news"||tmpl.id=="tip")?(
              <div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,color:T2,marginBottom:3}}>{tmpl.id=="news"?"News Headline":"Tip Title"}</div>
                  <input style={inp} placeholder={tmpl.id=="news"?"RBI keeps repo rate unchanged at 6.5%":"How to read candlestick patterns"} value={fields.headline} onChange={function(e){upd("headline",e.target.value);}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,color:T2,marginBottom:3}}>Details / Explanation</div>
                  <textarea style={Object.assign({},inp,{height:80,resize:"none"})} placeholder="Add more context here..." value={fields.note} onChange={function(e){upd("note",e.target.value);}}></textarea>
                </div>
                {tmpl.id=="news"?(
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,color:T2,marginBottom:6}}>Market Impact</div>
                    <div style={{display:"flex",gap:6}}>
                      {["Bullish","Bearish","Neutral"].map(function(imp){
                        var act=fields.impact==imp;
                        var col=imp=="Bullish"?G2:imp=="Bearish"?R:GOLD;
                        return <button key={imp} onClick={function(){upd("impact",imp);}} style={{flex:1,background:act?col+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:BD),borderRadius:8,padding:"7px",color:act?col:T2,fontSize:10,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{imp}</button>;
                      })}
                    </div>
                  </div>
                ):null}
              </div>
            ):null}

            {tmpl.id=="nifty"?(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div>
                    <div style={{fontSize:9,color:T2,marginBottom:3}}>NIFTY Price</div>
                    <input style={inp} placeholder="23969" value={fields.price} onChange={function(e){upd("price",e.target.value);}}/>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:T2,marginBottom:3}}>Change</div>
                    <input style={inp} placeholder="+346 (+1.47%)" value={fields.change} onChange={function(e){upd("change",e.target.value);}}/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div>
                    <div style={{fontSize:9,color:T2,marginBottom:3}}>Resistance Level</div>
                    <input style={inp} placeholder="24000" value={fields.level} onChange={function(e){upd("level",e.target.value);}}/>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:T2,marginBottom:3}}>Support Level</div>
                    <input style={inp} placeholder="23800" value={fields.note} onChange={function(e){upd("note",e.target.value);}}/>
                  </div>
                </div>
              </div>
            ):null}

            <button onClick={genPreview} style={{width:"100%",background:tmpl.color,border:"none",borderRadius:12,padding:13,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Preview Post</button>
          </div>
        ):null}

        {/* STEP 3: Preview & Share */}
        {step==3?(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <button onClick={function(){setStep(2);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T1,fontSize:14}}></button>
              <div style={{fontSize:13,fontWeight:700,color:T1}}>Preview & Share</div>
            </div>

            {/* Preview card */}
            <div style={{background:"linear-gradient(135deg,#0F1A0F,#0A0E1A)",border:"1px solid "+tmpl.color+"44",borderRadius:16,padding:16,marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,"+tmpl.color+",transparent)"}}></div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:G,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:8,fontWeight:900,color:"#fff"}}>BP</span>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:T1}}>BreakoutPro</div>
                  <div style={{fontSize:8,color:T2}}>breakoutpro.in</div>
                </div>
                <div style={{marginLeft:"auto",background:tmpl.bg,border:"1px solid "+tmpl.color+"44",borderRadius:20,padding:"2px 8px"}}>
                  <span style={{fontSize:8,fontWeight:700,color:tmpl.color}}>{tmpl.label}</span>
                </div>
              </div>
              <div style={{fontSize:11,color:T1,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"monospace"}}>{preview}</div>
            </div>

            {/* Edit preview */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:9,color:T2,marginBottom:4}}>Edit Post Text</div>
              <textarea style={Object.assign({},inp,{height:120,resize:"none",fontSize:11})} value={preview} onChange={function(e){setPreview(e.target.value);}}></textarea>
            </div>

            {/* Share buttons */}
            <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Share To</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {PLATFORMS.map(function(p){
                var done=shared==p.label;
                return (
                  <button key={p.id} onClick={function(){doShare(p);}} style={{background:done?p.color+"33":p.color+"15",border:"1px solid "+(done?p.color:p.color+"44"),borderRadius:12,padding:"12px 8px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:8,background:p.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:9,fontWeight:900,color:"#fff"}}>{p.icon}</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:done?"#fff":p.color}}>{done?"Shared!":p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Instagram note */}
            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:10,marginBottom:14}}>
              <div style={{fontSize:9,fontWeight:700,color:GOLD,marginBottom:3}}>Instagram / YouTube</div>
              <div style={{fontSize:9,color:T2,lineHeight:1.6}}>Copy text above then paste in Instagram caption or YouTube description. Or take screenshot of preview card above!</div>
            </div>

            <button onClick={function(){setStep(1);setFields({stock:"",price:"",level:"",note:"",headline:"",impact:"Bullish",change:""});setPreview("");}} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid "+BD,borderRadius:12,padding:11,color:T2,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Create New Post</button>
          </div>
        ):null}

        {/* History */}
        {history.length>0&&step==1?(
          <div style={{marginTop:16}}>
            <div style={{fontSize:10,fontWeight:700,color:T2,marginBottom:8}}>RECENT SHARES</div>
            {history.slice(0,5).map(function(h){
              return (
                <div key={h.id} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:600,color:T1}}>{h.tmpl}</div>
                    <div style={{fontSize:8,color:T2}}>{h.platform}  {h.date} {h.time}</div>
                  </div>
                  <span style={{fontSize:8,color:G2,fontWeight:700}}>Shared</span>
                </div>
              );
            })}
          </div>
        ):null}

      </div>
    </div>
  );
}
