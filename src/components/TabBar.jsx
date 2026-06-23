var TABS=[
  {id:"home",    label:"Home",    icon:"&#127968;"},
  {id:"markets", label:"Markets", icon:"&#128200;"},
  {id:"scan",    label:"Scan",    icon:"&#128269;"},
  {id:"learn",   label:"Learn",   icon:"&#128218;"},
  {id:"more",    label:"More",    icon:"&#8942;"},
];

var GOLD="#D4AF37";
var T2="#A0A7B4";

export default function TabBar(props){
  var tab=props.tab||"home";
  var setTab=props.setTab||function(){};
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#050505",borderTop:"1px solid #1B2330",display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {TABS.map(function(t){
        var act=tab==t.id;
        return (
          <button key={t.id} onClick={function(){setTab(t.id);}} style={{flex:1,background:"none",border:"none",padding:"10px 2px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
            <span style={{fontSize:19,color:act?GOLD:"#FFFFFF"}} dangerouslySetInnerHTML={{__html:t.icon}}/>
            <span style={{fontSize:8.5,fontWeight:act?700:400,color:act?GOLD:T2}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
