import { useState, useEffect, useRef, lazy, Suspense } from "react";

// -- data --

var STOCKS = [
  {sym:"RELIANCE",name:"Reliance Industries",ltp:2845.60,chgPct:1.71,up:true,sect:"Energy",vol:"12.4M"},
  {sym:"TCS",name:"Tata Consultancy",ltp:3654.20,chgPct:-0.97,up:false,sect:"IT",vol:"3.2M"},
  {sym:"HDFCBANK",name:"HDFC Bank",ltp:1742.50,chgPct:1.90,up:true,sect:"Bank",vol:"8.7M"},
  {sym:"ICICIBANK",name:"ICICI Bank",ltp:1289.30,chgPct:2.33,up:true,sect:"Bank",vol:"7.1M"},
  {sym:"INFY",name:"Infosys",ltp:1567.80,chgPct:-1.40,up:false,sect:"IT",vol:"5.4M"},
  {sym:"WIPRO",name:"Wipro",ltp:478.90,chgPct:2.99,up:true,sect:"IT",vol:"9.2M"},
  {sym:"TATAMOTORS",name:"Tata Motors",ltp:945.60,chgPct:2.23,up:true,sect:"Auto",vol:"11.3M"},
  {sym:"MARUTI",name:"Maruti Suzuki",ltp:13240,chgPct:1.07,up:true,sect:"Auto",vol:"1.2M"},
  {sym:"SUNPHARMA",name:"Sun Pharma",ltp:1678.40,chgPct:-0.98,up:false,sect:"Pharma",vol:"4.5M"},
  {sym:"BAJFINANCE",name:"Bajaj Finance",ltp:7234.50,chgPct:1.90,up:true,sect:"NBFC",vol:"2.8M"},
  {sym:"SBIN",name:"State Bank of India",ltp:812.30,chgPct:2.18,up:true,sect:"Bank",vol:"15.2M"},
  {sym:"AXISBANK",name:"Axis Bank",ltp:1156.70,chgPct:1.47,up:true,sect:"Bank",vol:"6.3M"},
];
var SECTORS = [
  {name:"IT",chg:1.82},{name:"Bank",chg:1.24},{name:"Auto",chg:0.94},
  {name:"Pharma",chg:-0.32},{name:"Energy",chg:1.35},{name:"Metal",chg:3.24},
  {name:"FMCG",chg:0.18},{name:"Realty",chg:2.10},{name:"Infra",chg:0.76},
];

var NEWS = [
  {title:"RBI holds rates steady at 6.5%, signals neutral stance",time:"2h ago",cat:"Policy",up:true},
  {title:"NIFTY crosses 22,500 on strong FII inflows of Rs 4,200 Cr",time:"3h ago",cat:"Markets",up:true},
  {title:"Q4 results: IT sector beats estimates by 8%",time:"4h ago",cat:"Results",up:true},
  {title:"Crude oil rises 2.3% on OPEC supply cut",time:"5h ago",cat:"Global",up:false},
  {title:"SEBI proposes new margin rules effective July",time:"6h ago",cat:"SEBI",up:false},
];

var GLOBAL_MKT = [
  {name:"Dow Jones",val:38654.42,chg:0.82,up:true},
  {name:"Nasdaq",val:16234.10,chg:1.24,up:true},
  {name:"S and P 500",val:5123.67,chg:0.94,up:true},
  {name:"Nikkei 225",val:38156.97,chg:-0.34,up:false},
  {name:"Hang Seng",val:17823.45,chg:-0.87,up:false},
  {name:"SGX Nifty",val:22510,chg:0.19,up:true},
  {name:"Crude Oil",val:82.34,chg:1.23,up:true},
  {name:"Gold",val:2312.50,chg:0.45,up:true},
  {name:"Silver",val:27.84,chg:-0.32,up:false},
  {name:"DXY",val:104.23,chg:-0.18,up:false},
];
var AI_KB = {
  "what is nifty":"NIFTY 50 is an index of 50 large-cap stocks on NSE. Represents 65% of total market cap.",
  "what is oi":"Open Interest = total outstanding contracts. Rising OI + rising price = Long Buildup (bullish).",
  "what is pcr":"Put-Call Ratio = Put OI / Call OI. PCR below 0.7 = Bullish. PCR above 1.3 = Bearish.",
  "what is vwap":"VWAP = Volume Weighted Average Price. Price above VWAP = bullish intraday bias.",
  "what is rsi":"RSI (0-100). Above 70 = Overbought. Below 30 = Oversold.",
  "what is macd":"MACD signal line crossover = trend change. Histogram = momentum.",
  "what is max pain":"Strike where options buyers lose maximum at expiry.",
  "what is delta":"Delta = option price change per Re 1 move. Call 0 to 1. Put 0 to -1.",
  "what is theta":"Theta = time decay. Options lose value daily.",
  "explain breakout":"Price breaking above resistance with high volume. Confirm with 1.5x average volume.",
  "what is support":"Support = price level where buyers prevent further fall.",
};
var CANDLE_PATTERNS = [
  {name:"Bullish Engulfing",type:"Bullish",desc:"Large green candle engulfs previous red candle. Strong reversal at support."},
  {name:"Bearish Engulfing",type:"Bearish",desc:"Large red candle engulfs previous green. Strong reversal at resistance."},
  {name:"Doji",type:"Neutral",desc:"Open and close nearly equal. Shows indecision at key levels."},
  {name:"Hammer",type:"Bullish",desc:"Small body, long lower wick at bottom of downtrend."},
  {name:"Shooting Star",type:"Bearish",desc:"Small body, long upper wick at top of uptrend."},
  {name:"Morning Star",type:"Bullish",desc:"3-candle: red, doji, green. Strong reversal at support."},
];
var SUB_PLANS = [
  {id:"monthly",name:"Monthly",price:299,tag:"Most Popular",color:"#00C853",
   features:["Unlimited AI Chat","All Breakout Alerts","AI Market Briefing","Advanced OI","Premium Education","No Ads"]},
  {id:"quarterly",name:"Quarterly",price:799,tag:"Save 11%",color:"#8B5CF6",
   features:["Everything in Monthly","Priority Support","Strategy Builder Pro"]},
  {id:"yearly",name:"Yearly",price:1999,tag:"Best Value 44% off",color:"#3B82F6",
   features:["Everything in Quarterly","Voice AI","Portfolio Analytics","Lifetime Price Lock"]},
];
var LESSONS = [
  "Support becomes resistance once broken. Watch for retests.",
  "Never risk more than 1-2% of capital on a single trade.",
  "Volume confirms price moves. Breakout without volume = false breakout.",
  "VWAP is the most important intraday level. Price above VWAP = bullish.",
  "Theta works against option buyers every single day.",
  "High PCR above 1.3 = oversold. Low PCR below 0.7 = overbought.",
  "Trade in the direction of the larger timeframe trend.",
];

// -- utils --

var G = "#00C853";
var R = "#EF4444";
var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
var DISCLAIMER = "Educational only. Not SEBI registered. Not investment advice.";

function nowT() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function fN(n) {
  var num = parseFloat(n) || 0;
  if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(2) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(2);
}
function rnd(a, b) { return Math.random() * (b - a) + a; }
function sg() { return Math.random() > 0.5 ? 1 : -1; }
function getMkt() {
  var m = new Date().getHours() * 60 + new Date().getMinutes();
  if (m >= 555 && m < 930) return { open: true, label: "Market Open" };
  return { open: false, label: "Market Closed" };
}
function getSpark(ltp) {
  var a = [];
  for (var i = 0; i < 14; i++) a.push(ltp + sg() * rnd(0, ltp * 0.005) * i);
  return a;
}
function localAI(q, AI_KB, CANDLES) {
  var ql = q.toLowerCase();
  var keys = Object.keys(AI_KB);
  for (var i = 0; i < keys.length; i++) {
    if (ql.indexOf(keys[i]) != -1) return AI_KB[keys[i]] + " --- Educational only | Not SEBI registered";
  }
  for (var j = 0; j < CANDLES.length; j++) {
    if (ql.indexOf(CANDLES[j].name.toLowerCase()) != -1)
      return CANDLES[j].name + " (" + CANDLES[j].type + "): " + CANDLES[j].desc;
  }
  return null;
}

// -- components --

function Spark({ data, color, w = 60, h = 28 }) {
  var d = data || [];
  if (!d.length) return null;
  var min = Math.min.apply(null, d);
  var max = Math.max.apply(null, d);
  var range = max - min || 1;
  var pts = d.map(function(v, i) {
    return (i / (d.length - 1)) * w + "," + (h - ((v - min) / range) * h);
  }).join(" ");
  return React.createElement("svg", { width: w, height: h, style: { display: "block" } },
    React.createElement("polyline", { points: pts, fill: "none", stroke: color || G, strokeWidth: "1.5", strokeLinecap: "round" })
  );
}

function IndexCard({ d, onClick }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: "12px 14px", cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }} onClick={onClick}>
      <div style={{ fontSize: 8, color: "#6B7280", fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
      <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 3 }}>
        {d.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: 9, color: d.up ? G : R }}>{d.up ? "^" : "v"}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: d.up ? G : R }}>{d.up ? "+" : ""}{d.pct.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function StockRow({ s, onClick }) {
  var spark = getSpark(s.ltp);
  var up = s.up;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #F5F5F5", cursor: "pointer" }} onClick={onClick}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{s.sym}</div>
        <div style={{ fontSize: 8, color: "#9CA3AF", marginTop: 2 }}>{s.sect}</div>
      </div>
      <Spark data={spark} color={up ? G : R} w={50} h={22} />
      <div style={{ textAlign: "right", minWidth: 80 }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#111827" }}>Rs{fN(s.ltp)}</div>
        <div style={{ background: up ? "#DCFCE7" : "#FEE2E2", borderRadius: 6, padding: "2px 6px", fontSize: 8, fontWeight: 700, color: up ? "#166534" : "#991B1B" }}>
          {up ? "+" : ""}{s.chgPct.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function TopBar({ isPrem, trialDays, onMenu, onSub }) {
  var mkt = getMkt();
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,200,83,0.3)" }}>
          <span style={{ fontFamily: "Arial", fontSize: 12, fontWeight: 900, color: "#fff" }}>BP</span>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827", letterSpacing: -0.5 }}>Breakout<span style={{ color: G }}> Pro</span></div>
          <div style={{ fontSize: 6, color: "#F97316", fontWeight: 800, letterSpacing: 1.5 }}>CATCH EVERY BREAKOUT</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ background: mkt.open ? "#DCFCE7" : "#F3F4F6", border: "1px solid " + (mkt.open ? "#BBF7D0" : "#E5E7EB"), borderRadius: 20, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: mkt.open ? G : "#9CA3AF" }}></div>
          <span style={{ fontSize: 7, fontWeight: 700, color: mkt.open ? "#166534" : "#6B7280" }}>{mkt.label}</span>
        </div>
        {isPrem
          ? <span style={{ background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A", borderRadius: 20, padding: "3px 8px", fontSize: 8, fontWeight: 700 }}>PRO</span>
          : <button onClick={onSub} style={{ background: "#FFF7ED", color: "#F97316", border: "1px solid #FED7AA", borderRadius: 20, padding: "3px 8px", fontSize: 7, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{trialDays}d Free</button>
        }
        <button onClick={onMenu} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#374151" }}>&#9776;</button>
      </div>
    </div>
  );
}

var TABS = [
  { id: "home", label: "Home" },
  { id: "markets", label: "Markets" },
  { id: "oi", label: "OI" },
  { id: "scanner", label: "Scan" },
  { id: "learn", label: "Learn" },
  { id: "ai", label: "AI" },
  { id: "more", label: "More" },
];

function TabBar({ tab, setTab }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", background: "#fff", borderTop: "1px solid #E5E7EB", display: "flex", zIndex: 100, paddingBottom: 8 }}>
      {TABS.map(function(t) {
        var active = tab == t.id;
        return (
          <button key={t.id} style={{ flex: 1, background: "none", border: "none", padding: "6px 2px", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }} onClick={function() { setTab(t.id); }}>
            <span style={{ fontSize: 7, fontWeight: active ? 700 : 500, color: active ? G : "#9CA3AF" }}>{t.label}</span>
            {active ? <div style={{ width: 3, height: 3, borderRadius: "50%", background: G }}></div> : null}
          </button>
        );
      })}
    </div>
  );
}

// -- screens --

function NewsScreen({ news }) {
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80, padding: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 14 }}>Market News</div>
      {(news || []).map(function(n, i) {
        return (
          <div key={i} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "14px", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ background: n.up ? "#DCFCE7" : "#FEE2E2", display: "inline-block", borderRadius: 6, padding: "2px 8px", fontSize: 8, fontWeight: 700, color: n.up ? "#166534" : "#991B1B", marginBottom: 8 }}>{n.cat}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", lineHeight: 1.5, marginBottom: 6 }}>{n.title}</div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{n.time}</div>
          </div>
        );
      })}
    </div>
  );
}

function LearnScreen() {
  var [sec, setSec] = useState("home");
  var pg = { background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 };

  if (sec == "candles") return (
    <div style={pg}>
      <div style={{ background: "#fff", padding: "12px 14px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={function() { setSec("home"); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#374151" }}>&#8592;</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Candlestick Patterns</div>
      </div>
      <div style={{ padding: 14 }}>
        {CANDLE_PATTERNS.map(function(p) {
          var up = p.type == "Bullish"; var neu = p.type == "Neutral";
          return (
            <div key={p.name} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
              <div style={{ background: up ? "#DCFCE7" : neu ? "#FEF3C7" : "#FEE2E2", color: up ? "#166534" : neu ? "#D97706" : "#991B1B", borderRadius: 6, padding: "2px 8px", fontSize: 8, fontWeight: 700, display: "inline-block", marginBottom: 6 }}>{p.type}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: "#6B7280", lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  var topics = [
    { id: "candles", title: "Candlestick Patterns", sub: "50+ patterns", bg: "#FFF7ED", bd: "#FED7AA" },
    { id: "oi", title: "OI and Options", sub: "PCR, Max Pain, Greeks", bg: "#F0FDF4", bd: "#BBF7D0" },
    { id: "strategy", title: "Trading Strategies", sub: "EMA, VWAP, Breakout", bg: "#EFF6FF", bd: "#BFDBFE" },
    { id: "risk", title: "Risk Management", sub: "Position size, Stop loss", bg: "#FFF1F2", bd: "#FECDD3" },
  ];
  return (
    <div style={pg}>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Learn Trading</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {topics.map(function(t) {
            return <div key={t.id} style={{ background: t.bg, border: "1px solid " + t.bd, borderRadius: 14, padding: "14px", cursor: "pointer" }} onClick={function() { setSec(t.id); }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 3 }}>{t.title}</div>
              <div style={{ fontSize: 8, color: "#6B7280" }}>{t.sub}</div>
            </div>;
          })}
        </div>
        <div style={{ background: "linear-gradient(135deg,#111827,#1F2937)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 10, color: G, fontWeight: 700, marginBottom: 6 }}>Today's Lesson</div>
          <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.7 }}>{LESSONS[new Date().getDay() % LESSONS.length]}</div>
        </div>
      </div>
    </div>
  );
}

function MarketsScreen({ stocks }) {
  var [search, setSearch] = useState("");
  var [sort, setSort] = useState("pct");
  var filtered = (stocks || []).filter(function(s) {
    return !search || s.sym.toLowerCase().indexOf(search.toLowerCase()) != -1;
  }).sort(function(a, b) {
    return sort == "pct" ? b.chgPct - a.chgPct : b.ltp - a.ltp;
  });
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "12px 14px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
          <span>&#128269;</span>
          <input style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 12, color: "#111827", fontFamily: "inherit" }} placeholder="Search stocks..." value={search} onChange={function(e) { setSearch(e.target.value); }} />
          {search ? <button onClick={function() { setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>X</button> : null}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["pct", "ltp"].map(function(s) {
            var act = sort == s;
            return <button key={s} style={{ background: act ? G : "#F3F4F6", border: "none", borderRadius: 20, padding: "4px 12px", color: act ? "#fff" : "#374151", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setSort(s); }}>{s == "pct" ? "% Change" : "Price"}</button>;
          })}
        </div>
      </div>
      <div style={{ background: "#fff", margin: "10px 14px", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
        {filtered.map(function(s) { return <StockRow key={s.sym} s={s} onClick={function() {}} />; })}
      </div>
    </div>
  );
}

function ScannerScreen({ stocks }) {
  var [active, setActive] = useState("breakout");
  var [results, setResults] = useState([]);
  var scans = [
    { id: "breakout", label: "Breakout" }, { id: "breakdown", label: "Breakdown" },
    { id: "volume", label: "Volume" }, { id: "gapup", label: "Gap Up" }, { id: "gapdown", label: "Gap Down" },
  ];
  function runScan(type) {
    setActive(type);
    setResults((stocks || []).filter(function(s) {
      if (type == "breakout") return s.up && s.chgPct > 1.5;
      if (type == "breakdown") return !s.up && s.chgPct < -1.5;
      if (type == "volume") return true;
      if (type == "gapup") return s.up && s.chgPct > 1;
      if (type == "gapdown") return !s.up && s.chgPct < -1;
      return s.up;
    }));
  }
  useEffect(function() { runScan("breakout"); }, []);
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 14px", background: "#fff", borderBottom: "1px solid #F0F0F0" }}>
        {scans.map(function(sc) {
          var act = active == sc.id;
          return <button key={sc.id} style={{ background: act ? G : "#F3F4F6", border: "none", borderRadius: 20, padding: "6px 14px", color: act ? "#fff" : "#374151", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={function() { runScan(sc.id); }}>{sc.label}</button>;
        })}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 8 }}>{results.length} stocks found</div>
        {results.length == 0
          ? <div style={{ textAlign: "center", padding: "30px 0", color: "#9CA3AF", fontSize: 12 }}>No results</div>
          : <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
              {results.map(function(s) { return <StockRow key={s.sym} s={s} onClick={function() {}} />; })}
            </div>
        }
      </div>
    </div>
  );
}

function AIScreen() {
  var [msgs, setMsgs] = useState([]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var endRef = useRef(null);
  var chips = ["Explain OI", "What is PCR", "What is RSI", "Explain VWAP", "What is Doji", "What is Theta"];

  useEffect(function() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send(q) {
    if (!q.trim() || loading) return;
    var nm = msgs.concat([{ role: "user", text: q, time: nowT() }]);
    setMsgs(nm); setInput(""); setLoading(true);
    var loc = localAI(q, AI_KB, CANDLE_PATTERNS);
    if (loc) { setMsgs(nm.concat([{ role: "ai", text: loc, time: nowT() }]).slice(-20)); setLoading(false); return; }
    var KEY = (typeof window != "undefined" && window.GEMINI_KEY) ? window.GEMINI_KEY : "";
    function finish(txt) { setMsgs(nm.concat([{ role: "ai", text: txt, time: nowT() }]).slice(-20)); setLoading(false); }
    fetch(GEMINI_URL + KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Indian stock market education only. Under 150 words. End with: Educational only. Q: " + q }] }], generationConfig: { maxOutputTokens: 300, temperature: 0.5 } })
    })
      .then(function(r) { return r.json(); })
      .then(function(d) { finish(d.candidates && d.candidates[0] && d.candidates[0].content ? d.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("").trim() : "Could not get response. Check API key."); })
      .catch(function() { finish("Connection error. Check internet and API key."); });
  }

  return (
    <div style={{ background: "#0B0B0B", minHeight: "100%", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "11px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Breakout Pro AI</div>
        <div style={{ fontSize: 8, color: loading ? "#F59E0B" : G }}>{loading ? "Thinking..." : "Gemini 2.0 Flash - Ready"}</div>
      </div>
      <div style={{ background: "#0F0A00", borderBottom: "1px solid #2A1E00", padding: "5px 14px" }}>
        <span style={{ fontSize: 7.5, color: "#92694A", fontWeight: 600 }}>! Educational Only | Not SEBI Registered Investment Advice</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {msgs.length == 0
          ? <div style={{ textAlign: "center", paddingTop: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: G, marginBottom: 10 }}>BP AI</div>
              <div style={{ fontSize: 11, color: "#fff", marginBottom: 4 }}>Ask me about stock market education</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
                {chips.map(function(q) { return <button key={q} onClick={function() { send(q); }} style={{ background: "#161616", border: "1px solid #222", borderRadius: 10, padding: "9px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 8, color: "#ccc" }}>{q}</button>; })}
              </div>
            </div>
          : null
        }
        {msgs.map(function(m, i) {
          var isu = m.role == "user";
          return (
            <div key={i} style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: isu ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "88%", background: isu ? "#1E3A5F" : "#161616", border: isu ? "1px solid #1E4080" : "1px solid #222", borderRadius: isu ? "14px 14px 4px 14px" : "4px 14px 14px 14px", padding: "10px 13px" }}>
                <div style={{ fontSize: 11, color: "#e8e8e8", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{m.text}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginTop: 3, textAlign: "right" }}>{m.time}</div>
              </div>
            </div>
          );
        })}
        {loading ? <div style={{ display: "flex", marginBottom: 12 }}><div style={{ background: "#161616", border: "1px solid #222", borderRadius: "4px 14px 14px 14px", padding: "12px 16px" }}><div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(function(i) { return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", opacity: 0.8 }}></div>; })}</div></div></div> : null}
        <div ref={endRef}></div>
      </div>
      <div style={{ borderTop: "1px solid #1A1A1A", padding: "8px 12px 12px", background: "#0F0F0F" }}>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 8, paddingBottom: 2 }}>
          {chips.map(function(q) { return <button key={q} disabled={loading} onClick={function() { send(q); }} style={{ background: "#161616", border: "1px solid #222", borderRadius: 20, padding: "4px 10px", color: loading ? "#333" : "#3B82F6", fontSize: 8, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit", fontWeight: 600 }}>{q}</button>; })}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={function(e) { if (e.key == "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ask about any market concept..." rows={1} disabled={loading} style={{ flex: 1, background: "#161616", border: "1px solid #222", borderRadius: 11, padding: "10px 12px", color: "#fff", fontSize: 11, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 80, overflowY: "auto", opacity: loading ? 0.6 : 1 }} />
          <button onClick={function() { send(input); }} disabled={!input.trim() || loading} style={{ background: (!input.trim() || loading) ? "#1A1A1A" : "linear-gradient(135deg,#3B82F6,#1D4ED8)", border: "none", borderRadius: 11, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: (!input.trim() || loading) ? "not-allowed" : "pointer", fontSize: 14, color: "#fff", flexShrink: 0 }}>&#10148;</button>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ nifty, sensex, bankNifty, midcap, stocks, news, briefing, briefingLoading, onBriefing, user, setTab, glTab, setGlTab }) {
  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  var uname = user ? user.name.split(" ")[0] : "Trader";
  var indices = [
    { label: "NIFTY 50", ltp: nifty.ltp, pct: nifty.pct, up: nifty.up },
    { label: "SENSEX", ltp: sensex.ltp, pct: sensex.pct, up: sensex.up },
    { label: "BANK NIFTY", ltp: bankNifty.ltp, pct: bankNifty.pct, up: bankNifty.up },
    { label: "MIDCAP", ltp: midcap.ltp, pct: midcap.pct, up: midcap.up },
  ];
  var quick = [
    { label: "OI Chain", tab: "oi" }, { label: "Scanner", tab: "scanner" },
    { label: "FII/DII", tab: "fiidii" }, { label: "News", tab: "news" },
    { label: "Learn", tab: "learn" }, { label: "AI Chat", tab: "ai" },
    { label: "Tools", tab: "tools" }, { label: "Watchlist", tab: "watchlist" },
  ];
  var sorted = (stocks || []).slice().sort(function(a, b) {
    return glTab == "gainers" ? b.chgPct - a.chgPct : a.chgPct - b.chgPct;
  }).slice(0, 4);

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "12px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff" }}>{uname[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{greeting}</div>
            <div style={{ fontSize: 16, color: "#111827", fontWeight: 800 }}>{uname}</div>
          </div>
        </div>
        <button style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }} onClick={function() { setTab("news"); }}>&#128276;</button>
      </div>

      <div style={{ padding: "14px 14px 0" }}>
        {/* AI Briefing */}
        <div style={{ background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", border: "1px solid #BBF7D0", borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900 }}>AI</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>AI Market Briefing</div>
                <div style={{ fontSize: 8, color: "#6B7280" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</div>
              </div>
            </div>
            <button onClick={onBriefing} style={{ background: briefing ? "transparent" : G, border: briefing ? "1px solid #BBF7D0" : "none", borderRadius: 20, padding: "6px 14px", color: briefing ? "#166534" : "#fff", fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {briefingLoading ? "Loading..." : briefing ? "Refresh" : "Get Briefing"}
            </button>
          </div>
          {briefingLoading
            ? <div style={{ padding: "12px 0", textAlign: "center", fontSize: 10, color: "#374151" }}>AI analyzing markets...</div>
            : briefing
              ? <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 10, padding: 10, fontSize: 10, color: "#374151", lineHeight: 1.7 }}>{briefing}</div>
              : <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>Your Daily Market Briefing</div>
                  <div style={{ fontSize: 9, color: "#6B7280", marginTop: 3 }}>Tap Get Briefing for AI analysis</div>
                </div>
          }
        </div>

        {/* Index Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {indices.map(function(d) { return <IndexCard key={d.label} d={d} onClick={function() { setTab("markets"); }} />; })}
        </div>

        {/* Quick Access */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {quick.map(function(q) {
              return (
                <button key={q.label} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setTab(q.tab); }}>
                  <span style={{ fontSize: 8, color: "#374151", fontWeight: 600, textAlign: "center" }}>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gainers/Losers */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 20, padding: 3 }}>
              {["gainers", "losers"].map(function(t) {
                var act = glTab == t;
                return <button key={t} style={{ background: act ? "#fff" : "transparent", border: "none", borderRadius: 17, padding: "5px 12px", color: act ? "#111827" : "#6B7280", fontSize: 9, fontWeight: act ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setGlTab(t); }}>{t == "gainers" ? "Gainers" : "Losers"}</button>;
              })}
            </div>
            <button style={{ background: "none", border: "none", color: G, fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setTab("markets"); }}>View All</button>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
            {sorted.map(function(s) { return <StockRow key={s.sym} s={s} onClick={function() { setTab("markets"); }} />; })}
          </div>
        </div>

        {/* Sectors */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Sectors</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {SECTORS.map(function(s) {
              var up = s.chg >= 0;
              return (
                <div key={s.name} style={{ background: up ? "#F0FDF4" : "#FFF1F2", border: "1px solid " + (up ? "#BBF7D0" : "#FECDD3"), borderRadius: 10, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{s.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: up ? G : R, marginTop: 2 }}>{up ? "+" : ""}{s.chg.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* News */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>News</span>
            <button style={{ background: "none", border: "none", color: G, fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={function() { setTab("news"); }}>View All</button>
          </div>
          {(news || []).slice(0, 3).map(function(n, i) {
            return (
              <div key={i} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "11px 13px", marginBottom: 6, display: "flex", gap: 10 }}>
                <div style={{ background: n.up ? "#DCFCE7" : "#F3F4F6", borderRadius: 7, padding: "3px 7px", height: "fit-content", flexShrink: 0 }}>
                  <span style={{ fontSize: 7, fontWeight: 700, color: n.up ? "#166534" : "#6B7280" }}>{n.cat.slice(0, 4)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#111827", lineHeight: 1.4, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 8, color: "#9CA3AF" }}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "9px 12px", marginBottom: 6 }}>
          <div style={{ fontSize: 7.5, color: "#92400E" }}>! {DISCLAIMER}</div>
        </div>
      </div>
    </div>
  );
}

// -- main --

// Lazy load screens for code splitting







function Loader() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: G, fontSize: 13, fontWeight: 700 }}>Loading...</div>;
}

function AuthScreen({ onLogin }) {
  var [mode, setMode] = useState("login");
  var [name, setName] = useState("");
  var [phone, setPhone] = useState("");
  var [pass, setPass] = useState("");
  var [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!phone || phone.length < 10) { setErr("Enter valid 10-digit phone"); return; }
    if (!pass || pass.length < 6) { setErr("Password min 6 chars"); return; }
    if (phone == "8790124010" && pass == "Suresh@2025") {
      onLogin({ name: "Admin", phone: "8790124010", isAdmin: true, isPrem: true, trialStart: Date.now() }); return;
    }
    var users = {}; try { users = JSON.parse(localStorage.getItem("bp_users") || "{}"); } catch (e) {}
    if (mode == "register") {
      if (!name) { setErr("Enter your name"); return; }
      users[phone] = { name, phone, pass };
      try { localStorage.setItem("bp_users", JSON.stringify(users)); } catch (e) {}
      onLogin({ name, phone, trialStart: Date.now() });
    } else {
      if (!users[phone]) {
        users[phone] = { name: "Trader", phone, pass };
        try { localStorage.setItem("bp_users", JSON.stringify(users)); } catch (e) {}
        onLogin({ name: "Trader", phone, trialStart: Date.now() }); return;
      }
      if (users[phone].pass != pass) { setErr("Wrong password"); return; }
      onLogin(users[phone]);
    }
  }

  var inp = { width: "100%", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "11px 13px", color: "#111827", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 10 };
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#fff", padding: "32px 20px 24px", textAlign: "center", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 14px rgba(0,200,83,0.3)" }}>
          <span style={{ fontFamily: "Arial", fontSize: 18, fontWeight: 900, color: "#fff" }}>BP</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>Breakout<span style={{ color: G }}> Pro</span></div>
        <div style={{ fontSize: 8, color: "#F97316", fontWeight: 800, letterSpacing: 2, marginTop: 3 }}>CATCH EVERY BREAKOUT</div>
      </div>
      <div style={{ padding: "24px 20px", flex: 1 }}>
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {["login", "register"].map(function(m) {
            var act = mode == m;
            return <button key={m} onClick={function() { setMode(m); setErr(""); }} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: act ? "#fff" : "transparent", color: act ? "#111827" : "#6B7280", fontWeight: act ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{m == "login" ? "Login" : "Register"}</button>;
          })}
        </div>
        {err ? <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px", marginBottom: 12, fontSize: 11, color: "#DC2626" }}>! {err}</div> : null}
        {mode == "register" ? <input style={inp} placeholder="Full Name" value={name} onChange={function(e) { setName(e.target.value); }} /> : null}
        <input style={inp} placeholder="Phone (10 digits)" type="tel" maxLength={10} value={phone} onChange={function(e) { setPhone(e.target.value); }} />
        <input style={inp} placeholder="Password (min 6 chars)" type="password" value={pass} onChange={function(e) { setPass(e.target.value); }} />
        <button style={{ width: "100%", background: G, border: "none", borderRadius: 12, padding: "14px", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }} onClick={submit}>{mode == "login" ? "Login" : "Create Account"}</button>
        <div style={{ marginTop: 14, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 12px", fontSize: 8, color: "#92400E", textAlign: "center" }}>! {DISCLAIMER}</div>
      </div>
    </div>
  );
}

function MoreScreen({ setTab }) {
  var items = [
    { label: "Global Markets", id: "global" }, { label: "Heatmap", id: "heatmap" },
    { label: "FII/DII", id: "fiidii" }, { label: "Journal", id: "journal" },
    { label: "Challenges", id: "challenges" }, { label: "Premium", id: "sub" },
    { label: "Tools", id: "tools" }, { label: "Compare Stocks", id: "compare" },
  ];
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100%", paddingBottom: 80, padding: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 14 }}>All Features</div>
      {items.map(function(item) {
        return (
          <div key={item.id} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={function() { setTab(item.id); }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{item.label}</div>
            <span style={{ color: "#9CA3AF", fontSize: 14 }}>&#8250;</span>
          </div>
        );
      })}
    </div>
  );
}

export default function StocksBuddy() {
  function getSess() { try { var s = JSON.parse(localStorage.getItem("bp_sess") || "null"); if (s && s.name && s.phone) return s; return null; } catch (e) { return null; } }
  var saved = getSess();
  var [splash, setSplash] = useState(true);
  var [user, setUser] = useState(saved);
  var [tab, setTab] = useState("home");
  var [sidebar, setSidebar] = useState(false);
  var [nifty] = useState({ ltp: 22467.90, pct: 1.35, up: true });
  var [sensex] = useState({ ltp: 73863.45, pct: 1.28, up: true });
  var [bankNifty] = useState({ ltp: 48234.60, pct: 0.86, up: true });
  var [midcap] = useState({ ltp: 43876.20, pct: 0.74, up: true });
  var [briefing, setBriefing] = useState("");
  var [briefingLoading, setBriefingLoading] = useState(false);
  var [glTab, setGlTab] = useState("gainers");
  var [isPrem, setIsPrem] = useState(function() { try { var u = JSON.parse(localStorage.getItem("bp_sess") || "{}"); return u.isPrem || u.isAdmin || false; } catch (e) { return false; } });
  var trialStart = saved && saved.trialStart ? saved.trialStart : Date.now();
  var trialDays = Math.max(0, 7 - Math.floor((Date.now() - trialStart) / (1000 * 60 * 60 * 24)));

  useEffect(function() { var t = setTimeout(function() { setSplash(false); }, 1800); return function() { clearTimeout(t); }; }, []);

  function login(u) { if (!u.trialStart) u.trialStart = Date.now(); setUser(u); setIsPrem(u.isPrem || u.isAdmin || false); try { localStorage.setItem("bp_sess", JSON.stringify(u)); } catch (e) {} }
  function logout() { setUser(null); setIsPrem(false); try { localStorage.removeItem("bp_sess"); } catch (e) {} setSidebar(false); }
  function upgrade(plan) { var nu = Object.assign({}, user, { isPrem: true, plan: plan.id }); setIsPrem(true); setUser(nu); try { localStorage.setItem("bp_sess", JSON.stringify(nu)); } catch (e) {} setTab("home"); }

  function loadBriefing() {
    setBriefingLoading(true);
    var KEY = (typeof window != "undefined" && window.GEMINI_KEY) ? window.GEMINI_KEY : "";
    fetch(GEMINI_URL + KEY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Brief Indian stock market summary 80 words. NIFTY " + nifty.ltp + ". Educational only. End with: Educational only. Not investment advice." }] }], generationConfig: { maxOutputTokens: 200, temperature: 0.7 } }) })
      .then(function(r) { return r.json(); })
      .then(function(d) { setBriefing(d.candidates && d.candidates[0] && d.candidates[0].content ? d.candidates[0].content.parts[0].text : "Market update unavailable. Check API key."); setBriefingLoading(false); })
      .catch(function() { setBriefing("Could not load. Check internet."); setBriefingLoading(false); });
  }

  var navItems = ["home", "markets", "scanner", "oi", "learn", "ai", "tools", "news", "global", "heatmap", "fiidii", "journal", "challenges", "sub", "more"];

  if (splash) return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 24px rgba(0,200,83,0.4)" }}>
          <span style={{ fontFamily: "Arial", fontSize: 22, fontWeight: 900, color: "#fff" }}>BP</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>Breakout<span style={{ color: G }}> Pro</span></div>
        <div style={{ fontSize: 8, color: "#F97316", fontWeight: 800, letterSpacing: 2, marginTop: 4 }}>CATCH EVERY BREAKOUT</div>
        <div style={{ width: 200, height: 3, background: "#1A2A1A", borderRadius: 3, margin: "20px auto 0", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "70%", background: G, borderRadius: 3 }}></div>
        </div>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={login} />;

  var hp = { nifty, sensex, bankNifty, midcap, stocks: STOCKS, news: NEWS, briefing, briefingLoading, onBriefing: loadBriefing, user, setTab, glTab, setGlTab };

  function renderScreen() {
    if(tab == "home") return <HomeScreen nifty={hp.nifty} sensex={hp.sensex} bankNifty={hp.bankNifty} midcap={hp.midcap} stocks={hp.stocks} news={hp.news} briefing={hp.briefing} briefingLoading={hp.briefingLoading} onBriefing={hp.onBriefing} user={hp.user} setTab={hp.setTab} glTab={hp.glTab} setGlTab={hp.setGlTab}/>;
    if(tab == "markets") return <MarketsScreen stocks={STOCKS}/>;
    if(tab == "scanner") return <ScannerScreen stocks={STOCKS}/>;
    if(tab == "learn") return <LearnScreen/>;
    if(tab == "ai") return <AIScreen/>;
    if(tab == "news") return <NewsScreen news={NEWS}/>;
    if(tab == "oi") return <div style={{background:"#0B0B0B",minHeight:"100%",padding:20,color:"#fff",paddingBottom:80}}><div style={{fontSize:14,fontWeight:700,marginBottom:10}}>OI Chain</div><div style={{fontSize:10,color:"#666"}}>NIFTY Options Chain</div></div>;
    if(tab == "tools") return <div style={{background:"#F8F9FA",minHeight:"100%",padding:20,paddingBottom:80}}><div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Tools</div><div style={{fontSize:10,color:"#6B7280",marginTop:4}}>R:R Calculator, Position Size coming soon</div></div>;
    return <MoreScreen setTab={setTab}/>;
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 430, margin: "0 auto", height: "100vh", overflow: "hidden", fontFamily: "Inter,Arial,sans-serif", background: "#F8F9FA" }}>
      <div style={{ height: "100vh", overflowY: "auto" }}>
        <TopBar isPrem={isPrem} trialDays={trialDays} onMenu={function() { setSidebar(true); }} onSub={function() { setTab("sub"); }} />
        {renderScreen()}
      </div>
      <TabBar tab={tab} setTab={setTab} />
      {sidebar && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, display: "flex" }}>
          <div style={{ width: 260, background: "#fff", borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column", boxShadow: "4px 0 24px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid #F0F0F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#00C853,#00A040)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff" }}>{user.name[0].toUpperCase()}</div>
                <div><div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{user.name}</div><div style={{ fontSize: 9, color: "#9CA3AF" }}>{user.phone}</div></div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {navItems.map(function(id) {
                var act = tab == id;
                var label = id.charAt(0).toUpperCase() + id.slice(1);
                return (
                  <button key={id} style={{ width: "100%", background: act ? "#F0FDF4" : "none", border: "none", borderLeft: act ? "3px solid " + G : "3px solid transparent", padding: "11px 16px", display: "flex", alignItems: "center", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }} onClick={function() { setTab(id); setSidebar(false); }}>
                    <span style={{ fontSize: 13, fontWeight: act ? 700 : 500, color: act ? G : "#374151" }}>{label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "16px", borderTop: "1px solid #F0F0F0" }}>
              <div style={{ fontSize: 7, color: "#9CA3AF", marginBottom: 10, lineHeight: 1.6 }}>! {DISCLAIMER}</div>
              <button style={{ width: "100%", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "11px", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={logout}>Logout</button>
            </div>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} onClick={function() { setSidebar(false); }}></div>
        </div>
      )}
    </div>
  );
}