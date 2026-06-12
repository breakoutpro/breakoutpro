import React, { useState, useEffect } from "react";

var G = "#00C853";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var PURPLE = "#8B5CF6";

var ALL_QUESTIONS = [
  {id:"q1",  cat:"Candles",   xp:10, q:"Which candle pattern shows market indecision?", opts:["Doji","Hammer","Marubozu","Engulfing"], ans:0, exp:"Doji has equal open and close showing neither bulls nor bears in control."},
  {id:"q2",  cat:"OI",        xp:15, q:"Rising OI with rising price indicates:", opts:["Long Buildup","Short Covering","Long Unwinding","Short Buildup"], ans:0, exp:"Long Buildup = fresh buying. Bullish signal when OI rises with price."},
  {id:"q3",  cat:"PCR",       xp:15, q:"PCR below 0.7 generally means:", opts:["Overbought","Oversold","Neutral","Trending"], ans:0, exp:"PCR below 0.7 = more calls than puts = overbought = bearish signal."},
  {id:"q4",  cat:"RSI",       xp:10, q:"RSI above 70 indicates:", opts:["Overbought","Oversold","Neutral","Trending"], ans:0, exp:"RSI above 70 = overbought zone. Potential reversal or consolidation ahead."},
  {id:"q5",  cat:"VWAP",      xp:10, q:"Price above VWAP during market hours means:", opts:["Bullish bias","Bearish bias","No trend","Low volume"], ans:0, exp:"Price above VWAP = institutions are net buyers. Bullish intraday bias."},
  {id:"q6",  cat:"Candles",   xp:15, q:"Hammer pattern is most reliable at:", opts:["Support zone","Resistance zone","Middle of range","After gap up"], ans:0, exp:"Hammer at support = buyers defending the level. Strong reversal signal."},
  {id:"q7",  cat:"Options",   xp:20, q:"What does Delta measure in options?", opts:["Price sensitivity","Time decay","Volatility","Interest rate"], ans:0, exp:"Delta measures how much option price changes per Re 1 move in underlying."},
  {id:"q8",  cat:"Options",   xp:20, q:"Theta in options represents:", opts:["Time decay","Price change","Volatility","Delta change"], ans:0, exp:"Theta = time decay. Options lose value every day even if stock doesn't move."},
  {id:"q9",  cat:"Strategy",  xp:15, q:"Breakout strategy requires:", opts:["Volume confirmation","Low volume","Doji candle","Gap down"], ans:0, exp:"Breakout without volume = false breakout. Always confirm with 1.5x+ volume."},
  {id:"q10", cat:"Max Pain",  xp:20, q:"Max Pain is the price where:", opts:["Options buyers lose most","Options sellers lose most","OI is highest","Volume is highest"], ans:0, exp:"Max Pain = strike where maximum option buyers lose money at expiry."},
  {id:"q11", cat:"Candles",   xp:10, q:"Bearish Engulfing forms at:", opts:["Top of uptrend","Bottom of downtrend","Middle of range","After Doji"], ans:0, exp:"Bearish Engulfing at resistance/top of uptrend = strong reversal signal."},
  {id:"q12", cat:"Risk",      xp:15, q:"Ideal Risk:Reward ratio for a trade is:", opts:["1:2 minimum","1:1","2:1","Any ratio"], ans:0, exp:"1:2 minimum means for every Rs 1 risk, target Rs 2. Keeps trading profitable."},
  {id:"q13", cat:"OI",        xp:15, q:"Short Covering means:", opts:["Shorts buying back","Fresh short selling","Longs exiting","Fresh buying"], ans:0, exp:"Short Covering = traders who were short are now buying back. Bullish signal."},
  {id:"q14", cat:"MACD",      xp:15, q:"MACD histogram above zero indicates:", opts:["Bullish momentum","Bearish momentum","No trend","Reversal"], ans:0, exp:"MACD histogram above zero = bullish momentum. Trend is on bulls side."},
  {id:"q15", cat:"CPR",       xp:20, q:"Narrow CPR on a trading day suggests:", opts:["Trending day","Sideways day","High volatility","Low volume"], ans:0, exp:"Narrow CPR = price targets far from pivot = trending day expected."},
];

var BADGES = [
  {id:"first",   name:"First Step",   icon:"*",  desc:"Complete first quiz",    xp:0,   check:function(s){return s.total>=1;}},
  {id:"learner", name:"Learner",      icon:"L",  desc:"Complete 5 quizzes",     xp:50,  check:function(s){return s.total>=5;}},
  {id:"trader",  name:"Trader",       icon:"T",  desc:"Earn 100 XP",            xp:100, check:function(s){return s.xp>=100;}},
  {id:"streak3", name:"3 Day Streak", icon:"3",  desc:"3 day login streak",     xp:0,   check:function(s){return s.streak>=3;}},
  {id:"perfect", name:"Perfect",      icon:"P",  desc:"Answer 5 in a row",      xp:0,   check:function(s){return s.streak5>=5;}},
  {id:"expert",  name:"Expert",       icon:"E",  desc:"Earn 300 XP",            xp:300, check:function(s){return s.xp>=300;}},
  {id:"master",  name:"Master",       icon:"M",  desc:"Complete all 15 quizzes",xp:0,   check:function(s){return s.total>=15;}},
];

var CATS = ["All","Candles","OI","Options","Strategy","Risk","MACD","CPR","PCR","RSI","VWAP","Max Pain"];

function loadState() {
  try {
    var s = JSON.parse(localStorage.getItem("bp_quiz2") || "{}");
    return {
      xp: s.xp || 0,
      done: s.done || [],
      streak: s.streak || 0,
      lastDate: s.lastDate || "",
      streak5: s.streak5 || 0,
      total: s.total || 0,
      badges: s.badges || [],
    };
  } catch(e) {
    return {xp:0, done:[], streak:0, lastDate:"", streak5:0, total:0, badges:[]};
  }
}

function saveState(st) {
  try { localStorage.setItem("bp_quiz2", JSON.stringify(st)); } catch(e) {}
}

function getLevel(xp) {
  if (xp >= 500) return {name:"Master Trader", color:GOLD, next:1000};
  if (xp >= 300) return {name:"Expert",        color:PURPLE, next:500};
  if (xp >= 150) return {name:"Trader",        color:BLUE,  next:300};
  if (xp >= 50)  return {name:"Learner",       color:G,     next:150};
  return             {name:"Beginner",          color:"#6B7280", next:50};
}

export default function QuizScreen() {
  var [state, setState] = useState(loadState);
  var [tab, setTab] = useState("quiz");
  var [cat, setCat] = useState("All");
  var [active, setActive] = useState(null);
  var [selected, setSelected] = useState(null);
  var [result, setResult] = useState(null);
  var [consec, setConsec] = useState(0);
  var [newBadge, setNewBadge] = useState(null);

  // Update streak on load
  useEffect(function() {
    var today = new Date().toDateString();
    if (state.lastDate != today) {
      var yesterday = new Date(Date.now() - 86400000).toDateString();
      var newStreak = state.lastDate == yesterday ? state.streak + 1 : 1;
      var ns = Object.assign({}, state, {lastDate: today, streak: newStreak});
      setState(ns);
      saveState(ns);
    }
  }, []);

  var level = getLevel(state.xp);
  var levelPct = ((state.xp - (level.next - (level.next == 50 ? 50 : level.next == 150 ? 100 : level.next == 300 ? 150 : level.next == 500 ? 200 : 500))) / (level.next == 50 ? 50 : level.next == 150 ? 100 : level.next == 300 ? 150 : level.next == 500 ? 200 : 500)) * 100;

  var filtered = ALL_QUESTIONS.filter(function(q) {
    return cat == "All" || q.cat == cat;
  });

  var available = filtered.filter(function(q) {
    return state.done.indexOf(q.id) == -1;
  });

  var completed = filtered.filter(function(q) {
    return state.done.indexOf(q.id) != -1;
  });

  function startQ(q) {
    setActive(q);
    setSelected(null);
    setResult(null);
  }

  function answer(idx) {
    if (selected != null) return;
    setSelected(idx);
    var correct = idx == active.ans;
    var newConsec = correct ? consec + 1 : 0;
    setConsec(newConsec);
    setResult(correct);

    if (correct && state.done.indexOf(active.id) == -1) {
      var newDone = state.done.concat([active.id]);
      var newXP = state.xp + active.xp;
      var newTotal = state.total + 1;
      var newStreak5 = newConsec >= 5 ? newConsec : state.streak5;
      var ns = Object.assign({}, state, {
        xp: newXP, done: newDone,
        total: newTotal, streak5: newStreak5
      });

      // Check new badges
      var newBadges = state.badges.slice();
      BADGES.forEach(function(b) {
        if (newBadges.indexOf(b.id) == -1 && b.check(ns)) {
          newBadges.push(b.id);
          setNewBadge(b);
          setTimeout(function(){setNewBadge(null);}, 3000);
        }
      });
      ns.badges = newBadges;
      setState(ns);
      saveState(ns);
    }
  }

  function reset() {
    var ns = {xp:0, done:[], streak:state.streak, lastDate:state.lastDate, streak5:0, total:0, badges:[]};
    setState(ns);
    saveState(ns);
    setActive(null);
    setSelected(null);
    setResult(null);
  }

  // Active question view
  if (active) {
    return (
      <div style={{background:"#F8F9FA", minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:20}}>
        <div style={{background:"#fff", padding:"12px 14px", borderBottom:"1px solid #F0F0F0", display:"flex", alignItems:"center", gap:10}}>
          <button onClick={function(){setActive(null);}} style={{background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#374151"}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14, fontWeight:700, color:"#111827"}}>{active.cat} Quiz</div>
            <div style={{fontSize:9, color:G}}>+{active.xp} XP on correct answer</div>
          </div>
          <div style={{background:"#FEF3C7", borderRadius:20, padding:"3px 10px"}}>
            <span style={{fontSize:10, fontWeight:700, color:GOLD}}>{state.xp} XP</span>
          </div>
        </div>
        <div style={{padding:16}}>
          <div style={{background:"#fff", border:"1px solid #F0F0F0", borderRadius:16, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:11, color:G, fontWeight:700, marginBottom:10}}>{active.cat} - {active.xp} XP</div>
            <div style={{fontSize:17, fontWeight:700, color:"#111827", lineHeight:1.5, marginBottom:20}}>{active.q}</div>
            {active.opts.map(function(opt, i) {
              var bg = selected == null ? "#F9FAFB" : i == active.ans ? "#DCFCE7" : i == selected ? "#FEE2E2" : "#F9FAFB";
              var bd = selected == null ? "#E5E7EB" : i == active.ans ? G : i == selected ? R : "#E5E7EB";
              return (
                <button key={i} onClick={function(){answer(i);}} disabled={selected != null} style={{width:"100%", background:bg, border:"2px solid "+bd, borderRadius:12, padding:"13px 14px", marginBottom:8, textAlign:"left", cursor:selected!=null?"default":"pointer", fontFamily:"inherit", fontSize:13, color:"#111827", fontWeight:500}}>
                  {opt}
                </button>
              );
            })}
            {result != null ? (
              <div>
                <div style={{textAlign:"center", padding:"10px 0", fontSize:16, fontWeight:700, color:result?G:R}}>
                  {result ? "Correct! +" + active.xp + " XP" : "Wrong! Study the explanation below."}
                </div>
                <div style={{background:result?"#F0FDF4":"#FFF1F2", border:"1px solid "+(result?"#BBF7D0":"#FECDD3"), borderRadius:10, padding:12, marginTop:4}}>
                  <div style={{fontSize:9, fontWeight:700, color:result?"#166534":"#991B1B", marginBottom:4}}>Explanation</div>
                  <div style={{fontSize:11, color:"#374151", lineHeight:1.7}}>{active.exp}</div>
                </div>
                <button onClick={function(){setActive(null);}} style={{width:"100%", background:G, border:"none", borderRadius:12, padding:"13px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginTop:12}}>Next Question</button>
              </div>
            ) : null}
          </div>
          <div style={{background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding:10, marginTop:14}}>
            <div style={{fontSize:8, color:"#92400E"}}>Educational only. Not SEBI registered. Not investment advice.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"#F8F9FA", minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:80}}>

      {/* Header */}
      <div style={{background:"#fff", padding:"12px 14px", borderBottom:"1px solid #F0F0F0", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
          <div style={{fontSize:16, fontWeight:900, color:"#111827"}}>Daily <span style={{color:G}}>Quiz</span></div>
          <div style={{fontSize:8, color:"#F97316", fontWeight:700, letterSpacing:1}}>{ALL_QUESTIONS.length} QUESTIONS - EARN XP - WIN BADGES</div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:6}}>
          <div style={{background:"#FEF3C7", borderRadius:20, padding:"4px 12px"}}>
            <span style={{fontSize:12, fontWeight:900, color:GOLD}}>{state.xp} XP</span>
          </div>
          <div style={{background:"#EFF6FF", borderRadius:20, padding:"4px 10px", display:"flex", alignItems:"center", gap:3}}>
            <span style={{fontSize:10, fontWeight:700, color:BLUE}}>{state.streak}</span>
            <span style={{fontSize:8, color:BLUE}}>day streak</span>
          </div>
        </div>
      </div>

      {/* Level Card */}
      <div style={{background:"linear-gradient(135deg,#111827,#1F2937)", margin:"14px 14px 0", borderRadius:16, padding:16, color:"#fff"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
          <div>
            <div style={{fontSize:9, color:"#9CA3AF"}}>Current Level</div>
            <div style={{fontSize:20, fontWeight:900, color:level.color}}>{level.name}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9, color:"#9CA3AF"}}>Total XP</div>
            <div style={{fontSize:28, fontWeight:900, color:GOLD}}>{state.xp}</div>
          </div>
        </div>
        <div style={{marginBottom:4, display:"flex", justifyContent:"space-between"}}>
          <span style={{fontSize:8, color:"#666"}}>{state.xp} XP</span>
          <span style={{fontSize:8, color:"#666"}}>Next: {level.next} XP</span>
        </div>
        <div style={{height:6, background:"rgba(255,255,255,0.1)", borderRadius:3, overflow:"hidden"}}>
          <div style={{height:"100%", width:Math.min(100,levelPct)+"%", background:level.color, borderRadius:3, transition:"width 0.5s"}}></div>
        </div>
        <div style={{display:"flex", gap:12, marginTop:12}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16, fontWeight:900, color:"#fff"}}>{state.total}</div>
            <div style={{fontSize:7, color:"#666"}}>Completed</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16, fontWeight:900, color:BLUE}}>{state.streak}</div>
            <div style={{fontSize:7, color:"#666"}}>Day Streak</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16, fontWeight:900, color:GOLD}}>{state.badges.length}</div>
            <div style={{fontSize:7, color:"#666"}}>Badges</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16, fontWeight:900, color:G}}>{ALL_QUESTIONS.length - state.done.length}</div>
            <div style={{fontSize:7, color:"#666"}}>Remaining</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex", background:"#fff", borderBottom:"1px solid #F0F0F0", margin:"14px 0 0"}}>
        {[["quiz","Quiz"],["badges","Badges"],["progress","Progress"]].map(function(item) {
          var act = tab == item[0];
          return <button key={item[0]} onClick={function(){setTab(item[0]);}} style={{flex:1, background:"none", border:"none", borderBottom:act?"2px solid "+G:"2px solid transparent", padding:"10px 4px", color:act?G:"#6B7280", fontSize:10, fontWeight:act?700:500, cursor:"pointer", fontFamily:"inherit"}}>{item[1]}</button>;
        })}
      </div>

      <div style={{padding:"12px 14px"}}>

        {tab=="quiz" ? (
          <div>
            {/* Category filter */}
            <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:12}}>
              {CATS.map(function(c) {
                var act = cat == c;
                return <button key={c} onClick={function(){setCat(c);}} style={{background:act?G:"#fff", border:"1px solid "+(act?G:"#E5E7EB"), borderRadius:20, padding:"5px 12px", color:act?"#fff":"#374151", fontSize:9, fontWeight:act?700:500, cursor:"pointer", fontFamily:"inherit", flexShrink:0, whiteSpace:"nowrap"}}>{c}</button>;
              })}
            </div>

            {/* Available questions */}
            {available.length > 0 ? (
              <div>
                <div style={{fontSize:11, fontWeight:700, color:"#111827", marginBottom:8}}>Available ({available.length})</div>
                {available.map(function(q) {
                  return (
                    <div key={q.id} style={{background:"#fff", border:"1px solid #F0F0F0", borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}} onClick={function(){startQ(q);}}>
                      <div style={{width:40, height:40, borderRadius:10, background:"#F0FDF4", border:"1px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                        <span style={{fontSize:9, fontWeight:900, color:G}}>+{q.xp}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11, fontWeight:600, color:"#111827", lineHeight:1.4}}>{q.q.slice(0,55)}...</div>
                        <div style={{display:"flex", gap:6, marginTop:4}}>
                          <span style={{background:"#F3F4F6", borderRadius:4, padding:"1px 6px", fontSize:8, color:"#6B7280"}}>{q.cat}</span>
                          <span style={{background:"#FEF3C7", borderRadius:4, padding:"1px 6px", fontSize:8, color:GOLD, fontWeight:700}}>+{q.xp} XP</span>
                        </div>
                      </div>
                      <span style={{color:"#9CA3AF", fontSize:16}}>&#8250;</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)", border:"1px solid #BBF7D0", borderRadius:16, padding:24, textAlign:"center", marginBottom:14}}>
                <div style={{fontSize:32, fontWeight:900, color:G, marginBottom:8}}>All Done!</div>
                <div style={{fontSize:13, color:"#374151", marginBottom:14}}>You completed all {cat == "All" ? "" : cat+" "}questions!</div>
                <button onClick={reset} style={{background:G, border:"none", borderRadius:12, padding:"11px 24px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit"}}>Reset and Play Again</button>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 ? (
              <div style={{marginTop:14}}>
                <div style={{fontSize:11, fontWeight:700, color:"#9CA3AF", marginBottom:8}}>Completed ({completed.length})</div>
                {completed.map(function(q) {
                  return (
                    <div key={q.id} style={{background:"#F9FAFB", border:"1px solid #F0F0F0", borderRadius:10, padding:"10px 14px", marginBottom:6, display:"flex", alignItems:"center", gap:10, opacity:0.7}}>
                      <div style={{width:28, height:28, borderRadius:8, background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0}}>OK</div>
                      <div style={{flex:1, fontSize:10, color:"#6B7280"}}>{q.q.slice(0,50)}...</div>
                      <span style={{fontSize:9, color:G, fontWeight:700}}>+{q.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {tab=="badges" ? (
          <div>
            <div style={{fontSize:12, fontWeight:700, color:"#111827", marginBottom:14}}>Your Badges</div>
            <div style={{display:"grid", gridTe
