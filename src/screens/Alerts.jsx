import { useState, useEffect, useRef } from "react";
import { EQ, CM, PATTERNS, BREAKOUTS, OI_TYPES, SECTORS, ALERT_FILTERS, getSess, genCandle, calcConfidence, riskFromConf, playSound, MiniSpark } from "./AlertsData";

var BG="#07111F",CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#7C3AED",PURPLE2="#A855F7",GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

export default function SmartAlerts(props){
  var setTab = props.setTab || function(){};
  var sess0=getSess();
  var LIST=sess0=="commodity"?CM:EQ;
  var [session,setSession]=useState(sess0);
  var [stocks,setStocks]=useState(function(){
    return LIST.map(function(s){
      var c=[],p=s.base;
      for(var i=0;i<25;i++){var chg=(Math.random()-0.48)*p*0.004;var o=p,cl=parseFloat((o+chg).toFixed(2));c.push({open:o,close:cl,high:parseFloat((Math.max(o,cl)+Math.random()*p*0.002).toFixed(2)),low:parseFloat((Math.min(o,cl)-Math.random()*p*0.002).toFixed(2)),vol:Math.floor(50000+Math.random()*300000)});p=cl;}
      return Object.assign({},s,{candles:c,ltp:p,spark:c.map(function(x){return x.close;})});
    });
  });
  var [alerts,setAlerts]=useState([]);
  var [filters,setFilters]=useState(["candle","breakout","oi","fiidii","sector","news"]);
  var [sound,setSound]=useState(true);
  var [scanning,setScanning]=useState(true);
  var [mood,setMood]=useState({bull:68,bear:32,fg:"Greed"});
  var aRef=useRef([]);
  aRef.current=alerts;

  function addAlert(al){
    var na=[al].concat(aRef.current).slice(0,60);
    setAlerts(na);
    if(sound)playSound();
    if(typeof Notification!="undefined"&&Notification.permission=="granted"){
      try{new Notification("BreakoutPro: "+al.sym,{body:al.type+" - Confidence "+al.conf+"%",icon:"/favicon.ico"});}catch(e){}
    }
  }

  useEffect(function(){
    var l=session=="commodity"?CM:EQ;
    setStocks(l.map(function(s){
      var c=[],p=s.base;
      for(var i=0;i<25;i++){var chg=(Math.random()-0.48)*p*0.004;var o=p,cl=parseFloat((o+chg).toFixed(2));c.push({open:o,close:cl,high:parseFloat((Math.max(o,cl)+Math.random()*p*0.002).toFixed(2)),low:parseFloat((Math.min(o,cl)-Math.random()*p*0.002).toFixed(2)),vol:Math.floor(50000+Math.random()*300000)});p=cl;}
      return Object.assign({},s,{candles:c,ltp:p,spark:c.map(function(x){return x.close;})});
    }));
  },[session]);

  useEffect(function(){
    if(!scanning)return;
    var t=setInterval(function(){
      setMood({bull:Math.floor(45+Math.random()*40),bear:0,fg:Math.random()>0.5?"Greed":"Fear"});
      setStocks(function(prev){
        return prev.map(function(stock){
          var nc=genCandle(stock.candles[stock.candles.length-1]);
          var ncs=stock.candles.slice(-24).concat([nc]);
          var closes=ncs.map(function(c){return c.close;});
          var h20=Math.max.apply(null,closes.slice(0,-1));
          var l20=Math.min.apply(null,closes.slice(0,-1));
          var avgV=ncs.slice(-8).reduce(function(s,c){return s+c.vol;},0)/8;
          var vSpike=nc.vol>avgV*1.6;
          var roll=Math.random();
          var conf=calcConfidence();
          var time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

          if(nc.close>h20*1.002&&vSpike&&filters.indexOf("breakout")!=-1&&roll<0.18){
            addAlert({id:Date.now()+Math.random(),sym:stock.sym,type:"Resistance Breakout",cat:"Breakout",msg:"Volume Breakout confirmed above resistance",color:UP,time:time,ltp:nc.close,conf:conf,risk:riskFromConf(conf)});
          } else if(nc.close<l20*0.998&&vSpike&&filters.indexOf("breakout")!=-1&&roll<0.18){
            addAlert({id:Date.now()+Math.random(),sym:stock.sym,type:"Support Breakdown",cat:"Breakout",msg:"Selling pressure increasing below support",color:DOWN,time:time,ltp:nc.close,conf:conf,risk:riskFromConf(conf)});
          } else if(filters.indexOf("candle")!=-1&&roll<0.10){
            var pat=PATTERNS[Math.floor(Math.random()*PATTERNS.length)];
            addAlert({id:Date.now()+Math.random()+1,sym:stock.sym,type:pat.name,cat:"Candlestick",msg:pat.type=="bullish"?"Possible Bullish Reversal detected":"Selling Pressure Increasing",color:pat.type=="bullish"?UP:DOWN,time:time,ltp:nc.close,conf:conf,risk:riskFromConf(conf)});
          } else if(filters.indexOf("oi")!=-1&&roll<0.06&&(stock.sym=="NIFTY 50"||stock.sym=="BANKNIFTY")){
            var oi=OI_TYPES[Math.floor(Math.random()*OI_TYPES.length)];
            addAlert({id:Date.now()+Math.random()+2,sym:stock.sym,type:oi.name,cat:"OI Data",msg:"Options data shows "+oi.name.toLowerCase(),color:oi.type=="bullish"?UP:oi.type=="bearish"?DOWN:GOLD,time:time,ltp:nc.close,conf:conf,risk:riskFromConf(conf)});
          }
          return Object.assign({},stock,{candles:ncs,ltp:nc.close,spark:ncs.slice(-20).map(function(c){return c.close;})});
        });
      });
    },3500);
    return function(){clearInterval(t);};
  },[scanning,sound,filters,session]);

  var sessCol=session=="commodity"?GOLD:session=="global"?BLUE:UP;

  return(
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CARD,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={function(){setTab("more");}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:28,height:28,color:T1,fontSize:13,cursor:"pointer",flexShrink:0}}>&#8592;</button>
            <div>
              <div style={{fontSize:15,fontWeight:900,color:T1}}>Smart <span style={{color:BLUE2}}>AI Alerts</span></div>
              <div style={{fontSize:8,color:T3}}>Breakouts, Patterns, OI, FII/DII</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={function(){setSound(!sound);}} style={{background:sound?"rgba(124,58,237,0.15)":"rgba(255,255,255,0.06)",border:"1px solid "+(sound?PURPLE:BD),borderRadius:20,padding:"5px 10px",color:sound?PURPLE2:T2,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{sound?"Bell ON":"Bell OFF"}</button>
            <button onClick={function(){setScanning(!scanning);}} style={{background:scanning?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.1)",border:"1px solid "+(scanning?UP:DOWN),borderRadius:20,padding:"5px 10px",color:scanning?UP:DOWN,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{scanning?"Live":"Paused"}</button>
          </div>
        </div>

        {/* Market Mood */}
        <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.05))",border:"1px solid "+BD,borderRadius:12,padding:"10px 12px",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:9,fontWeight:700,color:T2}}>MARKET MOOD</span>
            <span style={{fontSize:9,fontWeight:700,color:mood.fg=="Greed"?UP:DOWN}}>Fear and Greed: {mood.fg}</span>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden",display:"flex"}}>
            <div style={{width:mood.bull+"%",background:UP}}></div>
            <div style={{width:(100-mood.bull)+"%",background:DOWN}}></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:9,fontWeight:700,color:UP}}>Bullish {mood.bull}%</span>
            <span style={{fontSize:9,fontWeight:700,color:DOWN}}>Bearish {100-mood.bull}%</span>
          </div>
        </div>

        {/* Session tabs */}
        <div style={{display:"flex",gap:5,marginBottom:8}}>
          {["equity","commodity","global"].map(function(s){
            var act=session==s,col=s=="commodity"?GOLD:s=="global"?BLUE:UP;
            return <button key={s} onClick={function(){setSession(s);}} style={{flex:1,background:act?col+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:BD),borderRadius:8,padding:"5px",color:act?col:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{s=="equity"?"NSE/BSE":s=="commodity"?"MCX":"Global"}</button>;
          })}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:2}}>
          {ALERT_FILTERS.map(function(f){
            var act=filters.indexOf(f.id)!=-1;
            return <button key={f.id} onClick={function(){setFilters(function(p){return act?p.filter(function(x){return x!=f.id;}):p.concat([f.id]);});}} style={{background:act?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 9px",color:act?BLUE2:T3,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{f.label}</button>;
          })}
        </div>
      </div>

      <div style={{padding:"10px 14px 0"}}>

        {/* Sector strength */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"10px 14px",marginBottom:12}}>
          <div style={{fontSize:9,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.5}}>SECTOR STRENGTH</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {SECTORS.map(function(s){
              return <div key={s.name} style={{background:(s.up?UP:DOWN)+"15",border:"1px solid "+(s.up?UP:DOWN)+"33",borderRadius:8,padding:"4px 9px"}}><span style={{fontSize:8,fontWeight:700,color:s.up?UP:DOWN}}>{s.name} {s.status}</span></div>;
            })}
          </div>
        </div>

        {/* Watchlist */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between"}}>
            <div style={{fontSize:10,fontWeight:700,color:T1}}>Watchlist ({stocks.length})</div>
            <span style={{fontSize:8,color:sessCol,fontWeight:700}}>{session=="commodity"?"MCX":session=="global"?"GLOBAL":"NSE/BSE"}</span>
          </div>
          {stocks.map(function(s){
            var pct=s.base>0?((s.ltp-s.base)/s.base*100):0,up=pct>=0;
            return(
              <div key={s.sym} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:"1px solid "+BD}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:7,color:T3}}>{s.sect}</div>
                </div>
                <MiniSpark data={s.spark} color={up?UP:DOWN}/>
                <div style={{textAlign:"right",minWidth:64}}>
                  <div style={{fontFamily:"monospace",fontSize:10,fontWeight:800,color:T1}}>{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}</div>
                  <div style={{fontSize:8,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{pct.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alerts feed */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:T1}}>AI Alerts <span style={{background:"rgba(124,58,237,0.15)",color:PURPLE2,borderRadius:10,padding:"1px 8px",fontSize:9,marginLeft:6}}>{alerts.length}</span></div>
          {alerts.length>0?<button onClick={function(){setAlerts([]);}} style={{background:"none",border:"none",color:T3,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>:null}
        </div>

        {alerts.length==0?(
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"30px 20px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:4}}>Scanning Markets...</div>
            <div style={{fontSize:9,color:T3}}>AI watching {stocks.length} instruments for breakouts, patterns, OI shifts</div>
          </div>
        ):(
          alerts.slice(0,25).map(function(al){
            return(
              <div key={al.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+al.color}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <span style={{fontSize:13,fontWeight:800,color:T1}}>{al.sym}</span>
                      <span style={{background:al.color+"22",color:al.color,borderRadius:6,padding:"1px 7px",fontSize:8,fontWeight:700}}>{al.cat}</span>
                    </div>
                    <div style={{fontSize:10,fontWeight:600,color:al.color}}>{al.type}</div>
                  </div>
                  <span style={{fontSize:8,color:T3,flexShrink:0}}>{al.time}</span>
                </div>
                <div style={{fontSize:10,color:T2,lineHeight:1.6,marginBottom:6}}>{al.msg}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9,fontWeight:700,color:al.color}}>LTP: Rs{al.ltp>=1000?(al.ltp/1000).toFixed(2)+"K":al.ltp.toFixed(2)}</span>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:8,color:T3}}>Confidence:</span>
                    <span style={{fontSize:9,fontWeight:800,color:al.conf>=80?UP:al.conf>=60?GOLD:DOWN}}>{al.conf}%</span>
                    <span style={{background:(al.risk=="Low"?UP:al.risk=="Medium"?GOLD:DOWN)+"18",color:al.risk=="Low"?UP:al.risk=="Medium"?GOLD:DOWN,borderRadius:6,padding:"1px 6px",fontSize:7,fontWeight:700}}>{al.risk} Risk</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div style={{background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.15)",borderRadius:10,padding:10,marginTop:8}}>
          <div style={{fontSize:8,color:PURPLE2,lineHeight:1.7}}>This is AI-generated market analysis for educational purposes only. It is not investment advice. Please do your own research before trading.</div>
        </div>
      </div>
    </div>
  );
}
