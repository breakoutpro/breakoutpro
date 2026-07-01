import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { DEMO_STOCKS, ALL_NSE_STOCKS } from "../data/marketsStocks";
import { COMMODITIES, INDICES, SECTORS } from "../data/marketsMeta";
import { genSpark, MiniChart, BackBtn, StockRow, CommodityDetail, SectorDetail, IndexDetail } from "./MarketsUI";
import { STOCK_META } from "../data/stockMeta";
import StockProfile from "./StockProfile";
import StockDetail from "./StockDetail";
import IndexFullPage from "./IndexFullPage";
import MarketsTop from "./MarketsTop";

// Colors come from the theme via useTheme() inside the component.

export default function MarketsScreen(props) {
  var TH=useTheme().c;
  var DB=TH.bg,CB=TH.card,BD=TH.border;
  var G=TH.up,G2=TH.up,R=TH.down;
  var GOLD=TH.gold,BLUE=TH.blue;
  var T1=TH.text1,T2=TH.text2,T3=TH.text3;
  var stocks=(props.stocks&&props.stocks.length>0)?props.stocks:ALL_NSE_STOCKS;
  var [search,setSearch]=useState("");
  var [liveData,setLiveData]=useState({});
  var [liveStatus,setLiveStatus]=useState("connecting");
  var [sort,setSort]=useState("pct");

  useEffect(function(){
    fetchLive();
    var t = setInterval(fetchLive, 30000);
    return function(){clearInterval(t);};
  },[]);

  function fetchLive(){
    var allSyms = ["^NSEI","^BSESN","^NSEBANK"].concat(
      ALL_NSE_STOCKS.map(function(s){ return s.sym.replace("&","").replace(" ","") + ".NS"; })
    );
    var batchSize = 30;
    var batches = [];
    for (var i = 0; i < allSyms.length; i += batchSize) {
      batches.push(allSyms.slice(i, i + batchSize));
    }

    var combinedMap = {};
    var anyLive = false;
    var completed = 0;
    var anyMarketOpen = false;

    batches.forEach(function(batch){
      fetch("/api/yahoo?symbols=" + batch.join(","))
        .then(function(r){return r.json();})
        .then(function(data){
          if(data && data.quoteResponse && data.quoteResponse.result){
            data.quoteResponse.result.forEach(function(q){
              if(!q.regularMarketPrice || q.regularMarketPrice==0) return;
              var key = parseSym(q.symbol);
              combinedMap[key] = {
                ltp: q.regularMarketPrice,
                chg: q.regularMarketChange||0,
                chgPct: Math.abs(parseFloat(q.regularMarketChangePercent||0)).toFixed(2),
                up: (q.regularMarketChange||0)>=0,
                high: q.regularMarketDayHigh||0,
                low: q.regularMarketDayLow||0,
                vol: q.regularMarketVolume||0,
                marketState: q.marketState||"CLOSED",
              };
              anyLive = true;
              if(q.marketState=="REGULAR") anyMarketOpen = true;
            });
          }
        })
        .catch(function(e){
          console.log("Batch fetch failed:", e.message);
        })
        .finally(function(){
          completed++;
          if(completed==batches.length){
            if(anyLive){
              setLiveData(Object.assign({},combinedMap));
              setLiveStatus(anyMarketOpen?"live":"closed");
            }
            else{
              setLiveStatus(function(prev){ return prev=="live"||prev=="closed" ? prev : "unavailable"; });
            }
          }
        });
    });
  }

  function parseSym(sym) {
    return sym.replace(".NS","").replace("^NSEI","NIFTY").replace("^BSESN","SENSEX").replace("^NSEBANK","BANKNIFTY").replace("NIFTY_FIN_SERVICE","FINNIFTY").replace("^CRSLDX","MIDCAP");
  }
  var [activeTab,setActiveTab]=useState("stocks");
  var [selStock,setSelStock]=useState(null);
  var [selSector,setSelSector]=useState(null);
  var [selIdx,setSelIdx]=useState(null);
  var [selCom,setSelCom]=useState(null);

  useEffect(function(){
    if(!document.getElementById("mkt-css")){
      var el=document.createElement("style");
      el.id="mkt-css";
      el.textContent="@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}";
      document.head.appendChild(el);
    }
  },[]);

  if(selStock)  return <StockDetail stock={selStock} onBack={function(){setSelStock(null);}}/>;
  if(selSector) return <SectorDetail s={selSector} onBack={function(){setSelSector(null);}}/>;
  if(selIdx)    return <IndexFullPage idx={{label:selIdx}} onBack={function(){setSelIdx(null);}}/>;
  if(selCom)    return <CommodityDetail s={selCom} onBack={function(){setSelCom(null);}}/>;

  var mergedStocks = stocks.map(function(s){
    var live = liveData[s.sym];
    if(live){
      return Object.assign({},s,{ltp:live.ltp, chgPct:parseFloat(live.chgPct), up:live.up, high:live.high, low:live.low, vol:live.vol, isLive:true});
    }
    return s;
  });

  var filtered=mergedStocks.filter(function(s){
    if(!search) return true;
    var q=search.toLowerCase();
    var sym=(s.sym||"").toLowerCase();
    var nm=(s.name||s.sect||"").toLowerCase();
    return sym.indexOf(q)!=-1||nm.indexOf(q)!=-1;
  }).sort(function(a,b){
    return sort=="pct"?b.chgPct-a.chgPct:b.ltp-a.ltp;
  });

  var TABS = [
    {id:"stocks",     label:"Stocks ("+ALL_NSE_STOCKS.length+")"},
    {id:"indices",    label:"Indices"},
    {id:"sectors",    label:"Sectors"},
    {id:"52w",        label:"52W H/L"},
    {id:"circuit",    label:"Circuit"},
    {id:"volume",     label:"Volume Leaders"},
    {id:"delivery",   label:"Delivery"},
    {id:"commodities",label:"Commodities"},
  ];

  var W52_HIGH = ALL_NSE_STOCKS.filter(function(s){ return s.up; }).slice(0,12).map(function(s){
    return Object.assign({},s,{w52h:parseFloat((s.ltp*1.02).toFixed(2)),w52l:parseFloat((s.ltp*0.72).toFixed(2)),nearHigh:s.chgPct>1.5});
  });
  var W52_LOW = ALL_NSE_STOCKS.filter(function(s){ return !s.up; }).slice(0,8).map(function(s){
    return Object.assign({},s,{w52h:parseFloat((s.ltp*1.38).toFixed(2)),w52l:parseFloat((s.ltp*0.99).toFixed(2)),nearLow:true});
  });
  var CIRCUIT_UP = ALL_NSE_STOCKS.filter(function(s){ return s.up && s.chgPct>4.5; }).slice(0,8).map(function(s){
    return Object.assign({},s,{circuit:"UC",limit:parseFloat((s.ltp*1.05).toFixed(2))});
  });
  var CIRCUIT_DOWN = ALL_NSE_STOCKS.filter(function(s){ return !s.up && s.chgPct>3; }).slice(0,8).map(function(s){
    return Object.assign({},s,{circuit:"LC",limit:parseFloat((s.ltp*0.95).toFixed(2))});
  });
  var VOL_LEADERS = ALL_NSE_STOCKS.slice(0,15).map(function(s,i){
    return Object.assign({},s,{vol:parseFloat(((15-i)*2.3+Math.random()*5).toFixed(1)),volUnit:"Cr"});
  }).sort(function(a,b){return b.vol-a.vol;});
  var DELIVERY = ALL_NSE_STOCKS.filter(function(s){return s.up;}).slice(0,12).map(function(s,i){
    return Object.assign({},s,{delPct:parseFloat((45+i*2.5+Math.random()*15).toFixed(1))});
  }).sort(function(a,b){return b.delPct-a.delPct;});

  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:9,padding:"6px 10px",marginBottom:10}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={{flex:1,background:"none",border:"none",outline:"none",fontSize:11.5,color:T1,fontFamily:"inherit"}} placeholder="Search stocks, sectors..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
          {search?<button onClick={function(){setSearch("");}} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:12}}>X</button>:null}
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto"}}>
          {TABS.map(function(t){
            var act=activeTab==t.id;
            return <button key={t.id} onClick={function(){setActiveTab(t.id);}} style={{background:act?G:"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"5px 12px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t.label}</button>;
          })}
          <div style={{flex:1}}></div>
          {activeTab=="stocks"?[["pct","% Chg"],["ltp","Price"]].map(function(s){
            var act=sort==s[0];
            return <button key={s[0]} onClick={function(){setSort(s[0]);}} style={{background:act?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"5px 10px",color:act?G:T2,fontSize:9,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s[1]}</button>;
          }):null}
        </div>
      </div>

      {activeTab=="stocks"&&!search?<MarketsTop setTab={props.setTab} onStock={function(st){setSelStock(st);}}/>:null}

      {/* STOCKS */}
      {activeTab=="stocks"?(
        <div style={{background:CB,margin:"10px 14px",borderRadius:12,border:"1px solid "+BD,overflow:"hidden"}}>
          {filtered.length==0?(
            <div style={{padding:24,textAlign:"center",color:T2,fontSize:12}}>No stocks found</div>
          ):filtered.map(function(s){
            return <StockRow key={s.sym} s={s} onClick={function(){setSelStock(s);}}/>;
          })}
        </div>
      ):null}

      {/* INDICES */}
      {activeTab=="indices"?(
        <div style={{display:"flex",justifyContent:"flex-end",padding:"4px 14px 0"}}>
          <div style={{background:liveStatus=="live"?"rgba(0,200,83,0.15)":liveStatus=="closed"?"rgba(255,255,255,0.06)":"rgba(245,158,11,0.1)",border:"1px solid "+(liveStatus=="live"?"rgba(0,200,83,0.3)":liveStatus=="closed"?"rgba(255,255,255,0.1)":"rgba(245,158,11,0.25)"),borderRadius:20,padding:"2px 8px",display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:liveStatus=="live"?G:liveStatus=="closed"?T2:GOLD}}></div>
            <span style={{fontSize:7,fontWeight:700,color:liveStatus=="live"?G:liveStatus=="closed"?T2:GOLD}}>{liveStatus=="live"?"LIVE":liveStatus=="closed"?"MARKET CLOSED":"CONNECTING"}</span>
          </div>
        </div>
      ):null}
      {activeTab=="indices"?(
        <div style={{padding:"10px 14px"}}>
          {INDICES.map(function(idx){
            var ld=liveData[idx.key||idx.label.replace(" ","")];
            var idxLive=ld?Object.assign({},idx,{ltp:ld.ltp||idx.ltp,pct:parseFloat(ld.chgPct)||idx.pct,up:ld.up}):idx;
            var idx=idxLive;
            var spark=genSpark(idx.ltp);
            return (
              <div key={idx.label} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:16,marginBottom:10,cursor:"pointer"}} onClick={function(){setSelIdx(idx.label);}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:T2,marginBottom:2}}>{idx.label}</div>
                    <div style={{fontSize:20,fontWeight:900,fontFamily:"monospace",color:idx.up?G2:R}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                    <span style={{background:idx.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:idx.up?G2:R,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,marginTop:4,display:"inline-block"}}>{idx.up?"+":""}{idx.pct.toFixed(2)}%</span>
                  </div>
                  <MiniChart data={spark} color={idx.up?G:R} w={90} h={45}/>
                </div>
              </div>
            );
          })}
        </div>
      ):null}

      {/* SECTORS */}
      {activeTab=="sectors"?(
        <div style={{padding:"10px 14px"}}>
          {SECTORS.map(function(s){
            var up=s.chg>=0;
            var spark=genSpark(22000+s.chg*10);
            return (
              <div key={s.name} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={function(){setSelSector(s);}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:T1}}>{s.name}</div>
                  <div style={{fontSize:9,color:T2,marginTop:2}}>{s.stocks.slice(0,3).join(", ")}</div>
                </div>
                <MiniChart data={spark} color={up?G:R} w={60} h={28}/>
                <div style={{background:up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:900,color:up?G2:R}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      ):null}

      {/* COMMODITIES */}
      {activeTab=="commodities"?(
        <div style={{padding:"10px 14px"}}>
          <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
            <div style={{fontSize:9,color:GOLD}}>MCX Commodities  Demo data. Live data on market days.</div>
          </div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            {COMMODITIES.map(function(s){
              var spark=genSpark(s.ltp);
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:"1px solid "+BD,cursor:"pointer"}} onClick={function(){setSelCom(s);}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:7,fontWeight:800,color:GOLD}}>{s.sym.slice(0,3)}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:8,color:T2,marginTop:1}}>{s.sect} - per {s.unit}</div>
                  </div>
                  <MiniChart data={spark} color={s.up?G:R} w={44} h={20}/>
                  <div style={{textAlign:"right",minWidth:80}}>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:T1}}>
                      Rs{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}
                    </div>
                    <div style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:5,padding:"1px 6px",fontSize:8,fontWeight:700,color:s.up?G2:R,marginTop:2}}>{s.up?"+":""}{s.chgPct.toFixed(2)}%</div>
                  </div>
                  <span style={{color:T3,fontSize:14}}>&#8250;</span>
                </div>
              );
            })}
          </div>
        </div>
      ):null}
      {/* 52W HIGH/LOW */}
      {activeTab=="52w"?(
        <div style={{padding:"10px 14px"}}>
          <div style={{fontSize:10,fontWeight:700,color:G2,letterSpacing:0.8,marginBottom:8}}>&#128200; 52-WEEK HIGH (Near High)</div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:14}}>
            {W52_HIGH.map(function(s,i){
              var pctFrom52H = ((s.ltp-s.w52h)/s.w52h*100).toFixed(1);
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:i<W52_HIGH.length-1?"1px solid "+BD:"none",cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:9,color:T2}}>52W H: {s.w52h.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                    <div style={{fontSize:9,fontWeight:700,color:G2}}>{pctFrom52H}% from H</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:R,letterSpacing:0.8,marginBottom:8}}>&#128201; 52-WEEK LOW (Near Low)</div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            {W52_LOW.map(function(s,i){
              var pctFrom52L = ((s.ltp-s.w52l)/s.w52l*100).toFixed(1);
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:i<W52_LOW.length-1?"1px solid "+BD:"none",cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:9,color:T2}}>52W L: {s.w52l.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                    <div style={{fontSize:9,fontWeight:700,color:R}}>+{pctFrom52L}% from L</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ):null}

      {/* CIRCUIT */}
      {activeTab=="circuit"?(
        <div style={{padding:"10px 14px"}}>
          <div style={{fontSize:10,fontWeight:700,color:G2,letterSpacing:0.8,marginBottom:8}}>&#9650; UPPER CIRCUIT</div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:14}}>
            {CIRCUIT_UP.length>0?CIRCUIT_UP.map(function(s,i){
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:i<CIRCUIT_UP.length-1?"1px solid "+BD:"none",cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{background:"rgba(0,200,83,0.15)",border:"1px solid rgba(0,200,83,0.3)",borderRadius:6,padding:"2px 6px",marginRight:10,flexShrink:0}}>
                    <span style={{fontSize:8,fontWeight:800,color:G2}}>UC</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:9,color:T2}}>Limit: {s.limit.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                    <div style={{fontSize:9,fontWeight:700,color:G2}}>+{s.chgPct}%</div>
                  </div>
                </div>
              );
            }):<div style={{padding:20,textAlign:"center",color:T2,fontSize:11}}>No upper circuit stocks today</div>}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:R,letterSpacing:0.8,marginBottom:8}}>&#9660; LOWER CIRCUIT</div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            {CIRCUIT_DOWN.length>0?CIRCUIT_DOWN.map(function(s,i){
              return (
                <div key={s.sym} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:i<CIRCUIT_DOWN.length-1?"1px solid "+BD:"none",cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"2px 6px",marginRight:10,flexShrink:0}}>
                    <span style={{fontSize:8,fontWeight:800,color:R}}>LC</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:9,color:T2}}>Limit: {s.limit.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                    <div style={{fontSize:9,fontWeight:700,color:R}}>-{s.chgPct}%</div>
                  </div>
                </div>
              );
            }):<div style={{padding:20,textAlign:"center",color:T2,fontSize:11}}>No lower circuit stocks today</div>}
          </div>
        </div>
      ):null}

      {/* VOLUME LEADERS */}
      {activeTab=="volume"?(
        <div style={{padding:"10px 14px"}}>
          <div style={{fontSize:10,fontWeight:700,color:T3,letterSpacing:0.8,marginBottom:8}}>TOP VOLUME STOCKS</div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            {VOL_LEADERS.map(function(s,i){
              var barW = Math.round((s.vol/VOL_LEADERS[0].vol)*100);
              return (
                <div key={s.sym} style={{padding:"10px 14px",borderBottom:i<VOL_LEADERS.length-1?"1px solid "+BD:"none",cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:9,fontWeight:700,color:T3,minWidth:16}}>#{i+1}</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                        <div style={{fontSize:9,color:T2}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:13,fontWeight:800,color:BLUE}}>{s.vol}{s.volUnit}</div>
                      <div style={{fontSize:9,fontWeight:700,color:s.up?G2:R}}>{s.up?"+":""}{s.chgPct}%</div>
                    </div>
                  </div>
                  <div style={{height:3,background:"rgba(96,165,250,0.1)",borderRadius:2}}>
                    <div style={{height:3,background:"rgba(96,165,250,0.6)",borderRadius:2,width:barW+"%"}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ):null}

      {/* DELIVERY */}
      {activeTab=="delivery"?(
        <div style={{padding:"10px 14px"}}>
          <div style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
            <div style={{fontSize:9,color:BLUE}}>High delivery % = strong institutional interest. Above 50% is bullish signal.</div>
          </div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            {DELIVERY.map(function(s,i){
              var barW = Math.round(s.delPct);
              var col = s.delPct>65?G:s.delPct>45?BLUE:GOLD;
              return (
                <div key={s.sym} style={{padding:"10px 14px",borderBottom:i<DELIVERY.length-1?"1px solid "+BD:"none",cursor:"pointer"}} onClick={function(){setSelStock(s);}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                      <div style={{fontSize:9,color:T2}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:16,fontWeight:900,color:col}}>{s.delPct}%</div>
                      <div style={{fontSize:8,color:T3}}>Delivery</div>
                    </div>
                  </div>
                  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                    <div style={{height:4,background:col,borderRadius:2,width:barW+"%",opacity:0.7}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ):null}

    </div>
  );
}