import { useState, useEffect } from "react";

// BreakoutPro - WatchlistPage.jsx
// User watchlist: add up to 20 stocks or indices, see alerts.
// Pure black, green/red direction, blue buttons. Rules: no backtick, no triple-equals, ASCII.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var MAX=20;
var SUGGEST=[
  {sym:"NIFTY",name:"NIFTY 50"},{sym:"SENSEX",name:"SENSEX"},{sym:"BANKNIFTY",name:"BANK NIFTY"},
  {sym:"RELIANCE",name:"Reliance"},{sym:"TCS",name:"TCS"},{sym:"HDFCBANK",name:"HDFC Bank"},
  {sym:"INFY",name:"Infosys"},{sym:"ICICIBANK",name:"ICICI Bank"},{sym:"SBIN",name:"SBI"},
  {sym:"TATAMOTORS",name:"Tata Motors"},{sym:"WIPRO",name:"Wipro"},{sym:"AXISBANK",name:"Axis Bank"},
  {sym:"BAJFINANCE",name:"Bajaj Finance"},{sym:"MARUTI",name:"Maruti"},{sym:"ADANIENT",name:"Adani Ent"}
];

function loadWL(){
  try{ var s=localStorage.getItem("bp_watchlist"); return s?JSON.parse(s):["NIFTY","RELIANCE","HDFCBANK"]; }catch(e){ return ["NIFTY"]; }
}
function saveWL(arr){ try{ localStorage.setItem("bp_watchlist",JSON.stringify(arr)); }catch(e){} }

// Deterministic mock price for display (real data via dataService later).
function mockPrice(sym){
  var h=0; for(var i=0;i<sym.length;i++){ h=(h*31+sym.charCodeAt(i))%100000; }
  var base=200+(h%3000);
  var pct=((h%900)/100)-4.5;
  return { ltp:base.toFixed(2), pct:pct.toFixed(2), up:pct>=0 };
}

export default function WatchlistPage(props){
  var [wl,setWl]=useState(loadWL());
  var [adding,setAdding]=useState(false);
  var [q,setQ]=useState("");

  useEffect(function(){ saveWL(wl); },[wl]);

  function add(sym){
    if(wl.indexOf(sym)!=-1) return;
    if(wl.length>=MAX) return;
    setWl(wl.concat([sym]));
    setAdding(false); setQ("");
  }
  function remove(sym){ setWl(wl.filter(function(s){return s!=sym;})); }

  var filtered=SUGGEST.filter(function(s){
    if(wl.indexOf(s.sym)!=-1) return false;
    if(!q) return true;
    var query=q.toLowerCase();
    return s.sym.toLowerCase().indexOf(query)!=-1||s.name.toLowerCase().indexOf(query)!=-1;
  });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>My Watchlist</div>
          <div style={{fontSize:9,color:T2}}>{wl.length} of {MAX} added</div>
        </div>
        <button onClick={function(){setAdding(!adding);}} style={{background:adding?"rgba(255,255,255,0.08)":"rgba(59,130,246,0.15)",border:"1px solid "+(adding?BD:"rgba(59,130,246,0.4)"),borderRadius:9,padding:"7px 12px",color:adding?T2:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{adding?"Close":"+ Add"}</button>
      </div>

      {adding?(
        <div style={{padding:"12px 14px",borderBottom:"1px solid "+BD}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:9,padding:"8px 11px",marginBottom:10}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input autoFocus style={{flex:1,background:"none",border:"none",outline:"none",fontSize:12,color:T1,fontFamily:"inherit"}} placeholder="Search stocks or indices..." value={q} onChange={function(e){setQ(e.target.value);}}/>
          </div>
          {wl.length>=MAX?<div style={{fontSize:10,color:DOWN,marginBottom:8}}>Watchlist full. Remove one to add more.</div>:null}
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",maxHeight:260,overflowY:"auto"}}>
            {filtered.length==0?<div style={{padding:16,textAlign:"center",color:T2,fontSize:11}}>No matches</div>:filtered.map(function(s,i){
              return (
                <div key={s.sym} onClick={function(){add(s.sym);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",borderBottom:i<filtered.length-1?"1px solid "+BD:"none",cursor:"pointer"}}>
                  <div><div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div><div style={{fontSize:9,color:T2}}>{s.name}</div></div>
                  <span style={{fontSize:16,color:CYAN}}>+</span>
                </div>
              );
            })}
          </div>
        </div>
      ):null}

      <div style={{padding:14}}>
        {wl.length==0?(
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:13,color:T2,marginBottom:6}}>Your watchlist is empty</div>
            <div style={{fontSize:11,color:T3}}>Tap "+ Add" to track stocks and indices</div>
          </div>
        ):(
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            {wl.map(function(sym,i){
              var m=mockPrice(sym);
              return (
                <div key={sym} style={{display:"flex",alignItems:"center",padding:"12px 13px",borderBottom:i<wl.length-1?"1px solid "+BD:"none"}}>
                  <div onClick={function(){if(props.onStock)props.onStock({sym:sym,ltp:m.ltp,up:m.up,chgPct:parseFloat(m.pct)});}} style={{flex:1,cursor:"pointer"}}>
                    <div style={{fontSize:13,fontWeight:700,color:T1}}>{sym}</div>
                    <div style={{fontSize:9,color:T2,marginTop:1}}>Alerts active</div>
                  </div>
                  <div style={{textAlign:"right",marginRight:12}}>
                    <div style={{fontSize:13,fontWeight:800,color:m.up?UP:DOWN,fontFamily:"monospace"}}>Rs {m.ltp}</div>
                    <div style={{fontSize:10,fontWeight:700,color:m.up?UP:DOWN}}>{m.up?"+":""}{m.pct}%</div>
                  </div>
                  <button onClick={function(){remove(sym);}} style={{background:"none",border:"none",color:T3,fontSize:16,cursor:"pointer",padding:4}}>&#215;</button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:12,padding:13,marginTop:14}}>
          <div style={{fontSize:11,fontWeight:700,color:CYAN,marginBottom:6}}>Watchlist Alerts</div>
          <div style={{fontSize:10.5,color:T2,lineHeight:1.6}}>You will get breakout, volume spike, and pattern alerts for all stocks in your watchlist. Voice and push alerts can be set in the Signals page.</div>
        </div>
      </div>
    </div>
  );
}
