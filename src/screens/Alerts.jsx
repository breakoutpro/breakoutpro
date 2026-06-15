import { useState, useEffect, useRef } from "react";

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",T1="#FFFFFF",T2="#8899BB";

var EQ=[
  {sym:"NIFTY 50",ltp:23622.90,base:23622.90,sect:"Index"},
  {sym:"BANKNIFTY",ltp:56814.80,base:56814.80,sect:"Index"},
  {sym:"RELIANCE",ltp:2845.60,base:2845.60,sect:"Energy"},
  {sym:"TCS",ltp:3654.20,base:3654.20,sect:"IT"},
  {sym:"HDFCBANK",ltp:1742.50,base:1742.50,sect:"Bank"},
  {sym:"ICICIBANK",ltp:1289.30,base:1289.30,sect:"Bank"},
  {sym:"INFY",ltp:1567.80,base:1567.80,sect:"IT"},
  {sym:"SBIN",ltp:812.30,base:812.30,sect:"Bank"},
  {sym:"TATAMOTORS",ltp:945.60,base:945.60,sect:"Auto"},
  {sym:"AXISBANK",ltp:1156.70,base:1156.70,sect:"Bank"},
];

var CM=[
  {sym:"GOLD",ltp:71245,base:71245,sect:"MCX"},
  {sym:"SILVER",ltp:87654,base:87654,sect:"MCX"},
  {sym:"CRUDEOIL",ltp:6823,base:6823,sect:"MCX"},
  {sym:"NATURALGAS",ltp:243,base:243,sect:"MCX"},
  {sym:"COPPER",ltp:812,base:812,sect:"MCX"},
  {sym:"ZINC",ltp:289,base:289,sect:"MCX"},
];

var ATYPES=[
  {id:"breakout",label:"Breakout",color:G2},
  {id:"breakdown",label:"Breakdown",color:R},
  {id:"doji",label:"Doji",color:GOLD},
  {id:"hammer",label:"Hammer",color:G2},
  {id:"engulf",label:"Engulfing",color:GOLD},
  {id:"volume",label:"Vol Spike",color:"#3B82F6"},
];

function getSess(){
  var m=new Date().getHours()*60+new Date().getMinutes();
  if(m>=9*60+15&&m<15*60+30)return"equity";
  if(m>=15*60+30||m<2*60)return"commodity";
  return"global";
}

function detect(candles){
  if(candles.length<3)return null;
  var n=candles.length,c=candles[n-1],p=candles[n-2];
  var cB=Math.abs(c.close-c.open),cR=c.high-c.low;
  var cUW=c.high-Math.max(c.open,c.close),cLW=Math.min(c.open,c.close)-c.low;
  var cBull=c.close>c.open,pBull=p.close>p.open,pB=Math.abs(p.close-p.open);
  if(cR>0&&cB<cR*0.1)return{name:"Doji",type:"neutral"};
  if(cLW>=cB*2&&cUW<=cB*0.3&&!pBull)return{name:"Hammer",type:"bullish"};
  if(cUW>=cB*2&&cLW<=cB*0.3&&pBull)return{name:"Shooting Star",type:"bearish"};
  if(!pBull&&cBull&&c.open<p.close&&c.close>p.open&&cB>pB*1.2)return{name:"Bullish Engulfing",type:"bullish"};
  if(pBull&&!cBull&&c.open>p.close&&c.close<p.open&&cB>pB*1.2)return{name:"Bearish Engulfing",type:"bearish"};
  return null;
}

function genCandle(prev){
  var chg=(Math.random()-0.48)*prev.close*0.004;
  var o=prev.close,cl=parseFloat((o+chg).toFixed(2));
  var hi=parseFloat((Math.max(o,cl)+Math.random()*prev.close*0.002).toFixed(2));
  var lo=parseFloat((Math.min(o,cl)-Math.random()*prev.close*0.002).toFixed(2));
  return{open:o,close:cl,high:hi,low:lo,vol:Math.floor(50000+Math.random()*300000)};
}

function playAlert(){
  try{
    var ctx=new(window.AudioContext||window.webkitAudioContext)();
    [880,1100,1320].forEach(function(freq,i){
      var osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.frequency.value=freq;osc.type="sine";
      gain.gain.setValueAtTime(0,ctx.currentTime+i*0.12);
      gain.gain.linearRampToValueAtTime(0.25,ctx.currentTime+i*0.12+0.05);
      gain.gain.linearRampToValueAtTime(0,ctx.currentTime+i*0.12+0.2);
      osc.start(ctx.currentTime+i*0.12);osc.stop(ctx.currentTime+i*0.12+0.25);
    });
  }catch(e){}
}

function MiniSpark(props){
  var d=props.data||[],col=props.color||G,w=50,h=22;
  if(d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rng=mx-mn||1;
  var pts=d.map(function(v,i){return(i/(d.length-1))*w+","+(h-((v-mn)/rng)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export default function AlertsScreen(){
  var sess=getSess();
  var LIST=sess=="commodity"?CM:EQ;
  var [session,setSession]=useState(sess);
  var [stocks,setStocks]=useState(function(){
    return LIST.map(function(s){
      var c=[],p=s.base;
      for(var i=0;i<30;i++){var chg=(Math.random()-0.48)*p*0.004;var o=p,cl=parseFloat((o+chg).toFixed(2));c.push({open:o,close:cl,high:parseFloat((Math.max(o,cl)+Math.random()*p*0.002).toFixed(2)),low:parseFloat((Math.min(o,cl)-Math.random()*p*0.002).toFixed(2)),vol:Math.floor(50000+Math.random()*300000)});p=cl;}
      return Object.assign({},s,{candles:c,ltp:p,spark:c.map(function(x){return x.close;})});
    });
  });
  var [alerts,setAlerts]=useState([]);
  var [filters,setFilters]=useState(["breakout","breakdown","doji","hammer","engulf","volume"]);
  var [sound,setSound]=useState(true);
  var [scanning,setScanning]=useState(true);
  var aRef=useRef([]);
  aRef.current=alerts;

  useEffect(function(){
    var l=session=="commodity"?CM:EQ;
    setStocks(l.map(function(s){
      var c=[],p=s.base;
      for(var i=0;i<30;i++){var chg=(Math.random()-0.48)*p*0.004;var o=p,cl=parseFloat((o+chg).toFixed(2));c.push({open:o,close:cl,high:parseFloat((Math.max(o,cl)+Math.random()*p*0.002).toFixed(2)),low:parseFloat((Math.min(o,cl)-Math.random()*p*0.002).toFixed(2)),vol:Math.floor(50000+Math.random()*300000)});p=cl;}
      return Object.assign({},s,{candles:c,ltp:p,spark:c.map(function(x){return x.close;})});
    }));
  },[session]);

  function addAlert(al){
    var na=[al].concat(aRef.current).slice(0,50);
    setAlerts(na);
    if(sound)playAlert();
    if(typeof Notification!="undefined"&&Notification.permission=="granted"){
      try{new Notification("BreakoutPro: "+al.sym,{body:al.type+" - "+al.msg,icon:"/favicon.ico"});}catch(e){}
    }
  }

  useEffect(function(){
    if(!scanning)return;
    var t=setInterval(function(){
      setStocks(function(prev){
        return prev.map(function(stock){
          var nc=genCandle(stock.candles[stock.candles.length-1]);
          var ncs=stock.candles.slice(-29).concat([nc]);
          var closes=ncs.slice(-20).map(function(c){return c.close;});
          var h20=Math.max.apply(null,closes.slice(0,-1));
          var l20=Math.min.apply(null,closes.slice(0,-1));
          var avgV=ncs.slice(-10).reduce(function(s,c){return s+c.vol;},0)/10;
          var vSpike=nc.vol>avgV*1.5;
          if(nc.close>h20*1.002&&vSpike&&filters.indexOf("breakout")!=-1){
            addAlert({id:Date.now()+Math.random(),sym:stock.sym,type:"Breakout",msg:"Price broke above 20-candle high with volume!",color:G2,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),ltp:nc.close});
          } else if(nc.close<l20*0.998&&vSpike&&filters.indexOf("breakdown")!=-1){
            addAlert({id:Date.now()+Math.random(),sym:stock.sym,type:"Breakdown",msg:"Price broke below 20-candle low with volume!",color:R,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),ltp:nc.close});
          } else if(vSpike&&nc.vol>avgV*2&&filters.indexOf("volume")!=-1){
            addAlert({id:Date.now()+Math.random(),sym:stock.sym,type:"Vol Spike",msg:"Volume is 2x+ average! Institutional activity.",color:GOLD,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),ltp:nc.close});
          }
          var pat=detect(ncs);
          if(pat&&Math.random()<0.12){
            var pid=pat.type=="bullish"?"breakout":pat.type=="bearish"?"breakdown":"doji";
            if(filters.indexOf(pid)!=-1||filters.indexOf("engulf")!=-1){
              addAlert({id:Date.now()+Math.random()+1,sym:stock.sym,type:pat.name,msg:pat.type=="bullish"?"Bullish reversal signal":pat.type=="bearish"?"Bearish reversal signal":"Indecision - wait for confirmation",color:pat.type=="bullish"?G2:pat.type=="bearish"?R:GOLD,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),ltp:nc.close});
            }
          }
          return Object.assign({},stock,{candles:ncs,ltp:nc.close,spark:ncs.slice(-20).map(function(c){return c.close;})});
        });
      });
    },3000);
    return function(){clearInterval(t);};
  },[scanning,sound,filters,session]);

  var sessColor=session=="commodity"?GOLD:session=="global"?"#3B82F6":G2;

  return(
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>Live <span style={{color:G}}>Alerts</span></div>
            <div style={{fontSize:8,color:T2}}>Breakouts, Patterns, Volume Spikes</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={function(){setSound(!sound);}} style={{background:sound?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)",border:"1px solid "+(sound?G:BD),borderRadius:20,padding:"5px 10px",color:sound?G2:T2,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{sound?"Bell ON":"Bell OFF"}</button>
            <button onClick={function(){setScanning(!scanning);}} style={{background:scanning?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.1)",border:"1px solid "+(scanning?G:R),borderRadius:20,padding:"5px 10px",color:scanning?G2:R,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{scanning?"Scanning":"Paused"}</button>
          </div>
        </div>

        {/* Session tabs */}
        <div style={{display:"flex",gap:5,marginBottom:8}}>
          {["equity","commodity","global"].map(function(s){
            var act=session==s;
            var col=s=="commodity"?GOLD:s=="global"?"#3B82F6":G2;
            return <button key={s} onClick={function(){setSession(s);}} style={{flex:1,background:act?col+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:BD),borderRadius:8,padding:"5px",color:act?col:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{s=="equity"?"NSE/BSE":s=="commodity"?"MCX":"Global"}</button>;
          })}
        </div>

        {/* Alert type filters */}
        <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:2}}>
          {ATYPES.map(function(at){
            var act=filters.indexOf(at.id)!=-1;
            return <button key={at.id} onClick={function(){setFilters(function(prev){return act?prev.filter(function(f){return f!=at.id;}):prev.concat([at.id]);});}} style={{background:act?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.03)",border:"1px solid "+(act?at.color:BD),borderRadius:20,padding:"4px 8px",color:act?at.color:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{at.label}</button>;
          })}
        </div>
      </div>

      <div style={{padding:"10px 14px 0"}}>

        {/* Watchlist */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:T1}}>Watchlist ({stocks.length})</div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {scanning?<div style={{width:6,height:6,borderRadius:"50%",background:sessColor}}></div>:null}
              <span style={{fontSize:8,color:sessColor,fontWeight:700}}>{session=="commodity"?"MCX":session=="global"?"GLOBAL":"NSE/BSE"}</span>
            </div>
          </div>
          {stocks.map(function(s){
            var chgPct=s.base>0?((s.ltp-s.base)/s.base*100):0;
            var up=chgPct>=0;
            return(
              <div key={s.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:"1px solid "+BD}}>
                <div style={{width:34,height:34,borderRadius:9,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:7,fontWeight:800,color:"#3B82F6"}}>{s.sym.slice(0,4)}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:8,color:T2}}>{s.sect}</div>
                </div>
                <MiniSpark data={s.spark} color={up?G:R}/>
                <div style={{textAlign:"right",minWidth:72}}>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:T1}}>{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}</div>
                  <div style={{fontSize:8,fontWeight:700,color:up?G2:R}}>{up?"+":""}{chgPct.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alerts Feed */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,color:T1}}>Live Alerts <span style={{background:"rgba(0,200,83,0.15)",color:G2,borderRadius:10,padding:"1px 8px",fontSize:9,marginLeft:6}}>{alerts.length}</span></div>
          {alerts.length>0?<button onClick={function(){setAlerts([]);}} style={{background:"none",border:"none",color:T2,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>:null}
        </div>

        {alerts.length==0?(
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"30px 20px",textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:8}}>&#128276;</div>
            <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:4}}>Scanning...</div>
            <div style={{fontSize:9,color:T2}}>Watching {stocks.length} instruments for alerts.</div>
          </div>
        ):(
          alerts.slice(0,20).map(function(al){
            return(
              <div key={al.id} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+al.color}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{background:al.color+"22",color:al.color,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:800}}>{al.type}</span>
                    <span style={{fontSize:13,fontWeight:800,color:T1}}>{al.sym}</span>
                  </div>
                  <span style={{fontSize:8,color:T2,flexShrink:0}}>{al.time}</span>
                </div>
                <div style={{fontSize:10,color:T2,lineHeight:1.6,marginBottom:4}}>{al.msg}</div>
                <div style={{fontSize:9,fontWeight:700,color:al.color}}>LTP: Rs{al.ltp>=1000?(al.ltp/1000).toFixed(2)+"K":al.ltp?al.ltp.toFixed(2):"--"}</div>
              </div>
            );
          })
        )}

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:8}}>
          <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Educational alerts only. Not SEBI registered. Not buy/sell advice.</div>
        </div>
      </div>
    </div>
  );
              }
        
