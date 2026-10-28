import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";

// BreakoutPro - HeaderAuth.jsx
// Top-right account area shared by every Home header (desktop GlobalHeader, mobile, tablet).
//   user null  -> Login and Register buttons (they open the auth screen)
//   user set   -> avatar with the signed-in name and a dropdown (profile, logout)
// It shows only what the existing session holds: no invented name, and no signed-in look
// without a user. Login and Register disappear as soon as a user exists and come back after logout.
//   compact  small screens: smaller buttons, first name only, name truncated
// Rules: no backtick, no triple-equals, ASCII only.
export default function HeaderAuth(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var st = useState(false);
  var open = st[0], setOpen = st[1];
  var user = props.user;
  var compact = !!props.compact;
  if(!user){
    var h = compact ? 34 : 40;
    return (
      <div data-testid="auth-buttons" style={{display:"flex",alignItems:"center",gap:compact ? 6 : 10,flexShrink:0}}>
        <button type="button" data-testid="auth-login" onClick={function(){ if(props.onAuth) props.onAuth("login"); }} style={{minHeight:h,padding:compact ? "0 12px" : "0 20px",background:c.card,border:"1.5px solid " + c.blue,borderRadius:10,color:c.text1,fontSize:compact ? 12 : 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Login</button>
        <button type="button" data-testid="auth-register" onClick={function(){ if(props.onAuth) props.onAuth("register"); }} style={{minHeight:h,padding:compact ? "0 12px" : "0 20px",background:c.accent,border:"1.5px solid " + c.accent,borderRadius:10,color:c.onAccent,fontSize:compact ? 12 : 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Register</button>
      </div>
    );
  }
  var full = String(user.name || "");
  var shown = compact ? full.split(" ")[0] : full;
  var initial = full ? full.charAt(0).toUpperCase() : "?";
  function onBlur(e){ if(!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }
  function onKey(e){ if(e.key=="Escape") setOpen(false); }
  var item = {width:"100%",boxSizing:"border-box",minHeight:44,background:"none",border:"none",textAlign:"left",padding:"0 14px",color:c.text1,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};
  return (
    <div data-testid="auth-user" style={{position:"relative",flexShrink:0}} onBlur={onBlur} onKeyDown={onKey}>
      <button type="button" data-testid="auth-user-btn" aria-haspopup="menu" aria-expanded={open} onClick={function(){ setOpen(!open); }}
        style={{display:"flex",alignItems:"center",gap:8,minHeight:compact ? 36 : 40,padding:compact ? "0 6px 0 4px" : "0 10px 0 6px",background:"none",border:"1px solid " + c.border,borderRadius:999,color:c.text1,cursor:"pointer",fontFamily:"inherit"}}>
        <span aria-hidden="true" style={{width:compact ? 26 : 28,height:compact ? 26 : 28,borderRadius:"50%",background:c.accent,color:c.onAccent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>{initial}</span>
        <span data-testid="auth-user-name" style={{fontSize:compact ? 12 : 13,fontWeight:700,maxWidth:compact ? 64 : 150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shown}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M2 4l4 4 4-4"/></svg>
      </button>
      {open ? (
        <div role="menu" style={{position:"absolute",top:"calc(100% + 6px)",right:0,minWidth:200,background:c.card,border:"1px solid " + c.border,borderRadius:12,overflow:"hidden",zIndex:60,boxShadow:"0 10px 26px rgba(15,23,42,0.18)"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid " + c.border2}}>
            <div style={{fontSize:13,fontWeight:800,color:c.text1,overflowWrap:"anywhere"}}>{full}</div>
            {user.phone ? <div style={{fontSize:11,color:c.text3}}>{user.phone}</div> : null}
          </div>
          <button type="button" role="menuitem" data-testid="auth-profile" style={item} onClick={function(){ setOpen(false); if(props.setTab) props.setTab("profile"); }}>{t("gh.view_profile")}</button>
          <button type="button" role="menuitem" data-testid="auth-logout" style={item} onClick={function(){ setOpen(false); if(props.onLogout) props.onLogout(); }}>{t("side.logout")}</button>
        </div>
      ) : null}
    </div>
  );
}
