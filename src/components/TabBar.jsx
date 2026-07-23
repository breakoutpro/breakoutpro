import { useTheme } from "../theme/ThemeProvider";

var TABS=[
  {id:"home",    label:"Home",    icon:"&#127968;"},
  {id:"markets", label:"Markets", icon:"&#128200;"},
  {id:"scan",    label:"Scan",    icon:"&#128269;"},
  {id:"learn",   label:"Learn",   icon:"&#128218;"},
  {id:"more",    label:"More",    icon:"&#8942;"},
];

var T2="#A0A7B4";

export default function TabBar(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks
  // above so this bar actually switches with the selected theme.
  var BLUE=theme.c.blue, T2 = theme.c.text2, T1 = theme.c.text1;
  var BG = theme.c.bg, BD = theme.c.border;
  var tab=props.tab||"home";
  var setTab=props.setTab||function(){};
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:BG,borderTop:"1px solid "+BD,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {TABS.map(function(t){
        var act=tab==t.id;
        return (
          <button key={t.id} onClick={function(){setTab(t.id);}} style={{flex:1,background:"none",border:"none",padding:"12px 4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
            <span style={{fontSize:18,color:act?BLUE:T1}} dangerouslySetInnerHTML={{__html:t.icon}}/>
            <span style={{fontSize:12,fontWeight:act?700:400,color:act?BLUE:T2}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
