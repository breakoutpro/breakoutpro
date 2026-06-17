import { useState } from "react";

var CARD="#0D1B2A",BD="#203A5A";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var PURPLE="#8B5CF6",PURPLE2="#A78BFA";
var GOLD="#F5B942";
var UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#C9D4E5",T3="#8A9BB5";

export default function AIPulseCard(props){
  var session = props.session || "live";
  var mood = props.mood || {bull:68,fg:"Greed",conf:84};
  var setTab = props.setTab || function(){};

  var CONFIG={
    morning:{
      icon:"&#127749;",title:"Morning Pulse",sub:"Overnight global summary + today's plan",
      btn:"Get Morning Briefing",btnAction:"morning",
      rows:[
        ["Gift Nifty","24,035 (+65)",UP],
        ["Dow Jones","42,750 (+234)",UP],
        ["Nasdaq","18,920 (+87)",UP],
        ["Crude Oil","$82.4 (-0.3%)",DOWN],
        ["Gold","$2,312 (+0.2%)",UP],
        ["Top Stock to Watch","RELIANCE",BLUE2],
      ],
    },
    live:{
      icon:"&#9889;",title:"One Tap Market",sub:"Full market read in under 20 seconds",
      btn:"Explain Today's Market",btnAction:"briefing",
      rows:[
        ["Market Mood",(mood.bull>=50?"Bullish ":"Bearish ")+Math.round(mood.bull)+"%",mood.bull>=50?UP:DOWN],
        ["AI Confidence",mood.conf+"%",PURPLE2],
        ["Fear and Greed",mood.fg,mood.fg=="Greed"?UP:DOWN],
        ["Best Sector","Banking",UP],
        ["Top Stock","ICICIBANK",BLUE2],
        ["Nifty Support","23,850",UP],
        ["Nifty Resistance","24,050",DOWN],
        ["FII / DII","FII +Rs2,847Cr",UP],
        ["Biggest Risk","Auto sector weak",DOWN],
      ],
    },
    closing:{
      icon:"&#128202;",title:"Closing Pulse",sub:"Today's wrap + tomorrow watchlist",
      btn:"Closing Report",btnAction:"morning",
      rows:[
        ["Nifty Close","23,969 (+1.47%)",UP],
        ["Top Gainer","ADANIENT +4.21%",UP],
        ["Top Loser","WIPRO -2.14%",DOWN],
        ["Sector Winner","IT",UP],
        ["Sector Loser","Realty",DOWN],
        ["Tomorrow Watch","HDFCBANK",BLUE2],
      ],
    },
    mcx:{
      icon:"&#128674;",title:"Commodity Pulse",sub:"MCX session - Gold, Crude, Silver strategy",
      btn:"Commodity Briefing",btnAction:"commodity",
      rows:[
        ["Gold","Rs71,245 (+0.45%)",UP],
        ["Silver","Rs87,654 (+0.82%)",UP],
        ["Crude Oil","Rs6,823 (-0.34%)",DOWN],
        ["Natural Gas","Rs243 (+1.20%)",UP],
        ["Commodity Mood","Bullish",UP],
        ["Support / Resistance","71,100 / 71,650",GOLD],
      ],
    },
    global:{
      icon:"&#127760;",title:"Global Pulse",sub:"Overnight global markets + tomorrow outlook",
      btn:"Global Summary",btnAction:"global",
      rows:[
        ["Dow Jones","42,750 (+234)",UP],
        ["Nasdaq","18,920 (+87)",UP],
        ["S&P 500","5,820 (+0.4%)",UP],
        ["Dollar Index","104.2 (-0.1%)",DOWN],
        ["Crude Oil","$82.4 (-0.3%)",DOWN],
        ["Gold","$2,312 (+0.2%)",UP],
      ],
    },
  };

  var cfg = CONFIG[session] || CONFIG.live;

  return (
    <div style={{background:"linear-gradient(135deg,"+CARD+",#0A1525)",border:"1px solid "+BD,borderRadius:18,overflow:"hidden",marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>

      <div style={{padding:"14px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:15}} dangerouslySetInnerHTML={{__html:cfg.icon}}></span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:T1}}>{cfg.title}</div>
          <div style={{fontSize:8,color:T3}}>{cfg.sub}</div>
        </div>
      </div>

      <div style={{padding:"12px 16px"}}>
        {cfg.rows.map(function(r,i){
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<cfg.rows.length-1?"1px solid "+BD:"none"}}>
              <span style={{fontSize:10,color:T2}}>{r[0]}</span>
              <span style={{fontSize:11,fontWeight:700,color:r[2]}}>{r[1]}</span>
            </div>
          );
        })}

        <button onClick={function(){setTab(cfg.btnAction);}} style={{width:"100%",marginTop:14,background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{cfg.btn}</button>
      </div>
    </div>
  );
}
