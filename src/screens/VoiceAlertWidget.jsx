import { useVoiceAlerts } from "../hooks/useVoiceAlerts";
import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";

// BreakoutPro - VoiceAlertWidget (Settings card)
// Voice switches for Smart Alerts. It reads REAL alerts from the user's own rules in the app
// language, only while the app is open. There is no demo feed and no "scanning" claim here.
// Controls use blue/neutral only (red/green stay reserved for market direction).
// Rules: no backticks, no triple-equals, ASCII only.

function Switch(props){
  var c = props.c;
  return (
    <button onClick={props.onClick} role="switch" aria-checked={props.on ? "true" : "false"} aria-label={props.label}
      style={{width:46,height:26,borderRadius:13,border:"none",background:props.on?c.blue:c.border,position:"relative",cursor:"pointer",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:props.on?23:3,width:20,height:20,borderRadius:"50%",background:c.onAccent,transition:"left 0.2s"}}></div>
    </button>
  );
}

export default function VoiceAlertWidget(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var va = useVoiceAlerts();
  var note = null;
  if(va.enabled && va.voiceOn){
    if(!va.supported || va.hasVoice == false) note = t("vo.no_voice");
  }
  return (
    <div style={{padding:props.flush?0:"16px 16px 0"}}>
      <div style={{background:c.card,border:"1px solid "+(va.enabled?c.blue:c.border),borderRadius:16,padding:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:14,fontWeight:800,color:c.text1}}>{t("sa.voice.title")}</div>
            <div style={{fontSize:12,color:c.text3,marginTop:4,lineHeight:1.4}}>{t("sa.voice.hint")}</div>
          </div>
          <Switch c={c} on={va.enabled} onClick={va.toggle} label={t("sa.voice.title")}/>
        </div>
        {va.enabled ? (
          <div style={{marginTop:12}}>
            <div style={{display:"flex",gap:8}}>
              <button onClick={function(){ va.setVoiceOn(!va.voiceOn); }} style={{flex:1,minHeight:44,background:va.voiceOn?c.blueSoft:c.card2,border:"1px solid "+(va.voiceOn?c.blue:c.border),borderRadius:10,color:va.voiceOn?c.blue:c.text2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t("sa.voice")}</button>
              <button onClick={function(){ va.setBellOn(!va.bellOn); }} style={{flex:1,minHeight:44,background:va.bellOn?c.blueSoft:c.card2,border:"1px solid "+(va.bellOn?c.blue:c.border),borderRadius:10,color:va.bellOn?c.blue:c.text2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t("sa.bell")}</button>
              <button onClick={va.test} style={{flex:1,minHeight:44,background:c.card2,border:"1px solid "+c.border,borderRadius:10,color:c.blue,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t("sa.voice.test")}</button>
            </div>
            {note ? <div style={{fontSize:12,color:c.text2,marginTop:8,lineHeight:1.4}}>{note}</div> : null}
            <div style={{fontSize:12,color:c.text3,marginTop:8,lineHeight:1.4}}>{t("vo.app_open_only")}</div>
            {props.setTab ? <button onClick={function(){ props.setTab("alerts"); }} style={{width:"100%",marginTop:12,minHeight:44,background:"transparent",border:"1px solid "+c.border,borderRadius:10,color:c.blue,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t("sa.voice.open")}</button> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
