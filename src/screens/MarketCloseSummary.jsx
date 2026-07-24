
import { useTheme } from "../theme/ThemeProvider";
var DB="#050505",CB="#101318",BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";

export default function MarketCloseSummary(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  DOWN=theme.c.down; T2=theme.c.text2;
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CB = theme.c.card, DB = theme.c.bg, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var onBack=props.onBack||function(){};
  var setTab=props.setTab||function(){};

  var summary={
    niftyClose:23969.20,niftyChg:1.47,
    sensexClose:76692.70,sensexChg:1.54,
    bestSector:"Banking",bestSectorPct:1.8,
    worstSector:"Auto",worstSectorPct:-0.6,
    topGainer:"TATASTEEL",topGainerPct:5.2,
    topLoser:"NYKAA",topLoserPct:-2.4,
    fii:"+2,840 Cr",dii:"+1,120 Cr",
    tomorrowWatch:"NIFTY needs to hold 23,900 support for continuation. Watch global cues from US markets overnight.",
  };

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      <div style={{background:CB,padding:"16px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>&#127769; Market Close Summary</div>
          <div style={{fontSize:12,color:T2}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}</div>
        </div>
      </div>

      <div style={{padding:"16px"}}>

        <div style={{background:theme.c.card,border:"1px solid "+BD,borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{fontSize:12,color:T3,marginBottom:12}}>Markets closed for the day</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <div style={{fontSize:12,color:T3,marginBottom:4}}>NIFTY 50</div>
              <div style={{fontSize:18,fontWeight:900,color:T1,fontFamily:"monospace"}}>{summary.niftyClose.toLocaleString("en-IN")}</div>
              <div style={{fontSize:12,fontWeight:700,color:UP}}>+{summary.niftyChg}%</div>
            </div>
            <div>
              <div style={{fontSize:12,color:T3,marginBottom:4}}>SENSEX</div>
              <div style={{fontSize:18,fontWeight:900,color:T1,fontFamily:"monospace"}}>{summary.sensexClose.toLocaleString("en-IN")}</div>
              <div style={{fontSize:12,fontWeight:700,color:UP}}>+{summary.sensexChg}%</div>
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px"}}>
            <div style={{fontSize:12,color:T3,marginBottom:4}}>Best Sector</div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{summary.bestSector}</div>
            <div style={{fontSize:12,fontWeight:700,color:UP}}>+{summary.bestSectorPct}%</div>
          </div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px"}}>
            <div style={{fontSize:12,color:T3,marginBottom:4}}>Worst Sector</div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{summary.worstSector}</div>
            <div style={{fontSize:12,fontWeight:700,color:DOWN}}>{summary.worstSectorPct}%</div>
          </div>
          <div onClick={function(){setTab("markets");}} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px",cursor:"pointer"}}>
            <div style={{fontSize:12,color:T3,marginBottom:4}}>Top Gainer</div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{summary.topGainer}</div>
            <div style={{fontSize:12,fontWeight:700,color:UP}}>+{summary.topGainerPct}%</div>
          </div>
          <div onClick={function(){setTab("markets");}} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px",cursor:"pointer"}}>
            <div style={{fontSize:12,color:T3,marginBottom:4}}>Top Loser</div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>{summary.topLoser}</div>
            <div style={{fontSize:12,fontWeight:700,color:DOWN}}>{summary.topLoserPct}%</div>
          </div>
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>FII / DII Activity</div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:12,color:T3,marginBottom:4}}>FII</div>
              <div style={{fontSize:14,fontWeight:800,color:UP}}>{summary.fii}</div>
            </div>
            <div>
              <div style={{fontSize:12,color:T3,marginBottom:4}}>DII</div>
              <div style={{fontSize:14,fontWeight:800,color:UP}}>{summary.dii}</div>
            </div>
          </div>
        </div>

        <div style={{background:theme.c.card,border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:14}}>&#129504;</span>
            <span style={{fontSize:12,fontWeight:700,color:"#A78BFA"}}>Tomorrow's Watch</span>
          </div>
          <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{summary.tomorrowWatch}</div>
        </div>

        <button onClick={function(){setTab("journal");}} style={{width:"100%",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:14,padding:"12px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          &#128221; Log Today's Trades
        </button>
      </div>
    </div>
  );
}
