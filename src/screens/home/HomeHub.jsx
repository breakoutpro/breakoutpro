import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import HomeTicker from "./HomeTicker";
import { NewsTicker } from "./HomeStrips";
import HomeSetups from "./HomeSetups";
import HomeAudioBrief from "./HomeAudioBrief";
import { IndexPanel, SentimentPanel, SectorPanel } from "./HomePanels";

// BreakoutPro - HomeHub.jsx
// Intelligence-first Home body for every layout, top to bottom: slim market ticker, JUST IN news ticker,
// hero Today's Breakout Setups, audio brief, eight quick-access buttons, desktop side panels (index, sentiment, sectors) and the educational footer. The position-size
// tool lives in the Tools screen, not here.
//   size  "lg" (tablet / laptop / desktop: terminal layout, setups beside the quick grid) or "sm" (mobile)
//   mm    shared market payload from App / useHomeData
// All numbers come from real feeds (see HomeTicker, HomeStrips, HomeSetups); this file holds layout and links.
// Colours: navy text, one blue accent; red and green only for market meaning.
// Rules: no backtick, no triple-equals, ASCII only.

// Quick-access grid: id, title key, destination tab (all exist in App.jsx), icon name, short description.
export var HOME_CARDS = [
  { id:"breakouts", key:"home.live_breakouts", fb:"Live Breakouts", tab:"breakoutscan", icon:"bolt", sub:"Daily breakout and breakdown scan" },
  { id:"options", key:"home.qa_options", fb:"Options Intelligence", tab:"optionsintelpro", icon:"bars", sub:"Greeks, max pain, payoff; live OI + PCR inside" },
  { id:"scanners", key:"home.qa_scanners", fb:"Advanced Scanners", tab:"chartscanner", icon:"scan", sub:"Candle patterns on verified daily candles" },
  { id:"research", key:"home.qa_research", fb:"Market Research", tab:"stockresearchpro", icon:"doc", sub:"Stock research with honest data availability" },
  { id:"algo", key:"home.qa_algo", fb:"Algo Builder / Backtesting", tab:"strategy", icon:"bot", sub:"Rules and tests only, no broker execution" },
  { id:"news", key:"home.qa_news", fb:"Market News & Sentiment", tab:"news", icon:"news", sub:"Live headlines with source and time" },
  { id:"tools", key:"home.qa_tools", fb:"Tools", tab:"tools", icon:"calc", sub:"Position size, risk and reward" },
  { id:"movers", key:"home.qa_movers", fb:"Top Gainers & Losers", tab:"movers", icon:"trend", sub:"NIFTY 50 large caps" }
];

function Icon(props){
  var s = props.size, c = props.color;
  var p = { width:s, height:s, viewBox:"0 0 32 32", fill:"none", stroke:c, strokeWidth:2, strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true", focusable:"false", style:{flexShrink:0} };
  var n = props.name;
  if(n=="target") return (<svg {...p}><circle cx="15" cy="17" r="11"/><circle cx="15" cy="17" r="6.5"/><circle cx="15" cy="17" r="2"/><path d="M16.5 15.5L27 5M22 5h5v5"/></svg>);
  if(n=="bars") return (<svg {...p}><rect x="4" y="17" width="6" height="11" rx="1.5"/><rect x="13" y="10" width="6" height="18" rx="1.5"/><rect x="22" y="3" width="6" height="25" rx="1.5"/></svg>);
  if(n=="bolt") return (<svg {...p}><path d="M18 3L6 18h9l-2 11 13-16h-9z"/></svg>);
  if(n=="bell") return (<svg {...p}><path d="M25 12a9 9 0 0 0-18 0c0 9-4 11-4 11h26s-4-2-4-11"/><path d="M13.5 28a3 3 0 0 0 5 0"/></svg>);
  if(n=="wave") return (<svg {...p}><path d="M2 17h5l3-10 5 18 3-8h7"/></svg>);
  if(n=="scan") return (<svg {...p}><circle cx="14" cy="14" r="9"/><path d="M21 21l7 7"/></svg>);
  if(n=="doc") return (<svg {...p}><path d="M7 3h13l6 6v20H7z"/><path d="M20 3v6h6M11 15h10M11 20h10M11 25h6"/></svg>);
  if(n=="bot") return (<svg {...p}><rect x="5" y="9" width="22" height="16" rx="4"/><path d="M16 4v5M11 16v2M21 16v2M11 25v3M21 25v3"/></svg>);
  if(n=="news") return (<svg {...p}><rect x="4" y="6" width="24" height="20" rx="3"/><path d="M9 12h14M9 17h14M9 22h8"/></svg>);
  if(n=="calc") return (<svg {...p}><rect x="6" y="3" width="20" height="26" rx="3"/><rect x="10" y="7" width="12" height="6" rx="1"/><path d="M11 18h.01M16 18h.01M21 18h.01M11 24h.01M16 24h.01M21 24h.01"/></svg>);
  if(n=="trend") return (<svg {...p}><path d="M3 24l9-9 6 5 11-12"/><path d="M21 8h8v8"/></svg>);
  return (<svg {...p}><path d="M16 8c-3-2.5-8-3-12-2v19c4-1 9-.5 12 2 3-2.5 8-3 12-2V6c-4-1-9-.5-12 2z"/><path d="M16 8v19"/></svg>);
}

function Chevron(props){
  return (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={props.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{flexShrink:0}}><path d="M5.5 2.5L11 8l-5.5 5.5"/></svg>);
}

// Decorative sky-blue wave behind the hero. Hidden from assistive tech.
export function Wave(props){
  var light = props.light;
  var a1 = light ? "255,255,255" : "77,141,248", a2 = light ? "147,197,253" : "77,141,248";
  var o1 = light ? 0.55 : 0.09, o2 = light ? 0.35 : 0.07;
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{position:"absolute",left:0,right:0,top:0,width:"100%",height:props.h,pointerEvents:"none"}}>
      <defs>
        <linearGradient id="bpWaveA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={"rgb(" + a1 + ")"} stopOpacity={o1}/><stop offset="1" stopColor={"rgb(" + a1 + ")"} stopOpacity="0"/></linearGradient>
        <linearGradient id="bpWaveB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={"rgb(" + a2 + ")"} stopOpacity={o2}/><stop offset="1" stopColor={"rgb(" + a2 + ")"} stopOpacity="0"/></linearGradient>
      </defs>
      <path d="M0 150 C 240 230, 460 250, 700 190 C 940 130, 1160 70, 1440 120 L1440 320 L0 320 Z" fill="url(#bpWaveA)"/>
      <path d="M0 215 C 280 150, 520 140, 780 195 C 1040 250, 1250 230, 1440 170 L1440 320 L0 320 Z" fill="url(#bpWaveB)"/>
    </svg>
  );
}

export default function HomeHub(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var light = c.scheme=="light";
  var big = props.size!="sm";
  var go = props.setTab || function(){};
  var bg = light
    ? "linear-gradient(180deg, #CFE4FA 0%, #E3F0FD 38%, " + c.bg + " 100%)"
    : "linear-gradient(180deg, #112445 0%, " + c.bg + " 62%)";
  var cardBg = light ? "rgba(255,255,255,0.88)" : c.card;
  var cardBd = light ? "1px solid rgba(255,255,255,0.9)" : "1px solid " + c.border;
  var shadow = light ? "0 4px 14px rgba(37,99,235,0.09), 0 1px 3px rgba(15,23,42,0.06)" : "0 4px 14px rgba(0,0,0,0.25)";
  var gap = big ? 12 : 8;
  return (
    <div data-testid="home-hub" style={{position:"relative",width:"100%",boxSizing:"border-box",background:bg,overflow:"hidden",paddingBottom:big ? 24 : 12,minHeight:big ? "64vh" : undefined}}>
      <Wave light={light} h={big ? 420 : 240}/>
      <div style={{position:"relative",maxWidth:big ? 1400 : 520,margin:"0 auto",padding:big ? "16px 16px 0" : "10px 12px 0",boxSizing:"border-box",display:"grid",gridTemplateColumns:"minmax(0, 1fr)",gap:gap}}>
        <h1 data-testid="home-hub-title" style={{position:"absolute",width:1,height:1,margin:-1,padding:0,overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap",border:0}}>Breakout Pro</h1>
        <style>{".bpHomeCols{display:grid;grid-template-columns:minmax(0,1fr);gap:" + gap + "px}@media (min-width:1100px){.bpHomeCols{grid-template-columns:minmax(0,1fr) 330px;align-items:start}}.bpQuick{display:grid;gap:" + gap + "px;grid-template-columns:repeat(4,minmax(0,1fr))}"}</style>
        <HomeTicker big={big} mm={props.mm} setTab={go} onOpenIndex={props.onOpenIndex}/>
        <NewsTicker news={props.liveNews} setTab={go} compact={!big}/>
        <div className="bpHomeCols" data-testid="home-cols">
          <div style={{display:"grid",gridTemplateColumns:"minmax(0, 1fr)",gap:gap,minWidth:0}}>
            <HomeSetups setTab={go} big={big}/>
            <HomeAudioBrief mm={props.mm} liveNews={props.liveNews}/>
            <div className="bpQuick" data-testid="home-quick-grid">
              {HOME_CARDS.map(function(cd){
                var label = t(cd.key, cd.fb);
                return (
                  <button key={cd.id} type="button" data-testid={"home-card-" + cd.id} data-tab={cd.tab} title={cd.sub} onClick={function(){ go(cd.tab); }}
                    style={{display:"flex",flexDirection:big ? "row" : "column",alignItems:"center",justifyContent:big ? "flex-start" : "center",gap:big ? 10 : 4,textAlign:big ? "left" : "center",width:"100%",boxSizing:"border-box",minWidth:0,minHeight:big ? 58 : 76,padding:big ? "8px 12px" : "8px 4px",background:cardBg,border:cardBd,borderRadius:big ? 14 : 12,boxShadow:shadow,cursor:"pointer",color:c.text1,fontFamily:"inherit"}}>
                    <Icon name={cd.icon} size={big ? 24 : 22} color={c.blue}/>
                    <span style={{flex:big ? "1 1 0" : "0 0 auto",minWidth:0,maxWidth:"100%"}}>
                      <span style={{display:"block",fontSize:big ? 12.5 : 10.5,fontWeight:700,lineHeight:1.2,overflowWrap:"anywhere"}}>{label}</span>
                      {big ? <span style={{display:"block",fontSize:10,fontWeight:500,color:c.text3,lineHeight:1.25,marginTop:2}}>{cd.sub}</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {big ? (
            <div data-testid="home-side" style={{display:"grid",gridTemplateColumns:"minmax(0, 1fr)",gap:gap,minWidth:0}}>
              <IndexPanel mm={props.mm} onOpenIndex={props.onOpenIndex}/>
              <SentimentPanel mm={props.mm}/>
              <SectorPanel mm={props.mm}/>
            </div>
          ) : null}
        </div>
        {big ? <div data-testid="home-edu-footer" style={{marginTop:big ? 6 : 2,textAlign:"center",fontSize:10,lineHeight:big ? 1.4 : 1.3,color:c.text3,paddingInline:16,paddingBottom:8,boxSizing:"border-box",overflowWrap:"break-word",whiteSpace:"normal"}}>{t("c.edu_footer")}</div> : null}
      </div>
    </div>
  );
}
