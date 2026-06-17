import { useState, useEffect } from "react";
import { DEMO_STOCKS, ALL_NSE_STOCKS } from "../data/marketsStocks";
import { COMMODITIES, INDICES, SECTORS } from "../data/marketsMeta";
import { genSpark, MiniChart, BackBtn, StockRow, CommodityDetail, SectorDetail, IndexDetail } from "./MarketsUI";
import { STOCK_META } from "../data/stockMeta";
import StockProfile from "./StockProfile";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

export default function MarketsScreen(props) {
  var stocks=(props.stocks&&props.stocks.length>0)?props.stocks:ALL_NSE_STOCKS;
  var [search,setSearch]=useState("");
  var [liveData,setLiveData]=useState({});
  var [liveStatus,setLiveStatus]=useState("demo");
  var [sort,setSort]=useState("pct");

  useEffect(function(){
    fetchLive();
    var t = setInterval(fetchLive, 30000);
    return function(){clearInterval(t);};
  },[]);

  function parseSym(sym) {
    return sym.replace(".NS","").replace("^NSEI","NIFTY").replace("^BSESN","SENSEX").replace("^NSEBANK","BANKNIFTY").replace("NIFTY_FIN_SERVICE","FINNIFTY").replace("^CRSLDX","MIDCAP");
  }

  function fetchLive(){
    var allSyms = ["^NSEI","^BSESN","^NSEBANK"].concat(
      ALL_NSE_STOCKS.map(function(s){ return s.sym.replace("&","").replace(" ","") + ".NS"; })
    );
    var batchSize = 90;
    var batches = [];
    for (var i = 0; i < allSyms.length; i += batchSize) {
      batches.push(allSyms.slice(i, i + batchSize));
    }

    var combinedMap = {};
    var anyLive = false;
    var completed = 0;

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
              };
              anyLive = true;
            });
          }
        })
        .catch(function(e){
          console.log("Batch fetch failed:", e.message);
        })
        .finally(function(){
          completed++;
          if(completed==batches.length){
            if(anyLive){setLiveData(Object.assign({},combinedMap));setLiveStatus("live");}
            else{setLiveStatus("demo");}
          }
        });
    });
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

  if(selStock)  return <StockProfile stock={selStock} meta={STOCK_META[selStock.sym]} onBack={function(){setSelStock(null);}}/>;
  if(selSector) return <SectorDetail s={selSector} onBack={function(){setSelSector(null);}}/>;
  if(selIdx)    return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}}/>;
  if(selCom)    return <CommodityDetail s={selCom} onBack={function(){setSelCom(null);}}/>;

  var filtered=stocks.filter(function(s){
    return !search||s.sym.toLowerCase().indexOf(search.toLowerCase())!=-1||s.name.toLowerCase().indexOf(search.toLowerCase())!=-1;
  }).sort(function(a,b){
    return sort=="pct"?b.chgPct-a.chgPct:b.ltp-a.ltp;
  });

  var TABS = [
    {id:"stocks",label:"Stocks ("+ALL_NSE_STOCKS.length+")"},
    {id:"indices",label:"Indices ("+INDICES.length+")"},
    {id:"sectors",label:"Sectors"},
    {id:"commodities",label:"Commodities"},
  ];

  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"8px 12px",marginBottom:10}}>
          <span style={{color:T2}}>&#128269;</span>
          <input style={{flex:1,background:"none",border:"none",outline:"none",fontSize:12,color:T1,fontFamily:"inherit"}} placeholder="Search stocks, sectors..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
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
          <div style={{background:liveStatus=="live"?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)",border:"1px solid "+(liveStatus=="live"?"rgba(0,200,83,0.3)":"rgba(255,255,255,0.1)"),borderRadius:20,padding:"2px 8px",display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:liveStatus=="live"?"#00E676":"#8899BB"}}></div>
            <span style={{fontSize:7,fontWeight:700,color:liveStatus=="live"?"#00E676":"#8899BB"}}>{liveStatus=="live"?"LIVE":"DEMO"}</span>
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
                  <span style={{color:"#4A5A7A",fontSize:14}}>&#8250;</span>
                </div>
              );
            })}
          </div>
        </div>
      ):null}
    </div>
  );
}