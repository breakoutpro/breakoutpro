import { COMMODITIES, INDICES, SECTORS } from "../data/marketsMeta";
import { STOCK_META } from "../data/stockMeta";

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

function genSpark(base) {
  var a=[]; var p=base;
  for(var i=0;i<14;i++){p=p+(Math.random()-0.48)*base*0.004;a.push(p);}
  return a;
}

function MiniChart(props) {
  var data=props.data,color=props.color||G,w=props.w||60,h=props.h||28;
  if(!data||data.length<2) return null;
  var min=Math.min.apply(null,data),max=Math.max.apply(null,data),range=max-min||1;
  var pts=data.map(function(v,i){return (i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);}).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function BackBtn(props) {
  return (
    <button onClick={props.onClick} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1,flexShrink:0}}>&#8592;</button>
  );
}

function StockRow(props) {
  var s=props.s,spark=genSpark(s.ltp);
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"1px solid "+BD,cursor:"pointer"}} onClick={props.onClick}>
      <div style={{width:36,height:36,borderRadius:10,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:7,fontWeight:800,color:BLUE}}>{s.sym.slice(0,3)}</span>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
        <div style={{fontSize:8,color:T2,marginTop:1}}>{s.sect}</div>
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
}

function StockDetail(props) {
  var s=props.s;
  var d=STOCK_META[s.sym]||{pe:"N/A",pb:"N/A",mcap:"N/A",high52:"N/A",low52:"N/A"};
  var spark=genSpark(s.ltp);
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <BackBtn onClick={props.onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:9,color:T2}}>{s.name} - {s.sect}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:s.up?G2:R}}>
            Rs{s.ltp>=1000?(s.ltp/1000).toFixed(2)+"K":s.ltp.toFixed(2)}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:s.up?G2:R}}>{s.up?"+":""}{s.chgPct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
          <MiniChart data={spark} color={s.up?G:R} w={340} h={80}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["52W High","Rs"+d.high52],["52W Low","Rs"+d.low52],["Mkt Cap",d.mcap],["P/E",d.pe],["P/B",d.pb],["Sector",s.sect]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:7,color:T2,marginBottom:3}}>{r[0]}</div>
                <div style={{fontSize:11,fontWeight:700,color:T1}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:s.up?"rgba(0,200,83,0.08)":"rgba(239,68,68,0.08)",border:"1px solid "+(s.up?"rgba(0,200,83,0.2)":"rgba(239,68,68,0.2)"),borderRadius:12,padding:12,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:s.up?G2:R,marginBottom:4}}>{s.up?"Bullish":"Bearish"} Signal</div>
          <div style={{fontSize:10,color:T2,lineHeight:1.7}}>{s.up?"Price showing positive momentum. Watch for continuation above current levels with volume confirmation.":"Price showing negative pressure. Watch support levels for potential reversal signals."}</div>
        </div>
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function CommodityDetail(props) {
  var s=props.s;
  var spark=genSpark(s.ltp);
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <BackBtn onClick={props.onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:9,color:T2}}>{s.name} - per {s.unit}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:s.up?G2:R}}>
            Rs{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:s.up?G2:R}}>{s.up?"+":""}{s.chgPct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
          <MiniChart data={spark} color={s.up?G:R} w={340} h={80}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[["Sector",s.sect],["Unit","Per "+s.unit],["Exchange","MCX"],["Type",s.sect]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:7,color:T2,marginBottom:3}}>{r[0]}</div>
                <div style={{fontSize:11,fontWeight:700,color:T1}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Commodity prices are indicative. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function SectorDetail(props) {
  var s=props.s,up=s.chg>=0;
  var stocks=DEMO_STOCKS.filter(function(st){return st.sect==s.name||s.stocks.indexOf(st.sym)!=-1;}).map(function(st){var ld=liveData[st.sym];return ld?Object.assign({},st,{ltp:ld.ltp||st.ltp,chgPct:parseFloat(ld.chgPct)||st.chgPct,up:ld.up}):st;}).slice(0,8);
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <BackBtn onClick={props.onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.name} Sector</div>
          <div style={{fontSize:9,color:T2}}>{stocks.length} stocks</div>
        </div>
        <div style={{background:up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:8,padding:"6px 12px"}}>
          <div style={{fontSize:14,fontWeight:900,color:up?G2:R}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:12}}>
          {stocks.map(function(st){
            var sp=genSpark(st.ltp);
            return (
              <div key={st.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"1px solid "+BD}}>
                <div style={{width:34,height:34,borderRadius:8,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:7,fontWeight:800,color:BLUE}}>{st.sym.slice(0,3)}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{st.sym}</div>
                  <div style={{fontSize:8,color:T2}}>{st.sect}</div>
                </div>
                <MiniChart data={sp} color={st.up?G:R} w={44} h={20}/>
                <div style={{textAlign:"right",minWidth:76}}>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:T1}}>Rs{st.ltp>=1000?(st.ltp/1000).toFixed(1)+"K":st.ltp}</div>
                  <div style={{background:st.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700,color:st.up?G2:R}}>{st.up?"+":""}{st.chgPct.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function IndexDetail(props) {
  var label=props.idx;
  var idx=INDICES.find(function(i){return i.label==label;})||INDICES[0];
  var spark=genSpark(idx.ltp);
  var meta={
    "NIFTY 50":    {pe:22.4,mcap:"Rs 2.4 Cr Cr",desc:"Top 50 large-cap NSE stocks"},
    "SENSEX":      {pe:24.1,mcap:"Rs 3.1 Cr Cr",desc:"Top 30 large-cap BSE stocks"},
    "BANK NIFTY":  {pe:18.2,mcap:"Rs 1.8 Cr Cr",desc:"Top 12 liquid banking stocks"},
    "MIDCAP 50":   {pe:28.5,mcap:"Rs 0.9 Cr Cr",desc:"Mid-cap companies index"},
    "INDIA VIX":   {pe:"N/A",mcap:"N/A",desc:"Market fear gauge - volatility index"},
    "FINNIFTY":    {pe:20.1,mcap:"Rs 1.2 Cr Cr",desc:"Financial services index"},
    "NIFTY IT":    {pe:29.4,mcap:"Rs 2.1 Cr Cr",desc:"Information Technology sector index"},
    "NIFTY BANK":  {pe:18.2,mcap:"Rs 1.8 Cr Cr",desc:"Banking sector index"},
    "NIFTY AUTO":  {pe:22.1,mcap:"Rs 0.8 Cr Cr",desc:"Automobile sector index"},
    "NIFTY PHARMA":{pe:31.2,mcap:"Rs 0.7 Cr Cr",desc:"Pharmaceutical sector index"},
  };
  var d=meta[label]||{pe:"N/A",mcap:"N/A",desc:""};
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <BackBtn onClick={props.onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{idx.label}</div>
          <div style={{fontSize:9,color:T2}}>{d.desc}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:idx.up?G2:R}}>
            {idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:idx.up?G2:R}}>{idx.up?"+":""}{idx.pct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
          <MiniChart data={spark} color={idx.up?G:R} w={340} h={80}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[["P/E Ratio",d.pe],["Market Cap",d.mcap]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,textAlign:"center"}}>
                <div style={{fontSize:8,color:T2,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:14,fontWeight:800,color:G}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

export { genSpark, MiniChart, BackBtn, StockRow, StockDetail, CommodityDetail, SectorDetail, IndexDetail };
