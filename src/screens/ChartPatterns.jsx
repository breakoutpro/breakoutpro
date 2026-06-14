import { useState, useEffect } from "react";
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
  {id:"flag",cat:"Continuation",type:"Bullish",name:"Flag Pattern",prob:72,tf:"15m,1H,Daily",best:"Intraday,Swing",
   psych:"After strong move up, bulls take a brief rest. Bears can not push price down much. When rest ends, bulls attack again with full force.",
   formation:"Strong pole move up. Followed by small downward sloping channel. Parallel trendlines forming flag shape.",
   entry:"Buy when price breaks above upper flag trendline with volume",
   sl:"Below lower flag trendline or midpoint of flag",
   target:"Measure pole height. Add to breakout point. That is your target.",
   rr:"Risk 1%, Target 2-3%. Excellent RR ratio",
   tip:"Volume should dry up during flag formation. Breakout needs 1.5x average volume.",
   te:"EN",
   svg:"flag"},
  {id:"pennant",cat:"Continuation",type:"Bullish",name:"Pennant",prob:70,tf:"15m,1H,Daily",best:"Intraday,Swing",
   psych:"Similar to flag but consolidation forms a small symmetrical triangle. Both bulls and bears in balance briefly.",
   formation:"Strong pole move. Then symmetrical triangle forms with converging trendlines.",
   entry:"Buy breakout above upper trendline of pennant",
   sl:"Below lower trendline of pennant",
   target:"Pole height added to breakout point",
   rr:"1:2 minimum. Pole gives clear target measurement",
   tip:"Pennant forms faster than flag. Volume expansion on breakout is key.",
   te:"EN",
   svg:"pennant"},
  {id:"rect",cat:"Continuation",type:"Neutral",name:"Rectangle",prob:65,tf:"1H,Daily",best:"Swing,Positional",
   psych:"Price bounces between clear support and resistance. Neither side winning. When one side wins breakout happens.",
   formation:"Price moves sideways between two horizontal parallel lines. Minimum 2 touches on each side.",
   entry:"Buy breakout above resistance or sell breakdown below support with volume",
   sl:"Middle of rectangle or opposite boundary",
   target:"Rectangle height projected from breakout point",
   rr:"1:2 to 1:3 depending on rectangle size",
   tip:"Longer rectangle means stronger breakout. Wait for retest of broken level.",
   te:"EN",
   svg:"rect"},
  {id:"sym_tri",cat:"Continuation",type:"Neutral",name:"Symmetrical Triangle",prob:68,tf:"1H,Daily",best:"Swing",
   psych:"Lower highs and higher lows. Both bulls and bears losing confidence. Compression before explosion.",
   formation:"Two converging trendlines. Upper line slopes down. Lower line slopes up. Price squeezes.",
   entry:"Enter on breakout of either trendline with volume",
   sl:"Inside triangle on opposite side",
   target:"Height of base of triangle added to breakout",
   rr:"1:2 minimum",
   tip:"Breakout usually happens 2/3 of the way to apex. Volume must spike.",
   te:"EN",
   svg:"sym_tri"},
  {id:"asc_tri",cat:"Continuation",type:"Bullish",name:"Ascending Triangle",prob:74,tf:"1H,Daily",best:"Swing,Positional",
   psych:"Bulls keep buying at higher lows. Sellers hold resistance. Eventually bulls overpower sellers.",
   formation:"Flat upper resistance line. Rising lower trendline. Higher lows forming.",
   entry:"Buy breakout above flat resistance with strong volume",
   sl:"Below most recent higher low",
   target:"Height of triangle added to breakout level",
   rr:"1:2 to 1:4",
   tip:"The more times resistance is tested, the stronger the eventual breakout.",
   te:"EN",
   svg:"asc_tri"},
  {id:"desc_tri",cat:"Continuation",type:"Bearish",name:"Descending Triangle",prob:74,tf:"1H,Daily",best:"Swing,Positional",
   psych:"Bears keep selling at lower highs. Buyers hold support. Eventually bears overpower buyers.",
   formation:"Flat lower support line. Declining upper trendline. Lower highs forming.",
   entry:"Sell breakdown below flat support with strong volume",
   sl:"Above most recent lower high",
   target:"Triangle height subtracted from breakdown level",
   rr:"1:2 to 1:4",
   tip:"Watch for volume increase as price approaches support. Breakdown with volume is strong.",
   te:"EN",
   svg:"desc_tri"},
  {id:"hs",cat:"Reversal",type:"Bearish",name:"Head & Shoulders",prob:78,tf:"1H,Daily,Weekly",best:"Swing,Positional",
   psych:"Three peaks. Middle one highest. Shows exhaustion of buyers. Each rally weaker than previous.",
   formation:"Left shoulder, Head (highest point), Right shoulder. Neckline connects the two lows.",
   entry:"Sell when price breaks below neckline with volume",
   sl:"Above right shoulder",
   target:"Distance from head to neckline subtracted from breakout",
   rr:"1:3 typically with clear measured target",
   tip:"Right shoulder should be lower than left. Volume should be lower on right shoulder.",
   te:"EN",
   svg:"hs"},
  {id:"ihs",cat:"Reversal",type:"Bullish",name:"Inverse Head & Shoulders",prob:78,tf:"1H,Daily,Weekly",best:"Swing,Positional",
   psych:"Three troughs. Middle one lowest. Shows exhaustion of sellers. Each decline weaker than previous.",
   formation:"Left shoulder, Head (lowest point), Right shoulder. Neckline connects the two highs.",
   entry:"Buy when price breaks above neckline with high volume",
   sl:"Below right shoulder",
   target:"Distance from head to neckline added to breakout",
   rr:"1:3 typically",
   tip:"Volume should increase significantly on neckline breakout. Classic bottom pattern.",
   te:"EN",
   svg:"ihs"},
  {id:"dtop",cat:"Reversal",type:"Bearish",name:"Double Top",prob:72,tf:"1H,Daily",best:"Swing",
   psych:"Price tests resistance twice but fails both times. Bulls exhausted at same level. Bears taking control.",
   formation:"Two peaks at approximately same price level. Valley between them. Neckline at valley low.",
   entry:"Sell when price breaks below neckline after second peak",
   sl:"Above either peak",
   target:"Distance from peaks to neckline subtracted from breakdown",
   rr:"1:2",
   tip:"Second peak should ideally have lower volume than first. Confirms weakening bulls.",
   te:"EN",
   svg:"dtop"},
  {id:"dbot",cat:"Reversal",type:"Bullish",name:"Double Bottom",prob:72,tf:"1H,Daily",best:"Swing",
   psych:"Price tests support twice but bounces both times. Bears exhausted at same level. Bulls taking control.",
   formation:"Two troughs at approximately same price level. Peak between them. Neckline at peak high.",
   entry:"Buy when price breaks above neckline after second trough",
   sl:"Below either trough",
   target:"Distance from troughs to neckline added to breakout",
   rr:"1:2",
   tip:"W shaped pattern. Very common and reliable. Volume should pick up on breakout.",
   te:"EN",
   svg:"dbot"},
  {id:"hammer",cat:"Candlestick",type:"Bullish",name:"Hammer",prob:68,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday",
   psych:"Bears pushed price down hard. But bulls stepped in strongly and pushed price back up. Sellers losing control.",
   formation:"Small real body at top of candle. Long lower wick at least 2x body. Little or no upper wick.",
   entry:"Buy above hammer high on next candle confirmation",
   sl:"Below hammer low",
   target:"Nearest resistance level or 2:1 RR from entry",
   rr:"1:2 minimum",
   tip:"Hammer must appear at bottom of downtrend or at support level. Volume should be high.",
   te:"EN",
   svg:"hammer"},
  {id:"shoot",cat:"Candlestick",type:"Bearish",name:"Shooting Star",prob:68,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday",
   psych:"Bulls pushed price up hard. But bears stepped in strongly and pushed price back down. Buyers losing control.",
   formation:"Small real body at bottom of candle. Long upper wick at least 2x body. Little or no lower wick.",
   entry:"Sell below shooting star low on next candle confirmation",
   sl:"Above shooting star high",
   target:"Nearest support level or 2:1 RR",
   rr:"1:2 minimum",
   tip:"Must appear at top of uptrend or at resistance level to be valid signal.",
   te:"EN",
   svg:"shoot"},
  {id:"bull_eng",cat:"Candlestick",type:"Bullish",name:"Bullish Engulfing",prob:74,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday,Swing",
   psych:"Red candle followed by much larger green candle that completely swallows it. Bulls overwhelm bears completely.",
   formation:"Day 1 red candle. Day 2 green candle opens below Day1 low and closes above Day1 high.",
   entry:"Buy above Day2 high or at close of Day2 candle",
   sl:"Below Day1 low",
   target:"Next resistance level. Minimum 2x risk",
   rr:"1:2 to 1:3",
   tip:"Stronger at support zones and after prolonged downtrend. Volume must increase on Day2.",
   te:"EN",
   svg:"bull_eng"},
  {id:"bear_eng",cat:"Candlestick",type:"Bearish",name:"Bearish Engulfing",prob:74,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday,Swing",
   psych:"Green candle followed by much larger red candle that completely swallows it. Bears overwhelm bulls completely.",
   formation:"Day 1 green candle. Day 2 red candle opens above Day1 high and closes below Day1 low.",
   entry:"Sell below Day2 low or at close of Day2 candle",
   sl:"Above Day1 high",
   target:"Next support level. Minimum 2x risk",
   rr:"1:2 to 1:3",
   tip:"Stronger at resistance zones and after prolonged uptrend. High volume on Day2 essential.",
   te:"EN",
   svg:"bear_eng"},
  {id:"morning",cat:"Candlestick",type:"Bullish",name:"Morning Star",prob:76,tf:"Daily,Weekly",best:"Swing,Positional",
   psych:"3 candle reversal. Big red day shows bears in control. Small doji day shows indecision. Big green day shows bulls taking over.",
   formation:"Day1 large red. Day2 small body gaps down. Day3 large green closes above Day1 midpoint.",
   entry:"Buy above Day3 high or at Day3 close",
   sl:"Below Day2 low",
   target:"Top of previous downtrend. 3x risk minimum",
   rr:"1:3 excellent pattern",
   tip:"Day3 volume should be highest of all three. Gap on Day2 makes pattern stronger.",
   te:"EN",
   svg:"morning"},
  {id:"evening",cat:"Candlestick",type:"Bearish",name:"Evening Star",prob:76,tf:"Daily,Weekly",best:"Swing,Positional",
   psych:"3 candle reversal. Big green day shows bulls. Small doji day shows exhaustion. Big red day shows bears taking over.",
   formation:"Day1 large green. Day2 small body gaps up. Day3 large red closes below Day1 midpoint.",
   entry:"Sell below Day3 low or at Day3 close",
   sl:"Above Day2 high",
   target:"Bottom of previous uptrend. 3x risk minimum",
   rr:"1:3",
   tip:"Evening star at resistance after long uptrend is very powerful. Watch for gap.",
   te:"EN",
   svg:"evening"},
  {id:"doji",cat:"Candlestick",type:"Neutral",name:"Doji",prob:60,tf:"All timeframes",best:"All",
   psych:"Open and close at same price. Bulls and bears perfectly balanced. Market at crossroads. Direction depends on context.",
   formation:"Very small real body. Can have wicks on both sides. Open equals or nearly equals close.",
   entry:"Wait for next candle to confirm direction then trade breakout",
   sl:"Opposite end of doji range",
   target:"Depends on confirmation candle direction",
   rr:"Wait for 1:2 minimum setup after confirmation",
   tip:"Doji at support after downtrend is bullish. Doji at resistance after uptrend is bearish. Context is everything.",
   te:"EN",
   svg:"doji"},
  {id:"cup",cat:"Advanced",type:"Bullish",name:"Cup & Handle",prob:80,tf:"Daily,Weekly",best:"Swing,Positional",
   psych:"Long rounded bottom forms a cup shape showing gradual accumulation. Handle is final shakeout before big breakout.",
   formation:"Rounded U-shaped bottom over weeks or months. Then small downward handle forms. Breakout above cup rim.",
   entry:"Buy breakout above cup rim with high volume",
   sl:"Below handle low",
   target:"Cup depth added to breakout level",
   rr:"1:3 to 1:5 for positional trades",
   tip:"The longer the cup takes to form, the more powerful the breakout. William ONeil pattern.",
   te:"EN",
   svg:"cup"},
  {id:"rw",cat:"Reversal",type:"Bearish",name:"Rising Wedge",prob:70,tf:"1H,Daily",best:"Swing",
   psych:"Price making higher highs and higher lows but in converging channel. Bulls losing momentum. Breakdown coming.",
   formation:"Two upward sloping converging trendlines. Each higher low is smaller than previous one.",
   entry:"Sell on breakdown below lower trendline with volume",
   sl:"Above most recent high in wedge",
   target:"Start of wedge formation",
   rr:"1:2 to 1:3",
   tip:"Despite looking bullish, rising wedge is a bearish pattern. Fake breakouts common near apex.",
   te:"EN",
   svg:"rw"},
  {id:"fw",cat:"Reversal",type:"Bullish",name:"Falling Wedge",prob:70,tf:"1H,Daily",best:"Swing",
   psych:"Price making lower lows and lower highs in converging channel. Bears losing momentum. Breakout coming.",
   formation:"Two downward sloping converging trendlines. Each lower high is smaller than previous one.",
   entry:"Buy on breakout above upper trendline with volume",
   sl:"Below most recent low in wedge",
   target:"Start of wedge formation",
   rr:"1:2 to 1:3",
   tip:"Despite looking bearish, falling wedge is a bullish pattern. One of the most reliable patterns.",
   te:"EN",
   svg:"fw"},
];


function QuizCard(props) {
  var p = props.pattern;
  var [sel,setSel] = useState(null);
  var questions = [
    {q:"What type of signal does "+p.name+" give?", opts:[p.type=="Bullish"?"Bullish":"Bearish",p.type=="Bullish"?"Bearish":"Bullish","Neutral","No signal"], ans:0},
    {q:"What is the success rate of "+p.name+"?", opts:[p.prob+"%",(p.prob-10)+"%",(p.prob+15)+"%","100%"], ans:0},
    {q:"Where to place stop loss for "+p.name+"?", opts:[p.sl.slice(0,30),(p.type=="Bullish"?"Above entry":"Below entry"),"No SL needed","At entry point"], ans:0},
  ];
  var [qIdx,setQIdx] = useState(0);
  var q = questions[qIdx];
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14}}>
      <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:8}}>Quick Quiz</div>
      <div style={{fontSize:12,fontWeight:600,color:T1,lineHeight:1.5,marginBottom:12}}>{q.q}</div>
      {q.opts.map(function(opt,i){
        var bg=sel==null?"rgba(255,255,255,0.04)":i==q.ans?"rgba(0,200,83,0.2)":i==sel?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.04)";
        var bd=sel==null?BD:i==q.ans?G:i==sel?R:BD;
        return <button key={i} onClick={function(){if(sel==null)setSel(i);}} disabled={sel!=null} style={{width:"100%",background:bg,border:"1px solid "+bd,borderRadius:10,padding:"10px 12px",marginBottom:6,textAlign:"left",cursor:sel!=null?"default":"pointer",fontFamily:"inherit",fontSize:11,color:T1}}>{opt}</button>;
      })}
      {sel!=null?(
        <div style={{textAlign:"center",marginTop:8}}>
          <div style={{fontSize:12,fontWeight:700,color:sel==q.ans?G2:R,marginBottom:8}}>{sel==q.ans?"Correct!":"Wrong!"}</div>
          {qIdx<questions.length-1?<button onClick={function(){setQIdx(qIdx+1);setSel(null);}} style={{background:G,border:"none",borderRadius:10,padding:"8px 20px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Next Question</button>:
          <div style={{fontSize:10,color:G2,fontWeight:700}}>Quiz Complete!</div>}
        </div>
      ):null}
    </div>
  );
}

function PatternDetail(props) {
  var p = props.p;
  var [quizOpen,setQuizOpen] = useState(false);
  var typeColor = p.type=="Bullish"?G2:p.type=="Bearish"?R:GOLD;
  var typeBg = p.type=="Bullish"?"rgba(0,200,83,0.1)":p.type=="Bearish"?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)";

  function InfoCard(ip) {
    return (
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:10}}>
        <div style={{fontSize:9,color:T2,fontWeight:700,marginBottom:6,letterSpacing:0.5}}>{ip.title}</div>
        <div style={{fontSize:11,color:T1,lineHeight:1.8}}>{ip.text}</div>
      </div>
    );
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{p.name}</div>
          <div style={{fontSize:9,color:T2}}>{p.cat} Pattern</div>
        </div>
        <span style={{background:typeBg,color:typeColor,borderRadius:20,padding:"4px 12px",fontSize:10,fontWeight:700}}>{p.type}</span>
      </div>

      <div style={{padding:"14px 14px 0"}}>
        <PatternSVG name={p.svg}/>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
          {[["Success Rate",p.prob+"%",p.prob>=70?G2:GOLD],["Category",p.cat,BLUE],["Best For",p.best.split(",")[0],GOLD]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:7,color:T2,marginBottom:3}}>{r[0]}</div>
                <div style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</div>
              </div>
            );
          })}
        </div>

        <InfoCard title="PSYCHOLOGY" text={p.psych}/>
        <InfoCard title="HOW IT FORMS" text={p.formation}/>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:10}}>
          <div style={{fontSize:9,color:T2,fontWeight:700,marginBottom:10,letterSpacing:0.5}}>TRADING SETUP</div>
          {[["Entry",p.entry,G2],["Stop Loss",p.sl,R],["Target",p.target,GOLD],["Risk Reward",p.rr,BLUE]].map(function(r){
            return (
              <div key={r[0]} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                <div style={{width:55,flexShrink:0,fontSize:8,fontWeight:700,color:r[2]}}>{r[0]}</div>
                <div style={{fontSize:10,color:T1,lineHeight:1.6,flex:1}}>{r[1]}</div>
              </div>
            );
          })}
        </div>

        <div style={{background:"rgba(0,200,83,0.06)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:14,marginBottom:10}}>
          <div style={{fontSize:9,color:G2,fontWeight:700,marginBottom:6}}>BEST TIMEFRAMES</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {p.tf.split(",").map(function(t){return <span key={t} style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:20,padding:"3px 10px",fontSize:9,color:G2,fontWeight:600}}>{t.trim()}</span>;})}
          </div>
          <div style={{marginTop:8,fontSize:9,color:T2}}>Best strategy: <span style={{color:GOLD,fontWeight:700}}>{p.best}</span></div>
        </div>

        <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:14,marginBottom:10}}>
          <div style={{fontSize:9,color:GOLD,fontWeight:700,marginBottom:6}}>PRO TIP</div>
          <div style={{fontSize:11,color:T1,lineHeight:1.8}}>{p.tip}</div>
        </div>

        <button onClick={function(){setQuizOpen(!quizOpen);}} style={{width:"100%",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:12,padding:12,color:GOLD,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
          {quizOpen?"Hide Quiz":"Take Pattern Quiz"}
        </button>
        {quizOpen?<QuizCard pattern={p}/>:null}

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginBottom:10}}>
          <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice. Chart patterns have hist
