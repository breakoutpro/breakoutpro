import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";

// BreakoutPro - HomeHub.jsx
// The Home page body for every layout: a calm hero (brand + tagline) and six
// feature cards. Each card is a real button that opens its existing screen.
// Home shows NO market value, signal or status of its own: prices live in the
// ticker (with its own freshness handling) and every analysis, level and
// warning lives on the feature's detail page, so nothing here can be stale
// or invented.
//   cols  2 (mobile) or 3 (tablet / desktop)
//   size  "sm" (mobile) or "lg"
// Colours: navy text, one blue accent; no green or red on Home cards.
// Rules: no backtick, no triple-equals, ASCII only.

// Card list: id, title key, destination tab (all exist in App.jsx), icon name.
export var HOME_CARDS = [
  { id:"nextmove", key:"home.mood_title", tab:"marketmood", icon:"target" },
  { id:"range", key:"home.range_title", tab:"rangeintel", icon:"bars" },
  { id:"breakouts", key:"home.live_breakouts", tab:"breakoutscan", icon:"bolt" },
  { id:"alerts", key:"home.hub_alerts", tab:"alerts", icon:"bell" },
  { id:"scan", key:"home.qa.scan", tab:"scanner", icon:"trend" },
  { id:"learn", key:"home.qa.learn", tab:"learn", icon:"book" }
];

function Icon(props){
  var s = props.size, c = props.color;
  var p = { width:s, height:s, viewBox:"0 0 32 32", fill:"none", stroke:c, strokeWidth:2, strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true", focusable:"false", style:{flexShrink:0} };
  var n = props.name;
  if(n=="target") return (<svg {...p}><circle cx="15" cy="17" r="11"/><circle cx="15" cy="17" r="6.5"/><circle cx="15" cy="17" r="2"/><path d="M16.5 15.5L27 5M22 5h5v5"/></svg>);
  if(n=="bars") return (<svg {...p}><rect x="4" y="17" width="6" height="11" rx="1.5"/><rect x="13" y="10" width="6" height="18" rx="1.5"/><rect x="22" y="3" width="6" height="25" rx="1.5"/></svg>);
  if(n=="bolt") return (<svg {...p}><path d="M18 3L6 18h9l-2 11 13-16h-9z"/></svg>);
  if(n=="bell") return (<svg {...p}><path d="M25 12a9 9 0 0 0-18 0c0 9-4 11-4 11h26s-4-2-4-11"/><path d="M13.5 28a3 3 0 0 0 5 0"/></svg>);
  if(n=="trend") return (<svg {...p}><path d="M3 24l9-9 6 5 11-12"/><path d="M21 8h8v8"/></svg>);
  return (<svg {...p}><path d="M16 8c-3-2.5-8-3-12-2v19c4-1 9-.5 12 2 3-2.5 8-3 12-2V6c-4-1-9-.5-12 2z"/><path d="M16 8v19"/></svg>);
}

function Chevron(props){
  return (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={props.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{flexShrink:0}}><path d="M5.5 2.5L11 8l-5.5 5.5"/></svg>);
}

// Decorative sky-blue wave behind the hero. Hidden from assistive tech.
function Wave(props){
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
  var cols = props.cols || 3;
  var big = props.size!="sm";
  var go = props.setTab || function(){};
  var bg = light
    ? "linear-gradient(180deg, #CFE4FA 0%, #E3F0FD 38%, " + c.bg + " 100%)"
    : "linear-gradient(180deg, #112445 0%, " + c.bg + " 62%)";
  var cardBg = light ? "rgba(255,255,255,0.88)" : c.card;
  var cardBd = light ? "1px solid rgba(255,255,255,0.9)" : "1px solid " + c.border;
  var shadow = light ? "0 6px 18px rgba(37,99,235,0.10), 0 1px 3px rgba(15,23,42,0.06)" : "0 4px 14px rgba(0,0,0,0.25)";
  return (
    <div data-testid="home-hub" style={{position:"relative",width:"100%",boxSizing:"border-box",background:bg,overflow:"hidden",paddingBottom:big ? 36 : 20,minHeight:big ? "64vh" : undefined}}>
      <Wave light={light} h={big ? 420 : 240}/>
      <div style={{position:"relative",maxWidth:big ? 1120 : 560,margin:"0 auto",padding:big ? "56px 24px 0" : "26px 14px 0",boxSizing:"border-box"}}>
        <div style={{textAlign:"center",marginBottom:big ? 44 : 22}}>
          <h1 data-testid="home-hub-title" style={{margin:0,fontSize:big ? 60 : 34,fontWeight:900,letterSpacing:-1,lineHeight:1.1,color:c.text1}}>Breakout <span style={{color:c.blue}}>Pro</span></h1>
          <p data-testid="home-hub-tagline" style={{margin:big ? "10px 0 0" : "8px 0 0",fontSize:big ? 22 : 14,fontWeight:500,color:c.text2,lineHeight:1.35,overflowWrap:"anywhere"}}>{t("home.tagline")}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(" + cols + ", minmax(0, 1fr))",gap:big ? 18 : 10}}>
          {HOME_CARDS.map(function(cd){
            return (
              <button key={cd.id} type="button" data-testid={"home-card-" + cd.id} data-tab={cd.tab} onClick={function(){ go(cd.tab); }}
                style={{display:"flex",alignItems:"center",gap:big ? 16 : 9,textAlign:"left",width:"100%",boxSizing:"border-box",minHeight:big ? 104 : 72,padding:big ? "16px 22px" : "10px 11px",background:cardBg,border:cardBd,borderRadius:big ? 18 : 14,boxShadow:shadow,cursor:"pointer",color:c.text1,fontFamily:"inherit",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
                <Icon name={cd.icon} size={big ? 42 : 26} color={c.blue}/>
                <span style={{flex:"1 1 0",minWidth:0,fontSize:big ? 21 : 13,fontWeight:700,lineHeight:1.25,overflowWrap:"anywhere"}}>{t(cd.key)}</span>
                <Chevron color={c.blue}/>
              </button>
            );
          })}
        </div>
        <div style={{marginTop:big ? 30 : 18,textAlign:"center",fontSize:10,lineHeight:1.4,color:c.text3}}>{t("c.edu_footer")}</div>
      </div>
    </div>
  );
}
