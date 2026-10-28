import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import { searchStocks } from "../../utils/searchStocks";

// BreakoutPro - HomeSearch.jsx
// Centred stock search for Home. It reuses the app's ONE search rule
// (utils/searchStocks, the same call the desktop header search and the Search
// screen make) and the same selection handler (opens the stock page). If the
// layout was given no handler it opens the existing Search screen instead.
// Keyboard: arrows move, Enter opens, Escape closes. No request is made.
// Rules: no backtick, no triple-equals, ASCII only.
export default function HomeSearch(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var light = c.scheme=="light";
  var big = props.size!="sm";
  var st = useState("");
  var q = st[0], setQ = st[1];
  var os = useState(false);
  var open = os[0], setOpen = os[1];
  var hs = useState(0);
  var hi = hs[0], setHi = hs[1];
  var results = q.trim().length > 0 ? searchStocks(q.trim(), 6) : [];
  var showList = open && q.trim().length > 0;

  function choose(s){
    setQ(""); setOpen(false); setHi(0);
    if(props.onSelectStock) props.onSelectStock(s);
    else if(props.setTab) props.setTab("search");
  }
  function onKey(e){
    if(e.key=="ArrowDown"){ e.preventDefault(); setOpen(true); setHi(results.length ? (hi + 1) % results.length : 0); }
    else if(e.key=="ArrowUp"){ e.preventDefault(); setHi(results.length ? (hi + results.length - 1) % results.length : 0); }
    else if(e.key=="Enter"){ if(results.length){ e.preventDefault(); choose(results[Math.min(hi, results.length - 1)]); } }
    else if(e.key=="Escape"){ setOpen(false); }
  }
  return (
    <div style={{position:"relative",maxWidth:big ? 760 : 560,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,height:big ? 56 : 48,padding:big ? "0 22px" : "0 16px",boxSizing:"border-box",background:light ? "rgba(255,255,255,0.95)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:999,boxShadow:light ? "0 6px 18px rgba(37,99,235,0.10), 0 1px 3px rgba(15,23,42,0.06)" : "0 4px 14px rgba(0,0,0,0.25)"}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.text2} strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false" style={{flexShrink:0}}><circle cx="11" cy="11" r="7.5"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
        <input data-testid="home-search" type="text" value={q} role="combobox" aria-expanded={showList} aria-controls="home-search-list" aria-autocomplete="list" aria-label={t("aria.search")} autoComplete="off"
          placeholder={t("gh.search")}
          onChange={function(e){ setQ(e.target.value); setOpen(true); setHi(0); }}
          onFocus={function(){ setOpen(true); }}
          onBlur={function(){ setTimeout(function(){ setOpen(false); }, 150); }}
          onKeyDown={onKey}
          style={{flex:1,minWidth:0,border:"none",outline:"none",background:"transparent",color:c.text1,fontSize:big ? 16 : 14,fontFamily:"inherit"}}/>
      </div>
      {showList ? (
        <div id="home-search-list" role="listbox" data-testid="home-search-list" style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:40,background:c.card,border:"1px solid " + c.border,borderRadius:16,overflow:"hidden",boxShadow:"0 12px 28px rgba(15,23,42,0.18)"}}>
          {results.length ? results.map(function(s, i){
            return (
              <div key={s.sym} role="option" aria-selected={i==hi} data-testid="home-search-item" onMouseDown={function(e){ e.preventDefault(); choose(s); }}
                style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",minHeight:44,padding:"6px 16px",cursor:"pointer",boxSizing:"border-box",background:i==hi ? c.blueSoft : "transparent"}}>
                <span style={{fontSize:13,fontWeight:800,color:c.text1}}>{s.sym}</span>
                <span style={{fontSize:12,color:c.text2,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
              </div>
            );
          }) : <div data-testid="home-search-none" style={{padding:"12px 16px",fontSize:13,color:c.text2}}>{t("home.search_none")}</div>}
        </div>
      ) : null}
    </div>
  );
}
