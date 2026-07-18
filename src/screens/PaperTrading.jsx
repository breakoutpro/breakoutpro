import { useState, useEffect } from "react";
import { OptionChainView } from "./OptionChainView";

import { useTheme } from "../theme/ThemeProvider";
var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var PURPLE = "#8B5CF6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var STARTING_BALANCE = 100000;
var FREE_TRADES = 5;

var MARKETS = {
  equity: {
    label:"Equity", color:G2, icon:"EQ",
    stocks:[
      {sym:"RELIANCE",  ltp:2845.60, lot:1,  type:"equity"},
      {sym:"TCS",       ltp:3654.20, lot:1,  type:"equity"},
      {sym:"HDFCBANK",  ltp:1742.50, lot:1,  type:"equity"},
      {sym:"ICICIBANK", ltp:1289.30, lot:1,  type:"equity"},
      {sym:"INFY",      ltp:1567.80, lot:1,  type:"equity"},
      {sym:"WIPRO",     ltp:478.90,  lot:1,  type:"equity"},
      {sym:"SBIN",      ltp:812.30,  lot:1,  type:"equity"},
      {sym:"TATAMOTORS",ltp:945.60,  lot:1,  type:"equity"},
      {sym:"AXISBANK",  ltp:1156.70, lot:1,  type:"equity"},
      {sym:"BAJFINANCE",ltp:7234.50, lot:1,  type:"equity"},
      {sym:"MARUTI",    ltp:13240,   lot:1,  type:"equity"},
      {sym:"SUNPHARMA", ltp:1678.40, lot:1,  type:"equity"},
      {sym:"LT",        ltp:3456.20, lot:1,  type:"equity"},
      {sym:"ADANIENT",  ltp:2876.40, lot:1,  type:"equity"},
      {sym:"ITC",       ltp:467.80,  lot:1,  type:"equity"},
    ]
  },
  fno: {
    label:"F&O", color:GOLD, icon:"FO",
    stocks:[
      {sym:"NIFTY 50",    ltp:23622.90, lot:50,  type:"futures", expiry:"26 Jun"},
      {sym:"BANKNIFTY",   ltp:56814.80, lot:15,  type:"futures", expiry:"26 Jun"},
      {sym:"FINNIFTY",    ltp:24123.45, lot:40,  type:"futures", expiry:"26 Jun"},
      {sym:"MIDCPNIFTY",  ltp:17265.90, lot:75,  type:"futures", expiry:"26 Jun"},
      {sym:"RELIANCE FUT",ltp:2850.00,  lot:250, type:"futures", expiry:"26 Jun"},
      {sym:"TCS FUT",     ltp:3658.00,  lot:150, type:"futures", expiry:"26 Jun"},
    ]
  },
  commodity: {
    label:"Commodity", color:PURPLE, icon:"CM",
    stocks:[
      {sym:"GOLD",       ltp:71245, lot:1,   type:"commodity", unit:"10g",   exchange:"MCX"},
      {sym:"SILVER",     ltp:87654, lot:1,   type:"commodity", unit:"kg",    exchange:"MCX"},
      {sym:"CRUDEOIL",   ltp:6823,  lot:100, type:"commodity", unit:"bbl",   exchange:"MCX"},
      {sym:"NATURALGAS", ltp:243,   lot:1250,type:"commodity", unit:"mmbtu", exchange:"MCX"},
      {sym:"COPPER",     ltp:812,   lot:2500,type:"commodity", unit:"kg",    exchange:"MCX"},
      {sym:"ZINC",       ltp:289,   lot:5000,type:"commodity", unit:"kg",    exchange:"MCX"},
      {sym:"ALUMINIUM",  ltp:234,   lot:5000,type:"commodity", unit:"kg",    exchange:"MCX"},
      {sym:"COTTON",     ltp:57890, lot:4,   type:"commodity", unit:"bale",  exchange:"MCX"},
    ]
  },
  options: {
    label:"Options", color:"#EC4899", icon:"OP",
    stocks:[
      {sym:"NIFTY",    spot:23622.90, lot:50,  type:"options", expiry:"26 Jun"},
      {sym:"BANKNIFTY",spot:56814.80, lot:15,  type:"options", expiry:"26 Jun"},
      {sym:"FINNIFTY", spot:24123.45, lot:40,  type:"options", expiry:"26 Jun"},
      {sym:"RELIANCE", spot:2845.60,  lot:250, type:"options", expiry:"26 Jun"},
      {sym:"TCS",      spot:3654.20,  lot:150, type:"options", expiry:"26 Jun"},
    ]
  },
  currency: {
    label:"Currency", color:BLUE, icon:"FX",
    stocks:[
      {sym:"USDINR",  ltp:83.42,  lot:1000, type:"currency", pair:"USD/INR"},
      {sym:"EURINR",  ltp:90.12,  lot:1000, type:"currency", pair:"EUR/INR"},
      {sym:"GBPINR",  ltp:106.34, lot:1000, type:"currency", pair:"GBP/INR"},
      {sym:"JPYINR",  ltp:0.5412, lot:100000,type:"currency",pair:"JPY/INR"},
      {sym:"AUDINR",  ltp:54.23,  lot:1000, type:"currency", pair:"AUD/INR"},
      {sym:"EURUSD",  ltp:1.0812, lot:1000, type:"currency", pair:"EUR/USD"},
    ]
  },
};

function loadPT() {
  try {
    var d = JSON.parse(localStorage.getItem("bp_pt2")||"{}");
    return {
      balance: d.balance||STARTING_BALANCE,
      positions: d.positions||[],
      history: d.history||[],
      tradesUsed: d.tradesUsed||0,
      lastDate: d.lastDate||"",
      totalPnl: d.totalPnl||0,
      wins: d.wins||0,
      losses: d.losses||0,
    };
  } catch(e) {
    return {balance:STARTING_BALANCE,positions:[],history:[],tradesUsed:0,lastDate:"",totalPnl:0,wins:0,losses:0};
  }
}

function savePT(d) { try{localStorage.setItem("bp_pt2",JSON.stringify(d));}catch(e){} }

function genPrice(base) { return parseFloat((base*(1+(Math.random()-0.48)*0.005)).toFixed(base<10?4:2)); }

function fmt(n) {
  if(Math.abs(n)>=100000) return (n/100000).toFixed(2)+"L";
  if(Math.abs(n)>=1000) return (n/1000).toFixed(1)+"K";
  return parseFloat(n).toFixed(2);
}

function today() { return new Date().toDateString(); }


export default function PaperTrading(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, G = theme.c.brand;

  var isPrem = props.isPrem||false;
  var [data, setData] = useState(loadPT);
  var [mkt, setMkt] = useState("equity");
  var [tab, setTab] = useState("trade");
  var [selSym, setSelSym] = useState("RELIANCE");
  var [optSym, setOptSym] = useState("NIFTY");
  var [showChain, setShowChain] = useState(false);
  var [optOrder, setOptOrder] = useState(null);
  var [side, setSide] = useState("BUY");
  var [qty, setQty] = useState("1");
  var [orderType, setOrderType] = useState("MARKET");
  var [limitPx, setLimitPx] = useState("");
  var [sl, setSl] = useState("");
  var [tgt, setTgt] = useState("");
  var [msg, setMsg] = useState(null);
  var [prices, setPrices] = useState(function(){
    var p={};
    Object.values(MARKETS).forEach(function(m){m.stocks.forEach(function(s){p[s.sym]=s.ltp;});});
    return p;
  });

  useEffect(function(){
    if(data.lastDate!=today()){
      var nd=Object.assign({},data,{tradesUsed:0,lastDate:today()});
      setData(nd);savePT(nd);
    }
  },[]);

  useEffect(function(){
    var t=setInterval(function(){
      setPrices(function(prev){
        var np=Object.assign({},prev);
        Object.values(MARKETS).forEach(function(m){
          m.stocks.forEach(function(s){np[s.sym]=genPrice(prev[s.sym]||s.ltp);});
        });
        return np;
      });
    },3000);
    return function(){clearInterval(t);};
  },[]);

  var allStocks = MARKETS[mkt].stocks;
  var selStock = allStocks.find(function(s){return s.sym==selSym;})||allStocks[0];
  var ltp = prices[selSym]||selStock.ltp;
  var tradesLeft = Math.max(0, FREE_TRADES - data.tradesUsed);
  var canTrade = isPrem||tradesLeft>0;

  var positions = data.positions.map(function(p){
    var pl=prices[p.sym]||p.entry;
    var pnl=(pl-p.entry)*p.qty*(p.side=="BUY"?1:-1);
    return Object.assign({},p,{ltp:pl,pnl:pnl,pnlPct:((pnl/(p.entry*p.qty))*100).toFixed(2)});
  });

  var openPnl=positions.reduce(function(s,p){return s+p.pnl;},0);
  var netBal=data.balance+openPnl;
  var winRate=(data.wins+data.losses)>0?Math.round(data.wins/(data.wins+data.losses)*100):0;

  function placeOrder(){
    if(!canTrade){showMsg("error","Daily limit! Upgrade PRO for unlimited trades.");return;}
    var q=parseFloat(qty);
    if(!q||q<=0){showMsg("error","Invalid quantity");return;}
    var px=orderType=="LIMIT"?parseFloat(limitPx):ltp;
    if(!px||px<=0){showMsg("error","Enter valid price");return;}
    var cost=px*q;
    if(side=="BUY"&&cost>data.balance){showMsg("error","Insufficient balance! Need Rs"+fmt(cost));return;}
    var pos={id:Date.now(),sym:selSym,market:mkt,side:side,qty:q,entry:px,
      sl:sl?parseFloat(sl):null,tgt:tgt?parseFloat(tgt):null,
      time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
      date:new Date().toLocaleDateString("en-IN"),type:selStock.type};
    var nb=side=="BUY"?data.balance-cost:data.balance;
    var nd=Object.assign({},data,{balance:nb,positions:data.positions.concat([pos]),tradesUsed:data.tradesUsed+1,lastDate:today()});
    setData(nd);savePT(nd);
    showMsg("success",side+" "+q+" "+selSym+" @ Rs"+px.toFixed(2)+" placed!");
    setSl("");setTgt("");setLimitPx("");
  }

  function closePos(posId){
    setData(function(prev){
      var pos=prev.positions.find(function(p){return p.id==posId;});
      if(!pos) return prev;
      var ep=prices[pos.sym]||pos.entry;
      var pnl=(ep-pos.entry)*pos.qty*(pos.side=="BUY"?1:-1);
      var won=pnl>=0;
      var nb=prev.balance+(pos.side=="BUY"?pos.qty*ep:pos.qty*(2*pos.entry-ep));
      var hist={id:posId,sym:pos.sym,market:pos.market,side:pos.side,qty:pos.qty,entry:pos.entry,exit:ep,pnl:pnl,date:pos.date};
      var nd=Object.assign({},prev,{balance:nb,positions:prev.positions.filter(function(p){return p.id!=posId;}),history:[hist].concat(prev.history).slice(0,100),totalPnl:prev.totalPnl+pnl,wins:prev.wins+(won?1:0),losses:prev.losses+(won?0:1)});
      savePT(nd);return nd;
    });
    showMsg("info","Position closed!");
  }

  function showMsg(type,text){setMsg({type:type,text:text});setTimeout(function(){setMsg(null);},3000);}
  function reset(){var f={balance:STARTING_BALANCE,positions:[],history:[],tradesUsed:0,lastDate:today(),totalPnl:0,wins:0,losses:0};setData(f);savePT(f);showMsg("info","Account reset to Rs 1 Lakh!");}

  var msgColor=msg?{success:G2,error:R,info:BLUE,warning:GOLD}[msg.type]||G2:G2;
  var inp={background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"};

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>Paper <span style={{color:BLUE}}>Trading</span></div>
            <div style={{fontSize:8,color:theme.c.warn,fontWeight:600}}>Virtual Money Only  Educational Practice</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:8,color:T2}}>Portfolio Value</div>
            <div style={{fontSize:18,fontWeight:900,color:netBal>=STARTING_BALANCE?G2:R}}>Rs{fmt(netBal)}</div>
            <div style={{fontSize:9,color:openPnl>=0?G2:R}}>{openPnl>=0?"+":""}Rs{fmt(openPnl)} Open P&L</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:10}}>
          {[
            ["Balance","Rs"+fmt(data.balance),T1],
            ["Free",isPrem?"Unlimited":(tradesLeft+"/"+FREE_TRADES),canTrade?G2:R],
            ["Win%",winRate+"%",winRate>=50?G2:R],
            ["Trades",data.wins+data.losses,GOLD],
            ["Total P&L",(data.totalPnl>=0?"+":"")+fmt(data.totalPnl),data.totalPnl>=0?G2:R],
          ].map(function(r){
            return <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:6,color:T2}}>{r[0]}</div><div style={{fontSize:9,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
          })}
        </div>

        {/* Main tabs */}
        <div style={{display:"flex",gap:5,marginBottom:8}}>
          {[["trade","Trade"],["positions","Positions("+positions.length+")"],["history","History"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{flex:1,background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"5px",color:act?"#fff":T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
        </div>

        {/* Market tabs */}
        {tab=="trade"?(
          <div style={{display:"flex",gap:5}}>
            {Object.keys(MARKETS).map(function(mk){
              var m=MARKETS[mk];
              var act=mkt==mk;
              return <button key={mk} onClick={function(){setMkt(mk);setSelSym(MARKETS[mk].stocks[0].sym);}} style={{flex:1,background:act?m.color+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(act?m.color:BD),borderRadius:8,padding:"5px",color:act?m.color:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}><div style={{fontSize:8,fontWeight:700}}>{m.icon}</div><div style={{fontSize:7}}>{m.label}</div></button>;
            })}
          </div>
        ):null}
      </div>

      {/* Message */}
      {msg?(
        <div style={{background:msgColor+"18",border:"1px solid "+msgColor+"44",borderRadius:10,margin:"8px 14px 0",padding:"10px 14px"}}>
          <div style={{fontSize:11,fontWeight:700,color:msgColor}}>{msg.text}</div>
        </div>
      ):null}

      {/* TRADE TAB */}
      {tab=="trade"?(
        <div style={{padding:"12px 14px 0"}}>

          {/* Free limit warning */}
          {!canTrade&&!isPrem?(
            <div style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:14,padding:14,marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:800,color:GOLD,marginBottom:4}}>Daily Limit Reached!</div>
              <div style={{fontSize:9,color:T2,marginBottom:10}}>Free: {FREE_TRADES} trades/day. PRO = Unlimited.</div>
              <button onClick={function(){props.setTab&&props.setTab("sub");}} style={{background:GOLD,border:"none",borderRadius:10,padding:"8px 20px",color:"#000",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Upgrade PRO</button>
            </div>
          ):null}

          {/* Stock selector */}
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:10}}>
            <div style={{fontSize:9,fontWeight:700,color:MARKETS[mkt].color,marginBottom:8}}>{MARKETS[mkt].label}  Select Instrument</div>
            <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4}}>
              {allStocks.map(function(s){
                var act=selSym==s.sym;
                var lp=prices[s.sym]||s.ltp;
                return (
                  <button key={s.sym} onClick={function(){setSelSym(s.sym);}} style={{background:act?MARKETS[mkt].color+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(act?MARKETS[mkt].color:BD),borderRadius:8,padding:"6px 8px",flexShrink:0,cursor:"pointer",fontFamily:"inherit",textAlign:"center",minWidth:70}}>
                    <div style={{fontSize:8,fontWeight:700,color:act?MARKETS[mkt].color:T1}}>{s.sym}</div>
                    <div style={{fontFamily:"monospace",fontSize:8,color:act?MARKETS[mkt].color:T2}}>Rs{lp>=1000?(lp/1000).toFixed(1)+"K":lp.toFixed(2)}</div>
                    {s.lot>1?<div style={{fontSize:6,color:T2}}>Lot:{s.lot}</div>:null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LTP Card */}
          <div style={{background:CB,border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:"12px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:22,fontWeight:900,fontFamily:"monospace",color:G2}}>Rs{ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
              <div style={{fontSize:8,color:T2,marginTop:2}}>{selSym}  Simulated Live Price</div>
            </div>
            <div style={{textAlign:"right"}}>
              {selStock.lot>1?<div style={{fontSize:9,color:GOLD,fontWeight:600}}>Lot: {selStock.lot}</div>:null}
              {selStock.expiry?<div style={{fontSize:8,color:T2}}>Exp: {selStock.expiry}</div>:null}
              {selStock.exchange?<div style={{fontSize:8,color:PURPLE}}>{selStock.exchange}</div>:null}
              {selStock.pair?<div style={{fontSize:8,color:BLUE}}>{selStock.pair}</div>:null}
            </div>
          </div>

          {/* BUY / SELL */}
          <div style={{display:mkt=="options"?"none":"flex",gap:8,marginBottom:10}}>
            {["BUY","SELL"].map(function(s){
              var act=side==s; var col=s=="BUY"?G:R;
              return <button key={s} onClick={function(){setSide(s);}} style={{flex:1,background:act?col+"22":"rgba(255,255,255,0.04)",border:"2px solid "+(act?col:BD),borderRadius:12,padding:"12px",color:act?col:T2,fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>;
            })}
          </div>

          {/* Order type */}
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {["MARKET","LIMIT","SL-M","SL-L"].map(function(ot){
              var act=orderType==ot;
              return <button key={ot} onClick={function(){setOrderType(ot);}} style={{flex:1,background:act?"rgba(30,144,255,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"5px 2px",color:act?BLUE:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{ot}</button>;
            })}
          </div>

          {orderType=="LIMIT"||orderType=="SL-L"?(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:T2,marginBottom:3}}>Limit Price</div>
              <input style={inp} type="number" placeholder={"LTP: "+ltp.toFixed(2)} value={limitPx} onChange={function(e){setLimitPx(e.target.value);}}/>
            </div>
          ):null}

          {/* Quantity */}
          <div style={{marginBottom:8}}>
            <div style={{fontSize:9,color:T2,marginBottom:3}}>Quantity {selStock.lot>1?"(1 lot = "+selStock.lot+" units)":""}</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={function(){setQty(function(q){return String(Math.max(1,parseInt(q||1)-1));});}} style={{background:CB,border:"1px solid "+BD,borderRadius:8,width:36,height:36,color:T1,fontSize:18,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>-</button>
              <input style={Object.assign({},inp,{textAlign:"center"})} type="number" value={qty} onChange={function(e){setQty(e.target.value);}}/>
              <button onClick={function(){setQty(function(q){return String(parseInt(q||0)+1);});}} style={{background:CB,border:"1px solid "+BD,borderRadius:8,width:36,height:36,color:T1,fontSize:18,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>+</button>
            </div>
          </div>

          {/* SL & Target */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <div style={{fontSize:9,color:R,marginBottom:3}}>Stop Loss</div>
              <input style={inp} type="number" placeholder="SL price" value={sl} onChange={function(e){setSl(e.target.value);}}/>
            </div>
            <div>
              <div style={{fontSize:9,color:G2,marginBottom:3}}>Target</div>
              <input style={inp} type="number" placeholder="Target price" value={tgt} onChange={function(e){setTgt(e.target.value);}}/>
            </div>
          </div>

          {/* Order value */}
          <div style={{background:side=="BUY"?"rgba(0,200,83,0.06)":"rgba(239,68,68,0.06)",border:"1px solid "+(side=="BUY"?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)"),borderRadius:10,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:10,color:T2}}>Order Value</div>
            <div style={{fontSize:13,fontWeight:700,color:side=="BUY"?G2:R}}>Rs{fmt(ltp*(parseFloat(qty)||1))}</div>
          </div>

          <button onClick={placeOrder} disabled={!canTrade} style={{width:"100%",background:canTrade?(side=="BUY"?G:R):"rgba(255,255,255,0.1)",border:"none",borderRadius:14,padding:"14px",color:canTrade?"#fff":T2,fontSize:14,fontWeight:900,cursor:canTrade?"pointer":"default",fontFamily:"inherit",marginBottom:10}}>
            {canTrade?side+" "+selSym:"Upgrade for Unlimited Trades"}
          </button>

          <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10}}>
            <div style={{fontSize:8,color:theme.c.warn,lineHeight:1.7}}>DISCLAIMER: This is a paper trading simulator for educational practice only. All money is virtual. No real money is involved. This is NOT investment advice. Not SEBI registered. Past simulated performance does not guarantee real market results. Always consult a SEBI registered advisor before real trading.</div>
          </div>
        </div>
      ):null}

      {/* POSITIONS */}
      {tab=="positions"?(
        <div style={{padding:"12px 14px 0"}}>
          {positions.length==0?(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:4}}>No Open Positions</div>
              <div style={{fontSize:10,color:T2}}>Go to Trade tab to place orders</div>
            </div>
          ):positions.map(function(p){
            var mktColor=MARKETS[p.market]?MARKETS[p.market].color:BLUE;
            return (
              <div key={p.id} style={{background:CB,border:"1px solid "+(p.pnl>=0?"rgba(0,200,83,0.25)":"rgba(239,68,68,0.25)"),borderRadius:14,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{background:mktColor+"22",color:mktColor,borderRadius:4,padding:"1px 5px",fontSize:7,fontWeight:700}}>{MARKETS[p.market]?MARKETS[p.market].icon:p.market}</span>
                      <span style={{background:p.side=="BUY"?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:p.side=="BUY"?G2:R,borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700}}>{p.side}</span>
                      <span style={{fontSize:13,fontWeight:800,color:T1}}>{p.sym}</span>
                    </div>
                    <div style={{fontSize:9,color:T2}}>Qty: {p.qty} | Entry: Rs{p.entry.toFixed(2)} | LTP: Rs{p.ltp.toFixed(2)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:16,fontWeight:900,color:p.pnl>=0?G2:R}}>{p.pnl>=0?"+":""}Rs{fmt(p.pnl)}</div>
                    <div style={{fontSize:9,color:p.pnl>=0?G2:R}}>{p.pnlPct}%</div>
                  </div>
                </div>
                {(p.sl||p.tgt)?(
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    {p.sl?<div style={{flex:1,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,padding:"4px 8px",textAlign:"center"}}><div style={{fontSize:7,color:R}}>Stop Loss</div><div style={{fontSize:10,fontWeight:700,color:R}}>Rs{p.sl.toFixed(2)}</div></div>:null}
                    {p.tgt?<div style={{flex:1,background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:6,padding:"4px 8px",textAlign:"center"}}><div style={{fontSize:7,color:G2}}>Target</div><div style={{fontSize:10,fontWeight:700,color:G2}}>Rs{p.tgt.toFixed(2)}</div></div>:null}
                  </div>
                ):null}
                <button onClick={function(){closePos(p.id);}} style={{width:"100%",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"8px",color:R,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Square Off</button>
              </div>
            );
          })}
        </div>
      ):null}

      {/* HISTORY */}
      {tab=="history"?(
        <div style={{padding:"12px 14px 0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[["Total P&L",(data.totalPnl>=0?"+Rs":"-Rs")+fmt(Math.abs(data.totalPnl)),data.totalPnl>=0?G2:R],["Win Rate",winRate+"%",winRate>=50?G2:R],["Total Trades",data.wins+data.losses,GOLD]].map(function(r){
              return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:3}}>{r[0]}</div><div style={{fontSize:14,fontWeight:800,color:r[2]}}>{r[1]}</div></div>;
            })}
          </div>
          {data.history.length==0?(
            <div style={{textAlign:"center",padding:"40px 0",color:T2}}><div style={{fontSize:13,fontWeight:700,marginBottom:4}}>No Trade History</div><div style={{fontSize:10}}>Place and close trades to see history</div></div>
          ):data.history.map(function(h){
            var won=h.pnl>=0;
            var mktColor=MARKETS[h.market]?MARKETS[h.market].color:BLUE;
            return (
              <div key={h.id} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+(won?G:R)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{background:mktColor+"22",color:mktColor,borderRadius:4,padding:"1px 5px",fontSize:7,fontWeight:700}}>{MARKETS[h.market]?MARKETS[h.market].icon:h.market}</span>
                    <span style={{background:h.side=="BUY"?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:h.side=="BUY"?G2:R,borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700}}>{h.side}</span>
                    <span style={{fontSize:12,fontWeight:700,color:T1}}>{h.sym}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:800,color:won?G2:R}}>{won?"+Rs":"-Rs"}{fmt(Math.abs(h.pnl))}</span>
                </div>
                <div style={{display:"flex",gap:8,fontSize:8,color:T2}}>
                  <span>In: Rs{h.entry}</span><span>Out: Rs{h.exit}</span><span>Qty: {h.qty}</span><span>{h.date}</span>
                </div>
              </div>
            );
          })}
          <button onClick={reset} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:10,padding:10,color:T2,fontSize:11,cursor:"pointer",fontFamily:"inherit",marginTop:10}}>Reset Account (Rs 1 Lakh)</button>
        </div>
      ):null}

    </div>
  );
}
