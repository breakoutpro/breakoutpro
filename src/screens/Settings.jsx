import { useState } from "react";
import LanguageSelector from "../components/LanguageSelector";
import LegalModals from "./LegalModals";
import { t, useLang, LANGUAGES } from "../i18n/translations";
import VoiceAlertWidget from "./VoiceAlertWidget";
import SettingsAlerts from "./SettingsAlerts";
import { useTheme } from "../theme/ThemeProvider";

var DB = "#050505";
var CB = "#101318";
var BD = "#20242D";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem("bp_settings") || "{}");
  } catch(e) { return {}; }
}

function saveSettings(s) {
  try { localStorage.setItem("bp_settings", JSON.stringify(s)); } catch(e) {}
}

function Toggle(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue;

  return (
    <div onClick={props.onChange} style={{width:44,height:24,borderRadius:12,background:props.value?BLUE:"rgba(255,255,255,0.1)",border:"1px solid "+(props.value?BLUE:BD),cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
      <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:props.value?22:2,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}></div>
    </div>
  );
}

function SettingRow(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue;

  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
      <div style={{width:36,height:36,borderRadius:10,background:props.iconBg||"rgba(59,130,246,0.1)",border:"1px solid "+(props.iconBorder||"rgba(59,130,246,0.2)"),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:T1}}>{props.label}</div>
        {props.sub ? <div style={{fontSize:12,color:T2,marginTop:4}}>{props.sub}</div> : null}
      </div>
      {props.toggle != undefined ? <Toggle value={props.toggle} onChange={props.onChange}/> : null}
      {props.value != undefined && props.toggle == undefined ? <div style={{fontSize:12,fontWeight:600,color:BLUE}}>{props.value}</div> : null}
      {props.arrow ? <span style={{color:T2,fontSize:14}}>&#8250;</span> : null}
    </div>
  );
}

function SectionHeader(props) {
  return (
    <div style={{padding:"16px 16px 8px",fontSize:12,fontWeight:700,color:T2,letterSpacing:1.2}}>{props.title}</div>
  );
}

export default function SettingsScreen(props) {

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  G2=theme.c.up;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks
  // above so this screen actually switches with the selected theme.
  var DB = theme.c.bg, CB = theme.c.card, BD = theme.c.border;
  var T1 = theme.c.text1, T2 = theme.c.text2;
  var BLUE = theme.c.blue, G = theme.c.up, R = theme.c.down, BLUE=theme.c.blue;
  var user = props.user || {name:"Admin",email:"admin@breakoutpro.in"};
  var isPrem = props.isPrem || false;
  var isAdmin = props.isAdmin || false;

  var defaults = {
    alertSound: true,
    alertVibrate: true,
    pushNotif: false,
    breakoutAlert: true,
    breakdownAlert: true,
    patternAlert: true,
    volumeAlert: true,
    rsiAlert: false,
    vwapAlert: true,
    alertFreq: "All",
    scanInterval: "5",
    marketReminder: true,
    homeOverride: "auto",
  };

  var [showLang, setShowLang] = useState(false);
  var [brightness, setBrightness] = useState(function(){
    try{ return parseInt(localStorage.getItem("bp_brightness")||"100"); }catch(e){ return 100; }
  });
  function applyBrightness(v){
    setBrightness(v);
    try{ localStorage.setItem("bp_brightness", String(v)); }catch(e){}
    try{ window.dispatchEvent(new CustomEvent("bp_brightness_change",{detail:v})); }catch(e){}
  }
  var [showPrivacy, setShowPrivacy] = useState(false);
  var [showSebi, setShowSebi] = useState(false);
  var curLang = useLang();
  var curLangRow = LANGUAGES.filter(function(l){ return l.code==curLang; })[0] || LANGUAGES[0];
  var [st, setSt] = useState(function() {
    var saved = loadSettings();
    return Object.assign({}, defaults, saved);
  });

  function update(key, val) {
    var ns = Object.assign({}, st);
    ns[key] = val;
    setSt(ns);
    saveSettings(ns);
  }

  function toggle(key) { update(key, !st[key]); }

  function requestNotif() {
    if (typeof Notification != "undefined") {
      Notification.requestPermission().then(function(perm) {
        if (perm == "granted") {
          update("pushNotif", true);
          try { new Notification("Breakout Pro", {body:t("set.notif_enabled_msg")}); } catch(e) {}
        }
      });
    }
  }

  var notifPerm = typeof Notification != "undefined" ? Notification.permission : "denied";

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"16px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={function(){props.setTab&&props.setTab("home");}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:14,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>{t("set.title")}</div>
          <div style={{fontSize:12,color:T2,marginTop:4}}>Breakout Pro v1.0</div>
        </div>
      </div>

      {/* Theme Settings */}
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,margin:"16px 16px 0",padding:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>{t("set.appearance")}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {id:"light", label:t("set.light")},
            {id:"dark", label:t("set.dark")},
            {id:"system", label:t("set.system")}
          ].map(function(m){
            var act = theme.mode==m.id;
            return (
              <button key={m.id} onClick={function(){theme.setTheme(m.id);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:10,padding:"12px 8px",color:act?"#fff":T1,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{m.label}</button>
            );
          })}
        </div>
      </div>

      {/* Profile */}
      <div style={{background:theme.c.card,border:"1px solid rgba(59,130,246,0.15)",borderRadius:16,margin:"16px 16px 0",padding:16,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:52,height:52,borderRadius:14,background:"#3B82F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#fff"}}>
          {user.name ? user.name[0].toUpperCase() : "A"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>{user.name}</div>
          <div style={{fontSize:12,color:T2,marginTop:4}}>{user.email || "admin@breakoutpro.in"}</div>
          <div style={{marginTop:8}}>
            {isPrem
              ? <span style={{background:"rgba(37,99,235,0.15)",color:BLUE,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,border:"1px solid rgba(37,99,235,0.3)"}}>{t("set.pro_member")}</span>
              : <span style={{background:"rgba(255,255,255,0.06)",color:T2,borderRadius:20,padding:"4px 12px",fontSize:12,border:"1px solid "+BD}}>{t("set.free_plan")}</span>
            }
          </div>
        </div>
        {!isPrem ? (
          <button onClick={function(){props.setTab && props.setTab("sub");}} style={{background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t("set.upgrade")}</button>
        ) : null}
      </div>

      {/* VOICE SMART ALERTS */}
      <SectionHeader title={t("set.voice_alerts")}/>
      <VoiceAlertWidget/>

      {/* ALERTS SECTION */}
      <SectionHeader title={t("set.alert_settings")}/>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,margin:"0 14px",overflow:"hidden"}}>
        <SettingRow icon="&#128276;" label={t("set.alert_sound")} sub={t("set.alert_sound_sub")} toggle={st.alertSound} onChange={function(){toggle("alertSound");}} iconBg="rgba(59,130,246,0.1)" iconBorder="rgba(59,130,246,0.2)"/>
        <SettingRow icon="&#128243;" label={t("set.vibration")} sub={t("set.vibration_sub")} toggle={st.alertVibrate} onChange={function(){toggle("alertVibrate");}} iconBg="rgba(59,130,246,0.1)" iconBorder="rgba(59,130,246,0.2)"/>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(37,99,235,0.1)",border:"1px solid rgba(37,99,235,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#128241;"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:T1}}>{t("set.push")}</div>
            <div style={{fontSize:12,color:T2,marginTop:4}}>
              {notifPerm=="granted"?t("set.push_on"):notifPerm=="denied"?t("set.push_denied"):t("set.push_tap")}
            </div>
          </div>
          {notifPerm=="granted"
            ? <div style={{fontSize:12,fontWeight:700,color:G2}}>{t("set.on")}</div>
            : <button onClick={requestNotif} style={{background:notifPerm=="denied"?R:BLUE,border:"none",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{notifPerm=="denied"?t("set.blocked"):t("set.enable")}</button>
          }
        </div>
        <SettingRow icon="&#9200;" label={t("set.reminder")} sub={t("set.reminder_sub")} toggle={st.marketReminder} onChange={function(){toggle("marketReminder");}} iconBg="rgba(139,92,246,0.1)" iconBorder="rgba(139,92,246,0.2)"/>
      </div>

      {/* ALERT TYPES */}
      <SectionHeader title={t("set.alert_types")}/>
      <SettingsAlerts st={st} toggle={toggle}/>

      {/* APP SETTINGS */}
      <SectionHeader title={t("set.app_settings")}/>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,margin:"0 14px",overflow:"hidden"}}>
        {/* Language: opens the shared selector; applies instantly, no reload. */}
        <div onClick={function(){setShowLang(true);}} style={{cursor:"pointer"}}>
          <SettingRow icon="&#127760;" label={t("set.language_row")} sub={t("set.language_sub")} value={curLangRow.native} arrow={true} iconBg="rgba(59,130,246,0.1)" iconBorder="rgba(59,130,246,0.2)"/>
        </div>
        {showLang?<LanguageSelector onClose={function(){setShowLang(false);}} onUpgrade={function(){setShowLang(false); props.setTab && props.setTab("sub");}}/>:null}

        {/* BRIGHTNESS CONTROL */}
        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BD}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:"&#9728;"}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:T1}}>{t("set.brightness")}</div>
              <div style={{fontSize:12,color:T2}}>{t("set.brightness_sub")}</div>
            </div>
            <span style={{fontSize:12,fontWeight:800,color:BLUE}}>{brightness}%</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[25,50,75,100].map(function(v){
              var act=brightness==v;
              return <button key={v} onClick={function(){applyBrightness(v);}} style={{flex:1,background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:10,padding:"8px 8px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{v}%</button>;
            })}
          </div>
        </div>

        <LegalModals showPrivacy={showPrivacy} showSebi={showSebi} onClosePrivacy={function(){setShowPrivacy(false);}} onCloseSebi={function(){setShowSebi(false);}}/>

        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BD}}>
          <div style={{fontSize:12,fontWeight:600,color:T1,marginBottom:8}}>{t("set.alert_freq")}</div>
          <div style={{display:"flex",gap:8}}>
            {["All","High Only","Critical"].map(function(f){
              var act=st.alertFreq==f;
              return <button key={f} onClick={function(){update("alertFreq",f);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t("set.freq."+f, f)}</button>;
            })}
          </div>
        </div>
        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BD}}>
          <div style={{fontSize:12,fontWeight:600,color:T1,marginBottom:4}}>{t("set.scan_interval")}</div>
          <div style={{fontSize:12,color:T2,marginBottom:8}}>{t("set.scan_interval_sub")}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["1","1"],["3","3"],["5","5"],["10","10"]].map(function(f){
              var act=st.scanInterval==f[0];
              return <button key={f[0]} onClick={function(){update("scanInterval",f[0]);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{f[1]+" "+t("set.min")}</button>;
            })}
          </div>
        </div>
      </div>

      {/* ADMIN - Home Preview Override */}
      {isAdmin?(
        <div>
          <SectionHeader title="ADMIN"/>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,margin:"0 14px",overflow:"hidden"}}>
            <div style={{padding:"12px 16px"}}>
              <div style={{fontSize:12,fontWeight:600,color:T1,marginBottom:4}}>Home Page Preview</div>
              <div style={{fontSize:12,color:T2,marginBottom:8}}>Force a specific home page to test/debug, instead of auto session switching</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["auto","Auto"],["equity","Equity"],["commodity","Commodity"],["global","International"]].map(function(f){
                  var act=st.homeOverride==f[0];
                  return <button key={f[0]} onClick={function(){update("homeOverride",f[0]);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"8px 12px",color:act?"#000":T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>;
                })}
              </div>
              {st.homeOverride!="auto"?(
                <div style={{marginTop:8,fontSize:12,color:theme.c.warn}}>Override active: Home tab will always show {st.homeOverride} screen until reset to Auto.</div>
              ):null}
            </div>
          </div>
        </div>
      ):null}

      {/* ABOUT */}
      <SectionHeader title={t("set.about")}/>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,margin:"0 14px",overflow:"hidden"}}>
        <SettingRow icon="&#8505;" label={t("set.app_version")} value="v1.0.0" iconBg="rgba(255,255,255,0.05)" iconBorder={BD}/>
        <div onClick={function(){setShowPrivacy(true);}} style={{cursor:"pointer"}}>
          <SettingRow icon="&#128196;" label={t("set.privacy")} arrow={true} iconBg="rgba(255,255,255,0.05)" iconBorder={BD}/>
        </div>
        <div onClick={function(){setShowSebi(true);}} style={{cursor:"pointer"}}>
          <SettingRow icon="&#128737;" label={t("set.sebi")} arrow={true} iconBg="rgba(249,115,22,0.1)" iconBorder="rgba(249,115,22,0.2)"/>
        </div>
        <div style={{padding:"12px 16px",cursor:"pointer"}} onClick={function(){props.onLogout && props.onLogout();}}>
          <div style={{fontSize:12,fontWeight:700,color:R,textAlign:"center"}}>{t("set.logout")}</div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,margin:"16px 16px 0",padding:12}}>
        <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>{t("set.disclaimer")}</div>
      </div>

    </div>
  );
              }
