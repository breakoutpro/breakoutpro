import { useState } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var GOLD = "#F59E0B";
var R = "#EF4444";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

function shareNews(n, isAdmin) {
  if (!isAdmin) return;
  var text = "MARKET NEWS\n\n" + n.title + "\n\nSource: " + n.source + "\n\nRead more at BreakoutPro: https://breakoutpro.in\n\n#MarketNews #NSE #BSE #IndianMarkets #StockMarket";
  if (navigator.share) {
    navigator.share({title: "BreakoutPro Market Alert", text: text, url: "https://breakoutpro.in"});
  } else {
    window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text));
  }
}

export default function NewsScreen(props) {
  var allNews = props.news || [];
  var overnightNews = props.overnightNews || [];
  var isAdmin = props.isAdmin || false;
  var setTab = props.setTab;
  var [shareId, setShareId] = useState(null);
  var [filter, setFilter] = useState("all");

  var nowHour = new Date().getHours();
  var showOvernightToggle = nowHour < 9 && overnightNews.length > 0;
  var news = filter=="overnight" ? overnightNews : filter=="good" ? allNews.filter(function(n){return n.sentiment=="good";}) : filter=="bad" ? allNews.filter(function(n){return n.sentiment=="bad";}) : allNews;

  function doShare(n, platform) {
    var text = "MARKET UPDATE\n\n" + n.title + "\n\nSource: " + (n.source||"ET Markets") + "\n\nFor live alerts: https://breakoutpro.in\n\n#MarketNews #NSE #StockMarket #IndianMarkets";
    if (platform=="whatsapp") window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text));
    else if (platform=="telegram") window.open("https://t.me/share/url?url=https://breakoutpro.in&text=" + encodeURIComponent(text));
    else if (platform=="twitter") window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text.slice(0,240)));
    else {
      try{navigator.clipboard.writeText(text);}catch(e){}
    }
    setShareId(null);
  }

  return (
    <div style={{background:DB, minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB, padding:"14px 14px", borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <div style={{fontSize:16, fontWeight:900, color:T1}}>Market <span style={{color:G}}>News</span></div>
            <div style={{fontSize:8, color:T2}}>Live ET Markets feed</div>
          </div>
          {isAdmin?(
            <div style={{display:"flex", gap:6}}>
              <button onClick={function(){setTab&&setTab("share");}} style={{background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:20,padding:"5px 12px",color:GOLD,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Create Post</button>
            </div>
          ):null}
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>

        {/* Filters */}
        <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto"}}>
          {[["all","All News"],["good","Good News"],["bad","Bad News"]].concat(showOvernightToggle?[["overnight","Overnight"]]:[]).map(function(f){
            var act = filter==f[0];
            var col = f[0]=="good"?G2:f[0]=="bad"?R:f[0]=="overnight"?GOLD:G2;
            return <button key={f[0]} onClick={function(){setFilter(f[0]);}} style={{flexShrink:0,background:act?col+"18":"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:BD),borderRadius:20,padding:"6px 12px",color:act?col:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>;
          })}
        </div>

        {news.length==0?(
          <div style={{textAlign:"center", padding:"40px 0"}}>
            <div style={{fontSize:30, marginBottom:10}}>&#128240;</div>
            <div style={{fontSize:13, fontWeight:700, color:T1, marginBottom:4}}>Loading News...</div>
            <div style={{fontSize:10, color:T2}}>ET Markets live feed</div>
          </div>
        ):null}

        {news.map(function(n, i) {
          var isShareOpen = shareId==i;
          return (
            <div key={i} style={{background:CB, border:"1px solid "+BD, borderRadius:14, marginBottom:10, overflow:"hidden"}}>

              {/* News card */}
              <div style={{padding:"14px 14px 10px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                      {n.sentiment=="good"?<span style={{fontSize:7,fontWeight:700,color:G2,background:"rgba(0,200,83,0.15)",borderRadius:6,padding:"2px 7px"}}>Good News</span>:null}
                      {n.sentiment=="bad"?<span style={{fontSize:7,fontWeight:700,color:R,background:"rgba(239,68,68,0.15)",borderRadius:6,padding:"2px 7px"}}>Bad News</span>:null}
                      {n.stock?<span style={{fontSize:7,fontWeight:700,color:GOLD,background:"rgba(245,158,11,0.15)",borderRadius:6,padding:"2px 7px"}}>{n.stock}</span>:null}
                    </div>
                    <div style={{fontSize:12, fontWeight:700, color:T1, lineHeight:1.5, marginBottom:6}}>{n.title}</div>
                    <div style={{display:"flex", gap:8, alignItems:"center"}}>
                      <span style={{fontSize:8, color:G2, fontWeight:600, background:"rgba(0,200,83,0.1)", borderRadius:10, padding:"1px 7px"}}>{n.source||"ET Markets"}</span>
                      {n.pubDate?<span style={{fontSize:8, color:T2}}>{n.pubDate}</span>:null}
                    </div>
                  </div>
                  {/* Share button - Admin only */}
                  {isAdmin?(
                    <button onClick={function(){setShareId(isShareOpen?null:i);}} style={{background:isShareOpen?"rgba(0,200,83,0.2)":"rgba(255,255,255,0.06)",border:"1px solid "+(isShareOpen?G:BD),borderRadius:8,padding:"6px 8px",cursor:"pointer",flexShrink:0,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:12}}>&#8679;</span>
                      <span style={{fontSize:8,fontWeight:700,color:isShareOpen?G2:T2}}>Share</span>
                    </button>
                  ):null}
                </div>
              </div>

              {/* Share panel - opens when share tapped */}
              {isShareOpen&&isAdmin?(
                <div style={{background:"rgba(0,200,83,0.06)",borderTop:"1px solid rgba(0,200,83,0.15)",padding:"10px 14px"}}>
                  <div style={{fontSize:9,fontWeight:700,color:G2,marginBottom:8}}>Share this news</div>
                  <div style={{display:"flex",gap:6}}>
                    {[["W","WhatsApp","#25D366","whatsapp"],["TG","Telegram","#229ED9","telegram"],["X","Twitter","#1DA1F2","twitter"],["CP","Copy","#F59E0B","copy"]].map(function(p){
                      return (
                        <button key={p[0]} onClick={function(){doShare(n,p[3]);}} style={{flex:1,background:p[2]+"18",border:"1px solid "+p[2]+"44",borderRadius:8,padding:"7px 4px",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                          <div style={{width:22,height:22,borderRadius:5,background:p[2],display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 3px"}}><span style={{fontSize:8,fontWeight:900,color:"#fff"}}>{p[0]}</span></div>
                          <div style={{fontSize:7,color:p[2],fontWeight:600}}>{p[1]}</div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Read more */}
                  {n.link?(
                    <button onClick={function(){window.open(n.link);}} style={{width:"100%",marginTop:8,background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:8,padding:"7px",color:T2,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Read Full Article </button>
                  ):null}
                </div>
              ):null}

            </div>
          );
        })}

      </div>
    </div>
  );
}
