// BreakoutPro - ExpiryAlerts.jsx
// Expiry Intelligence Smart Alerts: notification center + history + enable/disable.
// Educational observation only. SEBI-safe. Rules: no backtick, no triple-equals, ASCII.
import { useState, useEffect } from "react";
import { EXPIRY_ALERT_TYPES, loadAlertPrefs, saveAlertPrefs, loadAlertHistory, clearAlertHistory, markAllRead, requestPushPermission, simulateAlert } from "./ExpiryAlertsData";

import { useTheme } from "../theme/ThemeProvider";
var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#4F8CFF",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function ExpiryAlerts(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, BLUE=theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3, T2=theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var [tab,setTab]=useState("center"); // center | settings
  var [prefs,setPrefs]=useState(loadAlertPrefs());
  var [history,setHistory]=useState(loadAlertHistory());

  useEffect(function(){
    // mark all read when opening notification center
    if(tab=="center"){ var h=markAllRead(); setHistory(h.slice()); }
  },[tab]);

  useEffect(function(){
    function onAlert(){ setHistory(loadAlertHistory().slice()); }
    try{ window.addEventListener("bp_expiry_alert",onAlert); }catch(e){}
    return function(){ try{ window.removeEventListener("bp_expiry_alert",onAlert); }catch(e){} };
  },[]);

  function toggle(id){
    var np=Object.assign({},prefs); np[id]=!np[id]; setPrefs(np); saveAlertPrefs(np);
    if(np[id]) requestPushPermission();
  }
  function doClear(){ clearAlertHistory(); setHistory([]); }

  return (
    <div style={{minHeight:"100vh",background:BG,paddingBottom:80}}>
      {/* HEADER */}
      <div style={{padding:"16px 16px 12px",borderBottom:"1px solid "+BD,background:BG,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={function(){props.setTab&&props.setTab("optsellhub");}} style={{background:"none",border:"none",color:T2,fontSize:22,cursor:"pointer",padding:4}}>&#8249;</button>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16,fontWeight:900,color:T1}}>Expiry Intelligence</span>
              <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"4px 8px",borderRadius:4}}>PRO</span>
            </div>
            <div style={{fontSize:12,color:T2,marginTop:4}}>Smart Alerts &#8226; Educational Observation Engine</div>
          </div>
          <span style={{width:7,height:7,borderRadius:"50%",background:UP,boxShadow:"0 0 8px "+UP}}></span>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:8,padding:"12px 16px"}}>
        {[["center","Notifications"],["settings","Alert Settings"]].map(function(o){
          var act=tab==o[0];
          return <button key={o[0]} onClick={function(){setTab(o[0]);}} style={{flex:1,background:act?BLUE:"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:10,padding:"8px 8px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit"}}>{o[1]}</button>;
        })}
      </div>

      {tab=="center"?(
        <div style={{padding:"0 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:12,color:T3}}>{history.length} alert{history.length==1?"":"s"} in history</span>
            {history.length?<button onClick={doClear} style={{background:"none",border:"none",color:DOWN,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>:null}
          </div>
          {history.length?history.map(function(a){
            return (
              <div key={a.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:34,height:34,background:CARD2,border:"1px solid "+BD2,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:a.icon}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,fontWeight:800,color:T1}}>{a.name}</span>
                    <span style={{fontSize:12,color:BLUE,fontWeight:700}}>{a.symbol}</span>
                  </div>
                  <div style={{fontSize:12,color:T2,marginTop:4,lineHeight:1.4}}>{a.detail}</div>
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{a.time}</div>
                </div>
              </div>
            );
          }):(
            <div style={{textAlign:"center",padding:"40px 24px"}}>
              <div style={{fontSize:32,marginBottom:12}} dangerouslySetInnerHTML={{__html:"&#128276;"}}/>
              <div style={{fontSize:14,fontWeight:700,color:T2}}>No alerts yet</div>
              <div style={{fontSize:12,color:T3,marginTop:4,lineHeight:1.5}}>Expiry observation alerts will appear here when detected by the engine.</div>
              <button onClick={function(){simulateAlert();}} style={{marginTop:16,background:"rgba(79,140,255,0.1)",border:"1px solid "+BLUE,borderRadius:10,padding:"8px 16px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Preview a Sample Alert</button>
            </div>
          )}
        </div>
      ):(
        <div style={{padding:"0 14px"}}>
          <div style={{fontSize:12,color:T3,marginBottom:12,lineHeight:1.5}}>Enable or disable each observation alert. Only enabled types will notify you.</div>
          {EXPIRY_ALERT_TYPES.map(function(at){
            var on=prefs[at.id];
            return (
              <div key={at.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:34,height:34,background:CARD2,border:"1px solid "+BD2,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:at.icon}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:800,color:T1}}>{at.name}</div>
                  <div style={{fontSize:12,color:T2,marginTop:4,lineHeight:1.4}}>{at.desc}</div>
                </div>
                <button onClick={function(){toggle(at.id);}} style={{width:44,height:25,borderRadius:13,background:on?UP:"#2A2E37",border:"none",position:"relative",cursor:"pointer",flexShrink:0,transition:"background 0.2s"}}>
                  <span style={{position:"absolute",top:3,left:on?22:3,width:19,height:19,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}></span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* DISCLAIMER */}
      <div style={{margin:"16px 16px 0",background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
        <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Educational Market Observation Only. Breakout Pro organizes observed market structure for learning purposes. It does not provide investment advice, trading recommendations or future price predictions.</div>
      </div>
    </div>
  );
      }
