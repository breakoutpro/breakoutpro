import React, { useState, useEffect } from "react";

var G = "#00C853";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";

var QUESTIONS = [
  {id:"q1", cat:"Candles",  xp:10, q:"Which candle shows market indecision?", opts:["Doji","Hammer","Marubozu","Engulfing"], ans:0, exp:"Doji has equal open and close - neither bulls nor bears in control."},
  {id:"q2", cat:"OI",       xp:15, q:"Rising OI with rising price means:", opts:["Long Buildup","Short Covering","Unwinding","Short Buildup"], ans:0, exp:"Long Buildup = fresh buying. Bullish signal."},
  {id:"q3", cat:"PCR",      xp:15, q:"PCR below 0.7 means:", opts:["Overbought","Oversold","Neutral","Trending"], ans:0, exp:"PCR below 0.7 = more calls than puts = overbought market."},
  {id:"q4", cat:"RSI",      xp:10, q:"RSI above 70 indicates:", opts:["Overbought","Oversold","Neutral","Trending"], ans:0, exp:"RSI above 70 = overbought zone. Potential reversal ahead."},
  {id:"q5", cat:"VWAP",     xp:10, q:"Price above VWAP means:", opts:["Bullish bias","Bearish bias","No trend","Low volume"], ans:0, exp:"Price above VWAP = institutions net buyers. Bullish intraday."},
  {id:"q6", cat:"Candles",  xp:15, q:"Hammer is most reliable at:", opts:["Support zone","Resistance zone","Middle of range","After gap up"], ans:0, exp:"Hammer at support = buyers defending the level strongly."},
  {id:"q7", cat:"Options",  xp:20, q:"Delta measures:", opts:["Price sensitivity","Time decay","Volatility","Interest rate"], ans:0, exp:"Delta = how much option price changes per Re 1 move in underlying."},
  {id:"q8", cat:"Options",  xp:20, q:"Theta represents:", opts:["Time decay","Price change","Volatility","Delta change"], ans:0, exp:"Theta = time decay. Options lose value every day."},
  {id:"q9", cat:"Strategy", xp:15, q:"Breakout needs:", opts:["Volume confirmation","Low volume","Doji candle","Gap down"], ans:0, exp:"Breakout without volume = false breakout. Need 1.5x+ volume."},
  {id:"q10",cat:"Options",  xp:20, q:"Max Pain is price where:", opts:["Options buyers lose most","Sellers lose most","OI is highest","Volume highest"], ans:0, exp:"Max Pain = strike where max option buyers lose money at expiry."},
  {id:"q11",cat:"Candles",  xp:10, q:"Bearish Engulfing forms at:", opts:["Top of uptrend","Bottom of downtrend","Middle of range","After Doji"], ans:0, exp:"Bearish Engulfing at resistance/top = strong reversal signal."},
  {id:"q12",cat:"Risk",     xp:15, q:"Ideal Risk:Reward ratio:", opts:["1:2 minimum","1:1","2:1","Any ratio"], ans:0, exp:"1:2 minimum = Rs 1 risk, Rs 2 target. Keeps trading profitable."},
  {id:"q13",cat:"OI",       xp:15, q:"Short Covering means:", opts:["Shorts buying back","Fresh short selling","Longs exiting","Fresh buying"], ans:0, exp:"Short Covering = shorts buying back positions. Bullish."},
  {id:"q14",cat:"MACD",     xp:15, q:"MACD histogram above zero:", opts:["Bullish momentum","Bearish momentum","No trend","Reversal"], ans:0, exp:"MACD histogram above zero = bullish momentum. Bulls in control."},
  {id:"q15",cat:"CPR",      xp:20, q:"Narrow CPR suggests:", opts:["Trending day","Sideways day","High volatility","Low volume"], ans:0, exp:"Narrow CPR = trending day expected. Price targets far from pivot."},
];

var BADGES = [
  {id:"first",   name:"First Step",    icon:"*", desc:"Complete 1st quiz"},
  {id:"learner", name:"Learner",       icon:"L", desc:"Complete 5 quizzes"},
  {id:"trader",  name:"Trader",        icon:"T", desc:"Earn 100 XP"},
  {id:"streak3", name:"3 Day Streak",  icon:"3", desc:"Login 3 days"},
  {id:"expert",  name:"Expert",        icon:"E", desc:"Earn 300 XP"},
  {id:"master",  name:"Master",        icon:"M", desc:"All 15 done"},
];

function loadSt() {
  try {
    var s = JSON.parse(localStorage.getItem("bp_qz") || "{}");
    return {xp:s.xp||0, done:s.done||[], streak:s.streak||0, lastDate:s.lastDate||"", badges:s.badges||[], total:s.total||0};
  } catch(e) {
    return {xp:0, done:[], streak:0, lastDate:"", badges:[], total:0};
  }
}

function saveSt(st) {
  try{localStorage.setItem("bp_qz",JSON.stringify(st));}catch(e){}
}

function getLevel(xp) {
  if(xp>=500) return {name:"Master",  color:GOLD,  next:1000};
  if(xp>=300) return {name:"Expert",  color:"#8B5CF6", next:500};
  if(xp>=150) return {name:"Trader",  color:BLUE,  next:300};
  if(xp>=50)  return {name:"Learner", color:G,     next:150};
  return           {name:"Beginner",  color:"#6B7280", next:50};
}

export default function QuizScreen() {
  var [st, setSt] = useState(loadSt);
  var [tab, setTab] = useState("quiz");
  var [cat, setCat] = useState("All");
  var [active, setActive] = useState(null);
  var [sel, setSel] = useState(null);
  var [res, setRes] = useState(null);
  var [newBadge, setNewBadge] = useState(null);

  useEffect(function() {
    var today = new Date().toDateString();
    if(st.lastDate != today) {
      var yest = new Date(Date.now()-86400000).toDateString();
      var newStreak = st.lastDate==yest ? st.streak+1 : 1;
      var ns = Object.assign({},st,{lastDate:today,streak:newStreak});
      setSt(ns); saveSt(ns);
    }
  },[]);

  var level = getLevel(st.xp);
  var CATS = ["All","Candles","OI","Options","Strategy","Risk","MACD","CPR","PCR","RSI","VWAP"];

  var filtered = QUESTIONS.filter(function(q){return cat=="All"||q.cat==cat;});
  var available = filtered.filter(function(q){return st.done.indexOf(q.id)==-1;});
  var completed = filtered.filter(function(q){return st.done.indexOf(q.id)!=-1;});

  function startQ(q){setActive(q);setSel(null);setRes(null);}

  function answer(idx) {
    if(sel!=null) return;
    setSel(idx);
    var ok = idx==active.ans;
    setRes(ok);
    if(ok && st.done.indexOf(active.id)==-1) {
      var newDone = st.done.concat([active.id]);
      var newXP = st.xp + active.xp;
      var newTotal = st.total + 1;
      var ns = Object.assign({},st,{xp:newXP,done:newDone,total:newTotal});
      var nb = st.badges.slice();
      BADGES.forEach(function(b) {
        if(nb.indexOf(b.id)==-1) {
          var earn = false;
          if(b.id=="first"&&newTotal>=1) earn=true;
          if(b.id=="learner"&&newTotal>=5) earn=true;
          if(b.id=="trader"&&newXP>=100) earn=true;
          if(b.id=="streak3"&&ns.streak>=3) earn=true;
          if(b.id=="expert"&&newXP>=300) earn=true;
          if(b.id=="master"&&newTotal>=15) earn=true;
          if(earn){nb.push(b.id);setNewBadge(b);setTimeout(function(){setNewBadge(null);},3000);}
        }
      });
      ns.badges=nb;
      setSt(ns); saveSt(ns);
    }
  }

  function resetAll(){
    var ns={xp:0,done:[],streak:st.streak,lastDate:st.lastDate,badges:[],total:0};
    setSt(ns);saveSt(ns);setActive(null);setSel(null);setRes(null);
  }

  if(active) return (
    <div style={{background:"#F8F9FA",minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setActive(null);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#374151"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>{active.cat} Quiz</div>
          <div style={{fontSize:9,color:G}}>+{active.xp} XP on correct answer</div>
        </div>
        <div style={{background:"#FEF3C7",borderRadius:20,padding:"3px 10px"}}>
          <span style={{fontSize:10,fontWeight:700,color:GOLD}}>{st.xp} XP</span>
        </div>
      </div>
      <div style={{padding:16}}>
        <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:16,padding:20}}>
          <div style={{fontSize:11,color:G,fontWeight:700,marginBottom:10}}>{active.cat} - {active.xp} XP</div>
          <div style={{fontSize:17,fontWeight:700,color:"#111827",lineHeight:1.5,marginBottom:20}}>{active.q}</div>
          {active.opts.map(function(opt,i){
            var bg=sel==null?"#F9FAFB":i==active.ans?"#DCFCE7":i==sel?"#FEE2E2":"#F9FAFB";
            var bd=sel==null?"#E5E7EB":i==active.ans?G:i==sel?R:"#E5E7EB";
            return <button key={i} onClick={function(){answer(i);}} disabled={sel!=null} style={{width:"100%",background:bg,border:"2px solid "+bd,borderRadius:12,padding:"13px 14px",marginBottom:8,textAlign:"left",cursor:sel!=null?"default":"pointer",fontFamily:"inherit",fontSize:13,color:"#111827"}}>{opt}</button>;
          })}
          {res!=null?(
            <div>
              <div style={{textAlign:"center",padding:"10px 0",fontSize:16,fontWeight:700,color:res?G:R}}>{res?"Correct! +"+active.xp+" XP":"Wrong! Study below."}</div>
              <div style={{background:res?"#F0FDF4":"#FFF1F2",border:"1px solid "+(res?"#BBF7D0":"#FECDD3"),borderRadius:10,padding:12}}>
                <div style={{fontSize:9,fontWeight:700,color:res?"#166534":"#991B1B",marginBottom:4}}>Explanation</div>
                <div style={{fontSize:11,color:"#374151",lineHeight:1.7}}>{active.exp}</div>
              </div>
              <button onClick={function(){setActive(null);}} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginTop:12}}>Next Question</button>
            </div>
          ):null}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:"#F8F9FA",minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:16,fontWeight:900,color:"#111827"}}>Daily <span style={{color:G}}>Quiz</span></div>
          <div style={{fontSize:8,color:"#F97316",fontWeight:700,letterSpacing:1}}>{QUESTIONS.length} QUESTIONS - EARN XP - WIN BADGES</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{background:"#FEF3C7",borderRadius:20,padding:"4px 12px"}}>
            <span style={{fontSize:12,fontWeight:900,color:GOLD}}>{st.xp} XP</span>
          </div>
          <div style={{background:"#EFF6FF",borderRadius:20,padding:"4px 10px"}}>
            <span style={{fontSize:10,fontWeight:700,color:BLUE}}>{st.streak}d</span>
          </div>
        </div>
      </div>

      <div style={{background:"linear-gradient(135deg,#111827,#1F2937)",margin:"14px 14px 0",borderRadius:16,padding:16,color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontSize:9,color:"#9CA3AF"}}>Current Level</div>
            <div style={{fontSize:20,fontWeight:900,color:level.color}}>{level.name}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:"#9CA3AF"}}>Total XP</div>
            <div style={{fontSize:28,fontWeight:900,color:GOLD}}>{st.xp}</div>
          </div>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.1)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:Math.min(100,(st.xp/level.next)*100)+"%",background:level.color,borderRadius:3}}></div>
        </div>
        <div style={{display:"flex",gap:16,marginTop:10}}>
          {[["Completed",st.total],["Streak",st.streak+"d"],["Badges",st.badges.length],["Left",QUESTIONS.length-st.done.length]].map(function(r){
            return <div key={r[0]} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:"#fff"}}>{r[1]}</div><div style={{fontSize:7,color:"#666"}}>{r[0]}</div></div>;
          })}
        </div>
      </div>

      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #F0F0F0",margin:"14px 0 0"}}>
        {[["quiz","Quiz"],["badges","Badges"],["progress","Progress"]].map(function(item){
          var act=tab==item[0];
          return <button key={item[0]} onClick={function(){setTab(item[0]);}} style={{flex:1,background:"none",border:"none",borderBottom:act?"2px solid "+G:"2px solid transparent",padding:"10px 4px",color:act?G:"#6B7280",fontSize:10,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit"}}>{item[1]}</button>;
        })}
      </div>

      <div style={{padding:"12px 14px"}}>

        {tab=="quiz"?(
          <div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
              {CATS.map(function(c){
                var act=cat==c;
                return <button key={c} onClick={function(){setCat(c);}} style={{background:act?G:"#fff",border:"1px solid "+(act?G:"#E5E7EB"),borderRadius:20,padding:"5px 12px",color:act?"#fff":"#374151",fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{c}</button>;
              })}
            </div>
            {available.length>0?(
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#111827",marginBottom:8}}>Available ({available.length})</div>
                {available.map(function(q){
                  return (
                    <div key={q.id} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={function(){startQ(q);}}>
                      <div style={{width:40,height:40,borderRadius:10,background:"#F0FDF4",border:"1px solid #BBF7D0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:9,fontWeight:900,color:G}}>+{q.xp}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#111827",lineHeight:1.4}}>{q.q.slice(0,55)}...</div>
                        <div style={{display:"flex",gap:6,marginTop:4}}>
                          <span style={{background:"#F3F4F6",borderRadius:4,padding:"1px 6px",fontSize:8,color:"#6B7280"}}>{q.cat}</span>
                          <span style={{background:"#FEF3C7",borderRadius:4,padding:"1px 6px",fontSize:8,color:GOLD,fontWeight:700}}>+{q.xp} XP</span>
                        </div>
                      </div>
                      <span style={{color:"#9CA3AF",fontSize:16}}>&#8250;</span>
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:16,padding:24,textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:32,fontWeight:900,color:G,marginBottom:8}}>All Done!</div>
                <button onClick={resetAll} style={{background:G,border:"none",borderRadius:12,padding:"11px 24px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Reset and Play Again</button>
              </div>
            )}
            {completed.length>0?(
              <div style={{marginTop:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",marginBottom:8}}>Completed ({completed.length})</div>
                {completed.map(function(q){
                  return <div key={q.id} style={{background:"#F9FAFB",border:"1px solid #F0F0F0",borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,opacity:0.7}}><div style={{width:28,height:28,borderRadius:8,background:"#DCFCE7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>OK</div><div style={{flex:1,fontSize:10,color:"#6B7280"}}>{q.q.slice(0,50)}...</div><span style={{fontSize:9,color:G,fontWeight:700}}>+{q.xp}</span></div>;
                })}
              </div>
            ):null}
          </div>
        ):null}

        {tab=="badges"?(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:14}}>Your Badges</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {BADGES.map(function(b){
                var earned=st.badges.indexOf(b.id)!=-1;
                return (
                  <div key={b.id} style={{background:earned?"linear-gradient(135deg,#FEF3C7,#FDE68A)":"#F3F4F6",border:"1px solid "+(earned?"#F59E0B":"#E5E7EB"),borderRadius:14,padding:12,textAlign:"center",opacity:earned?1:0.5}}>
                    <div style={{width:44,height:44,borderRadius:12,background:earned?GOLD:"#9CA3AF",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px",fontSize:18,fontWeight:900,color:"#fff"}}>{b.icon}</div>
                    <div style={{fontSize:10,fontWeight:700,color:earned?"#92400E":"#6B7280"}}>{b.name}</div>
                    <div style={{fontSize:7,color:earned?"#B45309":"#9CA3AF",marginTop:2}}>{b.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ):null}

        {tab=="progress"?(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:14}}>Progress by Category</div>
            {["Candles","OI","Options","Strategy","Risk","MACD","CPR","PCR","RSI","VWAP"].map(function(ct){
              var total=QUESTIONS.filter(function(q){return q.cat==ct;}).length;
              var done=QUESTIONS.filter(function(q){return q.cat==ct&&st.done.indexOf(q.id)!=-1;}).length;
              var pct=total>0?(done/total)*100:0;
              return (
                <div key={ct} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:11,fontWeight:600,color:"#111827"}}>{ct}</span>
                    <span style={{fontSize:10,fontWeight:700,color:pct==100?G:GOLD}}>{done}/{total}</span>
                  </div>
                  <div style={{height:6,background:"#F3F4F6",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:pct+"%",background:pct==100?G:GOLD,borderRadius:3}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ):null}

      </div>

      {newBadge?(
        <div style={{position:"fixed",bottom:90,left:"50%",background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",border:"2px solid "+GOLD,borderRadius:16,padding:"14px 20px",textAlign:"center",boxShadow:"0 8px 30px rgba(245,158,11,0.4)",zIndex:999,minWidth:200,marginLeft:-100}}>
          <div style={{fontSize:24,fontWeight:900,color:GOLD}}>{newBadge.icon}</div>
          <div style={{fontSize:13,fontWeight:800,color:"#92400E",marginTop:4}}>Badge Unlocked!</div>
          <div style={{fontSize:11,color:"#B45309",marginTop:2}}>{newBadge.name}</div>
        </div>
      ):null}

    </div>
  );
}
  
