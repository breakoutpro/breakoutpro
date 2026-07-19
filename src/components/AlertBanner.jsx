import { useState, useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";

var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";

var alertQueue = [];
var alertListeners = [];

export function addGlobalAlert(al) {
  alertQueue.unshift(al);
  if (alertQueue.length > 100) alertQueue = alertQueue.slice(0, 100);
  alertListeners.forEach(function(fn) { fn(al); });
}

export function getAlertQueue() { return alertQueue; }

function playSound() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1100, 1320].forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + i*0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i*0.12 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i*0.12 + 0.2);
      osc.start(ctx.currentTime + i*0.12);
      osc.stop(ctx.currentTime + i*0.12 + 0.25);
    });
  } catch(e) {}
}

function sendPushNotif(al) {
  if (!("Notification" in window)) return;
  if (window.Notification.permission != "granted") return;
  try {
    new window.Notification("Breakout Pro: " + al.sym, {
      body: al.type + "  " + al.msg,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: al.sym,
      requireInteraction: false,
    });
  } catch(e) {}
}

export function triggerAlert(al, soundOn) {
  addGlobalAlert(al);
  if (soundOn !== false) playSound();
  sendPushNotif(al);
}

export default function AlertBanner() {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var [current, setCurrent] = useState(null);
  var [visible, setVisible] = useState(false);
  var timerRef = useRef(null);

  useEffect(function() {
    function onAlert(al) {
      setCurrent(al);
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(function() { setVisible(false); }, 4000);
    }
    alertListeners.push(onAlert);
    return function() {
      alertListeners = alertListeners.filter(function(f) { return f != onAlert; });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible || !current) return null;

  var color = current.color || GOLD;

  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:9999,
      background:theme.c.card,
      borderBottom:"2px solid "+color,
      padding:"10px 14px",
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
      animation:"slideDown 0.3s ease-out",
    }}>
      <div style={{width:36,height:36,borderRadius:10,background:color+"22",border:"1px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:10,fontWeight:900,color:color}}>{current.sym ? current.sym.slice(0,3) : "AL"}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
          <span style={{fontSize:9,fontWeight:800,color:color,background:color+"22",borderRadius:5,padding:"1px 6px"}}>{current.type}</span>
          <span style={{fontSize:11,fontWeight:700,color:theme.c.text1}}>{current.sym}</span>
        </div>
        <div style={{fontSize:9,color:theme.c.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{current.msg}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:color}}>Rs{current.ltp >= 1000 ? (current.ltp/1000).toFixed(1)+"K" : current.ltp ? current.ltp.toFixed(2) : ""}</div>
        <div style={{fontSize:7,color:theme.c.text3}}>{current.time}</div>
      </div>
      <button onClick={function(){setVisible(false);}} style={{background:"none",border:"none",color:theme.c.text3,fontSize:16,cursor:"pointer",flexShrink:0,padding:4}}>X</button>
    </div>
  );
}

