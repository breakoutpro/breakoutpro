import { useEffect, useRef, useState } from "react";

function pickFemaleVoice(){
  if(!window.speechSynthesis)return null;
  var voices=window.speechSynthesis.getVoices();
  if(!voices||voices.length==0)return null;
  var preferred=["Samantha","Google US English Female","Microsoft Zira","Female","en-IN","en-GB"];
  for(var i=0;i<preferred.length;i++){
    var match=voices.find(function(v){
      return v.name.toLowerCase().indexOf(preferred[i].toLowerCase())!=-1;
    });
    if(match)return match;
  }
  var enVoice=voices.find(function(v){return v.lang&&v.lang.indexOf("en")==0;});
  return enVoice||voices[0];
}

function speakAlert(text,voiceRef){
  if(!window.speechSynthesis)return;
  var u=new SpeechSynthesisUtterance(text);
  u.lang="en-IN";
  u.rate=0.95;
  u.pitch=1.15;
  u.volume=1;
  if(voiceRef.current)u.voice=voiceRef.current;
  window.speechSynthesis.speak(u);
}

// Builds a natural sentence from a detected pattern/breakout event
function buildAlertSentence(event){
  if(event.kind=="pattern"){
    return event.sym+" formed a "+event.name+" pattern.";
  }
  if(event.kind=="breakout"){
    return event.sym+" "+(event.dir=="bullish"?"broke above resistance":"broke below support")+".";
  }
  return event.sym+" alert triggered.";
}

// Hook: call with a list of symbols to simulate watching; fires periodic voice alerts.
// enabled: boolean toggle from settings/localStorage
export function useVoiceAlerts(symbols,enabled){
  var [lastAlert,setLastAlert]=useState(null);
  var [muted,setMuted]=useState(function(){
    try{return localStorage.getItem("bp_voice_alerts")=="off";}catch(e){return false;}
  });
  var voiceRef=useRef(null);
  var timerRef=useRef(null);

  useEffect(function(){
    if(!window.speechSynthesis)return;
    function loadVoices(){voiceRef.current=pickFemaleVoice();}
    loadVoices();
    window.speechSynthesis.onvoiceschanged=loadVoices;
  },[]);

  useEffect(function(){
    if(!enabled||muted||!symbols||symbols.length==0)return;

    var PATTERNS=["Doji","Hammer","Bullish Engulfing","Bearish Engulfing","Shooting Star","Morning Star"];

    function tick(){
      // ~30% chance per tick to simulate a detected event (demo data until live API connected)
      if(Math.random()<0.3){
        var sym=symbols[Math.floor(Math.random()*symbols.length)];
        var isPattern=Math.random()<0.5;
        var event=isPattern
          ?{kind:"pattern",sym:sym,name:PATTERNS[Math.floor(Math.random()*PATTERNS.length)]}
          :{kind:"breakout",sym:sym,dir:Math.random()<0.5?"bullish":"bearish"};
        var sentence=buildAlertSentence(event);
        speakAlert(sentence,voiceRef);
        setLastAlert(Object.assign({},event,{sentence:sentence,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}));
      }
    }
    timerRef.current=setInterval(tick,25000);
    return function(){clearInterval(timerRef.current);};
  },[enabled,muted,symbols]);

  function toggleMute(){
    setMuted(function(prev){
      var next=!prev;
      try{localStorage.setItem("bp_voice_alerts",next?"off":"on");}catch(e){}
      if(next&&window.speechSynthesis)window.speechSynthesis.cancel();
      return next;
    });
  }

  return {lastAlert:lastAlert,muted:muted,toggleMute:toggleMute};
}
