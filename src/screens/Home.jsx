import { useState, useEffect } from "react";
import { G, R, DISCLAIMER } from "../utils/helpers";
import { SECTORS } from "../data/stocks";
import IndexCard from "../components/IndexCard";
import StockRow from "../components/StockRow";

// Default fallback data
var DEFAULT_INDICES = {
  nifty:     { ltp: 22467.90, pct: 1.35, up: true },
  sensex:    { ltp: 73863.45, pct: 1.28, up: true },
  bankNifty: { ltp: 48234.60, pct: 0.86, up: true },
  midcap:    { ltp: 43876.20, pct: 0.74, up: true },
};

var DEFAULT_STOCKS = [
  {sym:"RELIANCE", name:"Reliance",   ltp:2845.60, chgPct:1.71,  up:true,  sect:"Energy"},
  {sym:"TCS",      name:"TCS",        ltp:3654.20, chgPct:-0.97, up:false, sect:"IT"},
  {sym:"HDFCBANK", name:"HDFC Bank",  ltp:1742.50, chgPct:1.90,  up:true,  sect:"Bank"},
  {sym:"ICICIBANK",name:"ICICI Bank", ltp:1289.30, chgPct:2.33,  up:true,  sect:"Bank"},
  {sym:"INFY",     name:"Infosys",    ltp:1567.80, chgPct:-1.40, up:false, sect:"IT"},
  {sym:"WIPRO",    name:"Wipro",      ltp:478.90,  chgPct:2.99,  up:true,  sect:"IT"},
  {sym:"SBIN",     name:"SBI",        ltp:812.30,  chgPct:2.18,  up:true,  sect:"Bank"},
  {sym:"AXISBANK", name:"Axis Bank",  ltp:1156.70, chgPct:1.47,  up:true,  sect:"Bank"},
];

function isMktOpen() {
  var now = new Date();
  var day = now.getDay();
  if (day == 0 || day == 6) return false;
  var mins = now.getHours() * 60 + now.getMinutes();
  return mins >= 555 && mins < 930;
}

function parseNSEIndex(data, name) {
  try {
    var arr = data.data || data.allData || [];
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      var iname = (item.indexSymbol || item.index || "").toLowerCase();
      if (iname.indexOf(name.toLowerCase()) != -1) {
        var ltp = parseFloat(item.last || item.lastPrice || 0);
        var chg = parseFloat(item.percChange || item.pChange || 0);
        return { ltp: ltp, pct: Math.abs(chg), up: chg >= 0 };
      }
    }
  } catch(e) {}
  return null;
}

export default function HomeScreen(props) {
  var nifty = props.nifty || DEFAULT_INDICES.nifty;
  var sensex = props.sensex || DEFAULT_INDICES.sensex;
  var bankNifty = props.bankNifty || DEFAULT_INDICES.bankNifty;
  var midcap = props.midcap || DEFAULT_INDICES.midcap;
  var setTab = props.setTab;
  var user = props.user;
  var glTab = props.glTab;
  var setGlTab = props.setGlTab;
  var briefing = props.briefing;
  var briefingLoading = props.briefingLoading;

  var [liveNifty, setLiveNifty] = useState(nifty);
  var [liveSensex, setLiveSensex] = useState(sensex);
  var [liveBankNifty, setLiveBankNifty] = useState(bankNifty);
  var [liveMidcap, setLiveMidcap] = useState(midcap);
  var [liveStocks, setLiveStocks] = useState(DEFAULT_STOCKS);
  var [lastUpdated, setLastUpdated] = useState("");
  var [isLive, setIsLive] = useState(false);
  var [loading, setLoading] = useState(false);

  function fetchLiveData() {
    if (loading) return;
    setLoading(true);
    fetch("/api/nse?path=allIndices")
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var n = parseNSEIndex(data, "nifty 50");
        var s = parseNSEIndex(data, "sensex");
        var bn = parseNSEIndex(data, "nifty bank");
        var mc = parseNSEIndex(data, "nifty midcap");
        if (n && n.ltp > 0) { setLiveNifty(n); setIsLive(true); }
        if (s && s.ltp > 0) setLiveSensex(s);
        if (bn && bn.ltp > 0) setLiveBankNifty(bn);
        if (mc && mc.ltp > 0) setLiveMidcap(mc);
        var now = new Date();
        setLastUpdated(now.toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit"}));
        setLoading(false);
      })
      .catch(function() {
        setLoading(false);
        setIsLive(false);
      });
  }

  function fetchTopStocks() {
    fetch("/api/nse?path=equity-stockIndices&index=NIFTY%2050")
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var arr = (data.data || []).slice(1, 13);
        if (arr.length > 0) {
          var mapped = arr.map(function(s) {
            var chg = parseFloat(s.pChange || 0);
            return {
              sym: s.symbol || "",
              name: s.symbol || "",
              ltp: parseFloat(s.lastPrice || 0),
              chgPct: Math.abs(chg),
              up: chg >= 0,
              sect: "NSE",
              vol: s.totalTradedVolume || "0"
            };
          }).filter(function(s) { return s.ltp > 0; });
          if (mapped.length > 0) setLiveStocks(mapped);
        }
      })
      .catch(function() {});
  }

  useEffect(function() {
    // Fetch on load
    fetchLiveData();
    fetchTopStocks();

    // Auto refresh every 15 seconds if market open
    var t = setInterval(function() {
      if (isMktOpen()) {
        fetchLiveData();
        fetchTopStocks();
      }
    }, 15000);

    return function() { clearInterval(t); };
  }, []);

  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  var uname = user ? user.name.split(" ")[0] : "Trader";

  var indices = [
    { label: "NIFTY 50",   ltp: liveNifty.ltp,     pct: liveNifty.pct,     up: liveNifty.up },
    { label: "SENSEX",     ltp: liveSensex.ltp,     pct: liveSensex.pct,    up: liveSensex.up },
    { label: "BANK NIFTY", ltp: liveBankNifty.ltp,  pct: liveBankNifty.pct, up: liveBankNifty.up },
    { label: "MIDCAP",     ltp: liveMidcap.ltp,     pct: liveMidcap.pct,    up: liveMidcap.up },
  ];

  var quick = [
    {label:"OI Chain",  tab:"oi"},      {label:"Scanner",   tab:"scanner"},
    {label:"Scalper",   tab:"scalper"},  {label:"Chart",     tab:"chart"},
    {label:"Analysis",  tab:"analysis"}, {label:"AI Chat",   tab:"ai"},
    {label:"Learn",     tab:"learn"},    {label:"News",      tab:"news"},
  ];

  var sorted = liveStocks.slice().sort(function(a, b) {
    return glTab == "gainers" ? b.chgPct - a.chgPct : a.chgPct - b.chgPct;
  }).slice(0, 5);

  return (
    <div style={{background:"#F8F9FA", minHeight:"100%", paddingBottom:80}}>

      {/* Greeting */}
      <div style={{background:"#fff", padding:"12px 16px", borderBottom:"1px solid #F0F0F0", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#00C853,#00A040)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#fff"}}>{uname[0].toUpperCase()}</div>
          <div>
            <div style={{fontSize:9, color:"#9CA3AF"}}>{greeting}</div>
            <div style={{fontSize:16, color:"#111827", fontWeight:800}}>{uname}</div>
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:6}}>
          {isLive ? (
            <div style={{display:"flex", alignItems:"center", gap:4, background:"#DCFCE7", borderRadius:20, padding:"3px 8px"}}>
              <div style={{width:6, height:6, borderRadius:"50%", background:G}}></div>
              <span style={{fontSize:7, fontWeight:700, color:"#166534"}}>LIVE {lastUpdated}</span>
            </div>
          ) : (
            <button onClick={fetchLiveData} style={{background:"#F3F4F6", border:"none", borderRadius:20, padding:"3px 8px", fontSize:7, color:"#6B7280", cursor:"pointer", fontFamily:"inherit"}}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          )}
          <button style={{background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:14}} onClick={function(){ setTab("news"); }}>&#128276;</button>
        </div>
      </div>

      <div style={{padding:"14px 14px 0"}}>

        {/* AI Briefing */}
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)", border:"1px solid #BBF7D0", borderRadius:16, padding:16, marginBottom:14}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <div style={{width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#00C853,#00A040)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:900}}>AI</div>
              <div>
                <div style={{fontSize:12, fontWeight:700, color:"#111827"}}>AI Market Briefing</div>
                <div style={{fontSize:8, color:"#6B7280"}}>{new Date().toLocaleDateString("en-IN", {weekday:"long", day:"numeric", month:"short"})}</div>
              </div>
            </div>
            <button onClick={props.onBriefing} style={{background:briefing?"transparent":G, border:briefing?"1px solid #BBF7D0":"none", borderRadius:20, padding:"6px 14px", color:briefing?"#166534":"#fff", fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit"}}>
              {briefingLoading ? "Loading..." : briefing ? "Refresh" : "Get Briefing"}
            </button>
          </div>
          {briefingLoading ? (
            <div style={{padding:"8px 0", textAlign:"center", fontSize:10, color:"#374151"}}>AI analyzing markets...</div>
          ) : briefing ? (
            <div style={{background:"rgba(255,255,255,0.8)", borderRadius:10, padding:10, fontSize:10, color:"#374151", lineHeight:1.7}}>{briefing}</div>
          ) : (
            <div style={{background:"rgba(255,255,255,0.7)", borderRadius:12, padding:12, textAlign:"center"}}>
              <div style={{fontSize:11, color:"#374151", fontWeight:600}}>Your Daily Market Briefing</div>
              <div style={{fontSize:9, color:"#6B7280", marginTop:3}}>Tap Get Briefing for AI analysis</div>
            </div>
          )}
        </div>

        {/* Index Cards */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14}}>
          {indices.map(function(d) {
            return <IndexCard key={d.label} d={d} onClick={function(){ setTab("markets"); }}/>;
          })}
        </div>

        {/* Quick Access */}
        <div style={{marginBottom:14}}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8}}>
            {quick.map(function(q) {
              return (
                <button key={q.label} style={{background:"#fff", border:"1px solid #F0F0F0", borderRadius:12, padding:"10px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}} onClick={function(){ setTab(q.tab); }}>
                  <span style={{fontSize:8, color:"#374151", fontWeight:600, textAlign:"center"}}>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gainers / Losers */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
            <div style={{display:"flex", background:"#F3F4F6", borderRadius:20, padding:3}}>
              {["gainers","losers"].map(function(t) {
                var act = glTab == t;
                return <button key={t} style={{background:act?"#fff":"transparent", border:"none", borderRadius:17, padding:"5px 12px", color:act?"#111827":"#6B7280", fontSize:9, fontWeight:act?700:500, cursor:"pointer", fontFamily:"inherit", boxShadow:act?"0 1px 4px rgba(0,0,0,0.08)":"none"}} onClick={function(){ setGlTab(t); }}>{t=="gainers"?"Gainers":"Losers"}</button>;
              })}
            </div>
            <button style={{background:"none", border:"none", color:G, fontSize:9, fontWeight:600, cursor:"pointer", fontFamily:"inherit"}} onClick={function(){ setTab("markets"); }}>View All</button>
          </div>
          <div style={{background:"#fff", borderRadius:12, border:"1px solid #F0F0F0", overflow:"hidden"}}>
            {sorted.map(function(s) {
              return <StockRow key={s.sym} s={s} onClick={function(){ setTab("markets"); }}/>;
            })}
          </div>
        </div>

        {/* Sectors */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:700, color:"#111827", marginBottom:8}}>Sector Performance</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6}}>
            {SECTORS.map(function(s) {
              var up = s.chg >= 0;
              return (
                <div key={s.name} style={{background:up?"#F0FDF4":"#FFF1F2", border:"1px solid "+(up?"#BBF7D0":"#FECDD3"), borderRadius:10, padding:"8px", textAlign:"center"}}>
                  <div style={{fontSize:9, fontWeight:600, color:"#374151"}}>{s.name}</div>
                  <div style={{fontSize:10, fontWeight:700, color:up?G:R, marginTop:2}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding:"9px 12px", marginBottom:6}}>
          <div style={{fontSize:7.5, color:"#92400E"}}>! {DISCLAIMER}</div>
        </div>

      </div>
    </div>
  );
      }
