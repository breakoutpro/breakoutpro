import { useState, useEffect } from "react";

// BreakoutPro - DebugOverlay.jsx (TEMPORARY - remove after the runtime
// question is answered)
// Every value shown here is measured live from the actual running page -
// window.innerWidth via a real resize listener, the workspace element's
// real rendered width via getBoundingClientRect(), real
// window.devicePixelRatio. Nothing here is a static guess or a value read
// from source code - it only reflects what the browser actually did.
// Rules: no backtick, no triple-equals, ASCII.

var BUILD_TAG = "debug-build-2026-08-05-a"; // literal string written into
// this exact file right now - if what you see in the browser does NOT say
// this, the browser is running an older bundle, not this code.

export default function DebugOverlay(props){
  var [winW, setWinW] = useState(typeof window!=="undefined" ? window.innerWidth : null);
  var [winH, setWinH] = useState(typeof window!=="undefined" ? window.innerHeight : null);
  var [dpr, setDpr] = useState(typeof window!=="undefined" ? window.devicePixelRatio : null);
  var [workspaceW, setWorkspaceW] = useState(null);
  var [bodyW, setBodyW] = useState(null);

  useEffect(function(){
    function measure(){
      setWinW(window.innerWidth);
      setWinH(window.innerHeight);
      setDpr(window.devicePixelRatio);
      if(props.workspaceRef && props.workspaceRef.current){
        var rect = props.workspaceRef.current.getBoundingClientRect();
        setWorkspaceW(Math.round(rect.width));
      }
      if(document.body){
        setBodyW(Math.round(document.body.getBoundingClientRect().width));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    var t = setInterval(measure, 1000); // catch late layout settling
    return function(){
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, [props.workspaceRef]);

  return (
    <div style={{position:"fixed",top:8,right:8,zIndex:99999,background:"#000",color:"#0F0",fontFamily:"monospace",fontSize:11,padding:"10px 14px",borderRadius:8,border:"2px solid #0F0",lineHeight:1.6,pointerEvents:"none",whiteSpace:"pre"}}>
{"BUILD: "+BUILD_TAG+"\n"}
{"MOUNTED: "+(props.componentName||"unknown")+"\n"}
{"BREAKPOINT: "+(props.breakpoint||"unknown")+"\n"}
{"window.innerWidth: "+winW+"px\n"}
{"window.innerHeight: "+winH+"px\n"}
{"devicePixelRatio: "+dpr+"\n"}
{"document.body width: "+bodyW+"px\n"}
{"workspace element real width: "+workspaceW+"px"}
    </div>
  );
}
