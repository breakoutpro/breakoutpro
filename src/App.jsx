import { useState, useEffect } from "react";

// OWNER: M SURESH | breakoutproofficial@gmail.com | ALL RIGHTS RESERVED 2025
const AP = "8790124010";
const AE = "breakoutproofficial@gmail.com";
const AW = "Suresh@2025";
const APP_LINK = "https://breakoutpro.in";
const DISCLAIMER = "BREAKOUT PRO is for EDUCATIONAL PURPOSES ONLY. We are NOT a SEBI Registered Investment Advisor. All content is for learning only. Do NOT invest based on this app. Consult a SEBI registered advisor.";

const TERMS = [
  {t:"1. Educational Purpose",b:"BREAKOUT PRO is for educational purposes only. NOT a trading platform."},
  {t:"2. Not SEBI Registered",b:"We are NOT SEBI registered Investment Advisors. Education platform only."},
  {t:"3. No Investment Advice",b:"We do NOT recommend buying/selling any stock. Data is for learning."},
  {t:"4. Educational Data",b:"Prices, alerts, news for educational reference only. May be delayed."},
  {t:"5. User Responsibility",b:"You use this app at your own risk for learning only."},
  {t:"6. Privacy",b:"Phone used for OTP only. Data not shared or sold."},
  {t:"7. Subscription",b:"Premium for educational content. Non-refundable after activation."},
  {t:"8. Risk Warning",b:"Stock market has risks. Options can result in total loss."},
  {t:"9. Governing Law",b:"Indian law applies. Hyderabad jurisdiction."},
];

const LANGS={en:"English",hi:"Hindi"};

const CANDLES = [{lbl:"1m",sec:60},{lbl:"3m",sec:180},{lbl:"5m",sec:300},{lbl:"10m",sec:600},{lbl:"15m",sec:900},{lbl:"30m",sec:1800},{lbl:"1h",sec:3600}];

const STOCKS = [
  {sym:"RELIANCE",name:"Reliance Industries",ltp:2845.60,open:2798,high:2867,low:2790,vol:"4.2Cr",cap:"19.2L Cr",pe:28.4,sup:2780,res:2920,sect:"Energy",trend:"bull",wk52h:3024,wk52l:2220,cat:"large",qtr:{rev:"2,23,450 Cr",pft:"17,394 Cr",yoy:"+9.2%",qoq:"+3.1%",dt:"Jan 25"},news:["Jio 5G crosses 12 Cr","Saudi Aramco deal","Retail expansion"]},
  {sym:"TCS",name:"Tata Consultancy",ltp:4208.65,open:4120,high:4230,low:4105,vol:"82L",cap:"15.3L Cr",pe:32.1,sup:4050,res:4300,sect:"IT",trend:"bull",wk52h:4592,wk52l:3450,cat:"large",qtr:{rev:"61,237 Cr",pft:"12,380 Cr",yoy:"+8.4%",qoq:"+2.7%",dt:"Jan 25"},news:["UK govt deal","Q3 beats","Buyback"]},
  {sym:"INFY",name:"Infosys",ltp:1586.80,open:1560,high:1598,low:1552,vol:"1.1Cr",cap:"6.6L Cr",pe:26.8,sup:1520,res:1640,sect:"IT",trend:"bull",wk52h:1974,wk52l:1307,cat:"large",qtr:{rev:"40,986 Cr",pft:"7,276 Cr",yoy:"+7.1%",qoq:"+1.9%",dt:"Jan 25"},news:["Raises guidance","Topaz AI 200 clients","Tax refund"]},
  {sym:"HDFCBANK",name:"HDFC Bank",ltp:1623.45,open:1602,high:1638,low:1595,vol:"2.3Cr",cap:"12.3L Cr",pe:19.2,sup:1580,res:1680,sect:"Bank",trend:"bull",wk52h:1794,wk52l:1363,cat:"large",qtr:{rev:"91,445 Cr",pft:"17,258 Cr",yoy:"+12.8%",qoq:"+3.5%",dt:"Jan 25"},news:["NIM 3.5%","Cards +22%","200 branches"]},
  {sym:"ICICIBANK",name:"ICICI Bank",ltp:1082.30,open:1072,high:1095,low:1068,vol:"1.8Cr",cap:"7.6L Cr",pe:17.4,sup:1040,res:1120,sect:"Bank",trend:"bull",wk52h:1196,wk52l:872,cat:"large",qtr:{rev:"46,282 Cr",pft:"11,792 Cr",yoy:"+14.8%",qoq:"+2.8%",dt:"Jan 25"},news:["PAT +15%","New card","MCLR cut"]},
  {sym:"SBIN",name:"State Bank India",ltp:812.40,open:798,high:818,low:793,vol:"3.1Cr",cap:"7.2L Cr",pe:11.8,sup:780,res:840,sect:"Bank",trend:"bull",wk52h:912,wk52l:543,cat:"large",qtr:{rev:"1,14,220 Cr",pft:"18,331 Cr",yoy:"+18.4%",qoq:"+4.2%",dt:"Nov 24"},news:["Record profit","YONO 2.0","Fund raise"]},
  {sym:"TATAMOTORS",name:"Tata Motors",ltp:954.75,open:940,high:962,low:935,vol:"2.8Cr",cap:"3.6L Cr",pe:8.9,sup:920,res:990,sect:"Auto",trend:"bull",wk52h:1179,wk52l:644,cat:"large",qtr:{rev:"1,13,575 Cr",pft:"7,451 Cr",yoy:"+22.1%",qoq:"+6.3%",dt:"Nov 24"},news:["JLR record","EV 70%","Nexon EV Max"]},
  {sym:"WIPRO",name:"Wipro",ltp:462.10,open:466,high:470,low:458,vol:"62L",cap:"2.4L Cr",pe:22.1,sup:445,res:480,sect:"IT",trend:"bear",wk52h:578,wk52l:376,cat:"mid",qtr:{rev:"22,302 Cr",pft:"3,354 Cr",yoy:"-1.2%",qoq:"-0.8%",dt:"Jan 25"},news:["Q3 miss","Slowdown warning","4 unit restructure"]},
  {sym:"BAJFINANCE",name:"Bajaj Finance",ltp:6840.50,open:6920,high:6945,low:6810,vol:"38L",cap:"4.2L Cr",pe:34.2,sup:6640,res:7050,sect:"NBFC",trend:"bear",wk52h:8192,wk52l:6003,cat:"large",qtr:{rev:"14,451 Cr",pft:"4,308 Cr",yoy:"+15.6%",qoq:"+2.1%",dt:"Jan 25"},news:["AUM 3.5L Cr","RBI restrictions lifted","QIP plan"]},
  {sym:"TATASTEEL",name:"Tata Steel",ltp:158.40,open:154,high:160,low:152,vol:"8.2Cr",cap:"1.98L Cr",pe:12.4,sup:148,res:168,sect:"Metal",trend:"bull",wk52h:184,wk52l:108,cat:"mid",qtr:{rev:"56,878 Cr",pft:"522 Cr",yoy:"+8.2%",qoq:"+15.4%",dt:"Nov 24"},news:["UK profitable","Capex approved","Prices recover"]},
  {sym:"POWERGRID",name:"Power Grid",ltp:328.60,open:320,high:331,low:318,vol:"3.4Cr",cap:"3.06L Cr",pe:18.2,sup:312,res:344,sect:"Power",trend:"bull",wk52h:366,wk52l:207,cat:"mid",qtr:{rev:"11,754 Cr",pft:"3,940 Cr",yoy:"+6.8%",qoq:"+2.1%",dt:"Nov 24"},news:["8000 Cr project","Dividend","Demand +12%"]},
  {sym:"SUNPHARMA",name:"Sun Pharma",ltp:1562.30,open:1554,high:1578,low:1548,vol:"45L",cap:"3.7L Cr",pe:38.6,sup:1490,res:1630,sect:"Pharma",trend:"neu",wk52h:1960,wk52l:1125,cat:"mid",qtr:{rev:"13,282 Cr",pft:"2,807 Cr",yoy:"+10.4%",qoq:"+1.8%",dt:"Nov 24"},news:["US +18%","USFDA nod","Israeli buy"]},
];

const MCX_DATA = [
  {sym:"GOLD",name:"Gold (10gm)",ltp:72850,open:72500,chgPct:0.48,unit:"per 10gm",expiry:"Jun 2025"},
  {sym:"SILVER",name:"Silver (1kg)",ltp:89200,open:88600,chgPct:0.68,unit:"per kg",expiry:"Jun 2025"},
  {sym:"CRUDEOIL",name:"Crude Oil",ltp:6420,open:6380,chgPct:0.63,unit:"per bbl",expiry:"May 2025"},
  {sym:"NATURALGAS",name:"Natural Gas",ltp:198,open:202,chgPct:-1.98,unit:"per mmBtu",expiry:"May 2025"},
  {sym:"COPPER",name:"Copper",ltp:812,open:808,chgPct:0.50,unit:"per kg",expiry:"Jun 2025"},
  {sym:"ZINC",name:"Zinc",ltp:248,open:245,chgPct:1.22,unit:"per kg",expiry:"May 2025"},
];

const LARGE_SYMS=["RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","BAJFINANCE","TATAMOTORS"];
const MID_SYMS=["TATASTEEL","POWERGRID","SUNPHARMA","WIPRO"];

const OI_NIFTY=[22000,22200,22400,22500,22600,22800,23000].map(function(s){var d=Math.abs(s-22500),atm=d===0,nr=d<=200;return{s:s,atm:atm,ceOI:Math.floor(atm?14480000:nr?7e6+Math.random()*4e6:2e6+Math.random()*3e6),peOI:Math.floor(atm?11840000:nr?6e6+Math.random()*4e6:1.5e6+Math.random()*2.5e6),ceChg:parseFloat((Math.random()*40-8).toFixed(1)),peChg:parseFloat((Math.random()*40-8).toFixed(1)),cePrem:parseFloat((Math.max(5,Math.random()*80+20)).toFixed(0)),pePrem:parseFloat((Math.max(5,Math.random()*80+20)).toFixed(0)),ceIV:parseFloat((11+d/200*2).toFixed(1)),peIV:parseFloat((12+d/200*2).toFixed(1)),ceDelta:0.5,peDelta:-0.5,ceTheta:-0.12,peTheta:-0.10};});
const OI_BNIFTY=[47800,48000,48200,48500,49000].map(function(s){var d=Math.abs(s-48200),atm=d===0,nr=d<=300;return{s:s,atm:atm,ceOI:Math.floor(atm?12e6:nr?6e6+Math.random()*4e6:1.5e6+Math.random()*2e6),peOI:Math.floor(atm?10e6:nr?5e6+Math.random()*4e6:1.2e6+Math.random()*2e6),ceChg:parseFloat((Math.random()*40-8).toFixed(1)),peChg:parseFloat((Math.random()*40-8).toFixed(1)),cePrem:parseFloat((Math.max(5,Math.random()*120+30)).toFixed(0)),pePrem:parseFloat((Math.max(5,Math.random()*120+30)).toFixed(0)),ceIV:13,peIV:14,ceDelta:0.5,peDelta:-0.5,ceTheta:-0.15,peTheta:-0.12};});

const NEWS=[
  {id:1,cat:"Market",title:"NIFTY crosses 25,400 - Lifetime High",body:"Sensex surges 1,439 pts. FIIs net buyers Rs.10,245 Cr.",time:"15:30",notif:true},
  {id:2,cat:"RBI",title:"RBI cuts repo rate by 25 bps to 6.25%",body:"First cut in 24 months. Governor signals more easing ahead.",time:"10:00",notif:true},
  {id:3,cat:"Results",title:"TCS Q1 FY27: PAT Rs.13,450 Cr up 9.2% YoY",body:"Revenue Rs.65,890 Cr beats estimates. Strong BFSI deals.",time:"17:30",notif:true},
  {id:4,cat:"Results",title:"HDFC Bank Q4: Profit Rs.18,524 Cr - Strong",body:"NII up 12%. NIM at 3.6%. Asset quality improves further.",time:"16:00",notif:true},
  {id:5,cat:"Breakout",title:"RELIANCE breaks above Rs.3,200 resistance",body:"Volume 2.8x average. Bullish flag breakout. Educational.",time:"11:42",notif:true},
  {id:6,cat:"Economy",title:"India GDP at 7.8% in Q4 FY26",body:"Beats estimates of 7.5%. Manufacturing PMI at 58.9.",time:"14:30",notif:false},
  {id:7,cat:"Commodity",title:"Gold crosses Rs.78,500 - All-time High",body:"MCX Gold +1.2%. Silver also surges to Rs.95,000/kg.",time:"11:15",notif:false},
  {id:8,cat:"Auto",title:"India EV sales cross 2 lakh in May 2026",body:"Tata Nexon EV leads. Mahindra XEV 9e bookings open.",time:"13:30",notif:false},
  {id:9,cat:"Results",title:"SBI Q4 FY26: Record Profit Rs.21,250 Cr",body:"All-time high quarterly profit. NPA at fresh low 0.41%.",time:"16:30",notif:true},
  {id:10,cat:"SEBI",title:"SEBI launches T+0 settlement for top 500 stocks",body:"Same-day settlement now mandatory. Reduces risk.",time:"09:15",notif:true},
  {id:11,cat:"Global",title:"US Fed holds rates steady at 4.50-4.75%",body:"Two cuts expected in 2026. Dollar Index at 102.50.",time:"23:00",notif:true},
  {id:12,cat:"IPO",title:"HDB Financial IPO opens June 12 - Rs.12,500 Cr",body:"HDFC Banks subsidiary. Price band Rs.700-740.",time:"08:00",notif:true},
  {id:13,cat:"Market",title:"FII inflow Rs.45,000 Cr in May 2026",body:"Highest monthly inflow in 18 months. DIIs also strong.",time:"18:00",notif:false},
];

const IPO_DATA = [
  {name:"Hexaware Tech",sym:"HEXAWARE",sector:"IT Services",open:"Feb 12 2025",close:"Feb 14 2025",listing:"Feb 19 2025",priceBand:"Rs.674-708",lotSize:21,minInvest:"Rs.14,868",issueSize:"Rs.8,750 Cr",grade:"A",rating:8.5,verdict:"GOOD",pros:["Strong promoter - Carlyle","FY24 revenue +27%","Order book Rs.1800 Cr","Top clients - Microsoft, Google","Cloud growing 40% YoY"],cons:["High P/E 39x","IT sector slowdown risk","100% OFS - no fresh capital","US revenue dependency 75%"],fundamentals:{revenue:"Rs.9,824 Cr",profit:"Rs.997 Cr",pe:"39.2",pb:"7.8",roe:"22.4%",debt:"Low"},gmp:"Rs.85 (+12%)"},
  {name:"Dr Agarwals Healthcare",sym:"DRAHL",sector:"Healthcare",open:"Jan 29",close:"Jan 31",listing:"Feb 5",priceBand:"Rs.382-402",lotSize:35,minInvest:"Rs.14,070",issueSize:"Rs.3,027 Cr",grade:"A-",rating:8.0,verdict:"GOOD",pros:["Largest eye care chain","193 facilities","Growing 25% YoY","Africa expansion"],cons:["Very high P/E 130x","Doctor attrition risk","Regulatory risks"],fundamentals:{revenue:"Rs.1,376 Cr",profit:"Rs.95 Cr",pe:"131.5",pb:"22.8",roe:"23.1%",debt:"Moderate"},gmp:"Rs.55 (+13%)"},
  {name:"Stallion India Fluoro",sym:"STALLION",sector:"Chemicals",open:"Jan 16",close:"Jan 20",listing:"Jan 23",priceBand:"Rs.85-90",lotSize:165,minInvest:"Rs.14,850",issueSize:"Rs.199 Cr",grade:"C",rating:5.5,verdict:"RISKY",pros:["Small cap growth","Niche refrigerant gas","Recent capex done"],cons:["Very small size","Volatile raw material","Limited track record","High competition"],fundamentals:{revenue:"Rs.236 Cr",profit:"Rs.14 Cr",pe:"45.2",pb:"6.5",roe:"14.5%",debt:"Moderate"},gmp:"Rs.15 (+17%)"},
];

const FII_DII_DATA = [
  {date:"Today",fii_eq:-2407,dii_eq:1361,fii_fo:-5240,sentiment:"Bearish"},
  {date:"Yesterday",fii_eq:-3842,dii_eq:2855,fii_fo:1240,sentiment:"Bearish"},
  {date:"-2 days",fii_eq:1245,dii_eq:-450,fii_fo:-2150,sentiment:"Mixed"},
  {date:"-3 days",fii_eq:2840,dii_eq:-1200,fii_fo:3450,sentiment:"Bullish"},
  {date:"-4 days",fii_eq:1850,dii_eq:850,fii_fo:-1240,sentiment:"Bullish"},
];

const FII_DII_MONTHLY = {fii_total:-18450,dii_total:12340,fii_trend:"Selling",dii_trend:"Buying",fii_pct:-2.4,dii_pct:1.8};

const FREE_BOOKS=[["Stock Market Basics for Beginners",142],["Candlestick Patterns Complete Guide",98],["Technical Analysis 101",118],["Risk Management Handbook",76],["Intraday Trading Learning Guide",132],["Options Trading for Beginners",156]];
const PREM_BOOKS=[["Advanced Price Action Mastery",248],["OI and Options Chain Study Guide",184],["Breakout Patterns Full Study",196],["Options Selling Deep Dive",168]];
const MF_DATA=[{name:"Mirae Asset Large Cap",cat:"Large Cap",ret1y:18.4,ret3y:14.2,ret5y:16.8,risk:"Low",aum:"37,842 Cr",min:100,rating:5},{name:"Parag Parikh Flexi Cap",cat:"Flexi Cap",ret1y:22.1,ret3y:17.8,ret5y:19.4,risk:"Moderate",aum:"68,245 Cr",min:1000,rating:5},{name:"SBI Small Cap Fund",cat:"Small Cap",ret1y:31.4,ret3y:24.6,ret5y:28.2,risk:"High",aum:"28,456 Cr",min:500,rating:5},{name:"HDFC Mid-Cap Opp.",cat:"Mid Cap",ret1y:28.7,ret3y:21.3,ret5y:24.8,risk:"Moderate",aum:"64,892 Cr",min:100,rating:5},{name:"Axis Bluechip Fund",cat:"Large Cap",ret1y:15.2,ret3y:12.4,ret5y:14.6,risk:"Low",aum:"34,120 Cr",min:100,rating:4},{name:"Kotak ELSS Tax Saver",cat:"ELSS",ret1y:19.6,ret3y:15.8,ret5y:17.4,risk:"Moderate",aum:"18,234 Cr",min:500,rating:4}];
const SUB_PLANS=[["Monthly","Rs299","/month",false,""],["6 Months","Rs799","/6 months",false,"Save 56%"],["Yearly","Rs1299","/year",true,"Save 64%"]];

function rnd(a,b){return parseFloat((Math.random()*(b-a)+a).toFixed(2));}
function sg(){return Math.random()>.5?1:-1;}
function fN(n){return n>=1000?(+n).toLocaleString("en-IN",{maximumFractionDigits:2}):(+n).toFixed(2);}
function fOI(n){return n>=1e7?(n/1e7).toFixed(2)+"Cr":n>=1e5?(n/1e5).toFixed(1)+"L":String(n);}
function nowT(){var d=new Date();return[d.getHours(),d.getMinutes(),d.getSeconds()].map(function(v){return String(v).padStart(2,"0");}).join(":");}
function cLeft(sec){var n=new Date(),s=n.getHours()*3600+n.getMinutes()*60+n.getSeconds();return sec-(s%sec);}
function fmt(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}

function playAlert(){
  try {
    var ctx = new (window.AudioContext||window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(function(){
      var osc2 = ctx.createOscillator();
      var gain2 = ctx.createGain();
      osc2.connect(gain2);gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    },150);
  } catch(e){}
}

var ALERT_TEMPLATES = [
  {type:"BREAKOUT",   stock:"TATASTEEL",  msg:"Resistance Rs.155 broken with high volume!", action:"Bullish",  guidance:"Watch for retest of Rs.155 as support",icon:"^",color:"#39FF14"},
  {type:"BREAKDOWN",  stock:"BAJFINANCE", msg:"Support Rs.6900 broken below!",               action:"Bearish",  guidance:"Avoid longs. Wait for reversal signal",icon:"v",color:"#ff4444"},
  {type:"NEWS IMPACT",stock:"RELIANCE",   msg:"RIL signs Saudi Aramco deal - Big positive!", action:"Bullish",  guidance:"News-based move. Watch volume",       icon:"!",color:"#60a5fa"},
  {type:"PRICE ACTION",stock:"TCS",       msg:"Bullish engulfing on 15m chart",             action:"Bullish",  guidance:"Strong reversal pattern. SL Rs.4100",  icon:"*",color:"#39FF14"},
  {type:"BREAKOUT",   stock:"HDFCBANK",   msg:"Cup and handle breakout above Rs.1640",      action:"Bullish",  guidance:"Target Rs.1720, SL Rs.1610",            icon:"^",color:"#39FF14"},
  {type:"BREAKDOWN",  stock:"WIPRO",      msg:"Head & shoulders neckline broken",            action:"Bearish",  guidance:"Target Rs.440, avoid catching falling knife",icon:"v",color:"#ff4444"},
  {type:"NEWS IMPACT",stock:"SBIN",       msg:"Q2 record profit Rs.18,331 Cr - positive",   action:"Bullish",  guidance:"Earnings beat. Wait for pullback entry",icon:"!",color:"#60a5fa"},
  {type:"PRICE ACTION",stock:"INFY",      msg:"Hammer at support Rs.1580",                   action:"Bullish",  guidance:"Strong bullish reversal at support",  icon:"*",color:"#39FF14"},
];

function getMarketStatus(){
  var d=new Date(),h=d.getHours(),m=d.getMinutes(),day=d.getDay(),mn=d.getMonth()+1,dt=d.getDate();
  var isHol=(day===0||day===6)||(mn===5&&dt===28)||(mn===6&&dt===26);
  var totalMin=h*60+m;
  var stockOpen=totalMin>=555&&totalMin<930;  // 9:15 to 15:30
  var mcxMorn=totalMin>=540&&totalMin<1020;   // 9:00 to 17:00
  var mcxEvening=totalMin>=1020&&totalMin<1435; // 17:00 to 23:55
  if(isHol){return {session:"holiday",label:"Market Holiday",color:"#f59e0b",sub:"NSE/BSE closed. MCX evening 5PM-11:30PM open"};}
  if(stockOpen){return {session:"stocks",label:"Stocks Open",color:"#39FF14",sub:"NSE/BSE Live | 9:15 AM - 3:30 PM"};}
  if(mcxEvening){return {session:"mcx",label:"MCX Evening Open",color:"#f59e0b",sub:"Commodity market live | 5:00 PM - 11:30 PM"};}
  if(totalMin<555){return {session:"gift",label:"Pre-Market",color:"#60a5fa",sub:"Gift Nifty live | NSE opens at 9:15 AM"};}
  return {session:"closed",label:"Markets Closed",color:"#445",sub:"NSE/BSE closed. MCX opens at 5:00 PM"};
}

function LogoSVG(props){
  var size=props.size||1;
  return(
    <div style={{textAlign:"center",userSelect:"none",padding:Math.round(8*size)+"px 0"}}>
      <div style={{fontFamily:"Arial,sans-serif",fontSize:Math.round(36*size),fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1}}>
        Breakout<span style={{color:"#39FF14"}}> Pro</span>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:6}}>
        <div style={{height:2,width:30,background:"#ff4400"}}></div>
        <div style={{fontSize:Math.round(8*size),fontWeight:900,letterSpacing:2.5,color:"#ff4400"}}>CATCH EVERY BREAKOUT</div>
        <div style={{height:2,width:30,background:"#ff4400"}}></div>
      </div>
      {size>=0.7&&<div style={{fontSize:Math.round(9*size),color:"#39FF1466",fontStyle:"italic",marginTop:4}}>India's #1 Breakout Alerts App</div>}
    </div>
  );
}

function Spark(props){
  var d=props.data,c=props.color,h=props.h||30,w=props.w||76;
  if(!d||d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rng=mx-mn||1;
  var pts=d.map(function(v,i){return((i/(d.length-1))*w)+","+(h-((v-mn)/rng)*(h-4)+2);}).join(" ");
  return(<svg width={w} height={h}><polyline points={pts} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round"/></svg>);
}

function CandleTimerInline(){
  const [times,setTimes]=useState({});
  const [sel,setSel]=useState("5m");
  useEffect(function(){
    function up(){var t={};CANDLES.forEach(function(c){t[c.lbl]=cLeft(c.sec);});setTimes(t);}
    up();var id=setInterval(up,1000);return function(){clearInterval(id);};
  },[]);
  function col(s,t){return s/t>.5?"#39FF14":s/t>.25?"#f59e0b":"#ff4444";}
  var left=times[sel]||300,tot=CANDLES.find(function(c){return c.lbl===sel;})||{sec:300},pct=left/tot.sec,clr=col(left,tot.sec);
  var ca=(function(){var n=new Date(),l=times[sel]||0,cl=new Date(n.getTime()+l*1000);return[cl.getHours(),cl.getMinutes(),cl.getSeconds()].map(function(v){return String(v).padStart(2,"0");}).join(":");})();
  return(
    <div style={{background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:12,padding:"10px 12px",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:9,color:"#334",fontWeight:700}}>CANDLE TIMER</div>
        <div style={{display:"flex",gap:3}}>
          {CANDLES.map(function(c){return(<button key={c.lbl} onClick={function(){setSel(c.lbl);}} style={{background:sel===c.lbl?"#39FF1418":"#111",border:"1px solid "+(sel===c.lbl?"#39FF1444":"#1a1a1a"),borderRadius:5,padding:"2px 5px",color:sel===c.lbl?"#39FF14":"#445",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{c.lbl}</button>);})}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}><div style={{height:5,background:"#1a1a1a",borderRadius:3,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:(pct*100)+"%",background:clr,transition:"width 1s linear",borderRadius:3}}></div></div><div style={{fontSize:8,color:"#445"}}>Time left in {sel} candle</div></div>
        <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontSize:22,fontWeight:900,color:clr,lineHeight:1}}>{fmt(left)}</div><div style={{fontSize:8,color:"#445",marginTop:2}}>closes {ca}</div></div>
      </div>
    </div>
  );
}

function OChain(props){
  var data=props.data;
  var mC=Math.max.apply(null,data.map(function(r){return r.ceOI;}));
  var mP=Math.max.apply(null,data.map(function(r){return r.peOI;}));
  return(
    <div>
      <div style={{display:"flex",fontSize:8,color:"#2a2a2a",fontWeight:600,padding:"6px 7px",borderBottom:"1px solid #0c0c0c"}}>
        <span style={{flex:1.2,textAlign:"center"}}>CE OI</span>
        <span style={{flex:0.8,textAlign:"center"}}>CE Rs</span>
        <span style={{flex:0.9,textAlign:"center",color:"#f59e0b"}}>STRIKE</span>
        <span style={{flex:0.8,textAlign:"center"}}>PE Rs</span>
        <span style={{flex:1.2,textAlign:"center"}}>PE OI</span>
      </div>
      {data.map(function(row){
        return (
          <div key={row.s} style={{display:"flex",alignItems:"center",padding:"5px 7px",borderBottom:"1px solid #0b0b0b",background:row.atm?"#f59e0b06":"transparent"}}>
            <div style={{flex:1.2,display:"flex",alignItems:"center",gap:2,flexDirection:"row-reverse"}}>
              <div style={{flex:1,height:3,background:"#111",borderRadius:1,overflow:"hidden"}}>
                <div style={{height:"100%",width:(row.ceOI/mC*100)+"%",background:"#ff444444"}}></div>
              </div>
              <span style={{fontSize:8,color:"#aaa",fontFamily:"monospace",whiteSpace:"nowrap"}}>{fOI(row.ceOI)}</span>
            </div>
            <span style={{flex:0.8,textAlign:"center",fontSize:8,color:"#f59e0b",fontFamily:"monospace"}}>Rs{row.cePrem}</span>
            <span style={{flex:0.9,textAlign:"center",fontSize:10,fontWeight:800,color:row.atm?"#f59e0b":"#ddd",fontFamily:"monospace"}}>{row.s.toLocaleString("en-IN")}</span>
            <span style={{flex:0.8,textAlign:"center",fontSize:8,color:"#39FF14",fontFamily:"monospace"}}>Rs{row.pePrem}</span>
            <div style={{flex:1.2,display:"flex",alignItems:"center",gap:2}}>
              <span style={{fontSize:8,color:"#aaa",fontFamily:"monospace",whiteSpace:"nowrap"}}>{fOI(row.peOI)}</span>
              <div style={{flex:1,height:3,background:"#111",borderRadius:1,overflow:"hidden"}}>
                <div style={{height:"100%",width:(row.peOI/mP*100)+"%",background:"#39FF1444"}}></div>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{margin:"8px 10px",background:"#0a0800",border:"1px solid #f59e0b22",borderRadius:9,padding:"8px",fontSize:9,color:"#f59e0b",lineHeight:1.6}}>Educational only. OI for learning.</div>
    </div>
  );
}

function TermsModal(props){
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={props.onClose}>
      <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:"18px 18px 0 0",padding:"18px 15px 28px",width:"100%",maxWidth:430,maxHeight:"88vh",overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #1a1a1a"}}><div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Terms and Conditions</div><button onClick={props.onClose} style={{background:"none",border:"none",color:"#445",fontSize:18,cursor:"pointer"}}>X</button></div>
        <div style={{background:"#0a1a0a",border:"1px solid #39FF1422",borderRadius:9,padding:"9px",marginBottom:12,textAlign:"center",fontSize:10,color:"#39FF14",fontWeight:700}}>Educational Platform - Stock Market Learning Only</div>
        <div style={{overflowY:"auto",maxHeight:"52vh"}}>
          {TERMS.map(function(t){return(<div key={t.t} style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:"#f59e0b",marginBottom:4}}>{t.t}</div><div style={{fontSize:10,color:"#667",lineHeight:1.75}}>{t.b}</div></div>);})}
        </div>
        <div style={{marginTop:10}}><button onClick={props.onAccept} style={{width:"100%",background:"linear-gradient(135deg,#39FF14,#00b377)",border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>I Accept - Educational Purpose Only</button></div>
      </div>
    </div>
  );
}

function FInp(props){
  return(
    <div style={{marginBottom:10}}>
      {props.label&&<div style={{fontSize:9,color:"#334",fontWeight:600,marginBottom:4}}>{props.label}</div>}
      <div style={{display:"flex",alignItems:"center",gap:7,background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px 12px"}}>
        {props.icon&&<span style={{fontSize:14,flexShrink:0}}>{props.icon}</span>}
        <input type={props.type||"text"} value={props.value} onChange={function(e){props.onChange(e.target.value);}} placeholder={props.placeholder} maxLength={props.maxLen} style={{flex:1,background:"none",border:"none",outline:"none",color:"#e8eaf0",fontSize:12,fontFamily:"inherit"}}/>
      </div>
    </div>
  );
}

function SCard(props){
  var st=props.st,up=st.chgPct>=0;
  return(
    <div onClick={props.onP} style={{background:"#0d0d0d",border:"1px solid "+(up?"#39FF1422":"#ff444422"),borderRadius:14,padding:"11px",cursor:"pointer"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
        <div style={{width:34,height:34,borderRadius:9,background:up?"#0a1a0a":"#1a0a0a",border:"1px solid "+(up?"#39FF1433":"#ff444433"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:up?"#39FF14":"#ff4444"}}>{st.sym.slice(0,3)}</div>
        <div style={{background:up?"#39FF1415":"#ff444415",borderRadius:6,padding:"2px 7px"}}><div style={{fontSize:9,fontWeight:800,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div></div>
      </div>
      <div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:1}}>{st.sym}</div>
      <div style={{fontSize:7,color:"#445",marginBottom:5}}>{st.name.slice(0,14)}</div>
      <div style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:"#fff"}}>Rs{fN(st.ltp)}</div>
      <div style={{marginTop:5}}><Spark data={st.spark} color={up?"#39FF14":"#ff4444"} h={26} w={100}/></div>
    </div>
  );
}

function SRow(props){
  var st=props.st,up=st.chgPct>=0;
  return(
    <div onClick={props.onP} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 9px",borderBottom:"1px solid #0b0b0b",cursor:"pointer"}}>
      <div style={{width:32,height:32,borderRadius:8,background:up?"#0a1a0a":"#1a0a0a",border:"1px solid "+(up?"#39FF1433":"#ff444433"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:up?"#39FF14":"#ff4444",flexShrink:0}}>{st.sym.slice(0,3)}</div>
      <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{st.sym}</div><div style={{fontSize:8,color:"#1a1a1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{props.full?st.name:st.sect}</div></div>
      <Spark data={st.spark} color={up?"#39FF14":"#ff4444"} h={24} w={56}/>
      <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#fff"}}>Rs{fN(st.ltp)}</div><div style={{fontSize:8,fontWeight:700,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div></div>
    </div>
  );
}

function PGate(props){
  return(
    <div style={{textAlign:"center",padding:"40px 18px"}}>
      <div style={{fontSize:40,marginBottom:9}}>&#128274;</div>
      <div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:4}}>Premium Feature</div>
      <div style={{fontSize:10,color:"#222",marginBottom:16,lineHeight:1.6}}>Upgrade to access full OI Data and Options Chain</div>
      <button onClick={props.onUp} style={{background:"linear-gradient(135deg,#39FF14,#00b377)",border:"none",borderRadius:11,padding:"11px 32px",fontSize:12,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Upgrade to Premium</button>
    </div>
  );
}

function StockDetail(props){
  var st=props.st,up=st.chgPct>=0;
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",padding:"8px 9px",borderBottom:"1px solid #0d0d0d"}}>
        <button onClick={props.onBack} style={{background:"none",border:"none",color:"#39FF14",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",padding:"3px 7px 3px 0"}}>Back</button>
        <div style={{flex:1,fontSize:12,fontWeight:800,color:"#fff"}}>{st.sym} - {st.name}</div>
      </div>
      <div style={{padding:"10px 9px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:22,fontWeight:900,color:"#fff"}}>Rs{fN(st.ltp)}</div>
            <div style={{fontSize:12,fontWeight:700,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div>
            <div style={{fontSize:8,color:st.trend==="bull"?"#39FF14":st.trend==="bear"?"#ff4444":"#f59e0b",marginTop:2}}>{st.trend==="bull"?"Bullish":st.trend==="bear"?"Bearish":"Neutral"} - {st.sect}</div>
          </div>
          <Spark data={st.spark} color={up?"#39FF14":"#ff4444"} h={52} w={96}/>
        </div>
        <CandleTimerInline/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:7}}>
          {[["Open","Rs"+fN(st.open),"#888"],["High","Rs"+fN(st.high),"#39FF14"],["Low","Rs"+fN(st.low),"#ff4444"],["Volume",st.vol,"#60a5fa"],["Mkt Cap",st.cap,"#f59e0b"],["P/E",String(st.pe),"#a78bfa"]].map(function(item){return(<div key={item[0]} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"7px"}}><div style={{fontSize:7,color:"#1a1a1a",fontWeight:600,marginBottom:2}}>{item[0]}</div><div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:item[2]}}>{item[1]}</div></div>);})}
        </div>
        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px",marginBottom:7}}>
          <div style={{fontSize:8,color:"#1a1a1a",fontWeight:600,marginBottom:6}}>52 WEEK RANGE</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:4}}><span style={{color:"#ff4444"}}>Rs{fN(st.wk52l)}</span><span style={{color:"#39FF14"}}>Rs{fN(st.wk52h)}</span></div>
          <div style={{height:4,background:"#1a1a1a",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:((st.ltp-st.wk52l)/(st.wk52h-st.wk52l)*100)+"%",background:"linear-gradient(90deg,#ff4444,#39FF14)",borderRadius:2}}></div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
          <div style={{background:"#39FF1410",border:"1px solid #39FF1433",borderRadius:9,padding:"10px"}}><div style={{fontSize:7,color:"#334",fontWeight:600,marginBottom:2}}>SUPPORT</div><div style={{fontFamily:"monospace",fontSize:16,fontWeight:800,color:"#39FF14"}}>Rs{st.sup}</div></div>
          <div style={{background:"#ff444410",border:"1px solid #ff444433",borderRadius:9,padding:"10px"}}><div style={{fontSize:7,color:"#334",fontWeight:600,marginBottom:2}}>RESISTANCE</div><div style={{fontFamily:"monospace",fontSize:16,fontWeight:800,color:"#ff4444"}}>Rs{st.res}</div></div>
        </div>
        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px",marginBottom:7}}>
          <div style={{fontSize:9,fontWeight:700,color:"#f59e0b",marginBottom:8}}>Quarterly Results - {st.qtr.dt}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[["Revenue",st.qtr.rev],["Net Profit",st.qtr.pft],["YoY",st.qtr.yoy],["QoQ",st.qtr.qoq]].map(function(item){return(<div key={item[0]}><div style={{fontSize:7,color:"#1a1a1a",marginBottom:1}}>{item[0]}</div><div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:item[1].charAt(0)==="-"?"#ff4444":item[1].charAt(0)==="+"?"#39FF14":"#fff"}}>{item[1]}</div></div>);})}
          </div>
        </div>
        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px",marginBottom:7}}>
          <div style={{fontSize:9,fontWeight:700,color:"#60a5fa",marginBottom:7}}>Company News</div>
          {st.news.map(function(n,i){return <div key={i} style={{fontSize:9,color:"#667",padding:"4px 0",borderBottom:i<st.news.length-1?"1px solid #0d0d0d":"none",lineHeight:1.5}}>- {n}</div>;})}
        </div>
        <div style={{marginBottom:10,fontSize:8,color:"#885522",background:"#080400",border:"1px solid #ff440018",borderRadius:8,padding:"7px",lineHeight:1.6}}>All analysis shown is for educational purposes only. Not a buy/sell recommendation.</div>
      </div>
    </div>
  );
}

export default function StocksBuddy(){
  const [phase,   setPhase]   = useState("splash");
  const [showLangModal,setShowLangModal]=useState(false);
  const [splashP, setSplashP] = useState(0);
  const [splashS, setSplashS] = useState(1);
  const [mode,    setMode]    = useState("login");
  const [form,    setForm]    = useState({name:"",email:"",phone:"",pass:"",confirm:""});
  const [authErr, setAuthErr] = useState("");
  const [termsOk, setTermsOk] = useState(false);
  const [showT,   setShowT]   = useState(false);
  const [otpSt,   setOtpSt]   = useState("form");
  const [realOTP, setRealOTP] = useState("");
  const [entOTP,  setEntOTP]  = useState("");
  const [otpErr,  setOtpErr]  = useState("");
  const [timer,   setTimer]   = useState(0);
  const [forgotPh,setForgotPh]= useState("");
  const [newPass, setNewPass] = useState("");
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lang,    setLang]    = useState("te");
  const [sidebar, setSidebar] = useState(false);
  const [tab,     setTab]     = useState("home");
  const [isPrem,  setIsPrem]  = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showDisc,setShowDisc]= useState(false);
  const [showTrm, setShowTrm] = useState(false);
  const [showNot, setShowNot] = useState(false);
  const [readN,   setReadN]   = useState([]);
  const [clk,     setClk]     = useState(nowT());
  const [mktStatus,setMktStatus]=useState(getMarketStatus());
  const [nifty,   setNifty]   = useState({ltp:22467.90,chg:298.40,pct:1.35,up:true});
  const [sensex,  setSensex]  = useState({ltp:73863.45,chg:934.20,pct:1.28,up:true});
  const [giftNifty,setGiftNifty]=useState({ltp:22510,chg:42.5,pct:0.19,up:true});
  const [vix,     setVix]     = useState(14.2);
  const [stocks,  setStocks]  = useState(function(){
    return STOCKS.map(function(s){
      var cp=parseFloat(((s.ltp-s.open)/s.open*100).toFixed(2));
      var sp=Array(20).fill(s.ltp).map(function(_,i){return s.ltp+sg()*rnd(0,s.ltp*0.003)*i;});
      return Object.assign({},s,{chgPct:cp,spark:sp});
    });
  });
  const [mcx,     setMcx]     = useState(function(){
    return MCX_DATA.map(function(c){
      var sp=Array(14).fill(c.ltp).map(function(_,i){return c.ltp+sg()*rnd(0,c.ltp*0.004)*i;});
      return Object.assign({},c,{spark:sp});
    });
  });
  const [selSt,   setSelSt]   = useState(null);
  const [oiIdx,   setOiIdx]   = useState("NIFTY");
  const [srch,    setSrch]    = useState("");
  const [nFil,    setNFil]    = useState("All");
  const [capFil,  setCapFil]  = useState("Large");
  const [glTab,   setGlTab]   = useState("gainers");
  const [shareStock,setShareStock]=useState({sym:"",ltp:"",chg:"",type:"Bullish Breakout",zone:"",target:"",sl:""});
  const [soundOn,  setSoundOn]  = useState(true);
  const [liveAlerts,setLiveAlerts]=useState([]);
  const [showAlertModal,setShowAlertModal]=useState(null);
  const [aiSignals,setAiSignals]=useState([]);
  const [appLink, setAppLink] = useState(APP_LINK);
  const [alertsSent,setAlertsSent]=useState([]);
  const [customNews,setCustomNews]=useState([]);
  const [liveNewsAPI,setLiveNewsAPI]=useState([]);
  const [loadingNews,setLoadingNews]=useState(false);
  const [oiView,setOiView]=useState("chain");
  const [watchlist,setWatchlist]=useState(function(){try{var s=localStorage.getItem("bp_wl");return s?JSON.parse(s):[];}catch(e){return [];}});

  useEffect(function(){
    if(document.getElementById("bp-anims"))return;
    var s=document.createElement("style");
    s.id="bp-anims";
    s.innerHTML="@keyframes bpPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes shake{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}";
    document.head.appendChild(s);
  },[]);
  const [newsForm,setNewsForm]=useState({cat:"Market",title:"",body:""});
  const [trialDays,setTrialDays] = useState(7);
  const [isTrialActive,setIsTrialActive]=useState(false);

  
  useEffect(function(){
    function fetchNews(){
      setLoadingNews(true);
      var ETMarkets="https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms";
      var apiURL="https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(ETMarkets);
      fetch(apiURL)
        .then(function(r){return r.json();})
        .then(function(d){
          if(d&&d.items){
            var formatted=d.items.slice(0,15).map(function(item,idx){
              var t=new Date(item.pubDate);
              var hh=t.getHours().toString().padStart(2,"0");
              var mm=t.getMinutes().toString().padStart(2,"0");
              return {id:1000+idx,cat:"Markets",title:item.title||"",body:(item.description||"").replace(/<[^>]+>/g,"").substring(0,140),time:hh+":"+mm,link:item.link||"",notif:false,source:"Economic Times"};
            });
            setLiveNewsAPI(formatted);
          }
          setLoadingNews(false);
        })
        .catch(function(e){console.log("News fetch failed:",e);setLoadingNews(false);});
    }
    fetchNews();
    var newsTimer=setInterval(fetchNews,600000);
    return function(){clearInterval(newsTimer);};
  },[]);

  useEffect(function(){
    if(phase!=="splash")return;
    if(splashS===1){var t=setTimeout(function(){setSplashS(2);},1200);return function(){clearTimeout(t);};}
    if(splashS===2){var p=0;var t=setInterval(function(){p+=2;setSplashP(p);if(p>=100){clearInterval(t);setSplashS(3);}},25);return function(){clearInterval(t);};}
    if(splashS===3){var t=setTimeout(function(){setPhase("auth");},1200);return function(){clearTimeout(t);};}
  },[phase,splashS]);

  useEffect(function(){if(timer<=0)return;var t=setInterval(function(){setTimer(function(p){return p-1;});},1000);return function(){clearInterval(t);};},[timer]);

  useEffect(function(){
    if(phase!=="app")return;
    var t=setInterval(function(){
      setClk(nowT());
      setMktStatus(getMarketStatus());
      setNifty(function(p){var m=rnd(0.1,0.4)*sg();var n=parseFloat((p.ltp+m).toFixed(2));return{ltp:n,chg:Math.abs(parseFloat((n-22169.5).toFixed(2))),pct:Math.abs(parseFloat(((n-22169.5)/22169.5*100).toFixed(2))),up:n>=22169.5};});
      setSensex(function(p){var m=rnd(0.5,2)*sg();var n=parseFloat((p.ltp+m).toFixed(2));return{ltp:n,chg:Math.abs(parseFloat((n-72929.25).toFixed(2))),pct:Math.abs(parseFloat(((n-72929.25)/72929.25*100).toFixed(2))),up:n>=72929.25};});
      setGiftNifty(function(p){var m=rnd(0.1,0.5)*sg();var n=parseFloat((p.ltp+m).toFixed(2));return{ltp:n,chg:Math.abs(parseFloat((n-22169.5).toFixed(2))),pct:Math.abs(parseFloat(((n-22169.5)/22169.5*100).toFixed(2))),up:n>=22169.5};});
      setVix(function(p){return parseFloat((p+sg()*rnd(0,0.1)).toFixed(2));});
      setStocks(function(prev){return prev.map(function(s,i){var mv=rnd(0.05,s.ltp*0.0018)*sg();var nl=parseFloat((s.ltp+mv).toFixed(2));return Object.assign({},s,{ltp:nl,chgPct:parseFloat(((nl-STOCKS[i].open)/STOCKS[i].open*100).toFixed(2)),spark:s.spark.slice(1).concat([nl])});});});
      // Generate random live alert every 30 seconds for premium users
      if(Math.random() < 0.04){
        var tmpl = ALERT_TEMPLATES[Math.floor(Math.random()*ALERT_TEMPLATES.length)];
        var alert = Object.assign({},tmpl,{id:Date.now(),time:nowT()});
        setLiveAlerts(function(p){return [alert].concat(p.slice(0,9));});
        if(isPrem && soundOn){playAlert();}
        if(isPrem){setShowAlertModal(alert);setTimeout(function(){setShowAlertModal(null);},5000);}
      }
      setMcx(function(prev){return prev.map(function(c){var mv=rnd(0.5,c.ltp*0.002)*sg();var nl=parseFloat((c.ltp+mv).toFixed(2));return Object.assign({},c,{ltp:nl,chgPct:parseFloat(((nl-c.open)/c.open*100).toFixed(2)),spark:c.spark.slice(1).concat([nl])});});});
    },1800);
    return function(){clearInterval(t);};
  },[phase]);

  function toggleWL(sym){setWatchlist(function(prev){var ex=prev.includes(sym);var upd=ex?prev.filter(function(s){return s!==sym;}):prev.concat([sym]);try{localStorage.setItem("bp_wl",JSON.stringify(upd));}catch(e){}return upd;});}
  var notifNews=NEWS.filter(function(n){return n.notif;});
  var unread=notifNews.filter(function(n){return !readN.includes(n.id);}).length;
  var filtSt=stocks.filter(function(s){return s.sym.toLowerCase().includes(srch.toLowerCase())||s.name.toLowerCase().includes(srch.toLowerCase());});
  var allCats=["All"].concat([...new Set([...liveNewsAPI,...NEWS].map(function(n){return n.cat;}))]);
  var allNews=customNews.concat(NEWS);
  var filtNs=nFil==="All"?allNews:allNews.filter(function(n){return n.cat===nFil;});
  var capStocks=capFil==="Large"?stocks.filter(function(s){return LARGE_SYMS.includes(s.sym);}):stocks.filter(function(s){return MID_SYMS.includes(s.sym);});
  var topG=[...capStocks].sort(function(a,b){return b.chgPct-a.chgPct;}).slice(0,4);
  var topL=[...capStocks].sort(function(a,b){return a.chgPct-b.chgPct;}).slice(0,4);
  var isHoliday=mktStatus.session==="holiday";
  var showStocks=mktStatus.session==="stocks"||mktStatus.session==="gift";
  var showMCX=mktStatus.session==="mcx";

  function sendOTP(){var otp=String(Math.floor(100000+Math.random()*900000));setRealOTP(otp);setTimer(60);setOtpSt("otp");setOtpErr("");alert("OTP Sent! Demo OTP: "+otp);}
  function handleSubmit(){
    if(form.phone===AP||form.email===AE){
      if(!form.pass){setAuthErr("Please enter your password");return;}
      if(form.pass!==AW){setAuthErr("Incorrect password");return;}
      setUser({name:"Admin",phone:AP,email:AE,isAdmin:true,gmailVerified:true});
      setIsAdmin(true);setIsPrem(true);setPhase("app");return;
    }
    if(mode==="register"){
      if(!form.name){setAuthErr("Please enter your name");return;}
      if(!form.phone||form.phone.length<10){setAuthErr("Enter valid 10-digit phone");return;}
      if(!form.pass||form.pass.length<6){setAuthErr("Password min 6 characters");return;}
      if(form.pass!==form.confirm){setAuthErr("Passwords do not match");return;}
      if(!termsOk){setAuthErr("Please accept Terms and Conditions");return;}
    } else {
      if(!form.phone){setAuthErr("Enter phone number");return;}
      if(!form.pass){setAuthErr("Enter password");return;}
    }
    setAuthErr("");sendOTP();
  }
  function verifyOTP(){if(!entOTP){setOtpErr("Enter OTP");return;}if(entOTP===realOTP){setOtpSt("gmail");setOtpErr("");}else{setOtpErr("Incorrect OTP. Try again.");}}
  function finishAuth(wg){
    setUser({name:form.name||"User",phone:form.phone,email:form.email||"",isAdmin:false,gmailVerified:wg});
    setIsAdmin(false);
    setIsTrialActive(true);
    setIsPrem(true);
    setPhase("app");
    setOtpSt("form");
    setEntOTP("");
    setRealOTP("");
    setTimeout(function(){alert("Welcome! Your 7-day FREE PREMIUM trial has started! Enjoy all features.");},500);
  }
  function handleForgot(){if(!forgotPh||forgotPh.length<10){setOtpErr("Enter valid 10-digit number");return;}var otp=String(Math.floor(100000+Math.random()*900000));setRealOTP(otp);setTimer(60);setOtpSt("forgotOtp");setOtpErr("");alert("Reset OTP sent! Demo OTP: "+otp);}
  function verifyForgotOTP(){if(entOTP===realOTP){setOtpSt("resetPass");setOtpErr("");}else{setOtpErr("Incorrect OTP.");}}
  function resetPassword(){if(!newPass||newPass.length<6){setOtpErr("Password min 6 chars");return;}setOtpSt("resetDone");setOtpErr("");}

  var G="linear-gradient(135deg,#39FF14,#00b377)";
  var PS={display:"flex",flexDirection:"column",height:"100vh",maxWidth:430,margin:"0 auto",background:"#000",color:"#e8eaf0",fontFamily:"Arial,sans-serif",overflow:"hidden",position:"relative"};
  var CSS=".tk-wrap{width:100%;overflow:hidden}.ticker{display:inline-block;white-space:nowrap;animation:scroll 50s linear infinite}@keyframes scroll{0%{transform:translateX(100vw)}100%{transform:translateX(-200%)}}button:active{transform:scale(0.96)}input::placeholder{color:#1a1a1a}::-webkit-scrollbar{width:0;height:0}@keyframes slideIn{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}";

  if(phase==="splash") return(
    <div style={Object.assign({},PS,{justifyContent:"center",alignItems:"center",padding:20,background:"radial-gradient(ellipse at center,#0d1f0d 0%,#000 70%)"})}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <LogoSVG size={0.9}/>
        {splashS===2&&<div style={{width:"100%",maxWidth:240,margin:"20px auto 0"}}><div style={{height:5,background:"#1a2a1a",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:splashP+"%",background:G,transition:"width 0.025s linear",borderRadius:5}}></div></div><div style={{color:"#334",fontSize:11,textAlign:"center",marginTop:9,letterSpacing:3}}>Loading...</div></div>}
        {splashS===3&&<div style={{position:"relative",width:100,height:100,margin:"20px auto 0"}}><svg width="100" height="100" style={{transform:"rotate(-90deg)"}}><circle cx="50" cy="50" r="40" fill="none" stroke="#1a2a1a" strokeWidth="7"/><circle cx="50" cy="50" r="40" fill="none" stroke="#39FF14" strokeWidth="7" strokeDasharray={(2*Math.PI*40)+" 0"} strokeLinecap="round"/></svg><div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:19,fontWeight:900,color:"#39FF14"}}>100%</div></div>}
      </div>
    </div>
  );

  if(phase==="auth") return(
    <div style={Object.assign({},PS,{overflowY:"auto"})}>
      <style>{CSS}</style>
      <div style={{background:"radial-gradient(ellipse at 50% 0%,#0d1f0d,#000)",padding:"20px 16px 14px",textAlign:"center",borderBottom:"1px solid #1a2a1a"}}><LogoSVG size={0.68}/></div>
      {otpSt==="otp"&&<div style={{padding:"20px"}}>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:36,marginBottom:6}}>&#128241;</div><div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:3}}>Enter OTP</div><div style={{fontSize:11,color:"#334"}}>Sent to +91 {form.phone}</div></div>
        {otpErr&&<div style={{background:"#1a0a0a",border:"1px solid #ff444444",borderRadius:9,padding:"9px",marginBottom:10,fontSize:11,color:"#ff6666",textAlign:"center"}}>{otpErr}</div>}
        <FInp placeholder="Enter 6-digit OTP" value={entOTP} onChange={setEntOTP} type="number" maxLen={6}/>
        <div style={{textAlign:"right",marginBottom:10}}>{timer>0?<span style={{fontSize:10,color:"#334"}}>Resend in {timer}s</span>:<button onClick={sendOTP} style={{background:"none",border:"none",color:"#39FF14",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Resend OTP</button>}</div>
        <button onClick={verifyOTP} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>Verify OTP</button>
        <button onClick={function(){setOtpSt("form");}} style={{width:"100%",background:"none",border:"none",color:"#334",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Change Phone Number</button>
      </div>}
      {otpSt==="forgot"&&<div style={{padding:"20px"}}>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:36,marginBottom:6}}>&#128272;</div><div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:3}}>Forgot Password</div></div>
        {otpErr&&<div style={{background:"#1a0a0a",border:"1px solid #ff444444",borderRadius:9,padding:"9px",marginBottom:10,fontSize:11,color:"#ff6666"}}>{otpErr}</div>}
        <FInp label="Registered Phone Number" placeholder="10-digit phone" value={forgotPh} onChange={setForgotPh} type="tel" maxLen={10}/>
        <button onClick={handleForgot} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>Send Reset OTP</button>
        <button onClick={function(){setOtpSt("form");setOtpErr("");}} style={{width:"100%",background:"none",border:"none",color:"#334",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Back to Login</button>
      </div>}
      {otpSt==="forgotOtp"&&<div style={{padding:"20px"}}>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:36,marginBottom:6}}>&#128241;</div><div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:3}}>Enter Reset OTP</div></div>
        {otpErr&&<div style={{background:"#1a0a0a",border:"1px solid #ff444444",borderRadius:9,padding:"9px",marginBottom:10,fontSize:11,color:"#ff6666"}}>{otpErr}</div>}
        <FInp placeholder="Enter 6-digit OTP" value={entOTP} onChange={setEntOTP} type="number" maxLen={6}/>
        <button onClick={verifyForgotOTP} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Verify OTP</button>
      </div>}
      {otpSt==="resetPass"&&<div style={{padding:"20px"}}>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:36,marginBottom:6}}>&#128274;</div><div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:3}}>Set New Password</div></div>
        {otpErr&&<div style={{background:"#1a0a0a",border:"1px solid #ff444444",borderRadius:9,padding:"9px",marginBottom:10,fontSize:11,color:"#ff6666"}}>{otpErr}</div>}
        <FInp label="New Password (min 6 chars)" placeholder="Enter new password" value={newPass} onChange={setNewPass} type="password"/>
        <button onClick={resetPassword} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Set New Password</button>
      </div>}
      {otpSt==="resetDone"&&<div style={{padding:"40px 20px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>&#10003;</div>
        <div style={{fontSize:16,fontWeight:800,color:"#39FF14",marginBottom:6}}>Password Reset Done!</div>
        <div style={{fontSize:12,color:"#445",marginBottom:24}}>Login with your new password.</div>
        <button onClick={function(){setOtpSt("form");setEntOTP("");setRealOTP("");setNewPass("");setForgotPh("");}} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Go to Login</button>
      </div>}
      {otpSt==="gmail"&&<div style={{padding:"22px 18px",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:10}}>&#10003;</div>
        <div style={{fontSize:15,fontWeight:800,color:"#39FF14",marginBottom:4}}>Phone Verified!</div>
        <div style={{fontSize:11,color:"#334",marginBottom:20}}>Also verify Gmail for account recovery?</div>
        <button onClick={function(){alert("Gmail verification sent! (Demo)");finishAuth(true);}} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>Verify Gmail Too</button>
        <button onClick={function(){finishAuth(false);}} style={{width:"100%",background:"none",border:"1px solid #1a1a1a",borderRadius:11,padding:"11px",color:"#445",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Skip - Continue Without Gmail</button>
      </div>}
      {otpSt==="form"&&<div style={{padding:"14px 18px 32px"}}>
        <div style={{display:"flex",margin:"0 0 14px",background:"#0d0d0d",borderRadius:11,border:"1px solid #1a1a1a",padding:4}}>
          {[["login","Login"],["register","Register"]].map(function(kl){return(<button key={kl[0]} onClick={function(){setMode(kl[0]);setAuthErr("");}} style={{flex:1,padding:"9px",borderRadius:7,border:"none",background:mode===kl[0]?"#39FF14":"transparent",color:mode===kl[0]?"#000":"#445",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{kl[1]}</button>);})}
        </div>
        {authErr&&<div style={{background:"#1a0a0a",border:"1px solid #ff444444",borderRadius:9,padding:"9px",marginBottom:11,fontSize:11,color:"#ff6666"}}>{authErr}</div>}
        {mode==="register"&&<FInp label="Full Name *" placeholder="Your Full Name" value={form.name} onChange={function(v){setForm(function(p){return Object.assign({},p,{name:v});});}}/>}
        {mode==="register"&&<FInp label="Email (optional)" placeholder="yourname@gmail.com" value={form.email} onChange={function(v){setForm(function(p){return Object.assign({},p,{email:v});});}} type="email"/>}
        <FInp label="Phone Number * (OTP will be sent)" placeholder="10-digit mobile number" value={form.phone} onChange={function(v){setForm(function(p){return Object.assign({},p,{phone:v});});}} type="tel" maxLen={10}/>
        <FInp label="Password *" placeholder="Create strong password (min 6 chars)" value={form.pass} onChange={function(v){setForm(function(p){return Object.assign({},p,{pass:v});});}} type="password"/>
        {mode==="register"&&<FInp label="Confirm Password *" placeholder="Re-enter password" value={form.confirm} onChange={function(v){setForm(function(p){return Object.assign({},p,{confirm:v});});}} type="password"/>}
        {mode==="register"&&<div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:13}}>
          <div onClick={function(){setTermsOk(function(p){return !p;});}} style={{width:20,height:20,borderRadius:5,border:"2px solid "+(termsOk?"#39FF14":"#1a1a1a"),background:termsOk?"#39FF14":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1}}>{termsOk&&<span style={{color:"#000",fontSize:13,fontWeight:900}}>&#10003;</span>}</div>
          <div style={{fontSize:10,color:"#667",lineHeight:1.7}}>I agree to the{" "}<button onClick={function(){setShowT(true);}} style={{background:"none",border:"none",color:"#39FF14",fontSize:10,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Terms and Conditions</button>{" "}and understand this is for educational purposes only.</div>
        </div>}
        <button onClick={handleSubmit} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"13px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>{mode==="login"?"Login - Send OTP":"Register - Send OTP"}</button>
        {mode==="login"&&<button onClick={function(){setOtpSt("forgot");setOtpErr("");}} style={{width:"100%",background:"none",border:"none",color:"#39FF14",marginTop:10,cursor:"pointer",fontSize:11,fontFamily:"inherit",textDecoration:"underline"}}>Forgot Password?</button>}
        <div style={{marginTop:14}}>
          <div style={{fontSize:9,color:"#445",fontWeight:600,marginBottom:5,textAlign:"center"}}>LANGUAGE</div>
          <select value={lang} onChange={function(e){setLang(e.target.value);}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:10,padding:"10px",color:"#39FF14",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
            <option value="en">English</option><option value="hi">Hindi</option>
          </select>
        </div>
        <div style={{marginTop:12,background:"#0a0500",border:"1px solid #ff440018",borderRadius:9,padding:"8px",fontSize:8,color:"#cc6622",lineHeight:1.7}}>{DISCLAIMER}</div>
      </div>}
      {showT&&<TermsModal onClose={function(){setShowT(false);}} onAccept={function(){setTermsOk(true);setShowT(false);}}/>}
      
    </div>
  );

  return(
    <div style={PS}>
      <style>{CSS}</style>
      {sidebar&&(
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex"}}>
          <div style={{width:230,background:"#080808",borderRight:"1px solid #111",display:"flex",flexDirection:"column",animation:"slideIn 0.22s ease"}}>
            <div style={{padding:"10px",borderBottom:"1px solid #0d0d0d",textAlign:"center"}}><LogoSVG size={0.5}/></div>
            <div style={{padding:"10px 9px",flex:1,overflowY:"auto"}}>
              <div style={{fontSize:8,color:"#222",fontWeight:700,letterSpacing:1,marginBottom:7}}>LANGUAGE</div>
              {[["en","English"],["hi","Hindi"]].map(function(kl){return(<button key={kl[0]} onClick={function(){setLang(kl[0]);setSidebar(false);}} style={{display:"flex",alignItems:"center",gap:7,width:"100%",background:lang===kl[0]?"#39FF1010":"transparent",border:"none",borderRadius:9,padding:"6px 9px",marginBottom:2,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}><span style={{color:lang===kl[0]?"#39FF14":"#556",fontWeight:lang===kl[0]?700:400,fontSize:12}}>{kl[1]}</span>{lang===kl[0]&&<span style={{marginLeft:"auto",color:"#39FF14"}}>&#10003;</span>}</button>);})}
              <div style={{height:1,background:"#111",margin:"8px 0"}}></div>
              <button onClick={function(){setShowTrm(true);setSidebar(false);}} style={{display:"flex",alignItems:"center",width:"100%",background:"transparent",border:"none",borderRadius:9,padding:"6px 9px",marginBottom:2,cursor:"pointer",fontFamily:"inherit",color:"#445",fontSize:12}}>Terms and Conditions</button>
              <button onClick={function(){setShowDisc(true);setSidebar(false);}} style={{display:"flex",alignItems:"center",width:"100%",background:"transparent",border:"none",borderRadius:9,padding:"6px 9px",cursor:"pointer",fontFamily:"inherit",color:"#445",fontSize:12}}>SEBI Disclaimer</button>
            </div>
            <div style={{padding:"10px 9px",borderTop:"1px solid #0d0d0d"}}>

              <div style={{fontSize:11,color:"#39FF14",fontWeight:700,marginBottom:1}}>{user&&(isAdmin?"Admin User":user.name)}</div>
              {user&&user.gmailVerified&&<div style={{fontSize:8,color:"#60a5fa",marginBottom:6}}>Gmail Verified &#10003;</div>}
              {isAdmin&&<div style={{fontSize:8,color:"#FFD700",background:"#FFD70015",borderRadius:5,padding:"2px 7px",marginBottom:7,display:"inline-block"}}>ADMIN</div>}
              <button onClick={function(){setPhase("auth");setUser(null);setSidebar(false);setIsAdmin(false);setOtpSt("form");setForm({name:"",email:"",phone:"",pass:"",confirm:""});}} style={{width:"100%",background:"#150505",border:"1px solid #ff444433",borderRadius:9,padding:"7px",color:"#ff5555",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
            </div>
          </div>
          <div style={{flex:1,background:"rgba(0,0,0,0.78)"}} onClick={function(){setSidebar(false);}}></div>
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",padding:"8px 9px 6px",borderBottom:"1px solid #0c0c0c",background:"rgba(0,0,0,0.98)",zIndex:50,flexShrink:0}}>
        <button onClick={function(){setSidebar(true);}} style={{background:"none",border:"none",cursor:"pointer",padding:"3px 7px 3px 0",fontSize:19,color:"#fff"}}>&#9776;</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Arial,sans-serif",fontSize:17,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1}}>Breakout<span style={{color:"#39FF14"}}> Pro</span></div>
          <div style={{fontSize:6,color:"#cc3300",letterSpacing:1.5,fontWeight:700}}>CATCH EVERY BREAKOUT</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{background:"#0a0a0a",borderRadius:8,padding:"2px 6px",border:"1px solid "+(mktStatus.session==="stocks"?"#39FF1433":mktStatus.session==="mcx"?"#f59e0b33":"#1a1a1a")}}>
            <div style={{fontSize:6,fontWeight:700,color:mktStatus.color,letterSpacing:0.5}}>{mktStatus.label}</div>
          </div>
          <button onClick={function(){setSoundOn(function(p){return !p;});}} style={{background:soundOn?"#0a1a0a":"#1a0a0a",border:"1px solid "+(soundOn?"#39FF1433":"#ff444433"),borderRadius:8,padding:"4px 6px",fontSize:11,cursor:"pointer",color:soundOn?"#39FF14":"#ff4444",fontWeight:700}}>{soundOn?"ON":"OFF"}</button>
          <div onClick={function(){if(soundOn){playAlert();}}} style={{background:"#0d0d0d",border:"1.5px solid #1a1a1a",borderRadius:11,padding:"6px 10px",cursor:"pointer"}}>
            <span style={{fontSize:18}}>&#128276;</span>
          </div>
          {!isPrem&&!isAdmin&&<button onClick={function(){setShowSub(true);}} style={{background:G,border:"none",borderRadius:12,padding:"4px 8px",fontSize:8,fontWeight:800,color:"#000",cursor:"pointer"}}>PRO</button>}}
          {isTrialActive&&isPrem&&<span style={{background:"#39FF1418",color:"#39FF14",border:"1px solid #39FF1444",borderRadius:11,padding:"2px 7px",fontSize:8,fontWeight:700}}>{trialDays}d FREE</span>}
          {isPrem&&<span style={{background:"#FFD70018",color:"#FFD700",border:"1px solid #FFD70033",borderRadius:11,padding:"2px 6px",fontSize:8,fontWeight:700}}>PRO</span>}
        </div>
      </div>

      <div style={{background:"#050200",borderBottom:"1px solid #ff440012",overflow:"hidden",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center"}}>
          <div style={{background:"#bb1100",color:"#fff",fontSize:7,fontWeight:800,padding:"3px 7px",flexShrink:0,letterSpacing:1}}>LIVE</div>
          <div className="tk-wrap"><div className="ticker">{NEWS.map(function(n){return <span key={n.id} style={{marginRight:44,color:"#aa7744",fontSize:8}}>{n.cat}: {n.title} | </span>;})}</div></div>
        </div>
        <div style={{fontSize:6,color:"#331100",textAlign:"center",padding:"1px 0"}}>EDUCATIONAL PURPOSE ONLY - NOT INVESTMENT ADVICE</div>
      </div>

      <div style={{overflowY:"auto",flex:1,paddingBottom:72}}>

        {tab==="home"&&(
          <div>
            <div style={{padding:"14px 12px 8px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#39FF14,#00aa00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#000"}}>{(user&&user.name?user.name[0]:"U").toUpperCase()}</div>
                  <div>
                    <div style={{fontSize:9,color:"#666",fontWeight:600,letterSpacing:0.5}}>Good {new Date().getHours()<12?"Morning":new Date().getHours()<17?"Afternoon":"Evening"}</div>
                    <div style={{fontSize:14,color:"#fff",fontWeight:800}}>Hello {user&&user.name?user.name.split(" ")[0]:"Trader"} <span style={{fontSize:13}}>&#128075;</span></div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button onClick={function(){setTab("news");}} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
                    <span style={{fontSize:14}}>&#128276;</span>
                    {unread>0&&<span style={{position:"absolute",top:-3,right:-3,background:"#ff3333",color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}
                  </button>
                  <button onClick={function(){setSidebar(true);}} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14}}>&#9776;</button>
                </div>
              </div>
            </div>
            
            <div style={{margin:"6px 12px 10px 12px",padding:"10px 12px",background:"linear-gradient(135deg,#0a1a0a 0%,#001500 100%)",border:"1px solid #39FF1433",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:mktStatus.color,boxShadow:"0 0 8px "+mktStatus.color}}></div>
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:mktStatus.color}}>{mktStatus.label}</div>
                  <div style={{fontSize:8,color:"#888"}}>{mktStatus.sub}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:"#666"}}>NSE Time</div>
                <div style={{fontSize:11,fontWeight:700,color:"#39FF14",fontFamily:"monospace"}}>{clk}</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"0 12px 10px 12px"}}>
              <div onClick={function(){setTab("oi");setOiView("chain");}} style={{background:"linear-gradient(135deg,#0a1a0a,#001500)",border:"1px solid "+(nifty.chg>=0?"#39FF1444":"#ff444444"),borderRadius:13,padding:"12px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:9,color:"#888",fontWeight:600,letterSpacing:0.5}}>NIFTY 50</div>
                  <div style={{fontSize:11}}>{nifty.chg>=0?"\u25B2":"\u25BC"}</div>
                </div>
                <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:4}}>{nifty.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                <div style={{fontSize:10,fontWeight:700,color:nifty.chg>=0?"#39FF14":"#ff4444"}}>{nifty.chg>=0?"+":""}{nifty.chg.toFixed(2)} ({nifty.pct.toFixed(2)}%)</div>
              </div>
              <div onClick={function(){setTab("oi");setOiView("chain");}} style={{background:"linear-gradient(135deg,#0a1a0a,#001500)",border:"1px solid "+(sensex.chg>=0?"#39FF1444":"#ff444444"),borderRadius:13,padding:"12px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:9,color:"#888",fontWeight:600,letterSpacing:0.5}}>SENSEX</div>
                  <div style={{fontSize:11}}>{sensex.chg>=0?"\u25B2":"\u25BC"}</div>
                </div>
                <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:4}}>{sensex.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                <div style={{fontSize:10,fontWeight:700,color:sensex.chg>=0?"#39FF14":"#ff4444"}}>{sensex.chg>=0?"+":""}{sensex.chg.toFixed(2)} ({sensex.pct.toFixed(2)}%)</div>
              </div>
            </div>

            <div style={{margin:"4px 12px 12px 12px"}}>
              <div style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:0.5,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12}}>&#9889;</span> QUICK ACCESS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                <button onClick={function(){setTab("markets");}} style={{background:"linear-gradient(135deg,#0a1a3a,#001a4a)",border:"1px solid #4488ff44",borderRadius:11,padding:"10px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                  <div style={{fontSize:20}}>&#128202;</div>
                  <div style={{fontSize:9,color:"#88aaff",fontWeight:700}}>Charts</div>
                </button>
                <button onClick={function(){setTab("oi");}} style={{background:"linear-gradient(135deg,#3a0a1a,#4a001a)",border:"1px solid #ff448844",borderRadius:11,padding:"10px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                  <div style={{fontSize:20}}>&#127919;</div>
                  <div style={{fontSize:9,color:"#ff88aa",fontWeight:700}}>OI Data</div>
                </button>
                <button onClick={function(){setTab("ipo");}} style={{background:"linear-gradient(135deg,#3a2a0a,#4a3a00)",border:"1px solid #ffaa4444",borderRadius:11,padding:"10px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                  <div style={{fontSize:20}}>&#127919;</div>
                  <div style={{fontSize:9,color:"#ffcc88",fontWeight:700}}>IPO</div>
                </button>
                <button onClick={function(){setTab("fii");}} style={{background:"linear-gradient(135deg,#0a3a1a,#003a2a)",border:"1px solid #44ff8844",borderRadius:11,padding:"10px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                  <div style={{fontSize:20}}>&#128176;</div>
                  <div style={{fontSize:9,color:"#88ffaa",fontWeight:700}}>FII/DII</div>
                </button>
              </div>
            </div>

            <div style={{margin:"8px 9px 10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:800,color:"#fff",letterSpacing:0.3}}>Indian Indices</div>
                <span style={{fontSize:8,color:"#39FF14",fontWeight:600}}>Live</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                <div onClick={function(){setTab("oi");setOiView("chart");}} style={{background:"#0d0d0d",border:"1px solid "+(nifty.up?"#39FF1433":"#ff444433"),borderRadius:11,padding:"11px 12px",cursor:"pointer"}}>
                  <div style={{fontSize:8,color:"#888",fontWeight:600,marginBottom:4}}>NIFTY 50</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{nifty.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontSize:10,fontWeight:700,color:nifty.up?"#39FF14":"#ff4444",marginTop:3}}>{nifty.up?"▲":"▼"} {nifty.up?"+":""}{nifty.chg.toFixed(2)} ({nifty.pct.toFixed(2)}%)</div>
                  <div style={{fontSize:7,color:"#445",marginTop:2}}>Tap for chart</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid "+(sensex.up?"#39FF1433":"#ff444433"),borderRadius:11,padding:"11px 12px"}}>
                  <div style={{fontSize:8,color:"#888",fontWeight:600,marginBottom:4}}>SENSEX</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{sensex.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontSize:10,fontWeight:700,color:sensex.up?"#39FF14":"#ff4444",marginTop:3}}>{sensex.up?"▲":"▼"} {sensex.up?"+":""}{sensex.chg.toFixed(2)} ({sensex.pct.toFixed(2)}%)</div>
                  <div style={{fontSize:7,color:"#445",marginTop:2}}>BSE | Real-time</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #FFD70022",borderRadius:11,padding:"11px 12px"}}>
                  <div style={{fontSize:8,color:"#888",fontWeight:600,marginBottom:4}}>GIFT NIFTY</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{giftNifty.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontSize:10,fontWeight:700,color:giftNifty.up?"#39FF14":"#ff4444",marginTop:3}}>{giftNifty.up?"▲":"▼"} {giftNifty.up?"+":""}{giftNifty.chg.toFixed(2)} ({giftNifty.pct.toFixed(2)}%)</div>
                  <div style={{fontSize:7,color:"#445",marginTop:2}}>Pre-mkt indicator</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #a78bfa33",borderRadius:11,padding:"11px 12px"}}>
                  <div style={{fontSize:8,color:"#888",fontWeight:600,marginBottom:4}}>INDIA VIX</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{vix.toFixed(2)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:vix>15?"#ff4444":vix>13?"#f59e0b":"#39FF14",marginTop:3}}>{vix>15?"High Fear":vix>13?"Caution":"Low Fear"}</div>
                  <div style={{fontSize:7,color:"#445",marginTop:2}}>Volatility index</div>
                </div>
              </div>
            </div>

            <div style={{margin:"0 9px 10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <div style={{fontSize:11,fontWeight:800,color:"#fff"}}>&#128240; Market News</div>
                <button onClick={function(){setTab("news");}} style={{background:"none",border:"none",color:"#39FF14",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>View All &#8250;</button>
              </div>
              {(liveNewsAPI.length>0?liveNewsAPI:NEWS).slice(0,4).map(function(n,i){
                return(
                  <div key={i} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px 11px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start"}}>
                    <div style={{background:"#39FF1415",border:"1px solid #39FF1422",borderRadius:6,padding:"3px 6px",fontSize:6,fontWeight:700,color:"#39FF14",flexShrink:0,marginTop:2}}>{(n.cat||"MKT").substring(0,4).toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#e8e8e8",lineHeight:1.4,marginBottom:2}}>{n.title}</div>
                      <div style={{fontSize:8,color:"#445"}}>{n.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{margin:"8px 9px 0",background:isHoliday?"#1a1200":showMCX?"#0a0800":"#0a1a0a",border:"1px solid "+(isHoliday?"#f59e0b44":showMCX?"#f59e0b44":"#39FF1433"),borderLeft:"4px solid "+mktStatus.color,borderRadius:12,padding:"9px 12px",display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:mktStatus.color,flexShrink:0}}></div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:mktStatus.color}}>{mktStatus.label}</div>
                <div style={{fontSize:9,color:"#556",marginTop:1}}>{mktStatus.sub}</div>
              </div>
            </div>

            {(showStocks||mktStatus.session==="gift")&&(
              <div style={{margin:"6px 9px 0",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
                <div style={{background:"#0d0d0d",border:"1px solid #60a5fa33",borderRadius:9,padding:"7px"}}>
                  <div style={{fontSize:7,color:"#445",marginBottom:1}}>Gift Nifty</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:"#fff"}}>{fN(giftNifty.ltp)}</div>
                  <div style={{fontSize:8,fontWeight:700,color:giftNifty.up?"#39FF14":"#ff4444"}}>{giftNifty.up?"+":"-"}{giftNifty.pct.toFixed(2)}%</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #f59e0b33",borderRadius:9,padding:"7px"}}>
                  <div style={{fontSize:7,color:"#445",marginBottom:1}}>India VIX</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:"#fff"}}>{vix.toFixed(2)}</div>
                  <div style={{fontSize:8,color:vix<15?"#39FF14":vix<20?"#f59e0b":"#ff4444"}}>{vix<15?"Low Fear":vix<20?"Moderate":"High Fear"}</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #39FF1422",borderRadius:9,padding:"7px"}}>
                  <div style={{fontSize:7,color:"#445",marginBottom:1}}>PCR</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:"#39FF14"}}>1.24</div>
                  <div style={{fontSize:8,color:"#39FF14"}}>Bullish</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:9,padding:"7px"}}>
                  <div style={{fontSize:7,color:"#445",marginBottom:1}}>FII</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:"#39FF14"}}>Buy</div>
                  <div style={{fontSize:8,color:"#39FF14"}}>+8245 Cr</div>
                </div>
              </div>
            )}

            {showStocks&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,padding:"6px 9px 0"}}>
                {[{n:"NIFTY 50",d:nifty},{n:"SENSEX",d:sensex}].map(function(item){
                  return(<div key={item.n} style={{background:item.d.up?"#0a1a0a":"#1a0a0a",border:"1px solid "+(item.d.up?"#39FF1422":"#ff444422"),borderRadius:12,padding:"10px"}}>
                    <div style={{fontSize:8,color:"#445",fontWeight:600,marginBottom:2}}>{item.n}</div>
                    <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#fff"}}>{fN(item.d.ltp)}</div>
                    <div style={{fontSize:10,fontWeight:700,color:item.d.up?"#39FF14":"#ff4444",marginTop:1}}>{item.d.up?"+":"-"}{fN(item.d.chg)} ({item.d.pct.toFixed(2)}%)</div>
                  </div>);
                })}
              </div>
            )}

            {showMCX&&(
              <div style={{padding:"6px 9px 0"}}>
                <div style={{fontSize:9,fontWeight:800,color:"#f59e0b",marginBottom:8}}>&#128293; MCX Commodities - Live Evening Session</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {mcx.map(function(c){
                    var up=c.chgPct>=0;
                    return(
                      <div key={c.sym} style={{background:"#0d0d0d",border:"1px solid "+(up?"#f59e0b33":"#ff444422"),borderRadius:12,padding:"10px",cursor:"pointer"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <div style={{fontSize:9,fontWeight:800,color:"#f59e0b"}}>{c.sym}</div>
                          <div style={{fontSize:8,fontWeight:700,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{c.chgPct.toFixed(2)}%</div>
                        </div>
                        <div style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:"#fff"}}>Rs{fN(c.ltp)}</div>
                        <div style={{fontSize:7,color:"#445",marginTop:1}}>{c.unit}</div>
                        <div style={{marginTop:5}}><Spark data={c.spark} color={up?"#f59e0b":"#ff4444"} h={22} w={100}/></div>
                      </div>
                    );
                  })}
                </div>
                <div style={{marginTop:8,background:"#0a0800",border:"1px solid #f59e0b22",borderRadius:9,padding:"8px",fontSize:8,color:"#f59e0b",lineHeight:1.6}}>MCX Evening Session: 5:00 PM - 11:30 PM. Commodity data for educational reference only.</div>
              </div>
            )}

            <div style={{padding:"10px 9px 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#fff"}}>&#128240; Live Business News</div>
              <button onClick={function(){setTab("news");}} style={{background:"none",border:"none",color:"#39FF14",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>View All</button>
            </div>
            {NEWS.slice(0,3).map(function(n){
              return(
                <div key={n.id} style={{margin:"0 9px 6px",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"11px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:7,color:"#39FF14",fontWeight:700,background:"#39FF1415",border:"1px solid #39FF1433",borderRadius:6,padding:"2px 6px"}}>{n.cat}</span>
                    <span style={{fontSize:7,color:"#334"}}>{n.time}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:"#fff",lineHeight:1.4,marginBottom:3}}>{n.title}</div>
                  <div style={{fontSize:9,color:"#556",lineHeight:1.5}}>{n.body}</div>
                </div>
              );
            })}

            <div style={{margin:"10px 9px 0",background:"linear-gradient(135deg,#180800,#0d0500)",border:"1px solid #ff440044",borderRadius:14,padding:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#ff4400",animation:"pulse 1.5s infinite"}}></div>
                  <div style={{fontSize:11,fontWeight:800,color:"#ff5500"}}>LIVE ALERTS</div>
                </div>
                {!isPrem&&<button onClick={function(){setShowSub(true);}} style={{background:"#FFD70018",border:"1px solid #FFD70033",borderRadius:8,padding:"3px 8px",color:"#FFD700",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Unlock</button>}
              </div>
              {liveAlerts.length===0?(
                <div style={{textAlign:"center",padding:"15px 0",color:"#445",fontSize:10}}>Waiting for first alert...</div>
              ):(
                <div>
                  {liveAlerts.slice(0,isPrem?5:1).map(function(a){
                    return(
                      <div key={a.id} style={{background:"#0d0d0d",border:"1px solid "+a.color+"33",borderRadius:10,padding:"9px",marginBottom:5,position:"relative",opacity:isPrem?1:0.7}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:11,fontWeight:900,color:a.color}}>{a.icon}</span>
                            <span style={{fontSize:9,fontWeight:800,color:a.color,letterSpacing:0.5}}>{a.type}</span>
                            <span style={{fontSize:10,fontWeight:800,color:"#fff"}}>{a.stock}</span>
                          </div>
                          <span style={{fontSize:8,color:"#445"}}>{a.time}</span>
                        </div>
                        <div style={{fontSize:10,color:"#ccc",marginBottom:3}}>{a.msg}</div>
                        {isPrem&&(
                          <div style={{background:"#0a1a0a",border:"1px solid #39FF1422",borderRadius:6,padding:"5px 7px",marginTop:5}}>
                            <div style={{fontSize:7,color:"#39FF14",fontWeight:700,marginBottom:2}}>EASY GUIDANCE</div>
                            <div style={{fontSize:9,color:"#aaa"}}>{a.guidance}</div>
                          </div>
                        )}
                        {!isPrem&&(
                          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(2px)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <button onClick={function(){setShowSub(true);}} style={{background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",borderRadius:8,padding:"4px 12px",fontSize:9,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Unlock Premium</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{fontSize:7,color:"#664422",marginTop:6,textAlign:"center"}}>Educational alerts only. Not investment advice.</div>
            </div>

            {showStocks&&(
              <div style={{padding:"0 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingTop:6}}>
                  <div style={{display:"flex",background:"#0d0d0d",borderRadius:20,padding:3,border:"1px solid #1a1a1a"}}>
                    {[["gainers","Gainers"],["losers","Losers"]].map(function(kl){return(<button key={kl[0]} onClick={function(){setGlTab(kl[0]);}} style={{background:glTab===kl[0]?G:"transparent",border:"none",borderRadius:16,padding:"5px 14px",color:glTab===kl[0]?"#000":"#445",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{kl[1]}</button>);})}
                  </div>
                  <button onClick={function(){setTab("markets");}} style={{background:"none",border:"none",color:"#39FF14",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>View All &#8250;</button>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  {[["Large","Large Cap"],["Mid","Mid Cap"]].map(function(kl){return(<button key={kl[0]} onClick={function(){setCapFil(kl[0]);}} style={{background:capFil===kl[0]?"#39FF1418":"#0d0d0d",border:"1.5px solid "+(capFil===kl[0]?"#39FF14":"#1a1a1a"),borderRadius:20,padding:"5px 12px",color:capFil===kl[0]?"#39FF14":"#445",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{kl[1]}</button>);})}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  {(glTab==="gainers"?topG:topL).map(function(st){return(<SCard key={st.sym} st={st} onP={function(){setSelSt(st);setTab("markets");}}/>);})}
                </div>
              </div>
            )}

            <div style={{margin:"0 9px 10px",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:14,padding:"13px"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#60a5fa",marginBottom:10}}>&#128218; Learn: Stock Market Basics</div>
              {[
                {ico:"&#127968;",t:"What is Share Market?",d:"Companies issue shares to raise money. Buy shares = become part-owner. Share price rises when company does well."},
                {ico:"&#128200;",t:"What is NIFTY 50?",d:"Index of India top 50 companies. NIFTY up = Bullish. NIFTY down = Bearish. Watch daily to know market mood."},
                {ico:"&#128202;",t:"What are Gainers and Losers?",d:"Stocks that rose most today = Gainers. Stocks that fell most = Losers. Large Cap = big companies above Rs.20,000 Cr."},
                {ico:"&#128293;",t:"What are Commodities?",d:"Gold, Silver, Crude Oil, Copper traded on MCX. Commodity market open till 11:30 PM. Useful for hedging."},
                {ico:"&#9889;",t:"What is a Breakout?",d:"When stock breaks above key resistance with high volume = Breakout. Study these patterns for learning purposes only."},
              ].map(function(item){
                return(
                  <div key={item.t} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:18,flexShrink:0}} dangerouslySetInnerHTML={{__html:item.ico}}></span>
                    <div><div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:2}}>{item.t}</div><div style={{fontSize:9,color:"#556",lineHeight:1.6}}>{item.d}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="markets"&&(
          <div>
            {selSt?<StockDetail st={selSt} isPrem={isPrem} onBack={function(){setSelSt(null);}} onUp={function(){setShowSub(true);}}/>:(
              <div>
                <div style={{margin:"7px 9px 4px",display:"flex",alignItems:"center",gap:7,background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"9px 11px"}}><span style={{fontSize:13}}>&#128269;</span><input value={srch} onChange={function(e){setSrch(e.target.value);}} placeholder="Search stocks..." style={{flex:1,background:"none",border:"none",outline:"none",color:"#e8eaf0",fontSize:12,fontFamily:"inherit"}}/></div>
                {filtSt.map(function(st){return(<div key={st.sym} style={{display:"flex",alignItems:"center",borderBottom:"1px solid #0d0d0d"}}><div style={{flex:1}}><SRow st={st} onP={function(){setSelSt(st);}} full={true}/></div><button onClick={function(){toggleWL(st.sym);}} style={{background:"none",border:"none",fontSize:20,padding:"0 10px",cursor:"pointer",color:watchlist.includes(st.sym)?"#FFD700":"#333",flexShrink:0}}>{watchlist.includes(st.sym)?"★":"☆"}</button></div>);})}
              </div>
            )}
          </div>
        )}

        {tab==="oi"&&(
          <div>
            <div style={{padding:"12px 12px 0 12px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10,background:"#0a0a0a",padding:4,borderRadius:11,border:"1px solid #1a1a1a"}}>
                <button onClick={function(){setOiView("chain");}} style={{background:oiView==="chain"?"linear-gradient(135deg,#39FF14,#00aa00)":"transparent",color:oiView==="chain"?"#000":"#888",border:"none",borderRadius:9,padding:"9px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Options Chain</button>
                <button onClick={function(){setOiView("chart");}} style={{background:oiView==="chart"?"linear-gradient(135deg,#39FF14,#00aa00)":"transparent",color:oiView==="chart"?"#000":"#888",border:"none",borderRadius:9,padding:"9px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Live Chart</button>
              </div>
              {oiView==="chart"&&(
                <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:13,padding:"10px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:800,color:"#39FF14"}}>NIFTY 50 - Live Chart</div>
                      <div style={{fontSize:8,color:"#666"}}>Real-time | NSE</div>
                    </div>
                    <div style={{background:"#39FF1422",border:"1px solid #39FF1455",borderRadius:8,padding:"3px 8px"}}>
                      <span style={{fontSize:9,fontWeight:700,color:"#39FF14"}}>LIVE</span>
                    </div>
                  </div>
                  <div style={{position:"relative",width:"100%",height:"400px",borderRadius:10,overflow:"hidden",background:"#000"}}>
                    <iframe src="https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#%7B%22autosize%22%3Atrue%2C%22symbol%22%3A%22CAPITALCOM%3AIN50%22%2C%22interval%22%3A%225%22%2C%22timezone%22%3A%22Asia%2FKolkata%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%2C%22locale%22%3A%22en%22%2C%22enable_publishing%22%3Afalse%2C%22hide_top_toolbar%22%3Afalse%2C%22hide_legend%22%3Afalse%2C%22save_image%22%3Afalse%2C%22studies%22%3A%5B%5D%2C%22show_popup_button%22%3Afalse%7D" style={{width:"100%",height:"100%",border:"none"}} allowTransparency="true" scrolling="no"></iframe>
                  </div>
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:7,padding:"9px 9px 4px"}}>
              {["NIFTY","BANKNIFTY"].map(function(t){return(<button key={t} onClick={function(){if(!isPrem){setShowSub(true);return;}setOiIdx(t);}} style={{flex:1,background:oiIdx===t&&isPrem?"#39FF1418":"#0d0d0d",border:"1px solid "+(oiIdx===t&&isPrem?"#39FF1444":"#1a1a1a"),borderRadius:10,padding:"8px",color:oiIdx===t&&isPrem?"#39FF14":"#445",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t} {!isPrem&&"(Lock)"}</button>);})}
            </div>
            {!isPrem?<PGate onUp={function(){setShowSub(true);}}/>:(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,padding:"0 9px 7px"}}>
                  {[["Max Pain",oiIdx==="NIFTY"?"22,500":"48,200","#f59e0b"],["PCR",oiIdx==="NIFTY"?"1.24":"0.88",oiIdx==="NIFTY"?"#39FF14":"#ff4444"],["CE OI","65.4Cr","#ff8888"],["PE OI","53.2Cr","#88ff88"]].map(function(item){return(<div key={item[0]} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px 4px",textAlign:"center"}}><div style={{fontSize:7,color:"#222",fontWeight:600,marginBottom:2}}>{item[0]}</div><div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:item[2]}}>{item[1]}</div></div>);})}
                </div>
                <OChain data={oiIdx==="NIFTY"?OI_NIFTY:OI_BNIFTY}/>
            <div style={{margin:"8px 9px",background:"#0d0d0d",border:"1px solid #FFD70033",borderRadius:14,padding:"10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:9}}>
                <span style={{fontSize:18}}>&#9201;</span>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:"#FFD700"}}>Time Decay Calculator (Theta)</div>
                  <div style={{fontSize:8,color:"#445"}}>How fast premium decays per day</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:8,padding:"7px"}}>
                  <div style={{fontSize:8,color:"#666",marginBottom:2}}>Premium (Rs)</div>
                  <input type="number" defaultValue="100" id="td-premium" style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
                </div>
                <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:8,padding:"7px"}}>
                  <div style={{fontSize:8,color:"#666",marginBottom:2}}>Days to Expiry</div>
                  <input type="number" defaultValue="7" id="td-days" style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
                </div>
              </div>
              <button onClick={function(){var p=parseFloat(document.getElementById("td-premium").value)||100;var d=parseInt(document.getElementById("td-days").value)||7;var theta=p/d;var t1=p-theta;var t2=p-(theta*2);var t3=p-(theta*3);var t5=p-(theta*5);document.getElementById("td-result").innerHTML="<div style=\"background:#1a1500;border:1px solid #FFD70044;border-radius:9px;padding:9px;margin-top:8px\"><div style=\"font-size:10px;color:#FFD700;font-weight:800;margin-bottom:6px\">Theta Decay Projection:</div><div style=\"display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:10px\"><div style=\"color:#aaa\">Daily Decay:</div><div style=\"color:#ff4444;font-weight:700;text-align:right\">Rs."+theta.toFixed(2)+"</div><div style=\"color:#aaa\">After 1 Day:</div><div style=\"color:#fff;font-weight:700;text-align:right\">Rs."+t1.toFixed(2)+"</div><div style=\"color:#aaa\">After 2 Days:</div><div style=\"color:#fff;font-weight:700;text-align:right\">Rs."+t2.toFixed(2)+"</div><div style=\"color:#aaa\">After 3 Days:</div><div style=\"color:#fff;font-weight:700;text-align:right\">Rs."+t3.toFixed(2)+"</div><div style=\"color:#aaa\">After 5 Days:</div><div style=\"color:#fff;font-weight:700;text-align:right\">Rs."+t5.toFixed(2)+"</div></div><div style=\"margin-top:7px;padding:6px;background:#0a0a0a;border-radius:6px;font-size:8px;color:#888;line-height:1.4\"><b style=\"color:#FFD700\">Note:</b> Linear approximation. Actual theta accelerates near expiry. For ATM options, theta is highest in last 7 days.</div></div>";}} style={{width:"100%",background:"#FFD700",color:"#000",border:"none",borderRadius:9,padding:"9px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Calculate Theta Decay</button>
              <div id="td-result"></div>
            </div>


              </div>
            )}
          </div>
        )}


        {tab==="mf"&&(
          <div style={{paddingBottom:10}}>
            <div style={{padding:"14px 12px 8px"}}>
              <div style={{fontSize:15,fontWeight:900,color:"#fff",marginBottom:2}}>&#128184; Mutual Funds & SIP</div>
              <div style={{fontSize:9,color:"#666"}}>Educational only. Not investment advice.</div>
            </div>
            <div style={{margin:"0 12px 12px",background:"linear-gradient(135deg,#0a1a3a,#001a4a)",border:"1px solid #4488ff44",borderRadius:13,padding:"13px"}}>
              <div style={{fontSize:12,fontWeight:800,color:"#88aaff",marginBottom:10}}>&#129518; SIP Calculator</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                {[["sip-amt","Monthly SIP (Rs)","5000"],["sip-yrs","Years","10"],["sip-ret","Return % p.a.","12"],["sip-step","Step-Up % /yr","10"]].map(function(f){return(<div key={f[0]} style={{background:"#0a0a1a",border:"1px solid #1a2a4a",borderRadius:8,padding:"8px"}}><div style={{fontSize:7,color:"#88aaff",marginBottom:2}}>{f[1]}</div><input type="number" id={f[0]} defaultValue={f[2]} style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:14,fontWeight:700,outline:"none",fontFamily:"inherit"}}/></div>);})}
              </div>
              <button onClick={function(){
                var amt=parseFloat(document.getElementById("sip-amt").value)||5000;
                var yrs=parseInt(document.getElementById("sip-yrs").value)||10;
                var ret=parseFloat(document.getElementById("sip-ret").value)||12;
                var step=parseFloat(document.getElementById("sip-step").value)||0;
                var r=ret/100/12;var invested=0;var value=0;var monthly=amt;
                for(var y=0;y<yrs;y++){for(var m=0;m<12;m++){invested+=monthly;value=(value+monthly)*(1+r);}monthly=monthly*(1+step/100);}
                var gain=value-invested;
                function fc(n){return n>=1e7?(n/1e7).toFixed(2)+" Cr":n>=1e5?(n/1e5).toFixed(2)+" L":"Rs."+n.toFixed(0);}
                document.getElementById("sip-result").innerHTML="<div style='background:#0a1a0a;border:1px solid #39FF1433;border-radius:10px;padding:11px;margin-top:8px'><div style='font-size:10px;color:#39FF14;font-weight:800;margin-bottom:7px'>SIP Growth in "+yrs+" years</div><div style='display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:10px'><div style='color:#888'>Invested:</div><div style='color:#fff;font-weight:700;text-align:right'>"+fc(invested)+"</div><div style='color:#888'>Returns:</div><div style='color:#39FF14;font-weight:700;text-align:right'>"+fc(gain)+"</div><div style='color:#888'>Total Value:</div><div style='color:#FFD700;font-weight:800;font-size:14px;text-align:right'>"+fc(value)+"</div></div><div style='margin-top:6px;font-size:7px;color:#445'>Indicative only. Actual returns vary.</div></div>";
              }} style={{width:"100%",background:"linear-gradient(135deg,#4488ff,#2255cc)",border:"none",borderRadius:9,padding:"11px",fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Calculate Returns</button>
              <div id="sip-result"></div>
            </div>
            <div style={{padding:"0 12px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#fff"}}>Top Funds (Educational)</div>
              <div style={{fontSize:8,color:"#555"}}>Consult SEBI advisor</div>
            </div>
            {MF_DATA.map(function(f){
              var rc=f.risk==="Low"?"#39FF14":f.risk==="Moderate"?"#f59e0b":f.risk==="High"?"#ff8844":"#ff4444";
              var stars="";for(var i=0;i<f.rating;i++){stars+="★";}for(var j=f.rating;j<5;j++){stars+="☆";}
              return(<div key={f.name} style={{margin:"0 12px 8px",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"11px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:800,color:"#fff",lineHeight:1.3}}>{f.name}</div>
                    <div style={{fontSize:8,color:"#555",marginTop:1}}>{f.cat} | AUM {f.aum}</div>
                    <div style={{fontSize:10,color:"#FFD700"}}>{stars}</div>
                  </div>
                  <div style={{background:rc+"22",border:"1px solid "+rc+"44",borderRadius:7,padding:"2px 7px",fontSize:7,fontWeight:700,color:rc,flexShrink:0}}>{f.risk}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
                  {[["1Y",f.ret1y+"%",f.ret1y>20?"#39FF14":"#f59e0b"],["3Y",f.ret3y+"%","#60a5fa"],["5Y",f.ret5y+"%","#a78bfa"]].map(function(r){return(<div key={r[0]} style={{background:"#080808",borderRadius:7,padding:"6px",textAlign:"center"}}><div style={{fontSize:7,color:"#445",marginBottom:2}}>{r[0]} Return</div><div style={{fontSize:12,fontWeight:800,color:r[2]}}>{r[1]}</div></div>);})}
                </div>
              </div>);
            })}
            <div style={{margin:"4px 12px 0",background:"#0a0500",border:"1px solid #ff440018",borderRadius:9,padding:"9px",fontSize:8,color:"#cc6622",lineHeight:1.6}}>MF investments subject to market risks. Past returns not guaranteed. Educational only.</div>
          </div>
        )}

        {tab==="watch"&&(
          <div style={{padding:"16px 12px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:"#FFD700"}}>★ My Watchlist</div>
                <div style={{fontSize:9,color:"#666",marginTop:2}}>{watchlist.length} stocks saved</div>
              </div>
              {watchlist.length>0&&<button onClick={function(){setWatchlist([]);try{localStorage.removeItem("bp_wl");}catch(e){}}} style={{background:"#1a0a0a",border:"1px solid #ff444433",borderRadius:8,padding:"5px 10px",color:"#ff6666",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>}
            </div>
            {watchlist.length===0?(
              <div style={{textAlign:"center",padding:"60px 20px",color:"#555"}}>
                <div style={{fontSize:52,marginBottom:12}}>☆</div>
                <div style={{fontSize:14,fontWeight:700,color:"#444",marginBottom:6}}>Watchlist empty</div>
                <div style={{fontSize:11,color:"#555",lineHeight:1.6}}>Markets tab lo stocks chusi{" "}<span style={{color:"#FFD700"}}>★</span> star tap cheyandi</div>
              </div>
            ):(
              <div>
                {watchlist.map(function(sym){
                  var st=stocks.find(function(s){return s.sym===sym;});
                  if(!st){return null;}
                  var up=st.chgPct>=0;
                  return(
                    <div key={sym} onClick={function(){setSelSt(st);setTab("markets");}} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{st.sym}</div>
                        <div style={{fontSize:9,color:"#555",marginTop:2}}>{st.name}</div>
                        <div style={{fontSize:9,color:up?"#39FF14":"#ff4444",marginTop:3,fontWeight:700}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#fff"}}>Rs{st.ltp.toFixed(0)}</div>
                          <div style={{fontSize:9,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div>
                        </div>
                        <button onClick={function(e){e.stopPropagation();toggleWL(sym);}} style={{background:"none",border:"none",fontSize:22,color:"#FFD700",cursor:"pointer",padding:"4px"}}>★</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab==="news"&&(
          <div>
            <div style={{padding:"7px 9px 5px",display:"flex",gap:4,overflowX:"auto"}}>
              {allCats.map(function(c){return(<button key={c} onClick={function(){setNFil(c);}} style={{background:nFil===c?"#39FF1418":"#0d0d0d",border:"1px solid "+(nFil===c?"#39FF1444":"#1a1a1a"),borderRadius:16,padding:"3px 8px",color:nFil===c?"#39FF14":"#334",fontSize:8,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{c}</button>);})}
            </div>
            {filtNs.map(function(n){return(<div key={n.id} style={{margin:"4px 9px",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"11px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:7,color:"#39FF14",fontWeight:700,background:"#39FF1415",border:"1px solid #39FF1433",borderRadius:6,padding:"2px 6px"}}>{n.cat}</span><span style={{fontSize:7,color:"#222"}}>{n.time}</span></div><div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:4,lineHeight:1.4}}>{n.title}</div><div style={{fontSize:9,color:"#556",lineHeight:1.6}}>{n.body}</div>{n.notif&&<div style={{marginTop:5,fontSize:7,color:"#f59e0b"}}>Alert sent</div>}</div>);})}
          </div>
        )}

        {tab==="ipo"&&(
          <div>
            <div style={{padding:"10px 9px 6px"}}>
              <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:3}}>IPO Analysis</div>
              <div style={{fontSize:9,color:"#445"}}>Upcoming and live IPOs with deep fundamentals</div>
            </div>

            <div style={{margin:"4px 9px 8px",background:"linear-gradient(135deg,#0a1a0a,#1a3a1a)",border:"1px solid #39FF1433",borderRadius:12,padding:"10px",fontSize:9,color:"#aaa",lineHeight:1.6}}>
              <b style={{color:"#39FF14"}}>How to read:</b> GRADE A=Strong, B=Good, C=Risky. GMP=Grey Market Premium. All analysis EDUCATIONAL only.
            </div>

            {IPO_DATA.map(function(ipo){
              var gc = ipo.verdict==="GOOD"?"#39FF14":ipo.verdict==="AVERAGE"?"#f59e0b":"#ff4444";
              return (
                <div key={ipo.sym} style={{margin:"0 9px 10px",background:"#0d0d0d",border:"1px solid #1a1a1a",borderLeft:"4px solid "+gc,borderRadius:12,padding:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#fff"}}>{ipo.name}</div>
                      <div style={{fontSize:8,color:"#445",marginTop:1}}>{ipo.sector} | {ipo.sym}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{background:gc+"22",border:"1px solid "+gc+"55",borderRadius:8,padding:"3px 8px",display:"inline-block"}}>
                        <span style={{fontSize:10,fontWeight:900,color:gc}}>{ipo.verdict}</span>
                      </div>
                      <div style={{fontSize:8,color:"#666",marginTop:2}}>Grade: <b style={{color:gc}}>{ipo.grade}</b> ({ipo.rating}/10)</div>
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:8}}>
                    <div style={{background:"#080808",borderRadius:7,padding:"6px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:"#445"}}>OPEN</div>
                      <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>{ipo.open}</div>
                    </div>
                    <div style={{background:"#080808",borderRadius:7,padding:"6px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:"#445"}}>CLOSE</div>
                      <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>{ipo.close}</div>
                    </div>
                    <div style={{background:"#080808",borderRadius:7,padding:"6px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:"#445"}}>LISTING</div>
                      <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>{ipo.listing}</div>
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
                    <div style={{background:"#0a1a0a",border:"1px solid #39FF1422",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#445",marginBottom:1}}>Price Band</div>
                      <div style={{fontSize:11,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{ipo.priceBand}</div>
                      <div style={{fontSize:7,color:"#666"}}>Lot: {ipo.lotSize} = {ipo.minInvest}</div>
                    </div>
                    <div style={{background:"#1a1000",border:"1px solid #f59e0b33",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#445",marginBottom:1}}>GMP (Grey Market)</div>
                      <div style={{fontSize:11,fontWeight:800,color:"#f59e0b",fontFamily:"monospace"}}>{ipo.gmp}</div>
                      <div style={{fontSize:7,color:"#666"}}>Issue: {ipo.issueSize}</div>
                    </div>
                  </div>

                  <div style={{background:"#080808",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px",marginBottom:8}}>
                    <div style={{fontSize:8,fontWeight:700,color:"#60a5fa",marginBottom:5}}>FUNDAMENTALS</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                      <div><div style={{fontSize:7,color:"#445"}}>Revenue</div><div style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{ipo.fundamentals.revenue}</div></div>
                      <div><div style={{fontSize:7,color:"#445"}}>Profit</div><div style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{ipo.fundamentals.profit}</div></div>
                      <div><div style={{fontSize:7,color:"#445"}}>P/E</div><div style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{ipo.fundamentals.pe}</div></div>
                      <div><div style={{fontSize:7,color:"#445"}}>P/B</div><div style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{ipo.fundamentals.pb}</div></div>
                      <div><div style={{fontSize:7,color:"#445"}}>ROE</div><div style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{ipo.fundamentals.roe}</div></div>
                      <div><div style={{fontSize:7,color:"#445"}}>Debt</div><div style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{ipo.fundamentals.debt}</div></div>
                    </div>
                  </div>

                  <div style={{marginBottom:7}}>
                    <div style={{fontSize:8,fontWeight:700,color:"#39FF14",marginBottom:4}}>+ STRENGTHS</div>
                    {ipo.pros.map(function(p,i){return(<div key={i} style={{fontSize:9,color:"#aaa",paddingLeft:8,marginBottom:2,lineHeight:1.5}}>+ {p}</div>);})}
                  </div>

                  <div style={{marginBottom:7}}>
                    <div style={{fontSize:8,fontWeight:700,color:"#ff4444",marginBottom:4}}>- RISKS</div>
                    {ipo.cons.map(function(c,i){return(<div key={i} style={{fontSize:9,color:"#aaa",paddingLeft:8,marginBottom:2,lineHeight:1.5}}>- {c}</div>);})}
                  </div>

                  <div style={{background:gc+"11",border:"1px solid "+gc+"33",borderRadius:8,padding:"7px",fontSize:8,color:gc,textAlign:"center",fontWeight:700}}>
                    Educational Verdict: {ipo.verdict} - {ipo.rating}/10
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="fii"&&(
          <div>
            <div style={{padding:"10px 9px 6px"}}>
              <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:3}}>FII / DII Activity</div>
              <div style={{fontSize:9,color:"#445"}}>Foreign and Domestic Institutional Investor data</div>
            </div>

            <div style={{margin:"4px 9px 10px",background:"linear-gradient(135deg,#0a0a1a,#1a1a3a)",border:"1px solid #60a5fa33",borderRadius:12,padding:"12px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#60a5fa",marginBottom:8,letterSpacing:1}}>THIS MONTH SUMMARY</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background:"#0a0500",border:"1px solid #ff444433",borderRadius:9,padding:"10px"}}>
                  <div style={{fontSize:8,color:"#445",marginBottom:2}}>FII (Foreign)</div>
                  <div style={{fontFamily:"monospace",fontSize:16,fontWeight:900,color:"#ff4444"}}>{FII_DII_MONTHLY.fii_total} Cr</div>
                  <div style={{fontSize:9,fontWeight:700,color:"#ff4444",marginTop:2}}>{FII_DII_MONTHLY.fii_trend} {FII_DII_MONTHLY.fii_pct}%</div>
                </div>
                <div style={{background:"#0a1a0a",border:"1px solid #39FF1433",borderRadius:9,padding:"10px"}}>
                  <div style={{fontSize:8,color:"#445",marginBottom:2}}>DII (Domestic)</div>
                  <div style={{fontFamily:"monospace",fontSize:16,fontWeight:900,color:"#39FF14"}}>+{FII_DII_MONTHLY.dii_total} Cr</div>
                  <div style={{fontSize:9,fontWeight:700,color:"#39FF14",marginTop:2}}>{FII_DII_MONTHLY.dii_trend} +{FII_DII_MONTHLY.dii_pct}%</div>
                </div>
              </div>
              <div style={{marginTop:8,padding:"7px",background:"#080808",borderRadius:7,fontSize:9,color:"#aaa",textAlign:"center"}}>DII buying compensates FII selling - Market stable</div>
            </div>

            <div style={{padding:"4px 9px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#fff",marginBottom:6,letterSpacing:1}}>DAILY ACTIVITY (Cr)</div>
            </div>
            {FII_DII_DATA.map(function(d,i){
              return (
                <div key={i} style={{margin:"0 9px 5px",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:11,padding:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#fff"}}>{d.date}</div>
                    <div style={{background:d.sentiment==="Bullish"?"#39FF1418":d.sentiment==="Bearish"?"#ff444418":"#f59e0b18",border:"1px solid "+(d.sentiment==="Bullish"?"#39FF1444":d.sentiment==="Bearish"?"#ff444444":"#f59e0b44"),borderRadius:7,padding:"2px 8px"}}>
                      <span style={{fontSize:8,fontWeight:700,color:d.sentiment==="Bullish"?"#39FF14":d.sentiment==="Bearish"?"#ff4444":"#f59e0b"}}>{d.sentiment}</span>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                    <div style={{background:"#080808",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#445",marginBottom:1}}>FII Equity</div>
                      <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:d.fii_eq>=0?"#39FF14":"#ff4444"}}>{d.fii_eq>0?"+":""}{d.fii_eq} Cr</div>
                    </div>
                    <div style={{background:"#080808",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#445",marginBottom:1}}>DII Equity</div>
                      <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:d.dii_eq>=0?"#39FF14":"#ff4444"}}>{d.dii_eq>0?"+":""}{d.dii_eq} Cr</div>
                    </div>
                    <div style={{background:"#080808",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#445",marginBottom:1}}>FII F&O</div>
                      <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:d.fii_fo>=0?"#39FF14":"#ff4444"}}>{d.fii_fo>0?"+":""}{d.fii_fo} Cr</div>
                    </div>
                    <div style={{background:"#080808",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#445",marginBottom:1}}>Net Flow</div>
                      <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:(d.fii_eq+d.dii_eq)>=0?"#39FF14":"#ff4444"}}>{(d.fii_eq+d.dii_eq)>0?"+":""}{d.fii_eq+d.dii_eq} Cr</div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{margin:"10px 9px",background:"linear-gradient(135deg,#0a1a1a,#0a2a2a)",border:"1px solid #60a5fa33",borderRadius:12,padding:"12px"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#60a5fa",marginBottom:10}}>EASY GUIDE - How to Read FII/DII</div>
              {[
                {t:"FII Selling + DII Buying",d:"Market sideways. DII supports the fall.",c:"#f59e0b"},
                {t:"FII Buying + DII Buying",d:"VERY BULLISH! Strong rally possible.",c:"#39FF14"},
                {t:"FII Selling + DII Selling",d:"BEARISH! Both exiting. Stay cautious.",c:"#ff4444"},
                {t:"FII F&O Long",d:"Hedge funds bullish. Watch for upside.",c:"#39FF14"},
                {t:"FII F&O Short",d:"Hedge funds bearish. Risk of correction.",c:"#ff4444"},
              ].map(function(g){
                return (
                  <div key={g.t} style={{display:"flex",gap:8,marginBottom:8,paddingBottom:8,borderBottom:"1px solid #111"}}>
                    <div style={{width:4,background:g.c,borderRadius:2,flexShrink:0}}></div>
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:g.c,marginBottom:2}}>{g.t}</div>
                      <div style={{fontSize:9,color:"#aaa",lineHeight:1.5}}>{g.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="learn"&&(
          <div>
            <div style={{padding:"14px 12px 8px 12px"}}>
              <div style={{fontSize:14,fontWeight:800,color:"#39FF14",marginBottom:3}}>Learn Stock Market</div>
              <div style={{fontSize:9,color:"#666",marginBottom:14}}>From Zero to Expert - All Free!</div>
              
              <div style={{background:"linear-gradient(135deg,#0a1a3a,#001a4a)",border:"1px solid #4488ff44",borderRadius:13,padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>&#127891;</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:"#88aaff"}}>For Absolute Beginners</div>
                    <div style={{fontSize:8,color:"#666"}}>Start your journey here</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <a href="https://zerodha.com/varsity/chapter/introduction-to-stock-markets/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128218;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>What is Stock Market?</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Zerodha Varsity</div></a>
                  <a href="https://groww.in/p/savings-plans/demat-account" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128179;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>How to Open Demat?</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Step by step guide</div></a>
                  <a href="https://www.investopedia.com/terms/b/bullmarket.asp" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128200;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Bull vs Bear Market</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Investopedia</div></a>
                  <a href="https://zerodha.com/varsity/chapter/buying-your-first-stocks/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#127919;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>First Stock Buy</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Beginner guide</div></a>
                </div>
              </div>

              <div style={{background:"linear-gradient(135deg,#0a3a1a,#003a2a)",border:"1px solid #44ff8844",borderRadius:13,padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>&#128202;</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:"#88ffaa"}}>Technical Analysis</div>
                    <div style={{fontSize:8,color:"#666"}}>Chart reading mastery</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <a href="https://zerodha.com/varsity/module/technical-analysis/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128301;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Candlestick Basics</div><div style={{fontSize:7,color:"#666",marginTop:3}}>23+ patterns</div></a>
                  <a href="https://zerodha.com/varsity/chapter/support-and-resistance/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128071;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Support/Resistance</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Key levels</div></a>
                  <a href="https://zerodha.com/varsity/chapter/indicators/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128293;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>RSI &amp; MACD</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Momentum tools</div></a>
                  <a href="https://zerodha.com/varsity/chapter/volume-quantity/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128201;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Volume Analysis</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Smart money</div></a>
                </div>
              </div>

              <div style={{background:"linear-gradient(135deg,#3a0a1a,#4a001a)",border:"1px solid #ff448844",borderRadius:13,padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>&#127919;</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:"#ff88aa"}}>Options Trading</div>
                    <div style={{fontSize:8,color:"#666"}}>Advanced strategies</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <a href="https://zerodha.com/varsity/module/option-theory/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#128221;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Options Basics</div><div style={{fontSize:7,color:"#666",marginTop:3}}>CE/PE explained</div></a>
                  <a href="https://zerodha.com/varsity/chapter/greeks-and-black-scholes/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#129518;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Greeks Explained</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Delta/Theta/Vega</div></a>
                  <a href="https://zerodha.com/varsity/module/option-strategies/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#127919;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Strategies</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Iron Condor etc</div></a>
                  <a href="https://zerodha.com/varsity/chapter/risk-management-and-trading-psychology/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}><div style={{fontSize:14,marginBottom:3}}>&#9889;</div><div style={{fontSize:9,fontWeight:700,color:"#fff",lineHeight:1.3}}>Risk Management</div><div style={{fontSize:7,color:"#666",marginTop:3}}>Capital protect</div></a>
                </div>
              </div>

              <div style={{background:"linear-gradient(135deg,#3a2a0a,#4a3a00)",border:"1px solid #ffaa4444",borderRadius:12,padding:"11px",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:800,color:"#ffcc88",marginBottom:7}}>&#127909; YouTube Channels</div>
                {[["PR Sundar","Options","https://www.youtube.com/@PRSentinel"],["Pushkar Raj","Trading","https://www.youtube.com/@PushkarRajThakur"],["CA Ravi Nigam","Tax+MF","https://www.youtube.com/@CAR_RAVI_BHUSHAN_NIGAM"],["Market Guru","Technical","https://www.youtube.com/@MarketGuruIndia"]].map(function(ch){return(<a key={ch[0]} href={ch[2]} target="_blank" rel="noopener" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #2a2000",textDecoration:"none"}}><span style={{fontSize:9,fontWeight:700,color:"#fff"}}>{ch[0]}</span><span style={{fontSize:8,color:"#f59e0b"}}>{ch[1]} &#8250;</span></a>);})}
              </div>

              <div style={{background:"linear-gradient(135deg,#2a0a3a,#3a0a4a)",border:"1px solid #aa44ff44",borderRadius:13,padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>&#128218;</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:"#cc88ff"}}>Free Resources</div>
                    <div style={{fontSize:8,color:"#666"}}>Best learning platforms</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6}}>
                  <a href="https://zerodha.com/varsity/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"11px 10px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:11,fontWeight:700,color:"#39FF14"}}>Zerodha Varsity</div><div style={{fontSize:8,color:"#666",marginTop:2}}>India top free trading school - 16 modules</div></div><div style={{fontSize:14}}>&#9656;</div></a>
                  <a href="https://nseindia.com/learn/center-for-excellence" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"11px 10px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:11,fontWeight:700,color:"#39FF14"}}>NSE Academy</div><div style={{fontSize:8,color:"#666",marginTop:2}}>Official NSE courses (paid + free)</div></div><div style={{fontSize:14}}>&#9656;</div></a>
                  <a href="https://www.sebi.gov.in/investors.html" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"11px 10px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:11,fontWeight:700,color:"#39FF14"}}>SEBI Investor Education</div><div style={{fontSize:8,color:"#666",marginTop:2}}>Official regulator guides</div></div><div style={{fontSize:14}}>&#9656;</div></a>
                </div>
              </div>

              <div style={{background:"#0a1a0a",border:"1px solid #39FF1422",borderRadius:10,padding:"10px",marginBottom:10}}>
                <div style={{fontSize:10,color:"#39FF14",fontWeight:700,marginBottom:5}}>&#9888; Educational Disclaimer</div>
                <div style={{fontSize:8,color:"#aaa",lineHeight:1.5}}>All resources are for educational purposes only. Not investment advice. Consult SEBI registered advisors for investment decisions. External links open in new tab.</div>
              </div>
            </div>

            <div style={{padding:"9px 9px 4px",fontSize:8,color:"#222",fontWeight:700,letterSpacing:1}}>FREE BOOKS - EDUCATIONAL</div>
            {FREE_BOOKS.map(function(item){return(<div key={item[0]} style={{margin:"4px 9px",background:"#0d1000",border:"1px solid #1a2a1a",borderRadius:11,padding:"10px",display:"flex",gap:9,alignItems:"center"}}><div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:2}}>{item[0]}</div><span style={{fontSize:7,color:"#39FF14",background:"#39FF1415",border:"1px solid #39FF1433",borderRadius:5,padding:"1px 5px"}}>{item[1]} pages - Free</span></div><button style={{background:"#39FF14",border:"none",borderRadius:8,padding:"5px 8px",fontSize:9,fontWeight:800,color:"#000",cursor:"pointer"}}>PDF</button></div>);})}
            <div style={{padding:"9px 9px 4px",fontSize:8,color:"#FFD700",fontWeight:700,letterSpacing:1}}>PREMIUM BOOKS</div>
            {PREM_BOOKS.map(function(item){return(<div key={item[0]} style={{margin:"4px 9px",background:"#1a1000",border:"1px solid #FFD70022",borderRadius:11,padding:"10px",display:"flex",gap:9,alignItems:"center",opacity:isPrem?1:0.7}}><div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:2}}>{item[0]}</div><span style={{fontSize:7,color:"#FFD700",background:"#FFD70015",border:"1px solid #FFD70033",borderRadius:5,padding:"1px 5px"}}>{item[1]} pages - Premium</span></div>{isPrem?<button style={{background:"#FFD700",border:"none",borderRadius:8,padding:"5px 8px",fontSize:9,fontWeight:800,color:"#000",cursor:"pointer"}}>PDF</button>:<button onClick={function(){setShowSub(true);}} style={{background:"#FFD70018",border:"1px solid #FFD70033",borderRadius:8,padding:"5px 8px",fontSize:9,fontWeight:700,color:"#FFD700",cursor:"pointer"}}>Unlock</button>}</div>);})}
          </div>
        )}

        {tab==="admin"&&isAdmin&&(
          <div style={{padding:"10px 9px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div><div style={{fontSize:13,fontWeight:800,color:"#a855f7"}}>Admin Panel</div><div style={{fontSize:9,color:"#39FF14"}}>BREAKOUT PRO - Full Access</div></div>
              <div style={{background:"#a855f722",border:"1px solid #a855f744",borderRadius:10,padding:"4px 10px",fontSize:9,color:"#a855f7",fontWeight:700}}>ADMIN</div>
            </div>
            <div style={{background:"linear-gradient(135deg,#0a1a0a,#1a3a1a)",border:"1px solid #39FF1444",borderRadius:14,padding:"14px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:800,color:"#39FF14",marginBottom:10}}>Share Breakout Alert</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                {[["Stock Symbol","sym","TATASTEEL"],["Price Rs","ltp","158.40"],["Change %","chg","+3.24%"],["Target Rs","target","172"],["Stop Loss Rs","sl","148"]].map(function(f){return(<div key={f[1]}><div style={{fontSize:8,color:"#445",marginBottom:3}}>{f[0]}</div><input value={shareStock[f[1]]||""} onChange={function(e){var v=e.target.value;setShareStock(function(p){var o=Object.assign({},p);o[f[1]]=v;return o;});}} placeholder={f[2]} style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:8,padding:"8px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>);})}
                <div><div style={{fontSize:8,color:"#445",marginBottom:3}}>Signal Type</div><select value={shareStock.type} onChange={function(e){var v=e.target.value;setShareStock(function(p){return Object.assign({},p,{type:v});});}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:8,padding:"8px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}><option>Bullish Breakout</option><option>Bearish Breakdown</option><option>Gap Up Breakout</option><option>Cup and Handle</option><option>Bull Flag</option><option>Support Bounce</option><option>Resistance Break</option></select></div>
              </div>
              <div style={{marginBottom:8}}><div style={{fontSize:8,color:"#445",marginBottom:3}}>Zone / Note</div><input value={shareStock.zone||""} onChange={function(e){var v=e.target.value;setShareStock(function(p){return Object.assign({},p,{zone:v});});}} placeholder="eg: Above 155 resistance with high volume" style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:8,padding:"8px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
              {shareStock.sym&&(
                <div style={{background:"#000",border:"1px solid #39FF1433",borderRadius:10,padding:"10px",marginBottom:10,fontFamily:"monospace",fontSize:9,color:"#39FF14",lineHeight:1.8}}>
                  <div style={{color:"#ff5500",fontWeight:800}}>PREVIEW - BREAKOUT PRO Alert</div>
                  <div style={{color:"#fff",fontWeight:700,marginTop:3}}>{shareStock.sym} Rs.{shareStock.ltp} {shareStock.chg}</div>
                  <div style={{color:"#f59e0b"}}>{shareStock.type}</div>
                  {shareStock.zone&&<div style={{color:"#aaa"}}>Zone: {shareStock.zone}</div>}
                  {shareStock.target&&<div style={{color:"#39FF14"}}>Target: Rs.{shareStock.target}</div>}
                  {shareStock.sl&&<div style={{color:"#ff4444"}}>Stop Loss: Rs.{shareStock.sl}</div>}
                  <div style={{color:"#555",marginTop:4,fontSize:8}}>Educational only | {appLink}</div>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="BREAKOUT PRO - BREAKOUT ALERT\n\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+"\n"+shareStock.type+"\n"+(shareStock.zone?shareStock.zone+"\n":"")+(shareStock.target?"Target: Rs."+shareStock.target+"\n":"")+(shareStock.sl?"SL: Rs."+shareStock.sl+"\n":"")+"\nFull analysis subscribe:\n"+appLink+"\n\nEducational only. Not investment advice.";window.open("https://t.me/share/url?url="+encodeURIComponent(appLink)+"&text="+encodeURIComponent(msg),"_blank");setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"Telegram"}].concat(p);});}} style={{background:"linear-gradient(135deg,#0088cc,#006699)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Telegram</button>
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="BREAKOUT PRO BREAKOUT ALERT\n\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+"\n"+shareStock.type+"\n"+(shareStock.target?"Target Rs."+shareStock.target+" ":"")+(shareStock.sl?"SL Rs."+shareStock.sl:"")+"\n\n"+appLink+"\n#breakoutpro #breakout";if(navigator.clipboard){navigator.clipboard.writeText(msg).then(function(){alert("Copied for Instagram!");});}setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"Instagram"}].concat(p);});}} style={{background:"linear-gradient(135deg,#f09433,#dc2743,#cc2366)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Instagram</button>
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="BREAKOUT PRO Alert\n\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+"\n"+shareStock.type+"\n"+(shareStock.target?"T:Rs."+shareStock.target+" ":"")+(shareStock.sl?"SL:Rs."+shareStock.sl:"")+"\n\n"+appLink+"\nEducational only.";window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"WhatsApp"}].concat(p);});}} style={{background:"linear-gradient(135deg,#25D366,#128C7E)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>WhatsApp</button>
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="StocksBuddy Alert\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+" "+shareStock.type+"\n"+(shareStock.target?"T:"+shareStock.target+" ":"")+(shareStock.sl?"SL:"+shareStock.sl:"")+"\n"+appLink+"\n#breakoutpro #breakout #nifty";window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(msg),"_blank");setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"Twitter"}].concat(p);});}} style={{background:"#000",border:"1px solid #333",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Twitter/X</button>
              </div>
            </div>
            <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"12px",marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:"#f59e0b",marginBottom:6}}>App Subscribe Link</div>
              <input value={appLink} onChange={function(e){setAppLink(e.target.value);}} style={{width:"100%",background:"#080808",border:"1px solid #1a2a1a",borderRadius:8,padding:"8px",color:"#39FF14",fontSize:11,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
            </div>
            {alertsSent.length>0&&(
              <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"12px",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:8}}>Recent Alerts</div>
                {alertsSent.slice(0,5).map(function(a,i){return(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #111",fontSize:10}}><span style={{color:"#39FF14",fontWeight:700}}>{a.sym}</span><span style={{color:"#60a5fa"}}>{a.via}</span><span style={{color:"#334"}}>{a.time}</span></div>);})}
              </div>
            )}

            {/* ADD NEWS SECTION */}
            <div style={{background:"linear-gradient(135deg,#0a0a1a,#1a1a3a)",border:"1px solid #60a5fa44",borderRadius:14,padding:"14px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:800,color:"#60a5fa",marginBottom:10}}>Add Breaking News</div>
              <div style={{marginBottom:7}}>
                <div style={{fontSize:8,color:"#445",marginBottom:3}}>Category</div>
                <select value={newsForm.cat} onChange={function(e){var v=e.target.value;setNewsForm(function(p){return Object.assign({},p,{cat:v});});}} style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:8,padding:"8px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}>
                  <option>Market</option><option>RBI</option><option>Results</option><option>Breakout</option><option>Economy</option><option>Business</option><option>Auto</option><option>SEBI</option><option>Global</option><option>NSE</option><option>BSE</option><option>Options</option>
                </select>
              </div>
              <div style={{marginBottom:7}}>
                <div style={{fontSize:8,color:"#445",marginBottom:3}}>News Title</div>
                <input value={newsForm.title} onChange={function(e){var v=e.target.value;setNewsForm(function(p){return Object.assign({},p,{title:v});});}} placeholder="eg: NSE extends trading hours to 3:40 PM" style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:8,padding:"8px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:7}}>
                <div style={{fontSize:8,color:"#445",marginBottom:3}}>News Body / Details</div>
                <textarea value={newsForm.body} onChange={function(e){var v=e.target.value;setNewsForm(function(p){return Object.assign({},p,{body:v});});}} placeholder="Brief news details..." rows={3} style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a2a1a",borderRadius:8,padding:"8px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
              </div>
              <button onClick={function(){
                if(!newsForm.title||!newsForm.body){alert("Title and Body required!");return;}
                var newItem={id:Date.now(),cat:newsForm.cat,title:newsForm.title,body:newsForm.body,time:nowT(),notif:true};
                setCustomNews(function(p){return [newItem].concat(p);});
                if(soundOn){playAlert();}
                setNewsForm({cat:"Market",title:"",body:""});
                alert("News added! Sent to all users.");
              }} style={{width:"100%",background:"linear-gradient(135deg,#60a5fa,#3b82f6)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Publish News (Alert All Users)</button>

              {customNews.length>0&&(
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #1a2a3a"}}>
                  <div style={{fontSize:9,color:"#60a5fa",fontWeight:700,marginBottom:6}}>Published Today ({customNews.length})</div>
                  {customNews.slice(0,3).map(function(n){
                    return (
                      <div key={n.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",fontSize:9}}>
                        <span style={{color:"#39FF14",fontWeight:700}}>{n.cat}</span>
                        <span style={{flex:1,marginLeft:7,color:"#aaa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</span>
                        <span style={{color:"#334"}}>{n.time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.98)",borderTop:"1px solid #0d0d0d",display:"flex",justifyContent:"space-around",padding:"5px 3px 10px",zIndex:100}}>
        {[["home","&#127968;","Home"],["watch","&#11088;","Watch"],["mf","&#128184;","MF/SIP"],["markets","&#128200;","Stocks"],["oi","&#128202;","OI"],["news","&#128240;","News"],["learn","&#128218;","Learn"]].concat(isAdmin?[["admin","&#128081;","Admin"]]:[]).map(function(item){
          return(<button key={item[0]} onClick={function(){setSelSt(null);setTab(item[0]);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:tab===item[0]?"#39FF1010":"transparent",border:"none",cursor:"pointer",padding:"4px 5px",borderRadius:9,minWidth:40,fontFamily:"inherit"}}>
            <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:item[1]}}></span>
            <span style={{fontSize:7,color:tab===item[0]?"#39FF14":"#1a1a1a",fontWeight:600,whiteSpace:"nowrap"}}>{item[2]}</span>
          </button>);
        })}
      </div>

      {showNot&&(
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:150,background:"rgba(0,0,0,0.88)",display:"flex",flexDirection:"column"}}>
          <div style={{flex:1}} onClick={function(){setShowNot(false);}}></div>
          <div style={{background:"#0d0d0d",borderTop:"1px solid #1a1a1a",maxHeight:"74vh",overflowY:"auto",borderRadius:"18px 18px 0 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"13px 15px 9px",borderBottom:"1px solid #0c0c0c"}}><div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Notifications</div><button onClick={function(){setReadN(notifNews.map(function(n){return n.id;}));setShowNot(false);}} style={{background:"none",border:"none",color:"#39FF14",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Mark all read</button></div>
            {notifNews.map(function(n){var isRead=readN.includes(n.id);return(<div key={n.id} onClick={function(){setReadN(function(p){return [...new Set(p.concat([n.id]))];});}} style={{padding:"10px 15px",borderBottom:"1px solid #0b0b0b",background:isRead?"transparent":"#090e09",cursor:"pointer",position:"relative"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:8,color:"#39FF14",fontWeight:700}}>{n.cat}</span><span style={{fontSize:7,color:"#1a1a1a"}}>{n.time}</span></div><div style={{fontSize:10,fontWeight:isRead?400:700,color:isRead?"#334":"#fff"}}>{n.title}</div>{!isRead&&<div style={{width:5,height:5,background:"#39FF14",borderRadius:"50%",position:"absolute",right:11,top:13}}></div>}</div>);})}
          </div>
        </div>
      )}

      

      {showSub&&!isAdmin&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={function(){setShowSub(false);}}>
          <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:"18px 18px 0 0",padding:"18px 15px 28px",width:"100%",maxWidth:430,maxHeight:"88vh",overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>
            <div style={{textAlign:"center",marginBottom:12}}>
              <LogoSVG size={0.55}/>
              <div style={{background:"linear-gradient(135deg,#0a3a0a,#1a5a1a)",border:"2px solid #39FF14",borderRadius:12,padding:"10px 12px",marginTop:10,marginBottom:6}}>
                <div style={{fontSize:13,fontWeight:900,color:"#39FF14",marginBottom:2}}>7 DAYS FREE TRIAL</div>
                <div style={{fontSize:9,color:"#aaa"}}>Try ALL premium features FREE for 7 days</div>
                <div style={{fontSize:8,color:"#778",marginTop:2}}>No credit card needed. Cancel anytime.</div>
              </div>
            </div>
            {[["LIVE Breakout Alerts with SOUND"],["Breakdown Warnings - Save Capital"],["News Impact Alerts - Real time"],["Price Action Signals (RSI/MACD)"],["AI-Powered Trade Guidance"],["Easy English Guidance for Every Alert"],["Complete OI Chain - Buyer/Seller/Greeks"],["4 Premium PDF Books"],["Priority Telegram Channel Access"]].map(function(item){return <div key={item[0]} style={{display:"flex",gap:7,marginBottom:6,alignItems:"center"}}><span style={{color:"#39FF14",fontSize:11}}>&#10003;</span><span style={{fontSize:10,color:"#bbb"}}>{item[0]}</span></div>;})}
            <div style={{height:1,background:"#1a1a1a",margin:"10px 0"}}></div>
            {SUB_PLANS.map(function(pl){return(<div key={pl[0]} onClick={function(){setIsPrem(true);setShowSub(false);alert("Premium activated! 7-day free trial start. Cancel anytime.");}} style={{background:pl[3]?"linear-gradient(135deg,#0a1a0a,#1a3a1a)":"#0d0d0d",border:"2px solid "+(pl[3]?"#39FF14":"#1a1a1a"),borderRadius:11,padding:"11px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><div><div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{pl[0]}</div>{pl[4]&&<div style={{fontSize:8,color:pl[3]?"#39FF14":"#f59e0b",marginTop:2,fontWeight:700}}>{pl[4]}{pl[3]?" - Best Value!":""}</div>}</div><div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontSize:18,fontWeight:900,color:pl[3]?"#39FF14":"#fff"}}>{pl[1]}</div><div style={{fontSize:7,color:"#222"}}>{pl[2]}</div></div></div>);})}
          </div>
        </div>
      )}

      {showDisc&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={function(){setShowDisc(false);}}>
          <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:"18px 18px 0 0",padding:"18px 15px 28px",width:"100%",maxWidth:430,maxHeight:"88vh",overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>
            <div style={{textAlign:"center",marginBottom:11}}><div style={{fontSize:28,marginBottom:4}}>&#9878;</div><div style={{fontSize:14,fontWeight:900,color:"#ff5500"}}>SEBI DISCLAIMER</div></div>
            <div style={{background:"#180800",border:"1px solid #ff440033",borderRadius:10,padding:"11px",marginBottom:11,fontSize:9,color:"#ddaa77",lineHeight:1.8}}>{DISCLAIMER}</div>
            <div style={{background:"#0a1a0a",border:"1px solid #39FF1422",borderRadius:8,padding:"8px",marginBottom:9,textAlign:"center"}}><div style={{fontSize:8,color:"#39FF14",fontWeight:600}}>Stock Market Education App Only</div><div style={{fontSize:7,color:"#1a1a1a",marginTop:2}}>M SURESH | breakoutproofficial@gmail.com</div></div>
            <button onClick={function(){setShowDisc(false);}} style={{width:"100%",background:"#cc3300",border:"none",borderRadius:11,padding:"12px",fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>I Understand</button>
          </div>
        </div>
      )}

      {showAlertModal&&isPrem&&(
        <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:300,background:"linear-gradient(135deg,#1a0500,#0d0300)",border:"2px solid "+showAlertModal.color,borderRadius:14,padding:"12px 16px",boxShadow:"0 8px 24px rgba(255,68,0,0.4)",maxWidth:380,width:"92%",animation:"slideIn 0.3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:18,color:showAlertModal.color}}>{showAlertModal.icon}</span>
              <div>
                <div style={{fontSize:8,fontWeight:800,color:showAlertModal.color,letterSpacing:1}}>{showAlertModal.type}</div>
                <div style={{fontSize:12,fontWeight:900,color:"#fff"}}>{showAlertModal.stock}</div>
              </div>
            </div>
            <button onClick={function(){setShowAlertModal(null);}} style={{background:"none",border:"none",color:"#fff",fontSize:16,cursor:"pointer"}}>X</button>
          </div>
          <div style={{fontSize:10,color:"#ccc",marginBottom:5}}>{showAlertModal.msg}</div>
          <div style={{fontSize:9,color:"#39FF14",fontWeight:600}}>Guide: {showAlertModal.guidance}</div>
        </div>
      )}

      {showTrm&&<TermsModal onClose={function(){setShowTrm(false);}} onAccept={function(){setShowTrm(false);}}/>}
    </div>
  );
}
