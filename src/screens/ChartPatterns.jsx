import { useState } from "react";
import PatternSVG from "./PatternSVG";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var PATTERNS = [
  {id:"flag",cat:"Continuation",type:"Bullish",name:"Flag Pattern",prob:72,tf:"15m,1H,Daily",best:"Intraday,Swing",psych:"After strong pole move, bulls rest briefly. Bears cannot push price down much. When rest ends, bulls attack again.",formation:"Strong pole move up. Small downward sloping channel with parallel trendlines.",entry:"Buy breakout above upper flag trendline with volume",sl:"Below lower flag trendline",target:"Pole height added to breakout point",rr:"1:2 to 1:3",tip:"Volume should dry up inside flag. Breakout needs 1.5x average volume."},
  {id:"pennant",cat:"Continuation",type:"Bullish",name:"Pennant",prob:70,tf:"15m,1H,Daily",best:"Intraday,Swing",psych:"Like flag but consolidation forms small symmetrical triangle. Both sides briefly balanced.",formation:"Strong pole. Then symmetrical triangle with converging trendlines.",entry:"Buy breakout above upper pennant trendline",sl:"Below lower trendline",target:"Pole height added to breakout",rr:"1:2",tip:"Pennant forms faster than flag. Volume must expand on breakout."},
  {id:"asc_tri",cat:"Continuation",type:"Bullish",name:"Ascending Triangle",prob:74,tf:"1H,Daily",best:"Swing",psych:"Bulls keep buying at higher lows. Sellers hold resistance. Eventually bulls overpower sellers.",formation:"Flat upper resistance. Rising lower trendline. Higher lows forming.",entry:"Buy breakout above flat resistance with strong volume",sl:"Below most recent higher low",target:"Triangle height added to breakout",rr:"1:2 to 1:4",tip:"More times resistance tested, stronger eventual breakout."},
  {id:"desc_tri",cat:"Continuation",type:"Bearish",name:"Descending Triangle",prob:74,tf:"1H,Daily",best:"Swing",psych:"Bears keep selling at lower highs. Buyers hold support. Eventually bears overpower buyers.",formation:"Flat lower support. Declining upper trendline. Lower highs forming.",entry:"Sell breakdown below flat support with strong volume",sl:"Above most recent lower high",target:"Triangle height subtracted from breakdown",rr:"1:2 to 1:4",tip:"Watch for volume increase as price approaches support."},
  {id:"sym_tri",cat:"Continuation",type:"Neutral",name:"Symmetrical Triangle",prob:68,tf:"1H,Daily",best:"Swing",psych:"Lower highs and higher lows. Both sides losing confidence. Compression before explosion.",formation:"Two converging trendlines. Upper slopes down. Lower slopes up.",entry:"Enter on breakout of either trendline with volume",sl:"Inside triangle on opposite side",target:"Base height added to breakout",rr:"1:2",tip:"Breakout usually happens 2/3 of way to apex. Volume must spike."},
  {id:"rect",cat:"Continuation",type:"Neutral",name:"Rectangle",prob:65,tf:"1H,Daily",best:"Swing",psych:"Price bounces between support and resistance. Neither side winning. Breakout when one side wins.",formation:"Price sideways between two horizontal parallel lines. Min 2 touches each side.",entry:"Buy breakout above resistance or sell breakdown below support",sl:"Middle of rectangle",target:"Rectangle height projected from breakout",rr:"1:2 to 1:3",tip:"Longer rectangle means stronger breakout. Wait for retest."},
  {id:"hs",cat:"Reversal",type:"Bearish",name:"Head and Shoulders",prob:78,tf:"1H,Daily,Weekly",best:"Swing,Positional",psych:"Three peaks. Middle highest. Shows buyer exhaustion. Each rally weaker than previous.",formation:"Left shoulder, Head (highest), Right shoulder. Neckline connects two lows.",entry:"Sell when price breaks below neckline with volume",sl:"Above right shoulder",target:"Head to neckline distance subtracted from breakout",rr:"1:3",tip:"Right shoulder should be lower than left. Volume lower on right shoulder."},
  {id:"ihs",cat:"Reversal",type:"Bullish",name:"Inverse Head Shoulders",prob:78,tf:"1H,Daily,Weekly",best:"Swing,Positional",psych:"Three troughs. Middle lowest. Shows seller exhaustion. Each decline weaker than previous.",formation:"Left shoulder, Head (lowest), Right shoulder. Neckline connects two highs.",entry:"Buy when price breaks above neckline with high volume",sl:"Below right shoulder",target:"Head to neckline distance added to breakout",rr:"1:3",tip:"Volume must increase significantly on neckline breakout."},
  {id:"dtop",cat:"Reversal",type:"Bearish",name:"Double Top",prob:72,tf:"1H,Daily",best:"Swing",psych:"Price tests resistance twice but fails. Bulls exhausted at same level. Bears taking control.",formation:"Two peaks at same level. Valley between. Neckline at valley low.",entry:"Sell when price breaks below neckline after second peak",sl:"Above either peak",target:"Peak to neckline distance subtracted from breakdown",rr:"1:2",tip:"Second peak should have lower volume than first. Confirms weakening bulls."},
  {id:"dbot",cat:"Reversal",type:"Bullish",name:"Double Bottom",prob:72,tf:"1H,Daily",best:"Swing",psych:"Price tests support twice but bounces. Bears exhausted at same level. Bulls taking control.",formation:"Two troughs at same level. Peak between. Neckline at peak high.",entry:"Buy when price breaks above neckline after second trough",sl:"Below either trough",target:"Trough to neckline distance added to breakout",rr:"1:2",tip:"W shaped pattern. Volume should pick up on breakout. Very reliable."},
  {id:"rw",cat:"Reversal",type:"Bearish",name:"Rising Wedge",prob:70,tf:"1H,Daily",best:"Swing",psych:"Higher highs and lows in converging channel. Bulls losing momentum. Breakdown coming.",formation:"Two upward sloping converging trendlines. Each higher low smaller than previous.",entry:"Sell on breakdown below lower trendline with volume",sl:"Above most recent high in wedge",target:"Start of wedge formation",rr:"1:2 to 1:3",tip:"Despite looking bullish, rising wedge is bearish pattern."},
  {id:"fw",cat:"Reversal",type:"Bullish",name:"Falling Wedge",prob:70,tf:"1H,Daily",best:"Swing",psych:"Lower lows and highs in converging channel. Bears losing momentum. Breakout coming.",formation:"Two downward sloping converging trendlines. Each lower high smaller than previous.",entry:"Buy on breakout above upper trendline with volume",sl:"Below most recent low in wedge",target:"Start of wedge formation",rr:"1:2 to 1:3",tip:"Despite looking bearish, falling wedge is bullish. Very reliable."},
  {id:"hammer",cat:"Candlestick",type:"Bullish",name:"Hammer",prob:68,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday",psych:"Bears pushed price down hard. Bulls stepped in strongly and pushed back up. Sellers losing control.",formation:"Small body at top. Long lower wick at least 2x body. Little or no upper wick.",entry:"Buy above hammer high on next candle confirmation",sl:"Below hammer low",target:"Nearest resistance or 2x risk",rr:"1:2",tip:"Must appear at bottom of downtrend or at support. High volume confirms."},
  {id:"shoot",cat:"Candlestick",type:"Bearish",name:"Shooting Star",prob:68,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday",psych:"Bulls pushed price up hard. Bears stepped in strongly and pushed back down. Buyers losing control.",formation:"Small body at bottom. Long upper wick at least 2x body. Little or no lower wick.",entry:"Sell below shooting star low on next candle confirmation",sl:"Above shooting star high",target:"Nearest support or 2x risk",rr:"1:2",tip:"Must appear at top of uptrend or at resistance to be valid."},
  {id:"bull_eng",cat:"Candlestick",type:"Bullish",name:"Bullish Engulfing",prob:74,tf:"5m,15m,1H,Daily",best:"Intraday,Swing",psych:"Red candle followed by much larger green candle. Bulls overwhelm bears completely.",formation:"Day 1 red candle. Day 2 green opens below Day1 low and closes above Day1 high.",entry:"Buy above Day2 high or at close of Day2",sl:"Below Day1 low",target:"Next resistance. Minimum 2x risk",rr:"1:2 to 1:3",tip:"Stronger at support zones after prolonged downtrend. Volume must increase."},
  {id:"bear_eng",cat:"Candlestick",type:"Bearish",name:"Bearish Engulfing",prob:74,tf:"5m,15m,1H,Daily",best:"Intraday,Swing",psych:"Green candle followed by much larger red candle. Bears overwhelm bulls completely.",formation:"Day 1 green candle. Day 2 red opens above Day1 high and closes below Day1 low.",entry:"Sell below Day2 low or at close of Day2",sl:"Above Day1 high",target:"Next support. Minimum 2x risk",rr:"1:2 to 1:3",tip:"Stronger at resistance after prolonged uptrend. High volume on Day2 essential."},
  {id:"morning",cat:"Candlestick",type:"Bullish",name:"Morning Star",prob:76,tf:"Daily,Weekly",best:"Swing,Positional",psych:"3 candle reversal. Big red shows bears. Small doji shows indecision. Big green shows bulls winning.",formation:"Day1 large red. Day2 small body gaps down. Day3 large green closes above Day1 midpoint.",entry:"Buy above Day3 high or at Day3 close",sl:"Below Day2 low",target:"Top of previous downtrend. 3x risk",rr:"1:3",tip:"Day3 volume must be highest of all three candles."},
  {id:"evening",cat:"Candlestick",type:"Bearish",name:"Evening Star",prob:76,tf:"Daily,Weekly",best:"Swing,Positional",psych:"3 candle reversal. Big green shows bulls. Small doji shows exhaustion. Big red shows bears winning.",formation:"Day1 large green. Day2 small body gaps up. Day3 large red closes below Day1 midpoint.",entry:"Sell below Day3 low or at Day3 close",sl:"Above Day2 high",target:"Bottom of previous uptrend. 3x risk",rr:"1:3",tip:"Evening star at resistance after long uptrend is very powerful."},
  {id:"doji",cat:"Candlestick",type:"Neutral",name:"Doji",prob:60,tf:"All",best:"All",psych:"Open and close at same price. Bulls and bears perfectly balanced. Market at crossroads.",formation:"Very small real body. Can have wicks on both sides. Open nearly equals close.",entry:"Wait for next candle to confirm direction then trade",sl:"Opposite end of doji range",target:"Depends on confirmation candle direction",rr:"Wait for 1:2 after confirmation",tip:"Doji at support after downtrend is bullish. At resistance after uptrend is bearish."},
  {id:"cup",cat:"Advanced",type:"Bullish",name:"Cup and Handle",prob:80,tf:"Daily,Weekly",best:"Swing,Positional",psych:"Long rounded bottom shows gradual accumulation. Handle is final shakeout before big breakout.",formation:"Rounded U-shaped bottom over weeks. Then small downward handle. Breakout above cup rim.",entry:"Buy breakout above cup rim with high volume",sl:"Below handle low",target:"Cup depth added to breakout level",rr:"1:3 to 1:5",tip:"The longer the cup takes to form, the more powerful the breakout."},
];

function PatternCard(props) {
  var p = props.p;
  var tc = p.type=="Bullish"?G2:p.type=="Bearish"?R:GOLD;
  var tb = p.type=="Bullish"?"rgba(0,200,83,0.08)":p.type=="Bearish"?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.08)";
  var isFav = props.isFav;
  var isDone = props.isDone;
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}} onClick={props.onClick}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{background:tb,border:"1px solid "+tc+"44",borderRadius:10,padding:"8px 10px",flexShrink:0,textAlign:"center",minWidth:44}}>
          <div style={{fontSize:8,fontWeight:700,color:tc}}>{p.type[0]}</div>
          <div style={{fontSize:10,fontWeight:900,color:tc,marginTop:1}}>{p.prob}%</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <div style={{fontSize:13,fontWeight:800,color:T1}}>{p.name}</div>
            {isDone?<span style={{background:"rgba(0,200,83,0.15)",color:G2,borderRadius:4,padding:"1px 5px",fontSize:7,fontWeight:700}}>Done</span>:null}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
            <span style={{background:tb,color:tc,borderRadius:20,padding:"1px 7px",fontSize:8,fontWeight:700}}>{p.type}</span>
            <span style={{background:"rgba(255,255,255,0.05)",color:T2,borderRadius:20,padding:"1px 7px",fontSize:8}}>{p.cat}</span>
          </div>
          <div style={{fontSize:9,color:T2,lineHeight:1.5,overflow:"hidden",maxHeight:30}}>{p.psych.slice(0,65)}...</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <button onClick={function(e){e.stopPropagation();props.onFav();}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:isFav?GOLD:T2,padding:0}}>{isFav?"":""}</button>
          <span style={{color:T2,fontSize:14}}></span>
        </div>
      </div>
    </div>
  );
}

function PatternDetail(props) {
  var p = props.p;
  var [quizQ, setQuizQ] = useState(0);
  var [quizSel, setQuizSel] = useState(null);
  var [showQuiz, setShowQuiz] = useState(false);
  var tc = p.type=="Bullish"?G2:p.type=="Bearish"?R:GOLD;
  var quiz = [
    {q:"Signal type?",opts:[p.type,p.type=="Bullish"?"Bearish":"Bullish","Neutral"],ans:0},
    {q:"Stop loss?",opts:[p.sl.slice(0,25),p.entry.slice(0,25),"No SL needed"],ans:0},
    {q:"Success rate?",opts:[p.prob+"%",(p.prob-15)+"%",(p.prob+10)+"%"],ans:0},
  ];
  var qq = quiz[quizQ];
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T1}}></button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:900,color:T1}}>{p.name}</div>
          <div style={{fontSize:8,color:T2}}>{p.cat}</div>
        </div>
        <span style={{background:tc+"22",color:tc,borderRadius:20,padding:"3px 10px",fontSize:9,fontWeight:700}}>{p.type}</span>
      </div>
      <div style={{padding:14}}>
        <PatternSVG name={p.id}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {[["Success",p.prob+"%",p.prob>=70?G2:GOLD],["Category",p.cat,BLUE],["Best",p.best.split(",")[0],GOLD]].map(function(r){
            return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"9px 6px",textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
          })}
        </div>
        {[["PSYCHOLOGY",p.psych],["FORMATION",p.formation]].map(function(r){
          return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:8}}><div style={{fontSize:8,color:T2,fontWeight:700,marginBottom:5,letterSpacing:0.5}}>{r[0]}</div><div style={{fontSize:11,color:T1,lineHeight:1.8}}>{r[1]}</div></div>;
        })}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:8}}>
          <div style={{fontSize:8,color:T2,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>TRADING SETUP</div>
          {[["Entry",p.entry,G2],["Stop Loss",p.sl,R],["Target",p.target,GOLD],["R:R",p.rr,BLUE]].map(function(r){
            return <div key={r[0]} style={{display:"flex",gap:8,marginBottom:7}}><div style={{width:52,fontSize:8,fontWeight:700,color:r[2],flexShrink:0}}>{r[0]}</div><div style={{fontSize:10,color:T1,lineHeight:1.5}}>{r[1]}</div></div>;
          })}
        </div>
        <div style={{background:"rgba(0,200,83,0.06)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:12,marginBottom:8}}>
          <div style={{fontSize:8,color:G2,fontWeight:700,marginBottom:5}}>TIMEFRAMES</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {p.tf.split(",").map(function(t){return <span key={t} style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:20,padding:"2px 8px",fontSize:9,color:G2}}>{t.trim()}</span>;})}
          </div>
        </div>
        <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:12,marginBottom:10}}>
          <div style={{fontSize:8,color:GOLD,fontWeight:700,marginBottom:4}}>PRO TIP</div>
          <div style={{fontSize:11,color:T1,lineHeight:1.7}}>{p.tip}</div>
        </div>
        <button onClick={function(){setShowQuiz(!showQuiz);setQuizSel(null);setQuizQ(0);}} style={{width:"100%",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:12,padding:11,color:GOLD,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:showQuiz?8:0}}>
          {showQuiz?"Hide Quiz":"Take Pattern Quiz"}
        </button>
        {showQuiz?(
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14}}>
            <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:8}}>Q{quizQ+1}/3: {qq.q}</div>
            {qq.opts.map(function(opt,i){
              var bg=quizSel==null?"rgba(255,255,255,0.04)":i==qq.ans?"rgba(0,200,83,0.2)":i==quizSel?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.04)";
              var bd=quizSel==null?BD:i==qq.ans?G:i==quizSel?R:BD;
              return <button key={i} onClick={function(){if(quizSel==null)setQuizSel(i);}} disabled={quizSel!=null} style={{width:"100%",background:bg,border:"1px solid "+bd,borderRadius:10,padding:"10px 12px",marginBottom:6,textAlign:"left",cursor:quizSel!=null?"default":"pointer",fontFamily:"inherit",fontSize:11,color:T1}}>{opt}</button>;
            })}
            {quizSel!=null?(
              <div style={{textAlign:"center",marginTop:8}}>
                <div style={{fontSize:12,fontWeight:700,color:quizSel==qq.ans?G2:R,marginBottom:8}}>{quizSel==qq.ans?"Correct!":"Wrong!"}</div>
                {quizQ<2?<button onClick={function(){setQuizQ(quizQ+1);setQuizSel(null);}} style={{background:G,border:"none",borderRadius:10,padding:"8px 20px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Next</button>:<div style={{fontSize:10,color:G2,fontWeight:700}}>Quiz Complete!</div>}
              </div>
            ):null}
          </div>
        ):null}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:10}}>
          <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

export default function ChartPatterns() {
  var [search,setSearch] = useState("");
  var [filter,setFilter] = useState("All");
  var [sel,setSel] = useState(null);
  var [favs,setFavs] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_favs")||"[]");}catch(e){return [];}});
  var [done,setDone] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_pat_done")||"[]");}catch(e){return [];}});
  var [recent,setRecent] = useState(function(){try{return JSON.parse(localStorage.getItem("bp_recent")||"[]");}catch(e){return [];}});

  function open(p) {
    setSel(p);
    var nr=[p.id].concat(recent.filter(function(r){return r!=p.id;})).slice(0,5);
    setRecent(nr);
    try{localStorage.setItem("bp_recent",JSON.stringify(nr));}catch(e){}
    if(done.indexOf(p.id)==-1){var nd=done.concat([p.id]);setDone(nd);try{localStorage.setItem("bp_pat_done",JSON.stringify(nd));}catch(e){}}
  }

  function toggleFav(id) {
    var nf=favs.indexOf(id)!=-1?favs.filter(function(f){return f!=id;}):favs.concat([id]);
    setFavs(nf);try{localStorage.setItem("bp_favs",JSON.stringify(nf));}catch(e){}
  }

  if(sel) return <PatternDetail p={sel} onBack={function(){setSel(null);}}/>;

  var FILTERS = ["All","Bullish","Bearish","Continuation","Reversal","Candlestick","Advanced","Favorites"];
  var filtered = PATTERNS.filter(funct
