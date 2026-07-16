import { t } from "../i18n/translations";
// BreakoutPro - HomeQuickTools.jsx
// Quick Tools row. Pure black glass, blue icons. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",BD="#1B2330";
var CYAN="#60A5FA",T1="#FFFFFF",T2="#A0A7B4";

var TOOLS=[
  {ic:"&#128640;",name:"Breakout Scanner",tab:"scan"},
  {ic:"&#128202;",name:"Option Chain",   tab:"oichain"},
  {ic:"&#128207;",name:"Position Size",   tab:"tools"},
  {ic:"&#9878;",  name:"Risk Reward",     tab:"tools"},
  {ic:"&#128197;",name:"IPO Calendar",    tab:"ipo"}
];

export default function HomeQuickTools(props){
  var setTab=props.setTab||function(){};
  return (
    <div style={{padding:"0 14px",marginTop:22,marginBottom:8}}>
      <div style={{fontSize:15,fontWeight:900,color:T1,marginBottom:12}}>{t("quick_tools")}</div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
        {TOOLS.map(function(t){
          return (
            <button key={t.name} onClick={function(){setTab(t.tab);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"13px 10px",cursor:"pointer",flexShrink:0,minWidth:84,textAlign:"center",fontFamily:"inherit"}}>
              <div style={{fontSize:19,marginBottom:6}} dangerouslySetInnerHTML={{__html:t.ic}}/>
              <div style={{fontSize:9,fontWeight:600,color:T2,lineHeight:1.2}}>{t.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
