import { useState, useEffect } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
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
  return (
    <div onClick={props.onChange} style={{width:44,height:24,borderRadius:12,background:props.value?G:"rgba(255,255,255,0.1)",border:"1px solid "+(props.value?G:BD),cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
      <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:props.value?22:2,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}></div>
    </div>
  );
}

function SettingRow(props) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:"1px solid "+BD}}>
      <div style={{width:36,height:36,borderRadius:10,background:props.iconBg||"rgba(0,200,83,0.1)",border:"1px solid "+(props.iconBorder||"rgba(0,200,83,0.2)"),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:16}}>{props.icon}</span>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:T1}}>{props.label}</div>
        {props.sub ? <div style={{fontSize:9,color:T2,marginTop:2}}>{props.sub}</div> : null}
      </div>
      {props.toggle != undefined ? <Toggle value={props.toggle} onChange={props.onChange}/> : null}
      {props.value != undefined && props.toggle == undefined ? <div style={{fontSize:11,fontWeight:600,color:G}}>{props.value}</div> : null}
      {props.arrow ? <span style={{color:T2,fontSize:14}}>&#8250;</span> : null}
    </div>
  );
}

function SectionHeader(props) {
  return (
    <div style={{padding:"14px 14px 6px",fontSize:9,fontWeight:700,color:T2,letterSpacing:1.2}}>{props.title}</div>
  );
}

export default function SettingsScreen(props) {
  var user = props.user || {name:"Admin",email:"admin@breakoutpro.in"};
  var isPrem = props.isPrem || false;

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
    darkMode: true,
    language: "English",
    alertFreq: "All",
    marketReminder: true,
    reminderTime: "9:00 AM",
  };

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
          try { new Notification("Breakout Pro", {body:"Notifications enabled! You will get live alerts."}); } catch(e) {}
        }
      });
    }
  }

  var notifPerm = typeof Notification != "undefined" ? Notification.permission : "denied";

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"14px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:20,fontWeight:900,color:T1}}>Settings</div>
        <div style={{fontSize:9,color:T2,marginTop:2}}>Breakout Pro v1.0</div>
      </div>

      {/* Profile */}
      <div style={{background:"linear-gradient(135deg,rgba(0,200,83,0.08),rgba(0,200,83,0.03))",border:"1px solid rgba(0,200,83,0.15)",borderRadius:16,margin:"14px 14px 0",padding:16,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,"+G+",#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#fff"}}>
          {user.name ? user.name[0].toUpperCase() : "A"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>{user.name}</div>
          <div style={{fontSize:9,color:T2,marginTop:2}}>{user.email || "admin@breakoutpro.in"}</div>
          <div style={{marginTop:6}}>
            {isPrem
              ? <span style={{background:"rgba(245,158,11,0.15)",color:GOLD,borderRadius:20,padding:"2px 10px",fontSize:9,fontWeight:700,border:"1px solid rgba(245,158,11,0.3)"}}>PRO Member</span>
              : <span style={{background:"rgba(255,255,255,0.06)",color:T2,borderRadius:20,padding:"2px 10px",fontSize:9,border:"1px solid "+BD}}>Free Plan</span>
            }
          </div>
        </div>
        {!isPrem ? (
          <button onClick={function(){props.setTab && props.setTab("sub");}} style={{background:GOLD,border:"none",borderRadius:10,padding:"8px 14px",color:"#000",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>
        ) : null}
      </div>

      {/* ALERTS SECTION */}
      <SectionHeader title="ALERT SETTINGS"/>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,margin:"0 14px",overflow:"hidden"}}>
        <SettingRow icon="&#128276;" label="Alert Sound" sub="Bell sound on every alert" toggle={st.alertSound} onChange={function(){toggle("alertSound");}} iconBg="rgba(0,200,83,0.1)" iconBorder="rgba(0,200,83,0.2)"/>
        <SettingRow icon="&#128243;" label="Vibration" sub="Phone vibrates on alert" toggle={st.alertVibrate} onChange={function(){toggle("alertVibrate");}} iconBg="rgba(59,130,246,0.1)" iconBorder="rgba(59,130,246,0.2)"/>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:"1px solid "+BD}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:16}}>&#128241;</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:T1}}>Push Notifications</div>
            <div style={{fontSize:9,color:T2,marginTop:2}}>
              {notifPerm=="granted"?"Enabled  alerts come even when app is closed":notifPerm=="denied"?"Blocked in browser settings":"Tap to enable phone notifications"}
            </div>
          </div>
          {notifPerm=="granted"
            ? <div style={{fontSize:9,fontWeight:700,color:G2}}>ON</div>
            : <button onClick={requestNotif} style={{background:notifPerm=="denied"?R:G,border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{notifPerm=="denied"?"Blocked":"Enable"}</button>
          }
        </div>
        <SettingRow icon="&#9200;" label="Market Open Reminder" sub="9:00 AM reminder before market opens" toggle={st.marketReminder} onChange={function(){toggle("marketReminder");}} iconBg="rgba(139,92,246,0.1)" iconBorder="rgba(139,92,246,0.2)"/>
      </div>

      {/* ALERT TYPES */}
      <SectionHeader title="ALERT TYPES"/>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,margin:"0 14px",overflow:"hidden"}}>
        <SettingRow icon="UP" label="Breakout Alerts" sub="Price breaks above resistance" toggle={st.breakoutAlert} onChange={function(){toggle("breakoutAlert");}} iconBg="rgba(0,200,83,0.1)" iconBorder="rgba(0,200,83,0.2)"/>
        <SettingRow icon="DN" label="Breakdown Alerts" sub="Price breaks below support" toggle={st.breakdownAlert} onChange={function(){toggle("breakdownAlert");}} iconBg="rgba(239,68,68,0.1)" iconBorder="rgba(239,68,68,0.2)"/>
        <SettingRow icon="&#128208;" label="Pattern Alerts" sub="Doji, Hammer, Engulfing etc" toggle={st.patternAlert} onChange={function(){toggle("patternAlert");}} iconBg="rgba(245,158,11,0.1)" iconBorder="rgba(245,158,11,0.2)"/>
        <SettingRow icon="&#128202;" label="Volume Spike" sub="2x+ average volume detected" toggle={st.volumeAlert} onChange={function(){toggle("volumeAlert");}} iconBg="rgba(59,130,246,0.1)" iconBorder="rgba(59,130,246,0.2)"/>
        <SettingRow icon="VP" label="VWAP Cross Alert" sub="Price crosses VWAP level" toggle={st.vwapAlert} onChange={function(){toggle("vwapAlert");}} iconBg="rgba(139,92,246,0.1)" iconBorder="rgba(139,92,246,0.2)"/>
        <SettingRow icon="RS" label="RSI Extreme Alert" sub="RSI above 70 or below 30" toggle={st.rsiAlert} onChange={function(){toggle("rsiAlert");}} iconBg="rgba(249,115,22,0.1)" iconBorder="rgba(249,115,22,0.2)"/>
      </div>

      {/* APP SETTINGS */}
      <SectionHeader title="APP SETTINGS"/>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,margin:"0 14px",overflow:"hidden"}}>
        <SettingRow icon="&#127760;" label="Language" sub="App display language" value={st.language} arrow={true} iconBg="rgba(59,130,246,0.1)" iconBorder="rgba(59,130,246,0.2)"/>
        <SettingRow icon="&#127760;" label="Alert Frequency" sub="How often to show alerts" value={st.alertFreq} arrow={true} iconBg="rgba(0,200,83,0.1)" iconBorder="rgba(0,200,83,0.2)"/>
        <div style={{padding:"13px 14px",borderBottom:"1px solid "+BD}}>
          <div style={{fontSize:12,fontWeight:600,color:T1,marginBottom:8}}>Alert Frequency</div>
          <div style={{display:"flex",gap:6}}>
            {["All","High Only","Critical"].map(function(f){
              var act=st.alertFreq==f;
              return <button key={f} onClick={function(){update("alertFreq",f);}} style={{background:act?G:"rgba(255,255,255,0.05)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"5px 12px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>;
            })}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <SectionHeader title="ABOUT"/>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,margin:"0 14px",overflow:"hidden"}}>
        <SettingRow icon="&#8505;" label="App Version" value="v1.0.0" iconBg="rgba(255,255,255,0.05)" iconBorder={BD}/>
        <SettingRow icon="&#128196;" label="Privacy Policy" arrow={true} iconBg="rgba(255,255,255,0.05)" iconBorder={BD}/>
        <SettingRow icon="&#128737;" label="SEBI Disclaimer" arrow={true} iconBg="rgba(249,115,22,0.1)" iconBorder="rgba(249,115,22,0.2)"/>
        <div style={{padding:"13px 14px",cursor:"pointer"}} onClick={function(){props.onLogout && props.onLogout();}}>
          <div style={{fontSize:12,fontWeight:700,color:R,textAlign:"center"}}>Logout</div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,margin:"14px 14px 0",padding:10}}>
        <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Breakout Pro is for educational purposes only. Not SEBI registered. Not investment advice. All alerts are educational signals only.</div>
      </div>

    </div>
  );
              }
