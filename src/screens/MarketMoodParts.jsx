import { MT } from "./MarketMoodData";

// BreakoutPro - MarketMoodParts.jsx
// Reusable section components for the Game Plan screen.
// Rules: no backtick, no triple-equals, ASCII only.

export function Gauge(props){
  var m=props.mood;
  var deg=(m.score/100)*180;
  return (
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative",width:180,height:96,margin:"0 auto",overflow:"hidden"}}>
        <div style={{position:"absolute",width:180,height:180,borderRadius:"50%",border:"15px solid "+MT.BD,boxSizing:"border-box",clipPath:"inset(0 0 50% 0)"}}></div>
        <div style={{position:"absolute",width:180,height:180,borderRadius:"50%",border:"15px solid "+m.color,boxSizing:"border-box",clipPath:"inset(0 0 50% 0)",transform:"rotate("+(deg-180)+"deg)",transformOrigin:"center center",transition:"transform 0.7s"}}></div>
        <div style={{position:"absolute",bottom:6,left:0,right:0,textAlign:"center"}}>
          <span style={{fontSize:30,fontWeight:800,color:m.color}}>{m.score}</span>
        </div>
      </div>
      <div style={{marginTop:4}}>
        <div style={{fontSize:30,fontWeight:800,color:m.color}}>{m.label}</div>
        <div style={{fontSize:12,color:MT.T2,marginTop:2}}>{m.gapText}</div>
      </div>
    </div>
  );
}

export function MiniCue(props){
  var c=props.c;
  return (
    <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:11,padding:"10px 12px",minWidth:104,flexShrink:0}}>
      <div style={{fontSize:10,color:MT.T2,marginBottom:4}}>{c.name}</div>
      <div style={{fontSize:18,fontWeight:800,color:MT.T1,fontFamily:"monospace"}}>{c.val}</div>
      <div style={{fontSize:10,fontWeight:700,color:c.up?MT.GREEN:MT.RED,marginTop:2}}>{c.chg}</div>
    </div>
  );
}

export function LevelCard(props){
  var L=props.L;
  var cells=[["R2",L.r2,MT.RED],["R1",L.r1,MT.RED],["P",L.piv,MT.YELLOW],["S1",L.s1,MT.GREEN],["S2",L.s2,MT.GREEN]];
  return (
    <div style={{background:"#0B1120",border:"1px solid "+MT.BD,borderRadius:13,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:14,fontWeight:800,color:MT.T1}}>{L.name}</span>
        <span style={{fontSize:13,fontWeight:700,color:MT.T2,fontFamily:"monospace"}}>{L.ltp}</span>
      </div>
      <div style={{display:"flex",gap:5}}>
        {cells.map(function(x){
          return (
            <div key={x[0]} style={{flex:1,textAlign:"center",background:MT.CARD2,borderRadius:8,padding:"7px 2px"}}>
              <div style={{fontSize:8.5,color:x[2],fontWeight:800}}>{x[0]}</div>
              <div style={{fontSize:10,color:MT.T1,fontWeight:600,fontFamily:"monospace",marginTop:3}}>{x[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NewsBlock(props){
  var pos=props.pos;
  var items=props.items;
  var bg=pos?"#0A1110":"#120809";
  var bd=pos?MT.DGREEN:MT.DRED;
  var hc=pos?MT.GREEN:MT.RED;
  return (
    <div style={{background:bg,border:"1px solid "+bd,borderRadius:13,padding:14,marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:800,color:hc,marginBottom:3,letterSpacing:0.4}}>{pos?"POSITIVE NEWS IMPACT":"NEGATIVE NEWS IMPACT"}</div>
      <div style={{fontSize:9.5,color:MT.T2,marginBottom:11}}>{pos?"Stocks supported by overnight developments":"Stocks facing overnight pressure"}</div>
      {items.map(function(s,i){
        return (
          <div key={s.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:i>0?"1px solid rgba(255,255,255,0.04)":"none"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:hc,flexShrink:0}}></div>
            <span style={{fontSize:12.5,fontWeight:800,color:MT.T1,width:96,flexShrink:0}}>{s.sym}</span>
            <span style={{fontSize:10.5,color:MT.T2,flex:1}}>{s.note}</span>
          </div>
        );
      })}
    </div>
  );
}

export function SectorGrid(props){
  function col(m){ if(m=="bull") return MT.GREEN; if(m=="bear") return MT.RED; return MT.YELLOW; }
  function lbl(m){ if(m=="bull") return "Bullish"; if(m=="bear") return "Bearish"; return "Neutral"; }
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
      {props.sectors.map(function(s){
        var c=col(s.mood);
        return (
          <div key={s.name} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:11,padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:800,color:MT.T1,marginBottom:4}}>{s.name}</div>
            <div style={{fontSize:9,fontWeight:700,color:c,background:c+"18",borderRadius:6,padding:"2px 0"}}>{lbl(s.mood)}</div>
          </div>
        );
      })}
    </div>
  );
}
