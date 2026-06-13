import { useState } from "react";

var G = "#00C853";
var R = "#EF4444";
var GOLD = "#F59E0B";
var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var CANDLE_PATTERNS = [
  {name:"Bullish Engulfing",type:"Bullish",desc:"Large green candle engulfs previous red candle. Strong reversal at support. Entry above high, SL below low."},
  {name:"Bearish Engulfing",type:"Bearish",desc:"Large red candle engulfs previous green candle. Strong reversal at resistance."},
  {name:"Doji",type:"Neutral",desc:"Open and close nearly equal. Shows indecision. Wait for confirmation candle."},
  {name:"Hammer",type:"Bullish",desc:"Small body, long lower wick at bottom of downtrend. Bulls rejected selling strongly."},
  {name:"Shooting Star",type:"Bearish",desc:"Small body, long upper wick at top of uptrend. Bears rejected buying strongly."},
  {name:"Morning Star",type:"Bullish",desc:"3-candle: Red, Doji, Green. Strong reversal at support. Day 3 volume must be high."},
  {name:"Evening Star",type:"Bearish",desc:"3-candle: Green, Doji, Red. Strong reversal at resistance. Day 3 volume must be high."},
  {name:"Marubozu",type:"Bullish",desc:"Full body candle, no wicks. Complete bull dominance. Trade in trend direction."},
  {name:"Harami",type:"Neutral",desc:"Small candle inside previous candle. Slowing momentum. Wait for breakout direction."},
  {name:"Piercing Pattern",type:"Bullish",desc:"Green candle opens below but closes above Day1 midpoint. Bullish reversal at support."},
  {name:"Dark Cloud Cover",type:"Bearish",desc:"Red candle opens above but closes below Day1 midpoint. Bearish reversal at resistance."},
  {name:"Inside Bar",type:"Neutral",desc:"Candle completely inside previous candle. Consolidation. Trade the breakout side."},
  {name:"Tweezer Top",type:"Bearish",desc:"Two candles with equal highs. Double rejection at resistance. Bearish signal."},
  {name:"Tweezer Bottom",type:"Bullish",desc:"Two candles with equal lows. Double rejection at support. Bullish signal."},
];

var OI_TOPICS = [
  {title:"What is Open Interest?",content:"OI = total outstanding contracts not yet settled. Rising OI + Rising Price = Long Buildup (Bullish). Rising OI + Falling Price = Short Buildup (Bearish). Falling OI + Rising Price = Short Covering (Bullish). Falling OI + Falling Price = Long Unwinding (Bearish)."},
  {title:"Put-Call Ratio (PCR)",content:"PCR = Put OI / Call OI. Below 0.7 = Overbought (Bearish signal). Above 1.3 = Oversold (Bullish signal). Between 0.7-1.3 = Neutral zone. Watch PCR changes rather than absolute values."},
  {title:"Max Pain Theory",content:"Max Pain = strike price where option buyers lose maximum money at expiry. Stocks tend to gravitate towards max pain near expiry. Use as reference, not exact prediction. Works best in weekly expiry final 2 days."},
  {title:"Option Greeks",content:"Delta: Price sensitivity. Call 0 to 1, Put 0 to -1. Gamma: Rate of delta change. Theta: Time decay. ATM options lose value fastest. Vega: Volatility sensitivity. IV crush happens after events."},
  {title:"OI in F&O",content:"Check OI build-up at strike prices. High Call OI = resistance. High Put OI = support. Max Pain usually between highest Call and Put OI strikes. PCR helps judge market sentiment."},
];

var STRATEGIES = [
  {title:"EMA Strategy",content:"EMA 9 > EMA 21 > EMA 50 = Strong uptrend. Price bounces from EMA 21 in uptrend. Price rejects EMA 9/21 in downtrend. Entry: Price touches EMA and bounces with volume. SL: Below previous candle low."},
  {title:"VWAP Strategy",content:"Price above VWAP = Bullish intraday bias. Long trades near VWAP support. Short trades near VWAP resistance. VWAP acts as dynamic support/resistance throughout the day. Most reliable between 10AM-2PM."},
  {title:"Breakout Strategy",content:"Wait for price to break above resistance with 1.5x+ volume. Entry: Candle close above resistance. SL: Below breakout candle low. Target: Resistance + height of base pattern. Avoid low volume breakouts."},
  {title:"CPR Strategy",content:"Narrow CPR = Trending day. Wide CPR = Sideways day. Price above TC = Bullish. Price below BC = Bearish. CPR acts as magnet. Use with EMA and VWAP for confirmation."},
  {title:"ORB Strategy",content:"Opening Range Breakout. First 15 min forms the range. Buy above first 15 min high with volume. Sell below first 15 min low with volume. SL = opposite end of ORB. Works best on trending days."},
  {title:"Scalping Strategy",content:"Use 1-3 min charts. EMA 9 and 21 for trend. VWAP for bias. RSI for entry timing. Trade only in trend direction. Keep RR minimum 1:1.5. Max 3-4 trades per session."},
];

var RISK_TOPICS = [
  {title:"Position Sizing",content:"Risk only 1-2% per trade. Formula: Position Size = (Capital x Risk%) / Stop Loss distance. Example: Rs 1 lakh capital, 1% risk = Rs 1000 max loss per trade. If SL = Rs 10, quantity = 100 shares."},
  {title:"Stop Loss Discipline",content:"Always set SL before entering. Never move SL further away. SL = your insurance. Without SL, one trade can wipe months of profit. Use trailing SL to protect profits."},
  {title:"Risk Reward Ratio",content:"Minimum 1:2 RR. For every Rs 1 risked, target Rs 2 profit. At 50% win rate with 1:2 RR, you are profitable. Better to have fewer high RR trades than many 1:1 trades."},
  {title:"Trading Psychology",content:"Fear and greed destroy traders. Fear = exit too early. Greed = hold too long. Solution: Pre-plan entry, SL and target before trade. Follow the plan. Journal every trade. Review weekly."},
  {title:"Common Mistakes",content:"No SL = biggest mistake. Averaging down losers. Overtrading. Revenge trading after loss. Trading without a plan. FOMO entries. Not reviewing trades. Taking trades against trend."},
];

var LESSONS = [
  "Support becomes resistance once broken. Watch for retests.",
  "Never risk more than 1-2% of capital on a single trade.",
  "Volume confirms price moves. Breakout without volume = false breakout.",
  "VWAP is the most important intraday level. Price above VWAP = bullish.",
  "Theta works against option buyers every single day.",
  "High PCR above 1.3 = oversold market. Low PCR = overbought.",
  "Trade in the direction of the larger timeframe trend.",
];

function BackHeader(props) {
  return (
    <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
      <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1,flexShrink:0}}>&#8592;</button>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:T1}}>{props.title}</div>
        {props.sub ? <div style={{fontSize:8,color:T2}}>{props.sub}</div> : null}
      </div>
    </div>
  );
}

function TopicCard(props) {
  var t = props.topic;
  var [open, setOpen] = useState(false);
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={function(){setOpen(!open);}}>
        <div style={{fontSize:12,fontWeight:700,color:T1}}>{t.title}</div>
        <span style={{color:G,fontSize:16,fontWeight:700,flexShrink:0}}>{open?"v":">"}</span>
      </div>
      {open ? (
        <div style={{padding:"0 14px 14px"}}>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12,fontSize:11,color:T2,lineHeight:1.9}}>{t.content}</div>
        </div>
      ) : null}
    </div>
  );
}


function CandleCard(props) {
  var p = props.pattern;
  var [open, setOpen] = useState(false);
  var tc = p.type=="Bullish"?G:p.type=="Bearish"?R:GOLD;
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={function(){setOpen(!open);}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T1}}>{p.name}</div>
          <span style={{background:tc+"22",color:tc,borderRadius:4,padding:"1px 7px",fontSize:8,fontWeight:700}}>{p.type}</span>
        </div>
        <span style={{color:G,fontSize:14,flexShrink:0}}>{open?"v":">"}</span>
      </div>
      {open ? (
        <div style={{padding:"0 14px 12px",fontSize:11,color:T2,lineHeight:1.8}}>{p.desc}</div>
      ) : null}
    </div>
  );
}

export default function LearnScreen() {
  var [sec, setSec] = useState("home");

  // CANDLES section
  if(sec=="candles") return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <BackHeader onBack={function(){setSec("home");}} title="Candlestick Patterns" sub={CANDLE_PATTERNS.length+" patterns  tap to expand"}/>
      <div style={{padding:14}}>
        {CANDLE_PATTERNS.map(function(p){
          return <CandleCard key={p.name} pattern={p}/>;
        })}
      </div>
    </div>
  );

  // OI section
  if(sec=="oi") return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <BackHeader onBack={function(){setSec("home");}} title="OI and Options" sub="PCR, Max Pain, Greeks"/>
      <div style={{padding:14}}>
        {OI_TOPICS.map(function(t){return <TopicCard key={t.title} topic={t}/>;  })}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:6}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );

  // STRATEGY section
  if(sec=="strategy") return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <BackHeader onBack={function(){setSec("home");}} title="Trading Strategies" sub="EMA, VWAP, Breakout, CPR, ORB"/>
      <div style={{padding:14}}>
        {STRATEGIES.map(function(t){return <TopicCard key={t.title} topic={t}/>;  })}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:6}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );

  // RISK section
  if(sec=="risk") return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <BackHeader onBack={function(){setSec("home");}} title="Risk Management" sub="Position size, SL, Psychology"/>
      <div style={{padding:14}}>
        {RISK_TOPICS.map(function(t){return <TopicCard key={t.title} topic={t}/>;  })}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:6}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );

  // HOME
  var topics = [
    {id:"candles",  title:"Candlestick Patterns", sub:"14 patterns with detail",  bg:"rgba(249,115,22,0.08)",  bd:"rgba(249,115,22,0.2)",  icon:"C"},
    {id:"oi",       title:"OI and Options",        sub:"PCR, Max Pain, Greeks",    bg:"rgba(0,200,83,0.08)",    bd:"rgba(0,200,83,0.2)",    icon:"O"},
    {id:"strategy", title:"Trading Strategies",    sub:"EMA, VWAP, Breakout, CPR", bg:"rgba(30,144,255,0.08)",  bd:"rgba(30,144,255,0.2)",  icon:"S"},
    {id:"risk",     title:"Risk Management",       sub:"Position size, SL, Psychology", bg:"rgba(239,68,68,0.08)", bd:"rgba(239,68,68,0.2)", icon:"R"},
  ];

  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{padding:14}}>
        <div style={{fontSize:20,fontWeight:900,color:T1,marginBottom:4}}>Learn <span style={{color:G}}>Trading</span></div>
        <div style={{fontSize:10,color:T2,marginBottom:16}}>100% Offline  No internet required</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {topics.map(function(t){
            return (
              <div key={t.id} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:14,padding:14,cursor:"pointer"}} onClick={function(){setSec(t.id);}}>
                <div style={{width:32,height:32,borderRadius:8,background:CB,border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,fontSize:14,fontWeight:900,color:G}}>{t.icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:3}}>{t.title}</div>
                <div style={{fontSize:8,color:T2}}>{t.sub}</div>
              </div>
            );
          })}
        </div>

        <div style={{background:"linear-gradient(135deg,#0F1629,#1A2A1A)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:10,color:G,fontWeight:700,marginBottom:6}}>Today's Lesson</div>
          <div style={{fontSize:13,color:T1,lineHeight:1.7,fontWeight:500}}>{LESSONS[new Date().getDay()%LESSONS.length]}</div>
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Quick Tips</div>
          {["Volume confirms every breakout","RSI + Price Action = powerful combo","EMA 21 is the most watched level","Never trade against the trend","Plan the trade, trade the plan"].map(function(tip,i){
            return (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:G,marginTop:4,flexShrink:0}}></div>
                <div style={{fontSize:11,color:T2,lineHeight:1.5}}>{tip}</div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
        }
