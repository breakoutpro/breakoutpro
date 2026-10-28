import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";

// BreakoutPro - HomeMore.jsx
// Collapsed group for the secondary Home cards, so they stay one tap away
// without pushing the primary cards down. Closed on every load.
// Rules: no backtick, no triple-equals, ASCII only.
export default function HomeMore(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var st = useState(false);
  var open = st[0], setOpen = st[1];
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls="home-more-body" onClick={function(){ setOpen(!open); }}
        style={{width:"100%",boxSizing:"border-box",display:"flex",alignItems:"center",justifyContent:"space-between",background:c.card,border:"1px solid "+c.border,borderRadius:12,minHeight:44,padding:"0 12px",cursor:"pointer",color:c.text1,fontSize:13,fontWeight:800,marginBottom:open ? 8 : 0}}>
        <span>{t("home.more")}</span>
        <span aria-hidden="true" style={{color:c.text2,fontSize:12}}>{open ? "\u25b4" : "\u25be"}</span>
      </button>
      {open ? <div id="home-more-body" style={{display:"flex",flexDirection:"column",gap:8}}>{props.children}</div> : null}
    </div>
  );
}
