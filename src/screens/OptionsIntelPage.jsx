import OptionsIntel from "./OptionsIntel";

// BreakoutPro - OptionsIntelPage.jsx
// Dedicated full-page wrapper for Options Intelligence (opened from Home card).
// Pure black premium. Rules: no backtick, no triple-equals, ASCII only.

var BG="#050505",BD="#1B2330",T1="#FFFFFF",T2="#A0A7B4";

export default function OptionsIntelPage(props){
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>Options Intelligence</div>
          <div style={{fontSize:9,color:T2}}>Full derivatives analytics</div>
        </div>
      </div>
      <div style={{marginTop:6}}>
        <OptionsIntel symbol={props.symbol||"NIFTY"} full={true}/>
      </div>
    </div>
  );
}
