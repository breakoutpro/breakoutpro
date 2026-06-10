import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
var PROXY = "/api/nse";
var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
var G = "#00C853";
var R = "#EF4444";
var DISCLAIMER = "Educational only. Not SEBI registered. Not investment advice.";

var STOCKS_DEFAULT = [
  {sym:"RELIANCE",name:"Reliance Industries",ltp:2845.60,open:2798.00,chgPct:1.71,up:true,sect:"Energy",vol:"12.4M",cap:"Large"},
  {sym:"TCS",name:"Tata Consultancy",ltp:3654.20,open:3690.00,chgPct:-0.97,up:false,sect:"IT",vol:"3.2M",cap:"Large"},
  {sym:"HDFCBANK",name:"HDFC Bank",ltp:1742.50,open:1710.00,chgPct:1.90,up:true,sect:"Bank",vol:"8.7M",cap:"Large"},
  {sym:"ICICIBANK",name:"ICICI Bank",ltp:1289.30,open:1260.00,chgPct:2.33,up:true,sect:"Bank",vol:"7.1M",cap:"Large"},
  {sym:"INFY",name:"Infosys",ltp:1567.80,open:1590.00,chgPct:-1.40,up:false,sect:"IT",vol:"5.4M",cap:"Large"},
  {sym:"WIPRO",name:"Wipro",ltp:478.90,open:465.00,chgPct:2.99,up:true,sect:"IT",vol:"9.2M",cap:"Large"},
  {sym:"TATAMOTORS",name:"Tata Motors",ltp:945.60,open:925.00,chgPct:2.23,up:true,sect:"Auto",vol:"11.3M",cap:"Large"},
  {sym:"MARUTI",name:"Maruti Suzuki",ltp:13240.00,open:13100.00,chgPct:1.07,up:true,sect:"Auto",vol:"1.2M",cap:"Large"},
  {sym:"SUNPHARMA",name:"Sun Pharma",ltp:1678.40,open:1695.00,chgPct:-0.98,up:false,sect:"Pharma",vol:"4.5M",cap:"Large"},
  {sym:"BAJFINANCE",name:"Bajaj Finance",ltp:7234.50,open:7100.00,chgPct:1.90,up:true,sect:"NBFC",vol:"2.8M",cap:"Large"},
];

var SECTOR_DATA = [
  {name:"IT",chg:1.82},{name:"Bank",chg:1.24},{name:"Auto",chg:0.94},
  {name:"Pharma",chg:-0.32},{name:"Energy",chg:1.35},{name:"Metal",chg:3.24},
  {name:"FMCG",chg:0.18},{name:"Realty",chg:2.10},{name:"Infra",chg:0.76},
];

var NEWS_DEFAULT = [
  {title:"RBI holds rates steady, signals neutral stance for next quarter",time:"2h ago",cat:"Policy",bull:true},
  {title:"NIFTY crosses 22,500 mark on strong FII inflows of Rs 4,200 Cr",time:"3h ago",cat:"Markets",bull:true},
  {title:"Q4 results season kicks off — IT sector beats estimates by 8%",time:"4h ago",cat:"Results",bull:true},
  {title:"Crude oil rises 2.3% on OPEC supply cut announcement",time:"5h ago",cat:"Global",bull:false},
  {title:"SEBI proposes new F&amp;O margin rules effective next month",time:"6h ago",cat:"Regulatory",bull:false},
];

var CANDLE_PATTERNS = [
  {name:"Bullish Engulfing",type:"Bullish",desc:"A large green candle completely engulfs the previous red candle. Strong reversal signal at support."},
  {name:"Bearish Engulfing",type:"Bearish",desc:"A large red candle engulfs the previous green candle. Strong reversal at resistance."},
  {name:"Doji",type:"Neutral",desc:"Open and close are nearly equal. Shows indecision. Powerful when at key levels."},
  {name:"Hammer",type:"Bullish",desc:"Small body, long lower wick. Forms at bottom of downtrend. Bulls rejected selling."},
  {name:"Shooting Star",type:"Bearish",desc:"Small body, long upper wick. Forms at top of uptrend. Bears rejected buying."},
  {name:"Morning Star",type:"Bullish",desc:"3-candle pattern: red, doji, green. Strong reversal at support."},
  {name:"Evening Star",type:"Bearish",desc:"3-candle pattern: green, doji, red. Strong reversal at resistance."},
  {name:"Marubozu",type:"Bullish",desc:"Full-body candle with no wicks. Shows complete dominance by one side."},
];

var TERMS_DATA = [
  {term:"Support",def:"Price level where buying interest is strong enough to prevent further decline."},
  {term:"Resistance",def:"Price level where selling pressure prevents further rise."},
  {term:"PCR",def:"Put-Call Ratio. Below 0.7 = bullish, above 1.3 = bearish sentiment."},
  {term:"OI",def:"Open Interest. Total outstanding contracts. Rising OI with rising price = bullish."},
  {term:"Max Pain",def:"Strike price where option buyers lose most money at expiry."},
  {term:"VWAP",def:"Volume Weighted Average Price. Used to gauge intraday trend direction."},
  {term:"RSI",def:"Relative Strength Index. Above 70 = overbought, below 30 = oversold."},
  {term:"MACD",def:"Moving Average Convergence Divergence. Trend + momentum indicator."},
];

var QUICK_QS = [
  "What is Support and Resistance?","Explain Bullish Engulfing pattern",
  "What is PCR in options?","Explain Delta and Theta Greeks",
  "What is VWAP?","Explain Breakout trading",
  "What is Max Pain?","Explain Risk Reward ratio",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function nowT() {
  return new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
}
function fN(n) {
  if(!n) return "0";
  var num = parseFloat(n);
  if(num >= 10000000) return (num/10000000).toFixed(2)+"Cr";
  if(num >= 100000) return (num/100000).toFixed(2)+"L";
  if(num >= 1000) return (num/1000).toFixed(1)+"K";
  return num.toFixed(2);
}
function rnd(a,b){ return Math.random()*(b-a)+a; }
function sg(){ return Math.random()>0.5?1:-1; }

function getMarketStatus() {
  var now = new Date();
  var h = now.getHours(), m = now.getMinutes();
  var mins = h*60+m;
  if(mins >= 9*60+15 && mins < 15*60+30) {
    return {open:true, label:"Market Open", color:G};
  }
  return {open:false, label:"Market Closed", color:"#6B7280"};
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function Spark(props) {
  var data = props.data || [];
  var color = props.color || G;
  var w = props.w || 60;
  var h = props.h || 28;
  if(!data.length) return null;
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = max - min || 1;
  var pts = data.map(function(v,i) {
    var x = (i/(data.length-1))*w;
    var y = h - ((v-min)/range)*h;
    return x+","+y;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IndexCard(props) {
  var item = props.item;
  var up = item.up;
  var s = {
    card:{background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:"12px 14px",cursor:"pointer",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"},
    label:{fontSize:8,color:"#6B7280",fontWeight:600,marginBottom:4,letterSpacing:0.3},
    ltp:{fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#111827",marginBottom:3},
    chg:{display:"flex",alignItems:"center",gap:3},
    arr:{fontSize:9,color:up?G:R},
    pct:{fontSize:10,fontWeight:700,color:up?G:R},
  };
  return (
    <div style={s.card} onClick={props.onClick}>
      <div style={s.label}>{item.label}</div>
      <div style={s.ltp}>{item.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
      <div style={s.chg}>
        <span style={s.arr}>{up?"▲":"▼"}</span>
        <span style={s.pct}>{up?"+":""}{item.pct.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function StockRow(props) {
  var s = props.stock;
  var up = s.up;
  var spark = [];
  for(var i=0;i<14;i++) spark.push(s.ltp + sg()*rnd(0, s.ltp*0.005)*i);
  var row = {display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #F5F5F5",cursor:"pointer"};
  var sym = {fontSize:12,fontWeight:700,color:"#111827"};
  var sect = {fontSize:8,color:"#9CA3AF",marginTop:2};
  var badge = {background:up?"#DCFCE7":"#FEE2E2",borderRadius:6,padding:"2px 6px",fontSize:8,fontWeight:700,color:up?"#166534":"#991B1B"};
  return (
    <div style={row} onClick={props.onClick}>
      <div style={{flex:1}}>
        <div style={sym}>{s.sym}</div>
        <div style={sect}>{s.sect}</div>
      </div>
      <Spark data={spark} color={up?G:R} w={50} h={22}/>
      <div style={{textAlign:"right",minWidth:80}}>
        <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:"#111827"}}>{"Rs"+fN(s.ltp)}</div>
        <div style={badge}>{up?"+":""}{s.chgPct.toFixed(2)}%</div>
      </div>
    </div>
  );
}

function TabBar(props) {
  var tabs = [
    {id:"home",ico:"🏠",label:"Home"},
    {id:"markets",ico:"📈",label:"Markets"},
    {id:"scanner",ico:"📡",label:"Scanner"},
    {id:"oi",ico:"📊",label:"OI"},
    {id:"learn",ico:"📚",label:"Learn"},
    {id:"ai",ico:"🤖",label:"AI"},
    {id:"tools",ico:"🛠",label:"Tools"},
    {id:"news",ico:"📰",label:"News"},
  ];
  var bar = {position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",background:"#fff",borderTop:"1px solid #E5E7EB",display:"flex",zIndex:100,paddingBottom:8};
  return (
    <div style={bar}>
      {tabs.map(function(t) {
        var active = props.tab == t.id;
        var btn = {flex:1,background:"none",border:"none",padding:"6px 2px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2};
        var ico = {fontSize:16};
        var lbl = {fontSize:7,fontWeight:active?700:500,color:active?G:"#9CA3AF"};
        var dot = {width:3,height:3,borderRadius:"50%",background:G,margin:"1px auto 0"};
        return (
          <button key={t.id} style={btn} onClick={function(){props.setTab(t.id);}}>
            <span style={ico}>{t.ico}</span>
            <span style={lbl}>{t.label}</span>
            {active ? <div style={dot}></div> : null}
          </button>
        );
      })}
    </div>
  );
}

function TopBar(props) {
  var mkt = getMarketStatus();
  var bar = {background:"#fff",borderBottom:"1px solid #F0F0F0",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50};
  var logo = {display:"flex",alignItems:"center",gap:8};
  var bp = {width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,200,83,0.3)"};
  var bpTxt = {fontFamily:"Arial",fontSize:12,fontWeight:900,color:"#fff"};
  var title = {fontSize:16,fontWeight:900,color:"#111827",letterSpacing:-0.5};
  var tag = {fontSize:6,color:"#F97316",fontWeight:800,letterSpacing:1.5};
  var right = {display:"flex",alignItems:"center",gap:6};
  var pill = {background:mkt.open?"#DCFCE7":"#F3F4F6",border:"1px solid "+(mkt.open?"#BBF7D0":"#E5E7EB"),borderRadius:20,padding:"3px 8px",display:"flex",alignItems:"center",gap:3};
  var dot = {width:5,height:5,borderRadius:"50%",background:mkt.open?G:"#9CA3AF"};
  var pillTxt = {fontSize:7,fontWeight:700,color:mkt.open?"#166534":"#6B7280"};
  var menuBtn = {background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:9,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"#374151"};
  return (
    <div style={bar}>
      <div style={logo}>
        <div style={bp}><span style={bpTxt}>BP</span></div>
        <div>
          <div style={title}>Breakout<span style={{color:G}}> Pro</span></div>
          <div style={tag}>CATCH EVERY BREAKOUT</div>
        </div>
      </div>
      <div style={right}>
        <div style={pill}>
          <div style={dot}></div>
          <span style={pillTxt}>{mkt.label}</span>
        </div>
        <button style={menuBtn} onClick={props.onMenu}>☰</button>
      </div>
    </div>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

function HomeScreen(props) {
  var nifty = props.nifty;
  var sensex = props.sensex;
  var bankNifty = props.bankNifty;
  var midcap = props.midcap;
  var stocks = props.stocks;
  var news = props.news;
  var briefing = props.briefing;
  var briefingLoading = props.briefingLoading;
  var onBriefing = props.onBriefing;
  var user = props.user;
  var setTab = props.setTab;
  var glTab = props.glTab;
  var setGlTab = props.setGlTab;

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var greeting = {background:"#fff",padding:"12px 16px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",justifyContent:"space-between"};
  var avatar = {width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff",flexShrink:0};
  var greetTxt = {fontSize:9,color:"#9CA3AF"};
  var userName = {fontSize:16,color:"#111827",fontWeight:800,letterSpacing:-0.3};
  var notifBtn = {background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"};

  var indices = [
    {label:"NIFTY 50",ltp:nifty.ltp,pct:nifty.pct,up:nifty.up},
    {label:"SENSEX",ltp:sensex.ltp,pct:sensex.pct,up:sensex.up},
    {label:"BANK NIFTY",ltp:bankNifty.ltp,pct:bankNifty.pct,up:bankNifty.up},
    {label:"MIDCAP",ltp:midcap.ltp,pct:midcap.pct,up:midcap.up},
  ];

  var quickGrid = [
    {ico:"📊",label:"OI Chain",tab:"oi"},
    {ico:"📡",label:"Scanner",tab:"scanner"},
    {ico:"💰",label:"FII/DII",tab:"markets"},
    {ico:"📰",label:"News",tab:"news"},
    {ico:"📚",label:"Learn",tab:"learn"},
    {ico:"🤖",label:"AI Chat",tab:"ai"},
    {ico:"🛠",label:"Tools",tab:"tools"},
    {ico:"⭐",label:"Watchlist",tab:"markets"},
  ];

  var h2 = {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8};
  var h2Txt = {fontSize:11,fontWeight:700,color:"#111827"};
  var viewAll = {background:"none",border:"none",color:G,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};

  var sortedStocks = stocks.slice().sort(function(a,b) {
    if(glTab == "gainers") return b.chgPct - a.chgPct;
    return a.chgPct - b.chgPct;
  }).slice(0,4);

  var hour = new Date().getHours();
  var greetWord = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={pg}>
      <div style={greeting}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={avatar}>{user && user.name ? user.name[0].toUpperCase() : "T"}</div>
          <div>
            <div style={greetTxt}>{greetWord}</div>
            <div style={userName}>{user && user.name ? user.name.split(" ")[0] : "Trader"} 👋</div>
          </div>
        </div>
        <button style={notifBtn} onClick={function(){setTab("news");}}>🔔</button>
      </div>

      <div style={{padding:"14px 14px 0"}}>

        {/* AI Briefing */}
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 2px 12px rgba(0,200,83,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:18}}>🤖</span>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>AI Market Briefing</div>
                <div style={{fontSize:8,color:"#6B7280"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}</div>
              </div>
            </div>
            {briefing ? (
              <button onClick={onBriefing} style={{background:"transparent",border:"1px solid #BBF7D0",borderRadius:20,padding:"4px 10px",color:G,fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>↻ Refresh</button>
            ) : (
              <button onClick={onBriefing} style={{background:G,border:"none",borderRadius:20,padding:"6px 14px",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get Briefing</button>
            )}
          </div>
          {briefingLoading ? (
            <div style={{textAlign:"center",padding:"12px 0"}}>
              <div style={{fontSize:10,color:"#374151"}}>AI is analyzing markets...</div>
              <div style={{height:3,background:"rgba(0,200,83,0.15)",borderRadius:3,marginTop:8,overflow:"hidden"}}>
                <div style={{height:"100%",width:"60%",background:G,borderRadius:3}}></div>
              </div>
            </div>
          ) : briefing ? (
            <div style={{background:"rgba(255,255,255,0.8)",borderRadius:10,padding:10}}>
              <div style={{fontSize:10,color:"#374151",lineHeight:1.7}}>{briefing}</div>
              <div style={{fontSize:7,color:"#9CA3AF",marginTop:6}}>⚠️ {DISCLAIMER}</div>
            </div>
          ) : (
            <div style={{background:"rgba(255,255,255,0.7)",borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:6}}>☀️</div>
              <div style={{fontSize:11,color:"#374151",fontWeight:600,marginBottom:4}}>Your Daily Market Briefing</div>
              <div style={{fontSize:9,color:"#6B7280"}}>Personalized market update ready for you</div>
            </div>
          )}
        </div>

        {/* Index Cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {indices.map(function(item) {
            return (
              <IndexCard key={item.label} item={item} onClick={function(){setTab("markets");}}/>
            );
          })}
        </div>

        {/* Quick Access */}
        <div style={{marginBottom:14}}>
          <div style={h2}><span style={h2Txt}>Quick Access</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {quickGrid.map(function(item) {
              var btn = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",fontFamily:"inherit"};
              var ico = {fontSize:20};
              var lbl = {fontSize:8,color:"#374151",fontWeight:600};
              return (
                <button key={item.label} style={btn} onClick={function(){setTab(item.tab);}}>
                  <span style={ico}>{item.ico}</span>
                  <span style={lbl}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Movers */}
        <div style={{marginBottom:14}}>
          <div style={h2}>
            <div style={{display:"flex",background:"#F3F4F6",borderRadius:20,padding:3}}>
              {["gainers","losers"].map(function(t) {
                var active = glTab == t;
                var tabBtn = {background:active?"#fff":"transparent",border:"none",borderRadius:17,padding:"5px 12px",color:active?"#111827":"#6B7280",fontSize:9,fontWeight:active?700:500,cursor:"pointer",fontFamily:"inherit",boxShadow:active?"0 1px 4px rgba(0,0,0,0.08)":"none"};
                return <button key={t} style={tabBtn} onClick={function(){setGlTab(t);}}>{t == "gainers" ? "🚀 Gainers" : "📉 Losers"}</button>;
              })}
            </div>
            <button style={viewAll} onClick={function(){setTab("markets");}}>View All →</button>
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
            {sortedStocks.map(function(s) {
              return <StockRow key={s.sym} stock={s} onClick={function(){setTab("markets");}}/>;
            })}
          </div>
        </div>

        {/* Sector */}
        <div style={{marginBottom:14}}>
          <div style={h2}><span style={h2Txt}>Sector Performance</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {SECTOR_DATA.slice(0,9).map(function(s) {
              var up = s.chg >= 0;
              var cell = {background:up?"#F0FDF4":"#FFF1F2",border:"1px solid "+(up?"#BBF7D0":"#FECDD3"),borderRadius:10,padding:"8px",textAlign:"center"};
              return (
                <div key={s.name} style={cell}>
                  <div style={{fontSize:9,fontWeight:600,color:"#374151"}}>{s.name}</div>
                  <div style={{fontSize:10,fontWeight:700,color:up?G:R,marginTop:2}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* News */}
        <div style={{marginBottom:14}}>
          <div style={h2}>
            <span style={h2Txt}>Market News</span>
            <button style={viewAll} onClick={function(){setTab("news");}}>View All →</button>
          </div>
          {news.slice(0,3).map(function(n,i) {
            var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"11px 13px",marginBottom:6,display:"flex",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
            var badge = {background:n.bull?"#DCFCE7":"#F3F4F6",borderRadius:7,padding:"3px 7px",height:"fit-content",flexShrink:0};
            var badgeTxt = {fontSize:7,fontWeight:700,color:n.bull?"#166534":"#6B7280"};
            return (
              <div key={i} style={card}>
                <div style={badge}><span style={badgeTxt}>{n.cat.substring(0,4).toUpperCase()}</span></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#111827",lineHeight:1.4,marginBottom:2}}>{n.title}</div>
                  <div style={{fontSize:8,color:"#9CA3AF"}}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"9px 12px",marginBottom:6,display:"flex",gap:6}}>
          <span style={{fontSize:12,flexShrink:0}}>⚠️</span>
          <div style={{fontSize:7.5,color:"#92400E",lineHeight:1.6}}>Educational Purpose Only. Not SEBI Registered. Not Investment Advice.</div>
        </div>

      </div>
    </div>
  );
}

function MarketsScreen(props) {
  var stocks = props.stocks;
  var setTab = props.setTab;
  var [search, setSearch] = useState("");
  var [sort, setSort] = useState("pct");

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var hdr = {background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0"};
  var searchBox = {display:"flex",alignItems:"center",gap:8,background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 12px",marginBottom:10};
  var inp = {flex:1,background:"none",border:"none",outline:"none",fontSize:12,color:"#111827",fontFamily:"inherit"};

  var filtered = stocks.filter(function(s) {
    if(!search) return true;
    return s.sym.toLowerCase().indexOf(search.toLowerCase()) !== -1 || s.name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
  }).sort(function(a,b) {
    if(sort == "pct") return b.chgPct - a.chgPct;
    if(sort == "ltp") return b.ltp - a.ltp;
    return 0;
  });

  return (
    <div style={pg}>
      <div style={hdr}>
        <div style={searchBox}>
          <span style={{fontSize:14}}>🔍</span>
          <input style={inp} placeholder="Search stocks..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
          {search ? <button onClick={function(){setSearch("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:14}}>✕</button> : null}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["pct","ltp"].map(function(s) {
            var active = sort == s;
            var btn = {background:active?G:"#F3F4F6",border:"none",borderRadius:20,padding:"4px 12px",color:active?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};
            return <button key={s} style={btn} onClick={function(){setSort(s);}}>{s == "pct" ? "% Change" : "Price"}</button>;
          })}
        </div>
      </div>
      <div style={{background:"#fff",margin:"10px 14px",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
        {filtered.map(function(s) {
          return <StockRow key={s.sym} stock={s} onClick={function(){}}/>;
        })}
      </div>
    </div>
  );
}

function ScannerScreen(props) {
  var [activeScanner, setActiveScanner] = useState("breakout");
  var [results, setResults] = useState([]);
  var stocks = props.stocks;

  var scanners = [
    {id:"breakout",label:"Breakout",ico:"🚀"},
    {id:"breakdown",label:"Breakdown",ico:"📉"},
    {id:"volume",label:"Volume Spike",ico:"📊"},
    {id:"gapup",label:"Gap Up",ico:"⬆️"},
    {id:"gapdown",label:"Gap Down",ico:"⬇️"},
    {id:"hh",label:"HH-HL",ico:"📈"},
  ];

  function runScan(type) {
    setActiveScanner(type);
    var r = stocks.filter(function(s) {
      if(type == "breakout") return s.up && s.chgPct > 1.5;
      if(type == "breakdown") return !s.up && s.chgPct < -1.5;
      if(type == "volume") return true;
      if(type == "gapup") return s.up && s.chgPct > 1.0;
      if(type == "gapdown") return !s.up && s.chgPct < -1.0;
      if(type == "hh") return s.up;
      return false;
    });
    setResults(r);
  }

  useEffect(function(){
    runScan("breakout");
  }, []);

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var scanList = {display:"flex",gap:8,overflowX:"auto",padding:"12px 14px",background:"#fff",borderBottom:"1px solid #F0F0F0"};

  return (
    <div style={pg}>
      <div style={scanList}>
        {scanners.map(function(sc) {
          var active = activeScanner == sc.id;
          var btn = {background:active?G:"#F3F4F6",border:"none",borderRadius:20,padding:"6px 12px",color:active?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:4};
          return (
            <button key={sc.id} style={btn} onClick={function(){runScan(sc.id);}}>
              <span>{sc.ico}</span><span>{sc.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:10,color:"#6B7280",marginBottom:8}}>{results.length} stocks found</div>
        {results.length == 0 ? (
          <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>
            <div style={{fontSize:32,marginBottom:8}}>🔍</div>
            <div style={{fontSize:12}}>No results for this scanner</div>
          </div>
        ) : (
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
            {results.map(function(s) {
              return <StockRow key={s.sym} stock={s} onClick={function(){}}/>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OIScreen(props) {
  var oiData = [
    {strike:22000,ceOI:45230,peOI:12340,ceLTP:89.50,peLTP:4.20,iv:14.2},
    {strike:22100,ceOI:38400,peOI:18900,ceLTP:56.30,peLTP:8.10,iv:14.8},
    {strike:22200,ceOI:67800,peOI:23400,ceLTP:34.20,peLTP:15.60,iv:15.1},
    {strike:22300,ceOI:89200,peOI:45600,ceLTP:18.90,peLTP:28.40,iv:15.6},
    {strike:22400,ceOI:112000,peOI:67800,ceLTP:8.70,peLTP:48.20,iv:16.2},
    {strike:22500,ceOI:134500,peOI:89000,ceLTP:3.40,peLTP:72.10,iv:17.0},
    {strike:22600,ceOI:78900,peOI:56700,ceLTP:1.20,peLTP:98.40,iv:17.8},
  ];
  var maxPain = 22400;
  var pcr = 0.84;

  var pg = {background:"#0B0B0B",minHeight:"100%",paddingBottom:80,color:"#fff"};
  var hdr = {padding:"14px",background:"#111",borderBottom:"1px solid #1E1E1E"};
  var stats = {display:"flex",gap:10,marginBottom:14};
  var statCard = {flex:1,background:"#161616",border:"1px solid #222",borderRadius:10,padding:"10px",textAlign:"center"};
  var statLbl = {fontSize:8,color:"#555",marginBottom:4};
  var statVal = {fontSize:14,fontWeight:800,color:G};

  return (
    <div style={pg}>
      <div style={hdr}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>NIFTY Options Chain</div>
        <div style={{fontSize:9,color:"#555"}}>Live data every 3 mins during market hours</div>
      </div>
      <div style={{padding:14}}>
        <div style={stats}>
          <div style={statCard}>
            <div style={statLbl}>PCR</div>
            <div style={statVal}>{pcr}</div>
          </div>
          <div style={statCard}>
            <div style={statLbl}>Max Pain</div>
            <div style={{fontSize:14,fontWeight:800,color:"#F59E0B"}}>{maxPain}</div>
          </div>
          <div style={statCard}>
            <div style={statLbl}>ATM IV</div>
            <div style={statVal}>17.0%</div>
          </div>
        </div>
        <div style={{background:"#111",borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:4,padding:"8px 10px",borderBottom:"1px solid #1E1E1E",fontSize:7,color:"#555",textAlign:"center"}}>
            <span>CE OI</span>
            <span>Strike</span>
            <span>PE OI</span>
          </div>
          {oiData.map(function(row) {
            var maxOI = 134500;
            var ceBar = (row.ceOI/maxOI)*100;
            var peBar = (row.peOI/maxOI)*100;
            var isAtm = row.strike == maxPain;
            var rowStyle = {padding:"8px 10px",borderBottom:"1px solid #161616",background:isAtm?"#1a1000":"transparent"};
            return (
              <div key={row.strike} style={rowStyle}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:4,alignItems:"center"}}>
                  <div>
                    <div style={{height:4,background:R,borderRadius:2,width:ceBar+"%",marginLeft:"auto"}}></div>
                    <div style={{fontSize:8,color:"#EF4444",textAlign:"right",marginTop:2}}>{(row.ceOI/1000).toFixed(0)}K</div>
                  </div>
                  <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:isAtm?"#F59E0B":"#fff"}}>{row.strike}</div>
                  <div>
                    <div style={{height:4,background:G,borderRadius:2,width:peBar+"%"}}></div>
                    <div style={{fontSize:8,color:G,marginTop:2}}>{(row.peOI/1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LearnScreen(props) {
  var [section, setSection] = useState("home");
  var [selectedPattern, setSelectedPattern] = useState(null);
  var [termSearch, setTermSearch] = useState("");

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};

  if(section == "candles") {
    return (
      <div style={pg}>
        <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setSection("home");}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>←</button>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Candlestick Patterns</div>
        </div>
        <div style={{padding:14}}>
          {CANDLE_PATTERNS.map(function(p) {
            var up = p.type == "Bullish";
            var neu = p.type == "Neutral";
            var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
            var badge = {background:up?"#DCFCE7":neu?"#FEF3C7":"#FEE2E2",color:up?"#166534":neu?"#D97706":"#991B1B",borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700,display:"inline-block",marginBottom:6};
            return (
              <div key={p.name} style={card}>
                <div style={badge}>{p.type}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:4}}>{p.name}</div>
                <div style={{fontSize:10,color:"#6B7280",lineHeight:1.6}}>{p.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if(section == "terms") {
    var filteredTerms = TERMS_DATA.filter(function(t) {
      return !termSearch || t.term.toLowerCase().indexOf(termSearch.toLowerCase()) !== -1;
    });
    return (
      <div style={pg}>
        <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setSection("home");}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>←</button>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Market Terms</div>
        </div>
        <div style={{padding:14}}>
          <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",gap:8}}>
            <span>🔍</span>
            <input style={{flex:1,border:"none",outline:"none",fontSize:12,fontFamily:"inherit"}} placeholder="Search terms..." value={termSearch} onChange={function(e){setTermSearch(e.target.value);}}/>
          </div>
          {filteredTerms.map(function(t) {
            return (
              <div key={t.term} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:10,padding:"12px",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:4}}>{t.term}</div>
                <div style={{fontSize:10,color:"#6B7280",lineHeight:1.6}}>{t.def}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  var topics = [
    {id:"candles",ico:"🕯️",title:"Candlestick Patterns",count:"50+ patterns",color:"#FFF7ED",border:"#FED7AA"},
    {id:"terms",ico:"📖",title:"Market Terms",count:"100+ terms",color:"#F0FDF4",border:"#BBF7D0"},
    {id:"oi",ico:"📊",title:"OI Concepts",count:"PCR, Max Pain, Greeks",color:"#EFF6FF",border:"#BFDBFE"},
    {id:"charts",ico:"📈",title:"Chart Patterns",count:"Breakout, Triangle, Flag",color:"#FDF4FF",border:"#E9D5FF"},
    {id:"risk",ico:"🛡️",title:"Risk Management",count:"Position sizing, SL",color:"#FFF1F2",border:"#FECDD3"},
    {id:"psych",ico:"🧠",title:"Trading Psychology",count:"Discipline, Emotions",color:"#F0FDF4",border:"#BBF7D0"},
  ];

  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{fontSize:18,fontWeight:800,color:"#111827",marginBottom:4}}>Learn Trading</div>
        <div style={{fontSize:10,color:"#6B7280",marginBottom:16}}>Master the markets with our education library</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {topics.map(function(t) {
            var card = {background:t.color,border:"1px solid "+t.border,borderRadius:14,padding:"14px",cursor:"pointer"};
            return (
              <div key={t.id} style={card} onClick={function(){setSection(t.id);}}>
                <div style={{fontSize:28,marginBottom:8}}>{t.ico}</div>
                <div style={{fontSize:11,fontWeight:700,color:"#111827",marginBottom:3}}>{t.title}</div>
                <div style={{fontSize:8,color:"#6B7280"}}>{t.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AIScreen(props) {
  var [msgs, setMsgs] = useState([]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var endRef = useRef(null);

  useEffect(function(){
    if(endRef.current) endRef.current.scrollIntoView({behavior:"smooth"});
  }, [msgs]);

  function localAnswer(q) {
    var ql = q.toLowerCase();
    for(var i=0;i<TERMS_DATA.length;i++) {
      if(ql.indexOf(TERMS_DATA[i].term.toLowerCase()) !== -1) {
        return TERMS_DATA[i].term + ": " + TERMS_DATA[i].def + "\n\n📚 Educational only | Not SEBI registered investment advice";
      }
    }
    for(var j=0;j<CANDLE_PATTERNS.length;j++) {
      if(ql.indexOf(CANDLE_PATTERNS[j].name.toLowerCase()) !== -1) {
        return CANDLE_PATTERNS[j].name + " (" + CANDLE_PATTERNS[j].type + "): " + CANDLE_PATTERNS[j].desc + "\n\n📚 Educational only | Not SEBI registered investment advice";
      }
    }
    return null;
  }

  async function send(q) {
    if(!q.trim() || loading) return;
    var newMsgs = msgs.concat([{role:"user",text:q,time:nowT()}]);
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);

    var localAns = localAnswer(q);
    if(localAns) {
      setMsgs(newMsgs.concat([{role:"ai",text:localAns,time:nowT()}]).slice(-20));
      setLoading(false);
      return;
    }

    var GEMINI_KEY = "";
    if(typeof window !== "undefined" && window.GEMINI_KEY) GEMINI_KEY = window.GEMINI_KEY;

    var sys = "You are Breakout Pro AI — Indian stock market education assistant. Rules: 1) Educational only — no buy/sell advice 2) Keep answers under 150 words 3) Use Indian context (NSE/BSE) 4) Always end with: 📚 Educational only | Not SEBI registered investment advice";

    async function callGemini() {
      var ctrl = new AbortController();
      var timer = setTimeout(function(){ctrl.abort();}, 15000);
      try {
        var resp = await fetch(GEMINI_URL + GEMINI_KEY, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({contents:[{role:"user",parts:[{text:sys+"\n\nQuestion: "+q}]}],generationConfig:{maxOutputTokens:300,temperature:0.5}}),
          signal:ctrl.signal,
        });
        clearTimeout(timer);
        return resp.json();
      } catch(e) {
        clearTimeout(timer);
        throw e;
      }
    }

    var aiText = "";
    try {
      var data = await callGemini();
      if(data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiText = data.candidates[0].content.parts.map(function(p){return p.text||"";}).join("").trim();
      } else if(data.error) {
        throw new Error(data.error.message || "API error");
      } else {
        throw new Error("Empty response");
      }
    } catch(e1) {
      try {
        await new Promise(function(r){setTimeout(r,1500);});
        var data2 = await callGemini();
        if(data2.candidates && data2.candidates[0] && data2.candidates[0].content) {
          aiText = data2.candidates[0].content.parts.map(function(p){return p.text||"";}).join("").trim();
        } else {
          throw new Error("Retry failed");
        }
      } catch(e2) {
        aiText = "❌ Could not connect to AI. Please check API key in Vercel settings.\n\n📚 Educational only | Not SEBI registered investment advice";
      }
    }

    if(aiText && aiText.indexOf("Educational only") == -1) {
      aiText += "\n\n📚 Educational only | Not SEBI registered investment advice";
    }
    setMsgs(newMsgs.concat([{role:"ai",text:aiText,time:nowT()}]).slice(-20));
    setLoading(false);
  }

  var pg = {background:"#0B0B0B",minHeight:"100%",display:"flex",flexDirection:"column",paddingBottom:80};
  var hdr = {background:"#111",borderBottom:"1px solid #1E1E1E",padding:"11px 14px",display:"flex",alignItems:"center",gap:10};
  var msgs_area = {flex:1,overflowY:"auto",padding:12};
  var inp_area = {borderTop:"1px solid #1A1A1A",padding:"8px 12px 12px",background:"#0F0F0F"};

  return (
    <div style={pg}>
      <div style={hdr}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1E3A5F,#0F2744)",border:"1px solid #1E4080",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:7,fontWeight:900,color:"#fff",fontFamily:"Arial"}}>BP AI</span>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Breakout Pro AI</div>
          <div style={{fontSize:8,color:loading?"#F59E0B":"#00C853"}}>{loading?"Thinking...":"Gemini 2.0 Flash · Ready"}</div>
        </div>
      </div>
      <div style={{background:"#0F0A00",borderBottom:"1px solid #2A1E00",padding:"5px 14px"}}>
        <span style={{fontSize:7.5,color:"#92694A",fontWeight:600}}>⚠️ Educational Only | Not SEBI Registered Investment Advice</span>
      </div>
      <div style={msgs_area}>
        {msgs.length == 0 ? (
          <div style={{textAlign:"center",paddingTop:20}}>
            <div style={{fontSize:32,marginBottom:10}}>🤖</div>
            <div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:4}}>Breakout Pro AI</div>
            <div style={{fontSize:9,color:"#666",marginBottom:16}}>Ask me anything about stock market education</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {QUICK_QS.slice(0,6).map(function(q) {
                return (
                  <button key={q} onClick={function(){send(q);}} style={{background:"#161616",border:"1px solid #222",borderRadius:10,padding:"9px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                    <div style={{fontSize:8,color:"#ccc",lineHeight:1.5}}>{q}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {msgs.map(function(m,i) {
          var isUser = m.role == "user";
          return (
            <div key={i} style={{marginBottom:12,display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"88%",background:isUser?"#1E3A5F":"#161616",border:isUser?"1px solid #1E4080":"1px solid #222",borderRadius:isUser?"14px 14px 4px 14px":"4px 14px 14px 14px",padding:"10px 13px"}}>
                <div style={{fontSize:11,color:"#e8e8e8",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{m.text}</div>
                <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",marginTop:3,textAlign:"right"}}>{m.time}</div>
              </div>
            </div>
          );
        })}
        {loading ? (
          <div style={{display:"flex",marginBottom:12}}>
            <div style={{background:"#161616",border:"1px solid #222",borderRadius:"4px 14px 14px 14px",padding:"13px 16px"}}>
              <div style={{display:"flex",gap:5}}>
                {[0,1,2].map(function(i) {
                  return <div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#3B82F6",opacity:0.8}}></div>;
                })}
              </div>
            </div>
          </div>
        ) : null}
        <div ref={endRef}></div>
      </div>
      <div style={inp_area}>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:8,paddingBottom:2}}>
          {["Doji","Support","OI","Theta","VWAP","RSI","PCR","Breakout"].map(function(q) {
            return (
              <button key={q} disabled={loading} onClick={function(){send("Explain "+q+" in stock market");}} style={{background:"#161616",border:"1px solid #222",borderRadius:20,padding:"4px 10px",color:loading?"#333":"#3B82F6",fontSize:8,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",fontWeight:600}}>{q}</button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key=="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}} placeholder="Ask about any market concept..." rows={1} disabled={loading} style={{flex:1,background:"#161616",border:"1px solid #222",borderRadius:11,padding:"10px 12px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",resize:"none",lineHeight:1.5,maxHeight:80,overflowY:"auto",opacity:loading?0.6:1}}/>
          <button onClick={function(){send(input);}} disabled={!input.trim()||loading} style={{background:(!input.trim()||loading)?"#1A1A1A":"linear-gradient(135deg,#3B82F6,#1D4ED8)",border:"none",borderRadius:11,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",cursor:(!input.trim()||loading)?"not-allowed":"pointer",fontSize:16,flexShrink:0,color:"#fff"}}>➤</button>
        </div>
      </div>
    </div>
  );
}

function ToolsScreen(props) {
  var [activeTool, setActiveTool] = useState("rr");
  var [rrEntry, setRrEntry] = useState("22500");
  var [rrSL, setRrSL] = useState("22400");
  var [rrTarget, setRrTarget] = useState("22700");
  var [posCapital, setPosCapital] = useState("100000");
  var [posRisk, setPosRisk] = useState("2");
  var [posSL, setPosSL] = useState("22400");
  var [posEntry, setPosEntry] = useState("22500");

  var tools = [
    {id:"rr",label:"R:R Calculator",ico:"⚖️"},
    {id:"pos",label:"Position Size",ico:"📐"},
    {id:"brok",label:"Brokerage Calc",ico:"💰"},
    {id:"greeks",label:"Option Greeks",ico:"🔢"},
  ];

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var toolBar = {display:"flex",gap:8,overflowX:"auto",padding:"12px 14px",background:"#fff",borderBottom:"1px solid #F0F0F0"};

  var rrRatio = 0;
  var rrValid = false;
  try {
    var entry = parseFloat(rrEntry);
    var sl = parseFloat(rrSL);
    var tgt = parseFloat(rrTarget);
    if(entry && sl && tgt) {
      var risk = Math.abs(entry - sl);
      var reward = Math.abs(tgt - entry);
      rrRatio = reward/risk;
      rrValid = true;
    }
  } catch(e) {}

  var posQty = 0;
  try {
    var cap = parseFloat(posCapital);
    var riskPct = parseFloat(posRisk)/100;
    var slPts = Math.abs(parseFloat(posEntry) - parseFloat(posSL));
    if(cap && riskPct && slPts) {
      posQty = Math.floor((cap * riskPct) / slPts);
    }
  } catch(e) {}

  var inpStyle = {width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"11px 13px",color:"#111827",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10};
  var lbl = {fontSize:11,color:"#374151",fontWeight:600,marginBottom:5,display:"block"};
  var resultBox = {background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:12,padding:14,marginTop:14,textAlign:"center"};

  return (
    <div style={pg}>
      <div style={toolBar}>
        {tools.map(function(t) {
          var active = activeTool == t.id;
          var btn = {background:active?G:"#F3F4F6",border:"none",borderRadius:20,padding:"6px 12px",color:active?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:4};
          return (
            <button key={t.id} style={btn} onClick={function(){setActiveTool(t.id);}}>
              <span>{t.ico}</span><span>{t.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{padding:14}}>
        {activeTool == "rr" ? (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:14}}>⚖️ Risk:Reward Calculator</div>
            <label style={lbl}>Entry Price</label>
            <input style={inpStyle} type="number" value={rrEntry} onChange={function(e){setRrEntry(e.target.value);}}/>
            <label style={lbl}>Stop Loss</label>
            <input style={inpStyle} type="number" value={rrSL} onChange={function(e){setRrSL(e.target.value);}}/>
            <label style={lbl}>Target Price</label>
            <input style={inpStyle} type="number" value={rrTarget} onChange={function(e){setRrTarget(e.target.value);}}/>
            {rrValid ? (
              <div style={resultBox}>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Risk:Reward Ratio</div>
                <div style={{fontSize:32,fontWeight:900,color:rrRatio>=2?G:rrRatio>=1?"#F59E0B":R}}>1:{rrRatio.toFixed(1)}</div>
                <div style={{fontSize:9,color:"#6B7280",marginTop:4}}>{rrRatio>=2?"Excellent trade setup":"R:R below 1:2 — consider adjusting"}</div>
              </div>
            ) : null}
          </div>
        ) : null}
        {activeTool == "pos" ? (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:14}}>📐 Position Size Calculator</div>
            <label style={lbl}>Capital (Rs)</label>
            <input style={inpStyle} type="number" value={posCapital} onChange={function(e){setPosCapital(e.target.value);}}/>
            <label style={lbl}>Risk per Trade (%)</label>
            <input style={inpStyle} type="number" value={posRisk} onChange={function(e){setPosRisk(e.target.value);}}/>
            <label style={lbl}>Entry Price</label>
            <input style={inpStyle} type="number" value={posEntry} onChange={function(e){setPosEntry(e.target.value);}}/>
            <label style={lbl}>Stop Loss</label>
            <input style={inpStyle} type="number" value={posSL} onChange={function(e){setPosSL(e.target.value);}}/>
            {posQty > 0 ? (
              <div style={resultBox}>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Recommended Quantity</div>
                <div style={{fontSize:32,fontWeight:900,color:G}}>{posQty}</div>
                <div style={{fontSize:9,color:"#6B7280",marginTop:4}}>Max loss: Rs {fN((parseFloat(posCapital)*parseFloat(posRisk)/100))}</div>
              </div>
            ) : null}
          </div>
        ) : null}
        {activeTool == "brok" ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:32,marginBottom:10}}>💰</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:6}}>Brokerage Calculator</div>
            <div style={{fontSize:10,color:"#6B7280"}}>Coming soon — Zerodha, Groww, Dhan brokerage comparison</div>
          </div>
        ) : null}
        {activeTool == "greeks" ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:32,marginBottom:10}}>🔢</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:6}}>Option Greeks</div>
            <div style={{fontSize:10,color:"#6B7280"}}>Delta, Gamma, Theta, Vega calculator coming soon</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NewsScreen(props) {
  var news = props.news;
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Market News</div>
        {news.map(function(n,i) {
          var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"14px",marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"};
          var badge = {background:n.bull?"#DCFCE7":"#FEE2E2",display:"inline-block",borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700,color:n.bull?"#166534":"#991B1B",marginBottom:8};
          return (
            <div key={i} style={card}>
              <div style={badge}>{n.cat}</div>
              <div style={{fontSize:12,fontWeight:600,color:"#111827",lineHeight:1.5,marginBottom:6}}>{n.title}</div>
              <div style={{fontSize:9,color:"#9CA3AF"}}>{n.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen(props) {
  var onLogin = props.onLogin;
  var [mode, setMode] = useState("login");
  var [name, setName] = useState("");
  var [phone, setPhone] = useState("");
  var [pass, setPass] = useState("");
  var [err, setErr] = useState("");

  function submit() {
    if(!phone || phone.length < 10) { setErr("Enter valid 10-digit phone number"); return; }
    if(!pass || pass.length < 6) { setErr("Password must be at least 6 characters"); return; }
    if(mode == "register" && !name) { setErr("Please enter your name"); return; }
    var users = {};
    try { users = JSON.parse(localStorage.getItem("bp_users")||"{}"); } catch(e) {}
    if(mode == "register") {
      if(users[phone]) { setErr("Phone already registered. Please login."); return; }
      users[phone] = {name:name, phone:phone, pass:pass};
      try { localStorage.setItem("bp_users", JSON.stringify(users)); } catch(e) {}
      onLogin({name:name, phone:phone});
    } else {
      if(!users[phone] || users[phone].pass !== pass) { setErr("Invalid phone or password"); return; }
      onLogin(users[phone]);
    }
  }

  var pg = {background:"#F8F9FA",minHeight:"100vh",display:"flex",flexDirection:"column"};
  var logoSec = {background:"#fff",padding:"32px 20px 24px",textAlign:"center",borderBottom:"1px solid #F0F0F0"};
  var bp = {width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 4px 14px rgba(0,200,83,0.3)"};
  var appName = {fontSize:26,fontWeight:900,color:"#111827",letterSpacing:-0.8};
  var tag = {fontSize:9,color:"#F97316",fontWeight:800,letterSpacing:2,marginTop:3};
  var sub = {fontSize:10,color:"#9CA3AF",marginTop:6};
  var body = {padding:"24px 20px",flex:1};
  var tabRow = {display:"flex",background:"#F3F4F6",borderRadius:12,padding:4,marginBottom:20,border:"1px solid #E5E7EB"};
  var inpWrap = {background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"11px 13px",marginBottom:10,display:"flex",gap:8,alignItems:"center"};
  var inpStyle = {flex:1,background:"none",border:"none",outline:"none",color:"#111827",fontSize:13,fontFamily:"inherit"};
  var submitBtn = {width:"100%",background:G,border:"none",borderRadius:12,padding:"14px",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 3px 12px rgba(0,200,83,0.3)",marginTop:4};
  var disc = {marginTop:14,background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"10px 12px",fontSize:8,color:"#92400E",lineHeight:1.7,textAlign:"center"};

  return (
    <div style={pg}>
      <div style={logoSec}>
        <div style={bp}><span style={{fontFamily:"Arial",fontSize:18,fontWeight:900,color:"#fff"}}>BP</span></div>
        <div style={appName}>Breakout<span style={{color:G}}> Pro</span></div>
        <div style={tag}>CATCH EVERY BREAKOUT</div>
        <div style={sub}>India's #1 Stock Market Education Platform</div>
      </div>
      <div style={body}>
        <div style={tabRow}>
          {["login","register"].map(function(m) {
            var active = mode == m;
            var btn = {flex:1,padding:"10px",borderRadius:9,border:"none",background:active?"#fff":"transparent",color:active?"#111827":"#6B7280",fontWeight:active?700:500,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:active?"0 1px 4px rgba(0,0,0,0.08)":"none"};
            return <button key={m} style={btn} onClick={function(){setMode(m);setErr("");}}>{m == "login" ? "Login" : "Register"}</button>;
          })}
        </div>
        {err ? <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:11,color:"#DC2626"}}>⚠️ {err}</div> : null}
        {mode == "register" ? (
          <div style={inpWrap}>
            <span style={{fontSize:14}}>👤</span>
            <input style={inpStyle} placeholder="Full Name" value={name} onChange={function(e){setName(e.target.value);}}/>
          </div>
        ) : null}
        <div style={inpWrap}>
          <span style={{fontSize:14}}>📱</span>
          <input style={inpStyle} placeholder="10-digit Phone Number" type="tel" maxLength={10} value={phone} onChange={function(e){setPhone(e.target.value);}}/>
        </div>
        <div style={inpWrap}>
          <span style={{fontSize:14}}>🔒</span>
          <input style={inpStyle} placeholder="Password (min 6 chars)" type="password" value={pass} onChange={function(e){setPass(e.target.value);}}/>
        </div>
        <button style={submitBtn} onClick={submit}>{mode == "login" ? "Login →" : "Create Account →"}</button>
        <div style={disc}>⚠️ {DISCLAIMER}</div>
      </div>
    </div>
  );
}

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen() {
  var wrap = {position:"fixed",top:0,left:0,right:0,bottom:0,background:"#0B0B0B",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999};
  var inner = {textAlign:"center"};
  var bp = {width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 6px 24px rgba(0,200,83,0.4)"};
  var name = {fontSize:28,fontWeight:900,color:"#fff",letterSpacing:-1,marginBottom:4};
  var tag = {fontSize:8,color:"#F97316",fontWeight:800,letterSpacing:2,marginBottom:20};
  var bar = {width:200,height:3,background:"#1A2A1A",borderRadius:3,margin:"0 auto",overflow:"hidden"};
  var fill = {height:"100%",width:"70%",background:G,borderRadius:3};
  return (
    <div style={wrap}>
      <div style={inner}>
        <div style={bp}><span style={{fontFamily:"Arial",fontSize:22,fontWeight:900,color:"#fff"}}>BP</span></div>
        <div style={name}>Breakout<span style={{color:G}}> Pro</span></div>
        <div style={tag}>CATCH EVERY BREAKOUT</div>
        <div style={bar}><div style={fill}></div></div>
        <div style={{fontSize:9,color:"#555",marginTop:10}}>Loading...</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function StocksBuddy() {

  function getSess() {
    try {
      var s = localStorage.getItem("bp_sess");
      if(!s) return null;
      var d = JSON.parse(s);
      if(d && d.name && d.phone) return d;
      localStorage.removeItem("bp_sess");
      return null;
    } catch(e) { return null; }
  }

  var savedUser = getSess();

  var [splash, setSplash] = useState(true);
  var [user, setUser] = useState(savedUser);
  var [tab, setTab] = useState("home");
  var [nifty, setNifty] = useState({ltp:22467.90,pct:1.35,up:true});
  var [sensex, setSensex] = useState({ltp:73863.45,pct:1.28,up:true});
  var [bankNifty, setBankNifty] = useState({ltp:48234.60,pct:0.86,up:true});
  var [midcap, setMidcap] = useState({ltp:43876.20,pct:0.74,up:true});
  var [stocks, setStocks] = useState(STOCKS_DEFAULT);
  var [news, setNews] = useState(NEWS_DEFAULT);
  var [briefing, setBriefing] = useState("");
  var [briefingLoading, setBriefingLoading] = useState(false);
  var [glTab, setGlTab] = useState("gainers");
  var [sidebar, setSidebar] = useState(false);
  var [clk, setClk] = useState(nowT());

  // Splash timer
  useEffect(function() {
    var t = setTimeout(function() { setSplash(false); }, 2000);
    return function() { clearTimeout(t); };
  }, []);

  // Clock
  useEffect(function() {
    var t = setInterval(function() { setClk(nowT()); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  // CSS injection
  useEffect(function() {
    if(document.getElementById("bp-css")) return;
    var el = document.createElement("style");
    el.id = "bp-css";
    el.textContent = "@keyframes bpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.05)}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}";
    document.head.appendChild(el);
  }, []);

  function login(u) {
    setUser(u);
    try { localStorage.setItem("bp_sess", JSON.stringify(u)); } catch(e) {}
  }

  function logout() {
    setUser(null);
    try { localStorage.removeItem("bp_sess"); } catch(e) {}
    setSidebar(false);
  }

  async function loadBriefing() {
    setBriefingLoading(true);
    var GEMINI_KEY = "";
    if(typeof window !== "undefined" && window.GEMINI_KEY) GEMINI_KEY = window.GEMINI_KEY;
    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function(){ctrl.abort();}, 15000);
      var prompt = "Give a brief Indian stock market educational summary for today in 100 words. Mention NIFTY at " + nifty.ltp + " (" + (nifty.up?"+":"") + nifty.pct + "%). Educational only, no advice. End with: Educational only. Not investment advice.";
      var resp = await fetch(GEMINI_URL + GEMINI_KEY, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:200,temperature:0.7}}),
        signal:ctrl.signal,
      });
      clearTimeout(timer);
      var data = await resp.json();
      if(data.candidates && data.candidates[0] && data.candidates[0].content) {
        setBriefing(data.candidates[0].content.parts[0].text);
      } else {
        setBriefing("Market update unavailable. Check Gemini API key in settings.");
      }
    } catch(e) {
      setBriefing("Could not load briefing. Please check your internet connection.");
    }
    setBriefingLoading(false);
  }

  // Sidebar nav items
  var navItems = [
    {ico:"🏠",label:"Home",id:"home"},
    {ico:"📈",label:"Markets",id:"markets"},
    {ico:"📡",label:"Scanner",id:"scanner"},
    {ico:"📊",label:"OI Chain",id:"oi"},
    {ico:"📚",label:"Learn",id:"learn"},
    {ico:"🤖",label:"AI Chat",id:"ai"},
    {ico:"🛠",label:"Tools",id:"tools"},
    {ico:"📰",label:"News",id:"news"},
  ];

  var mktStatus = getMarketStatus();

  var appWrap = {position:"relative",width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",overflow:"hidden",fontFamily:"Inter,Poppins,Segoe UI,sans-serif",background:"#F8F9FA"};
  var mainArea = {height:"100vh",overflowY:"auto",paddingTop:0};

  // Sidebar overlay
  var sideOverlay = {position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex"};
  var sidePanel = {width:260,background:"#fff",borderRight:"1px solid #E5E7EB",display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.1)"};
  var sideBg = {flex:1,background:"rgba(0,0,0,0.3)"};
  var sideHead = {padding:"20px 16px",borderBottom:"1px solid #F0F0F0"};
  var sideBody = {flex:1,overflowY:"auto",padding:"8px 0"};
  var sideFoot = {padding:"16px",borderTop:"1px solid #F0F0F0"};
  var logoutBtn = {width:"100%",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"11px",color:"#DC2626",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};

  function renderContent() {
    if(splash) {
      return (
        <SplashScreen/>
      );
    }
    if(!user) {
      return (
        <AuthScreen onLogin={login}/>
      );
    }
    var screen = null;
    if(tab == "home") { screen = <HomeScreen nifty={nifty} sensex={sensex} bankNifty={bankNifty} midcap={midcap} stocks={stocks} news={news} briefing={briefing} briefingLoading={briefingLoading} onBriefing={loadBriefing} user={user} setTab={setTab} glTab={glTab} setGlTab={setGlTab}/>; }
    if(tab == "markets") { screen = <MarketsScreen stocks={stocks} setTab={setTab}/>; }
    if(tab == "scanner") { screen = <ScannerScreen stocks={stocks}/>; }
    if(tab == "oi") { screen = <OIScreen/>; }
    if(tab == "learn") { screen = <LearnScreen/>; }
    if(tab == "ai") { screen = <AIScreen/>; }
    if(tab == "tools") { screen = <ToolsScreen/>; }
    if(tab == "news") { screen = <NewsScreen news={news}/>; }
    if(!screen) { screen = <HomeScreen nifty={nifty} sensex={sensex} bankNifty={bankNifty} midcap={midcap} stocks={stocks} news={news} briefing={briefing} briefingLoading={briefingLoading} onBriefing={loadBriefing} user={user} setTab={setTab} glTab={glTab} setGlTab={setGlTab}/>; }

    function renderSidebar() {
      if(!sidebar) return null;
      return (
        <div style={sideOverlay}>
          <div style={sidePanel}>
            <div style={sideHead}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff"}}>{user.name[0].toUpperCase()}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:"#111827"}}>{user.name}</div>
                  <div style={{fontSize:9,color:"#9CA3AF"}}>{user.phone}</div>
                </div>
              </div>
            </div>
            <div style={sideBody}>
              {navItems.map(function(item) {
                var isActive = tab == item.id;
                var navBtn = {width:"100%",background:isActive?"#F0FDF4":"none",border:"none",borderLeft:isActive?"3px solid "+G:"3px solid transparent",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left"};
                return (
                  <button key={item.id} style={navBtn} onClick={function(){setTab(item.id);setSidebar(false);}}>
                    <span style={{fontSize:18}}>{item.ico}</span>
                    <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?G:"#374151"}}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={sideFoot}>
              <div style={{fontSize:7,color:"#9CA3AF",marginBottom:10,lineHeight:1.6}}>Educational only. Not SEBI registered. Not investment advice.</div>
              <button style={logoutBtn} onClick={logout}>Logout</button>
            </div>
          </div>
          <div style={sideBg} onClick={function(){setSidebar(false);}}></div>
        </div>
      );
    }

    return (
      <div style={appWrap}>
        <div style={mainArea}>
          <TopBar onMenu={function(){setSidebar(true);}}/>
          {screen}
        </div>
        <TabBar tab={tab} setTab={setTab}/>
        {renderSidebar()}
      </div>
    );
  }

  return renderContent();
}
