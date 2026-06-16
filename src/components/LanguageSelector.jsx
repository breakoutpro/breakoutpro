import { useState } from "react";
import { LANGUAGES, getLang, setLang } from "../i18n/translations";

var CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#7C3AED",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

export default function LanguageSelector(props) {
  var onClose = props.onClose || function(){};
  var onChange = props.onChange || function(){};
  var [current, setCurrent] = useState(getLang());

  function pick(code) {
    setLang(code);
    setCurrent(code);
    onChange(code);
    setTimeout(onClose, 200);
  }

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",zIndex:2000,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:CARD,borderTop:"1px solid "+BD,borderRadius:"20px 20px 0 0",width:"100%",padding:"16px 16px 30px",boxShadow:"0 -10px 40px rgba(0,0,0,0.5)"}}>
        <div style={{width:36,height:4,background:BD,borderRadius:2,margin:"0 auto 16px"}}></div>
        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:4}}>Select Language</div>
        <div style={{fontSize:9,color:T3,marginBottom:16}}>भाषा चुनें • భాష ఎంచుకోండి • ભાષા પસંદ કરો</div>

        {LANGUAGES.map(function(l){
          var act = current==l.code;
          return (
            <button key={l.code} onClick={function(){pick(l.code);}} style={{
              width:"100%",display:"flex",alignItems:"center",gap:12,
              background:act?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.03)",
              border:"1px solid "+(act?BLUE:BD),
              borderRadius:14,padding:"12px 14px",marginBottom:8,
              cursor:"pointer",fontFamily:"inherit",
            }}>
              <div style={{width:32,height:32,borderRadius:9,background:act?"linear-gradient(135deg,"+BLUE+","+PURPLE+")":"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:800,color:act?"#fff":T2}}>{l.flag}</span>
              </div>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:act?BLUE2:T1}}>{l.native}</div>
                <div style={{fontSize:8,color:T3}}>{l.label}</div>
              </div>
              {act?<div style={{width:18,height:18,borderRadius:"50%",background:BLUE,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,color:"#fff",fontWeight:900}}>OK</span></div>:null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
