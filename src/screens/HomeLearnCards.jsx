import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - HomeLearnCards.jsx
// Small premium "Learn & Invest" horizontal scroll cards for Home.
// Pure black, white text, blue icons only. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var BLUE="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var LEARN_CARDS=[
  {id:"opt-buy",   ic:"&#128200;", title:"Options Buying"},
  {id:"opt-sell",  ic:"&#128201;", title:"Options Selling"},
  {id:"gamma",     ic:"&#9889;",   title:"Gamma Blast"},
  {id:"greeks",    ic:"&#931;",    title:"Option Greeks"},
  {id:"chain",     ic:"&#128279;", title:"Option Chain Guide"},
  {id:"candle",    ic:"&#128197;", title:"Candlestick Patterns"},
  {id:"chart",     ic:"&#128202;", title:"Chart Patterns"},
  {id:"intraday",  ic:"&#9201;",   title:"Intraday Basics"},
  {id:"swing",     ic:"&#128257;", title:"Swing Trading"},
  {id:"delivery",  ic:"&#127974;", title:"Delivery Investing"},
  {id:"sip",       ic:"&#128181;", title:"SIP Guide"},
  {id:"mf",        ic:"&#128188;", title:"Mutual Funds"},
  {id:"risk",      ic:"&#128737;", title:"Risk Management"},
  {id:"psych",     ic:"&#129504;", title:"Trading Psychology"},
  {id:"portfolio", ic:"&#128202;", title:"Portfolio Management"},
  {id:"fvo",       ic:"&#9878;",   title:"Futures vs Options"}
];

export default function HomeLearnCards(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; BLUE=theme.c.blue;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, CARD2 = theme.c.card2; T1=theme.c.text1;

  var setTab=props.setTab||function(){};
  var onTopic=props.onTopic||function(){};
  return (
    <div style={{padding:"6px 0 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px 9px"}}>
        <span style={{fontSize:14,fontWeight:800,color:T1}}>Learn &amp; Invest</span>
        <button onClick={function(){setTab("learn");}} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 14px 4px",WebkitOverflowScrolling:"touch"}}>
        {LEARN_CARDS.map(function(c){
          return (
            <div key={c.id} onClick={function(){onTopic(c.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",minWidth:104,flexShrink:0,cursor:"pointer"}}>
              <div style={{width:30,height:30,borderRadius:16,background:CARD2,border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
                <span style={{fontSize:14,color:BLUE}} dangerouslySetInnerHTML={{__html:c.ic}}/>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:T1,lineHeight:1.25}}>{c.title}</div>
              <div style={{fontSize:12,color:BLUE,fontWeight:600,marginTop:4}}>Learn &#8594;</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
