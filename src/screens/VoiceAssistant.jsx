import { useState, useEffect, useRef } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#8B5CF6",PURPLE2="#A78BFA";
var GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#8899BB",T3="#475569";

var QUICK_CMDS=[
  "What is NIFTY today?",
  "Explain RSI indicator",
  "What is a Doji candle?",
  "NIFTY support and resistance",
  "What is PCR ratio?",
  "Explain breakout trading",
  "What is VWAP?",
  "Market mood today",
];

function speak(text){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);
  u.lang="en-IN";
  u.rate=0.9;
  u.pitch=1;
  window.speechSynthesis.speak(u);
}

export default function VoiceAssistant(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue;

  var onBack=props.onBack||function(){};
  var [listening,setListening]=useState(false);
  var [transcript,setTranscript]=useState("");
  var [aiReply,setAiReply]=useState("");
  var [loading,setLoading]=useState(false);
  var [error,setError]=useState("");
  var [history,setHistory]=useState([]);
  var [speaking,setSpeaking]=useState(false);
  var recRef=useRef(null);

  var supported=typeof window !== "undefined" && (window.SpeechRecognition||window.webkitSpeechRecognition);

  function startListening(){
    if(!supported){setError("Voice not supported on this browser. Use Chrome.");return;}
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    var rec=new SR();
    rec.lang="en-IN";
    rec.continuous=false;
    rec.interimResults=true;
    rec.onstart=function(){setListening(true);setTranscript("");setError("");};
    rec.onresult=function(e){
      var t=Array.from(e.results).map(function(r){return r[0].transcript;}).join(" ");
      setTranscript(t);
    };
    rec.onend=function(){
      setListening(false);
      if(transcript) askAI(transcript);
    };
    rec.onerror=function(e){
      setListening(false);
      setError("Mic error: "+e.error+". Allow mic permission.");
    };
    recRef.current=rec;
    rec.start();
  }

  function stopListening(){
    if(recRef.current){recRef.current.stop();}
    setListening(false);
  }

  function askAI(question){
    if(!question.trim())return;
    setLoading(true);setAiReply("");setError("");
    var prompt="You are a friendly Indian stock market educational assistant. Answer this question concisely in 2-3 sentences (educational only, not investment advice): "+question;
    fetch("/api/ai",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        messages:[{role:"user",content:prompt}],
        max_tokens:1000
      })
    })
    .then(function(r){return r.json();})
    .then(function(d){
      var reply=d&&d.ok&&d.text?d.text:"AI is temporarily unavailable. Please try again later.";
      setAiReply(reply);
      setHistory(function(prev){return [{q:question,a:reply,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}].concat(prev).slice(0,10);});
      setLoading(false);
      setSpeaking(true);
      speak(reply);
      setTimeout(function(){setSpeaking(false);},reply.length*60);
    })
    .catch(function(){
      setError("AI failed. Check internet.");
      setLoading(false);
    });
  }

  function stopSpeaking(){
    if(window.speechSynthesis)window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  useEffect(function(){
    return function(){
      if(recRef.current)recRef.current.stop();
      if(window.speechSynthesis)window.speechSynthesis.cancel();
    };
  },[]);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>AI Voice Assistant</div>
          <div style={{fontSize:10,color:T2}}>Ask market questions by voice</div>
        </div>
        {speaking&&(
          <button onClick={stopSpeaking} style={{background:"rgba(239,68,68,0.15)",border:"1px solid "+DOWN,borderRadius:10,padding:"5px 10px",color:DOWN,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Stop &#9632;</button>
        )}
      </div>

      <div style={{padding:"16px 14px"}}>

        {/* Mic Button */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
          <div style={{position:"relative",marginBottom:16}}>
            {listening&&(
              <div style={{position:"absolute",inset:-16,borderRadius:"50%",border:"2px solid "+PURPLE,opacity:0.4,animation:"va-ring 1.2s ease-out infinite"}}></div>
            )}
            {listening&&(
              <div style={{position:"absolute",inset:-8,borderRadius:"50%",border:"2px solid "+PURPLE2,opacity:0.6,animation:"va-ring 1.2s ease-out infinite 0.4s"}}></div>
            )}
            <button
              onClick={listening?stopListening:startListening}
              style={{width:90,height:90,borderRadius:"50%",background:listening?"linear-gradient(135deg,"+DOWN+",#B91C1C)":"linear-gradient(135deg,"+PURPLE+","+BLUE+")",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:listening?"0 0 30px rgba(239,68,68,0.5)":"0 0 20px rgba(124,58,237,0.4)",transition:"all 0.3s"}}
            >
              {listening?"&#9632;":"&#127908;"}
            </button>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:listening?DOWN:T2}}>
            {listening?"Listening... tap to stop":"Tap mic to ask"}
          </div>
          {transcript&&(
            <div style={{marginTop:8,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"8px 12px",maxWidth:280,textAlign:"center"}}>
              <div style={{fontSize:9,color:T3,marginBottom:3}}>You said:</div>
              <div style={{fontSize:11,color:T1,fontStyle:"italic"}}>"{transcript}"</div>
            </div>
          )}
        </div>

        {/* AI Reply */}
        {(loading||aiReply)&&(
          <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.08))",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"14px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:8,fontWeight:900,color:"#fff"}}>AI</span>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:PURPLE2}}>AI Answer</span>
              {speaking&&(
                <div style={{display:"flex",gap:2,alignItems:"center",marginLeft:4}}>
                  {[0,1,2].map(function(i){return <div key={i} style={{width:3,height:12,background:PURPLE2,borderRadius:2,animation:"va-wave 0.8s ease infinite",animationDelay:i*0.15+"s"}}></div>;})}
                  <span style={{fontSize:8,color:PURPLE2,marginLeft:4}}>Speaking...</span>
                </div>
              )}
            </div>
            {loading?(
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <div style={{width:14,height:14,border:"2px solid "+BD,borderTopColor:PURPLE,borderRadius:"50%",animation:"va-spin 0.8s linear infinite"}}></div>
                <span style={{fontSize:11,color:T2}}>Thinking...</span>
              </div>
            ):(
              <div style={{fontSize:12,color:T1,lineHeight:1.7}}>{aiReply}</div>
            )}
            <div style={{marginTop:8,fontSize:8,color:T3}}>Educational only. Not investment advice.</div>
          </div>
        )}

        {error&&(
          <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 12px",marginBottom:14}}>
            <div style={{fontSize:10,color:DOWN}}>{error}</div>
          </div>
        )}

        {/* Quick Commands */}
        <div style={{fontSize:10,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:10}}>QUICK QUESTIONS</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {QUICK_CMDS.map(function(cmd){
            return (
              <button key={cmd} onClick={function(){setTranscript(cmd);askAI(cmd);}} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"10px 14px",color:T2,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>&#128483;</span>
                {cmd}
              </button>
            );
          })}
        </div>

        {/* History */}
        {history.length>0&&(
          <div>
            <div style={{fontSize:10,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:10}}>RECENT QUESTIONS</div>
            {history.map(function(h,i){
              return (
                <div key={i} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"10px 14px",marginBottom:8,cursor:"pointer"}} onClick={function(){setTranscript(h.q);askAI(h.q);}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{fontSize:10,fontWeight:600,color:BLUE2}}>{h.q}</div>
                    <div style={{fontSize:8,color:T3,flexShrink:0,marginLeft:8}}>{h.time}</div>
                  </div>
                  <div style={{fontSize:9,color:T2,lineHeight:1.5}}>{h.a.slice(0,100)}{h.a.length>100?"...":""}</div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        @keyframes va-spin{to{transform:rotate(360deg)}}
        @keyframes va-ring{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(1.4);opacity:0}}
        @keyframes va-wave{0%,100%{height:4px}50%{height:14px}}
      `}</style>
    </div>
  );
                             }
