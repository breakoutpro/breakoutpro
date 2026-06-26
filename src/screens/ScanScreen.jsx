import { useState } from "react";
import { SECTIONS, getScanResults } from "./ScannerData";
import { hasAccess } from "../i18n/translations";

// BreakoutPro - ScanScreen.jsx (Scanner Hub)
// 8 sections, premium cards, each opens a detail page. SEBI-safe (no buy/sell).
// Pure black, blue accent, green/red direction. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// icon glyphs per section (HTML entities).
var SEC_ICON=["&#128202;","&#128200;","&#127919;","&#129302;","&#128218;","&#128176;","&#129518;","&#128640;"];

export default function ScanScreen(props){
  var setTab=props.setTab||function(){};
  var [scan,setScan]=useState(null);
  var prem=hasAccess();

  if(scan) return <ScannerDetail item={scan} onBack={function(){setScan(null);}} setTab={setTab}/>;

  function openItem(it){
    if(it.kind=="tab"){ setTab(it.tab); return; }
    if(it.kind=="calc"){ setTab("tools"); return; }
    setScan(it); // scan kind opens detail page
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      <div style={{background:BG,padding:"14px 14px 12px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10}}>
        <div style={{fontSize:18,fontWeight:900,color:T1}}>Scanner Hub</div>
        <div style={{fontSize:10,color:T2,marginTop:2}}>Professional market intelligence tools</div>
      </div>

      <div style={{padding:14}}>
        {SECTIONS.map(function(sec,si){
          return (
            <div key={sec.name} style={{marginBottom:22}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
                <span style={{fontSize:14}} dangerouslySetInnerHTML={{__html:SEC_ICON[si]||"&#128202;"}}/>
                <span style={{fontSize:12.5,fontWeight:800,color:T1,letterSpacing:0.3}}>{sec.name}</span>
                {sec.pro?<span style={{fontSize:7,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 6px",borderRadius:4}}>PRO</span>:null}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
                {sec.items.map(function(it){
                  var locked=it.pro && !prem;
                  return (
                    <button key={it.id} onClick={function(){ if(locked){setTab("sub");return;} openItem(it); }} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:"1px solid "+BD,borderRadius:13,padding:"13px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                      <div style={{width:38,height:38,background:CARD2,border:"1px solid "+BD2,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:15}} dangerouslySetInnerHTML={{__html:SEC_ICON[si]||"&#128202;"}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:12.5,fontWeight:700,color:T1}}>{it.title}</span>
                          {it.pro?<span style={{fontSize:6.5,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.1)",padding:"1px 5px",borderRadius:3}}>PRO</span>:null}
                        </div>
                        <div style={{fontSize:9.5,color:T2,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.desc}</div>
                      </div>
                      {locked?
                        <span style={{fontSize:12,flexShrink:0}} dangerouslySetInnerHTML={{__html:"&#128274;"}}/>
                        :<span style={{fontSize:15,color:T3,flexShrink:0}}>&#8250;</span>
                      }
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:9,color:"#F97316"}}>Educational Market Intelligence Only. Not Investment Advice.</div>
        </div>
      </div>
    </div>
  );
}

// Scanner detail page - results + AI explanation, SEBI-safe.
function ScannerDetail(props){
  var it=props.item;
  var d=getScanResults(it.id);
  function speak(){
    try{
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(it.title+". "+d.what+" "+d.meaning);
      u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function Sec(p){ return <div style={{marginBottom:13}}><div style={{fontSize:10,fontWeight:800,color:p.c||T2,letterSpacing:0.4,marginBottom:6}}>{p.t}</div><div style={{fontSize:11.5,color:T1,lineHeight:1.6}}>{p.v}</div></div>; }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:900,color:T1}}>{it.title}</div>
          <div style={{fontSize:9,color:T2}}>{it.desc}</div>
        </div>
        <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"7px 11px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266;</button>
      </div>

      <div style={{padding:14}}>
        {/* RESULTS */}
        <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:4}}>DETECTED</div>
        <div style={{fontSize:9,color:T3,marginBottom:10}}>Educational detection. Not a buy or sell list.</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:18}}>
          {d.results.map(function(s,i){
            return (
              <div key={s.sym} onClick={function(){ if(props.setTab){props.setTab("markets");} }} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 13px",borderBottom:i<d.results.length-1?"1px solid "+BD2:"none",cursor:"pointer"}}>
                <span style={{fontSize:12.5,fontWeight:700,color:T1}}>{s.sym}</span>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:12.5,fontWeight:800,color:s.up?UP:DOWN,fontFamily:"monospace",marginRight:8}}>Rs {s.ltp}</span>
                  <span style={{fontSize:11,fontWeight:700,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI EXPLANATION */}
        <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:11}}>
            <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
            <span style={{fontSize:12,fontWeight:800,color:CYAN}}>AI Explanation</span>
          </div>
          <Sec t="WHY DETECTED" c={CYAN} v={d.why}/>
          <Sec t="WHAT HAPPENED" v={d.what}/>
          <Sec t="EDUCATIONAL MEANING" v={d.meaning}/>
          <Sec t="RISK FACTORS" c={DOWN} v={d.risk}/>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:9,color:"#F97316"}}>Educational Market Intelligence Only. Not Investment Advice. No buy, sell, entry, stop loss, or target.</div>
        </div>
      </div>
    </div>
  );
}
