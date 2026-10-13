import { useState, useRef } from "react";
import { EQ, ALERT_CATEGORIES, TIMEFRAMES, VOICE_MODES, playSound, speakAlert, loadAlertSettings, saveAlertSettings } from "./AlertsData";
import { useWatchlist } from "../hooks/useWatchlist";
import { useSmartAlerts } from "../hooks/useSmartAlerts";
import { t, useLang } from "../i18n/translations";

import { useTheme } from "../theme/ThemeProvider";
var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="rgba(255,255,255,0.07)",BD2="#141821";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";

function loadWatchlist(){
  try{
    var wl=JSON.parse(localStorage.getItem("bp_watchlist")||"null");
    if(wl&&wl.length>0)return wl.map(function(s){return typeof s=="string"?s:s.sym;});
  }catch(e){}
  return EQ.map(function(s){return s.sym;});
}

export default function SmartAlerts(props){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE2=theme.c.blue; DOWN=theme.c.down; T2=theme.c.text2;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var setTab=props.setTab||function(){};
  var saved=loadAlertSettings();
  // Monitoring list is derived from the ONE global watchlist (live sync).
  var wl=useWatchlist();

  var [voiceMode,setVoiceMode]=useState(saved.voiceMode||"bell");
  var [timeframe,setTimeframe]=useState(saved.timeframe||"5m");
  var [enabledCats,setEnabledCats]=useState(saved.enabledCats||{price:true,candle:true,breakout:true,technical:true,volume:true});
  var sa=useSmartAlerts();
  var master=sa.enabled;
  var masterRef=useRef(master);
  var [alerts,setAlerts]=useState([]);
  var [activeTab,setActiveTab]=useState("feed");
  var watchlist=wl.list.map(function(s){ return typeof s=="string"?s:s.sym; });
  if(!watchlist.length) watchlist=EQ.map(function(s){return s.sym;});
  var aRef=useRef([]);
  var voiceModeRef=useRef(voiceMode);
  var timeframeRef=useRef(timeframe);
  var enabledCatsRef=useRef(enabledCats);
  var watchlistRef=useRef(watchlist);
  aRef.current=alerts;
  voiceModeRef.current=voiceMode;
  timeframeRef.current=timeframe;
  enabledCatsRef.current=enabledCats;
  watchlistRef.current=watchlist;
  masterRef.current=master;

  function saveSettings(patch){
    var ns=Object.assign({},loadAlertSettings(),patch);
    saveAlertSettings(ns);
  }

  function setVoice(v){setVoiceMode(v);saveSettings({voiceMode:v});}
  function setTf(v){setTimeframe(v);saveSettings({timeframe:v});}
  function toggleCat(id){
    setEnabledCats(function(p){
      var n=Object.assign({},p,{[id]:!p[id]});
      saveSettings({enabledCats:n});
      return n;
    });
  }

  var addAlertRef=useRef(null);
  addAlertRef.current=function(al){
    var na=[al].concat(aRef.current).slice(0,60);
    setAlerts(na);
    var vm=voiceModeRef.current;
    var tf=timeframeRef.current;
    // Strict mutual exclusion: bell sound OR voice, never both
    if(vm=="silent"){
      // do nothing
    }else if(vm=="bell"){
      playSound(); // only bell, no voice
    }else{
      speakAlert(al,vm,tf); // only voice, no bell
    }
    // SAFETY PATCH: OS Notification firing disabled - this alert feed is
    // randomly generated (Math.random-based sym/type/price), not real
    // market data, and must not produce a real-looking OS notification.
    // In-app alert list/sound left as-is per the scoped emergency patch;
    // flagged separately for a full fix.
  };

  function addAlert(al){
    if(addAlertRef.current)addAlertRef.current(al);
  }
  function dismissAlert(id){
    setAlerts(function(prev){ return prev.filter(function(a){ return a.id!=id; }); });
  }

  // SAFETY PATCH: the 8-second random fake alert generator (Math.random
  // sym/type/price/confidence) has been removed. It is not replaced with
  // any static fake alert - alerts stays empty and no sound/voice/
  // notification is triggered from simulated data. See the FEED tab's
  // empty state below for the honest message shown instead.

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* Header */}
      <div style={{background:CARD,padding:"16px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:4}}>&#128276; {t("al.title")}</div>
        <div style={{fontSize:12,color:T3}}>{t("al.sub",{n:watchlist.length,c:Object.keys(enabledCats).filter(function(k){return enabledCats[k];}).length})}</div>
      </div>

      {/* STATUS BANNER - read only. Master switch lives ONLY in Settings. */}
      <div style={{display:"flex",alignItems:"center",gap:8,background:master?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.06)",border:"1px solid "+(master?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.25)"),borderRadius:12,margin:"12px 16px 0",padding:"12px 16px"}}>
        <span style={{width:9,height:9,borderRadius:"50%",background:master?UP:DOWN,flexShrink:0}}></span>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:master?UP:DOWN}}>{master?t("al.enabled"):t("al.disabled")}</div>
          <div style={{fontSize:12,color:T3,marginTop:4}}>{master?t("al.on_note"):t("al.off_note")}</div>
        </div>
      </div>

      {!master?(
        <div style={{padding:"40px 24px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}} dangerouslySetInnerHTML={{__html:"&#128277;"}}/>
          <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>{t("al.disabled")}</div>
          <div style={{fontSize:12,color:T3,lineHeight:1.6,maxWidth:260,margin:"0 auto"}}>{t("al.off_body")}</div>
        </div>
      ):(
      <div>
      {/* STATUS SUMMARY */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"12px 16px 0"}}>
        <Stat label={t("al.stat.watching")} value={t("al.stat.stocks",{n:watchlist.length})} tone="blue"/>
        <Stat label={t("al.stat.scanning")} value={master?t("al.stat.running"):t("al.stat.stopped")} tone={master?"up":"muted"}/>
        <Stat label={t("al.tab.tf")} value={timeframe} tone="gold"/>
        <Stat label={t("al.tab.voice")} value={voiceMode=="silent"?t("al.off"):t("al.on")} tone={voiceMode=="silent"?"muted":"up"}/>
        <Stat label={t("al.stat.notif")} value={master?t("al.on"):t("al.off")} tone={master?"up":"muted"}/>
        <Stat label={t("al.stat.priority")} value={voiceMode=="priority"?t("al.stat.priority"):voiceMode=="silent"?t("al.stat.normal"):t("al.tab.voice")} tone="blue"/>
      </div>

      {/* Top tabs */}
      <div style={{display:"flex",borderBottom:"1px solid "+BD,background:CARD}}>
        {["feed","voice","categories","timeframe"].map(function(tbk){
          var labels={feed:"&#128200; "+t("al.tab.feed"),voice:"&#127908; "+t("al.tab.voice"),categories:"&#9881;&#65039; "+t("al.tab.cats"),timeframe:"&#9203; "+t("al.tab.tf")};
          return (
            <button key={tbk} onClick={function(){setActiveTab(tbk);}} style={{flex:1,minWidth:0,background:"none",border:"none",borderBottom:activeTab==tbk?"2px solid "+BLUE2:"2px solid transparent",padding:"12px 4px",color:activeTab==tbk?BLUE2:T3,fontSize:12,fontWeight:activeTab==tbk?700:500,cursor:"pointer",fontFamily:"inherit",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} dangerouslySetInnerHTML={{__html:labels[tbk]}}/>
          );
        })}
      </div>

      <div style={{padding:"12px 16px"}}>

        {/* SCAN TOGGLE removed - Smart Alerts is controlled ONLY from Settings. */}

        {/* VOICE MODE TAB */}
        {activeTab=="voice"&&(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T2,marginBottom:12}}>{t("al.pick_mode")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {VOICE_MODES.map(function(vm){
                var act=voiceMode==vm.id;
                return (
                  <button key={vm.id} onClick={function(){setVoice(vm.id);}} style={{background:act?"rgba(59,130,246,0.15)":CARD,border:"1px solid "+(act?BLUE2:BD),borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:"inherit"}}>
                    <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:vm.icon}}/>
                    <span style={{fontSize:12,fontWeight:act?700:500,color:act?BLUE2:T1}}>{vm.label}</span>
                    {act&&<span style={{marginLeft:"auto",fontSize:12,color:BLUE2}}>&#10003;</span>}
                  </button>
                );
              })}
            </div>
            <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"8px 12px"}}>
              <div style={{fontSize:12,color:BLUE2}}>Telugu Voice: speaks alerts in Telugu. Female/Male: English with different pitch. Bell: only sound. Silent: no sound or vibration.</div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab=="categories"&&(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T2,marginBottom:12}}>{t("al.toggle_types")}</div>
            {ALERT_CATEGORIES.map(function(cat){
              var on=!!enabledCats[cat.id];
              return (
                <div key={cat.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,marginBottom:8,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px"}}>
                    <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:cat.icon}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:T1}}>{t("al.cat."+cat.id, cat.label)}</div>
                      <div style={{fontSize:12,color:T3,marginTop:4}}>{t("al.n_types",{n:cat.types.length})}</div>
                    </div>
                    <button onClick={function(){toggleCat(cat.id);}} style={{background:on?UP:CARD2,border:"1px solid "+(on?UP:BD2),borderRadius:20,padding:"4px 16px",color:on?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{on?"ON":"OFF"}</button>
                  </div>
                  {on&&(
                    <div style={{padding:"0 14px 10px",display:"flex",flexWrap:"wrap",gap:4}}>
                      {cat.types.map(function(ty){
                        return <span key={ty} style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:6,padding:"4px 8px",fontSize:12,color:BLUE2}}>{ty}</span>;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TIMEFRAME TAB */}
        {activeTab=="timeframe"&&(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T2,marginBottom:12}}>{t("al.pick_tf")}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {TIMEFRAMES.map(function(tf){
                var act=timeframe==tf.id;
                return (
                  <button key={tf.id} onClick={function(){setTf(tf.id);}} style={{background:act?"rgba(59,130,246,0.15)":CARD,border:"1px solid "+(act?BLUE2:BD),borderRadius:10,padding:"12px 4px",color:act?BLUE2:T1,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{tf.label}</button>
                );
              })}
            </div>
            <div style={{fontSize:12,color:T3,marginTop:12,padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10}}>{t("al.selected_tf",{tf:t("al.tf."+timeframe, TIMEFRAMES.find(function(x){return x.id==timeframe;}).label)})}</div>
          </div>
        )}

        {/* FEED TAB */}
        {activeTab=="feed"&&(
          <div>
            {alerts.length==0?(
              <div style={{textAlign:"center",padding:"40px 24px"}}>
                <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                  <span style={{fontSize:22}} dangerouslySetInnerHTML={{__html:"&#128276;"}}/>
                </div>
                <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:8}}>{t("al.unavail")}</div>
                <div style={{fontSize:12,color:T3,lineHeight:1.6,maxWidth:250,margin:"0 auto"}}>{t("al.unavail_body")}</div>
              </div>
            ):(
              groupAlerts(alerts).map(function(grp){
                if(!grp.items.length) return null;
                return (
                  <div key={grp.label}>
                    <div style={{fontSize:12,fontWeight:800,color:T3,letterSpacing:0.6,margin:"16px 4px 8px"}}>{t("al.grp."+grp.label, grp.label)}</div>
                    {grp.items.map(function(al){
                      var pc=alertPriority(al);
                      var col=pc.col;
                      var confTier=al.conf>=80?"High":al.conf>=65?"Medium":"Low"; // stays English (logic); shown via t()
                      var confCol=al.conf>=80?UP:al.conf>=65?BLUE:DOWN;
                      var inWl=wl.has(al.sym);
                      return (
                        <div key={al.id} style={{background:al.unread?"rgba(59,130,246,0.05)":CARD,border:"1px solid "+(al.unread?"rgba(59,130,246,0.25)":BD),borderRadius:14,padding:"12px 12px",marginBottom:8,borderLeft:"3px solid "+col}}>
                          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                            <div style={{width:34,height:34,borderRadius:9,background:col+"18",border:"1px solid "+col+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:pc.icon}}/>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                                <span style={{fontSize:12,fontWeight:800,color:T1}}>{al.sym}</span>
                                <span style={{background:col+"22",borderRadius:5,padding:"4px 8px",fontSize:12,fontWeight:800,color:col}} title={t("al.k."+(pc.cat||"default"), pc.explain)}>{pc.label}</span>
                                {al.unread?<span style={{width:6,height:6,borderRadius:"50%",background:BLUE2,flexShrink:0}}></span>:null}
                              </div>
                              <div style={{fontSize:12,color:T3}}>{al.type}</div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:12,color:T3}}>{al.time}</div>
                              <div style={{fontSize:12,fontWeight:800,color:confCol,marginTop:4}}>{t("al.conf."+confTier)}</div>
                            </div>
                          </div>
                          {/* trading details */}
                          <div style={{display:"flex",gap:12,marginTop:8,paddingTop:8,borderTop:"1px solid "+BD2}}>
                            <div><div style={{fontSize:12,color:T3}}>{t("al.trigger")}</div><div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{al.trig?"\u20B9"+al.trig:"--"}</div></div>
                            <div><div style={{fontSize:12,color:T3}}>{t("al.current")}</div><div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{al.cur?"\u20B9"+al.cur:"--"}</div></div>
                            <div><div style={{fontSize:12,color:T3}}>{t("al.change")}</div><div style={{fontSize:12,fontWeight:700,color:parseFloat(al.chg)>=0?UP:DOWN}}>{al.chg?(parseFloat(al.chg)>=0?"+":"")+al.chg+"%":"--"}</div></div>
                            <div style={{flex:1}}></div>
                            <div style={{textAlign:"right"}}><div style={{fontSize:12,color:T3}}>{t("al.volume")}</div><div style={{fontSize:12,fontWeight:700,color:al.vol?UP:T3}}>{al.vol?t("al.vol_conf"):t("al.vol_norm")}</div></div>
                          </div>
                          {/* actions */}
                          <div style={{display:"flex",gap:8,marginTop:8}}>
                            <button onClick={function(){setTab("markets");}} style={{flex:1,background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"8px",color:BLUE2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t("al.view_chart")}</button>
                            <button onClick={function(){ if(!inWl) wl.add(al.sym); dismissAlert(al.id); }} style={{flex:1,background:inWl?"rgba(34,197,94,0.12)":CARD2,border:"1px solid "+(inWl?"rgba(34,197,94,0.3)":BD),borderRadius:9,padding:"8px",color:inWl?UP:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{inWl?t("al.in_wl"):t("al.add_wl")}</button>
                            <button onClick={function(){dismissAlert(al.id);}} style={{background:CARD2,border:"1px solid "+BD,borderRadius:12,padding:"12px 24px",color:T3,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#10005;</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      </div>
      )}
    </div>
  );
}

// Group alerts into Today / Yesterday / Older buckets by timestamp.
function groupAlerts(alerts){
  var now=new Date();
  var startToday=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
  var startYest=startToday-86400000;
  var today=[], yest=[], older=[];
  for(var i=0;i<alerts.length;i++){
    var ts=alerts[i].ts||Date.now();
    if(ts>=startToday) today.push(alerts[i]);
    else if(ts>=startYest) yest.push(alerts[i]);
    else older.push(alerts[i]);
  }
  return [{label:"TODAY",items:today},{label:"YESTERDAY",items:yest},{label:"OLDER",items:older}];
}

// Priority color, label, icon and short explanation per alert category.
function alertPriority(al){
  var cat=(al.category||"").toLowerCase();
  var up=al.up;
  var map={
    breakout:{col:"#22C55E",label:"BREAKOUT",icon:"&#9650;",explain:"Price broke above a key resistance level"},
    breakdown:{col:"#EF4444",label:"BREAKDOWN",icon:"&#9660;",explain:"Price broke below a key support level"},
    volume:{col:"#3B82F6",label:"VOLUME",icon:"&#128202;",explain:"Unusual volume activity observed"},
    technical:{col:"#8B5CF6",label:"VWAP",icon:"&#128201;",explain:"Price crossed the VWAP level"},
    price:{col:up?"#22C55E":"#EF4444",label:"RSI",icon:"&#128293;",explain:"RSI reached an extreme zone"},
    candle:{col:"#F59E0B",label:"PATTERN",icon:"&#128208;",explain:"A candlestick pattern was detected"}
  };
  var d=map[cat]||{col:up?"#22C55E":"#EF4444",label:(al.category||"ALERT").toUpperCase(),icon:"&#128200;",explain:"Educational observation detected"};
  d.cat=map[cat]?cat:"default";
  return d;
}

// Compact status tile for the Smart Alerts summary.
function Stat(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE2=theme.c.blue;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var col=props.tone=="up"?UP:props.tone=="blue"?BLUE2:props.tone=="gold"?BLUE:props.tone=="muted"?T3:T1;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"8px 8px"}}>
      <div style={{fontSize:12,color:T3,marginBottom:4}}>{props.label}</div>
      <div style={{fontSize:12,fontWeight:800,color:col}}>{props.value}</div>
    </div>
  );
}
