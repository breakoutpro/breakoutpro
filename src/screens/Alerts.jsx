import { useState, useEffect, useRef } from "react";
import { EQ, CM, PATTERNS, BREAKOUTS, OI_TYPES, ALERT_CATEGORIES, TIMEFRAMES, VOICE_MODES, getSess, genCandle, calcConfidence, playSound, speakAlert, MiniSpark, loadAlertSettings, saveAlertSettings } from "./AlertsData";

var BG="#050505",CARD="#101318",BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#8B5CF6",GOLD="#F59E0B";
var UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";

function loadWatchlist(){
  try{
    var wl=JSON.parse(localStorage.getItem("bp_watchlist")||"null");
    if(wl&&wl.length>0)return wl.map(function(s){return typeof s=="string"?s:s.sym;});
  }catch(e){}
  return EQ.map(function(s){return s.sym;});
}

export default function SmartAlerts(props){
  var setTab=props.setTab||function(){};
  var saved=loadAlertSettings();

  var [voiceMode,setVoiceMode]=useState(saved.voiceMode||"bell");
  var [timeframe,setTimeframe]=useState(saved.timeframe||"5m");
  var [enabledCats,setEnabledCats]=useState(saved.enabledCats||{price:true,candle:true,breakout:true,technical:true,volume:true});
  var [scanning,setScanning]=useState(true);
  var [alerts,setAlerts]=useState([]);
  var [activeTab,setActiveTab]=useState("feed");
  var [watchlist]=useState(function(){return loadWatchlist();});
  var aRef=useRef([]);
  aRef.current=alerts;

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

  function addAlert(al){
    var na=[al].concat(aRef.current).slice(0,60);
    setAlerts(na);
    if(voiceMode=="bell")playSound();
    else speakAlert(al,voiceMode,timeframe);
    if(typeof Notification!="undefined"&&Notification.permission=="granted"){
      try{new Notification("BreakoutPro: "+al.sym,{body:al.type,icon:"/favicon.ico"});}catch(e){}
    }
  }

  useEffect(function(){
    if(!scanning)return;
    var CATS_POOL={
      price:["Day High","Day Low","Cross Above Price","52W High","% Move Alert"],
      candle:PATTERNS.map(function(p){return p.name;}),
      breakout:BREAKOUTS.map(function(b){return b.name;}),
      technical:["EMA Crossover","RSI Overbought","MACD Bullish","Supertrend Buy","VWAP Cross","Bollinger Break"],
      volume:["Volume Spike","Unusual Volume","Price+Volume Breakout","Delivery Spike"],
      options:["OI Spike","Long Buildup","Short Covering","IV Spike"],
      global:["India VIX Spike","Crude Oil Move","Dollar Index Spike"],
      news:["Breaking News","Earnings Results","Bulk Deals"],
      ai:["AI Confidence >80%","Strong Trend","Market Mood Change"],
    };
    var t=setInterval(function(){
      var activeCats=Object.keys(enabledCats).filter(function(k){return enabledCats[k];});
      if(activeCats.length==0||watchlist.length==0)return;
      if(Math.random()>0.4)return;
      var cat=activeCats[Math.floor(Math.random()*activeCats.length)];
      var pool=CATS_POOL[cat]||["Signal detected"];
      var type=pool[Math.floor(Math.random()*pool.length)];
      var sym=watchlist[Math.floor(Math.random()*watchlist.length)];
      var conf=calcConfidence();
      var up=type.toLowerCase().indexOf("bull")!=-1||type.toLowerCase().indexOf("buy")!=-1||type.toLowerCase().indexOf("above")!=-1||type.toLowerCase().indexOf("high")!=-1;
      addAlert({id:Date.now(),sym:sym,type:type,category:cat,conf:conf,up:up,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})});
    },8000);
    return function(){clearInterval(t);};
  },[scanning,enabledCats,watchlist,voiceMode]);

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* Header */}
      <div style={{background:CARD,padding:"14px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:2}}>&#128276; Smart Alerts</div>
        <div style={{fontSize:10,color:T3}}>Watchlist: {watchlist.length} instruments &bull; {Object.keys(enabledCats).filter(function(k){return enabledCats[k];}).length} active categories</div>
      </div>

      {/* Top tabs */}
      <div style={{display:"flex",borderBottom:"1px solid "+BD,background:CARD}}>
        {["feed","voice","categories","timeframe"].map(function(t){
          var labels={feed:"&#128200; Feed",voice:"&#127908; Voice",categories:"&#9881;&#65039; Alert Types",timeframe:"&#9203; Timeframe"};
          return (
            <button key={t} onClick={function(){setActiveTab(t);}} style={{flex:1,background:"none",border:"none",borderBottom:activeTab==t?"2px solid "+BLUE2:"2px solid transparent",padding:"10px 2px",color:activeTab==t?BLUE2:T3,fontSize:9,fontWeight:activeTab==t?700:500,cursor:"pointer",fontFamily:"inherit"}} dangerouslySetInnerHTML={{__html:labels[t]}}/>
          );
        })}
      </div>

      <div style={{padding:"12px 14px"}}>

        {/* SCAN TOGGLE */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:scanning?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.04)",border:"1px solid "+(scanning?"rgba(34,197,94,0.3)":BD),borderRadius:12,padding:"10px 14px",marginBottom:12}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:scanning?UP:T3}}>&#128269; {scanning?"Scanning Live":"Paused"}</div>
            <div style={{fontSize:9,color:T3}}>Monitoring {watchlist.slice(0,3).join(", ")}{watchlist.length>3?" +more":""}</div>
          </div>
          <button onClick={function(){setScanning(function(p){return !p;});}} style={{background:scanning?UP:"rgba(255,255,255,0.1)",border:"none",borderRadius:20,padding:"6px 16px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{scanning?"Pause":"Resume"}</button>
        </div>

        {/* VOICE MODE TAB */}
        {activeTab=="voice"&&(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T2,marginBottom:10}}>Select Alert Mode</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {VOICE_MODES.map(function(vm){
                var act=voiceMode==vm.id;
                return (
                  <button key={vm.id} onClick={function(){setVoice(vm.id);}} style={{background:act?"rgba(59,130,246,0.15)":CARD,border:"1px solid "+(act?BLUE2:BD),borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:9,cursor:"pointer",fontFamily:"inherit"}}>
                    <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:vm.icon}}/>
                    <span style={{fontSize:11,fontWeight:act?700:500,color:act?BLUE2:T1}}>{vm.label}</span>
                    {act&&<span style={{marginLeft:"auto",fontSize:10,color:BLUE2}}>&#10003;</span>}
                  </button>
                );
              })}
            </div>
            <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"8px 12px"}}>
              <div style={{fontSize:8.5,color:BLUE2}}>Telugu Voice: speaks alerts in Telugu. Female/Male: English with different pitch. Bell: only sound. Silent: no sound or vibration.</div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab=="categories"&&(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T2,marginBottom:10}}>Enable / Disable Alert Types</div>
            {ALERT_CATEGORIES.map(function(cat){
              var on=!!enabledCats[cat.id];
              return (
                <div key={cat.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px"}}>
                    <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:cat.icon}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:T1}}>{cat.label}</div>
                      <div style={{fontSize:9,color:T3,marginTop:1}}>{cat.types.length} alert types</div>
                    </div>
                    <button onClick={function(){toggleCat(cat.id);}} style={{background:on?UP:"rgba(255,255,255,0.08)",border:"none",borderRadius:20,padding:"5px 14px",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{on?"ON":"OFF"}</button>
                  </div>
                  {on&&(
                    <div style={{padding:"0 14px 10px",display:"flex",flexWrap:"wrap",gap:5}}>
                      {cat.types.map(function(t){
                        return <span key={t} style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:6,padding:"3px 7px",fontSize:8,color:BLUE2}}>{t}</span>;
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
            <div style={{fontSize:11,fontWeight:700,color:T2,marginBottom:10}}>Select Timeframe</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {TIMEFRAMES.map(function(tf){
                var act=timeframe==tf.id;
                return (
                  <button key={tf.id} onClick={function(){setTf(tf.id);}} style={{background:act?"rgba(59,130,246,0.15)":CARD,border:"1px solid "+(act?BLUE2:BD),borderRadius:10,padding:"12px 4px",color:act?BLUE2:T1,fontSize:11,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{tf.label}</button>
                );
              })}
            </div>
            <div style={{fontSize:9,color:T3,marginTop:12,padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10}}>Selected: <span style={{color:BLUE2,fontWeight:700}}>{TIMEFRAMES.find(function(t){return t.id==timeframe;}).label}</span> chart for pattern detection</div>
          </div>
        )}

        {/* FEED TAB */}
        {activeTab=="feed"&&(
          <div>
            {/* Watchlist instruments being monitored */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:T3,marginBottom:6,letterSpacing:0.5}}>MONITORING INSTRUMENTS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {watchlist.slice(0,12).map(function(s){
                  return <span key={s} style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:6,padding:"3px 8px",fontSize:9,color:BLUE2,fontWeight:600}}>{s}</span>;
                })}
                {watchlist.length>12&&<span style={{fontSize:9,color:T3,padding:"3px 6px"}}>+{watchlist.length-12} more</span>}
                {watchlist.length==0&&<span style={{fontSize:9,color:T3}}>Add stocks to Watchlist to enable alerts</span>}
              </div>
            </div>

            {alerts.length==0?(
              <div style={{textAlign:"center",padding:"30px 20px",color:T3}}>
                <div style={{fontSize:28,marginBottom:10}}>&#128202;</div>
                <div style={{fontSize:12,marginBottom:4}}>Scanning your watchlist...</div>
                <div style={{fontSize:10}}>Alerts will appear here automatically</div>
                <div style={{fontSize:9,marginTop:6,color:T3}}>Current timeframe: {TIMEFRAMES.find(function(t){return t.id==timeframe;}).label}</div>
              </div>
            ):(
              alerts.map(function(al){
                var col=al.up?UP:DOWN;
                return (
                  <div key={al.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+col}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:13,fontWeight:800,color:T1}}>{al.sym}</span>
                        <span style={{background:col+"22",borderRadius:5,padding:"1px 6px",fontSize:7,fontWeight:700,color:col}}>{al.category.toUpperCase()}</span>
                        <span style={{background:"rgba(255,255,255,0.05)",borderRadius:5,padding:"1px 6px",fontSize:7,color:T3}}>{TIMEFRAMES.find(function(t){return t.id==timeframe;}).label}</span>
                      </div>
                      <span style={{fontSize:8,color:T3}}>{al.time}</span>
                    </div>
                    <div style={{fontSize:11,color:T1,marginBottom:4,fontWeight:600}}>{al.type}</div>
                    <div style={{fontSize:9,color:T3}}>AI Confidence: <span style={{color:al.conf>=80?UP:al.conf>=65?GOLD:DOWN,fontWeight:700}}>{al.conf}%</span></div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
