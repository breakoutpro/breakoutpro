import { useState, useRef } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - NewsStudio.jsx
// AI News Studio - generates shareable news cards from REAL news headlines.
// Data ownership: reuses the SAME news array App.jsx already fetches via
// useLiveNews() (passed in as props.news) - this file makes ZERO news
// fetch calls of its own, no second poller, no duplicate hook.
// AI sentiment is genuinely AI-derived (one on-demand call per selected
// article via the existing shared api/ai.js proxy - not a second AI
// endpoint), cached per article so re-opening the same article never
// re-calls the API. Low-confidence or failed classification always shows
// "Uncertain" - never a fabricated Bullish/Bearish label.
// Card image generation is 100% local (Canvas API only, no dependency,
// no network) and happens ONLY when the user taps Download or Share.
// Rules: no backtick, no triple-equals, ASCII only.

var DB = "#0A0E1A", CB = "#0F1629", BD = "#1E2D4A";
var T1 = "#FFFFFF", T2 = "#8899BB", T3 = "#5B6472";
var G = "#22C55E", R = "#EF4444", BLUE = "#3B82F6";

var TEMPLATES = [
  {id:"dark",  label:"Dark",         bg:"#0A0D12", fg:"#FFFFFF", accent:BLUE},
  {id:"white", label:"White",        bg:"#FFFFFF", fg:"#0A0D12", accent:BLUE},
  {id:"red",   label:"Red Breaking", bg:"#7F1D1D", fg:"#FFFFFF", accent:"#EF4444"},
  {id:"blue",  label:"Blue Corporate",bg:"#0B1E3D", fg:"#FFFFFF", accent:BLUE}
];

var SENTIMENT_COLOR = { Bullish:G, Bearish:R, Neutral:T2, Uncertain:T3 };

// One on-demand AI classification per selected article, via the existing
// shared api/ai.js proxy (no new endpoint). Strict JSON, low confidence or
// any failure always yields "Uncertain" - never a fabricated label.
function classifyArticle(article){
  var prompt = "Classify this Indian stock market news headline. "+
    "Respond ONLY with strict JSON, no other text: "+
    "{\"sentiment\":\"Bullish|Bearish|Neutral\",\"impact\":\"Nifty|Sector|Company\",\"confidence\":0-100}. "+
    "Headline: "+article.title;
  return fetch("/api/ai",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({messages:[{role:"user",content:prompt}],max_tokens:80})
  })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok || !d.text) return {sentiment:"Uncertain",impact:"Company",confidence:0};
      var parsed = null;
      try{
        var m = d.text.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : null;
      }catch(e){ parsed = null; }
      if(!parsed) return {sentiment:"Uncertain",impact:"Company",confidence:0};
      var conf = typeof parsed.confidence=="number" ? parsed.confidence : 0;
      var sent = ["Bullish","Bearish","Neutral"].indexOf(parsed.sentiment)!=-1 ? parsed.sentiment : "Uncertain";
      var imp = ["Nifty","Sector","Company"].indexOf(parsed.impact)!=-1 ? parsed.impact : "Company";
      if(conf<60) sent = "Uncertain"; // honest low-confidence handling, never guessed
      return {sentiment:sent, impact:imp, confidence:conf};
    })
    .catch(function(){ return {sentiment:"Uncertain",impact:"Company",confidence:0}; });
}

// Wraps text into lines that fit maxWidth on the given canvas context.
function wrapText(ctx, text, maxWidth){
  var words = text.split(" ");
  var lines = [], cur = "";
  for(var i=0;i<words.length;i++){
    var test = cur ? cur+" "+words[i] : words[i];
    if(ctx.measureText(test).width > maxWidth && cur){ lines.push(cur); cur = words[i]; }
    else { cur = test; }
  }
  if(cur) lines.push(cur);
  return lines;
}

// Local, dependency-free PNG generation - only ever called at the moment
// of Download/Share, never eagerly or on selection.
function drawCard(article, tmpl, meta){
  var size = 1080;
  var canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  var ctx = canvas.getContext("2d");

  ctx.fillStyle = tmpl.bg;
  ctx.fillRect(0,0,size,size);

  ctx.fillStyle = tmpl.accent;
  ctx.fillRect(0,0,size,10);

  ctx.fillStyle = tmpl.fg;
  ctx.font = "700 34px Arial";
  ctx.fillText("Breakout Pro", 60, 100);

  if(tmpl.id=="red"){
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 26px Arial";
    ctx.fillText("BREAKING", 60, 150);
  }

  ctx.fillStyle = tmpl.fg;
  ctx.font = "700 52px Arial";
  var lines = wrapText(ctx, article.title, size-120);
  var startY = 320;
  lines.slice(0,6).forEach(function(line,i){
    ctx.fillText(line, 60, startY + i*64);
  });

  var badgeY = startY + lines.slice(0,6).length*64 + 60;
  var sc = SENTIMENT_COLOR[meta.sentiment] || T2;
  ctx.fillStyle = sc;
  ctx.font = "700 30px Arial";
  ctx.fillText(meta.sentiment.toUpperCase(), 60, badgeY);
  ctx.fillStyle = tmpl.accent;
  ctx.fillText(("Impact: "+meta.impact).toUpperCase(), 60, badgeY+44);

  ctx.fillStyle = tmpl.fg;
  ctx.globalAlpha = 0.6;
  ctx.font = "400 22px Arial";
  ctx.fillText(article.source+" | "+article.time, 60, size-140);
  ctx.font = "400 18px Arial";
  ctx.fillText("Educational Market Observation Only. Not Investment Advice.", 60, size-90);
  ctx.globalAlpha = 1;

  return canvas;
}

function canvasToBlob(canvas){
  return new Promise(function(resolve){
    canvas.toBlob(function(blob){ resolve(blob); }, "image/png");
  });
}

export default function NewsStudio(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, BLUE=theme.c.blue, T3 = theme.c.text3; T1=theme.c.text1;

  var news = props.news || [];
  var onBack = props.onBack || function(){};
  var [selected, setSelected] = useState(null);
  var [tmplId, setTmplId] = useState("dark");
  var [metaCache, setMetaCache] = useState({}); // keyed by article link/title - avoids re-calling AI
  var [analyzing, setAnalyzing] = useState(false);
  var [busy, setBusy] = useState(false); // image generation in progress
  var [shareMsg, setShareMsg] = useState("");
  var canvasRef = useRef(null);

  function keyOf(a){ return a.link || a.title; }

  function selectArticle(a){
    setSelected(a);
    setShareMsg("");
    var k = keyOf(a);
    if(metaCache[k]) return; // already classified this session, no re-call
    setAnalyzing(true);
    classifyArticle(a).then(function(meta){
      setMetaCache(function(prev){
        var next = {}; for(var p in prev) next[p]=prev[p];
        next[k] = meta;
        return next;
      });
      setAnalyzing(false);
    });
  }

  var tmpl = TEMPLATES.filter(function(t){ return t.id==tmplId; })[0] || TEMPLATES[0];
  var meta = selected ? (metaCache[keyOf(selected)] || {sentiment:"Uncertain",impact:"Company",confidence:0}) : null;

  function makeBlob(){
    var canvas = drawCard(selected, tmpl, meta);
    return canvasToBlob(canvas);
  }

  function onDownload(){
    if(!selected || busy) return;
    setBusy(true);
    makeBlob().then(function(blob){
      setBusy(false);
      if(!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "breakoutpro-news-card.png";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
    });
  }

  function onShare(){
    if(!selected || busy) return;
    setBusy(true);
    makeBlob().then(function(blob){
      setBusy(false);
      if(!blob) return;
      var file = null;
      try{ file = new File([blob],"breakoutpro-news-card.png",{type:"image/png"}); }catch(e){ file = null; }
      if(file && navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
        navigator.share({files:[file], title:"Breakout Pro", text:selected.title}).catch(function(){});
      } else {
        // Honest fallback - Web Share (with files) isn't available on this
        // browser/device. We do not fake per-app targeting; the card is
        // downloaded instead so the user can share it manually.
        setShareMsg("Direct share isn't supported on this browser. Card downloaded instead - share it manually to Instagram, WhatsApp, X, or Telegram.");
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = "breakoutpro-news-card.png";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      }
    });
  }

  if(selected){
    return (
      <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
        <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={function(){setSelected(null);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>News Card Studio</div>
        </div>

        <div style={{padding:16}}>
          <div style={{fontSize:14,fontWeight:700,color:T1,lineHeight:1.5,marginBottom:8}}>{selected.title}</div>
          <div style={{fontSize:12,color:T2,marginBottom:16}}>{selected.source} &#8226; {selected.time}</div>

          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            {analyzing ? (
              <span style={{fontSize:12,color:T2}}>Analyzing with AI...</span>
            ) : (
              <span>
                <span style={{fontSize:12,fontWeight:800,color:SENTIMENT_COLOR[meta.sentiment]}}>{meta.sentiment}</span>
                <span style={{fontSize:12,color:T2}}> &#8226; Impact: {meta.impact}</span>
              </span>
            )}
          </div>

          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>TEMPLATE</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {TEMPLATES.map(function(t){
              var act = t.id==tmplId;
              return (
                <button key={t.id} onClick={function(){setTmplId(t.id);}} style={{background:t.bg,border:"2px solid "+(act?t.accent:BD),borderRadius:10,padding:"12px 16px",color:t.fg,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{t.label}</button>
              );
            })}
          </div>

          {/* Lightweight DOM preview - the real PNG is only generated on tap */}
          <div style={{background:tmpl.bg,border:"1px solid "+BD,borderRadius:14,padding:24,marginBottom:16,minHeight:180}}>
            <div style={{width:40,height:4,background:tmpl.accent,marginBottom:12}}></div>
            <div style={{fontSize:12,fontWeight:800,color:tmpl.fg,marginBottom:8}}>Breakout Pro{tmplId=="red"?" - BREAKING":""}</div>
            <div style={{fontSize:16,fontWeight:700,color:tmpl.fg,lineHeight:1.4,marginBottom:12}}>{selected.title}</div>
            <div style={{fontSize:12,fontWeight:700,color:SENTIMENT_COLOR[meta.sentiment]}}>{meta.sentiment.toUpperCase()}</div>
            <div style={{fontSize:12,color:tmpl.fg,opacity:0.6,marginTop:12}}>Educational Market Observation Only. Not Investment Advice.</div>
          </div>

          <div style={{display:"flex",gap:12,marginBottom:12}}>
            <button onClick={onDownload} disabled={busy} style={{flex:1,background:"rgba(59,130,246,0.15)",border:"1px solid "+BLUE,borderRadius:10,padding:12,color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{busy?"Generating...":"Download PNG"}</button>
            <button onClick={onShare} disabled={busy} style={{flex:1,background:"rgba(34,197,94,0.15)",border:"1px solid "+G,borderRadius:10,padding:12,color:G,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{busy?"Generating...":"Share"}</button>
          </div>
          <div style={{fontSize:12,color:T3,textAlign:"center",marginBottom:12}}>Share opens your device's share sheet (Instagram, WhatsApp, X, Telegram - whichever apps you have installed).</div>
          {shareMsg ? <div style={{fontSize:12,color:BLUE,textAlign:"center"}}>{shareMsg}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>AI News Studio</div>
          <div style={{fontSize:12,color:T2}}>Pick a real headline to create a shareable card</div>
        </div>
      </div>
      <div style={{padding:16}}>
        {news.length==0 ? (
          <div style={{fontSize:12,color:T2,textAlign:"center",padding:32}}>Loading news...</div>
        ) : news.map(function(a,i){
          return (
            <div key={i} onClick={function(){selectArticle(a);}} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:8,cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:700,color:T1,lineHeight:1.4,marginBottom:4}}>{a.title}</div>
              <div style={{fontSize:12,color:T2}}>{a.source} &#8226; {a.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
