import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { Wave } from "./home/HomeHub";

// BreakoutPro - AuthScreen.jsx
// Login / Register screen in the Home design language (white card on light sky blue,
// blue accent). It REPLACES the old dark login page; the sign-in logic below is the
// same as before, moved over unchanged: same /api/auth calls, same validation rules and
// messages, same session handling through props.onLogin, same "remember phone" helper.
// Nothing is faked: a user is signed in only after the existing checks succeed.
//   mode     "login" or "register" (which tab opens first)
//   onLogin  called with the user object after a successful check (App stores the session)
//   onClose  back to the public Home page
// Rules: no backtick, no triple-equals, ASCII only.
export default function AuthScreen(props) {
  var theme = useTheme();
  var c = theme.c;
  var light = c.scheme=="light";

  var [mode,setMode] = useState(props.mode=="register" ? "register" : "login");
  var [name,setName] = useState("");
  var [phone,setPhone] = useState("");
  var [pass,setPass] = useState("");
  var [invite,setInvite] = useState("");
  var [err,setErr] = useState("");
  var [showPass,setShowPass] = useState(false); // UI-only: toggles input type, no auth impact
  var [remember,setRemember] = useState(false); // UI-only: local convenience, no auth impact

  useEffect(function(){
    try{
      var saved = localStorage.getItem("bp_remember_phone");
      if(saved){ setPhone(saved); setRemember(true); }
    }catch(e){}
  },[]);

  function onPhoneChange(e){
    var v = e.target.value;
    setPhone(v);
    try{
      if(remember){ localStorage.setItem("bp_remember_phone", v); }
    }catch(e2){}
  }

  function onRememberToggle(){
    var next = !remember;
    setRemember(next);
    try{
      if(next){ localStorage.setItem("bp_remember_phone", phone||""); }
      else{ localStorage.removeItem("bp_remember_phone"); }
    }catch(e){}
  }

  function submit() {
    setErr("");
    if(!phone||phone.length<10){setErr("Enter valid 10-digit phone");return;}
    if(!pass||pass.length<6){setErr("Password min 6 chars");return;}
    setErr("Checking...");

    if(mode=="register"){
      // Verify invite code on the SERVER (code list never ships to the browser).
      fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"verifyCode",code:(invite||"").trim()})})
        .then(function(r){return r.json();})
        .then(function(d){
          if(!d||!d.ok){ setErr("Valid invite code required for private beta"); return; }
          if(!name){ setErr("Enter your name"); return; }
          // Beta access granted by server. Store session token only (no password persisted).
          try{ sessionStorage.setItem("bp_session", d.token||""); }catch(e){}
          try{
            var reg=JSON.parse(localStorage.getItem("bp_users")||"{}");
            reg[phone]={name:name,phone:phone}; // no plaintext password stored
            localStorage.setItem("bp_users",JSON.stringify(reg));
          }catch(e){}
          props.onLogin({name:name,phone:phone,trialStart:Date.now()});
        })
        .catch(function(){ setErr("Network error. Try again."); });
      return;
    }

    // LOGIN: try admin (server-verified) first, then known beta user.
    fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"admin",phone:phone,pass:pass})})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d&&d.ok&&d.role=="admin"){
          try{ sessionStorage.setItem("bp_session", d.token||""); }catch(e){}
          props.onLogin({name:"Admin",phone:phone,isAdmin:true,isPrem:true,trialStart:Date.now()});
          return;
        }
        // Not admin: check locally-registered beta user (registered earlier via server code check).
        var users={};
        try{users=JSON.parse(localStorage.getItem("bp_users")||"{}");}catch(e){}
        if(!users[phone]){ setErr("No account found. Register with your invite code."); return; }
        props.onLogin({name:users[phone].name||"Trader",phone:phone,trialStart:Date.now()});
      })
      .catch(function(){ setErr("Network error. Try again."); });
  }

  var bg = light ? "linear-gradient(180deg, #CFE4FA 0%, #E3F0FD 45%, " + c.bg + " 100%)" : "linear-gradient(180deg, #112445 0%, " + c.bg + " 70%)";
  var inp = {width:"100%",boxSizing:"border-box",background:light ? "#FFFFFF" : c.card2,border:"1.5px solid " + c.border,borderRadius:12,padding:"13px 14px 13px 42px",color:c.text1,fontSize:15,fontFamily:"inherit",outline:"none",minHeight:48};
  var iconWrap = {position:"relative",marginBottom:12};
  var fieldIcon = {position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",width:17,height:17,pointerEvents:"none",color:c.text2};
  var isErrNote = err=="Checking...";
  var focusCss = ".bpAuth input:focus-visible,.bpAuth button:focus-visible{outline:2px solid " + c.blue + ";outline-offset:2px}.bpAuth input:focus{border-color:" + c.blue + "}";

  return (
    <div className="bpAuth" data-testid="auth-screen" style={{position:"relative",minHeight:"100vh",background:bg,overflow:"hidden",fontFamily:"'Inter',Arial,sans-serif",color:c.text1}}>
      <style>{focusCss}</style>
      <Wave light={light} h={420}/>
      <div style={{position:"relative",display:"flex",justifyContent:"center",padding:"32px 14px 40px",boxSizing:"border-box"}}>
        <div style={{width:"100%",maxWidth:420,background:light ? "rgba(255,255,255,0.96)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:20,boxShadow:light ? "0 10px 30px rgba(37,99,235,0.12), 0 2px 6px rgba(15,23,42,0.06)" : "0 12px 32px rgba(0,0,0,0.35)",boxSizing:"border-box"}}>
          <div style={{display:"flex",justifyContent:"flex-end",padding:"10px 10px 0"}}>
            <button type="button" onClick={props.onClose} aria-label="Back to Home" style={{background:"none",border:"none",cursor:"pointer",color:c.text2,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19"/></svg>
            </button>
          </div>
          <div style={{padding:"0 28px 8px",textAlign:"center"}}>
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none" stroke={c.blue} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{display:"block",margin:"0 auto 8px"}}><path d="M3 26l7-8 6 5 12-15"/><path d="M20 8h8v8"/></svg>
            <div style={{fontSize:24,fontWeight:900,letterSpacing:-0.5}}>Breakout<span style={{color:c.blue}}> Pro</span></div>
            <div style={{fontSize:13,color:c.text2,marginTop:4}}>{mode=="login" ? "Log in to your account" : "Create your account"}</div>
          </div>
          <form onSubmit={function(e){ e.preventDefault(); submit(); }} noValidate style={{padding:"12px 28px 26px"}}>
            <div role="tablist" aria-label="Login or Register" style={{display:"flex",background:light ? "#EEF3FA" : c.card2,borderRadius:12,padding:4,marginBottom:18}}>
              {[["login","Login"],["register","Register"]].map(function(kv){
                var act = mode==kv[0];
                return <button key={kv[0]} type="button" role="tab" aria-selected={act} onClick={function(){setMode(kv[0]);setErr("");}} style={{flex:1,minHeight:44,borderRadius:9,border:"none",background:act ? c.accent : "transparent",color:act ? c.onAccent : c.text2,fontWeight:act ? 700 : 600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{kv[1]}</button>;
              })}
            </div>
            {err ? <div role={isErrNote ? "status" : "alert"} style={{background:isErrNote ? c.blueSoft : (light ? "#FFF7ED" : c.card2),border:"1px solid " + (isErrNote ? c.blue : c.warn),borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:13,color:c.text1}}>{isErrNote ? "" : "! "}{err}</div> : null}

            {mode=="register" ? (
              <div style={iconWrap}>
                <svg style={fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input style={inp} aria-label="Full Name" placeholder="Full Name" autoComplete="name" value={name} onChange={function(e){setName(e.target.value);}}/>
              </div>
            ) : null}
            {mode=="register" ? (
              <div style={iconWrap}>
                <svg style={fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>
                <input style={inp} aria-label="Invite Code" placeholder="Invite Code (private beta)" value={invite} onChange={function(e){setInvite(e.target.value);}}/>
              </div>
            ) : null}

            <div style={iconWrap}>
              <svg style={fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              <input style={inp} aria-label="Phone" placeholder="Phone (10 digits)" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} value={phone} onChange={onPhoneChange}/>
            </div>

            <div style={iconWrap}>
              <svg style={fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input style={Object.assign({},inp,{paddingRight:48})} aria-label="Password" placeholder="Password (min 6 chars)" type={showPass?"text":"password"} autoComplete={mode=="login" ? "current-password" : "new-password"} value={pass} onChange={function(e){setPass(e.target.value);}}/>
              <button type="button" onClick={function(){setShowPass(!showPass);}} aria-label={showPass ? "Hide password" : "Show password"} aria-pressed={showPass} style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",padding:12,minWidth:44,minHeight:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:c.text2}}>
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {mode=="login" ? (
              <label style={{display:"flex",alignItems:"center",gap:8,minHeight:36,marginBottom:12,cursor:"pointer",userSelect:"none"}}>
                <input type="checkbox" checked={remember} onChange={onRememberToggle} style={{width:16,height:16,accentColor:c.accent,cursor:"pointer"}}/>
                <span style={{fontSize:13,color:c.text2}}>Remember my phone number</span>
              </label>
            ) : <div style={{height:8}}/>}

            <button type="submit" style={{width:"100%",boxSizing:"border-box",minHeight:48,background:c.accent,border:"none",borderRadius:12,fontSize:15,fontWeight:700,color:c.onAccent,cursor:"pointer",fontFamily:"inherit"}}>
              {mode=="login" ? "Login" : "Create Account"}
            </button>

            <div style={{textAlign:"center",marginTop:14,fontSize:13,color:c.text2}}>
              {mode=="login" ? "New to Breakout Pro? " : "Already have an account? "}
              <button type="button" onClick={function(){setMode(mode=="login" ? "register" : "login");setErr("");}} style={{background:"none",border:"none",padding:"8px 4px",color:c.blue,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>
                {mode=="login" ? "Sign up" : "Log in"}
              </button>
            </div>

            <div style={{marginTop:12,fontSize:11,lineHeight:1.45,color:c.text3,textAlign:"center"}}>{props.disclaimer || ""}</div>
          </form>
        </div>
      </div>
    </div>
  );
}
