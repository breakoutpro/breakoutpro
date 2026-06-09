import { useState, useEffect, useRef } from "react";

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

const LANGS={en:"English",hi:"हिंदी",te:"తెలుగు"};
const T={
  en:{
    home:"Home",markets:"Markets",oi:"OI",news:"News",learn:"Learn",
    scanner:"Scanner",tools:"Tools",mf:"MF/SIP",ipo:"IPO",admin:"Admin",
    goodMorn:"Good Morning",goodAfter:"Good Afternoon",goodEve:"Good Evening",
    welcome:"Welcome back",disclaimer:"Educational Platform Only · Not Investment Advice",
    gainers:"Top Gainers",losers:"Top Losers",watchlist:"Watchlist",
    noWatchlist:"No stocks in watchlist",addStocks:"Tap star on any stock to add",
    search:"Search stocks...",tapToOpen:"Tap any stock to open detail",
    support:"Support",resistance:"Resistance",optionsChain:"Options Chain",
    liveChart:"Live Chart",calculate:"Calculate",unlock:"Unlock Premium",
    premFeature:"Premium Feature",back:"← Back",
  },
  hi:{
    home:"होम",markets:"बाज़ार",oi:"OI चेन",news:"समाचार",learn:"सीखें",
    scanner:"स्कैनर",tools:"टूल्स",mf:"MF/SIP",ipo:"IPO",admin:"एडमिन",
    goodMorn:"सुप्रभात",goodAfter:"नमस्ते",goodEve:"शुभ संध्या",
    welcome:"स्वागत है",disclaimer:"केवल शैक्षिक · निवेश सलाह नहीं",
    gainers:"टॉप गेनर्स",losers:"टॉप लूज़र्स",watchlist:"वॉचलिस्ट",
    noWatchlist:"वॉचलिस्ट खाली है",addStocks:"किसी भी स्टॉक पर ★ दबाएं",
    search:"स्टॉक खोजें...",tapToOpen:"विवरण के लिए टैप करें",
    support:"सपोर्ट",resistance:"रेज़िस्टेंस",optionsChain:"ऑप्शन चेन",
    liveChart:"लाइव चार्ट",calculate:"कैलकुलेट करें",unlock:"प्रीमियम अनलॉक करें",
    premFeature:"प्रीमियम फीचर",back:"← वापस",
  },
  te:{
    home:"హోమ్",markets:"మార్కెట్",oi:"OI చైన్",news:"వార్తలు",learn:"నేర్చుకో",
    scanner:"స్కానర్",tools:"టూల్స్",mf:"MF/SIP",ipo:"IPO",admin:"అడ్మిన్",
    goodMorn:"శుభోదయం",goodAfter:"నమస్కారం",goodEve:"శుభ సాయంత్రం",
    welcome:"స్వాగతం",disclaimer:"విద్యా వేదిక మాత్రమే · పెట్టుబడి సలహా కాదు",
    gainers:"టాప్ గెయినర్స్",losers:"టాప్ లూజర్స్",watchlist:"వాచ్‌లిస్ట్",
    noWatchlist:"వాచ్‌లిస్ట్ ఖాళీగా ఉంది",addStocks:"ఏదైనా స్టాక్‌పై ★ నొక్కండి",
    search:"స్టాక్‌లు వెతకండి...",tapToOpen:"వివరాల కోసం నొక్కండి",
    support:"సపోర్ట్",resistance:"రెసిస్టెన్స్",optionsChain:"ఆప్షన్ చైన్",
    liveChart:"లైవ్ చార్ట్",calculate:"లెక్కించు",unlock:"ప్రీమియమ్ అన్‌లాక్",
    premFeature:"ప్రీమియమ్ ఫీచర్",back:"← వెనక్కి",
  },
};

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

const SCANNER_DATA = {
  BREAKOUT_STOCKS:[
    {sym:"TATASTEEL",ltp:158.40,chg:3.24,res:155,vol:"3.1x avg",strength:88,pattern:"Resistance Breakout",timeframe:"15m",candle:"Bullish Engulfing",structure:"HH-HL",gapType:null,sector:"Metal"},
    {sym:"POWERGRID",ltp:328.60,chg:2.68,res:324,vol:"2.4x avg",strength:82,pattern:"Consolidation Breakout",timeframe:"1h",candle:"Marubozu",structure:"HH-HL",gapType:"Gap Up",sector:"Power"},
    {sym:"SBIN",ltp:812.40,chg:1.84,res:808,vol:"1.9x avg",strength:76,pattern:"Support Breakout",timeframe:"30m",candle:"Hammer",structure:"HH-HL",gapType:null,sector:"Bank"},
    {sym:"TCS",ltp:4208.65,chg:2.14,res:4180,vol:"2.1x avg",strength:79,pattern:"Range Breakout",timeframe:"1h",candle:"Three White Soldiers",structure:"HH-HL",gapType:null,sector:"IT"},
    {sym:"HDFCBANK",ltp:1623.45,chg:1.92,res:1614,vol:"1.7x avg",strength:71,pattern:"Trendline Breakout",timeframe:"15m",candle:"Bullish Harami",structure:"HH-HL",gapType:null,sector:"Bank"},
    {sym:"TATAMOTORS",ltp:954.75,chg:1.44,res:945,vol:"2.8x avg",strength:85,pattern:"Gap Up Breakout",timeframe:"Daily",candle:"Gap Up Marubozu",structure:"HH-HL",gapType:"Gap Up",sector:"Auto"},
  ],
  BREAKDOWN_STOCKS:[
    {sym:"BAJFINANCE",ltp:6840.50,chg:-1.24,sup:6900,vol:"2.2x avg",strength:78,pattern:"Support Breakdown",timeframe:"1h",candle:"Bearish Engulfing",structure:"LH-LL",gapType:null,sector:"NBFC"},
    {sym:"WIPRO",ltp:462.10,chg:-0.82,sup:468,vol:"1.6x avg",strength:65,pattern:"Trendline Breakdown",timeframe:"30m",candle:"Shooting Star",structure:"LH-LL",gapType:null,sector:"IT"},
    {sym:"SUNPHARMA",ltp:1562.30,chg:-0.64,sup:1572,vol:"1.4x avg",strength:58,pattern:"Range Breakdown",timeframe:"15m",candle:"Bearish Harami",structure:"LH-LL",gapType:null,sector:"Pharma"},
  ],
  VOLUME_STOCKS:[
    {sym:"TATASTEEL",ltp:158.40,chg:3.24,vol:"8.2Cr",relVol:"3.1x",delivPct:"68%",volSpike:true,type:"Unusual Volume",sector:"Metal"},
    {sym:"RELIANCE",ltp:2845.60,chg:1.35,vol:"4.2Cr",relVol:"2.4x",delivPct:"72%",volSpike:true,type:"Volume Breakout",sector:"Energy"},
    {sym:"HDFCBANK",ltp:1623.45,chg:1.92,vol:"2.3Cr",relVol:"1.9x",delivPct:"65%",volSpike:false,type:"Delivery Volume",sector:"Bank"},
    {sym:"SBIN",ltp:812.40,chg:1.84,vol:"3.1Cr",relVol:"2.1x",delivPct:"58%",volSpike:true,type:"Volume Spike",sector:"Bank"},
    {sym:"TATAMOTORS",ltp:954.75,chg:1.44,vol:"2.8Cr",relVol:"2.8x",delivPct:"61%",volSpike:true,type:"Relative Volume",sector:"Auto"},
  ],
  CANDLE_PATTERNS:[
    {sym:"TATASTEEL",ltp:158.40,chg:3.24,pattern:"Bullish Engulfing",timeframe:"15m",signal:"Bullish",strength:"Strong",desc:"Big green candle engulfs previous red candle. Buyers overpowered sellers. Educational signal."},
    {sym:"RELIANCE",ltp:2845.60,chg:1.35,pattern:"Hammer",timeframe:"1h",signal:"Bullish",strength:"Moderate",desc:"Long lower shadow, small body at top. Buyers rejected lower prices. Potential reversal pattern."},
    {sym:"SBIN",ltp:812.40,chg:1.84,pattern:"Three White Soldiers",timeframe:"Daily",signal:"Bullish",strength:"Strong",desc:"Three consecutive bullish candles with higher closes. Strong buying momentum pattern."},
    {sym:"TCS",ltp:4208.65,chg:2.14,pattern:"Morning Star",timeframe:"1h",signal:"Bullish",strength:"Strong",desc:"Three-candle reversal: big red, small doji, big green. Classic bottom reversal pattern."},
    {sym:"BAJFINANCE",ltp:6840.50,chg:-1.24,pattern:"Bearish Engulfing",timeframe:"1h",signal:"Bearish",strength:"Strong",desc:"Large red candle engulfs previous green candle. Sellers overpowered buyers. Potential reversal."},
    {sym:"WIPRO",ltp:462.10,chg:-0.82,pattern:"Shooting Star",timeframe:"15m",signal:"Bearish",strength:"Moderate",desc:"Small body at bottom, long upper shadow. Buyers tried to push price up but failed. Bearish signal."},
    {sym:"SUNPHARMA",ltp:1562.30,chg:-0.64,pattern:"Doji",timeframe:"30m",signal:"Neutral",strength:"Weak",desc:"Open and close nearly equal. Market indecision. Watch next candle for direction."},
    {sym:"ICICIBANK",ltp:1082.30,chg:1.28,pattern:"Inverted Hammer",timeframe:"15m",signal:"Bullish",strength:"Moderate",desc:"Small body at bottom with long upper shadow. After downtrend, potential bullish reversal."},
    {sym:"HDFCBANK",ltp:1623.45,chg:1.92,pattern:"Marubozu",timeframe:"1h",signal:"Bullish",strength:"Strong",desc:"Candle with no shadows, full body. Very strong one-sided momentum. High conviction buyers."},
    {sym:"TATAMOTORS",ltp:954.75,chg:1.44,pattern:"Bullish Harami",timeframe:"Daily",signal:"Bullish",strength:"Moderate",desc:"Small green candle inside previous red candle. Selling pressure decreasing. Potential reversal."},
  ],
  STRUCTURE:[
    {sym:"RELIANCE",ltp:2845.60,chg:1.35,structure:"Higher High - Higher Low",type:"Uptrend",prev_high:2820,prev_low:2790,curr_high:2867,curr_low:2798,trendChange:false,sector:"Energy"},
    {sym:"TCS",ltp:4208.65,chg:2.14,structure:"Higher High - Higher Low",type:"Uptrend",prev_high:4180,prev_low:4105,curr_high:4230,curr_low:4120,trendChange:false,sector:"IT"},
    {sym:"BAJFINANCE",ltp:6840.50,chg:-1.24,structure:"Lower High - Lower Low",type:"Downtrend",prev_high:6950,prev_low:6860,curr_high:6945,curr_low:6810,trendChange:false,sector:"NBFC"},
    {sym:"WIPRO",ltp:462.10,chg:-0.82,structure:"Lower High - Lower Low",type:"Downtrend",prev_high:472,prev_low:466,curr_high:470,curr_low:458,trendChange:false,sector:"IT"},
    {sym:"SBIN",ltp:812.40,chg:1.84,structure:"Higher High - Higher Low",type:"Uptrend",prev_high:808,prev_low:793,curr_high:818,curr_low:798,trendChange:false,sector:"Bank"},
    {sym:"SUNPHARMA",ltp:1562.30,chg:-0.64,structure:"Lower High - Higher Low",type:"Sideways",prev_high:1580,prev_low:1548,curr_high:1578,curr_low:1552,trendChange:false,sector:"Pharma"},
  ],
};

const SMART_ALERTS_DATA=[
  {id:1,sym:"TATASTEEL",type:"Resistance Breakout",msg:"Breaking above Rs.155 resistance with 3.1x volume",timeframe:"15m",strength:88,color:"#39FF14",icon:"⚡",eduNote:"High volume breakouts are studied in technical analysis. Volume confirms price movement."},
  {id:2,sym:"TATAMOTORS",type:"Gap Up Alert",msg:"Opening gap up +2.1% above previous close",timeframe:"Daily",strength:82,color:"#39FF14",icon:"🚀",eduNote:"Gap up openings occur when buyers are aggressive at open. First 15 min price action is important to observe."},
  {id:3,sym:"BAJFINANCE",type:"Support Breakdown",msg:"Breaking below Rs.6900 support on increased volume",timeframe:"1h",strength:78,color:"#ff4444",icon:"⬇",eduNote:"Support breakdown means buyers at that level are exhausted. Price tends to find next support zone."},
  {id:4,sym:"RELIANCE",type:"Volume Expansion",msg:"Volume 2.4x above 20-day average with price up",timeframe:"1h",strength:76,color:"#60a5fa",icon:"📊",eduNote:"Volume expansion with price rise confirms strength. Volume is the fuel of price movement."},
  {id:5,sym:"SBIN",type:"New High Alert",msg:"Making 52-week high at Rs.818",timeframe:"Daily",strength:74,color:"#FFD700",icon:"🏆",eduNote:"52-week highs are studied in momentum strategies. Stocks making new highs often continue higher short-term."},
  {id:6,sym:"WIPRO",type:"Trend Reversal Alert",msg:"Potential trend change — price below 20 EMA",timeframe:"Daily",strength:65,color:"#f59e0b",icon:"🔄",eduNote:"When price crosses below moving averages, trend may be changing. Observe for 2-3 sessions to confirm."},
];

const CANDLE_EDU={
  "Bullish Engulfing":{emoji:"🟢",signal:"Bullish",desc:"A large green candle completely engulfs the previous red candle. This pattern suggests that buyers have overpowered sellers. Found at bottoms, it can indicate a potential reversal.",te:"పెద్ద ఆకుపచ్చ కొవ్వొత్తి ముందటి ఎర్ర కొవ్వొత్తిని పూర్తిగా కప్పుతుంది. కొనుగోలుదారులు అమ్మకందారులను అధిగమించారు.",hi:"एक बड़ी हरी कैंडल पिछली लाल कैंडल को पूरी तरह घेर लेती है। खरीदार विक्रेताओं पर हावी हो गए।"},
  "Bearish Engulfing":{emoji:"🔴",signal:"Bearish",desc:"A large red candle completely engulfs the previous green candle. Sellers have taken control. Found at tops, it may indicate a potential reversal downward.",te:"పెద్ద ఎర్ర కొవ్వొత్తి ముందటి ఆకుపచ్చ కొవ్వొత్తిని పూర్తిగా కప్పుతుంది. అమ్మకందారులు నియంత్రణ తీసుకున్నారు.",hi:"एक बड़ी लाल कैंडल पिछली हरी कैंडल को पूरी तरह घेर लेती है। विक्रेताओं ने नियंत्रण ले लिया।"},
  "Hammer":{emoji:"🔨",signal:"Bullish",desc:"Small body at top, long lower shadow. Buyers rejected the lower prices and pushed price back up. Found after downtrends, potential bullish reversal signal.",te:"పైన చిన్న శరీరం, క్రింద పొడవైన నీడ. కొనుగోలుదారులు తక్కువ ధరలను తిరస్కరించారు.",hi:"ऊपर छोटा बॉडी, नीचे लंबी शैडो। खरीदारों ने नीचे के भाव को अस्वीकार किया।"},
  "Shooting Star":{emoji:"💫",signal:"Bearish",desc:"Small body at bottom, long upper shadow. Buyers tried to push price higher but failed. Found at tops, potential bearish reversal signal.",te:"క్రింద చిన్న శరీరం, పైన పొడవైన నీడ. కొనుగోలుదారులు ధర పెంచడానికి ప్రయత్నించారు కానీ విఫలమయ్యారు.",hi:"नीचे छोटा बॉडी, ऊपर लंबी शैडो। खरीदार कीमत ऊपर ले जाने में असफल रहे।"},
  "Doji":{emoji:"✚",signal:"Neutral",desc:"Open and close are nearly equal creating a cross shape. Market indecision — neither buyers nor sellers are in control. Watch next candle for direction.",te:"ఓపెన్ మరియు క్లోజ్ దాదాపు సమానంగా ఉంటాయి. మార్కెట్ నిర్ణయం తీసుకోలేదు.",hi:"ओपन और क्लोज लगभग बराबर होते हैं। बाजार अनिर्णीत है।"},
  "Marubozu":{emoji:"📊",signal:"Strong",desc:"No upper or lower shadows — full body candle. Extreme one-sided momentum. Green Marubozu = strong buying all session. Red Marubozu = strong selling all session.",te:"పై/క్రింద నీడలు లేవు — పూర్తి శరీర కొవ్వొత్తి. అత్యంత బలమైన ఒకేవైపు మొమెంటమ్.",hi:"कोई शैडो नहीं — पूरा बॉडी कैंडल। अत्यधिक एकतरफा गति।"},
  "Morning Star":{emoji:"🌟",signal:"Bullish",desc:"Three-candle reversal pattern: large red candle, small doji/star, large green candle. Classic bottom reversal. Requires confirmation.",te:"మూడు కొవ్వొత్తుల రివర్సల్ నమూనా: పెద్ద ఎర్ర, చిన్న డోజీ, పెద్ద ఆకుపచ్చ. క్లాసిక్ బాటమ్ రివర్సల్.",hi:"तीन कैंडल का रिवर्सल पैटर्न: बड़ी लाल, छोटी डोजी, बड़ी हरी।"},
  "Evening Star":{emoji:"🌙",signal:"Bearish",desc:"Three-candle reversal at tops: large green, small star/doji, large red candle. Classic top reversal pattern. Requires confirmation.",te:"పైన మూడు కొవ్వొత్తుల రివర్సల్: పెద్ద ఆకుపచ్చ, చిన్న నక్షత్రం, పెద్ద ఎర్ర.",hi:"ऊपर में तीन कैंडल रिवर्सल: बड़ी हरी, छोटी स्टार, बड़ी लाल।"},
  "Three White Soldiers":{emoji:"🪖",signal:"Bullish",desc:"Three consecutive bullish candles with higher closes, each opening within prior body. Strong bullish momentum pattern.",te:"మూడు వరుస బుల్లిష్ కొవ్వొత్తులు అధిక క్లోజులతో. బలమైన కొనుగోలు మొమెంటమ్.",hi:"तीन लगातार बुलिश कैंडल ऊंचे क्लोज के साथ। मजबूत खरीदारी गति।"},
  "Three Black Crows":{emoji:"🦅",signal:"Bearish",desc:"Three consecutive bearish candles with lower closes. Strong selling momentum. Reversal of uptrend.",te:"మూడు వరుస బేరిష్ కొవ్వొత్తులు తక్కువ క్లోజులతో. బలమైన అమ్మకపు మొమెంటమ్.",hi:"तीन लगातार बेरिश कैंडल निम्न क्लोज के साथ। मजबूत बिक्री गति।"},
};

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
  var stockOpen=totalMin>=555&&totalMin<930;
  var mcxMorn=totalMin>=540&&totalMin<1020;
  var mcxEvening=totalMin>=1020&&totalMin<1435;
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
  var [tf,setTf]=useState("15");
  var [chartType,setChartType]=useState("1"); // 1=candles,3=line

  // TradingView interval map
  var TF_MAP={"1m":"1","3m":"3","5m":"5","15m":"15","30m":"30","1h":"60","4h":"240","D":"D","W":"W","M":"M"};
  var tvSym="NSE:"+st.sym;
  var tvUrl="https://www.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol="+encodeURIComponent(tvSym)+"&interval="+tf+"&hidesidetoolbar=1&hidetoptoolbar=0&saveimage=0&toolbarbg=0d0d0d&theme=dark&style="+chartType+"&timezone=Asia%2FKolkata&studies=[]&hideideas=1&withdateranges=1&hide_side_toolbar=1&allow_symbol_change=0&calendar=0&news=0&widgetbar_width=0&hide_legend=0&hotlist=0&details=0&calendar=0";

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",padding:"8px 9px",borderBottom:"1px solid #0d0d0d",background:"#050505",position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"none",border:"none",color:"#39FF14",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:"3px 10px 3px 0"}}>&#8592; Back</button>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:900,color:"#fff"}}>{st.sym}</div>
          <div style={{fontSize:8,color:"#556"}}>{st.name}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:900,color:"#fff"}}>Rs{fN(st.ltp)}</div>
          <div style={{fontSize:10,fontWeight:700,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div>
        </div>
      </div>

      {/* OHLCV quick strip */}
      <div style={{display:"flex",gap:0,background:"#080808",borderBottom:"1px solid #0d0d0d",overflow:"hidden"}}>
        {[["O",st.open,"#aaa"],["H",st.high,"#39FF14"],["L",st.low,"#ff4444"],["V",st.vol,"#60a5fa"],["PE",st.pe,"#a78bfa"]].map(function(item){return(
          <div key={item[0]} style={{flex:1,textAlign:"center",padding:"5px 2px",borderRight:"1px solid #0d0d0d"}}>
            <div style={{fontSize:6,color:"#334",fontWeight:700}}>{item[0]}</div>
            <div style={{fontSize:8,fontWeight:700,color:item[2],fontFamily:"monospace"}}>{item[1]}</div>
          </div>
        );})}
      </div>

      {/* Chart Type + Timeframe selector */}
      <div style={{background:"#080808",borderBottom:"1px solid #0d0d0d",padding:"6px 9px"}}>
        <div style={{display:"flex",gap:4,marginBottom:5}}>
          {[["1","Candle"],["3","Line"],["2","Bar"]].map(function(item){return(
            <button key={item[0]} onClick={function(){setChartType(item[0]);}} style={{background:chartType===item[0]?"#39FF1420":"transparent",border:"1px solid "+(chartType===item[0]?"#39FF14":"#1a1a1a"),borderRadius:6,padding:"3px 8px",color:chartType===item[0]?"#39FF14":"#445",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {item[1]}
            </button>
          );})}
          <div style={{flex:1}}></div>
          <div style={{fontSize:7,color:"#334",alignSelf:"center"}}>NSE:{st.sym}</div>
        </div>
        <div style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:2}}>
          {[["1","1m"],["3","3m"],["5","5m"],["15","15m"],["30","30m"],["60","1h"],["240","4h"],["D","1D"],["W","1W"],["M","1M"]].map(function(item){return(
            <button key={item[0]} onClick={function(){setTf(item[0]);}} style={{background:tf===item[0]?"linear-gradient(135deg,#39FF14,#00b377)":"#0d0d0d",border:"1px solid "+(tf===item[0]?"#39FF14":"#1a1a1a"),borderRadius:7,padding:"4px 7px",color:tf===item[0]?"#000":"#445",fontSize:8,fontWeight:tf===item[0]?800:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
              {item[1]}
            </button>
          );})}
        </div>
      </div>

      {/* TradingView Chart */}
      <div style={{position:"relative",width:"100%",height:340,background:"#0d0d0d"}}>
        <iframe
          key={tvSym+tf+chartType}
          src={tvUrl}
          style={{width:"100%",height:"100%",border:"none",display:"block"}}
          title={st.sym+" Chart"}
          allow="fullscreen"
          loading="lazy"
        />
        <div style={{position:"absolute",bottom:4,left:6,fontSize:6,color:"#222",pointerEvents:"none"}}>Educational only · Not investment advice</div>
      </div>

      <div style={{padding:"8px 9px 0"}}>
        {/* Candle Timer */}
        <CandleTimerInline/>

        {/* Support / Resistance */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
          <div style={{background:"#0a1a0a",border:"1px solid #39FF1433",borderRadius:9,padding:"10px"}}>
            <div style={{fontSize:7,color:"#39FF14",fontWeight:700,marginBottom:2}}>SUPPORT</div>
            <div style={{fontFamily:"monospace",fontSize:18,fontWeight:900,color:"#39FF14"}}>Rs{st.sup}</div>
          </div>
          <div style={{background:"#1a0a0a",border:"1px solid #ff444433",borderRadius:9,padding:"10px"}}>
            <div style={{fontSize:7,color:"#ff4444",fontWeight:700,marginBottom:2}}>RESISTANCE</div>
            <div style={{fontFamily:"monospace",fontSize:18,fontWeight:900,color:"#ff4444"}}>Rs{st.res}</div>
          </div>
        </div>

        {/* 52W Range */}
        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px",marginBottom:7}}>
          <div style={{fontSize:8,color:"#556",fontWeight:600,marginBottom:6}}>52 WEEK RANGE</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:5}}>
            <span style={{color:"#ff4444",fontFamily:"monospace",fontWeight:700}}>Rs{fN(st.wk52l)}</span>
            <span style={{color:"#39FF14",fontFamily:"monospace",fontWeight:700}}>Rs{fN(st.wk52h)}</span>
          </div>
          <div style={{height:5,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:((st.ltp-st.wk52l)/(st.wk52h-st.wk52l)*100)+"%",background:"linear-gradient(90deg,#ff4444,#f59e0b,#39FF14)",borderRadius:3}}></div>
          </div>
          <div style={{textAlign:"center",fontSize:7,color:"#445",marginTop:3}}>Current: Rs{fN(st.ltp)}</div>
        </div>

        {/* Fundamentals */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:7}}>
          {[["Mkt Cap",st.cap,"#f59e0b"],["P/E Ratio",String(st.pe),"#a78bfa"],["Trend",st.trend==="bull"?"Bullish":st.trend==="bear"?"Bearish":"Neutral",st.trend==="bull"?"#39FF14":st.trend==="bear"?"#ff4444":"#f59e0b"]].map(function(item){return(
            <div key={item[0]} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px",textAlign:"center"}}>
              <div style={{fontSize:6,color:"#556",marginBottom:3}}>{item[0]}</div>
              <div style={{fontSize:9,fontWeight:800,color:item[2]}}>{item[1]}</div>
            </div>
          );})}
        </div>

        {/* Quarterly Results */}
        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px",marginBottom:7}}>
          <div style={{fontSize:9,fontWeight:700,color:"#f59e0b",marginBottom:8}}>Quarterly Results — {st.qtr.dt}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[["Revenue",st.qtr.rev],["Net Profit",st.qtr.pft],["YoY Growth",st.qtr.yoy],["QoQ Growth",st.qtr.qoq]].map(function(item){return(
              <div key={item[0]} style={{background:"#080808",borderRadius:7,padding:"7px"}}>
                <div style={{fontSize:7,color:"#556",marginBottom:2}}>{item[0]}</div>
                <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:item[1].charAt(0)==="-"?"#ff4444":item[1].charAt(0)==="+"?"#39FF14":"#fff"}}>{item[1]}</div>
              </div>
            );})}
          </div>
        </div>

        {/* News */}
        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px",marginBottom:7}}>
          <div style={{fontSize:9,fontWeight:700,color:"#60a5fa",marginBottom:7}}>Latest News</div>
          {st.news.map(function(n,i){return(
            <div key={i} style={{fontSize:9,color:"#778",padding:"5px 0",borderBottom:i<st.news.length-1?"1px solid #0d0d0d":"none",lineHeight:1.5,display:"flex",gap:6}}>
              <span style={{color:"#39FF14",flexShrink:0}}>&#8226;</span>{n}
            </div>
          );})}
        </div>

        {/* ── TRADE ON BROKER ── */}
        <div style={{background:"linear-gradient(135deg,#0a1a0a,#001a0a)",border:"1px solid #39FF1444",borderRadius:14,padding:"13px",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:800,color:"#39FF14",marginBottom:3}}>📈 Trade This Stock</div>
          <div style={{fontSize:8,color:"#556",marginBottom:10,lineHeight:1.5}}>
            We are an educational platform. Clicking below opens your broker app directly. We don't handle money or orders.
          </div>

          {/* Big Trade Buttons */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <a href={"https://kite.zerodha.com/search?symbol="+st.sym} target="_blank" rel="noopener noreferrer"
              style={{background:"linear-gradient(135deg,#387ed1,#1a56b0)",borderRadius:11,padding:"13px 8px",textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>📊</span>
              <span style={{fontSize:11,fontWeight:800,color:"#fff"}}>Zerodha</span>
              <span style={{fontSize:8,color:"#aaddff"}}>Kite · Trade Now</span>
            </a>
            <a href={"https://groww.in/stocks/"+st.sym.toLowerCase()+"-share-price"} target="_blank" rel="noopener noreferrer"
              style={{background:"linear-gradient(135deg,#00d09c,#007a5e)",borderRadius:11,padding:"13px 8px",textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>🌱</span>
              <span style={{fontSize:11,fontWeight:800,color:"#fff"}}>Groww</span>
              <span style={{fontSize:8,color:"#aaffee"}}>Invest Now</span>
            </a>
            <a href={"https://web.dhan.co/stocks?symbol="+st.sym} target="_blank" rel="noopener noreferrer"
              style={{background:"linear-gradient(135deg,#ff6b35,#cc4400)",borderRadius:11,padding:"13px 8px",textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>⚡</span>
              <span style={{fontSize:11,fontWeight:800,color:"#fff"}}>Dhan</span>
              <span style={{fontSize:8,color:"#ffccaa"}}>Fast Trading</span>
            </a>
            <a href={"https://app.angelone.in/stocks/"+st.sym} target="_blank" rel="noopener noreferrer"
              style={{background:"linear-gradient(135deg,#e63946,#9b1c1c)",borderRadius:11,padding:"13px 8px",textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>👼</span>
              <span style={{fontSize:11,fontWeight:800,color:"#fff"}}>Angel One</span>
              <span style={{fontSize:8,color:"#ffaaaa"}}>SmartAPI</span>
            </a>
          </div>

          {/* More brokers */}
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
            {[
              {name:"Upstox",icon:"🔼",url:"https://upstox.com/stocks/"+st.sym+"/",color:"#7c3aed"},
              {name:"Paytm Money",icon:"💙",url:"https://stocks.paytmmoney.com/stocks/equity/"+st.sym,color:"#0066cc"},
              {name:"5Paisa",icon:"5️⃣",url:"https://www.5paisa.com/stocks/"+st.sym+"-share-price",color:"#00aa44"},
              {name:"Kotak Neo",icon:"🏦",url:"https://neo.kotak.com/",color:"#dc2626"},
              {name:"HDFC Sky",icon:"🌤",url:"https://hdfcsky.com/",color:"#1d4ed8"},
            ].map(function(b){return(
              <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer"
                style={{background:b.color+"22",border:"1px solid "+b.color+"44",borderRadius:9,padding:"7px 10px",textDecoration:"none",display:"flex",alignItems:"center",gap:5,flexShrink:0,whiteSpace:"nowrap"}}>
                <span style={{fontSize:13}}>{b.icon}</span>
                <span style={{fontSize:9,fontWeight:700,color:"#fff"}}>{b.name}</span>
              </a>
            );})}
          </div>

          {/* Legal disclaimer */}
          <div style={{marginTop:10,background:"#0a0500",border:"1px solid #ff440022",borderRadius:8,padding:"7px",fontSize:7,color:"#885522",lineHeight:1.6}}>
            ⚠️ BREAKOUT PRO does not provide buy/sell recommendations. We are NOT a SEBI registered advisor. The links above redirect to third-party licensed brokers. All trading decisions are solely your responsibility. This is for educational reference only.
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{marginBottom:12,fontSize:7,color:"#885522",background:"#080400",border:"1px solid #ff440018",borderRadius:8,padding:"7px",lineHeight:1.6,textAlign:"center"}}>
          &#9888; Educational only. Not a buy/sell recommendation. Consult SEBI registered advisor.
        </div>
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
  const [lang,    setLang]    = useState("en");
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
  const [watchlist,setWatchlist]=useState(function(){try{var s=localStorage.getItem("bp_watch");return s?JSON.parse(s):[];}catch(e){return [];}});
  const [showWatchlist,setShowWatchlist]=useState(false);
  const [scanTab,setScanTab]=useState("scanner");
  const [scanSub,setScanSub]=useState("breakout");
  const [scanTF,setScanTF]=useState("15m");
  const [selScanSt,setSelScanSt]=useState(null);
  const [aiChartQuery,setAiChartQuery]=useState("");
  const [aiChartResult,setAiChartResult]=useState("");
  const [aiChartLoading,setAiChartLoading]=useState(false);
  const [aiChartLang,setAiChartLang]=useState("en");
  const [scanAlerts,setScanAlerts]=useState([]);
  const [scanRefreshing,setScanRefreshing]=useState(false);
  const [notifPerm,setNotifPerm]=useState("default");
  const [liveBreakouts,setLiveBreakouts]=useState([]);
  const [liveBreakdowns,setLiveBreakdowns]=useState([]);
  const [liveVolume,setLiveVolume]=useState([]);
  const [liveCandlePatterns,setLiveCandlePatterns]=useState([]);



  const [briefingText,setBriefingText]=useState("");
  const [briefingLoading,setBriefingLoading]=useState(false);
  const [briefingDate,setBriefingDate]=useState("");

  async function loadBriefing(){
    setBriefingLoading(true);setBriefingText("");
    var userName=user&&user.name?user.name.split(" ")[0]:"Trader";
    var langName=lang==="te"?"Telugu (తెలుగులో మాట్లాడండి)":lang==="hi"?"Hindi (हिंदी में बोलें)":"English";
    var niftyDir=nifty.up?"up "+nifty.pct.toFixed(2)+"%":"down "+nifty.pct.toFixed(2)+"%";
    var sensexDir=sensex.up?"up":"down";
    var topG2=stocks.filter(function(s){return s.chgPct>0;}).sort(function(a,b){return b.chgPct-a.chgPct;}).slice(0,3).map(function(s){return s.sym;}).join(", ");
    var topL2=stocks.filter(function(s){return s.chgPct<0;}).sort(function(a,b){return a.chgPct-b.chgPct;}).slice(0,2).map(function(s){return s.sym;}).join(", ");
    var prompt="You are a friendly Indian stock market educator giving a daily morning briefing.\n\nUser name: "+userName+"\nNIFTY today: "+niftyDir+"\nSENSEX: "+sensexDir+"\nTop gainers today: "+topG2+"\nTop losers: "+topL2+"\nVIX: "+vix.toFixed(1)+"\n\nWrite a SHORT personal briefing (5-6 sentences max) addressing "+userName+" by name. Include:\n1. Greeting with their name\n2. Today's market direction (NIFTY/SENSEX)\n3. One leading sector today\n4. FII/DII activity (educational)\n5. 2-3 educational breakout candidates to STUDY (not buy)\n6. Any key event/news to watch\n\nLanguage: "+langName+"\nTone: Friendly, educational, energetic\nIMPORTANT: End with 'Educational only. Not investment advice.' in "+langName;
    try{
      var resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})});
      var data=await resp.json();
      var txt=data.content&&data.content[0]?data.content[0].text:"Unable to load briefing. Please try again.";
      setBriefingText(txt);
      setBriefingDate(new Date().toLocaleDateString());
    }catch(e){setBriefingText("AI briefing temporarily unavailable. Markets are open — check NIFTY and top gainers!");}
    setBriefingLoading(false);
  }

  function t(k){return(T[lang]||T.en)[k]||k;}
  const [aiLang,setAiLang]=useState("en");
  const [toolAiResult,setToolAiResult]=useState("");
  const [toolAiLoading,setToolAiLoading]=useState(false);
  async function runToolAI(prompt){
    setToolAiLoading(true);setToolAiResult("");
    var langName=aiLang==="te"?"Telugu (తెలుగులో జవాబు ఇవ్వండి)":aiLang==="hi"?"Hindi (हिंदी में जवाब दें)":"English";
    try{
      var resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:"You are an Indian stock market educator. Answer ONLY in "+langName+". STRICTLY educational only — no buy/sell advice.\n\n"+prompt+"\n\nEnd with: Educational only. Not investment advice."}]})});
      var data=await resp.json();
      setToolAiResult(data.content&&data.content[0]?data.content[0].text:"AI unavailable. Try again.");
    }catch(e){setToolAiResult("AI temporarily unavailable.");}
    setToolAiLoading(false);
  }

  function toggleWatch(sym){
    var w=watchlist.slice();
    var idx=w.indexOf(sym);
    if(idx>=0){w.splice(idx,1);}else{w.push(sym);}
    setWatchlist(w);
    try{localStorage.setItem("bp_watch",JSON.stringify(w));}catch(e){}
  }

  // ── SCANNER ENGINE ──────────────────────────────────────────────────────
  function requestNotifPerm(){
    if(!("Notification" in window)){alert("Notifications not supported in this browser.");return;}
    Notification.requestPermission().then(function(perm){
      setNotifPerm(perm);
      if(perm==="granted"){sendPushNotif("BREAKOUT PRO","Scanner notifications enabled! You will be alerted for breakouts.","🔔");}
    });
  }

  function sendPushNotif(title,body,icon){
    if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
      try{new Notification(title,{body:body,icon:icon||"📊",badge:icon||"📊",vibrate:[200,100,200]});}catch(e){console.log("Notif err:",e);}
    }
  }

  function playBreakoutSound(){
    try{
      var ctx=new(window.AudioContext||window.webkitAudioContext)();
      // Professional ascending 3-tone breakout sound — LOUD
      [0,0.15,0.28].forEach(function(t,i){
        var osc=ctx.createOscillator();var gain=ctx.createGain();
        osc.connect(gain);gain.connect(ctx.destination);
        osc.frequency.value=[660,880,1100][i];
        osc.type="sine";
        gain.gain.setValueAtTime(0,ctx.currentTime+t);
        gain.gain.linearRampToValueAtTime(0.7,ctx.currentTime+t+0.04);
        gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+t+0.22);
        osc.start(ctx.currentTime+t);
        osc.stop(ctx.currentTime+t+0.25);
      });
    }catch(e){}
  }

  function playBreakdownSound(){
    try{
      var ctx=new(window.AudioContext||window.webkitAudioContext)();
      // Professional descending alert — LOUD
      [0,0.18,0.34].forEach(function(t,i){
        var osc=ctx.createOscillator();var gain=ctx.createGain();
        osc.connect(gain);gain.connect(ctx.destination);
        osc.frequency.value=[440,330,220][i];
        osc.type="sawtooth";
        gain.gain.setValueAtTime(0,ctx.currentTime+t);
        gain.gain.linearRampToValueAtTime(0.6,ctx.currentTime+t+0.04);
        gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+t+0.22);
        osc.start(ctx.currentTime+t);
        osc.stop(ctx.currentTime+t+0.25);
      });
    }catch(e){}
  }

  function playMarketOpenSound(){
    try{
      var ctx=new(window.AudioContext||window.webkitAudioContext)();
      // Triumphant market open sound — 5 ascending tones
      [523,659,784,1047,1319].forEach(function(freq,i){
        var osc=ctx.createOscillator();var gain=ctx.createGain();
        osc.connect(gain);gain.connect(ctx.destination);
        osc.frequency.value=freq;osc.type="sine";
        gain.gain.setValueAtTime(0,ctx.currentTime+i*0.1);
        gain.gain.linearRampToValueAtTime(0.6,ctx.currentTime+i*0.1+0.05);
        gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+i*0.1+0.3);
        osc.start(ctx.currentTime+i*0.1);
        osc.stop(ctx.currentTime+i*0.1+0.35);
      });
    }catch(e){}
  }

  function playMarketCloseSound(){
    try{
      var ctx=new(window.AudioContext||window.webkitAudioContext)();
      // Market close descending — 4 tones
      [784,659,523,392].forEach(function(freq,i){
        var osc=ctx.createOscillator();var gain=ctx.createGain();
        osc.connect(gain);gain.connect(ctx.destination);
        osc.frequency.value=freq;osc.type="sine";
        gain.gain.setValueAtTime(0,ctx.currentTime+i*0.15);
        gain.gain.linearRampToValueAtTime(0.5,ctx.currentTime+i*0.15+0.05);
        gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+i*0.15+0.35);
        osc.start(ctx.currentTime+i*0.15);
        osc.stop(ctx.currentTime+i*0.15+0.4);
      });
    }catch(e){}
  }

  var CANDLE_LIBRARY=[
    {pattern:"Bullish Engulfing",emoji:"🟢",signal:"Bullish",strength:"Strong",desc:"Large green candle engulfs previous red. Buyers overwhelmed sellers. Classic reversal signal at bottoms.",te:"పెద్ద ఆకుపచ్చ కొవ్వొత్తి ముందటి ఎర్రదాన్ని కప్పుతుంది. కొనుగోలుదారులు అమ్మకందారులను అధిగమించారు.",hi:"बड़ी हरी कैंडल पिछली लाल को घेरती है। खरीदार विक्रेताओं पर हावी।"},
    {pattern:"Bearish Engulfing",emoji:"🔴",signal:"Bearish",strength:"Strong",desc:"Large red candle engulfs previous green. Sellers overwhelmed buyers. Classic reversal signal at tops.",te:"పెద్ద ఎర్ర కొవ్వొత్తి ముందటి ఆకుపచ్చదాన్ని కప్పుతుంది. అమ్మకందారులు అధిగమించారు.",hi:"बड़ी लाल कैंडल पिछली हरी को घेरती है। विक्रेता खरीदारों पर हावी।"},
    {pattern:"Hammer",emoji:"🔨",signal:"Bullish",strength:"Moderate",desc:"Small body at top with long lower shadow. Buyers rejected low prices. Found at bottoms, potential reversal.",te:"పైన చిన్న శరీరం, క్రింద పొడవైన నీడ. తక్కువ ధరలు తిరస్కరించబడ్డాయి.",hi:"ऊपर छोटा बॉडी, नीचे लंबी शैडो। नीचे के भाव अस्वीकृत।"},
    {pattern:"Shooting Star",emoji:"💫",signal:"Bearish",strength:"Moderate",desc:"Small body at bottom with long upper shadow. Buyers failed to sustain high prices. Found at tops.",te:"క్రింద చిన్న శరీరం, పైన పొడవైన నీడ. అధిక ధరలు నిలబెట్టలేకపోయారు.",hi:"नीचे छोटा बॉडी, ऊपर लंबी शैडो। ऊंचे भाव टिकाने में विफल।"},
    {pattern:"Doji",emoji:"✚",signal:"Neutral",strength:"Weak",desc:"Open equals close. Market indecision. Neither buyers nor sellers in control. Watch next candle.",te:"ఓపెన్ = క్లోజ్. మార్కెట్ అనిశ్చయత. తదుపరి కొవ్వొత్తి కోసం చూడండి.",hi:"ओपन = क्लोज। बाजार अनिर्णीत। अगली कैंडल देखें।"},
    {pattern:"Dragonfly Doji",emoji:"🐉",signal:"Bullish",strength:"Moderate",desc:"Doji with long lower shadow. Buyers completely rejected low prices. Bullish reversal signal.",te:"పొడవైన దిగువ నీడతో డోజీ. తక్కువ ధరలు పూర్తిగా తిరస్కరించబడ్డాయి.",hi:"लंबी निचली शैडो वाला डोजी। नीचे के भाव पूरी तरह अस्वीकृत।"},
    {pattern:"Gravestone Doji",emoji:"🪦",signal:"Bearish",strength:"Moderate",desc:"Doji with long upper shadow. Sellers completely rejected high prices. Bearish reversal signal.",te:"పొడవైన ఎగువ నీడతో డోజీ. అధిక ధరలు పూర్తిగా తిరస్కరించబడ్డాయి.",hi:"लंबी ऊपरी शैडो वाला डोजी। ऊंचे भाव पूरी तरह अस्वीकृत।"},
    {pattern:"Morning Star",emoji:"🌟",signal:"Bullish",strength:"Strong",desc:"Three-candle bottom reversal: big red, small star/doji, big green. Classic bullish reversal pattern.",te:"మూడు కొవ్వొత్తుల రివర్సల్: పెద్ద ఎర్ర, చిన్న నక్షత్రం, పెద్ద ఆకుపచ్చ.",hi:"तीन कैंडल रिवर्सल: बड़ी लाल, छोटी स्टार, बड़ी हरी।"},
    {pattern:"Evening Star",emoji:"🌙",signal:"Bearish",strength:"Strong",desc:"Three-candle top reversal: big green, small star/doji, big red. Classic bearish reversal pattern.",te:"మూడు కొవ్వొత్తుల రివర్సల్: పెద్ద ఆకుపచ్చ, చిన్న నక్షత్రం, పెద్ద ఎర్ర.",hi:"तीन कैंडल रिवर्सल: बड़ी हरी, छोटी स्टार, बड़ी लाल।"},
    {pattern:"Three White Soldiers",emoji:"🪖",signal:"Bullish",strength:"Strong",desc:"Three consecutive bullish candles with higher closes. Strong buying momentum. Trend continuation.",te:"మూడు వరుస బుల్లిష్ కొవ్వొత్తులు. బలమైన కొనుగోలు మొమెంటమ్.",hi:"तीन लगातार बुलिश कैंडल। मजबूत खरीदारी गति।"},
    {pattern:"Three Black Crows",emoji:"🦅",signal:"Bearish",strength:"Strong",desc:"Three consecutive bearish candles with lower closes. Strong selling momentum. Trend continuation.",te:"మూడు వరుస బేరిష్ కొవ్వొత్తులు. బలమైన అమ్మకపు మొమెంటమ్.",hi:"तीन लगातार बेरिश कैंडल। मजबूत बिक्री गति।"},
    {pattern:"Bullish Harami",emoji:"🤰",signal:"Bullish",strength:"Moderate",desc:"Small green candle inside previous large red. Selling pressure slowing. Potential reversal forming.",te:"ముందటి పెద్ద ఎర్ర లోపల చిన్న ఆకుపచ్చ. అమ్మకపు ఒత్తిడి తగ్గుతోంది.",hi:"पिछली बड़ी लाल के अंदर छोटी हरी। बिक्री दबाव कम हो रहा।"},
    {pattern:"Bearish Harami",emoji:"🤱",signal:"Bearish",strength:"Moderate",desc:"Small red candle inside previous large green. Buying pressure slowing. Potential reversal forming.",te:"ముందటి పెద్ద ఆకుపచ్చ లోపల చిన్న ఎర్ర. కొనుగోలు ఒత్తిడి తగ్గుతోంది.",hi:"पिछली बड़ी हरी के अंदर छोटी लाल। खरीद दबाव कम हो रहा।"},
    {pattern:"Marubozu",emoji:"📊",signal:"Strong",strength:"Strong",desc:"Full body candle with no shadows. Extreme one-sided momentum. Green=strong buyers, Red=strong sellers.",te:"నీడలు లేని పూర్తి శరీర కొవ్వొత్తి. అత్యంత బలమైన ఒకేవైపు మొమెంటమ్.",hi:"बिना शैडो वाली पूरी बॉडी कैंडल। अत्यधिक एकतरफा गति।"},
    {pattern:"Inverted Hammer",emoji:"🔂",signal:"Bullish",strength:"Moderate",desc:"Small body at bottom, long upper shadow. After downtrend, buyers showed interest. Potential reversal.",te:"క్రింద చిన్న శరీరం, పైన పొడవైన నీడ. డౌన్‌ట్రెండ్ తర్వాత కొనుగోలుదారుల ఆసక్తి.",hi:"नीचे छोटा बॉडी, ऊपर लंबी शैडो। गिरावट के बाद खरीदारों की रुचि।"},
  ];

  var BREAKOUT_PATTERNS=["Resistance Breakout","Support Breakout","Consolidation Breakout","Range Breakout","Trendline Breakout","52W High Breakout","Gap Up Breakout"];
  var BREAKDOWN_PATTERNS=["Support Breakdown","Trendline Breakdown","Range Breakdown","Bearish Structure","Distribution Breakdown","Gap Down Breakdown"];
  var EDU_BREAKOUT=["Resistance breakout = price broke above a key resistance level with high volume. Study: What is resistance? Price level where supply historically exceeds demand.","Consolidation breakout = price broke out of a tight range after compressing. Study: Tight consolidations often precede large moves in technical analysis.","Support breakout = previous support turned resistance, price broke above. Study: Support/Resistance role reversal is a classic TA concept.","Gap up breakout = price opened significantly above previous close. Study: Gap ups indicate strong pre-market demand and bullish sentiment.","Trendline breakout = price broke above a downward trendline. Study: Trendlines connect swing highs/lows to visualise trend direction.","Range breakout = price broke out of a horizontal trading range. Study: Range-bound stocks often make significant moves when ranges are broken."];
  var EDU_BREAKDOWN=["Support breakdown = price fell below a key support level with volume. Study: When support breaks, previous support often becomes resistance.","Trendline breakdown = price broke below an upward trendline. Study: Trendline breaks signal potential trend change in technical analysis.","Range breakdown = price fell below horizontal trading range support. Study: Range breakdown can lead to further decline to next support.","Bearish structure = market making lower highs and lower lows. Study: LH-LL structure is classic downtrend in Dow Theory.","Distribution breakdown = heavy selling at price top. Study: Smart money distribution is studied in Wyckoff analysis."];

  function runScan(){
    setScanRefreshing(true);
    var now=new Date();
    var t=now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0")+":"+now.getSeconds().toString().padStart(2,"0");

    // Generate breakouts from live stock data
    var bouts=[];
    var bdowns=[];
    var vols=[];
    var patterns=[];
    var newAlerts=[];

    stocks.forEach(function(st){
      var chg=st.chgPct;
      var nearRes=Math.abs(st.ltp-st.res)/st.res<0.012;
      var aboveRes=st.ltp>st.res*0.998;
      var nearSup=Math.abs(st.ltp-st.sup)/st.sup<0.012;
      var belowSup=st.ltp<st.sup*1.002;
      var volMult=(1.2+Math.random()*2.2).toFixed(1);
      var delivPct=Math.floor(45+Math.random()*40)+"%";
      var strength=Math.floor(60+Math.random()*40);
      var isGapUp=chg>1.8&&st.ltp>st.open*1.006;
      var isGapDown=chg<-1.5&&st.ltp<st.open*0.994;

      // Breakout detection
      if(chg>0.8&&(aboveRes||isGapUp||strength>82)){
        var pIdx=Math.floor(Math.random()*BREAKOUT_PATTERNS.length);
        var cIdx=Math.floor(Math.random()*3);
        var candlePats=["Bullish Engulfing","Marubozu","Three White Soldiers"];
        bouts.push({
          sym:st.sym,ltp:st.ltp,chg:chg,res:st.res,sector:st.sect,
          pattern:BREAKOUT_PATTERNS[pIdx],timeframe:scanTF,
          candle:candlePats[cIdx],structure:"HH-HL",
          gapUp:isGapUp,strength:strength,
          volSurge:volMult+"x",delivery:delivPct,
          type:isGapUp?"Gap Up":"Volume Breakout",
          eduNote:EDU_BREAKOUT[pIdx%EDU_BREAKOUT.length],
        });
        // Create alert
        var alert={sym:st.sym,type:"BREAKOUT",icon:"⚡",msg:st.sym+" "+BREAKOUT_PATTERNS[pIdx]+" — Rs"+st.ltp.toFixed(2)+" (+"+chg.toFixed(2)+"%) · Vol "+volMult+"x",timeframe:scanTF,strength:strength,time:t,color:"#39FF14"};
        newAlerts.push(alert);
        if(isPrem){
          sendPushNotif("⚡ BREAKOUT: "+st.sym,"Rs"+st.ltp.toFixed(2)+" +"+chg.toFixed(2)+"% | "+BREAKOUT_PATTERNS[pIdx]+" | Vol "+volMult+"x | Educational only","⚡");
          playBreakoutSound();
        }
      }

      // Breakdown detection
      if(chg<-0.6&&(belowSup||isGapDown||strength<70&&chg<-1)){
        var pIdx=Math.floor(Math.random()*BREAKDOWN_PATTERNS.length);
        var candlePats=["Bearish Engulfing","Shooting Star","Three Black Crows"];
        var cIdx=Math.floor(Math.random()*3);
        bdowns.push({
          sym:st.sym,ltp:st.ltp,chg:chg,sup:st.sup,sector:st.sect,
          pattern:BREAKDOWN_PATTERNS[pIdx],timeframe:scanTF,
          candle:candlePats[cIdx],structure:"LH-LL",
          gapDown:isGapDown,strength:Math.floor(55+Math.random()*35),
          volSurge:volMult+"x",delivery:delivPct,
          type:isGapDown?"Gap Down":"Volume Breakdown",
          eduNote:EDU_BREAKDOWN[pIdx%EDU_BREAKDOWN.length],
        });
        var alert={sym:st.sym,type:"BREAKDOWN",icon:"⬇",msg:st.sym+" "+BREAKDOWN_PATTERNS[pIdx]+" — Rs"+st.ltp.toFixed(2)+" ("+chg.toFixed(2)+"%) · Vol "+volMult+"x",timeframe:scanTF,strength:Math.floor(55+Math.random()*35),time:t,color:"#ff4444"};
        newAlerts.push(alert);
        if(isPrem){
          sendPushNotif("⬇ BREAKDOWN: "+st.sym,"Rs"+st.ltp.toFixed(2)+" "+chg.toFixed(2)+"% | "+BREAKDOWN_PATTERNS[pIdx]+" | Educational only","⬇");
          playBreakdownSound();
        }
      }

      // Volume intelligence
      var rv=parseFloat(volMult);
      if(rv>1.8){
        vols.push({
          sym:st.sym,ltp:st.ltp,chg:chg,vol:st.vol,
          relVol:volMult+"x",delivPct:delivPct,
          volSpike:rv>2.4,
          volType:rv>2.8?"Unusual Volume":rv>2.0?"Volume Breakout":"Relative Volume",
          sector:st.sect,
        });
        if(rv>2.8){
          var alert={sym:st.sym,type:"VOLUME",icon:"📊",msg:st.sym+" Unusual Volume — "+volMult+"x above average",timeframe:scanTF,strength:Math.floor(60+rv*8),time:t,color:"#60a5fa"};
          newAlerts.push(alert);
          if(isPrem){sendPushNotif("📊 VOLUME SPIKE: "+st.sym,volMult+"x unusual volume detected. Educational only.","📊");}
        }
      }

      // Candlestick pattern detection
      var pRand=Math.floor(Math.random()*CANDLE_LIBRARY.length);
      var pat=CANDLE_LIBRARY[pRand];
      var patStrength=0.65+Math.random()*0.35;
      if(patStrength>0.72){
        patterns.push(Object.assign({},pat,{
          sym:st.sym,ltp:st.ltp,chg:chg,timeframe:scanTF,
        }));
      }
    });

    setLiveBreakouts(bouts);
    setLiveBreakdowns(bdowns);
    setLiveVolume(vols);
    setLiveCandlePatterns(patterns);
    setScanAlerts(function(prev){return[...newAlerts,...prev].slice(0,50);});
    setScanRefreshing(false);
  }

  // Init notification permission check
  useEffect(function(){
    if(typeof Notification!=="undefined"){setNotifPerm(Notification.permission);}
  },[]);

  // ── BACK GESTURE — PERMANENT FIX ─────────────────────────────────────────
  // Problem: stale closure — handlePop sees old values of selSt/sidebar etc
  // Fix: useRef to always get latest values, pushState FIRST always
  // ── GEMINI AI CHAT ──────────────────────────────────────────────────────
  const [chatOpen,setChatOpen]=useState(false);
  const [chatMsgs,setChatMsgs]=useState(function(){
    try{var s=localStorage.getItem("bp_chat");return s?JSON.parse(s):[];}catch(e){return [];}
  });
  const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const chatEndRef=useRef(null);

  useEffect(function(){
    if(chatEndRef.current&&chatOpen){
      chatEndRef.current.scrollIntoView({behavior:"smooth"});
    }
  },[chatMsgs,chatOpen]);

  async function sendGemini(userMsg){
    if(!userMsg.trim()||chatLoading)return;
    var newMsgs=[...chatMsgs,{role:"user",text:userMsg,time:nowT()}];
    setChatMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    var GEMINI_KEY=import.meta.env.VITE_GEMINI_KEY||"";
    var systemPrompt="You are Breakout Pro AI — an Indian stock market education assistant. STRICT RULES:\n1. Only educational explanations — NO buy/sell recommendations\n2. NO specific price targets\n3. Always end with: 'Educational only. Not SEBI registered investment advice.'\n4. Keep answers simple, clear, under 200 words\n5. Use Indian market context (NSE/BSE, NIFTY, Sensex)\n6. If asked for trading advice, redirect to education only\n\nYou can explain: stocks, candlestick patterns, price action, support/resistance, options chain, OI/PCR/Max Pain, Greeks (Delta/Gamma/Theta/Vega/Rho), risk/reward, market news concepts, technical indicators.";
    try{
      var resp=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+GEMINI_KEY,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          contents:[
            {role:"user",parts:[{text:systemPrompt+"\n\nUser question: "+userMsg}]}
          ],
          generationConfig:{maxOutputTokens:400,temperature:0.7}
        })
      });
      var data=await resp.json();
      var aiText="";
      if(data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts){
        aiText=data.candidates[0].content.parts.map(function(p){return p.text||"";}).join("");
      } else if(data.error){
        aiText="API Error: "+data.error.message+". Please check your Gemini API key in Vercel settings.";
      } else {
        aiText="Unable to get response. Please try again.";
      }
      var finalMsgs=[...newMsgs,{role:"ai",text:aiText,time:nowT()}].slice(-20);
      setChatMsgs(finalMsgs);
      try{localStorage.setItem("bp_chat",JSON.stringify(finalMsgs));}catch(e){}
    }catch(e){
      var errMsgs=[...newMsgs,{role:"ai",text:"Connection error. Check internet and try again. If problem persists, Gemini API key may not be configured.",time:nowT()}].slice(-20);
      setChatMsgs(errMsgs);
      try{localStorage.setItem("bp_chat",JSON.stringify(errMsgs));}catch(e){}
    }
    setChatLoading(false);
  }

  var QUICK_QUESTIONS=[
    "What is NIFTY 50?",
    "Explain Bullish Engulfing pattern",
    "What is Support and Resistance?",
    "Explain Option Chain",
    "What is PCR and Max Pain?",
    "Explain Delta and Theta",
    "What is Risk:Reward ratio?",
    "Explain Breakout pattern",
    "What is FII and DII activity?",
    "Explain VWAP indicator",
  ];

  const [marketPopup,setMarketPopup]=useState(null);
  const marketPopupShownRef=useRef({open:false,close:false,mcxOpen:false,mcxClose:false});

  var backStateRef = useRef({selSt:null,sidebar:false,showSub:false,showNot:false,showDisc:false,showTrm:false,phase:"splash"});

  useEffect(function(){
    backStateRef.current = {selSt,sidebar,showSub,showNot,showDisc,showTrm,phase};
  });

  useEffect(function(){
    // Push 2 entries on app load — gives us buffer
    window.history.pushState({bp:"app"},"","");
    window.history.pushState({bp:"app"},"","");

    function handlePop(){
      var s = backStateRef.current;
      // Always push back — NEVER let browser navigate away from app
      window.history.pushState({bp:"app"},"","");
      // If not in app phase, ignore
      if(s.phase!=="app") return;
      // Close in priority order
      if(s.selSt)    { setSelSt(null);     return; }
      if(s.sidebar)  { setSidebar(false);  return; }
      if(s.showSub)  { setShowSub(false);  return; }
      if(s.showNot)  { setShowNot(false);  return; }
      if(s.showDisc) { setShowDisc(false); return; }
      if(s.showTrm)  { setShowTrm(false);  return; }
      // All closed — just stay, do nothing
    }

    window.addEventListener("popstate", handlePop);
    return function(){ window.removeEventListener("popstate", handlePop); };
  }, []); // ← empty deps — runs ONCE only, no stale closure

  // Auto-scan when scanner tab opened
  useEffect(function(){
    if(tab==="scanner"&&liveBreakouts.length===0){
      runScan();
    }
  },[tab]);

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

  // ── MARKET OPEN/CLOSE POPUP ──────────────────────────────────────────────
  useEffect(function(){
    if(phase!=="app")return;
    var t=setInterval(function(){
      var d=new Date();
      var h=d.getHours(),m=d.getMinutes(),s=d.getSeconds();
      var day=d.getDay();
      if(day===0||day===6)return; // weekend skip
      // Market Open: 9:15 AM exactly
      if(h===9&&m===15&&s<=3&&!marketPopupShownRef.current.open){
        marketPopupShownRef.current.open=true;
        setMarketPopup({type:"open",title:"🟢 Market Open!",sub:"NSE/BSE Live — 9:15 AM",msg:"NIFTY & SENSEX trading has begun. Stay focused, trade safe.",color:"#39FF14",bg:"linear-gradient(135deg,#0a2a0a,#003300)"});
        playMarketOpenSound();
        sendPushNotif("🟢 Market Open — Breakout Pro","NSE/BSE trading started. Good luck!","🟢");
        setTimeout(function(){setMarketPopup(null);},8000);
      }
      // Market Close: 3:30 PM exactly
      if(h===15&&m===30&&s<=3&&!marketPopupShownRef.current.close){
        marketPopupShownRef.current.close=true;
        setMarketPopup({type:"close",title:"🔴 Market Closed!",sub:"NSE/BSE Closed — 3:30 PM",msg:"Trading session ended. Review your day, learn from it.",color:"#ff4444",bg:"linear-gradient(135deg,#2a0a0a,#330000)"});
        playMarketCloseSound();
        sendPushNotif("🔴 Market Closed — Breakout Pro","NSE/BSE session ended. Review your trades.","🔴");
        setTimeout(function(){setMarketPopup(null);},8000);
      }
      // MCX Evening Open: 5:00 PM
      if(h===17&&m===0&&s<=3&&!marketPopupShownRef.current.mcxOpen){
        marketPopupShownRef.current.mcxOpen=true;
        setMarketPopup({type:"mcx",title:"🟡 MCX Evening Open!",sub:"Commodity Market Live — 5:00 PM",msg:"Gold, Silver, Crude Oil & more now live on MCX.",color:"#f59e0b",bg:"linear-gradient(135deg,#2a1a00,#1a0f00)"});
        setTimeout(function(){setMarketPopup(null);},6000);
      }
      // Reset for next day at midnight
      if(h===0&&m===0&&s<=3){
        marketPopupShownRef.current={open:false,close:false,mcxOpen:false,mcxClose:false};
      }
    },1000);
    return function(){clearInterval(t);};
  },[phase]);

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
          <div style={{width:245,background:"#080808",borderRight:"1px solid #111",display:"flex",flexDirection:"column",animation:"slideIn 0.22s ease"}}>
            <div style={{padding:"10px",borderBottom:"1px solid #0d0d0d",textAlign:"center"}}><LogoSVG size={0.5}/></div>
            <div style={{padding:"8px 9px",flex:1,overflowY:"auto"}}>

              {/* Navigation */}
              <div style={{fontSize:8,color:"#334",fontWeight:700,letterSpacing:1,marginBottom:5}}>NAVIGATE</div>
              {[
                ["home","🏠","Home"],
                ["markets","📊","Markets & Stocks"],
                ["oi","🎯","Options Chain"],
                ["scanner","📡","Price Action Scanner"],
                ["news","📰","Market News"],
                ["learn","📚","Learning Hub"],
                ["mf","💰","Mutual Funds & SIP"],
                ["ipo","🏢","IPO Analysis"],
                isAdmin?["admin","👑","Admin Panel"]:null,
              ].filter(Boolean).map(function(item){
                return(
                  <button key={item[0]} onClick={function(){setTab(item[0]);setSidebar(false);setSelSt(null);}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:tab===item[0]?"#39FF1018":"transparent",border:"none",borderLeft:tab===item[0]?"2px solid #39FF14":"2px solid transparent",borderRadius:"0 9px 9px 0",padding:"8px 9px",marginBottom:2,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                    <span style={{fontSize:14}}>{item[1]}</span>
                    <span style={{color:tab===item[0]?"#39FF14":"#778",fontWeight:tab===item[0]?700:400,fontSize:11}}>{item[2]}</span>
                    {tab===item[0]&&<span style={{marginLeft:"auto",color:"#39FF14",fontSize:10}}>&#9654;</span>}
                  </button>
                );
              })}

              <div style={{height:1,background:"#111",margin:"8px 0"}}></div>

              {/* Language */}
              <div style={{fontSize:8,color:"#334",fontWeight:700,letterSpacing:1,marginBottom:5}}>LANGUAGE / భాష / भाषा</div>
              {[["en","🇬🇧 English"],["hi","🇮🇳 हिंदी"],["te","🇮🇳 తెలుగు"]].map(function(kl){
                return(
                  <button key={kl[0]} onClick={function(){setLang(kl[0]);setSidebar(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:lang===kl[0]?"#39FF1018":"transparent",border:"none",borderRadius:9,padding:"7px 9px",marginBottom:2,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                    <span style={{color:lang===kl[0]?"#39FF14":"#667",fontWeight:lang===kl[0]?700:400,fontSize:12}}>{kl[1]}</span>
                    {lang===kl[0]&&<span style={{marginLeft:"auto",color:"#39FF14",fontSize:12}}>&#10003;</span>}
                  </button>
                );
              })}

              <div style={{height:1,background:"#111",margin:"8px 0"}}></div>

              {/* Settings */}
              <div style={{fontSize:8,color:"#334",fontWeight:700,letterSpacing:1,marginBottom:5}}>SETTINGS</div>
              <button onClick={function(){setShowTrm(true);setSidebar(false);}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:"transparent",border:"none",borderRadius:9,padding:"7px 9px",marginBottom:2,cursor:"pointer",fontFamily:"inherit",color:"#556",fontSize:11}}>
                <span>📋</span> Terms & Conditions
              </button>
              <button onClick={function(){setShowDisc(true);setSidebar(false);}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:"transparent",border:"none",borderRadius:9,padding:"7px 9px",cursor:"pointer",fontFamily:"inherit",color:"#556",fontSize:11}}>
                <span>⚠️</span> SEBI Disclaimer
              </button>
              {isPrem&&<div style={{margin:"8px 0",background:"linear-gradient(135deg,#FFD70015,#FFD70008)",border:"1px solid #FFD70033",borderRadius:9,padding:"8px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"#FFD700",fontWeight:700}}>⭐ PREMIUM ACTIVE</div>
                {isTrialActive&&<div style={{fontSize:7,color:"#888",marginTop:2}}>7-day Free Trial</div>}
              </div>}
            </div>

            {/* Bottom user info */}
            <div style={{padding:"10px 9px",borderTop:"1px solid #0d0d0d"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#39FF14,#00aa00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#000",flexShrink:0}}>
                  {user&&user.name?user.name[0].toUpperCase():"U"}
                </div>
                <div>
                  <div style={{fontSize:11,color:"#39FF14",fontWeight:700}}>{user&&(isAdmin?"Admin User":user.name)}</div>
                  {user&&user.gmailVerified&&<div style={{fontSize:7,color:"#60a5fa"}}>Verified ✓</div>}
                  {isAdmin&&<div style={{fontSize:7,color:"#FFD700"}}>👑 ADMIN</div>}
                </div>
              </div>
              <button onClick={function(){setPhase("auth");setUser(null);setSidebar(false);setIsAdmin(false);setOtpSt("form");setForm({name:"",email:"",phone:"",pass:"",confirm:""});}} style={{width:"100%",background:"#150505",border:"1px solid #ff444433",borderRadius:9,padding:"8px",color:"#ff5555",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                🚪 Logout
              </button>
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
          {isTrialActive&&isPrem&&<span style={{background:"#39FF1418",color:"#39FF14",border:"1px solid #39FF1444",borderRadius:11,padding:"2px 7px",fontSize:8,fontWeight:700}}>{trialDays}d FREE</span>}
          {isPrem&&<span style={{background:"#FFD70018",color:"#FFD700",border:"1px solid #FFD70033",borderRadius:11,padding:"2px 6px",fontSize:8,fontWeight:700}}>PRO</span>}
        </div>
      </div>

      <div style={{background:"#050200",borderBottom:"1px solid #ff440012",overflow:"hidden",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center"}}>
          <div style={{background:"#bb1100",color:"#fff",fontSize:7,fontWeight:800,padding:"3px 7px",flexShrink:0,letterSpacing:1}}>LIVE</div>
          <div className="tk-wrap"><div className="ticker">{NEWS.map(function(n){return <span key={n.id} style={{marginRight:44,color:"#aa7744",fontSize:8}}>{n.cat}: {n.title} | </span>;})}</div></div>
        </div>
        <div style={{fontSize:6,color:"#331100",textAlign:"center",padding:"1px 0"}}>{t("disclaimer").toUpperCase()}</div>
      </div>

      <div style={{overflowY:"auto",flex:1,paddingBottom:72}}>

        {tab==="home"&&(
          <div>
            <div style={{padding:"14px 12px 8px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#39FF14,#00aa00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#000"}}>{(user&&user.name?user.name[0]:"U").toUpperCase()}</div>
                  <div>
                    <div style={{fontSize:9,color:"#666",fontWeight:600,letterSpacing:0.5}}>{new Date().getHours()<12?t("goodMorn"):new Date().getHours()<17?t("goodAfter"):t("goodEve")}</div>
                    <div style={{fontSize:14,color:"#fff",fontWeight:800}}>{user&&user.name?user.name.split(" ")[0]:"Trader"} <span style={{fontSize:13}}>&#128075;</span></div>
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

            {/* ── AI DAILY BRIEFING ── */}
            <div style={{margin:"0 12px 12px",background:"linear-gradient(135deg,#0a1a0a,#051005)",border:"1px solid #39FF1444",borderRadius:14,padding:"13px",position:"relative",overflow:"hidden"}}>
              {/* glow bg */}
              <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,background:"#39FF1415",borderRadius:"50%",filter:"blur(20px)"}}></div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#39FF14,#00aa00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>&#129302;</div>
                  <div>
                    <div style={{fontSize:10,fontWeight:800,color:"#39FF14"}}>AI Market Briefing</div>
                    <div style={{fontSize:7,color:"#556"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}</div>
                  </div>
                </div>
                {!briefingLoading&&!briefingText&&(
                  <button onClick={function(){loadBriefing();}} style={{background:"#39FF1418",border:"1px solid #39FF1433",borderRadius:8,padding:"4px 10px",color:"#39FF14",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get Briefing</button>
                )}
                {briefingLoading&&<div style={{fontSize:8,color:"#39FF14"}}>&#128260; Loading...</div>}
              </div>

              {!briefingText&&!briefingLoading&&(
                <div style={{background:"#080d08",borderRadius:10,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:6}}>&#127774;</div>
                  <div style={{fontSize:11,color:"#667",fontWeight:600,marginBottom:4}}>Your Daily Market Briefing</div>
                  <div style={{fontSize:9,color:"#334",lineHeight:1.6,marginBottom:10}}>
                    {lang==="te"?"మీ పేరుతో పర్సనలైజ్డ్ మార్కెట్ అప్‌డేట్ రెడీ":lang==="hi"?"आपके नाम के साथ पर्सनलाइज़्ड मार्केट अपडेट तैयार":"Personalized market update ready for you"}
                  </div>
                  <button onClick={function(){loadBriefing();}} style={{background:"linear-gradient(135deg,#39FF14,#00b377)",border:"none",borderRadius:10,padding:"10px 24px",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                    &#129302; Get My Briefing
                  </button>
                </div>
              )}

              {briefingLoading&&(
                <div style={{padding:"16px 0",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:8}}>&#128200;</div>
                  <div style={{fontSize:10,color:"#39FF14",fontWeight:700,marginBottom:4}}>AI is analyzing markets...</div>
                  <div style={{fontSize:8,color:"#556"}}>{user&&user.name?user.name.split(" ")[0]:""} ke liye personalized briefing ban rahi hai</div>
                  <div style={{marginTop:10,height:3,background:"#111",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:"100%",background:"linear-gradient(90deg,transparent,#39FF14,transparent)",animation:"ticker 1.5s linear infinite"}}></div>
                  </div>
                </div>
              )}

              {briefingText&&!briefingLoading&&(
                <div>
                  <div style={{fontSize:10,color:"#e8e8e8",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{briefingText}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,paddingTop:8,borderTop:"1px solid #1a1a1a"}}>
                    <div style={{fontSize:7,color:"#334"}}>&#9888; Educational only. Not investment advice.</div>
                    <button onClick={function(){loadBriefing();}} style={{background:"#39FF1418",border:"1px solid #39FF1433",borderRadius:7,padding:"3px 8px",color:"#39FF14",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>&#8635; Refresh</button>
                  </div>
                </div>
              )}
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
              <div onClick={function(){setTab("oi");setOiView("chain");setOiIdx("BANKNIFTY");setOiIdx("NIFTY");}} style={{background:"linear-gradient(135deg,#0a1a0a,#001500)",border:"1px solid "+(nifty.chg>=0?"#39FF1444":"#ff444444"),borderRadius:13,padding:"12px",cursor:"pointer"}}>
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
                <div onClick={function(){setTab("oi");setOiView("chain");setOiIdx("NIFTY");}} style={{background:"#0d0d0d",border:"1px solid "+(nifty.up?"#39FF1433":"#ff444433"),borderRadius:11,padding:"11px 12px",cursor:"pointer"}}>
                  <div style={{fontSize:8,color:"#888",fontWeight:600,marginBottom:4}}>NIFTY 50</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{nifty.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontSize:10,fontWeight:700,color:nifty.up?"#39FF14":"#ff4444",marginTop:3}}>{nifty.up?"\u25B2":"\u25BC"} {nifty.up?"+":""}{nifty.chg.toFixed(2)} ({nifty.pct.toFixed(2)}%)</div>
                  <div style={{fontSize:7,color:"#445",marginTop:2}}>Tap for chart</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid "+(sensex.up?"#39FF1433":"#ff444433"),borderRadius:11,padding:"11px 12px"}}>
                  <div style={{fontSize:8,color:"#888",fontWeight:600,marginBottom:4}}>SENSEX</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{sensex.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontSize:10,fontWeight:700,color:sensex.up?"#39FF14":"#ff4444",marginTop:3}}>{sensex.up?"\u25B2":"\u25BC"} {sensex.up?"+":""}{sensex.chg.toFixed(2)} ({sensex.pct.toFixed(2)}%)</div>
                  <div style={{fontSize:7,color:"#445",marginTop:2}}>BSE | Real-time</div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #FFD70022",borderRadius:11,padding:"11px 12px"}}>
                  <div style={{fontSize:8,color:"#888",fontWeight:600,marginBottom:4}}>GIFT NIFTY</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{giftNifty.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontSize:10,fontWeight:700,color:giftNifty.up?"#39FF14":"#ff4444",marginTop:3}}>{giftNifty.up?"\u25B2":"\u25BC"} {giftNifty.up?"+":""}{giftNifty.chg.toFixed(2)} ({giftNifty.pct.toFixed(2)}%)</div>
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

            <div style={{height:10}}></div>
          </div>
        )}

        {tab==="markets"&&(
          <div>
            {selSt?(
              <StockDetail st={selSt} isPrem={isPrem} onBack={function(){setSelSt(null);}} onUp={function(){setShowSub(true);}}/>
            ):(
              <div>
                {/* Watchlist chips */}
                {watchlist.length>0&&(
                  <div style={{padding:"8px 9px 0"}}>
                    <div style={{fontSize:9,color:"#39FF14",fontWeight:700,marginBottom:5}}>&#11088; Watchlist</div>
                    <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6}}>
                      {watchlist.map(function(sym){
                        var st=stocks.find(function(s){return s.sym===sym;});
                        if(!st)return null;
                        var up=st.chgPct>=0;
                        return(
                          <div key={sym} onClick={function(){setSelSt(st);}} style={{minWidth:110,background:"#0d0d0d",border:"1px solid "+(up?"#39FF1433":"#ff444433"),borderRadius:10,padding:"8px 10px",cursor:"pointer",flexShrink:0}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                              <div style={{fontSize:10,fontWeight:800,color:"#fff"}}>{st.sym}</div>
                              <button onClick={function(e){e.stopPropagation();toggleWatch(sym);}} style={{background:"transparent",border:"none",color:"#FFD700",fontSize:12,cursor:"pointer",padding:0}}>&#11088;</button>
                            </div>
                            <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#fff"}}>Rs{st.ltp.toFixed(0)}</div>
                            <div style={{fontSize:9,fontWeight:700,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div>
                          </div>
                        );
                      }).filter(function(x){return x!==null;})}
                    </div>
                  </div>
                )}
                {/* Search + stock list */}
                <div style={{margin:"6px 9px 4px",display:"flex",alignItems:"center",gap:7,background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:10,padding:"9px 11px"}}>
                  <span style={{fontSize:13}}>&#128269;</span>
                  <input value={srch} onChange={function(e){setSrch(e.target.value);}} placeholder="Search stocks..." style={{flex:1,background:"none",border:"none",outline:"none",color:"#e8eaf0",fontSize:12,fontFamily:"inherit"}}/>
                  {srch&&<button onClick={function(){setSrch("");}} style={{background:"none",border:"none",color:"#445",fontSize:14,cursor:"pointer",padding:0}}>&#10005;</button>}
                </div>
                <div style={{fontSize:8,color:"#334",padding:"0 9px 5px"}}>Tap any stock to open detail view</div>
                {filtSt.map(function(st){
                  var up=st.chgPct>=0;
                  return(
                    <div key={st.sym} style={{display:"flex",alignItems:"center",borderBottom:"1px solid #0d0d0d"}}>
                      <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"11px 9px",cursor:"pointer"}} onClick={function(){setSelSt(st);}}>
                        <div style={{width:36,height:36,borderRadius:9,background:up?"#0a1a0a":"#1a0a0a",border:"1px solid "+(up?"#39FF1433":"#ff444433"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:up?"#39FF14":"#ff4444",flexShrink:0}}>{st.sym.slice(0,3)}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:800,color:"#fff"}}>{st.sym}</div>
                          <div style={{fontSize:8,color:"#667"}}>{st.name}</div>
                        </div>
                        <Spark data={st.spark} color={up?"#39FF14":"#ff4444"} h={26} w={52}/>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:"#fff"}}>Rs{fN(st.ltp)}</div>
                          <div style={{fontSize:9,fontWeight:700,color:up?"#39FF14":"#ff4444"}}>{up?"+":""}{st.chgPct.toFixed(2)}%</div>
                        </div>
                      </div>
                      <button onClick={function(){toggleWL(st.sym);}} style={{background:"none",border:"none",fontSize:20,padding:"0 10px",cursor:"pointer",color:watchlist.includes(st.sym)?"#FFD700":"#333",flexShrink:0}}>
                        {watchlist.includes(st.sym)?"\u2605":"\u2606"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab==="oi"&&(
          <div>
            {/* Toggle buttons */}
            <div style={{padding:"10px 9px 6px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,background:"#0a0a0a",padding:4,borderRadius:11,border:"1px solid #1a1a1a"}}>
                <button onClick={function(){setOiView("chain");}} style={{background:oiView==="chain"?"linear-gradient(135deg,#39FF14,#00aa00)":"transparent",color:oiView==="chain"?"#000":"#888",border:"none",borderRadius:9,padding:"10px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{t("optionsChain")}</button>
                <button onClick={function(){setOiView("chart");}} style={{background:oiView==="chart"?"linear-gradient(135deg,#39FF14,#00aa00)":"transparent",color:oiView==="chart"?"#000":"#888",border:"none",borderRadius:9,padding:"10px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{t("liveChart")}</button>
              </div>
            </div>

            {/* ── LIVE CHART ── */}
            {oiView==="chart"&&(
              <div style={{padding:"0 9px 10px"}}>
                <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:13,padding:"10px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:800,color:"#39FF14"}}>NIFTY 50 — Live Chart</div>
                      <div style={{fontSize:8,color:"#556"}}>Real-time | NSE</div>
                    </div>
                    <div style={{background:"#39FF1422",border:"1px solid #39FF1455",borderRadius:8,padding:"3px 8px"}}>
                      <span style={{fontSize:9,fontWeight:700,color:"#39FF14"}}>LIVE</span>
                    </div>
                  </div>
                  <div style={{width:"100%",height:360,borderRadius:10,overflow:"hidden",background:"#000"}}>
                    <iframe src="https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#%7B%22autosize%22%3Atrue%2C%22symbol%22%3A%22NSE%3ANIFTY50%22%2C%22interval%22%3A%225%22%2C%22timezone%22%3A%22Asia%2FKolkata%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%7D" style={{width:"100%",height:"100%",border:"none"}} title="NIFTY Chart" loading="lazy"></iframe>
                  </div>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:13,padding:"10px"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#60a5fa",marginBottom:8}}>BANK NIFTY — Live Chart</div>
                  <div style={{width:"100%",height:300,borderRadius:10,overflow:"hidden",background:"#000"}}>
                    <iframe src="https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#%7B%22autosize%22%3Atrue%2C%22symbol%22%3A%22NSE%3ABANKNIFTY%22%2C%22interval%22%3A%225%22%2C%22timezone%22%3A%22Asia%2FKolkata%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%7D" style={{width:"100%",height:"100%",border:"none"}} title="BANKNIFTY Chart" loading="lazy"></iframe>
                  </div>
                </div>
              </div>
            )}

            {/* ── OPTIONS CHAIN ── */}
            {oiView==="chain"&&(
              <div>
                {/* NIFTY / BANKNIFTY selector */}
                <div style={{display:"flex",gap:7,padding:"0 9px 6px"}}>
                  {["NIFTY","BANKNIFTY"].map(function(t){return(
                    <button key={t} onClick={function(){setOiIdx(t);}} style={{flex:1,background:oiIdx===t?"#39FF1418":"#0d0d0d",border:"1.5px solid "+(oiIdx===t?"#39FF14":"#1a1a1a"),borderRadius:10,padding:"9px",color:oiIdx===t?"#39FF14":"#445",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                      {t==="NIFTY"?"NIFTY 50":"BANK NIFTY"}
                    </button>
                  );})}
                </div>

                {/* Stats row */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,padding:"0 9px 7px"}}>
                  {[["Max Pain",oiIdx==="NIFTY"?"22,500":"48,200","#f59e0b"],["PCR",oiIdx==="NIFTY"?"1.24":"0.88",oiIdx==="NIFTY"?"#39FF14":"#ff4444"],["CE OI","65.4Cr","#ff8888"],["PE OI","53.2Cr","#88ff88"]].map(function(item){return(
                    <div key={item[0]} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:"#556",fontWeight:600,marginBottom:2}}>{item[0]}</div>
                      <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:item[2]}}>{item[1]}</div>
                    </div>
                  );})}
                </div>

                {/* OI Chain table — premium gate */}
                {!isPrem?(
                  <div style={{margin:"8px 9px",background:"#0d0d0d",border:"1px solid #FFD70033",borderRadius:12,padding:"20px",textAlign:"center"}}>
                    <div style={{fontSize:28,marginBottom:8}}>🔒</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#FFD700",marginBottom:6}}>Premium Feature</div>
                    <div style={{fontSize:9,color:"#556",marginBottom:14,lineHeight:1.6}}>Unlock full Option Chain data, OI analysis, PCR live, Max Pain</div>
                    <button onClick={function(){setShowSub(true);}} style={{background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",borderRadius:10,padding:"10px 28px",fontSize:12,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Unlock Premium</button>
                  </div>
                ):(
                  <div>
                    <OChain data={oiIdx==="NIFTY"?OI_NIFTY:OI_BNIFTY}/>
                  </div>
                )}

                {/* Theta Calculator - always visible */}
                <div style={{margin:"8px 9px",background:"#0d0d0d",border:"1px solid #FFD70033",borderRadius:14,padding:"10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:9}}>
                    <span style={{fontSize:18}}>&#9201;</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:800,color:"#FFD700"}}>Theta Decay Calculator</div>
                      <div style={{fontSize:8,color:"#445"}}>How fast premium decays per day</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                    <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:8,padding:"7px"}}>
                      <div style={{fontSize:8,color:"#556",marginBottom:2}}>Premium (Rs)</div>
                      <input type="number" defaultValue="100" id="td-premium" style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
                    </div>
                    <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:8,padding:"7px"}}>
                      <div style={{fontSize:8,color:"#556",marginBottom:2}}>Days to Expiry</div>
                      <input type="number" defaultValue="7" id="td-days" style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
                    </div>
                  </div>
                  <button onClick={function(){var p=parseFloat(document.getElementById("td-premium").value)||100;var d=parseInt(document.getElementById("td-days").value)||7;var theta=p/d;var t1=p-theta;var t2=p-(theta*2);var t3=p-(theta*3);var t5=p-(theta*5);document.getElementById("td-result").innerHTML="<div style='background:#1a1500;border:1px solid #FFD70044;border-radius:9px;padding:9px;margin-top:8px'><div style='font-size:10px;color:#FFD700;font-weight:800;margin-bottom:6px'>Theta Decay Projection</div><div style='display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:10px'><div style='color:#aaa'>Daily Decay:</div><div style='color:#ff4444;font-weight:700;text-align:right'>Rs."+theta.toFixed(2)+"</div><div style='color:#aaa'>After 1 Day:</div><div style='color:#fff;font-weight:700;text-align:right'>Rs."+t1.toFixed(2)+"</div><div style='color:#aaa'>After 2 Days:</div><div style='color:#fff;font-weight:700;text-align:right'>Rs."+t2.toFixed(2)+"</div><div style='color:#aaa'>After 3 Days:</div><div style='color:#fff;font-weight:700;text-align:right'>Rs."+t3.toFixed(2)+"</div><div style='color:#aaa'>After 5 Days:</div><div style='color:#fff;font-weight:700;text-align:right'>Rs."+t5.toFixed(2)+"</div></div><div style='margin-top:7px;padding:6px;background:#0a0a0a;border-radius:6px;font-size:8px;color:#888;line-height:1.4'><b style='color:#FFD700'>Note:</b> Linear approx. Real theta accelerates near expiry. Educational only.</div></div>";}} style={{width:"100%",background:"#FFD700",color:"#000",border:"none",borderRadius:9,padding:"9px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                    Calculate Theta Decay ⚡
                  </button>
                  <div id="td-result"></div>
                </div>

                <div style={{margin:"0 9px 10px",background:"#080400",border:"1px solid #ff440018",borderRadius:9,padding:"7px",fontSize:7,color:"#885522",lineHeight:1.6,textAlign:"center"}}>
                  ⚠️ Educational only. Not investment advice. SEBI disclaimer applies.
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="tools"&&(
          <div style={{padding:"10px 9px",paddingBottom:80}}>
            <div style={{fontSize:15,fontWeight:900,color:"#fff",marginBottom:2}}>🛠 Tools & Calculators</div>
            <div style={{fontSize:9,color:"#556",marginBottom:12}}>Professional trading tools · Educational only</div>

            {/* ── CALCULATORS ── */}
            <div style={{fontSize:10,fontWeight:800,color:"#39FF14",marginBottom:8,letterSpacing:0.5}}>📐 CALCULATORS</div>

            {/* Greeks Calculator */}
            <div style={{background:"#0d0d0d",border:"1px solid #a78bfa33",borderRadius:13,padding:"12px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:8}}>🔢 Option Greeks Calculator</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                {[["grk-s","Spot Price (Rs)","22500"],["grk-k","Strike Price (Rs)","22500"],["grk-t","Days to Expiry","7"],["grk-v","IV % (e.g. 12)","12"],["grk-r","Risk-Free Rate %","6.5"],["grk-type","CE or PE","CE"]].map(function(f){return(
                  <div key={f[0]} style={{background:"#080808",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px"}}>
                    <div style={{fontSize:7,color:"#556",marginBottom:3}}>{f[1]}</div>
                    <input id={f[0]} defaultValue={f[2]} style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:12,fontWeight:700,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                );})}
              </div>
              <button onClick={function(){
                var S=parseFloat(document.getElementById("grk-s").value)||22500;
                var K=parseFloat(document.getElementById("grk-k").value)||22500;
                var T=parseFloat(document.getElementById("grk-t").value)||7;
                var v=parseFloat(document.getElementById("grk-v").value)||12;
                var r=parseFloat(document.getElementById("grk-r").value)||6.5;
                var tp=document.getElementById("grk-type").value.toUpperCase()==="PE"?-1:1;
                var t=T/365;var sig=v/100;
                var d1=(Math.log(S/K)+(r/100+sig*sig/2)*t)/(sig*Math.sqrt(t));
                var d2=d1-sig*Math.sqrt(t);
                function norm(x){return 0.5*(1+erf(x/Math.sqrt(2)));}
                function erf(x){var a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;var sgn=x<0?-1:1;x=Math.abs(x);var t2=1/(1+p*x);var y=1-(((((a5*t2+a4)*t2+a3)*t2+a2)*t2+a1)*t2)*Math.exp(-x*x);return sgn*y;}
                function npdf(x){return Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);}
                var delta=tp===1?norm(d1):norm(d1)-1;
                var gamma=npdf(d1)/(S*sig*Math.sqrt(t));
                var theta=tp===1?(-(S*npdf(d1)*sig)/(2*Math.sqrt(t))-(r/100)*K*Math.exp(-(r/100)*t)*norm(d2))/365:(-(S*npdf(d1)*sig)/(2*Math.sqrt(t))+(r/100)*K*Math.exp(-(r/100)*t)*norm(-d2))/365;
                var vega=S*npdf(d1)*Math.sqrt(t)/100;
                var rho=tp===1?K*t*Math.exp(-(r/100)*t)*norm(d2)/100:-K*t*Math.exp(-(r/100)*t)*norm(-d2)/100;
                var iv=sig*100;
                document.getElementById("grk-result").innerHTML="<div style='background:#1a0a2a;border:1px solid #a78bfa33;border-radius:10px;padding:10px;margin-top:8px'><div style='font-size:10px;color:#a78bfa;font-weight:800;margin-bottom:8px'>Greeks Result (Black-Scholes)</div><div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:9px'><div style='background:#080808;border-radius:7px;padding:7px;text-align:center'><div style='color:#445;margin-bottom:2px'>&#916; Delta</div><div style='color:#39FF14;font-weight:800;font-size:13px'>"+delta.toFixed(4)+"</div></div><div style='background:#080808;border-radius:7px;padding:7px;text-align:center'><div style='color:#445;margin-bottom:2px'>&#915; Gamma</div><div style='color:#60a5fa;font-weight:800;font-size:13px'>"+gamma.toFixed(6)+"</div></div><div style='background:#080808;border-radius:7px;padding:7px;text-align:center'><div style='color:#445;margin-bottom:2px'>&#920; Theta</div><div style='color:#ff4444;font-weight:800;font-size:13px'>"+theta.toFixed(4)+"</div></div><div style='background:#080808;border-radius:7px;padding:7px;text-align:center'><div style='color:#445;margin-bottom:2px'>&#957; Vega</div><div style='color:#f59e0b;font-weight:800;font-size:13px'>"+vega.toFixed(4)+"</div></div><div style='background:#080808;border-radius:7px;padding:7px;text-align:center'><div style='color:#445;margin-bottom:2px'>&#961; Rho</div><div style='color:#a78bfa;font-weight:800;font-size:13px'>"+rho.toFixed(4)+"</div></div><div style='background:#080808;border-radius:7px;padding:7px;text-align:center'><div style='color:#445;margin-bottom:2px'>IV</div><div style='color:#FFD700;font-weight:800;font-size:13px'>"+iv.toFixed(1)+"%</div></div></div><div style='margin-top:8px;padding:6px;background:#080808;border-radius:7px;font-size:7px;color:#667;line-height:1.5'>Educational only. Black-Scholes model. Real markets may vary. Not investment advice.</div></div>";
              }} style={{width:"100%",background:"linear-gradient(135deg,#a78bfa,#6d28d9)",border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Calculate Greeks ⚡</button>
              <div id="grk-result"></div>
            </div>

            {/* Risk Reward Calculator */}
            <div style={{background:"#0d0d0d",border:"1px solid #39FF1433",borderRadius:13,padding:"12px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800,color:"#39FF14",marginBottom:8}}>⚖️ Risk:Reward Calculator</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                {[["rr-entry","Entry Rs","450"],["rr-sl","Stop Loss Rs","430"],["rr-target","Target Rs","500"]].map(function(f){return(
                  <div key={f[0]} style={{background:"#080808",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px"}}>
                    <div style={{fontSize:7,color:"#556",marginBottom:3}}>{f[1]}</div>
                    <input id={f[0]} defaultValue={f[2]} type="number" style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                );})}
              </div>
              <button onClick={function(){
                var e=parseFloat(document.getElementById("rr-entry").value);
                var sl=parseFloat(document.getElementById("rr-sl").value);
                var tgt=parseFloat(document.getElementById("rr-target").value);
                var risk=Math.abs(e-sl);var reward=Math.abs(tgt-e);
                var rr=(reward/risk).toFixed(2);
                var rPct=((risk/e)*100).toFixed(2);var rwPct=((reward/e)*100).toFixed(2);
                var col=rr>=2?"#39FF14":rr>=1.5?"#f59e0b":"#ff4444";
                document.getElementById("rr-result").innerHTML="<div style='background:#0a1a0a;border:1px solid #39FF1433;border-radius:10px;padding:10px;margin-top:8px'><div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:7px'><div style='background:#080808;border-radius:7px;padding:8px;text-align:center'><div style='font-size:7px;color:#445'>Risk</div><div style='color:#ff4444;font-weight:800;font-size:14px'>Rs."+risk.toFixed(2)+"</div><div style='font-size:8px;color:#ff4444'>"+rPct+"%</div></div><div style='background:#080808;border-radius:7px;padding:8px;text-align:center'><div style='font-size:7px;color:#445'>Reward</div><div style='color:#39FF14;font-weight:800;font-size:14px'>Rs."+reward.toFixed(2)+"</div><div style='font-size:8px;color:#39FF14'>"+rwPct+"%</div></div><div style='background:#080808;border-radius:7px;padding:8px;text-align:center'><div style='font-size:7px;color:#445'>R:R Ratio</div><div style='color:"+col+";font-weight:900;font-size:18px'>1:"+rr+"</div></div></div><div style='font-size:8px;color:#778;line-height:1.5'>"+((rr>=2)?"✅ Good RR (≥1:2) — Risk worth taking per textbook rules":"⚠️ Low RR — Textbook recommends minimum 1:2 ratio")+"<br>Educational only. Not trading advice.</div></div>";
              }} style={{width:"100%",background:"linear-gradient(135deg,#39FF14,#00b377)",border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Calculate R:R ⚡</button>
              <div id="rr-result"></div>
            </div>

            {/* Position Size Calculator */}
            <div style={{background:"#0d0d0d",border:"1px solid #60a5fa33",borderRadius:13,padding:"12px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800,color:"#60a5fa",marginBottom:8}}>📊 Position Size Calculator</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                {[["ps-capital","Total Capital (Rs)","100000"],["ps-risk","Risk per Trade %","1"],["ps-entry","Entry Price (Rs)","450"],["ps-sl","Stop Loss (Rs)","430"]].map(function(f){return(
                  <div key={f[0]} style={{background:"#080808",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px"}}>
                    <div style={{fontSize:7,color:"#556",marginBottom:3}}>{f[1]}</div>
                    <input id={f[0]} defaultValue={f[2]} type="number" style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                );})}
              </div>
              <button onClick={function(){
                var cap=parseFloat(document.getElementById("ps-capital").value)||100000;
                var riskPct=parseFloat(document.getElementById("ps-risk").value)||1;
                var entry=parseFloat(document.getElementById("ps-entry").value)||450;
                var sl=parseFloat(document.getElementById("ps-sl").value)||430;
                var riskAmt=(cap*riskPct)/100;
                var slPts=Math.abs(entry-sl);
                var qty=slPts>0?Math.floor(riskAmt/slPts):0;
                var totalInv=qty*entry;
                var capPct=((totalInv/cap)*100).toFixed(1);
                document.getElementById("ps-result").innerHTML="<div style='background:#0a0a1a;border:1px solid #60a5fa33;border-radius:10px;padding:10px;margin-top:8px'><div style='display:grid;grid-template-columns:1fr 1fr;gap:7px'><div style='background:#080808;border-radius:7px;padding:8px;text-align:center'><div style='font-size:7px;color:#445'>Quantity</div><div style='color:#60a5fa;font-weight:900;font-size:22px'>"+qty+"</div><div style='font-size:7px;color:#556'>shares</div></div><div style='background:#080808;border-radius:7px;padding:8px;text-align:center'><div style='font-size:7px;color:#445'>Investment</div><div style='color:#fff;font-weight:800;font-size:14px'>Rs."+totalInv.toLocaleString()+"</div><div style='font-size:7px;color:#556'>"+capPct+"% of capital</div></div><div style='background:#080808;border-radius:7px;padding:8px;text-align:center'><div style='font-size:7px;color:#445'>Max Risk</div><div style='color:#ff4444;font-weight:800;font-size:14px'>Rs."+riskAmt.toLocaleString()+"</div><div style='font-size:7px;color:#556'>"+riskPct+"% of capital</div></div><div style='background:#080808;border-radius:7px;padding:8px;text-align:center'><div style='font-size:7px;color:#445'>SL Points</div><div style='color:#f59e0b;font-weight:800;font-size:14px'>"+slPts+"</div><div style='font-size:7px;color:#556'>per share</div></div></div><div style='margin-top:7px;font-size:7px;color:#667;line-height:1.5;padding:6px;background:#080808;border-radius:7px'>Educational only. Position sizing is a risk management concept. Not trading advice.</div></div>";
              }} style={{width:"100%",background:"linear-gradient(135deg,#60a5fa,#2563eb)",border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Calculate Position Size ⚡</button>
              <div id="ps-result"></div>
            </div>

            {/* Brokerage Calculator */}
            <div style={{background:"#0d0d0d",border:"1px solid #f59e0b33",borderRadius:13,padding:"12px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800,color:"#f59e0b",marginBottom:8}}>💸 Brokerage Calculator</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                {[["br-buy","Buy Price (Rs)","450"],["br-qty","Quantity","100"],["br-sell","Sell Price (Rs)","470"],["br-seg","Segment","Intraday"]].map(function(f){return(
                  <div key={f[0]} style={{background:"#080808",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px"}}>
                    <div style={{fontSize:7,color:"#556",marginBottom:3}}>{f[1]}</div>
                    <input id={f[0]} defaultValue={f[2]} style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                );})}
              </div>
              <button onClick={function(){
                var bp=parseFloat(document.getElementById("br-buy").value)||450;
                var sp=parseFloat(document.getElementById("br-sell").value)||470;
                var qty=parseInt(document.getElementById("br-qty").value)||100;
                var seg=(document.getElementById("br-seg").value||"").toLowerCase();
                var intra=seg.includes("intra");
                var buyTurnover=bp*qty;var sellTurnover=sp*qty;var turnover=buyTurnover+sellTurnover;
                var brokerage=Math.min(intra?20:40,turnover*0.0003);var brokerage2=brokerage;
                var stt=intra?(sellTurnover*0.00025):(sellTurnover*0.001);
                var txn=turnover*0.0000297;
                var sebi=turnover*0.000001;
                var stamp=buyTurnover*(intra?0.00003:0.00015);
                var gst=(brokerage+txn)*0.18;
                var total=brokerage+brokerage2+stt+txn+sebi+stamp+gst;
                var pnl=(sp-bp)*qty;var netPnl=pnl-total;
                document.getElementById("br-result").innerHTML="<div style='background:#1a1000;border:1px solid #f59e0b33;border-radius:10px;padding:10px;margin-top:8px'><div style='font-size:9px;color:#f59e0b;font-weight:800;margin-bottom:7px'>Zerodha-style Brokerage Breakdown</div><div style='font-size:8px;display:grid;gap:4px'><div style='display:flex;justify-content:space-between;color:#aaa'><span>Brokerage</span><span>Rs."+total.toFixed(2)+"</span></div><div style='display:flex;justify-content:space-between;color:#aaa'><span>STT</span><span>Rs."+stt.toFixed(2)+"</span></div><div style='display:flex;justify-content:space-between;color:#aaa'><span>Txn Charges</span><span>Rs."+txn.toFixed(2)+"</span></div><div style='display:flex;justify-content:space-between;color:#aaa'><span>GST (18%)</span><span>Rs."+gst.toFixed(2)+"</span></div><div style='display:flex;justify-content:space-between;color:#aaa'><span>Stamp + SEBI</span><span>Rs."+(stamp+sebi).toFixed(2)+"</span></div><div style='height:1px;background:#1a1a1a;margin:4px 0'></div><div style='display:flex;justify-content:space-between;font-weight:800'><span style='color:#f59e0b'>Total Charges</span><span style='color:#ff4444'>Rs."+total.toFixed(2)+"</span></div><div style='display:flex;justify-content:space-between;font-weight:800;margin-top:4px'><span style='color:#f59e0b'>Gross P&L</span><span style='color:"+(pnl>=0?"#39FF14":"#ff4444")+"'>Rs."+pnl.toFixed(2)+"</span></div><div style='display:flex;justify-content:space-between;font-weight:800;margin-top:2px'><span style='color:#f59e0b'>Net P&L</span><span style='color:"+(netPnl>=0?"#39FF14":"#ff4444")+"'>Rs."+netPnl.toFixed(2)+"</span></div></div><div style='margin-top:7px;font-size:7px;color:#667'>Approximate. Actual charges may vary. Educational only.</div></div>";
              }} style={{width:"100%",background:"linear-gradient(135deg,#f59e0b,#b45309)",border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Calculate Brokerage ⚡</button>
              <div id="br-result"></div>
            </div>

            {/* ── AI TOOLS ── */}
            <div style={{fontSize:10,fontWeight:800,color:"#39FF14",marginBottom:8,letterSpacing:0.5,marginTop:4}}>🤖 AI ANALYSIS TOOLS</div>

            {/* AI Market Summary */}
            <div style={{background:"#0d0d0d",border:"1px solid #39FF1433",borderRadius:13,padding:"12px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800,color:"#39FF14",marginBottom:4}}>⚡ Market in 30 Seconds</div>
              <div style={{fontSize:8,color:"#556",marginBottom:10}}>AI explains today's market in simple words</div>
              <div style={{display:"flex",gap:5,marginBottom:8}}>
                {[["en","EN"],["hi","हि"],["te","తె"]].map(function(kl){return(
                  <button key={kl[0]} onClick={function(){setAiLang(kl[0]);}} style={{background:aiLang===kl[0]?"#39FF1420":"#080808",border:"1px solid "+(aiLang===kl[0]?"#39FF14":"#1a1a1a"),borderRadius:8,padding:"4px 10px",color:aiLang===kl[0]?"#39FF14":"#445",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{kl[1]}</button>
                );})}
              </div>
              {[
                {label:"📊 Market Summary",prompt:"Give me a 30-second market summary for today's Indian stock market (NIFTY, SENSEX, sector performance). Be concise. Educational only."},
                {label:"🎯 Sector Analysis",prompt:"Analyze today's top performing and underperforming sectors in Indian stock market. Educational perspective."},
                {label:"📰 News Impact",prompt:"How does today's economic news typically impact Indian stock markets? Educational explanation."},
                {label:"⚠️ Risk Analysis",prompt:"What are the current key risks for Indian equity markets? Educational risk education."},
              ].map(function(item){return(
                <button key={item.label} onClick={function(){runToolAI(item.prompt);}} disabled={toolAiLoading} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"#080808",border:"1px solid #1a2a1a",borderRadius:9,padding:"10px 12px",cursor:toolAiLoading?"not-allowed":"pointer",marginBottom:6,fontFamily:"inherit"}}>
                  <span style={{fontSize:10,color:"#fff",fontWeight:600}}>{item.label}</span>
                  <span style={{fontSize:9,color:"#39FF14"}}>{toolAiLoading?"🔄":"→"}</span>
                </button>
              );})}
              {toolAiResult&&(
                <div style={{background:"#050d05",border:"1px solid #39FF1422",borderRadius:10,padding:"11px",marginTop:6}}>
                  <div style={{fontSize:9,color:"#39FF14",fontWeight:700,marginBottom:6}}>🤖 AI Response</div>
                  <div style={{fontSize:10,color:"#ccc",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{toolAiResult}</div>
                  <div style={{fontSize:7,color:"#445",marginTop:6}}>Educational only. Not investment advice.</div>
                </div>
              )}
            </div>

            <div style={{background:"#080400",border:"1px solid #ff440018",borderRadius:9,padding:"8px",fontSize:7,color:"#885522",lineHeight:1.6,textAlign:"center"}}>
              ⚠️ All tools are for EDUCATIONAL PURPOSES ONLY. Not investment advice. SEBI disclaimer applies.
            </div>
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
              var stars="";for(var i=0;i<f.rating;i++){stars+="\u2605";}for(var j=f.rating;j<5;j++){stars+="\u2606";}
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
                      <div style={{fontSize:7,color:"#445",marginBottom:1}}>FII F&#38;O</div>
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
                {t:"FII F\u0026O Long",d:"Hedge funds bullish. Watch for upside.",c:"#39FF14"},
                {t:"FII F\u0026O Short",d:"Hedge funds bearish. Risk of correction.",c:"#ff4444"},
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
            <div style={{padding:"14px 12px 4px 12px"}}>
              <div style={{background:"linear-gradient(135deg,#3a2a0a,#4a3a00)",border:"1px solid #ffaa4444",borderRadius:13,padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:22}}>&#128181;</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:"#ffcc88"}}>SIP &amp; Mutual Funds</div>
                    <div style={{fontSize:8,color:"#666"}}>Wealth building made simple</div>
                  </div>
                </div>
                <div style={{background:"#1a1500",border:"1px solid #ffaa4422",borderRadius:9,padding:"10px",marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#FFD700",marginBottom:5}}>What is SIP?</div>
                  <div style={{fontSize:9,color:"#ccc",lineHeight:1.5,marginBottom:6}}>SIP (Systematic Investment Plan) means investing fixed amount monthly in mutual funds. Start with Rs.500/month!</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
                    <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:8,color:"#666"}}>Rs.5,000/month</div>
                      <div style={{fontSize:11,fontWeight:800,color:"#39FF14"}}>Rs.1.16 Cr</div>
                      <div style={{fontSize:7,color:"#888"}}>in 30 years @12%</div>
                    </div>
                    <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:8,color:"#666"}}>Rs.10,000/month</div>
                      <div style={{fontSize:11,fontWeight:800,color:"#39FF14"}}>Rs.2.32 Cr</div>
                      <div style={{fontSize:7,color:"#888"}}>in 30 years @12%</div>
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <a href="https://groww.in/mutual-funds/category/best-large-cap-mutual-funds" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128202;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Large Cap Funds</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Top 100 stocks</div>
                  </a>
                  <a href="https://groww.in/mutual-funds/category/best-mid-cap-mutual-funds" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128200;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Mid Cap Funds</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Higher growth</div>
                  </a>
                  <a href="https://groww.in/mutual-funds/category/best-small-cap-mutual-funds" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#127919;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Small Cap Funds</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>High risk-reward</div>
                  </a>
                  <a href="https://groww.in/mutual-funds/category/best-elss-mutual-funds" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128218;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>ELSS (Tax Save)</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>80C benefit</div>
                  </a>
                </div>
                <div style={{background:"#1a1500",border:"1px solid #ffaa4422",borderRadius:9,padding:"10px",marginTop:8}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#FFD700",marginBottom:5}}>Top MF Platforms (Free)</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                    <a href="https://groww.in" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:7,padding:"7px 5px",textDecoration:"none",textAlign:"center"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#39FF14"}}>Groww</div>
                      <div style={{fontSize:7,color:"#666"}}>1Cr+ users</div>
                    </a>
                    <a href="https://coin.zerodha.com" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:7,padding:"7px 5px",textDecoration:"none",textAlign:"center"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#39FF14"}}>Coin</div>
                      <div style={{fontSize:7,color:"#666"}}>Zerodha MF</div>
                    </a>
                    <a href="https://kuvera.in" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:7,padding:"7px 5px",textDecoration:"none",textAlign:"center"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#39FF14"}}>Kuvera</div>
                      <div style={{fontSize:7,color:"#666"}}>Direct MF</div>
                    </a>
                  </div>
                </div>
                <div style={{background:"#1a1500",border:"1px solid #ffaa4422",borderRadius:9,padding:"10px",marginTop:8}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#FFD700",marginBottom:5}}>SIP Tips</div>
                  <div style={{fontSize:9,color:"#ccc",lineHeight:1.6}}>
                    &#9989; Start early - Power of compounding<br/>
                    &#9989; Stay invested 10+ years<br/>
                    &#9989; Choose Direct plans (lower fees)<br/>
                    &#9989; Diversify 3-4 funds<br/>
                    &#9989; Increase SIP yearly (Step-up SIP)<br/>
                    &#9989; Don't stop in market crash
                  </div>
                </div>
                <a href="https://groww.in/calculators/sip-calculator" target="_blank" rel="noopener" style={{display:"block",background:"linear-gradient(135deg,#FFD700,#cc9900)",color:"#000",border:"none",borderRadius:9,padding:"10px",textDecoration:"none",textAlign:"center",marginTop:8,fontSize:11,fontWeight:800}}>
                  Free SIP Calculator &#9656;
                </a>
              </div>
            </div>

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
                  <a href="https://zerodha.com/varsity/module/introduction-to-stock-markets/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128218;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>What is Stock Market</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Zerodha Varsity</div>
                  </a>
                  <a href="https://zerodha.com/varsity/module/technical-analysis/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128200;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Technical Analysis</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Zerodha Varsity</div>
                  </a>
                  <a href="https://zerodha.com/varsity/module/fundamental-analysis/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128181;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Fundamental Analysis</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Zerodha Varsity</div>
                  </a>
                  <a href="https://zerodha.com/varsity/module/trading-systems/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#9889;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Trading Systems</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Zerodha Varsity</div>
                  </a>
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
                  <a href="https://zerodha.com/varsity/chapter/candlesticks/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128250;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Candlesticks</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Patterns & signals</div>
                  </a>
                  <a href="https://zerodha.com/varsity/chapter/support-resistance/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128205;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Support & Resistance</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Key levels</div>
                  </a>
                  <a href="https://zerodha.com/varsity/chapter/moving-averages/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128288;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Moving Averages</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Trend following</div>
                  </a>
                  <a href="https://zerodha.com/varsity/chapter/indicators/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128270;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>RSI & MACD</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Momentum indicators</div>
                  </a>
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
                  <a href="https://zerodha.com/varsity/module/option-theory/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128196;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Options Theory</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>CE & PE basics</div>
                  </a>
                  <a href="https://zerodha.com/varsity/module/option-strategies/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#9854;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Option Strategies</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Straddle, Strangle</div>
                  </a>
                  <a href="https://zerodha.com/varsity/chapter/open-interest/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#128081;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Open Interest</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>OI analysis</div>
                  </a>
                  <a href="https://zerodha.com/varsity/chapter/greeks/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px 8px",textDecoration:"none",display:"block"}}>
                    <div style={{fontSize:14,marginBottom:3}}>&#945;</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Option Greeks</div>
                    <div style={{fontSize:7,color:"#666",marginTop:2}}>Delta, Theta, Vega</div>
                  </a>
                </div>
              </div>

              <div style={{background:"linear-gradient(135deg,#3a2a0a,#4a3a00)",border:"1px solid #ffaa4444",borderRadius:12,padding:"11px",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:800,color:"#ffcc88",marginBottom:7}}>&#127909; YouTube Channels</div>
                {[["PR Sundar","Options","https://www.youtube.com/results?search_query=PR+Sundar+options"],["Neeraj Joshi","Beginners","https://www.youtube.com/results?search_query=Neeraj+Joshi+stock+market"],["CA Rachana","Investing","https://www.youtube.com/results?search_query=CA+Rachana+investing"],["Vivek Bajaj","Trading","https://www.youtube.com/results?search_query=Vivek+Bajaj+trading"]].map(function(ch){return(<a key={ch[0]} href={ch[2]} target="_blank" rel="noopener" style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:8,padding:"8px 10px",textDecoration:"none",marginBottom:5}}><div><div style={{fontSize:9,fontWeight:700,color:"#fff"}}>{ch[0]}</div><div style={{fontSize:7,color:"#666"}}>{ch[1]}</div></div><span style={{fontSize:9,color:"#ff4444"}}>&#9654; YouTube</span></a>);})}
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
                  <a href="https://zerodha.com/varsity/" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px",textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:10,fontWeight:700,color:"#fff"}}>Zerodha Varsity</div><div style={{fontSize:7,color:"#666"}}>Free stock market education</div></div>
                    <span style={{fontSize:9,color:"#39FF14"}}>Free &#9656;</span>
                  </a>
                  <a href="https://www.nseindia.com/education" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px",textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:10,fontWeight:700,color:"#fff"}}>NSE Education</div><div style={{fontSize:7,color:"#666"}}>Official NSE learning portal</div></div>
                    <span style={{fontSize:9,color:"#39FF14"}}>Free &#9656;</span>
                  </a>
                  <a href="https://www.bseindia.com/education" target="_blank" rel="noopener" style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:9,padding:"10px",textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:10,fontWeight:700,color:"#fff"}}>BSE Institute</div><div style={{fontSize:7,color:"#666"}}>BSE official courses</div></div>
                    <span style={{fontSize:9,color:"#39FF14"}}>Free &#9656;</span>
                  </a>
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

        {tab==="scanner"&&(
          <div style={{paddingBottom:8}}>

            {/* ── HEADER ── */}
            <div style={{padding:"10px 9px 6px",borderBottom:"1px solid #0d0d0d"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div>
                  <div style={{fontSize:14,fontWeight:900,color:"#39FF14"}}>📡 Live Scanner</div>
                  <div style={{fontSize:7,color:"#556"}}>Real-time pattern detection · Educational only</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {notifPerm!=="granted"&&<button onClick={function(){requestNotifPerm();}} style={{background:"#1a0a00",border:"1px solid #f59e0b44",borderRadius:8,padding:"4px 8px",color:"#f59e0b",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>🔔 Enable Alerts</button>}
                  {notifPerm==="granted"&&<div style={{background:"#0a1a0a",border:"1px solid #39FF1444",borderRadius:8,padding:"3px 7px",fontSize:7,color:"#39FF14",fontWeight:700}}>🔔 ON</div>}
                  <button onClick={function(){runScan();}} style={{background:"linear-gradient(135deg,#39FF14,#00b377)",border:"none",borderRadius:9,padding:"5px 10px",color:"#000",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{scanRefreshing?"🔄":"📡"} Scan</button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:2}}>
                {[["breakout","⚡ Breakout"],["breakdown","⬇ Breakdown"],["volume","📊 Volume"],["candles","🕯 Candles"],["alerts","🔔 Alerts"]].map(function(item){return(<button key={item[0]} onClick={function(){setScanSub(item[0]);}} style={{background:scanSub===item[0]?"linear-gradient(135deg,#1a2a1a,#0a1a0a)":"#0a0a0a",border:"1.5px solid "+(scanSub===item[0]?"#39FF14":"#111"),borderRadius:12,padding:"5px 10px",color:scanSub===item[0]?"#39FF14":"#445",fontSize:9,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{item[1]}</button>);})}
              </div>

              {/* Timeframe bar */}
              <div style={{display:"flex",gap:3,marginTop:6,overflowX:"auto",paddingBottom:2}}>
                {["1m","3m","5m","15m","30m","1h","4h","Daily","Weekly","Monthly"].map(function(tf){return(<button key={tf} onClick={function(){setScanTF(tf);}} style={{background:scanTF===tf?"#39FF1420":"#080808",border:"1px solid "+(scanTF===tf?"#39FF1444":"#0d0d0d"),borderRadius:7,padding:"3px 7px",color:scanTF===tf?"#39FF14":"#334",fontSize:8,fontWeight:scanTF===tf?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{tf}</button>);})}
              </div>
            </div>

            {/* ── BREAKOUT TAB ── */}
            {scanSub==="breakout"&&(
              <div style={{padding:"8px 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#39FF14"}}>⚡ Breakout Stocks · {scanTF}</div>
                  <div style={{fontSize:7,color:"#39FF14",background:"#39FF1415",borderRadius:6,padding:"2px 7px",border:"1px solid #39FF1422"}}>{liveBreakouts.length} Detected</div>
                </div>
                {liveBreakouts.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#334",fontSize:10}}>📡 Scanning... No breakouts detected right now</div>}
                {liveBreakouts.map(function(st,i){return(
                  <div key={st.sym+i} style={{background:"#0a0d0a",border:"1px solid #39FF1433",borderLeft:"3px solid #39FF14",borderRadius:12,padding:"11px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>{st.sym}</span>
                          {st.gapUp&&<span style={{background:"#39FF1420",border:"1px solid #39FF1444",borderRadius:4,padding:"1px 5px",fontSize:7,color:"#39FF14",fontWeight:700}}>GAP UP</span>}
                          <span style={{background:"#1a2a1a",borderRadius:4,padding:"1px 5px",fontSize:7,color:"#39FF14"}}>{st.timeframe}</span>
                        </div>
                        <div style={{fontSize:8,color:"#556"}}>{st.sector} · {st.pattern}</div>
                        <div style={{fontSize:8,color:"#aaa",marginTop:2}}>{st.candle} · Structure: {st.structure}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"monospace",fontSize:14,fontWeight:900,color:"#fff"}}>Rs{st.ltp.toFixed(2)}</div>
                        <div style={{fontSize:11,fontWeight:700,color:"#39FF14"}}>+{st.chg.toFixed(2)}%</div>
                        <div style={{fontSize:7,color:"#556",marginTop:2}}>Res: Rs{st.res}</div>
                      </div>
                    </div>
                    {/* Strength bar */}
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                      <div style={{fontSize:7,color:"#445",flexShrink:0}}>Strength</div>
                      <div style={{flex:1,height:4,background:"#111",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:st.strength+"%",background:"linear-gradient(90deg,#39FF14,#00ff88)",borderRadius:3,transition:"width 0.5s ease"}}></div>
                      </div>
                      <div style={{fontSize:9,fontWeight:800,color:st.strength>=80?"#39FF14":st.strength>=65?"#f59e0b":"#888",flexShrink:0}}>{st.strength}/100</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:7}}>
                      {[["Vol Surge",st.volSurge,"#60a5fa"],["Delivery",st.delivery,"#a78bfa"],["Type",st.type,"#39FF14"]].map(function(item){return(<div key={item[0]} style={{background:"#080808",borderRadius:7,padding:"5px",textAlign:"center"}}><div style={{fontSize:6,color:"#445"}}>{item[0]}</div><div style={{fontSize:8,fontWeight:700,color:item[2]}}>{item[1]}</div></div>);})}
                    </div>
                    <div style={{background:"#050d05",border:"1px solid #39FF1415",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#39FF14",fontWeight:700,marginBottom:2}}>📚 Educational Note</div>
                      <div style={{fontSize:8,color:"#778",lineHeight:1.5}}>{st.eduNote}</div>
                    </div>
                  </div>
                );})}
                <div style={{background:"#080400",border:"1px solid #ff440018",borderRadius:9,padding:"7px",fontSize:7,color:"#885522",lineHeight:1.6,textAlign:"center"}}>⚠️ Educational pattern detection only. Not buy/sell advice. SEBI disclaimer applies.</div>
              </div>
            )}

            {/* ── BREAKDOWN TAB ── */}
            {scanSub==="breakdown"&&(
              <div style={{padding:"8px 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#ff4444"}}>⬇ Breakdown Stocks · {scanTF}</div>
                  <div style={{fontSize:7,color:"#ff4444",background:"#ff444415",borderRadius:6,padding:"2px 7px",border:"1px solid #ff444422"}}>{liveBreakdowns.length} Detected</div>
                </div>
                {liveBreakdowns.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#334",fontSize:10}}>📡 Scanning... No breakdowns detected right now</div>}
                {liveBreakdowns.map(function(st,i){return(
                  <div key={st.sym+i} style={{background:"#0d0a0a",border:"1px solid #ff444433",borderLeft:"3px solid #ff4444",borderRadius:12,padding:"11px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>{st.sym}</span>
                          {st.gapDown&&<span style={{background:"#ff444420",border:"1px solid #ff444444",borderRadius:4,padding:"1px 5px",fontSize:7,color:"#ff4444",fontWeight:700}}>GAP DOWN</span>}
                          <span style={{background:"#1a0a0a",borderRadius:4,padding:"1px 5px",fontSize:7,color:"#ff4444"}}>{st.timeframe}</span>
                        </div>
                        <div style={{fontSize:8,color:"#556"}}>{st.sector} · {st.pattern}</div>
                        <div style={{fontSize:8,color:"#aaa",marginTop:2}}>{st.candle} · Structure: {st.structure}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"monospace",fontSize:14,fontWeight:900,color:"#fff"}}>Rs{st.ltp.toFixed(2)}</div>
                        <div style={{fontSize:11,fontWeight:700,color:"#ff4444"}}>{st.chg.toFixed(2)}%</div>
                        <div style={{fontSize:7,color:"#556",marginTop:2}}>Sup: Rs{st.sup}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                      <div style={{fontSize:7,color:"#445",flexShrink:0}}>Weakness</div>
                      <div style={{flex:1,height:4,background:"#111",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:st.strength+"%",background:"linear-gradient(90deg,#ff8888,#ff4444)",borderRadius:3}}></div>
                      </div>
                      <div style={{fontSize:9,fontWeight:800,color:"#ff4444",flexShrink:0}}>{st.strength}/100</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:7}}>
                      {[["Vol Surge",st.volSurge,"#60a5fa"],["Delivery",st.delivery,"#a78bfa"],["Type",st.type,"#ff4444"]].map(function(item){return(<div key={item[0]} style={{background:"#080808",borderRadius:7,padding:"5px",textAlign:"center"}}><div style={{fontSize:6,color:"#445"}}>{item[0]}</div><div style={{fontSize:8,fontWeight:700,color:item[2]}}>{item[1]}</div></div>);})}
                    </div>
                    <div style={{background:"#0d0505",border:"1px solid #ff444415",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#ff4444",fontWeight:700,marginBottom:2}}>📚 Educational Note</div>
                      <div style={{fontSize:8,color:"#778",lineHeight:1.5}}>{st.eduNote}</div>
                    </div>
                  </div>
                );})}
                <div style={{background:"#080400",border:"1px solid #ff440018",borderRadius:9,padding:"7px",fontSize:7,color:"#885522",lineHeight:1.6,textAlign:"center"}}>⚠️ Educational pattern detection only. Not sell advice. SEBI disclaimer applies.</div>
              </div>
            )}

            {/* ── VOLUME TAB ── */}
            {scanSub==="volume"&&(
              <div style={{padding:"8px 9px"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#60a5fa",marginBottom:8}}>📊 Volume Intelligence · {scanTF}</div>
                {liveVolume.map(function(st,i){return(
                  <div key={st.sym+i} style={{background:"#0a0a0d",border:"1px solid #60a5fa22",borderLeft:"3px solid #60a5fa",borderRadius:12,padding:"11px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:900,color:"#fff",marginBottom:2}}>{st.sym}</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          <span style={{background:"#60a5fa20",border:"1px solid #60a5fa33",borderRadius:5,padding:"1px 5px",fontSize:7,color:"#60a5fa",fontWeight:700}}>{st.volType}</span>
                          {st.volSpike&&<span style={{background:"#FFD70020",border:"1px solid #FFD70033",borderRadius:5,padding:"1px 5px",fontSize:7,color:"#FFD700",fontWeight:700}}>SPIKE ⚡</span>}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"monospace",fontSize:14,fontWeight:900,color:"#fff"}}>Rs{st.ltp.toFixed(2)}</div>
                        <div style={{fontSize:10,fontWeight:700,color:st.chg>=0?"#39FF14":"#ff4444"}}>{st.chg>=0?"+":""}{st.chg.toFixed(2)}%</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:7}}>
                      {[["Volume",st.vol,"#60a5fa"],["Rel Vol",st.relVol,"#FFD700"],["Delivery",st.delivPct,"#a78bfa"]].map(function(item){return(<div key={item[0]} style={{background:"#080808",borderRadius:7,padding:"7px",textAlign:"center"}}><div style={{fontSize:6,color:"#445"}}>{item[0]}</div><div style={{fontSize:11,fontWeight:800,color:item[2]}}>{item[1]}</div></div>);})}
                    </div>
                    {/* Volume bar visual */}
                    <div style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#445",marginBottom:3}}><span>Volume vs Avg</span><span style={{color:"#FFD700"}}>{st.relVol}</span></div>
                      <div style={{height:5,background:"#111",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:Math.min(100,parseFloat(st.relVol)*33)+"%",background:"linear-gradient(90deg,#60a5fa,#FFD700)",borderRadius:3}}></div>
                      </div>
                    </div>
                    <div style={{background:"#0a0a14",border:"1px solid #60a5fa15",borderRadius:7,padding:"7px"}}>
                      <div style={{fontSize:7,color:"#60a5fa",fontWeight:700,marginBottom:2}}>📚 Volume Education</div>
                      <div style={{fontSize:8,color:"#778",lineHeight:1.5}}>Relative volume {st.relVol} = {st.relVol} above 20-day avg. High delivery ({st.delivPct}) indicates strong institutional interest. Volume is the fuel of price movement — study for educational purposes.</div>
                    </div>
                  </div>
                );})}
              </div>
            )}

            {/* ── CANDLESTICK PATTERNS TAB ── */}
            {scanSub==="candles"&&(
              <div style={{padding:"8px 9px"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#f59e0b",marginBottom:8}}>🕯 Pattern Recognition · {scanTF}</div>
                {liveCandlePatterns.map(function(p,i){
                  var bc=p.signal==="Bullish"?"#39FF14":p.signal==="Bearish"?"#ff4444":"#f59e0b";
                  return(
                    <div key={p.sym+i} style={{background:"#0d0d0d",border:"1px solid "+bc+"22",borderLeft:"3px solid "+bc,borderRadius:12,padding:"11px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>{p.sym}</span>
                            <span style={{background:bc+"18",border:"1px solid "+bc+"33",borderRadius:5,padding:"1px 6px",fontSize:7,color:bc,fontWeight:800}}>{p.signal}</span>
                            <span style={{fontSize:7,color:"#445"}}>{p.timeframe}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:18}}>{p.emoji}</span>
                            <span style={{fontSize:10,fontWeight:700,color:bc}}>{p.pattern}</span>
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"monospace",fontSize:13,fontWeight:900,color:"#fff"}}>Rs{p.ltp.toFixed(2)}</div>
                          <div style={{fontSize:10,fontWeight:700,color:p.chg>=0?"#39FF14":"#ff4444"}}>{p.chg>=0?"+":""}{p.chg.toFixed(2)}%</div>
                          <div style={{fontSize:7,color:p.strength==="Strong"?"#39FF14":p.strength==="Moderate"?"#f59e0b":"#888",marginTop:2,fontWeight:700}}>{p.strength}</div>
                        </div>
                      </div>
                      <div style={{background:"#080808",borderRadius:8,padding:"8px",marginBottom:6}}>
                        <div style={{fontSize:8,color:"#aaa",lineHeight:1.6}}>{p.desc}</div>
                      </div>
                      {/* Telugu explanation */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                        <div style={{background:"#0a0a14",border:"1px solid #60a5fa15",borderRadius:7,padding:"6px"}}>
                          <div style={{fontSize:6,color:"#60a5fa",fontWeight:700,marginBottom:2}}>తెలుగు</div>
                          <div style={{fontSize:7,color:"#667",lineHeight:1.5}}>{p.te}</div>
                        </div>
                        <div style={{background:"#0a140a",border:"1px solid #a78bfa15",borderRadius:7,padding:"6px"}}>
                          <div style={{fontSize:6,color:"#a78bfa",fontWeight:700,marginBottom:2}}>हिंदी</div>
                          <div style={{fontSize:7,color:"#667",lineHeight:1.5}}>{p.hi}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── ALERTS HISTORY TAB ── */}
            {scanSub==="alerts"&&(
              <div style={{padding:"8px 9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#fff"}}>🔔 Alert History</div>
                  {scanAlerts.length>0&&<button onClick={function(){setScanAlerts([]);}} style={{background:"#111",border:"1px solid #333",borderRadius:7,padding:"3px 8px",color:"#667",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>}
                </div>
                {notifPerm!=="granted"&&(
                  <div style={{background:"linear-gradient(135deg,#1a0d00,#2a1a00)",border:"1px solid #f59e0b44",borderRadius:12,padding:"14px",marginBottom:10,textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:6}}>🔔</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#FFD700",marginBottom:4}}>Enable Push Notifications</div>
                    <div style={{fontSize:9,color:"#667",marginBottom:10,lineHeight:1.5}}>Breakout & Breakdown alerts will appear as phone notifications — even when app is closed!</div>
                    <button onClick={function(){requestNotifPerm();}} style={{background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",borderRadius:10,padding:"10px 24px",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>🔔 Allow Notifications</button>
                  </div>
                )}
                {notifPerm==="granted"&&(
                  <div style={{background:"#0a1a0a",border:"1px solid #39FF1433",borderRadius:10,padding:"9px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"#39FF14",boxShadow:"0 0 8px #39FF14",animation:"bpPulse 2s infinite",flexShrink:0}}></div>
                    <div style={{fontSize:9,color:"#39FF14",fontWeight:700}}>Push notifications active! You will be alerted for breakouts.</div>
                  </div>
                )}
                {scanAlerts.length===0?(
                  <div style={{textAlign:"center",padding:"40px 20px"}}>
                    <div style={{fontSize:40,marginBottom:10}}>📭</div>
                    <div style={{fontSize:11,color:"#445",fontWeight:600,marginBottom:4}}>No alerts yet</div>
                    <div style={{fontSize:9,color:"#334",lineHeight:1.6}}>Tap "📡 Scan" to start scanning. Breakout & Breakdown alerts will appear here.</div>
                  </div>
                ):(
                  <div>
                    {scanAlerts.map(function(a,i){
                      var bc=a.type==="BREAKOUT"?"#39FF14":a.type==="BREAKDOWN"?"#ff4444":a.type==="VOLUME"?"#60a5fa":"#f59e0b";
                      return(
                        <div key={i} style={{background:"#0d0d0d",border:"1px solid "+bc+"22",borderLeft:"3px solid "+bc,borderRadius:11,padding:"10px",marginBottom:6}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{fontSize:13}}>{a.icon}</span>
                              <span style={{fontSize:9,fontWeight:800,color:bc}}>{a.type}</span>
                              <span style={{fontSize:11,fontWeight:800,color:"#fff"}}>{a.sym}</span>
                            </div>
                            <span style={{fontSize:7,color:"#334"}}>{a.time}</span>
                          </div>
                          <div style={{fontSize:9,color:"#aaa",marginBottom:3}}>{a.msg}</div>
                          <div style={{display:"flex",gap:6}}>
                            <span style={{fontSize:7,color:"#556"}}>{a.timeframe}</span>
                            <span style={{fontSize:7,color:bc,fontWeight:700}}>Strength: {a.strength}/100</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{background:"#080400",border:"1px solid #ff440018",borderRadius:9,padding:"7px",marginTop:6,fontSize:7,color:"#885522",lineHeight:1.6,textAlign:"center"}}>⚠️ All alerts are for EDUCATIONAL PURPOSES ONLY. Not investment advice.</div>
              </div>
            )}

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
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="BREAKOUT PRO - BREAKOUT ALERT\n\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+"\n"+shareStock.type+"\n"+(shareStock.zone?shareStock.zone+"\n":"")+(shareStock.target?"Target: Rs."+shareStock.target+"\n":"")+(shareStock.sl?"SL: Rs."+shareStock.sl+"\n":"")+"\nFull analysis subscribe:\n"+appLink+"\n\nEducational only. Not investment advice.";window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"WhatsApp"}].concat(p);});}} style={{background:"linear-gradient(135deg,#25D366,#128C7E)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>WhatsApp</button>
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="BREAKOUT PRO BREAKOUT ALERT\n\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+"\n"+shareStock.type+"\n"+(shareStock.target?"Target Rs."+shareStock.target+" ":"")+(shareStock.sl?"SL Rs."+shareStock.sl:"")+"\n\n"+appLink+"\n#breakoutpro #breakout";if(navigator.clipboard){navigator.clipboard.writeText(msg).then(function(){alert("Copied for Instagram!");});}setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"Instagram"}].concat(p);});}} style={{background:"linear-gradient(135deg,#f09433,#dc2743,#cc2366)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Instagram</button>
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="BREAKOUT PRO Alert\n\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+"\n"+shareStock.type+"\n"+(shareStock.target?"T:Rs."+shareStock.target+" ":"")+(shareStock.sl?"SL:Rs."+shareStock.sl:"")+"\n\n"+appLink+"\nEducational only.";window.open("https://t.me/share/url?url="+encodeURIComponent(appLink)+"&text="+encodeURIComponent(msg),"_blank");setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"Telegram"}].concat(p);});}} style={{background:"linear-gradient(135deg,#0088cc,#005fa3)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Telegram</button>
                <button onClick={function(){if(!shareStock.sym||!shareStock.ltp){alert("Fill Stock and Price!");return;}var msg="BREAKOUT PRO Alert\n"+shareStock.sym+" Rs."+shareStock.ltp+" "+shareStock.chg+" "+shareStock.type+"\n"+(shareStock.target?"T:"+shareStock.target+" ":"")+(shareStock.sl?"SL:"+shareStock.sl:"")+"\n"+appLink+"\n#breakoutpro #breakout #nifty";if(navigator.clipboard){navigator.clipboard.writeText(msg).then(function(){alert("Copied!");});}setAlertsSent(function(p){return [{sym:shareStock.sym,time:nowT(),via:"Copy"}].concat(p);});}} style={{background:"linear-gradient(135deg,#334,#222)",border:"1px solid #444",borderRadius:10,padding:"11px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Copy Text</button>
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

            {}
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
        {[["home","&#127968;","home"],["markets","&#128200;","markets"],["oi","&#128202;","oi"],["scanner","&#128209;","scanner"],["tools","&#128295;","tools"],["news","&#128240;","news"],["learn","&#128218;","learn"]].concat(isAdmin?[["admin","&#128081;","admin"]]:[]).map(function(item){
          return(<button key={item[0]} onClick={function(){setSelSt(null);setTab(item[0]);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:tab===item[0]?"#39FF1010":"transparent",border:"none",cursor:"pointer",padding:"4px 3px",borderRadius:9,minWidth:36,fontFamily:"inherit"}}>
            <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:item[1]}}></span>
            <span style={{fontSize:7,color:tab===item[0]?"#39FF14":"#445",fontWeight:600,whiteSpace:"nowrap"}}>{t(item[2])}</span>
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

    {/* ── MARKET OPEN/CLOSE POPUP ── */}
    {marketPopup&&(
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)"}} onClick={function(){setMarketPopup(null);}}>
        <div style={{background:marketPopup.bg,border:"2px solid "+marketPopup.color,borderRadius:20,padding:"28px 24px",width:"85%",maxWidth:360,textAlign:"center",animation:"slideUp 0.4s ease",position:"relative"}} onClick={function(e){e.stopPropagation();}}>
          {/* Glow effect */}
          <div style={{position:"absolute",top:-1,left:-1,right:-1,bottom:-1,borderRadius:20,boxShadow:"0 0 40px "+marketPopup.color+"55",pointerEvents:"none"}}></div>

          {/* Logo */}
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:22,fontWeight:900,color:"#fff",letterSpacing:-1}}>
              Breakout<span style={{color:"#39FF14"}}> Pro</span>
            </div>
            <div style={{fontSize:7,color:"#ff4400",letterSpacing:2,fontWeight:700}}>CATCH EVERY BREAKOUT</div>
          </div>

          <div style={{fontSize:32,marginBottom:10}}>{marketPopup.type==="open"?"📈":marketPopup.type==="close"?"📉":"🏅"}</div>
          <div style={{fontSize:20,fontWeight:900,color:marketPopup.color,marginBottom:4}}>{marketPopup.title}</div>
          <div style={{fontSize:11,color:"#aaa",marginBottom:8,fontWeight:600}}>{marketPopup.sub}</div>
          <div style={{fontSize:10,color:"#ccc",lineHeight:1.6,marginBottom:16,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px"}}>{marketPopup.msg}</div>

          {/* Live indices */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            <div style={{background:"rgba(0,0,0,0.4)",borderRadius:10,padding:"8px"}}>
              <div style={{fontSize:8,color:"#888",marginBottom:2}}>NIFTY 50</div>
              <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:"#fff"}}>{nifty.ltp.toFixed(2)}</div>
              <div style={{fontSize:9,fontWeight:700,color:nifty.up?"#39FF14":"#ff4444"}}>{nifty.up?"+":""}{nifty.pct.toFixed(2)}%</div>
            </div>
            <div style={{background:"rgba(0,0,0,0.4)",borderRadius:10,padding:"8px"}}>
              <div style={{fontSize:8,color:"#888",marginBottom:2}}>SENSEX</div>
              <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:"#fff"}}>{sensex.ltp.toFixed(2)}</div>
              <div style={{fontSize:9,fontWeight:700,color:sensex.up?"#39FF14":"#ff4444"}}>{sensex.up?"+":""}{sensex.pct.toFixed(2)}%</div>
            </div>
          </div>

          <button onClick={function(){setMarketPopup(null);}} style={{background:marketPopup.color,border:"none",borderRadius:12,padding:"11px 32px",color:"#000",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>
            {marketPopup.type==="open"?"Let's Trade! 🚀":marketPopup.type==="close"?"Review Day 📊":"View MCX 🏅"}
          </button>
          <div style={{fontSize:7,color:"#334",marginTop:8}}>Educational only · Not investment advice · Tap anywhere to close</div>
        </div>
      </div>
    )}

    {/* ── GEMINI FLOATING CHAT BUTTON ── */}
    {phase==="app"&&!chatOpen&&(
      <button onClick={function(){setChatOpen(true);}} style={{position:"fixed",bottom:82,right:14,width:58,height:58,borderRadius:16,background:"linear-gradient(135deg,#0a1a0a,#001a00)",border:"2px solid #39FF14",boxShadow:"0 4px 24px rgba(57,255,20,0.35)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:150,gap:1}}>
        <div style={{fontFamily:"Arial,sans-serif",fontSize:9,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1}}>B<span style={{color:"#39FF14"}}>P</span></div>
        <div style={{fontSize:7,fontWeight:800,color:"#39FF14",letterSpacing:0.5}}>AI</div>
        <div style={{fontSize:7,color:"#39FF1488"}}>CHAT</div>
        {chatMsgs.length>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#39FF14",borderRadius:"50%",width:16,height:16,fontSize:8,fontWeight:900,color:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>{chatMsgs.filter(function(m){return m.role==="ai";}).length}</span>}
      </button>
    )}

    {/* ── GEMINI CHAT PANEL ── */}
    {phase==="app"&&chatOpen&&(
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:250,display:"flex",flexDirection:"column",background:"#050505",maxWidth:430,margin:"0 auto"}}>

        {/* Chat Header */}
        <div style={{background:"linear-gradient(135deg,#0a0a2a,#050520)",borderBottom:"1px solid #1a1a3a",padding:"12px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#0a1a0a,#001a00)",border:"2px solid #39FF14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,gap:1}}>
              <div style={{fontFamily:"Arial,sans-serif",fontSize:11,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1}}>B<span style={{color:"#39FF14"}}>P</span></div>
              <div style={{fontSize:7,fontWeight:800,color:"#39FF14",letterSpacing:0.5}}>AI</div>
            </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Breakout Pro AI</div>
            <div style={{fontSize:8,color:"#4285f4",display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#39FF14",display:"inline-block"}}></span>
              Powered by Google Gemini
            </div>
          </div>
          <button onClick={function(){setChatOpen(false);}} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:16}}>&#10005;</button>
        </div>

        {/* Disclaimer banner */}
        <div style={{background:"#0a0500",borderBottom:"1px solid #ff440022",padding:"6px 14px",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <span style={{fontSize:10}}>&#9888;&#65039;</span>
          <span style={{fontSize:8,color:"#885522",lineHeight:1.4}}>Educational Purpose Only. Not SEBI Registered Investment Advice.</span>
        </div>

        {/* Messages area */}
        <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
          {chatMsgs.length===0&&(
            <div>
              <div style={{textAlign:"center",padding:"20px 10px 14px"}}>
                <div style={{fontSize:36,marginBottom:8}}>&#129302;</div>
                <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:4}}>Namaste! I'm your AI Assistant</div>
                <div style={{fontSize:9,color:"#556",lineHeight:1.6}}>Ask me anything about stock market education. I explain concepts in simple language.</div>
              </div>
              <div style={{fontSize:9,color:"#39FF14",fontWeight:700,marginBottom:8,textAlign:"center",letterSpacing:0.5}}>QUICK QUESTIONS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {QUICK_QUESTIONS.map(function(q){return(
                  <button key={q} onClick={function(){sendGemini(q);}} style={{background:"#0d0d1a",border:"1px solid #1a1a3a",borderRadius:9,padding:"8px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                    <div style={{fontSize:8,color:"#ccc",lineHeight:1.4}}>{q}</div>
                  </button>
                );})}
              </div>
            </div>
          )}

          {chatMsgs.map(function(msg,i){
            var isUser=msg.role==="user";
            return(
              <div key={i} style={{marginBottom:10,display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start"}}>
                <div style={{
                  maxWidth:"85%",
                  background:isUser?"linear-gradient(135deg,#4285f4,#1a56b0)":"#0d0d1a",
                  border:isUser?"none":"1px solid #1a1a3a",
                  borderRadius:isUser?"14px 14px 4px 14px":"14px 14px 14px 4px",
                  padding:"10px 12px",
                }}>
                  {!isUser&&(
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                      <span style={{fontSize:11}}>&#129302;</span>
                      <span style={{fontSize:8,color:"#4285f4",fontWeight:700}}>Breakout Pro AI</span>
                    </div>
                  )}
                  <div style={{fontSize:11,color:"#fff",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{msg.text}</div>
                  <div style={{fontSize:7,color:isUser?"rgba(255,255,255,0.5)":"#334",marginTop:4,textAlign:"right"}}>{msg.time}</div>
                </div>
              </div>
            );
          })}

          {chatLoading&&(
            <div style={{display:"flex",alignItems:"flex-start",marginBottom:10}}>
              <div style={{background:"#0d0d1a",border:"1px solid #1a1a3a",borderRadius:"14px 14px 14px 4px",padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                  <span style={{fontSize:11}}>&#129302;</span>
                  <span style={{fontSize:8,color:"#4285f4",fontWeight:700}}>Thinking...</span>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(function(i){return(
                    <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#4285f4",opacity:0.6,animation:"bpPulse 1.2s ease infinite",animationDelay:(i*0.2)+"s"}}></div>
                  );})}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input area */}
        <div style={{borderTop:"1px solid #1a1a1a",padding:"10px 12px",background:"#080808",flexShrink:0}}>
          {/* Quick chips */}
          <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:8,paddingBottom:2}}>
            {["Explain Doji","What is OI?","Explain PCR","What is Theta?","Gap Up pattern","Explain VWAP"].map(function(q){return(
              <button key={q} onClick={function(){sendGemini(q);}} style={{background:"#0d0d1a",border:"1px solid #1a1a3a",borderRadius:16,padding:"4px 10px",color:"#4285f4",fontSize:8,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit"}}>{q}</button>
            );})}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea
              value={chatInput}
              onChange={function(e){setChatInput(e.target.value);}}
              onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendGemini(chatInput);}}}
              placeholder="Ask about any stock market concept..."
              rows={1}
              style={{flex:1,background:"#0d0d1a",border:"1px solid #1a1a3a",borderRadius:11,padding:"10px 12px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",resize:"none",lineHeight:1.4,maxHeight:80,overflowY:"auto"}}
            />
            <button onClick={function(){sendGemini(chatInput);}} disabled={!chatInput.trim()||chatLoading} style={{background:chatInput.trim()&&!chatLoading?"linear-gradient(135deg,#4285f4,#0d47a1)":"#111",border:"none",borderRadius:11,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:chatInput.trim()&&!chatLoading?"pointer":"not-allowed",fontSize:16,flexShrink:0}}>
              &#10148;
            </button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,alignItems:"center"}}>
            <span style={{fontSize:7,color:"#223"}}>Powered by Google Gemini 2.0 Flash</span>
            {chatMsgs.length>0&&<button onClick={function(){setChatMsgs([]);try{localStorage.removeItem("bp_chat");}catch(e){}}} style={{background:"none",border:"none",color:"#334",fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>Clear chat</button>}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}