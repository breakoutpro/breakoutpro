import { G } from "../utils/helpers";

var TABS = [
  {id:"home",   label:"Home"},
  {id:"markets",label:"Markets"},
  {id:"oi",     label:"OI"},
  {id:"scanner",label:"Scan"},
  {id:"learn",  label:"Learn"},
  {id:"ai",     label:"AI"},
  {id:"more",   label:"More"},
];

export default function TabBar(props) {
  var tab = props.tab;
  var setTab = props.setTab;
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",background:"#0F1629",borderTop:"1px solid #1E2D4A",display:"flex",zIndex:100,paddingBottom:8}}>
      {TABS.map(function(t) {
        var active = tab == t.id;
        return (
          <button key={t.id} style={{flex:1,background:"none",border:"none",padding:"6px 2px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2}} onClick={function(){setTab(t.id);}}>
            <span style={{fontSize:7,fontWeight:active?700:500,color:active?"#00C853":"#4A5A7A"}}>{t.label}</span>
            {active ? <div style={{width:4,height:4,borderRadius:"50%",background:"#00C853"}}></div> : <div style={{width:4,height:4}}></div>}
          </button>
        );
      })}
    </div>
  );
}
