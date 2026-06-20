import React from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

export function ToolsScreen() {
  var [tool, setTool] = React.useState("rr");
  var [e1, setE1] = React.useState("22500");
  var [sl1, setSl1] = React.useState("22400");
  var [tgt, setTgt] = React.useState("22700");
  var [cap, setCap] = React.useState("100000");
  var [risk, setRisk] = React.useState("2");
  var [ep, setEp] = React.useState("22500");
  var [slp, setSlp] = React.useState("22400");

  var rrRatio = 0;
  try {
    var en = parseFloat(e1), sl = parseFloat(sl1), t = parseFloat(tgt);
    if(en && sl && t) rrRatio = Math.abs(t-en)/Math.abs(en-sl);
  } catch(e) {}

  var posQty = 0;
  try {
    var c2 = parseFloat(cap), rp = parseFloat(risk)/100;
    var sp = Math.abs(parseFloat(ep)-parseFloat(slp));
    if(c2 && rp && sp) posQty = Math.floor((c2*rp)/sp);
  } catch(e) {}

  var inp = {width:"100%",background:CB,border:"1px solid "+BD,borderRadius:10,padding:"11px 13px",color:T1,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10};
  var lbl = {fontSize:11,color:T2,fontWeight:600,marginBottom:4,display:"block"};

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:16,fontWeight:900,color:T1}}>Trading <span style={{color:G}}>Tools</span></div>
        <div style={{display:"flex",gap:6,marginTop:10}}>
          {[["rr","R:R Calc"],["pos","Position Size"],["brok","Brokerage"]].map(function(t){
            var act=tool==t[0];
            return <button key={t[0]} style={{background:act?G:"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"6px 14px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setTool(t[0]);}}>{t[1]}</button>;
          })}
        </div>
      </div>
      <div style={{padding:14}}>
        {tool=="rr" ? (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:14}}>Risk:Reward Calculator</div>
            <label style={lbl}>Entry Price</label>
            <input style={inp} type="number" value={e1} onChange={function(e){setE1(e.target.value);}}/>
            <label style={lbl}>Stop Loss</label>
            <input style={inp} type="number" value={sl1} onChange={function(e){setSl1(e.target.value);}}/>
            <label style={lbl}>Target</label>
            <input style={inp} type="number" value={tgt} onChange={function(e){setTgt(e.target.value);}}/>
            {rrRatio > 0 ? (
              <div style={{background:rrRatio>=2?"rgba(0,200,83,0.1)":"rgba(245,158,11,0.1)",border:"1px solid "+(rrRatio>=2?"rgba(0,200,83,0.3)":"rgba(245,158,11,0.3)"),borderRadius:14,padding:16,textAlign:"center",marginTop:14}}>
                <div style={{fontSize:11,color:T2,marginBottom:4}}>Risk:Reward Ratio</div>
                <div style={{fontSize:40,fontWeight:900,color:rrRatio>=2?G2:rrRatio>=1?GOLD:R}}>1:{rrRatio.toFixed(1)}</div>
                <div style={{fontSize:10,color:T2,marginTop:6}}>{rrRatio>=2?"Good RR  Minimum 1:2 recommended":rrRatio>=1?"Low RR  Try to improve target":"Poor RR  Not recommended"}</div>
              </div>
            ) : null}
          </div>
        ) : null}
        {tool=="pos" ? (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:14}}>Position Size Calculator</div>
            <label style={lbl}>Capital (Rs)</label>
            <input style={inp} type="number" value={cap} onChange={function(e){setCap(e.target.value);}}/>
            <label style={lbl}>Risk %</label>
            <input style={inp} type="number" value={risk} onChange={function(e){setRisk(e.target.value);}}/>
            <label style={lbl}>Entry Price</label>
            <input style={inp} type="number" value={ep} onChange={function(e){setEp(e.target.value);}}/>
            <label style={lbl}>Stop Loss</label>
            <input style={inp} type="number" value={slp} onChange={function(e){setSlp(e.target.value);}}/>
            {posQty > 0 ? (
              <div style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.3)",borderRadius:14,padding:16,textAlign:"center",marginTop:14}}>
                <div style={{fontSize:11,color:T2,marginBottom:4}}>Quantity to Buy</div>
                <div style={{fontSize:40,fontWeight:900,color:G2}}>{posQty}</div>
                <div style={{fontSize:10,color:T2,marginTop:6}}>Max loss: Rs {(parseFloat(cap)*parseFloat(risk)/100).toFixed(0)}</div>
              </div>
            ) : null}
          </div>
        ) : null}
        {tool=="brok" ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:8}}>Brokerage Calculator</div>
            <div style={{fontSize:10,color:T2,lineHeight:1.7}}>Zerodha, Groww, Dhan, Upstox comparison coming soon</div>
          </div>
        ) : null}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:14}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

export function JournalScreen() {
  var stored = [];
  try{stored = JSON.parse(localStorage.getItem("bp_journal")||"[]");}catch(e){}
  var [entries,setEntries] = React.useState(stored);
  var [show,setShow] = React.useState(false);
  var [sym,setSym] = React.useState("");
  var [en,setEn] = React.useState("");
  var [ex,setEx] = React.useState("");
  var [qty,setQty] = React.useState("");
  var [side,setSide] = React.useState("Long");
  var [aiLoading,setAiLoading] = React.useState(false);
  var [aiInsight,setAiInsight] = React.useState("");
  var [aiErr,setAiErr] = React.useState("");

  function add() {
    if(!sym||!en||!ex||!qty) return;
    var pnl = (parseFloat(ex)-parseFloat(en))*parseFloat(qty)*(side=="Long"?1:-1);
    var entry = {id:Date.now(),sym:sym.toUpperCase(),side:side,entry:parseFloat(en),exit:parseFloat(ex),qty:parseFloat(qty),pnl:pnl,date:new Date().toLocaleDateString("en-IN")};
    var ne = [entry].concat(entries);
    setEntries(ne);
    try{localStorage.setItem("bp_journal",JSON.stringify(ne.slice(0,100)));}catch(e){}
    setShow(false); setSym(""); setEn(""); setEx(""); setQty("");
  }

  function getAIInsight(){
    if(entries.length==0)return;
    setAiLoading(true);setAiInsight("");setAiErr("");
    var wins=entries.filter(function(e){return e.pnl>0;}).length;
    var losses=entries.length-wins;
    var longTrades=entries.filter(function(e){return e.side=="Long";}).length;
    var symFreq={};
    entries.forEach(function(e){symFreq[e.sym]=(symFreq[e.sym]||0)+1;});
    var topSym=Object.entries(symFreq).sort(function(a,b){return b[1]-a[1];})[0];
    var prompt="Analyze this trading journal data (educational only, not advice):\n"+
      "Total trades: "+entries.length+", Wins: "+wins+", Losses: "+losses+
      ", Long trades: "+longTrades+", Short trades: "+(entries.length-longTrades)+
      ", Most traded: "+(topSym?topSym[0]+" ("+topSym[1]+" times)":"N/A")+
      ", Total P&L: Rs"+Math.round(entries.reduce(function(s,e){return s+e.pnl;},0))+
      "\n\nGive 4 concise educational bullet points about trading patterns and one improvement tip. Under 120 words. Start each with an emoji.";
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt}]})
    })
    .then(function(r){return r.json();})
    .then(function(d){
      setAiInsight(d.content&&d.content[0]?d.content[0].text:"No response");
      setAiLoading(false);
    })
    .catch(function(){setAiErr("AI analysis failed. Check internet.");setAiLoading(false);});
  }

  var totPnl = entries.reduce(function(s,e){return s+e.pnl;},0);
  var inp = {width:"100%",background:CB,border:"1px solid "+BD,borderRadius:10,padding:"11px 13px",color:T1,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10};

  if(show) return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setShow(false);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div style={{fontSize:14,fontWeight:700,color:T1}}>Add Trade</div>
      </div>
      <div style={{padding:14}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["Long","Short"].map(function(s){
            var act=side==s;
            return <button key={s} onClick={function(){setSide(s);}} style={{flex:1,background:act?(s=="Long"?G:R):"rgba(255,255,255,0.06)",border:"none",borderRadius:10,padding:"10px",color:act?"#fff":T2,fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{s}</button>;
          })}
        </div>
        <input style={inp} placeholder="Symbol (e.g. NIFTY)" value={sym} onChange={function(e){setSym(e.target.value);}}/>
        <input style={inp} placeholder="Entry Price" type="number" value={en} onChange={function(e){setEn(e.target.value);}}/>
        <input style={inp} placeholder="Exit Price" type="number" value={ex} onChange={function(e){setEx(e.target.value);}}/>
        <input style={inp} placeholder="Quantity" type="number" value={qty} onChange={function(e){setQty(e.target.value);}}/>
        <button onClick={add} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save Trade</button>
      </div>
    </div>
  );

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80,padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:18,fontWeight:900,color:T1}}>Trading <span style={{color:G}}>Journal</span></div>
        <button onClick={function(){setShow(true);}} style={{background:G,border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:totPnl>=0?"rgba(0,200,83,0.08)":"rgba(239,68,68,0.08)",border:"1px solid "+(totPnl>=0?"rgba(0,200,83,0.2)":"rgba(239,68,68,0.2)"),borderRadius:12,padding:12,textAlign:"center"}}>
          <div style={{fontSize:8,color:T2,marginBottom:3}}>Total P&L</div>
          <div style={{fontSize:20,fontWeight:900,color:totPnl>=0?G2:R}}>{totPnl>=0?"+ Rs ":"- Rs "}{Math.abs(totPnl).toFixed(0)}</div>
        </div>
        <div style={{background:"rgba(30,144,255,0.08)",border:"1px solid rgba(30,144,255,0.2)",borderRadius:12,padding:12,textAlign:"center"}}>
          <div style={{fontSize:8,color:T2,marginBottom:3}}>Total Trades</div>
          <div style={{fontSize:20,fontWeight:900,color:"#1E90FF"}}>{entries.length}</div>
        </div>
      </div>

      {entries.length>0&&(
        <div style={{marginBottom:14}}>
          {aiInsight&&(
            <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.08))",border:"1px solid rgba(124,58,237,0.25)",borderRadius:14,padding:"14px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#8B5CF6,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:7,fontWeight:900,color:"#fff"}}>AI</span>
                </div>
                <span style={{fontSize:10,fontWeight:700,color:"#A78BFA"}}>AI Trading Pattern Analysis</span>
              </div>
              <div style={{fontSize:11,color:T1,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiInsight}</div>
            </div>
          )}
          {aiErr&&<div style={{fontSize:9,color:R,marginBottom:8}}>{aiErr}</div>}
          <button onClick={getAIInsight} disabled={aiLoading} style={{width:"100%",background:aiLoading?"rgba(124,58,237,0.3)":"linear-gradient(135deg,#8B5CF6,#3B82F6)",border:"none",borderRadius:12,padding:"11px",color:"#fff",fontSize:11,fontWeight:700,cursor:aiLoading?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {aiLoading?"Analyzing your trades...":(aiInsight?"Refresh AI Analysis":"&#129504; Get AI Trade Analysis")}
          </button>
        </div>
      )}

      {entries.length==0 ? <div style={{textAlign:"center",padding:"40px 0",color:T2,fontSize:12}}>No trades yet. Tap + Add to start!</div> : null}
      {entries.map(function(e){
        var up=e.pnl>=0;
        return (
          <div key={e.id} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+(up?G:R)}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:13,fontWeight:700,color:T1}}>{e.sym} <span style={{background:e.side=="Long"?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:e.side=="Long"?G2:R,borderRadius:4,padding:"1px 5px",fontSize:7,fontWeight:700}}>{e.side}</span></span>
              <span style={{fontSize:13,fontWeight:800,color:up?G2:R}}>{up?"+ Rs ":"- Rs "}{Math.abs(e.pnl).toFixed(0)}</span>
            </div>
            <div style={{display:"flex",gap:10,marginTop:4,fontSize:9,color:T2}}>
              <span>In: {e.entry}</span><span>Out: {e.exit}</span><span>Qty: {e.qty}</span><span>{e.date}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChallengesScreen() {
  var xp0=0; try{xp0=parseInt(localStorage.getItem("bp_xp")||"0");}catch(e){}
  var done0=[]; try{done0=JSON.parse(localStorage.getItem("bp_done")||"[]");}catch(e){}
  var [xp,setXp] = React.useState(xp0);
  var [done,setDone] = React.useState(done0);
  var [active,setActive] = React.useState(null);
  var [sel,setSel] = React.useState(null);
  var qs = [
    {id:"q1",title:"Candlestick",q:"Which candle shows market indecision?",opts:["Doji","Hammer","Marubozu","Engulfing"],ans:0,xp:10},
    {id:"q2",title:"OI",q:"Rising OI + Rising Price =",opts:["Long Buildup","Short Covering","Unwinding","Short Buildup"],ans:0,xp:10},
    {id:"q3",title:"PCR",q:"PCR below 0.7 means:",opts:["Overbought","Oversold","Neutral","Volatile"],ans:0,xp:15},
    {id:"q4",title:"RSI",q:"RSI above 70 indicates:",opts:["Overbought","Oversold","Neutral","Trending"],ans:0,xp:10},
    {id:"q5",title:"VWAP",q:"Price above VWAP means:",opts:["Bullish bias","Bearish bias","No trend","Low volume"],ans:0,xp:10},
  ];
  var level = xp<50?"Beginner":xp<150?"Learner":xp<300?"Trader":"Expert";

  function answer(idx) {
    if(!active) return; setSel(idx);
    if(idx==active.ans&&done.indexOf(active.id)==-1){
      var nx=xp+active.xp; var nd=done.concat([active.id]);
      setXp(nx); setDone(nd);
      try{localStorage.setItem("bp_xp",nx);localStorage.setItem("bp_done",JSON.stringify(nd));}catch(e){}
    }
  }

  if(active) return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80,padding:14}}>
      <button onClick={function(){setActive(null);setSel(null);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1,marginBottom:14}}>&#8592;</button>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:20}}>
        <div style={{fontSize:11,color:G,fontWeight:700,marginBottom:8}}>{active.title} - +{active.xp} XP</div>
        <div style={{fontSize:16,fontWeight:700,color:T1,lineHeight:1.5,marginBottom:16}}>{active.q}</div>
        {active.opts.map(function(opt,i){
          var bg=sel==null?"rgba(255,255,255,0.04)":i==active.ans?"rgba(0,200,83,0.2)":i==sel?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.04)";
          var bd=sel==null?BD:i==active.ans?G:i==sel?R:BD;
          return <button key={i} onClick={function(){answer(i);}} disabled={sel!=null} style={{width:"100%",background:bg,border:"1px solid "+bd,borderRadius:12,padding:"12px 14px",marginBottom:8,textAlign:"left",cursor:sel!=null?"default":"pointer",fontFamily:"inherit",fontSize:13,color:T1}}>{opt}</button>;
        })}
        {sel!=null ? <div style={{textAlign:"center",padding:"10px 0",fontSize:14,fontWeight:700,color:sel==active.ans?G2:R}}>{sel==active.ans?"Correct! +"+active.xp+" XP":"Wrong! Study the topic."}</div> : null}
      </div>
    </div>
  );

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80,padding:14}}>
      <div style={{background:"linear-gradient(135deg,#0F1629,#1A2A1A)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:16,padding:16,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:T2}}>Level</div><div style={{fontSize:22,fontWeight:900,color:G2}}>{level}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:9,color:T2}}>XP</div><div style={{fontSize:28,fontWeight:900,color:GOLD}}>{xp}</div></div>
      </div>
      {qs.map(function(ch){
        var isDone=done.indexOf(ch.id)!=-1;
        return (
          <div key={ch.id} style={{background:CB,border:"1px solid "+(isDone?"rgba(0,200,83,0.3)":BD),borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:isDone?"default":"pointer"}} onClick={function(){if(!isDone){setActive(ch);setSel(null);}}}>
            <div style={{width:36,height:36,borderRadius:10,background:isDone?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,color:isDone?G2:T2}}>{isDone?"OK":"?"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:T1}}>{ch.title}</div>
              <div style={{fontSize:9,color:T2,marginTop:2}}>{isDone?"Completed":"Tap to start"}</div>
            </div>
            <div style={{background:isDone?"rgba(0,200,83,0.15)":"rgba(245,158,11,0.15)",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,color:isDone?G2:GOLD}}>+{ch.xp} XP</div>
          </div>
        );
      })}
    </div>
  );
}

function loadRazorpay(cb){
  if(window.Razorpay){cb();return;}
  var s=document.createElement("script");
  s.src="https://checkout.razorpay.com/v1/checkout.js";
  s.onload=function(){cb();};
  s.onerror=function(){cb(new Error("failed"));};
  document.body.appendChild(s);
}

export function SubScreen(props) {
  var [paying,setPaying]=React.useState(null);
  var [payStatus,setPayStatus]=React.useState("");

  var plans = [
    {id:"monthly",name:"Monthly",price:299,color:G,tag:"Most Popular",features:["Unlimited AI Chat","All Breakout Alerts","AI Market Briefing","Advanced OI","No Ads"]},
    {id:"quarterly",name:"Quarterly",price:799,color:"#8B5CF6",tag:"Save 11%",features:["Everything in Monthly","Priority Support","Strategy Builder"]},
    {id:"yearly",name:"Yearly",price:1999,color:GOLD,tag:"Best Value 44% off",features:["Everything in Quarterly","Voice AI","Portfolio Analytics","Lifetime Price Lock"]},
  ];

  function startPayment(plan){
    setPaying(plan.id);
    setPayStatus("");
    loadRazorpay(function(err){
      if(err||!window.Razorpay){
        setPayStatus("Payment gateway failed to load. Check internet.");
        setPaying(null);
        return;
      }
      var keyId=typeof __VITE_RAZORPAY_KEY__!=="undefined"?__VITE_RAZORPAY_KEY__:(window.__env&&window.__env.VITE_RAZORPAY_KEY);
      if(!keyId){
        setPayStatus("Razorpay key not configured. Add VITE_RAZORPAY_KEY in Vercel environment variables to enable payments.");
        setPaying(null);
        return;
      }
      var options={
        key:keyId,
        amount:plan.price*100,
        currency:"INR",
        name:"BreakoutPro",
        description:plan.name+" Subscription",
        image:"https://breakoutpro.in/favicon.ico",
        handler:function(response){
          setPayStatus("Payment successful! Transaction ID: "+response.razorpay_payment_id);
          setPaying(null);
          props.onUpgrade&&props.onUpgrade(plan);
        },
        theme:{color:plan.color},
        modal:{
          ondismiss:function(){
            setPaying(null);
          }
        }
      };
      try{
        var rzp=new window.Razorpay(options);
        rzp.open();
      }catch(e){
        setPayStatus("Could not open payment window. Try again.");
        setPaying(null);
      }
    });
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80,padding:16}}>
      <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:4}}>Breakout Pro <span style={{color:GOLD}}>Premium</span></div>
      <div style={{fontSize:10,color:T2,marginBottom:16}}>Unlock all features for serious traders</div>
      {props.trialDays>0 ? (
        <div style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:14,padding:14,marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:GOLD}}>Free Trial  {props.trialDays} days left</div>
        </div>
      ) : null}
      {payStatus&&(
        <div style={{background:payStatus.indexOf("successful")!=-1?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",border:"1px solid "+(payStatus.indexOf("successful")!=-1?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"),borderRadius:12,padding:12,marginBottom:14}}>
          <div style={{fontSize:10,color:payStatus.indexOf("successful")!=-1?G2:R}}>{payStatus}</div>
        </div>
      )}
      {plans.map(function(plan){
        return (
          <div key={plan.id} style={{background:CB,border:"2px solid "+plan.color,borderRadius:16,padding:16,marginBottom:12,position:"relative"}}>
            <div style={{position:"absolute",top:-10,right:16,background:plan.color,color:"#000",borderRadius:20,padding:"3px 12px",fontSize:9,fontWeight:700}}>{plan.tag}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:T1}}>{plan.name}</div>
                <div style={{fontSize:24,fontWeight:900,color:plan.color}}>Rs {plan.price}<span style={{fontSize:10,color:T2}}>/mo</span></div>
              </div>
              <button onClick={function(){startPayment(plan);}} disabled={paying==plan.id} style={{background:paying==plan.id?plan.color+"77":plan.color,border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:700,fontSize:12,cursor:paying==plan.id?"not-allowed":"pointer",fontFamily:"inherit"}}>
                {paying==plan.id?"Opening...":"Upgrade"}
              </button>
            </div>
            {plan.features.map(function(f){
              return <div key={f} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{color:G2,fontSize:10}}>OK</span><span style={{fontSize:10,color:T2}}>{f}</span></div>;
            })}
          </div>
        );
      })}
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12}}>
        <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:4}}>Secure Payment via Razorpay</div>
        <div style={{fontSize:9,color:T2}}>UPI / Cards / Netbanking / Wallets supported</div>
      </div>
    </div>
  );
}
